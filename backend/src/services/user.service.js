const userRepository = require('../repositories/user.repository');
const logger = require('../utils/logger');
const notificationRepository = require('../notifications/notification.repository');
const redis = require('../cache/redis');

class UserService {
  /**
   * Retorna todos os usuários (com caching otimizado).
   */
  async getAllUsers() {
    const cacheKey = 'users:all';
    
    // Tenta obter do cache
    const cachedUsers = await redis.get(cacheKey);
    if (cachedUsers) {
      console.log('[CACHE HIT] Lista de usuários obtida do Redis.');
      return cachedUsers;
    }

    // Fallback PostgreSQL
    console.log('[CACHE MISS] Consultando usuários no PostgreSQL.');
    const users = await userRepository.findAll();
    
    // Grava no cache
    await redis.set(cacheKey, users, 300); // TTL 5 minutos

    return users;
  }

  /**
   * Busca um usuário pelo ID.
   */
  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }
    return user;
  }

  /**
   * Atualiza as informações básicas de um usuário.
   */
  async updateUser(id, updateData, actorId = null) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await userRepository.findByEmail(updateData.email);
      if (emailExists) {
        throw new Error('Este endereço de e-mail já está em uso por outro usuário.');
      }
    }

    const updatedUser = await userRepository.update(id, updateData);

    // Invalida cache de listagem e métricas da dashboard
    await redis.del('users:all');
    await redis.del('dashboard:metrics');
    await redis.del('dashboard:activity');

    // Auditoria
    logger.log(actorId || id, 'user_update', `Dados do usuário ${user.name} (${user.email}) atualizados.`);
    
    // Notifica o próprio usuário
    notificationRepository.create({
      userId: id,
      title: 'Cadastro Atualizado',
      message: 'As informações do seu perfil foram atualizadas pela coordenação escolar.'
    }).catch(err => console.error('Erro ao notificar atualização:', err.message));

    return updatedUser;
  }

  /**
   * Remove o usuário do banco de dados.
   */
  async deleteUser(id, actorId = null) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    const deleted = await userRepository.delete(id);

    // Invalida cache de listagem e métricas da dashboard
    await redis.del('users:all');
    await redis.del('dashboard:metrics');
    await redis.del('dashboard:activity');

    // Auditoria
    logger.log(actorId || id, 'user_delete', `Usuário ${user.name} (${user.email}) removido do sistema.`);

    return deleted;
  }
}

module.exports = new UserService();

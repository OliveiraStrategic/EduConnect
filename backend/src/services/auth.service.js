const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const tokenRepository = require('../repositories/token.repository');
const logger = require('../utils/logger');
const notificationRepository = require('../notifications/notification.repository');
const redis = require('../cache/redis');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRATION = '15m'; // Curta duração para segurança stateless
const REFRESH_TOKEN_EXPIRATION_DAYS = 7; // Longa duração no banco

class AuthService {
  /**
   * Registra um novo usuário no banco com hash bcrypt.
   */
  async register({ name, email, password, role, cpf }) {
    if (!name || !email || !password || !role) {
      throw new Error('Nome, e-mail, senha e perfil (role) são obrigatórios.');
    }

    if (!['admin', 'professor', 'aluno'].includes(role)) {
      throw new Error('Perfil de usuário inválido.');
    }

    // Valida se o e-mail já está em uso
    const emailExists = await userRepository.findByEmail(email);
    if (emailExists) {
      throw new Error('Este endereço de e-mail já está cadastrado.');
    }

    // Gera hash criptográfico da senha
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Cria o usuário
    const user = await userRepository.create({
      name,
      email,
      password: passwordHash,
      role,
      cpf
    });

    // Auditoria assíncrona
    logger.log(user.id, 'user_create', `Cadastro do usuário ${user.name} (${user.role}) realizado.`);
    
    // Invalida cache de métricas e atividades da dashboard
    redis.del('dashboard:metrics').catch(() => {});
    redis.del('dashboard:activity').catch(() => {});

    // Notificação de boas-vindas
    notificationRepository.create({
      userId: user.id,
      title: 'Bem-vindo ao EduConnect!',
      message: `Olá ${user.name}, sua conta de ${user.role} foi configurada com sucesso.`
    }).catch(err => console.error('Erro ao criar notificação de boas-vindas:', err.message));

    return user;
  }

  /**
   * Efetua o login do usuário validando as credenciais e emitindo o par de tokens.
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('E-mail ou senha incorretos.');
    }

    // 1. Gera o Access Token (JWT de curta duração)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRATION }
    );

    // 2. Gera o Refresh Token (Cadeia de bytes randômica e segura)
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);

    // 3. Persiste no banco PostgreSQL
    await tokenRepository.create(user.id, refreshToken, expiresAt);

    // Auditoria de acesso
    logger.log(user.id, 'login', `Usuário ${user.name} efetuou login.`);

    // Invalida cache de atividades recentes para o gráfico
    redis.del('dashboard:activity').catch(() => {});

    // Se for administrador, gera um alerta interno
    if (user.role === 'admin') {
      notificationRepository.create({
        userId: user.id,
        title: 'Acesso Administrativo',
        message: `Novo acesso de administrador registrado.`
      }).catch(err => console.error('Erro ao criar notificação admin:', err.message));
    }

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cpf: user.cpf
      }
    };
  }

  /**
   * Renova o Access Token rotacionando o Refresh Token (Token Rotation).
   */
  async refresh(tokenString) {
    if (!tokenString) {
      throw new Error('Refresh Token é obrigatório.');
    }

    // Busca o token ativo no banco
    const storedToken = await tokenRepository.findByToken(tokenString);
    if (!storedToken) {
      throw new Error('Refresh Token inválido ou revogado.');
    }

    // Valida se o token expirou
    if (new Date() > new Date(storedToken.expires_at)) {
      await tokenRepository.deleteByToken(tokenString);
      throw new Error('Refresh Token expirado. Faça login novamente.');
    }

    // Carrega dados do usuário associado
    const user = await userRepository.findById(storedToken.user_id);
    if (!user) {
      throw new Error('Usuário associado ao token não encontrado.');
    }

    // Rotaciona o Token: deleta o antigo do banco
    await tokenRepository.deleteByToken(tokenString);

    // Emite novo par de tokens
    const newToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRATION }
    );

    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRATION_DAYS);

    // Persiste o novo refresh token
    await tokenRepository.create(user.id, newRefreshToken, expiresAt);

    return {
      token: newToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Revoga a sessão ativa do usuário excluindo o token correspondente.
   */
  async logout(tokenString, userId = null) {
    if (tokenString) {
      await tokenRepository.deleteByToken(tokenString);
    }
    if (userId) {
      logger.log(userId, 'logout', 'Usuário encerrou a sessão (logout).');
    }
  }
}

module.exports = new AuthService();

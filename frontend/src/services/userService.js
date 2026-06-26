import api from '../api/api';

class UserService {
  /**
   * Lista todos os usuários (apenas Administradores).
   */
  async listUsers() {
    const response = await api.get('/users');
    return response.data; // Retorna { success, message, data: users }
  }

  /**
   * Obtém detalhes de um usuário.
   */
  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  /**
   * Cria um usuário (delega para a rota de registro da API).
   */
  async createUser(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  /**
   * Atualiza as informações de um usuário.
   */
  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  }

  /**
   * Remove um usuário pelo ID.
   */
  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
}

export default new UserService();

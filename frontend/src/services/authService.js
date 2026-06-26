import api from '../api/api';

class AuthService {
  /**
   * Efetua o login do usuário.
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // Retorna { success, message, data: { token, user } }
  }

  /**
   * Registra um novo usuário.
   */
  async register({ name, email, password, role, cpf }) {
    const response = await api.post('/auth/register', { name, email, password, role, cpf });
    return response.data; // Retorna { success, message, data: user }
  }
}

export default new AuthService();

const authService = require('../services/auth.service');

class AuthController {
  /**
   * Registra um novo usuário.
   */
  async register(req, res, next) {
    try {
      const { name, email, password, role, cpf } = req.body;
      const user = await authService.register({ name, email, password, role, cpf });
      return res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso.',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Efetua a autenticação do usuário retornando os tokens.
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      return res.status(200).json({
        success: true,
        message: 'Autenticação realizada com sucesso.',
        data
      });
    } catch (error) {
      res.status(401);
      next(error);
    }
  }

  /**
   * Renovação de tokens utilizando Refresh Token (Token Rotation).
   */
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const data = await authService.refresh(refreshToken);
      return res.status(200).json({
        success: true,
        message: 'Token de acesso renovado com sucesso.',
        data
      });
    } catch (error) {
      res.status(401);
      next(error);
    }
  }

  /**
   * Encerra a sessão ativa do usuário.
   */
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user ? req.user.id : null;
      await authService.logout(refreshToken, userId);
      return res.status(200).json({
        success: true,
        message: 'Sessão encerrada com sucesso.',
        data: {}
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

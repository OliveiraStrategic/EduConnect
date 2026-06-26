const userService = require('../services/user.service');

class UserController {
  /**
   * Lista todos os usuários (apenas Admin).
   */
  async list(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      return res.status(200).json({
        success: true,
        message: 'Usuários listados com sucesso.',
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém detalhes de um usuário específico por ID.
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      return res.status(200).json({
        success: true,
        message: 'Detalhes do usuário obtidos com sucesso.',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza dados cadastrais de um usuário.
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, role, cpf } = req.body;
      const actorId = req.user.id;

      const updatedUser = await userService.updateUser(id, { name, email, role, cpf }, actorId);
      return res.status(200).json({
        success: true,
        message: 'Usuário atualizado com sucesso.',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove um usuário pelo ID.
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const actorId = req.user.id;

      await userService.deleteUser(id, actorId);
      return res.status(200).json({
        success: true,
        message: 'Usuário removido com sucesso.',
        data: { id }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

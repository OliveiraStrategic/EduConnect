const notificationRepository = require('./notification.repository');

class NotificationController {
  /**
   * Lista as notificações do usuário logado de forma paginada.
   */
  async list(req, res, next) {
    try {
      const userId = req.user.id;
      
      // Paginação obrigatória
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const offset = (page - 1) * limit;

      const notifications = await notificationRepository.listByUserId(userId, limit, offset);
      const total = await notificationRepository.countByUserId(userId);

      return res.status(200).json({
        success: true,
        message: 'Notificações obtidas com sucesso.',
        data: {
          notifications,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();

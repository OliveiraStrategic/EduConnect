const db = require('../../database');

class NotificationRepository {
  /**
   * Cria uma notificação interna para um usuário específico.
   */
  async create({ userId, title, message }) {
    const queryText = `
      INSERT INTO notifications (user_id, title, message)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, title, message, read_status, created_at;
    `;
    const { rows } = await db.query(queryText, [userId, title, message]);
    return rows[0];
  }

  /**
   * Lista as notificações do usuário com paginação obrigatória.
   */
  async listByUserId(userId, limit = 10, offset = 0) {
    const queryText = `
      SELECT id, title, message, read_status, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const { rows } = await db.query(queryText, [userId, limit, offset]);
    return rows;
  }

  /**
   * Conta o total de notificações do usuário para apoiar paginação no frontend.
   */
  async countByUserId(userId) {
    const queryText = `
      SELECT COUNT(id) as total
      FROM notifications
      WHERE user_id = $1;
    `;
    const { rows } = await db.query(queryText, [userId]);
    return parseInt(rows[0].total, 10);
  }
}

module.exports = new NotificationRepository();

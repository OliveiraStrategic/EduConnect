const db = require('../../database');

class TokenRepository {
  /**
   * Armazena um novo refresh token no PostgreSQL.
   */
  async create(userId, token, expiresAt) {
    const queryText = `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token, expires_at, created_at;
    `;
    const { rows } = await db.query(queryText, [userId, token, expiresAt]);
    return rows[0];
  }

  /**
   * Busca um refresh token e retorna se existir.
   */
  async findByToken(token) {
    const queryText = `
      SELECT id, user_id, token, expires_at, created_at
      FROM refresh_tokens
      WHERE token = $1;
    `;
    const { rows } = await db.query(queryText, [token]);
    return rows[0] || null;
  }

  /**
   * Deleta um refresh token específico (invalidação).
   */
  async deleteByToken(token) {
    const queryText = `
      DELETE FROM refresh_tokens
      WHERE token = $1
      RETURNING id;
    `;
    const { rows } = await db.query(queryText, [token]);
    return rows[0] || null;
  }

  /**
   * Deleta todos os tokens associados a um usuário (revoga todas as sessões).
   */
  async deleteByUserId(userId) {
    const queryText = `
      DELETE FROM refresh_tokens
      WHERE user_id = $1;
    `;
    await db.query(queryText, [userId]);
  }
}

module.exports = new TokenRepository();

const db = require('../../database');

class Logger {
  /**
   * Registra uma ação do sistema de forma assíncrona no PostgreSQL.
   * Não bloqueia a requisição caso ocorra erro ao gravar no log.
   * @param {string|null} userId - ID do usuário autor da ação (UUID)
   * @param {string} action - Tipo de ação executada (ex: login, user_create)
   * @param {string} description - Descrição detalhada da ação
   */
  log(userId, action, description) {
    const queryText = `
      INSERT INTO logs (user_id, action, description)
      VALUES ($1, $2, $3);
    `;
    const values = [userId, action, description];

    // Execução assíncrona que não bloqueia o fluxo principal da aplicação
    db.query(queryText, values)
      .then(() => {
        console.log(`[LOG] Action: ${action} | User: ${userId || 'SYSTEM'} | Desc: ${description}`);
      })
      .catch((err) => {
        console.error('[LOGGER ERROR] Falha ao registrar log no banco de dados:', err.message);
      });
  }
}

module.exports = new Logger();

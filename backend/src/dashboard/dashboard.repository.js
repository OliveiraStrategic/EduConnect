const db = require('../../database');

class DashboardRepository {
  /**
   * Obtém métricas consolidadas do sistema acadêmico.
   */
  async getMetrics() {
    // Queries de contagem rápida
    const userQuery = 'SELECT COUNT(id) FROM users;';
    const studentQuery = "SELECT COUNT(id) FROM users WHERE role = 'aluno';";
    const teacherQuery = "SELECT COUNT(id) FROM users WHERE role = 'professor';";
    const courseQuery = 'SELECT COUNT(id) FROM courses;';
    const logsQuery = 'SELECT COUNT(id) FROM logs;';

    const [usersRes, studentsRes, teachersRes, coursesRes, logsRes] = await Promise.all([
      db.query(userQuery),
      db.query(studentQuery),
      db.query(teacherQuery),
      db.query(courseQuery),
      db.query(logsQuery),
    ]);

    return {
      totalUsers: parseInt(usersRes.rows[0].count, 10),
      totalStudents: parseInt(studentsRes.rows[0].count, 10),
      totalTeachers: parseInt(teachersRes.rows[0].count, 10),
      totalCourses: parseInt(coursesRes.rows[0].count, 10),
      totalActivities: parseInt(logsRes.rows[0].count, 10),
    };
  }

  /**
   * Obtém o volume de atividades recentes (agrupado por dia e ação) para gráfico.
   */
  async getActivityData(limit = 10) {
    const queryText = `
      SELECT DATE(created_at) as date, action, COUNT(id) as count
      FROM logs
      GROUP BY DATE(created_at), action
      ORDER BY DATE(created_at) DESC
      LIMIT $1;
    `;
    const { rows } = await db.query(queryText, [limit]);
    return rows;
  }

  /**
   * Lista as atividades recentes de forma detalhada para o feed.
   */
  async getRecentActivityFeed(limit = 5) {
    const queryText = `
      SELECT l.id, l.action, l.description, l.created_at, u.name as user_name
      FROM logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT $1;
    `;
    const { rows } = await db.query(queryText, [limit]);
    return rows;
  }
}

module.exports = new DashboardRepository();

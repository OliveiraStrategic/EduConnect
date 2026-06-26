const db = require('../../database');

class UserRepository {
  /**
   * Cria um novo usuário.
   */
  async create({ name, email, password, role, cpf }) {
    const queryText = `
      INSERT INTO users (name, email, password, role, cpf)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role, cpf, created_at, updated_at;
    `;
    // Caso o CPF não seja fornecido, gera um mock numérico único baseado no timestamp
    const safeCpf = cpf || String(Date.now()).slice(-11).padStart(11, '0');
    const { rows } = await db.query(queryText, [name, email, password, role, safeCpf]);
    return rows[0];
  }

  /**
   * Busca um usuário por e-mail.
   */
  async findByEmail(email) {
    const queryText = `
      SELECT id, name, email, password, role, cpf, created_at, updated_at
      FROM users
      WHERE email = $1;
    `;
    const { rows } = await db.query(queryText, [email]);
    return rows[0] || null;
  }

  /**
   * Busca um usuário por ID.
   */
  async findById(id) {
    const queryText = `
      SELECT id, name, email, role, cpf, created_at, updated_at
      FROM users
      WHERE id = $1;
    `;
    const { rows } = await db.query(queryText, [id]);
    return rows[0] || null;
  }

  /**
   * Retorna a lista de todos os usuários.
   */
  async findAll() {
    const queryText = `
      SELECT id, name, email, role, cpf, created_at, updated_at
      FROM users
      ORDER BY name ASC;
    `;
    const { rows } = await db.query(queryText);
    return rows;
  }

  /**
   * Atualiza as informações de um usuário.
   */
  async update(id, { name, email, role, cpf }) {
    // Busca dados atuais para persistir os que não forem fornecidos
    const current = await this.findById(id);
    if (!current) return null;

    const queryText = `
      UPDATE users
      SET name = $1, email = $2, role = $3, cpf = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING id, name, email, role, cpf, created_at, updated_at;
    `;
    const values = [
      name || current.name,
      email || current.email,
      role || current.role,
      cpf || current.cpf,
      id
    ];
    const { rows } = await db.query(queryText, values);
    return rows[0];
  }

  /**
   * Deleta fisicamente um usuário pelo ID.
   */
  async delete(id) {
    const queryText = `
      DELETE FROM users
      WHERE id = $1
      RETURNING id;
    `;
    const { rows } = await db.query(queryText, [id]);
    return rows[0] || null;
  }
}

module.exports = new UserRepository();

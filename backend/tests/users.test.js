const request = require('supertest');
const app = require('../app');
const db = require('../database');
const bcrypt = require('bcrypt');

describe('CRUD de Usuários (Users Integration Tests)', () => {
  let adminToken = '';
  let studentToken = '';
  let targetUserId = '';
  const adminEmail = `admin-test-${Date.now()}@educonnect.com.br`;
  const studentEmail = `student-test-${Date.now()}@educonnect.com.br`;

  beforeAll(async () => {
    // Cria administrador temporário de teste
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Inserção do administrador
    const adminRes = await db.query(
      `INSERT INTO users (name, email, password, role, cpf) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['Admin Teste Jest', adminEmail, hashedPassword, 'admin', String(Date.now()).slice(-11).padStart(11, '0')]
    );
    
    // Inserção do aluno
    const studentRes = await db.query(
      `INSERT INTO users (name, email, password, role, cpf) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['Aluno Teste Jest', studentEmail, hashedPassword, 'aluno', String(Date.now() + 1).slice(-11).padStart(11, '0')]
    );

    targetUserId = studentRes.rows[0].id;

    // Efetua login para obter tokens
    const adminLogin = await request(app).post('/api/auth/login').send({ email: adminEmail, password: 'admin123' });
    adminToken = adminLogin.body.data.token;

    const studentLogin = await request(app).post('/api/auth/login').send({ email: studentEmail, password: 'admin123' });
    studentToken = studentLogin.body.data.token;
  });

  afterAll(async () => {
    // Limpa tokens e usuários
    await db.query('DELETE FROM users WHERE email IN ($1, $2)', [adminEmail, studentEmail]);
    await db.pool.end();
  });

  it('Deve permitir ao administrador listar os usuários (GET /api/users)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('Deve bloquear a listagem de usuários por perfil não administrativo (Aluno)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toBe(false);
  });

  it('Deve obter detalhes do usuário pelo ID (GET /api/users/:id)', async () => {
    const res = await request(app)
      .get(`/api/users/${targetUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toEqual(targetUserId);
  });

  it('Deve atualizar as informações cadastrais de um usuário (PUT /api/users/:id)', async () => {
    const res = await request(app)
      .put(`/api/users/${targetUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Aluno Nome Atualizado',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toEqual('Aluno Nome Atualizado');
  });

  it('Deve excluir um usuário do sistema (DELETE /api/users/:id)', async () => {
    const res = await request(app)
      .delete(`/api/users/${targetUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });
});

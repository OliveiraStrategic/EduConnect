const request = require('supertest');
const app = require('../app');
const db = require('../database');

describe('Fluxo de Autenticação (Auth Integration Tests)', () => {
  const uniqueEmail = `test-${Date.now()}@educonnect.com.br`;
  let accessToken = '';
  let refreshToken = '';

  afterAll(async () => {
    // Limpa os dados de teste inseridos para manter o banco higienizado
    await db.query('DELETE FROM users WHERE email = $1', [uniqueEmail]);
    await db.pool.end();
  });

  it('Deve registrar um novo usuário com sucesso', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Usuário de Teste Jest',
        email: uniqueEmail,
        password: 'password123',
        role: 'aluno',
        cpf: String(Date.now()).slice(-11).padStart(11, '0')
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.email).toEqual(uniqueEmail);
  });

  it('Não deve registrar um usuário com e-mail duplicado', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Usuário Duplicado',
        email: uniqueEmail,
        password: 'password123',
        role: 'aluno',
        cpf: String(Date.now() + 1).slice(-11).padStart(11, '0')
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('já está cadastrado');
  });

  it('Deve efetuar login com sucesso e retornar Access Token e Refresh Token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');
    
    accessToken = res.body.data.token;
    refreshToken = res.body.data.refreshToken;
  });

  it('Deve renovar o Access Token usando a rota /refresh (Token Rotation)', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({
        refreshToken: refreshToken
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('refreshToken');

    // Atualiza a referência para os próximos testes
    refreshToken = res.body.data.refreshToken;
  });

  it('Deve invalidar a sessão ao efetuar logout', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        refreshToken: refreshToken
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });
});

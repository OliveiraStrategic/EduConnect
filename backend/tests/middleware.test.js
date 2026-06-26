const request = require('supertest');
const app = require('../app');
const db = require('../database');

describe('Testes do Middleware de Autenticação e Segurança (Middleware Security)', () => {
  afterAll(async () => {
    await db.pool.end();
  });

  it('Deve bloquear acesso sem o cabeçalho Authorization', async () => {
    const res = await request(app)
      .get('/api/users');

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Token de acesso não fornecido');
  });

  it('Deve bloquear acesso com token inválido', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer token_absolutamente_invalido');

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('expirado ou inválido');
  });

  it('Deve bloquear acesso com cabeçalho formatado incorretamente', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'IncorretoFormato token_aqui');

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });
});

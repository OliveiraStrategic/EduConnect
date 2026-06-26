const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Conexão segura e reutilizável utilizando Pool do pg
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 20, // Limite máximo de conexões simultâneas no pool
  idleTimeoutMillis: 30000, // Fechar conexões ociosas após 30 segundos
  connectionTimeoutMillis: 2000, // Timeout de 2 segundos para novas conexões
});

pool.on('connect', () => {
  console.log('Conexão PostgreSQL estabelecida com sucesso.');
});

pool.on('error', (err) => {
  console.error('Erro inesperado no Pool de conexões do PostgreSQL:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};

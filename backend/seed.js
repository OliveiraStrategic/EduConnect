const bcrypt = require('bcrypt');
const db = require('./database');

async function seed() {
  console.log('Iniciando o seeding de dados para o EduConnect...');

  try {
    const saltRounds = 12;

    // Definição dos perfis a serem inseridos
    const seedUsers = [
      {
        name: 'Administrador Padrão',
        email: 'admin@educonnect.com.br',
        password: 'admin123',
        role: 'admin',
        cpf: '11111111111',
      },
      {
        name: 'Professor Padrão',
        email: 'professor@educonnect.com.br',
        password: 'professor123',
        role: 'professor',
        cpf: '22222222222',
      },
      {
        name: 'Aluno Padrão',
        email: 'aluno@educonnect.com.br',
        password: 'aluno123',
        role: 'aluno',
        cpf: '33333333333',
      },
    ];

    for (const userData of seedUsers) {
      // Hash criptográfico da senha
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const queryText = `
        INSERT INTO users (name, email, password, role, cpf)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) 
        DO UPDATE SET 
          name = EXCLUDED.name, 
          password = EXCLUDED.password, 
          role = EXCLUDED.role, 
          cpf = EXCLUDED.cpf,
          updated_at = NOW()
        RETURNING id, name, email, role;
      `;

      const values = [
        userData.name,
        userData.email,
        hashedPassword,
        userData.role,
        userData.cpf,
      ];

      const { rows } = await db.query(queryText, values);
      console.log(`Usuário semeado: [${rows[0].role.toUpperCase()}] ${rows[0].name} (${rows[0].email})`);
    }

    console.log('Seeding concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante a execução do seeding:', error.message);
  } finally {
    // Encerra o pool de conexões com o banco para liberar o processo do Node.js
    await db.pool.end();
    console.log('Conexões com o banco de dados encerradas.');
  }
}

// Executa o seeding de dados
seed();

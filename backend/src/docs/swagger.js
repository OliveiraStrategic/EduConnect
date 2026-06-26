const swaggerJSDoc = require('swagger-jsdoc');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Configuração básica do Swagger OpenAPI 3.0.0
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EduConnect API — Documentação Técnica',
      version: '1.0.0',
      description: 'API REST estruturada para o sistema de gestão escolar EduConnect, incluindo controle de acessos RBAC, auditoria de logs e caching.',
      contact: {
        name: 'Suporte Técnico EduConnect',
        email: 'suporte@educonnect.com.br'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor Local de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token de acesso (JWT) obtido no login no formato: Bearer <seu_token>'
        }
      }
    }
  },
  // Mapeia onde o Swagger deve ler as anotações JSDoc para construir as rotas
  apis: ['./src/docs/swagger.js', './src/routes/*.js', './src/notifications/*.js', './src/dashboard/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

// --- ANOTAÇÕES SWAGGER JSDOC PARA ROTAS DO SISTEMA ---

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Cadastra um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role, cpf]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gabriel Garcia
 *               email:
 *                 type: string
 *                 example: gabriel@educonnect.com.br
 *               password:
 *                 type: string
 *                 example: senha123
 *               role:
 *                 type: string
 *                 enum: [admin, professor, aluno]
 *                 example: aluno
 *               cpf:
 *                 type: string
 *                 example: "12345678901"
 *     responses:
 *       201:
 *         description: Registro efetuado com sucesso
 *       400:
 *         description: Erro de payload ou e-mail duplicado
 */

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Efetua o login de um usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@educonnect.com.br
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Autenticado com sucesso, retorna token de acesso e refresh token
 *       401:
 *         description: Credenciais incorretas
 */

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Renova o Access Token utilizando um Refresh Token ativo
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "uuid_do_refresh_token"
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *       401:
 *         description: Refresh token inválido ou expirado
 */

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Efetua logout invalidando o Refresh Token no banco de dados
 *     tags: [Autenticação]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Sessão encerrada com sucesso
 *       401:
 *         description: Não autorizado
 */

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Lista todos os usuários cadastrados
 *     tags: [Usuários]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso (caching ativo)
 *       403:
 *         description: Acesso negado (requer perfil admin)
 */

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Busca detalhes de um usuário específico
 *     tags: [Usuários]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalhes do usuário obtidos
 *       404:
 *         description: Usuário não encontrado
 *   put:
 *     summary: Atualiza os dados de um usuário
 *     tags: [Usuários]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, professor, aluno]
 *     responses:
 *       200:
 *         description: Atualizado com sucesso, invalida cache
 *       404:
 *         description: Usuário não encontrado
 *   delete:
 *     summary: Remove permanentemente um usuário
 *     tags: [Usuários]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Usuário deletado do sistema
 *       403:
 *         description: Acesso negado (apenas administradores)
 */

/**
 * @openapi
 * /api/dashboard/metrics:
 *   get:
 *     summary: Obtém métricas numéricas e logs de atividades recentes (caching ativo)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas obtidas com sucesso
 */

/**
 * @openapi
 * /api/dashboard/activity:
 *   get:
 *     summary: Obtém dados históricos diários de logs para gráficos (caching ativo)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dados obtidos com sucesso
 */

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     summary: Lista as notificações do usuário logado (paginado, caching ativo)
 *     tags: [Notificações]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de notificações retornada com sucesso
 */

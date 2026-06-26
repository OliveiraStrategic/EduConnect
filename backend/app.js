const express = require('express');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/docs/swagger');

// Carrega as configurações de variáveis de ambiente (.env)
dotenv.config();

const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const notificationRoutes = require('./src/notifications/notification.routes');
const dashboardRoutes = require('./src/dashboard/dashboard.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Hardening de Segurança com Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Permite Swagger UI carregar recursos de estilo inline
}));

// Configuração do CORS
app.use(cors({
  origin: '*', // Em produção real, restrinja a domínios permitidos (ex: process.env.FRONTEND_URL)
  credentials: true,
}));

// Middlewares Globais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Limitação de Taxa de Requisições (Rate Limiting)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de 15 minutos
  max: 100, // Máximo de 100 requisições por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas requisições originárias deste IP, por favor tente novamente mais tarde.',
    data: {}
  }
});

// Limitador estrito para login contra ataques de Brute Force
const bruteForceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Bloqueio de segurança: excesso de tentativas de login. Tente novamente em 15 minutos.',
    data: {}
  }
});

// Aplica limitadores nas rotas
app.use('/api/', apiLimiter);
app.use('/api/auth/login', bruteForceLimiter);

// Middleware simples de Log de Requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Interface de Documentação do Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Vinculação de Rotas (Prefixadas com /api)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota de Diagnóstico/Health Check
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Backend do EduConnect está UP.',
    data: {
      timestamp: new Date(),
      env: process.env.NODE_ENV || 'development'
    }
  });
});

// Tratamento Global de Erros (Error Handler)
app.use((err, req, res, next) => {
  console.error('Erro global capturado:', err.message);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Erro inesperado no servidor.',
    data: {}
  });
});

// Inicializa o servidor Express
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
    console.log(`Documentação do Swagger disponível em http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;

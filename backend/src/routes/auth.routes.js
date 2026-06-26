const express = require('express');
const authController = require('../controllers/auth.controller');
const { validateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Rotas públicas de autenticação
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// Rota protegida de encerramento de sessão
router.post('/logout', validateToken, authController.logout);

module.exports = router;

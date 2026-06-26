const express = require('express');
const notificationController = require('./notification.controller');
const { validateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Todas as rotas de notificações exigem autenticação JWT
router.use(validateToken);

router.get('/', notificationController.list);

module.exports = router;

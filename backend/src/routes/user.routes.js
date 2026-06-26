const express = require('express');
const userController = require('../controllers/user.controller');
const { validateToken, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// Aplica autenticação obrigatória para todas as rotas de usuários
router.use(validateToken);

// CRUD de usuários protegido por perfis
router.get('/', restrictTo('admin'), userController.list);
router.get('/:id', userController.show);
router.put('/:id', userController.update);
router.delete('/:id', restrictTo('admin'), userController.delete);

module.exports = router;

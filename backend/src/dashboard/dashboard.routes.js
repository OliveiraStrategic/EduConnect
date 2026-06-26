const express = require('express');
const dashboardController = require('./dashboard.controller');
const { validateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

// Protege as rotas da dashboard
router.use(validateToken);

router.get('/metrics', dashboardController.getMetrics);
router.get('/activity', dashboardController.getActivity);

module.exports = router;

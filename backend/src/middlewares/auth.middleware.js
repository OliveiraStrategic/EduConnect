const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware para validar o token JWT nas requisições.
 */
const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token de acesso não fornecido ou inválido.',
      data: {}
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token de acesso expirado ou inválido.',
      data: {}
    });
  }
};

/**
 * Middleware para autorização de perfis de usuário específicos (RBAC).
 * @param {Array<string>} roles - Perfis autorizados a acessar o recurso
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({
        success: false,
        message: 'Erro interno de validação de sessão.',
        data: {}
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado para este perfil de usuário.',
        data: {}
      });
    }

    return next();
  };
};

module.exports = {
  validateToken,
  restrictTo,
};

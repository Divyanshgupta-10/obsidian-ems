const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { error } = require('../utils/response');
const pool = require('../../config/db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Authentication token is required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwt.secret);

    const result = await pool.query('SELECT id, name, email, role, is_active FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    if (!user || !user.is_active) {
      return error(res, 'User not found or inactive', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return error(res, 'Token has expired', 401);
    return error(res, 'Invalid token', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(res, 'You do not have permission to perform this action', 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };

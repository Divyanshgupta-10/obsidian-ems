const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({ message: err.message, stack: err.stack, path: req.path });

  const statusMap = {
    ValidationError: 422,
    UnauthorizedError: 401,
    ForbiddenError: 403,
    NotFoundError: 404,
    ConflictError: 409,
  };

  const status = statusMap[err.name] || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;

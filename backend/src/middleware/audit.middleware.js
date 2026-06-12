const pool = require('../../config/db');
const logger = require('../utils/logger');

const auditLog = (tableName) => async (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = async (body) => {
    try {
      if (req.user && body && body.success !== false) {
        const actionMap = { POST: 'INSERT', PUT: 'UPDATE', DELETE: 'DELETE' };
        const action = actionMap[req.method];
        if (action) {
          await pool.query(
            `INSERT INTO audit_logs (table_name, action_type, record_id, new_data, performed_by)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              tableName,
              action,
              body.data?.id || req.params.id || null,
              body.data ? JSON.stringify(body.data) : null,
              req.user.id,
            ]
          );
        }
      }
    } catch (err) {
      logger.error('Audit log failed:', err.message);
    }
    return originalJson(body);
  };

  next();
};

module.exports = auditLog;

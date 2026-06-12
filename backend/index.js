require('dotenv').config();

const app = require('./server');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');
const cron = require('node-cron');

// ── Start HTTP Server (Only if not running in Serverless environment) ──
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(env.port, () => {
    logger.info(`🚀 HRMS Server running on http://localhost:${env.port}`);
    logger.info(`🌍 Environment: ${env.env}`);
    logger.info(`📦 API: http://localhost:${env.port}/api/v1`);
  });

  // ── Background Jobs (Cron won't run in Vercel Serverless) ─────────
  // Daily cleanup: remove notifications older than 30 days
  cron.schedule('0 2 * * *', async () => {
    try {
      const pool = require('./config/db');
      await pool.query(`DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '30 days'`);
      logger.info('🧹 Cleaned up old notifications');
    } catch (err) {
      logger.error('Notification cleanup failed:', err.message);
    }
  });

  logger.info('⏰ Cron jobs scheduled');
}

// Export for Vercel Serverless
module.exports = app;

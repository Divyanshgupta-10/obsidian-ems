const BaseRepository = require('./base.repository');
const pool = require('../../config/db');

class NotificationRepository extends BaseRepository {
  constructor() {
    super('notifications');
  }

  async getForUser(userId, limit = 20, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  async countUnread(userId) {
    const result = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  async markRead(id, userId) {
    const result = await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    return result.rows[0];
  }

  async create(userId, title, message) {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3) RETURNING *`,
      [userId, title, message]
    );
    return result.rows[0];
  }
}

module.exports = new NotificationRepository();

const BaseRepository = require('./base.repository');
const pool = require('../../config/db');

class LeaveRepository extends BaseRepository {
  constructor() {
    super('leaves');
  }

  async listWithDetails({ employeeId = null, status = null, limit = 20, offset = 0 }) {
    const params = [];
    let where = 'WHERE 1=1';
    if (employeeId) { params.push(employeeId); where += ` AND l.employee_id = $${params.length}`; }
    if (status) { params.push(status); where += ` AND l.status = $${params.length}`; }

    const sql = `
      SELECT l.*, u.name AS employee_name, u.email,
             m.name AS approved_by_name
      FROM leaves l
      JOIN users u ON l.employee_id = u.id
      LEFT JOIN users m ON l.approved_by = m.id
      ${where}
      ORDER BY l.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const countSql = `SELECT COUNT(*) FROM leaves l ${where}`;

    const [rows, countRes] = await Promise.all([
      pool.query(sql, [...params, limit, offset]),
      pool.query(countSql, params),
    ]);

    return { data: rows.rows, total: parseInt(countRes.rows[0].count) };
  }

  async findWithDetails(id) {
    const sql = `
      SELECT l.*, u.name AS employee_name, m.name AS approved_by_name
      FROM leaves l
      JOIN users u ON l.employee_id = u.id
      LEFT JOIN users m ON l.approved_by = m.id
      WHERE l.id = $1
    `;
    const result = await pool.query(sql, [id]);
    return result.rows[0] || null;
  }
}

module.exports = new LeaveRepository();

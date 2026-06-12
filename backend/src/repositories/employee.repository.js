const BaseRepository = require('./base.repository');
const pool = require('../../config/db');

class EmployeeRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async listWithProfiles({ search = '', limit = 20, offset = 0 }) {
    const params = [];
    let where = 'WHERE 1=1';
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }

    const sql = `
      SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
             ep.designation, ep.salary, ep.phone, ep.joining_date,
             d.department_name, d.id AS department_id
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN departments d ON ep.department_id = d.id
      ${where}
      ORDER BY u.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const countSql = `
      SELECT COUNT(*) FROM users u ${where}
    `;

    const [rows, countRes] = await Promise.all([
      pool.query(sql, [...params, limit, offset]),
      pool.query(countSql, params),
    ]);

    return { data: rows.rows, total: parseInt(countRes.rows[0].count) };
  }

  async findWithProfile(id) {
    const sql = `
      SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
             ep.id AS profile_id, ep.designation, ep.salary, ep.phone, ep.address, ep.joining_date,
             d.id AS department_id, d.department_name
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN departments d ON ep.department_id = d.id
      WHERE u.id = $1
    `;
    const result = await pool.query(sql, [id]);
    return result.rows[0] || null;
  }

  async getDepartments() {
    const result = await pool.query('SELECT * FROM departments ORDER BY department_name');
    return result.rows;
  }

  async upsertProfile(userId, profileData) {
    const { department_id, designation, salary, phone, address, joining_date } = profileData;
    const existing = await pool.query('SELECT id FROM employee_profiles WHERE user_id = $1', [userId]);

    if (existing.rows.length > 0) {
      const result = await pool.query(
        `UPDATE employee_profiles SET department_id=$1, designation=$2, salary=$3, phone=$4, address=$5, joining_date=$6, updated_at=NOW()
         WHERE user_id=$7 RETURNING *`,
        [department_id, designation, salary, phone, address, joining_date, userId]
      );
      return result.rows[0];
    } else {
      const result = await pool.query(
        `INSERT INTO employee_profiles (user_id, department_id, designation, salary, phone, address, joining_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [userId, department_id, designation, salary, phone, address, joining_date]
      );
      return result.rows[0];
    }
  }

  async getLeaveBalance(employeeId) {
    const result = await pool.query('SELECT * FROM calculate_leave_balance($1)', [employeeId]);
    return result.rows;
  }

  // --- Skills ---
  async getAllSkills() {
    const result = await pool.query('SELECT * FROM skills ORDER BY name');
    return result.rows;
  }

  async getEmployeeSkills(employeeId) {
    const sql = `
      SELECT s.id, s.name 
      FROM skills s
      JOIN employee_skills es ON s.id = es.skill_id
      WHERE es.user_id = $1
    `;
    const result = await pool.query(sql, [employeeId]);
    return result.rows;
  }

  async assignSkills(employeeId, skillIds) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM employee_skills WHERE user_id = $1', [employeeId]);
      
      if (skillIds && skillIds.length > 0) {
        const values = skillIds.map((id) => `(${employeeId}, ${id})`).join(',');
        await client.query(`INSERT INTO employee_skills (user_id, skill_id) VALUES ${values}`);
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  // --- Images ---
  async saveImage(employeeId, filename, filepath) {
    const result = await pool.query(
      'INSERT INTO employee_images (user_id, filename, filepath) VALUES ($1, $2, $3) RETURNING *',
      [employeeId, filename, filepath]
    );
    return result.rows[0];
  }

  async getEmployeeImages(employeeId) {
    const result = await pool.query('SELECT * FROM employee_images WHERE user_id = $1 ORDER BY uploaded_at DESC', [employeeId]);
    return result.rows;
  }

  async deleteImage(imageId) {
    await pool.query('DELETE FROM employee_images WHERE id = $1', [imageId]);
  }
}

module.exports = new EmployeeRepository();

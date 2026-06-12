const BaseRepository = require('./base.repository');
const pool = require('../../config/db');

class AssetRepository extends BaseRepository {
  constructor() {
    super('assets');
  }

  async listWithAllocation({ status = null, limit = 20, offset = 0 }) {
    const params = [];
    let where = 'WHERE 1=1';
    if (status) { params.push(status); where += ` AND a.status = $${params.length}`; }

    const sql = `
      SELECT a.*, u.name AS assigned_to, aa.allocated_date, aa.return_date, aa.id AS allocation_id
      FROM assets a
      LEFT JOIN asset_allocations aa ON a.id = aa.asset_id AND aa.status = 'allocated'
      LEFT JOIN users u ON aa.employee_id = u.id
      ${where}
      ORDER BY a.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const countSql = `SELECT COUNT(*) FROM assets a ${where}`;

    const [rows, countRes] = await Promise.all([
      pool.query(sql, [...params, limit, offset]),
      pool.query(countSql, params),
    ]);

    return { data: rows.rows, total: parseInt(countRes.rows[0].count) };
  }

  async getEmployeeAssets(employeeId) {
    const sql = `
      SELECT a.*, aa.allocated_date, aa.return_date, aa.status AS allocation_status
      FROM asset_allocations aa
      JOIN assets a ON aa.asset_id = a.id
      WHERE aa.employee_id = $1 AND aa.status = 'allocated'
    `;
    const result = await pool.query(sql, [employeeId]);
    return result.rows;
  }

  async allocate(assetId, employeeId, allocatedBy, allocatedDate) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE assets SET status = 'allocated', updated_at = NOW() WHERE id = $1`,
        [assetId]
      );
      const alloc = await client.query(
        `INSERT INTO asset_allocations (asset_id, employee_id, allocated_by, allocated_date)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [assetId, employeeId, allocatedBy, allocatedDate || new Date()]
      );
      await client.query(
        `INSERT INTO asset_history (asset_id, action, remarks, created_by)
         VALUES ($1,'Allocated','Asset allocated to employee', $2)`,
        [assetId, allocatedBy]
      );
      await client.query('COMMIT');
      return alloc.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async returnAsset(assetId, returnedBy) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE assets SET status = 'available', updated_at = NOW() WHERE id = $1`,
        [assetId]
      );
      await client.query(
        `UPDATE asset_allocations SET status = 'returned', return_date = NOW() WHERE asset_id = $1 AND status = 'allocated'`,
        [assetId]
      );
      await client.query(
        `INSERT INTO asset_history (asset_id, action, remarks, created_by)
         VALUES ($1,'Returned','Asset returned', $2)`,
        [assetId, returnedBy]
      );
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

module.exports = new AssetRepository();

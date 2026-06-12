const pool = require('../../config/db');

class BaseRepository {
  constructor(tableName) {
    this.table = tableName;
    this.pool = pool;
  }

  async query(sql, params = []) {
    const result = await this.pool.query(sql, params);
    return result.rows;
  }

  async findAll({ where = '', params = [], limit = 20, offset = 0, orderBy = 'id DESC' } = {}) {
    const sql = `SELECT * FROM ${this.table} ${where} ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    return this.query(sql, [...params, limit, offset]);
  }

  async count(where = '', params = []) {
    const result = await this.pool.query(`SELECT COUNT(*) FROM ${this.table} ${where}`, params);
    return parseInt(result.rows[0].count);
  }

  async findById(id) {
    const rows = await this.query(`SELECT * FROM ${this.table} WHERE id = $1`, [id]);
    return rows[0] || null;
  }

  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const cols = keys.join(', ');
    const sql = `INSERT INTO ${this.table} (${cols}) VALUES (${placeholders}) RETURNING *`;
    const rows = await this.query(sql, values);
    return rows[0];
  }

  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const sql = `UPDATE ${this.table} SET ${sets}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`;
    const rows = await this.query(sql, [...values, id]);
    return rows[0];
  }

  async delete(id) {
    const rows = await this.query(`DELETE FROM ${this.table} WHERE id = $1 RETURNING *`, [id]);
    return rows[0];
  }
}

module.exports = BaseRepository;

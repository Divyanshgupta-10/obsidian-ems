const BaseRepository = require('./base.repository');

class AuthRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    const rows = await this.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  }

  async findById(id) {
    const rows = await this.query(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = new AuthRepository();

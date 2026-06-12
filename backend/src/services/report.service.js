const pool = require('../../config/db');
const XLSX = require('xlsx');

class ReportService {
  async dashboard() {
    const [emp, leaves, assets, depts] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users WHERE is_active = TRUE'),
      pool.query(`SELECT status, COUNT(*) FROM leaves GROUP BY status`),
      pool.query(`SELECT status, COUNT(*) FROM assets GROUP BY status`),
      pool.query('SELECT COUNT(*) FROM departments'),
    ]);

    const leaveStats = {};
    leaves.rows.forEach((r) => { leaveStats[r.status] = parseInt(r.count); });

    const assetStats = {};
    assets.rows.forEach((r) => { assetStats[r.status] = parseInt(r.count); });

    const deptStats = await pool.query(`
      SELECT d.department_name, COUNT(ep.user_id)::INT AS total
      FROM departments d
      LEFT JOIN employee_profiles ep ON d.id = ep.department_id
      GROUP BY d.department_name ORDER BY total DESC
    `);

    const salaryStats = await pool.query(
      'SELECT COALESCE(SUM(salary),0)::NUMERIC AS total_salary FROM employee_profiles'
    );

    const monthlyHires = await pool.query(`
      SELECT TO_CHAR(created_at, 'Mon YYYY') AS month, COUNT(*)::INT AS count
      FROM users WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY month ORDER BY MIN(created_at)
    `);

    return {
      totalEmployees: parseInt(emp.rows[0].count),
      totalDepartments: parseInt(depts.rows[0].count),
      leaveStats,
      assetStats,
      departmentStats: deptStats.rows,
      totalSalary: parseFloat(salaryStats.rows[0].total_salary),
      monthlyHires: monthlyHires.rows,
    };
  }

  async employeeReport() {
    const result = await pool.query(`
      SELECT u.name, u.email, u.role, d.department_name, ep.designation, ep.salary,
             ep.phone, ep.joining_date, u.is_active
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN departments d ON ep.department_id = d.id
      ORDER BY u.name
    `);
    return result.rows;
  }

  async leaveReport() {
    const result = await pool.query(`
      SELECT u.name AS employee, d.department_name,
             l.leave_type, l.start_date, l.end_date,
             (l.end_date - l.start_date + 1) AS days, l.status, l.reason
      FROM leaves l
      JOIN users u ON l.employee_id = u.id
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      LEFT JOIN departments d ON ep.department_id = d.id
      ORDER BY l.created_at DESC
    `);
    return result.rows;
  }

  async assetReport() {
    const result = await pool.query(`
      SELECT a.asset_code, a.asset_name, a.asset_type, a.status, a.purchase_cost,
             u.name AS assigned_to, aa.allocated_date, aa.return_date
      FROM assets a
      LEFT JOIN asset_allocations aa ON a.id = aa.asset_id AND aa.status = 'allocated'
      LEFT JOIN users u ON aa.employee_id = u.id
      ORDER BY a.asset_name
    `);
    return result.rows;
  }

  async auditLogs({ page = 1, limit = 50 }) {
    const offset = (page - 1) * limit;
    const result = await pool.query(`
      SELECT al.*, u.name AS performed_by_name
      FROM audit_logs al
      LEFT JOIN users u ON al.performed_by = u.id
      ORDER BY al.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    return result.rows;
  }

  toExcel(data, sheetName) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}

module.exports = new ReportService();

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { employeeService } from '../../services/employeeService';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';

function EmployeeList() {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 10;

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeService.list({ page, limit, search });
      setEmployees(res.data.data.data || []);
      setTotal(res.data.data.pagination?.total || 0);
    } catch (_) {}
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await employeeService.delete(id);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout title="Employees" subtitle="Manage all employees">
      <div className="page-header">
        <div>
          <h2 className="page-title">👥 Employee Directory</h2>
          <p className="page-desc">{total} employees registered</p>
        </div>
        {isAdmin && (
          <Link to="/employees/new" className="btn btn-primary">➕ Add Employee</Link>
        )}
      </div>

      <div className="filter-bar">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="form-control search-input"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
          {search && <button type="button" className="btn btn-secondary" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>Clear</button>}
        </form>
      </div>

      <div className="card">
        {loading ? (
          <div className="loader-wrapper"><div className="spinner" /></div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <div className="empty-state-title">No employees found</div>
            {isAdmin && <Link to="/employees/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>Add First Employee</Link>}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, idx) => (
                  <tr key={emp.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{(page - 1) * limit + idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {emp.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500 }}>{emp.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{emp.email}</td>
                    <td>{emp.department_name || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>{emp.designation || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td><span className={`badge badge-${emp.role}`}>{emp.role}</span></td>
                    <td>
                      <span className={`badge ${emp.is_active ? 'badge-approved' : 'badge-rejected'}`}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Link to={`/employees/${emp.id}`} className="btn btn-secondary btn-sm btn-icon" title="View">👁️</Link>
                        {isAdmin && (
                          <>
                            <Link to={`/employees/${emp.id}/edit`} className="btn btn-secondary btn-sm btn-icon" title="Edit">✏️</Link>
                            <button onClick={() => handleDelete(emp.id)} className="btn btn-danger btn-sm btn-icon" title="Delete">🗑️</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button key={p} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              );
            })}
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default EmployeeList;

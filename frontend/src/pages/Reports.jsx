import { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import Layout from '../components/layout/Layout';

function Reports() {
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState('employees');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    reportService.dashboard().then((r) => setDashboard(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        let res;
        if (activeTab === 'employees') res = await reportService.employees();
        else if (activeTab === 'leaves') res = await reportService.leaves();
        else res = await reportService.assets();
        setReportData(res.data.data || []);
      } catch (_) {}
      setLoading(false);
    };
    fetch();
  }, [activeTab]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      let res;
      if (activeTab === 'employees') res = await reportService.employees('excel');
      else if (activeTab === 'leaves') res = await reportService.leaves('excel');
      else res = await reportService.assets('excel');

      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}_report.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (_) {}
    setExportLoading(false);
  };

  const tabs = [
    { id: 'employees', label: '👥 Employees' },
    { id: 'leaves', label: '🌴 Leaves' },
    { id: 'assets', label: '🖥️ Assets' },
  ];

  const getColumns = () => {
    if (activeTab === 'employees') return ['name','email','role','department_name','designation','salary','joining_date'];
    if (activeTab === 'leaves') return ['employee','department_name','leave_type','start_date','end_date','days','status'];
    return ['asset_code','asset_name','asset_type','status','purchase_cost','assigned_to','allocated_date'];
  };

  return (
    <Layout title="Reports & Analytics" subtitle="Data insights and export">
      <div className="page-header">
        <h2 className="page-title">📈 Reports</h2>
        <button className="btn btn-success" onClick={handleExport} disabled={exportLoading}>
          {exportLoading ? '⌛ Exporting...' : '📥 Export Excel'}
        </button>
      </div>

      {/* Summary Cards */}
      {dashboard && (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Employees', value: dashboard.totalEmployees, icon: '👥', color: '#6366f1' },
            { label: 'Departments', value: dashboard.totalDepartments, icon: '🏢', color: '#06b6d4' },
            { label: 'Pending Leaves', value: dashboard.leaveStats?.pending || 0, icon: '⏳', color: '#f59e0b' },
            { label: 'Total Salary', value: `₹${((dashboard.totalSalary || 0)/1000).toFixed(0)}K`, icon: '💰', color: '#10b981' },
          ].map((s, i) => (
            <div className="stat-card" key={i} style={{ '--stat-color': s.color }}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-info">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`btn ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >{t.label}</button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="loader-wrapper"><div className="spinner" /></div>
        ) : reportData.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-title">No data available</div></div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>{getColumns().map((c) => <th key={c}>{c.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</th>)}</tr>
              </thead>
              <tbody>
                {reportData.slice(0, 50).map((row, i) => (
                  <tr key={i}>
                    {getColumns().map((c) => (
                      <td key={c} style={{ fontSize: '0.85rem' }}>
                        {c === 'status' ? <span className={`badge badge-${row[c]}`}>{row[c]}</span>
                          : c === 'salary' || c === 'purchase_cost' ? (row[c] ? `₹${Number(row[c]).toLocaleString()}` : '—')
                          : c.includes('date') && row[c] ? new Date(row[c]).toLocaleDateString()
                          : row[c] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Reports;

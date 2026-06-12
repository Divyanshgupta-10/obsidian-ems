import API from '../config/api';

export const reportService = {
  dashboard: () => API.get('/reports/dashboard'),
  employees: (format) => API.get('/reports/employees', { params: { format }, responseType: format === 'excel' ? 'blob' : 'json' }),
  leaves: (format) => API.get('/reports/leaves', { params: { format }, responseType: format === 'excel' ? 'blob' : 'json' }),
  assets: (format) => API.get('/reports/assets', { params: { format }, responseType: format === 'excel' ? 'blob' : 'json' }),
  auditLogs: (params) => API.get('/reports/audit-logs', { params }),
};

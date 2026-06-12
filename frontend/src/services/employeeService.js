import API from '../config/api';

export const employeeService = {
  list: (params) => API.get('/employees', { params }),
  get: (id) => API.get(`/employees/${id}`),
  create: (data) => API.post('/employees', data),
  update: (id, data) => API.put(`/employees/${id}`, data),
  delete: (id) => API.delete(`/employees/${id}`),
  departments: () => API.get('/employees/departments'),
  leaveBalance: (id) => API.get(`/employees/${id}/leave-balance`),
  
  // New features
  getAllSkills: () => API.get('/employees/skills'),
  uploadImages: (id, formData) => API.post(`/employees/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

import API from '../config/api';

export const assetService = {
  list: (params) => API.get('/assets', { params }),
  get: (id) => API.get(`/assets/${id}`),
  create: (data) => API.post('/assets', data),
  update: (id, data) => API.put(`/assets/${id}`, data),
  allocate: (id, data) => API.post(`/assets/${id}/allocate`, data),
  returnAsset: (id) => API.post(`/assets/${id}/return`),
  getEmployeeAssets: (employeeId) => API.get(`/assets/employee/${employeeId}`),
};

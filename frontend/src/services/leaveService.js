import API from '../config/api';

export const leaveService = {
  list: (params) => API.get('/leaves', { params }),
  get: (id) => API.get(`/leaves/${id}`),
  apply: (data) => API.post('/leaves', data),
  approve: (id) => API.put(`/leaves/${id}/approve`),
  reject: (id) => API.put(`/leaves/${id}/reject`),
};

import API from '../config/api';

export const notificationService = {
  list: () => API.get('/notifications'),
  markRead: (id) => API.post(`/notifications/${id}/read`),
};

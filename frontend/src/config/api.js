import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const isProd = process.env.NODE_ENV === 'production';
const API = axios.create({
  baseURL: isProd ? '/api/v1' : 'http://localhost:5000/api/v1',
  timeout: 10000,
});

// ── Request Interceptor — attach JWT token ──────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hrms_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — handle 401 globally ─────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;

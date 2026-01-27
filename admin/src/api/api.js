import axios from 'axios';

// Use env var in production; fallback to local for dev
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin API
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
};

// Complaint API
export const complaintAPI = {
  getAllComplaints: (filters) => api.get('/complaints', { params: filters }),
  updateComplaint: (id, data) => api.put(`/complaints/${id}`, data),
  getAnalytics: () => api.get('/complaints/analytics/stats'),
};

export default api;

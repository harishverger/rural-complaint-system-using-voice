import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('Initializing API with URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        baseURL: error.config?.baseURL
      }
    });
    return Promise.reject(error);
  }
);

export const complaintAPI = {
  // Create complaint
  createComplaint: (formData) => api.post('/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Get user complaints
  getUserComplaints: (userId) => api.get(`/complaints/user/${userId}`),
  
  // Delete user's own complaint
  deleteUserComplaint: (id, userId) => api.delete(`/complaints/user/${id}`, { data: { userId } }),
  
  // Update user's own complaint
  updateUserComplaint: (id, data) => api.put(`/complaints/user/${id}`, data),
};

export default api;

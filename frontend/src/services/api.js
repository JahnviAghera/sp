import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include token in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const roomAPI = {
  getRooms: () => api.get('/rooms'),
  createRoom: (roomData) => api.post('/rooms', roomData),
  getRoomById: (id) => api.get(`/rooms/${id}`),
};

export const analyticsAPI = {
  getUserAnalytics: () => api.get('/analytics/user'),
  getRoomAnalytics: (roomId) => api.get(`/analytics/room/${roomId}`),
};

export default api;

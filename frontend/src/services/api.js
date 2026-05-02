import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include token in requests
api.interceptors.request.use((config) => {
  try {
    const authStorageStr = localStorage.getItem('auth-storage');
    if (authStorageStr) {
      const authStorage = JSON.parse(authStorageStr);
      const token = authStorage?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error('Error parsing token from storage:', error);
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  testApiKey: (data) => api.post('/auth/test-key', data),
};

export const roomAPI = {
  getRooms: () => api.get('/rooms'),
  createRoom: (roomData) => api.post('/rooms/create', roomData),
  getRoomById: (id) => api.get(`/rooms/${id}`),
};

export const analyticsAPI = {
  getUserAnalytics: () => api.get('/analytics/user'),
  getRoomAnalytics: (roomId) => api.get(`/analytics/room/${roomId}`),
};

export default api;

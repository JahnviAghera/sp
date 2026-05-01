import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      set({ user: data.data, token: data.data.token, loading: false });
      localStorage.setItem('user', JSON.stringify(data.data));
      localStorage.setItem('token', data.data.token);
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed. Note: Backend is currently offline.', 
        loading: false 
      });
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      set({ user: data.data, token: data.data.token, loading: false });
      localStorage.setItem('user', JSON.stringify(data.data));
      localStorage.setItem('token', data.data.token);
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed. Note: Backend is currently offline.', 
        loading: false 
      });
    }
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },
}));

export default useAuthStore;

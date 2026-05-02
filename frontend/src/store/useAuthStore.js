import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { authAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const { data } = await authAPI.login(credentials);
          set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
          return true;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Login failed', 
            loading: false 
          });
          return false;
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await authAPI.register(userData);
          set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
          return true;
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Registration failed', 
            loading: false 
          });
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      fetchProfile: async () => {
        try {
          const { data } = await authAPI.getProfile();
          set({ user: data.user, isAuthenticated: true });
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;

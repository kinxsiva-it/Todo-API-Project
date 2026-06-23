import { create } from 'zustand';
import api from '../config/axios';

const fetchFreshCsrf = async (set) => {
  const response = await api.get('/api/csrf-token');
  const csrfToken = response.data.csrfToken;

  api.defaults.headers.common['X-CSRF-Token'] = csrfToken;
  set({ csrfToken });

  return csrfToken;
};

export const useAuthStore = create((set) => ({
  user: null,
  csrfToken: null,
  error: null,
  isLoading: false,

  fetchCsrf: async () => {
    try {
      return await fetchFreshCsrf(set);
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      return null;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      await fetchFreshCsrf(set);
      const response = await api.post('/api/auth/login', { email, password });
      const { user } = response.data;

      set({ user, isLoading: false });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.error || error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      return false;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      await fetchFreshCsrf(set);
      await api.post('/api/auth/register', { email, password });

      await fetchFreshCsrf(set);
      const response = await api.post('/api/auth/login', { email, password });
      const { user } = response.data;

      set({ user, isLoading: false });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.error || error.response?.data?.message || 'Register failed',
        isLoading: false,
      });
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  logout: () => {
    set({ user: null, error: null });
  },
}));

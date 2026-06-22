import { create } from 'zustand';
import api from '../config/axios';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  error: null,
  isLoading: false,

  fetchCsrf: async () => {
    try {
      const response = await api.get('/api/csrf-token'); 
      api.defaults.headers.common['X-CSRF-Token'] = response.data.csrfToken;
      console.log('ได้รับ CSRF Token แล้ว:', response.data.csrfToken);
    } catch (error) {
      console.error('ดึง CSRF Token ไม่สำเร็จ:', error);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      const { token, user } = response.data;
      
      set({ user: user, token: token, isLoading: false });
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return true; 
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login ไม่สำเร็จ', 
        isLoading: false 
      });
      return false;
    }
  },
}));
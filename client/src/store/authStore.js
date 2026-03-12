import { create } from 'zustand';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  // Register
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      socketService.connect();
      socketService.joinUserRoom(user.id);
      
      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erreur lors de l\'inscription';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Login
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      socketService.connect();
      socketService.joinUserRoom(user.id);
      
      set({ user, token, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erreur lors de la connexion';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    socketService.disconnect();
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Get profile
  getProfile: async () => {
    try {
      const response = await authAPI.getProfile();
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
      return user;
    } catch (error) {
      if (error.response?.status === 401) {
        get().logout();
      }
      throw error;
    }
  },

  // Update profile
  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.updateProfile(data);
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, loading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erreur lors de la mise à jour';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Change password
  changePassword: async (data) => {
    set({ loading: true, error: null });
    try {
      await authAPI.changePassword(data);
      set({ loading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erreur lors du changement de mot de passe';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Verify token and reconnect socket
  verifyAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false });
      return false;
    }

    try {
      const response = await authAPI.verifyToken();
      if (response.data.valid) {
        const user = response.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        
        socketService.connect();
        socketService.joinUserRoom(user.id);
        
        set({ user, isAuthenticated: true });
        return true;
      }
      get().logout();
      return false;
    } catch (error) {
      get().logout();
      return false;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
export { useAuthStore };

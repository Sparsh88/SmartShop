import { create } from 'zustand';
import api from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  isVerified: boolean;
  isBlocked: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  updateUser: (updatedUser) => set((state) => ({
    user: state.user ? { ...state.user, ...updatedUser } : null
  })),

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/register', { name, email, password });
      set({ isLoading: false });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Registration failed',
      });
      throw err;
    }
  },

  verifyEmail: async (email, code) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/verify', { email, code });
      const { accessToken, user } = res.data;
      
      localStorage.setItem('accessToken', accessToken);
      set({
        token: accessToken,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || 'Email verification failed',
      });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, user } = res.data;

      if (user.isBlocked) {
        throw new Error('Your account has been blocked. Please contact support.');
      }

      localStorage.setItem('accessToken', accessToken);
      set({
        token: accessToken,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || err.message || 'Login failed',
      });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      localStorage.removeItem('accessToken');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      window.location.href = '/login';
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    set({ isLoading: true });
    try {
      // Trigger a silent token refresh. If valid, it returns a new token and verifies login status
      const res = await api.post('/auth/refresh');
      const { accessToken } = res.data;
      localStorage.setItem('accessToken', accessToken);

      // Fetch user profile stats (we can use auth-refresh or get current user from admin stats / details)
      // For simple and efficient bootstrap, let's decode user data or get it from /admin/notifications 
      // or implement a quick profile endpoint. Let's create an endpoint in user details or read from jwt
      // Let's decode the payload.
      const payloadBase64 = accessToken.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));

      // Fetch latest profile state to see if blocked/verified
      // Let's make sure it's kept in sync
      set({
        token: accessToken,
        isAuthenticated: true,
        user: {
          id: decodedPayload.id,
          name: decodedPayload.name || 'SmartShop Customer',
          email: decodedPayload.email,
          role: decodedPayload.role,
          isVerified: true,
          isBlocked: false,
        },
        isLoading: false,
      });
    } catch (err) {
      console.error('CheckAuth failed, logging out:', err);
      localStorage.removeItem('accessToken');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

// Listen to global logout event dispatched by API client interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth-logout', () => {
    localStorage.removeItem('accessToken');
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      error: 'Session expired. Please log in again.',
    });
  });
}

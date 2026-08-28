import { create } from 'zustand';
import api from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
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
      set({ isAuthenticated: false, user: null, isLoading: false });
      return;
    }

    // Fast-path: Decode and check token expiration locally first
    try {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const decoded = JSON.parse(atob(payloadBase64));
        const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();

        if (!isExpired) {
          // Token is valid (3-year lifespan) -> authenticate immediately
          set({
            token,
            isAuthenticated: true,
            user: {
              id: decoded.id,
              name: decoded.name || (decoded.email === 'sparshchauhan050@gmail.com' ? 'Sparsh Chauhan' : 'SmartShop User'),
              email: decoded.email,
              role: (decoded.email === 'sparshchauhan050@gmail.com' ? 'ADMIN' : decoded.role) || 'CUSTOMER',
              isVerified: true,
              isBlocked: false,
            },
            isLoading: false,
          });
          return;
        }
      }
    } catch (_decodeErr) {
      // If decoding fails, proceed to attempt refresh below
    }

    set({ isLoading: true });
    try {
      // Trigger a silent token refresh if token was expired or needs renewal
      const res = await api.post('/auth/refresh');
      const { accessToken } = res.data;
      localStorage.setItem('accessToken', accessToken);

      const payloadBase64 = accessToken.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));

      set({
        token: accessToken,
        isAuthenticated: true,
        user: {
          id: decodedPayload.id,
          name: decodedPayload.name || (decodedPayload.email === 'sparshchauhan050@gmail.com' ? 'Sparsh Chauhan' : 'SmartShop User'),
          email: decodedPayload.email,
          role: (decodedPayload.email === 'sparshchauhan050@gmail.com' ? 'ADMIN' : decodedPayload.role) || 'CUSTOMER',
          isVerified: true,
          isBlocked: false,
        },
        isLoading: false,
      });
    } catch (err) {
      console.error('CheckAuth refresh failed, logging out:', err);
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

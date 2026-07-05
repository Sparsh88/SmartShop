import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user session on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('smartshop_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/profile');
        setUser(data);
      } catch (error) {
        console.error('Session restoration failed:', error.message);
        localStorage.removeItem('smartshop_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('smartshop_token', data.token);
      setUser(data);
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  // Registration handler
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('smartshop_token', data.token);
      setUser(data);
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  // Google Oauth handler
  const googleLogin = async (googleResponse) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', googleResponse);
      localStorage.setItem('smartshop_token', data.token);
      setUser(data);
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Google authentication failed';
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (formData) => {
    try {
      // Use multipart/form-data for image uploads
      const { data } = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser(prev => ({
        ...prev,
        name: data.name,
        profilePic: data.profilePic,
        addresses: data.addresses
      }));
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update profile';
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('smartshop_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

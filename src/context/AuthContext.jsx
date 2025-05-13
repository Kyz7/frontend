// File: src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { login as loginApi, register as registerApi } from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestViewCount, setGuestViewCount] = useState(() => {
    return parseInt(localStorage.getItem('guestViewCount') || '0');
  });

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode JWT token to get user info (simple decode, not validation)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const { id } = JSON.parse(jsonPayload);
        setUser({ id });
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('guestViewCount', guestViewCount.toString());
  }, [guestViewCount]);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await loginApi({ username, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.removeItem('guestViewCount');
      
      // Decode JWT token to get user info
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const { id } = JSON.parse(jsonPayload);
      
      setUser({ id });
      setGuestViewCount(0);
      toast.success('Login berhasil!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login gagal');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      await registerApi(userData);
      toast.success('Registrasi berhasil! Silakan login.');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registrasi gagal');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Berhasil logout');
  };

  const incrementGuestViewCount = () => {
    if (!user) {
      setGuestViewCount(prevCount => prevCount + 1);
    }
  };

  const value = {
    user,
    loading,
    guestViewCount,
    login,
    register,
    logout,
    incrementGuestViewCount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
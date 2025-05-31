import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { login as loginApi, register as registerApi } from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestViewCount, setGuestViewCount] = useState(() => {
    // Safely get from localStorage with fallback
    try {
      return parseInt(localStorage.getItem('guestViewCount') || '0');
    } catch (error) {
      return 0;
    }
  });

  // JWT token validation and user initialization
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Validate token format
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const base64Url = tokenParts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const payload = JSON.parse(jsonPayload);
            
            // Check token expiration
            if (payload.exp && payload.exp * 1000 > Date.now()) {
              setUser({ 
                id: payload.id, 
                username: payload.username,
                exp: payload.exp 
              });
            } else {
              // Token expired
              localStorage.removeItem('token');
              toast.info('Sesi telah berakhir, silakan login kembali');
            }
          } else {
            // Invalid token format
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Save guest view count to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('guestViewCount', guestViewCount.toString());
    } catch (error) {
      console.error('Error saving guest view count:', error);
    }
  }, [guestViewCount]);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await loginApi({ username, password });
      const { token, user: userData } = response.data;
      
      // Store token
      localStorage.setItem('token', token);

      // Clear guest data
      localStorage.removeItem('guestSearchCount');
      localStorage.removeItem('guestViewCount');

      // Decode token to get user info
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        
        setUser({ 
          id: payload.id || userData?.id, 
          username: payload.username || userData?.username,
          exp: payload.exp 
        });
      } catch (decodeError) {
        // Fallback to userData from response
        setUser(userData);
      }
      
      setGuestViewCount(0);
      toast.success('Login berhasil!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error messages
      let errorMessage = 'Login gagal';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await registerApi(userData);
      
      const successMessage = response.data?.message || 'Registrasi berhasil! Silakan login.';
      toast.success(successMessage);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error messages
      let errorMessage = 'Registrasi gagal';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        // Handle MySQL specific errors
        if (errorMessage.includes('Duplicate entry') || errorMessage.includes('unique constraint')) {
          errorMessage = 'Username sudah digunakan, silakan pilih username lain';
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
      toast.info('Berhasil logout');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const incrementGuestViewCount = () => {
    if (!user) {
      setGuestViewCount(prevCount => prevCount + 1);
    }
  };

  // Check if token is expiring soon (within 5 minutes)
  const isTokenExpiringSoon = () => {
    if (!user?.exp) return false;
    const fiveMinutesFromNow = Math.floor(Date.now() / 1000) + (5 * 60);
    return user.exp < fiveMinutesFromNow;
  };

  // Auto-logout when token expires
  useEffect(() => {
    if (user?.exp) {
      const checkTokenExpiration = setInterval(() => {
        if (user.exp * 1000 <= Date.now()) {
          logout();
          toast.warning('Sesi telah berakhir, silakan login kembali');
        }
      }, 60000); // Check every minute

      return () => clearInterval(checkTokenExpiration);
    }
  }, [user]);

  const value = {
    user,
    loading,
    guestViewCount,
    login,
    register,
    logout,
    incrementGuestViewCount,
    isTokenExpiringSoon
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
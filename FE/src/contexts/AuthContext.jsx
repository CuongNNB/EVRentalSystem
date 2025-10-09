import React, { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '../services/api';
import { mockUserApi, getApiService } from '../services/mockApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ev_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('ev_token');
  });
  const [loading, setLoading] = useState(false);

  // Check for existing session on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('ev_token');
    const storedUser = localStorage.getItem('ev_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Check if backend is available
      const apiType = await getApiService();
      const api = apiType === 'real' ? userApi : mockUserApi;
      
      const response = await api.login(credentials);
      
      if (response.success) {
        const { user: userData, token: userToken } = response.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('ev_token', userToken);
        localStorage.setItem('ev_user', JSON.stringify(userData));
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // New method for direct login with user and token
  const loginWithSession = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('ev_token', userToken);
    localStorage.setItem('ev_user', JSON.stringify(userData));
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Check if backend is available
      const apiType = await getApiService();
      const api = apiType === 'real' ? userApi : mockUserApi;
      
      const response = await api.register(userData);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userId, userData) => {
    try {
      setLoading(true);
      const response = await userApi.updateProfile(userId, userData);
      
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (userId, passwordData) => {
    try {
      setLoading(true);
      const response = await userApi.changePassword(userId, passwordData);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ev_token');
    localStorage.removeItem('ev_user');
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const value = {
    user,
    token,
    loading,
    login,
    loginWithSession,
    register,
    updateProfile,
    changePassword,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

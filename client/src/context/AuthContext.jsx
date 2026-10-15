import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sdg17_auth_token'));
  const [loading, setLoading] = useState(true);

  // Initialize and check current authentication state
  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('sdg17_auth_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.success) {
          setUser(res.data.user);
        }
      } catch {
        localStorage.removeItem('sdg17_auth_token');
        localStorage.removeItem('sdg17_auth_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('sdg17_auth_token', res.data.token);
      localStorage.setItem('sdg17_auth_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    if (res.data && res.data.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('sdg17_auth_token', res.data.token);
      localStorage.setItem('sdg17_auth_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue even if network error
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('sdg17_auth_token');
      localStorage.removeItem('sdg17_auth_user');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.success) {
        setUser(res.data.user);
      }
    } catch {
      // ignored
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOrgAdmin: user?.role === 'org_admin' || user?.role === 'admin',
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

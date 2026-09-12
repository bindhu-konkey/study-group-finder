import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('studysync_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('studysync_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.auth.getProfile();
          setUser(res.user);
          localStorage.setItem('studysync_user', JSON.stringify(res.user));
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('studysync_token', res.token);
    localStorage.setItem('studysync_user', JSON.stringify(res.user));
    return res;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('studysync_token', res.token);
    localStorage.setItem('studysync_user', JSON.stringify(res.user));
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('studysync_token');
    localStorage.removeItem('studysync_user');
  };

  const updateProfile = async (data) => {
    const res = await api.auth.updateProfile(data);
    setUser(res.user);
    localStorage.setItem('studysync_user', JSON.stringify(res.user));
    return res;
  };

  // One-click demo login helpers
  const demoLogin = async (demoKey = 'alex') => {
    const accounts = {
      alex: { email: 'alex.chen@campus.edu', password: 'password123' },
      maya: { email: 'maya.patel@campus.edu', password: 'password123' },
      liam: { email: 'liam.r@campus.edu', password: 'password123' },
    };

    const target = accounts[demoKey] || accounts.alex;
    return login(target.email, target.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateProfile,
        demoLogin,
      }}
    >
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

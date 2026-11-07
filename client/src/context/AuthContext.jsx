import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(apiClient.getUser());
  const [token, setToken] = useState(apiClient.getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const res = await apiClient.getMe();
          setUser(res.user);
          apiClient.setUser(res.user);
        } catch (err) {
          console.warn('Session expired or invalid, logging out.');
          setToken(null);
          setUser(null);
          apiClient.setToken(null);
          apiClient.setUser(null);
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiClient.login(email, password);
    setToken(res.token);
    setUser(res.user);
    apiClient.setToken(res.token);
    apiClient.setUser(res.user);
    return res.user;
  };

  const register = async (email, password, name) => {
    const res = await apiClient.register(email, password, name);
    setToken(res.token);
    setUser(res.user);
    apiClient.setToken(res.token);
    apiClient.setUser(res.user);
    return res.user;
  };

  const loginDemo = async () => {
    const res = await apiClient.loginDemo();
    setToken(res.token);
    setUser(res.user);
    apiClient.setToken(res.token);
    apiClient.setUser(res.user);
    return res.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    apiClient.setToken(null);
    apiClient.setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

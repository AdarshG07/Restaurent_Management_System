import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';
import { toast } from 'sonner';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('adminAuth');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (admin?.token) {
      localStorage.setItem('adminAuth', JSON.stringify(admin));
      api.defaults.headers.common.Authorization = `Bearer ${admin.token}`;
    } else {
      localStorage.removeItem('adminAuth');
      delete api.defaults.headers.common.Authorization;
    }
  }, [admin]);

  const login = (user) => {
    setAdmin(user);
    toast.success('Admin logged in');
  };

  const logout = () => {
    setAdmin(null);
    toast('Logged out');
  };

  return <AuthContext.Provider value={{ admin, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

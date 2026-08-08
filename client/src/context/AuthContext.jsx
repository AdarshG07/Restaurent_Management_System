import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';
import { toast } from 'sonner';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('adminAuth');

    if (stored) {
      const parsed = JSON.parse(stored);

      // Immediately attach token to axios
      if (parsed?.token) {
        api.defaults.headers.common.Authorization = `Bearer ${parsed.token}`;
      }

      return parsed;
    }

    return null;
  });

  useEffect(() => {
    if (admin?.token) {
      localStorage.setItem('adminAuth', JSON.stringify(admin));

      api.defaults.headers.common.Authorization =
        `Bearer ${admin.token}`;
    } else {
      localStorage.removeItem('adminAuth');

      delete api.defaults.headers.common.Authorization;
    }
  }, [admin]);

  const login = (user) => {
    // Attach token immediately
    if (user?.token) {
      api.defaults.headers.common.Authorization =
        `Bearer ${user.token}`;
    }

    localStorage.setItem('adminAuth', JSON.stringify(user));
    setAdmin(user);

    toast.success('Admin logged in');
  };

  const logout = () => {
    localStorage.removeItem('adminAuth');

    delete api.defaults.headers.common.Authorization;

    setAdmin(null);

    toast('Logged out');
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
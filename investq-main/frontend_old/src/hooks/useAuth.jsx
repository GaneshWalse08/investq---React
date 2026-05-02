import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('iq_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('iq_token', data.token);
      localStorage.setItem('iq_user', JSON.stringify(data.user));
      setUser(data.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.response?.data?.error || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (form) => {
    setLoading(true);
    try {
      const { data } = await authAPI.signup(form);
      localStorage.setItem('iq_token', data.token);
      localStorage.setItem('iq_user', JSON.stringify(data.user));
      setUser(data.user);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.response?.data?.error || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('iq_token');
    localStorage.removeItem('iq_user');
    setUser(null);
  };

  const updatePrefs = async (prefs) => {
    try {
      await authAPI.updateProfile(prefs);
      const updated = { ...user, ...prefs };
      localStorage.setItem('iq_user', JSON.stringify(updated));
      setUser(updated);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updatePrefs }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

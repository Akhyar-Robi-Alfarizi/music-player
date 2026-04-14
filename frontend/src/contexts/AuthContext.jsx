import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mymusic_token'));
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function restore() {
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        localStorage.removeItem('mymusic_token');
        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }
    restore();
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      authLoading,
      async login(identifier, password) {
        const { data } = await api.post('/auth/login', { identifier, password });
        localStorage.setItem('mymusic_token', data.token);
        setToken(data.token);
        setUser(data.user);
      },
      async register(payload) {
        const { data } = await api.post('/auth/register', payload);
        localStorage.setItem('mymusic_token', data.token);
        setToken(data.token);
        setUser(data.user);
      },
      logout() {
        localStorage.removeItem('mymusic_token');
        setToken(null);
        setUser(null);
      },
    }),
    [user, token, authLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }
  return context;
}

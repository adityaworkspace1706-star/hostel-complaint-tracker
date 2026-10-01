import { createContext, useCallback, useMemo, useState } from 'react';
import { authService } from '../services/api.js';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'hct_token';
const USER_KEY = 'hct_user';

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const result = await authService.login(credentials);
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      setToken(result.token);
      setUser(result.user);
      return result.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      const result = await authService.register(payload);
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      setToken(result.token);
      setUser(result.user);
      return result.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const result = await authService.updateProfile(payload);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    setUser(result.user);
    return result.user;
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, isAuthenticated: Boolean(user && token), login, register, logout, updateProfile }),
    [user, token, loading, login, register, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { readStoredUser, writeStoredUser } from './authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUserState(readStoredUser());
    setReady(true);
  }, []);

  const login = useCallback((u) => {
    writeStoredUser(u);
    setUserState(u);
  }, []);

  const logout = useCallback(() => {
    writeStoredUser(null);
    setUserState(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      logout,
      isStudent: user?.role === 'USER',
      isAdmin: user?.role === 'ADMIN',
      isTechnician: user?.role === 'TECHNICIAN',
    }),
    [user, ready, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

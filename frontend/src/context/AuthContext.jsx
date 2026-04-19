import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { writeStoredUser } from '../auth/authStorage';

const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

/** Normalize Spring's Set<Role> JSON (strings or { name }) into role name strings. */
function roleNamesFromUser(user) {
  if (!user?.roles) return [];
  const raw = user.roles;
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((r) => (typeof r === 'string' ? r : r?.name ?? String(r)));
}

function primaryRoleFromNames(names) {
  if (names.includes('ADMIN')) return 'ADMIN';
  if (names.includes('TECHNICIAN')) return 'TECHNICIAN';
  if (names.includes('USER')) return 'USER';
  return '';
}

function toCompatStoredUser(user) {
  const names = roleNamesFromUser(user);
  const role = primaryRoleFromNames(names);
  const id =
    user?.id ||
    user?.userId ||
    user?.studentId ||
    user?.email ||
    '';
  if (!id || !role) return null;
  return {
    id,
    role,
    displayName: user?.displayName || user?.name || user?.email || id,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const roleNames = useMemo(() => roleNamesFromUser(user), [user]);
  const isAdmin = roleNames.includes('ADMIN');
  const isStudent = roleNames.includes('USER') && !isAdmin;
  const isTechnician = roleNames.includes('TECHNICIAN');

  async function fetchJson(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        setUser(null);
      }
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.status === 204 ? null : response.json();
  }

  async function checkAuth() {
    setLoading(true);
    setError('');
    try {
      const me = await fetchJson('/api/auth/me');
      setUser(me);
      writeStoredUser(toCompatStoredUser(me));
    } catch {
      setUser(null);
      writeStoredUser(null);
      // Not necessarily an error if they are just not logged in
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  function login() {
    window.location.href = `${API_BASE}/oauth2/authorization/google`;
  }

  async function logout() {
    try {
      await fetchJson('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setUser(null);
      writeStoredUser(null);
      // Redirect to home after logout
      window.location.href = '/';
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        fetchJson,
        checkAuth,
        isAdmin,
        isStudent,
        isTechnician,
        roleNames,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

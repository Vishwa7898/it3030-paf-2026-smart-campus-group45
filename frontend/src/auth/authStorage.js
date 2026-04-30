const KEY = 'smartcampus_auth';

/** @typedef {{ id: string, role: string, displayName: string }} AuthUser */

/** @returns {AuthUser | null} */
export function readStoredUser() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (u?.id && u?.role) return u;
    return null;
  } catch {
    return null;
  }
}

/** @param {AuthUser | null} user */
export function writeStoredUser(user) {
  if (!user) {
    localStorage.removeItem(KEY);
    return;
  }
  localStorage.setItem(KEY, JSON.stringify(user));
}

export const DEMO_ACCOUNTS = {
  student: {
    id: 'student-it2025-01',
    role: 'USER',
    displayName: 'Student (demo)',
  },
  admin: {
    id: 'admin-campus',
    role: 'ADMIN',
    displayName: 'Campus admin',
  },
  technician: {
    id: 'tech-jamith',
    role: 'TECHNICIAN',
    displayName: 'Technician',
  },
};

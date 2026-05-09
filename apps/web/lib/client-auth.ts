const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'RESIDENT' | 'SUPER_ADMIN';
  roomNumber?: string;
  villa?: {
    id: string;
    name: string;
    address: string;
    inviteCode: string;
    subscriptionStatus: string;
  };
  viewMode?: 'admin' | 'resident';
  residentVilla?: {
    id: string;
    name: string;
    address: string;
    inviteCode: string;
    subscriptionStatus: string;
    roomNumber: string;
  };
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function removeUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function clearAuth(): void {
  removeToken();
  removeUser();
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// Convenience aliases used across auth pages
export const saveToken = setToken;
export const saveUser = setUser;
export const getStoredUser = getUser;

// Dual-mode helpers
export function getViewMode(): 'admin' | 'resident' {
  const user = getUser();
  return user?.viewMode ?? (user?.role === 'ADMIN' ? 'admin' : 'resident');
}

export function setViewMode(mode: 'admin' | 'resident'): void {
  const user = getUser();
  if (user) setUser({ ...user, viewMode: mode });
}

export function hasDualMode(): boolean {
  const user = getUser();
  if (!user) return false;
  // ADMIN이 관리 빌라(villa)와 입주민 빌라(residentVilla) 모두 있으면 듀얼 모드 가능
  return user.role === 'ADMIN' && !!user.villa && !!user.residentVilla;
}

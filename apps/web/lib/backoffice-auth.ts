/**
 * 백오피스 전용 인증 유틸 (localStorage bo_token / bo_user)
 */

export interface BoUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function getBoUser(): BoUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('bo_user') ?? '{}';
    const user = JSON.parse(raw) as BoUser;
    return user.role === 'SUPER_ADMIN' ? user : null;
  } catch {
    return null;
  }
}

export function getBoToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('bo_token') ?? '';
}

export function clearBoAuth() {
  localStorage.removeItem('bo_token');
  localStorage.removeItem('bo_user');
}

/** 백오피스 API 요청용 공통 헤더 */
export function boAuthHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getBoToken()}` };
}

import crypto from 'crypto';

export type OAuthProvider = 'kakao' | 'google';

export interface OAuthProfile {
  providerId: string;
  email: string | null;
  name: string | null;
}

// ── State ──────────────────────────────────────────────────────────────────

export function generateState(): string {
  return crypto.randomBytes(16).toString('hex');
}

// ── Authorization URLs ──────────────────────────────────────────────────────

export function getKakaoAuthUrl(state: string, redirectUri: string): string {
  const clientId = process.env.KAKAO_CLIENT_ID;
  if (!clientId) throw new Error('KAKAO_CLIENT_ID가 설정되지 않았습니다.');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
    scope: 'account_email,profile_nickname',
  });
  return `https://kauth.kakao.com/oauth/authorize?${params}`;
}

export function getGoogleAuthUrl(state: string, redirectUri: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID가 설정되지 않았습니다.');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
    scope: 'openid email profile',
    access_type: 'online',
  });
  return `https://accounts.google.com/o/oauth2/auth?${params}`;
}

// ── Token Exchange ──────────────────────────────────────────────────────────

async function exchangeKakaoCode(code: string, redirectUri: string): Promise<string> {
  const res = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_CLIENT_ID!,
      client_secret: process.env.KAKAO_CLIENT_SECRET ?? '',
      redirect_uri: redirectUri,
      code,
    }),
  });
  if (!res.ok) throw new Error(`카카오 토큰 교환 실패: ${res.status}`);
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

async function exchangeGoogleCode(code: string, redirectUri: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      code,
    }),
  });
  if (!res.ok) throw new Error(`구글 토큰 교환 실패: ${res.status}`);
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

// ── User Profile ────────────────────────────────────────────────────────────

async function getKakaoProfile(accessToken: string): Promise<OAuthProfile> {
  const res = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`카카오 프로필 조회 실패: ${res.status}`);
  const data = await res.json() as {
    id: number;
    kakao_account?: { email?: string; profile?: { nickname?: string } };
  };
  return {
    providerId: String(data.id),
    email: data.kakao_account?.email ?? null,
    name: data.kakao_account?.profile?.nickname ?? null,
  };
}

async function getGoogleProfile(accessToken: string): Promise<OAuthProfile> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`구글 프로필 조회 실패: ${res.status}`);
  const data = await res.json() as { id: string; email?: string; name?: string };
  return {
    providerId: data.id,
    email: data.email ?? null,
    name: data.name ?? null,
  };
}

// ── Public: get profile from auth code ─────────────────────────────────────

export async function getOAuthProfile(
  provider: OAuthProvider,
  code: string,
  redirectUri: string,
): Promise<OAuthProfile> {
  if (provider === 'kakao') {
    const token = await exchangeKakaoCode(code, redirectUri);
    return getKakaoProfile(token);
  }
  const token = await exchangeGoogleCode(code, redirectUri);
  return getGoogleProfile(token);
}

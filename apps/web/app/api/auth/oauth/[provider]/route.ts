import { NextRequest, NextResponse } from 'next/server';
import { generateState, getKakaoAuthUrl, getGoogleAuthUrl, type OAuthProvider } from '@/lib/oauth';

const SUPPORTED: OAuthProvider[] = ['kakao', 'google'];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  if (!SUPPORTED.includes(provider as OAuthProvider)) {
    return NextResponse.json({ error: '지원하지 않는 소셜 로그인입니다.' }, { status: 400 });
  }

  const state = generateState();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/callback/${provider}`;

  let authUrl: string;
  try {
    authUrl =
      provider === 'kakao'
        ? getKakaoAuthUrl(state, redirectUri)
        : getGoogleAuthUrl(state, redirectUri);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : '소셜 로그인 설정 오류' },
      { status: 500 },
    );
  }

  const res = NextResponse.redirect(authUrl);
  res.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return res;
}

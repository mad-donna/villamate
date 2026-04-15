import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { getOAuthProfile, type OAuthProvider } from '@/lib/oauth';

const SUPPORTED: OAuthProvider[] = ['kakao', 'google'];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin;

  function failRedirect(reason: string) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);
  }

  if (!SUPPORTED.includes(provider as OAuthProvider)) {
    return failRedirect('지원하지 않는 소셜 로그인입니다.');
  }

  const { searchParams } = req.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) return failRedirect('소셜 로그인이 취소되었습니다.');
  if (!code || !state) return failRedirect('잘못된 요청입니다.');

  // CSRF state 검증
  const savedState = req.cookies.get('oauth_state')?.value;
  if (!savedState || savedState !== state) {
    return failRedirect('보안 검증에 실패했습니다. 다시 시도해주세요.');
  }

  // OAuth 프로필 조회
  const redirectUri = `${origin}/api/auth/callback/${provider}`;
  let profile;
  try {
    profile = await getOAuthProfile(provider as OAuthProvider, code, redirectUri);
  } catch {
    return failRedirect('소셜 로그인 중 오류가 발생했습니다.');
  }

  // 기존 SocialAccount로 유저 조회
  const existingSocial = await prisma.socialAccount.findUnique({
    where: { provider_providerId: { provider, providerId: profile.providerId } },
    include: { user: true },
  });

  let userId: string;
  let isNewUser = false;

  if (existingSocial) {
    // 기존 소셜 계정 → 바로 로그인
    userId = existingSocial.userId;
  } else {
    // 이메일로 기존 계정 연결 시도
    const existingUser = profile.email
      ? await prisma.user.findUnique({ where: { email: profile.email } })
      : null;

    if (existingUser) {
      // 이메일 일치 계정에 소셜 연결
      await prisma.socialAccount.create({
        data: { userId: existingUser.id, provider, providerId: profile.providerId },
      });
      userId = existingUser.id;
    } else {
      // 신규 유저 생성
      const email = profile.email ?? `${provider}_${profile.providerId}@social.villamate.app`;
      const newUser = await prisma.user.create({
        data: {
          email,
          password: null,
          name: profile.name ?? '사용자',
          role: 'RESIDENT',
          socialAccounts: {
            create: { provider, providerId: profile.providerId },
          },
        },
      });
      userId = newUser.id;
      isNewUser = true;
    }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return failRedirect('사용자 정보를 찾을 수 없습니다.');

  // 프로필 보완 필요 여부: 이름이 기본값이거나 이메일이 social 도메인인 경우
  const needsSetup =
    isNewUser &&
    (!profile.email || !profile.name || user.email.endsWith('@social.villamate.app'));

  // villaId 조회
  let villaId: string | undefined;
  if (user.role === 'ADMIN') {
    const villa = await prisma.villa.findFirst({ where: { adminId: userId }, select: { id: true } });
    villaId = villa?.id;
  } else if (user.role === 'RESIDENT') {
    const record = await prisma.residentRecord.findFirst({ where: { userId }, select: { villaId: true } });
    villaId = record?.villaId;
  }

  const token = await signToken({
    sub: userId,
    email: user.email,
    role: user.role,
    villaId,
    needsSetup,
  });

  // state 쿠키 삭제 후 /auth/social 중간 페이지로 리다이렉트.
  // JWT를 URL에 노출하지 않기 위해 단기 HttpOnly 쿠키로 전달하고
  // 클라이언트가 /api/auth/exchange-token을 호출해 토큰을 수령합니다.
  const next = needsSetup ? '/profile-setup' : isNewUser ? '/select-role' : '/home';
  const destination = `${origin}/auth/social?next=${encodeURIComponent(next)}`;

  const res = NextResponse.redirect(destination);
  res.cookies.delete('oauth_state');
  res.cookies.set('pending_auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60, // 60초 일회성
    path: '/',
  });
  return res;
}

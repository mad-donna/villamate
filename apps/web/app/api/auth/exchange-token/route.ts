import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/exchange-token
 *
 * 소셜 로그인 OAuth 콜백 후 pending_auth_token HttpOnly 쿠키에 담긴
 * JWT를 클라이언트로 안전하게 전달합니다.
 * 쿠키는 일회성으로 이 응답에서 즉시 삭제됩니다.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('pending_auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: '교환할 토큰이 없습니다.' }, { status: 404 });
  }

  const res = NextResponse.json({ token });
  // 일회성 쿠키 삭제
  res.cookies.delete('pending_auth_token');
  return res;
}

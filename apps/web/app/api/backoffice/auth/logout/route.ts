import { NextResponse } from 'next/server';

// POST /api/backoffice/auth/logout
// bo_session HttpOnly 쿠키를 삭제합니다.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('bo_session');
  return res;
}

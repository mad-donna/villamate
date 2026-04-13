import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

const PUBLIC_API = ['/api/auth/', '/api/cron/', '/api/pay/', '/api/backoffice/auth/'];

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function isAllowedOrigin(origin: string, req: NextRequest): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (process.env.NODE_ENV === 'development') {
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return true;
    }
  }

  if (appUrl && origin === appUrl) {
    return true;
  }

  // 동일 호스트 허용
  const reqHost = req.nextUrl.host;
  try {
    const originHost = new URL(origin).host;
    if (originHost === reqHost) return true;
  } catch {
    return false;
  }

  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith('/api/')) return NextResponse.next();
  if (PUBLIC_API.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // CSRF 방어: 변경 메서드에 대해 Origin/Referer 헤더 검증
  if (MUTATING_METHODS.has(req.method)) {
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');

    // Origin이 있으면 Origin 기준으로 검증
    if (origin) {
      if (!isAllowedOrigin(origin, req)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (referer) {
      // Origin 없고 Referer만 있는 경우 Referer의 origin 부분으로 검증
      try {
        const refererOrigin = new URL(referer).origin;
        if (!isAllowedOrigin(refererOrigin, req)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // Origin도 Referer도 없는 경우: 네이티브 앱 또는 서버 간 API 호출 허용.
      // Authorization 헤더가 있으면 CSRF 체크 통과 (실제 토큰 유효성은 아래에서 검증).
      // 주의: 이 경로는 탈취된 JWT로도 우회 가능하므로,
      //        쿠키 기반 인증 도입 시 반드시 재검토 필요.
      const hasAuth = req.headers.get('authorization');
      if (!hasAuth) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const headers = new Headers(req.headers);
  headers.set('x-user-id', payload.sub);
  headers.set('x-user-role', payload.role);
  headers.set('x-user-email', payload.email);
  if (payload.villaId) headers.set('x-user-villa-id', payload.villaId);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: '/api/:path*',
};

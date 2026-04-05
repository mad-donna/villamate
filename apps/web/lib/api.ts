import { NextRequest } from 'next/server';
import { verifyToken, JwtPayload } from './auth';

/**
 * 요청 헤더에서 JWT를 파싱하여 payload를 반환합니다.
 * 미들웨어에서 이미 검증된 경우 x-user-* 헤더를 우선 사용하고,
 * 없으면 Authorization 헤더에서 직접 파싱합니다.
 */
export async function getUser(req: NextRequest): Promise<JwtPayload | null> {
  // 미들웨어가 주입한 헤더를 우선 사용
  const userId = req.headers.get('x-user-id');
  const userRole = req.headers.get('x-user-role');
  const userEmail = req.headers.get('x-user-email');
  const villaId = req.headers.get('x-user-villa-id');

  if (userId && userRole && userEmail) {
    return {
      sub: userId,
      email: userEmail,
      role: userRole,
      villaId: villaId ?? undefined,
    };
  }

  // 폴백: Authorization 헤더에서 직접 파싱
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
}

/**
 * 성공 JSON 응답을 반환합니다.
 */
export function ok(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

/**
 * 에러 JSON 응답을 반환합니다.
 */
export function err(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

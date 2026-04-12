/**
 * 테스트용 NextRequest 팩토리
 * Next.js App Router route handler를 직접 호출하기 위한 헬퍼.
 */

/** NextRequest를 흉내낸 최소 구현 (jest 환경에서 next/server 없이 동작) */
export function makeRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
): Request {
  const { method = 'GET', body, headers = {} } = options;
  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  return new Request(`http://localhost${url}`, init);
}

/** JWT 없이 x-user-* 헤더로 인증을 주입 (미들웨어 우선 경로 활용) */
export function authHeaders(opts: {
  sub: string;
  email?: string;
  role?: string;
  villaId?: string;
}): Record<string, string> {
  return {
    'x-user-id': opts.sub,
    'x-user-email': opts.email ?? 'test@example.com',
    'x-user-role': opts.role ?? 'RESIDENT',
    ...(opts.villaId ? { 'x-user-villa-id': opts.villaId } : {}),
  };
}

/** JSON 응답 파싱 헬퍼 */
export async function json<T = unknown>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

import { SignJWT, jwtVerify } from 'jose';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다. 프로덕션에서는 필수입니다.');
}
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-me');
const EXPIRES_IN = '30d';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  villaId?: string;
  needsSetup?: boolean;
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
      villaId: payload.villaId as string | undefined,
    };
  } catch {
    return null;
  }
}

import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { ok, err } from '@/lib/api';

/**
 * GET /api/villas/[villaId]/vehicles/qr-verify?token=...
 *
 * QR 토큰 유효성만 검사합니다. DB 레코드는 생성하지 않습니다.
 * 인증 불필요 (middleware PUBLIC_PATH_PATTERNS에 등록).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const { villaId } = await params;
    const token = req.nextUrl.searchParams.get('token');

    if (!token) return err('토큰이 필요합니다.', 400);

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET ?? 'villamate-secret-key',
    );

    let payload: { villaId?: string; purpose?: string };
    try {
      const { payload: p } = await jwtVerify(token, secret);
      payload = p as { villaId?: string; purpose?: string };
    } catch {
      return err('유효하지 않거나 만료된 QR 코드입니다.', 401);
    }

    if (payload.purpose !== 'visitor-vehicle' || payload.villaId !== villaId) {
      return err('유효하지 않은 QR 코드입니다.', 401);
    }

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { name: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);

    return ok({ valid: true, villaName: villa.name });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

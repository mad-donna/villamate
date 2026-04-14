import { NextRequest } from 'next/server';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET: QR 방문 등록용 단기 토큰 발급 (관리자 전용, 24h 유효)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { id: true, adminId: true, name: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('관리자만 QR 코드를 생성할 수 있습니다.', 403);

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET ?? 'villamate-secret-key',
    );

    const token = await new SignJWT({ villaId, purpose: 'visitor-vehicle' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .setIssuedAt()
      .sign(secret);

    return ok({ token, villaName: villa.name });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

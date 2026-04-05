import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

function diffInDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

// GET — 구독 현황 조회 (ADMIN 전용)
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
      select: { id: true, adminId: true, subscriptionStatus: true, subscriptionExpiry: true },
    });

    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

    const now = new Date();
    const daysRemaining =
      villa.subscriptionExpiry != null
        ? Math.max(0, diffInDays(villa.subscriptionExpiry, now))
        : null;

    return ok({
      subscriptionStatus: villa.subscriptionStatus,
      subscriptionExpiry: villa.subscriptionExpiry,
      daysRemaining,
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

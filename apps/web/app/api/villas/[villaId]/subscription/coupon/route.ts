import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// POST — 쿠폰 코드로 구독 활성화 (ADMIN 전용)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;

    // 빌라 조회 및 관리자 권한 확인
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { id: true, adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

    const body = await req.json();
    const { code } = body as { code?: string };
    if (!code || typeof code !== 'string' || code.trim() === '') {
      return err('쿠폰 코드를 입력해주세요.', 400);
    }

    const now = new Date();

    // 유효한 쿠폰 조회 — 미사용이며 만료되지 않은 것
    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.trim(),
        isUsed: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });

    if (!coupon) return err('유효하지 않은 쿠폰입니다.', 404);

    // 구독 만료일 계산
    const subscriptionExpiry = new Date(now);
    subscriptionExpiry.setDate(subscriptionExpiry.getDate() + coupon.extensionDays);

    // 트랜잭션으로 쿠폰 사용 처리 + 구독 활성화 동시 수행
    await prisma.$transaction([
      prisma.coupon.update({
        where: { id: coupon.id },
        data: { isUsed: true, usedByVillaId: villaId },
      }),
      prisma.villa.update({
        where: { id: villaId },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiry,
        },
      }),
    ]);

    return ok({ subscriptionStatus: 'ACTIVE', subscriptionExpiry });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

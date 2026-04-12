import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// PATCH: 빌라 구독 상태 수동 변경 (SUPER_ADMIN)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const { id } = await params;
    const body = (await req.json()) as {
      subscriptionStatus?: 'FREE_TRIAL' | 'ACTIVE' | 'EXPIRED';
      subscriptionExpiry?: string | null;
    };

    const villa = await prisma.villa.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);

    const VALID_STATUSES = ['FREE_TRIAL', 'ACTIVE', 'EXPIRED'];
    if (
      body.subscriptionStatus !== undefined &&
      !VALID_STATUSES.includes(body.subscriptionStatus)
    ) {
      return err('올바른 구독 상태를 선택해주세요.', 400);
    }

    let expiry: Date | null | undefined;
    if (body.subscriptionExpiry !== undefined) {
      if (body.subscriptionExpiry === null) {
        expiry = null;
      } else {
        expiry = new Date(body.subscriptionExpiry);
        if (isNaN(expiry.getTime())) return err('만료일 형식이 올바르지 않습니다.', 400);
      }
    }

    const updated = await prisma.villa.update({
      where: { id },
      data: {
        ...(body.subscriptionStatus ? { subscriptionStatus: body.subscriptionStatus } : {}),
        ...(expiry !== undefined ? { subscriptionExpiry: expiry } : {}),
      },
      select: {
        id: true,
        name: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
      },
    });

    return ok(updated);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// PATCH — 관리자가 외부 청구 상태를 수동으로 COMPLETED로 처리 (ADMIN 전용)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; billId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

    const { villaId, billId } = await params;

    // 본인 빌라 확인
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

    const billing = await prisma.externalBilling.findUnique({
      where: { id: billId },
    });
    if (!billing) return err('청구서를 찾을 수 없습니다.', 404);
    if (billing.villaId !== villaId) return err('해당 빌라의 청구서가 아닙니다.', 403);
    if (billing.status === 'COMPLETED') return err('이미 완료된 청구서입니다.', 400);

    const updated = await prisma.externalBilling.update({
      where: { id: billId },
      data: { status: 'COMPLETED' },
    });

    // 장부 자동 기록
    await prisma.ledgerTransaction.create({
      data: {
        villaId,
        type: 'INCOME',
        amount: Number(billing.amount),
        description: `외부청구 수납 - ${billing.targetName} (${billing.description})`,
        transactionDate: new Date(),
        createdBy: 'system',
      },
    });

    return ok({ billing: updated });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

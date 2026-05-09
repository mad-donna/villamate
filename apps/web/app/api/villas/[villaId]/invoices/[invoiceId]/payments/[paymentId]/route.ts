import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// PATCH — 납부 상태 변경 (ADMIN 수동 납부 확인)
export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ villaId: string; invoiceId: string; paymentId: string }>;
  },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId, invoiceId, paymentId } = await params;

    // ADMIN 권한 확인
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

    const body = await req.json();
    const { status } = body;

    const allowedStatuses = ['PAID', 'PENDING', 'OVERDUE'];
    if (!status || !allowedStatuses.includes(status)) {
      return err('유효하지 않은 상태값입니다. (PAID, PENDING, OVERDUE)', 400);
    }

    // 납부 내역 존재 확인
    const existing = await prisma.invoicePayment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: { select: { billingMonth: true } },
      },
    });
    if (!existing) return err('납부 내역을 찾을 수 없습니다.', 404);
    if (existing.invoiceId !== invoiceId) return err('권한이 없습니다.', 403);

    const wasPaid = existing.status === 'PAID';
    const becomesPaid = status === 'PAID' && !wasPaid;
    const becomesUnpaid = wasPaid && status !== 'PAID';
    const now = new Date();

    const [payment] = await prisma.$transaction([
      prisma.invoicePayment.update({
        where: { id: paymentId },
        data: {
          status,
          paidAt: status === 'PAID' ? now : null,
        },
      }),
      ...(becomesPaid
        ? [
            prisma.ledgerTransaction.create({
              data: {
                villaId,
                type: 'INCOME',
                amount: Number(existing.amount),
                description: `${existing.invoice.billingMonth} 관리비 수납 - ${existing.roomNumber}호`,
                transactionDate: now,
                createdBy: 'system',
              },
            }),
          ]
        : []),
      ...(becomesUnpaid
        ? [
            prisma.ledgerTransaction.create({
              data: {
                villaId,
                type: 'EXPENSE',
                amount: Number(existing.amount),
                description: `${existing.invoice.billingMonth} 관리비 수납 취소 - ${existing.roomNumber}호`,
                transactionDate: now,
                createdBy: 'system',
              },
            }),
          ]
        : []),
    ]);

    return ok({ payment });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

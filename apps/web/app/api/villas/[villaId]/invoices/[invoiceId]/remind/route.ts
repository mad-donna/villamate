import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';
import { createNotification } from '@/lib/notify';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; invoiceId: string }> },
) {
  const user = await getUser(req);
  if (!user) return err('인증이 필요합니다.', 401);
  if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

  const { villaId, invoiceId } = await params;

  // 해당 빌라의 관리자인지 확인
  const villa = await prisma.villa.findUnique({
    where: { id: villaId },
    select: { adminId: true },
  });
  if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
  if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

  // 오늘 이미 독촉 알림을 발송했는지 확인 (쿨타임: 1일 1회)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const existing = await prisma.notification.findFirst({
    where: {
      villaId,
      type: 'PAYMENT_REMINDER',
      createdAt: { gte: todayStart },
      body: { contains: invoiceId },
    },
  });

  if (existing) {
    return err('오늘 이미 독촉 알림을 발송했습니다.', 429);
  }

  // 해당 청구서의 미납(PENDING) 결제 조회
  const pendingPayments = await prisma.invoicePayment.findMany({
    where: {
      invoiceId,
      status: 'PENDING',
    },
    include: {
      residentRecord: { select: { userId: true } },
      invoice: { select: { billingMonth: true } },
    },
  });

  let reminded = 0;

  for (const payment of pendingPayments) {
    if (!payment.residentRecord) continue;

    await createNotification({
      userId: payment.residentRecord.userId,
      villaId,
      type: 'PAYMENT_REMINDER',
      title: '관리비 납부 독촉 안내',
      body: `${payment.invoice.billingMonth} 관리비가 아직 미납 상태입니다. 납부를 확인해주세요. (payment:${payment.id}, invoice:${invoiceId})`,
    });
    reminded++;
  }

  return ok({ reminded });
}

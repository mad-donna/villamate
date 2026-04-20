import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notify';

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[invoice-reminder] CRON_SECRET 환경변수가 설정되지 않았습니다.');
    return Response.json({ error: 'Server misconfiguration' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  // 3일차: createdAt이 3~6일 전인 PENDING 결제
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const sixDaysAgo = new Date(now);
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

  // 7일차: createdAt이 7~13일 전인 PENDING 결제
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirteenDaysAgo = new Date(now);
  thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 13);

  // 3일차 대상 조회 — InvoicePayment에 createdAt이 없으므로 Invoice.createdAt 기준으로 필터링
  const threeDayTargets = await prisma.invoicePayment.findMany({
    where: {
      status: 'PENDING',
      amount: { gt: 0 },
      invoice: { createdAt: { gte: sixDaysAgo, lte: threeDaysAgo } },
    },
    include: {
      residentRecord: { select: { userId: true, villaId: true } },
      invoice: { select: { billingMonth: true } },
    },
  });

  // 7일차 대상 조회
  const sevenDayTargets = await prisma.invoicePayment.findMany({
    where: {
      status: 'PENDING',
      amount: { gt: 0 },
      invoice: { createdAt: { gte: thirteenDaysAgo, lte: sevenDaysAgo } },
    },
    include: {
      residentRecord: { select: { userId: true, villaId: true } },
      invoice: { select: { billingMonth: true } },
    },
  });

  let reminded = 0;

  // 3일차: 이미 발송된 알림을 단일 쿼리로 조회 (N+1 방지)
  const threeDayPaymentIds = threeDayTargets
    .filter((p) => p.residentRecord)
    .map((p) => p.id);

  const existingThreeDay = threeDayPaymentIds.length > 0
    ? await prisma.notification.findMany({
        where: {
          type: 'PAYMENT_REMINDER',
          OR: threeDayPaymentIds.map((id) => ({ body: { contains: id } })),
        },
        select: { body: true },
      })
    : [];
  const sentThreeDayIds = new Set(
    existingThreeDay.flatMap((n) => {
      const match = n.body.match(/payment:([^\s)]+)/);
      return match ? [match[1]] : [];
    }),
  );

  for (const payment of threeDayTargets) {
    if (!payment.residentRecord) continue;
    if (sentThreeDayIds.has(payment.id)) continue;

    await createNotification({
      userId: payment.residentRecord.userId,
      villaId: payment.residentRecord.villaId,
      type: 'PAYMENT_REMINDER',
      title: '관리비 미납 안내',
      body: `${payment.invoice.billingMonth} 관리비가 아직 미납 상태입니다. 납부를 확인해주세요. (payment:${payment.id})`,
    });
    reminded++;
  }

  // 7일차: 이미 발송된 최종 알림을 단일 쿼리로 조회 (N+1 방지)
  const sevenDayPaymentIds = sevenDayTargets
    .filter((p) => p.residentRecord)
    .map((p) => p.id);

  const existingSevenDay = sevenDayPaymentIds.length > 0
    ? await prisma.notification.findMany({
        where: {
          type: 'PAYMENT_REMINDER',
          title: { contains: '최종' },
          OR: sevenDayPaymentIds.map((id) => ({ body: { contains: id } })),
        },
        select: { body: true },
      })
    : [];
  const sentSevenDayIds = new Set(
    existingSevenDay.flatMap((n) => {
      const match = n.body.match(/payment:([^\s)]+)/);
      return match ? [match[1]] : [];
    }),
  );

  for (const payment of sevenDayTargets) {
    if (!payment.residentRecord) continue;
    if (sentSevenDayIds.has(payment.id)) continue;

    await createNotification({
      userId: payment.residentRecord.userId,
      villaId: payment.residentRecord.villaId,
      type: 'PAYMENT_REMINDER',
      title: '[최종 안내] 관리비 납부를 확인해주세요.',
      body: `${payment.invoice.billingMonth} 관리비 납부 기한이 7일이 지났습니다. 빠른 납부 부탁드립니다. (payment:${payment.id})`,
    });
    reminded++;
  }

  return Response.json({ ok: true, reminded });
}

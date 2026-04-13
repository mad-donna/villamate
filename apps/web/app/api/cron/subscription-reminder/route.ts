import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/cron/subscription-reminder
 * Vercel Cron: "0 15 * * *" (매일 00:00 KST)
 *
 * 구독 만료 D-7, D-3, D-1 시점에 해당 빌라 관리자(ADMIN)에게 사전 알림을 발송합니다.
 * - 이미 EXPIRED 상태인 빌라는 제외 (expire-subscriptions Cron 담당)
 */
export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return Response.json({ error: 'Server misconfiguration' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  // D-7, D-3, D-1 기준 날짜 범위 (당일 00:00 ~ 23:59 UTC)
  const reminderDays = [7, 3, 1];

  const notifications: { userId: string; villaId: string; title: string; body: string }[] = [];

  for (const daysLeft of reminderDays) {
    const from = new Date(now);
    from.setUTCHours(0, 0, 0, 0);
    from.setDate(from.getDate() + daysLeft);

    const to = new Date(from);
    to.setUTCHours(23, 59, 59, 999);

    const villas = await prisma.villa.findMany({
      where: {
        subscriptionExpiry: { gte: from, lte: to },
        subscriptionStatus: { not: 'EXPIRED' },
      },
      select: { id: true, name: true, adminId: true },
    });

    for (const villa of villas) {
      notifications.push({
        userId: villa.adminId,
        villaId: villa.id,
        title: `구독 만료 ${daysLeft}일 전`,
        body: `${villa.name}의 구독이 ${daysLeft}일 후 만료됩니다. 서비스 중단을 방지하려면 지금 갱신해주세요.`,
      });
    }
  }

  if (notifications.length === 0) {
    return Response.json({ ok: true, sent: 0 });
  }

  await prisma.notification.createMany({
    data: notifications.map((n) => ({
      userId: n.userId,
      villaId: n.villaId,
      type: 'SYSTEM' as const,
      title: n.title,
      body: n.body,
    })),
  });

  return Response.json({ ok: true, sent: notifications.length });
}

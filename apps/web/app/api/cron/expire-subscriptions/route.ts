import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notify';

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[expire-subscriptions] CRON_SECRET 환경변수가 설정되지 않았습니다.');
    return Response.json({ error: 'Server misconfiguration' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  const expiredVillas = await prisma.villa.findMany({
    where: {
      subscriptionExpiry: { lt: now },
      subscriptionStatus: { not: 'EXPIRED' },
    },
    select: {
      id: true,
      name: true,
      adminId: true,
    },
  });

  if (expiredVillas.length === 0) {
    return Response.json({ ok: true, expired: 0 });
  }

  // 만료 상태로 일괄 업데이트
  await prisma.villa.updateMany({
    where: { id: { in: expiredVillas.map((v) => v.id) } },
    data: { subscriptionStatus: 'EXPIRED' },
  });

  // 각 ADMIN에게 시스템 알림 생성
  for (const villa of expiredVillas) {
    await createNotification({
      userId: villa.adminId,
      villaId: villa.id,
      type: 'SYSTEM',
      title: '구독이 만료되었습니다.',
      body: `${villa.name}의 구독이 만료되었습니다. 서비스를 계속 이용하시려면 구독을 갱신해주세요.`,
    }).catch((e) => console.error(`[expire-subscriptions] 알림 실패 villaId=${villa.id}`, e));
  }

  return Response.json({ ok: true, expired: expiredVillas.length });
}

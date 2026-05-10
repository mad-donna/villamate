import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/cron/poll-reminder
 * Vercel Cron: "0 15 * * *" (매일 15:00 UTC = 00:00 KST)
 *
 * 마감 24시간 이내인 진행 중인 투표의 미참여 HEAD 세대주에게 독촉 알림을 자동 발송합니다.
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
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // 마감 24시간 이내이며 아직 마감 안 된 투표
  const polls = await prisma.poll.findMany({
    where: {
      endDate: { gt: now, lte: in24h },
    },
    select: {
      id: true,
      title: true,
      villaId: true,
      votes: { select: { roomNumber: true } },
    },
  });

  let totalSent = 0;

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  for (const poll of polls) {
    const votedRooms = new Set(poll.votes.map((v) => v.roomNumber));

    // 오늘 이미 이 투표 알림을 받은 유저 필터링
    const alreadyNotified = await prisma.notification.findMany({
      where: {
        villaId: poll.villaId,
        type: 'POLL',
        createdAt: { gte: todayStart },
        body: { contains: `"${poll.title}"` },
      },
      select: { userId: true },
    });
    const alreadyNotifiedIds = new Set(alreadyNotified.map((n) => n.userId));

    // 미참여 HEAD 세대주 (오늘 이미 알림 받은 유저 제외)
    const nonVoters = await prisma.residentRecord.findMany({
      where: {
        villaId: poll.villaId,
        residentType: 'HEAD',
        status: 'APPROVED',
        ...(votedRooms.size > 0 ? { roomNumber: { notIn: [...votedRooms] } } : {}),
        ...(alreadyNotifiedIds.size > 0 ? { userId: { notIn: [...alreadyNotifiedIds] } } : {}),
      },
      select: { userId: true },
    });

    if (nonVoters.length === 0) continue;

    await prisma.notification.createMany({
      data: nonVoters.map((r) => ({
        userId: r.userId,
        villaId: poll.villaId,
        type: 'POLL' as const,
        title: '투표 마감이 임박했습니다',
        body: `"${poll.title}" 투표가 24시간 이내에 마감됩니다. 지금 바로 참여해주세요.`,
      })),
    });

    totalSent += nonVoters.length;
  }

  return Response.json({ ok: true, pollsChecked: polls.length, notificationsSent: totalSent });
}

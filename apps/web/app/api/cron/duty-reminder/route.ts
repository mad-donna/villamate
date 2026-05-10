import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notify';

function getTodayKST(): Date {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getCurrentDutyUnit(units: string[], startDate: Date, intervalDays: number): string | null {
  if (!units.length) return null;
  const today = getTodayKST();
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceStart < 0) return null;
  const periodIndex = Math.floor(daysSinceStart / intervalDays);
  return units[periodIndex % units.length];
}

function isDutyStartDay(startDate: Date, intervalDays: number): boolean {
  const today = getTodayKST();
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return daysSinceStart >= 0 && daysSinceStart % intervalDays === 0;
}

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return Response.json({ error: 'Server misconfiguration' }, { status: 500 });
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${cronSecret}`) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let dutySent = 0;
  let inspectionSent = 0;

  // 1. 당번 알림 — 당번 교체일에만 발송
  const schedules = await prisma.dutySchedule.findMany({
    where: { isActive: true },
    include: { villa: { select: { adminId: true } } },
  });

  const todayStart = getTodayKST();
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  for (const schedule of schedules) {
    try {
      const intervalDays = schedule.interval === 'WEEKLY' ? 7 : 14;
      if (!isDutyStartDay(schedule.startDate, intervalDays)) continue;

      const currentUnit = getCurrentDutyUnit(schedule.units, schedule.startDate, intervalDays);
      if (!currentUnit) continue;

      // 오늘 이미 이 빌라에 당번 알림 발송 여부 확인 (Cron 재시도 중복 방지)
      const alreadySent = await prisma.notification.findFirst({
        where: {
          villaId: schedule.villaId,
          type: 'SYSTEM',
          title: { contains: '당번 안내' },
          createdAt: { gte: todayStart, lt: todayEnd },
        },
      });
      if (alreadySent) continue;

      const intervalLabel = schedule.interval === 'WEEKLY' ? '이번 주' : '이번 격주';
      const residents = await prisma.residentRecord.findMany({
        where: { villaId: schedule.villaId, roomNumber: currentUnit, status: 'APPROVED' },
        select: { userId: true },
      });

      for (const resident of residents) {
        await createNotification({
          userId: resident.userId,
          villaId: schedule.villaId,
          type: 'SYSTEM',
          title: `${intervalLabel} 당번 안내`,
          body: `${currentUnit}호가 ${intervalLabel} 공동 당번입니다. 공용 공간 청소 등 당번 활동을 부탁드립니다.`,
        });
        dutySent++;
      }
    } catch {
      // 단일 빌라 오류가 전체 Cron을 멈추지 않도록 스킵
    }
  }

  // 2. 정기 점검 리마인더 — D-30 또는 D-7
  const rules = await prisma.dutyRule.findMany({
    where: { isActive: true },
    include: { villa: { select: { adminId: true } } },
  });

  for (const rule of rules) {
    try {
      if (!rule.lastInspectedAt) continue;

      const next = new Date(rule.lastInspectedAt);
      next.setDate(next.getDate() + rule.intervalDays);
      next.setHours(0, 0, 0, 0);

      const daysUntil = Math.floor((next.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil === 30 || daysUntil === 7) {
        const title = `[D-${daysUntil}] ${rule.name} 점검 예정`;

        // 오늘 이미 동일한 점검 알림 발송 여부 확인
        const alreadySent = await prisma.notification.findFirst({
          where: {
            userId: rule.villa.adminId,
            villaId: rule.villaId,
            type: 'SYSTEM',
            title,
            createdAt: { gte: todayStart, lt: todayEnd },
          },
        });
        if (alreadySent) continue;

        await createNotification({
          userId: rule.villa.adminId,
          villaId: rule.villaId,
          type: 'SYSTEM',
          title,
          body: `${rule.name} 점검일이 ${daysUntil}일 후입니다. 사전 준비를 시작해주세요.`,
        });
        inspectionSent++;
      }
    } catch {
      // 단일 규칙 오류가 전체 Cron을 멈추지 않도록 스킵
    }
  }

  return Response.json({ ok: true, dutySent, inspectionSent });
}

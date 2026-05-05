import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notify';

function getCurrentDutyUnit(units: string[], startDate: Date, intervalDays: number): string | null {
  if (!units.length) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceStart < 0) return null;
  const periodIndex = Math.floor(daysSinceStart / intervalDays);
  return units[periodIndex % units.length];
}

function isDutyStartDay(startDate: Date, intervalDays: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
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

  for (const schedule of schedules) {
    const intervalDays = schedule.interval === 'WEEKLY' ? 7 : 14;
    if (!isDutyStartDay(schedule.startDate, intervalDays)) continue;

    const currentUnit = getCurrentDutyUnit(schedule.units, schedule.startDate, intervalDays);
    if (!currentUnit) continue;

    const residents = await prisma.residentRecord.findMany({
      where: { villaId: schedule.villaId, roomNumber: currentUnit, status: 'APPROVED' },
      select: { userId: true },
    });

    for (const resident of residents) {
      await createNotification({
        userId: resident.userId,
        villaId: schedule.villaId,
        type: 'SYSTEM',
        title: '이번 주 당번 안내',
        body: `${currentUnit}호가 이번 주 공동 당번입니다. 공용 공간 청소 등 당번 활동을 부탁드립니다.`,
      });
      dutySent++;
    }
  }

  // 2. 정기 점검 리마인더 — D-30 또는 D-7
  const rules = await prisma.dutyRule.findMany({
    where: { isActive: true },
    include: { villa: { select: { adminId: true } } },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const rule of rules) {
    if (!rule.lastInspectedAt) continue;

    const next = new Date(rule.lastInspectedAt);
    next.setDate(next.getDate() + rule.intervalDays);
    next.setHours(0, 0, 0, 0);

    const daysUntil = Math.floor((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil === 30 || daysUntil === 7) {
      await createNotification({
        userId: rule.villa.adminId,
        villaId: rule.villaId,
        type: 'SYSTEM',
        title: `[D-${daysUntil}] ${rule.name} 점검 예정`,
        body: `${rule.name} 점검일이 ${daysUntil}일 후입니다. 사전 준비를 시작해주세요.`,
      });
      inspectionSent++;
    }
  }

  return Response.json({ ok: true, dutySent, inspectionSent });
}

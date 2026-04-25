import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);

  const record = await prisma.residentRecord.findFirst({
    where: { userId: user.sub, status: 'APPROVED' },
    orderBy: { joinedAt: 'desc' },
  });
  if (!record) return err('입주민 정보를 찾을 수 없습니다.', 404);

  // KST 기준 오늘 날짜
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const facilities = await prisma.facility.findMany({
    where: { villaId: record.villaId, isActive: true },
    include: {
      reservations: {
        where: { date: { gte: today } },
        select: { id: true, userId: true, roomNumber: true, date: true, startTime: true, endTime: true, note: true },
        orderBy: { date: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return ok({ facilities, today });
}

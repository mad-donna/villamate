import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);

  const record = await prisma.residentRecord.findFirst({
    where: { userId: user.sub, status: 'APPROVED' },
    orderBy: { joinedAt: 'desc' },
  });
  if (!record) return err('입주민 정보를 찾을 수 없습니다.', 404);

  const { id: facilityId } = await params;
  const facility = await prisma.facility.findFirst({
    where: { id: facilityId, villaId: record.villaId, isActive: true },
  });
  if (!facility) return err('시설을 찾을 수 없습니다.', 404);

  const body = await req.json() as {
    date?: string;
    timeSlot?: string;
    note?: string;
  };

  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return err('날짜를 올바르게 입력해주세요. (YYYY-MM-DD)');
  }

  // 당일 예약 횟수 제한 확인
  const todayCount = await prisma.facilityReservation.count({
    where: { facilityId, userId: user.sub, date: body.date },
  });
  if (todayCount >= facility.maxPerDay) {
    return err(`하루 최대 ${facility.maxPerDay}회까지 예약할 수 있습니다.`);
  }

  const reservation = await prisma.facilityReservation.create({
    data: {
      facilityId,
      userId: user.sub,
      villaId: record.villaId,
      roomNumber: record.roomNumber,
      date: body.date,
      timeSlot: body.timeSlot?.trim() ?? null,
      note: body.note?.trim() ?? null,
    },
  });

  return ok(reservation, 201);
}

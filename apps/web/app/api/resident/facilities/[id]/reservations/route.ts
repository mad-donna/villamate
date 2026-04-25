import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

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
    startTime?: string;
    endTime?: string;
    note?: string;
  };

  if (!body.date || !DATE_RE.test(body.date)) {
    return err('날짜를 올바르게 입력해주세요. (YYYY-MM-DD)');
  }

  const todayKST = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (body.date < todayKST) {
    return err('과거 날짜에는 예약할 수 없습니다.');
  }

  if (!body.startTime || !TIME_RE.test(body.startTime)) return err('시작 시간을 올바르게 입력해주세요. (HH:MM)');
  if (!body.endTime || !TIME_RE.test(body.endTime)) return err('종료 시간을 올바르게 입력해주세요. (HH:MM)');
  if (body.startTime >= body.endTime) return err('종료 시간은 시작 시간보다 늦어야 합니다.');

  if (facility.openTime && body.startTime < facility.openTime) {
    return err(`운영 시작 시간(${facility.openTime}) 이후로 예약해주세요.`);
  }
  if (facility.closeTime && body.endTime > facility.closeTime) {
    return err(`운영 종료 시간(${facility.closeTime}) 이전으로 예약해주세요.`);
  }

  // 동시 예약 초과 확인: 시간이 겹치는 예약 수
  const overlapping = await prisma.facilityReservation.count({
    where: {
      facilityId,
      date: body.date,
      startTime: { lt: body.endTime },
      endTime: { gt: body.startTime },
    },
  });
  if (overlapping >= facility.maxConcurrent) {
    return err(`해당 시간대는 이미 최대 ${facility.maxConcurrent}건 예약되었습니다.`);
  }

  const reservation = await prisma.facilityReservation.create({
    data: {
      facilityId,
      userId: user.sub,
      villaId: record.villaId,
      roomNumber: record.roomNumber,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      note: body.note?.trim() ?? null,
    },
  });

  return ok(reservation, 201);
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

    const { villaId } = await params;

    const villa = await prisma.villa.findUnique({ where: { id: villaId }, select: { adminId: true } });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

    const schedules = await prisma.dutySchedule.findMany({
      where: { villaId },
      orderBy: { createdAt: 'desc' },
    });

    return ok({ schedules });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

    const { villaId } = await params;

    const villa = await prisma.villa.findUnique({ where: { id: villaId }, select: { adminId: true } });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

    const body = await req.json() as { units?: string[]; startDate?: string; interval?: string };

    if (!body.units || body.units.length < 2) return err('당번 세대는 2개 이상이어야 합니다.', 400);
    if (!body.startDate) return err('시작일을 입력해주세요.', 400);
    if (!['WEEKLY', 'BIWEEKLY'].includes(body.interval ?? '')) return err('주기는 WEEKLY 또는 BIWEEKLY 이어야 합니다.', 400);

    const startDate = new Date(body.startDate);
    if (isNaN(startDate.getTime())) return err('유효하지 않은 날짜입니다.', 400);

    const [, schedule] = await prisma.$transaction([
      prisma.dutySchedule.updateMany({ where: { villaId, isActive: true }, data: { isActive: false } }),
      prisma.dutySchedule.create({
        data: {
          villaId,
          units: body.units,
          startDate,
          interval: body.interval as 'WEEKLY' | 'BIWEEKLY',
        },
      }),
    ]);

    return ok({ schedule }, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

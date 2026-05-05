import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; scheduleId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

    const { villaId, scheduleId } = await params;

    const villa = await prisma.villa.findUnique({ where: { id: villaId }, select: { adminId: true } });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

    const schedule = await prisma.dutySchedule.findFirst({ where: { id: scheduleId, villaId } });
    if (!schedule) return err('스케줄을 찾을 수 없습니다.', 404);

    await prisma.dutySchedule.delete({ where: { id: scheduleId } });

    return ok({ message: '삭제되었습니다.' });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

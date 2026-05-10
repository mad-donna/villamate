import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';
import { createNotification } from '@/lib/notify';

const COOLDOWN_MS = 60 * 60 * 1000; // 1시간

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; vehicleId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId, vehicleId } = await params;

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('관리자만 사용할 수 있습니다.', 403);

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, villaId: true, ownerId: true, isVisitor: true, plateNumber: true, lastNudgedAt: true },
    });
    if (!vehicle || vehicle.villaId !== villaId) return err('차량을 찾을 수 없습니다.', 404);
    if (vehicle.isVisitor) return err('방문 차량에는 이동 요청을 보낼 수 없습니다.', 400);

    // 쿨타임 체크 (1시간)
    if (vehicle.lastNudgedAt && Date.now() - vehicle.lastNudgedAt.getTime() < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (Date.now() - vehicle.lastNudgedAt.getTime())) / 60000);
      return err(`${remaining}분 후에 다시 요청할 수 있습니다.`, 429);
    }

    // 쿨타임 갱신을 먼저 처리 — 알림 실패 시에도 중복 발송 방지
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { lastNudgedAt: new Date() },
    });
    await createNotification({
      userId: vehicle.ownerId,
      villaId,
      type: 'SYSTEM',
      title: '차량 이동 요청',
      body: `${vehicle.plateNumber} 차량 이동을 부탁드립니다. (빌라메이트를 통해 전달된 익명 요청입니다)`,
    });

    return ok({ message: '이동 요청을 전송했습니다.' });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

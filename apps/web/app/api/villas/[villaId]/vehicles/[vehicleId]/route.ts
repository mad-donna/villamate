import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// DELETE — 차량 삭제 (본인 등록 차량 또는 관리자)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; vehicleId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId, vehicleId } = await params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, villaId: true, ownerId: true },
    });

    if (!vehicle || vehicle.villaId !== villaId) return err('차량을 찾을 수 없습니다.', 404);

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { adminId: true },
    });
    const isAdmin = villa?.adminId === user.sub;

    if (!isAdmin && vehicle.ownerId !== user.sub) {
      return err('삭제 권한이 없습니다.', 403);
    }

    await prisma.vehicle.delete({ where: { id: vehicleId } });

    return ok({ message: '차량이 삭제되었습니다.' });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

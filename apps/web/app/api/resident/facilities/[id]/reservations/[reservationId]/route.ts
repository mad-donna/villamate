import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; reservationId: string }> }
) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);

  const { reservationId } = await params;

  const reservation = await prisma.facilityReservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) return err('예약을 찾을 수 없습니다.', 404);
  if (reservation.userId !== user.sub) return err('본인의 예약만 취소할 수 있습니다.', 403);

  await prisma.facilityReservation.delete({ where: { id: reservationId } });
  return ok({ message: '예약이 취소되었습니다.' });
}

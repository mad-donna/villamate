import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);
  if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

  const { id } = await params;
  const facility = await prisma.facility.findFirst({
    where: { id, villa: { adminId: user.sub } },
  });
  if (!facility) return err('시설을 찾을 수 없습니다.', 404);

  const { searchParams } = new URL(req.url);
  const dateFilter = searchParams.get('date');

  const reservations = await prisma.facilityReservation.findMany({
    where: {
      facilityId: id,
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    include: { user: { select: { id: true, name: true } } },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });

  return ok({ reservations });
}

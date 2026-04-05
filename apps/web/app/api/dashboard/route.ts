import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { searchParams } = new URL(req.url);
    const villaId = searchParams.get('villaId') ?? user.villaId;
    const role = searchParams.get('role') ?? user.role;

    if (!villaId) {
      return ok({ needsSetup: true });
    }

    if (role === 'ADMIN') {
      const villa = await prisma.villa.findUnique({
        where: { id: villaId },
        select: {
          id: true,
          name: true,
          address: true,
          subscriptionStatus: true,
          subscriptionExpiry: true,
        },
      });

      if (!villa) return ok({ needsSetup: true });

      const [totalResidents, unpaidCount, unpaidAgg, activePollsCount, latestPost] =
        await Promise.all([
          prisma.residentRecord.count({ where: { villaId } }),

          prisma.invoicePayment.count({
            where: { status: 'PENDING', residentRecord: { villaId } },
          }),

          prisma.invoicePayment.aggregate({
            where: {
              status: 'PENDING',
              residentRecord: { villaId },
            },
            _sum: { amount: true },
          }),

          prisma.poll.count({
            where: {
              villaId,
              endDate: { gt: new Date() },
            },
          }),

          prisma.post.findFirst({
            where: { villaId, isNotice: true },
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, createdAt: true },
          }),
        ]);

      return ok({
        role: 'ADMIN',
        villa,
        stats: {
          totalResidents,
          unpaidCount,
          unpaidAmount: Number(unpaidAgg._sum.amount ?? 0),
          activePollsCount,
          latestPost,
        },
      });
    }

    // RESIDENT
    const residentRecord = await prisma.residentRecord.findFirst({
      where: { userId: user.sub, villaId },
      select: { id: true, roomNumber: true },
    });

    if (!residentRecord) return ok({ needsSetup: true });

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { id: true, name: true, address: true },
    });

    if (!villa) return ok({ needsSetup: true });

    const [myUnpaidCount, myPaymentsAgg, activePollsCount, latestPost] = await Promise.all([
      prisma.invoicePayment.count({
        where: { residentRecordId: residentRecord.id, status: 'PENDING' },
      }),

      prisma.invoicePayment.aggregate({
        where: {
          residentRecordId: residentRecord.id,
          status: 'PENDING',
        },
        _sum: { amount: true },
      }),

      prisma.poll.count({
        where: {
          villaId,
          endDate: { gt: new Date() },
        },
      }),

      prisma.post.findFirst({
        where: { villaId, isNotice: true },
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true },
      }),
    ]);

    return ok({
      role: 'RESIDENT',
      villa,
      roomNumber: residentRecord.roomNumber,
      stats: {
        myUnpaidAmount: Number(myPaymentsAgg._sum.amount ?? 0),
        myUnpaidCount,
        activePollsCount,
        latestPost,
      },
    });
  } catch (e) {
    console.error('[dashboard]', e);
    return err('서버 오류가 발생했습니다.', 500);
  }
}

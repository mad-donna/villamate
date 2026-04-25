import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);
  if (user.role !== 'RESIDENT' && user.role !== 'ADMIN') return err('접근 권한이 없습니다.', 403);

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status') as 'PAID' | 'PENDING' | 'OVERDUE' | null;

  // 본인의 ResidentRecord 조회 (가장 최근 승인된 기록)
  const record = await prisma.residentRecord.findFirst({
    where: { userId: user.sub, status: 'APPROVED' },
    orderBy: { joinedAt: 'desc' },
  });

  if (!record) return err('입주민 정보를 찾을 수 없습니다.', 404);

  const where = {
    residentRecordId: record.id,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const payments = await prisma.invoicePayment.findMany({
    where,
    include: {
      invoice: {
        select: {
          id: true,
          billingMonth: true,
          type: true,
          memo: true,
        },
      },
    },
    orderBy: { invoice: { billingMonth: 'desc' } },
  });

  return ok({ payments, roomNumber: record.roomNumber });
}

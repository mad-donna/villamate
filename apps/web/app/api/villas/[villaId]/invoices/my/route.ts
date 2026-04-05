import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET — 내 청구서 목록 (RESIDENT 전용)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;

    // 본인의 ResidentRecord 확인
    const residentRecord = await prisma.residentRecord.findFirst({
      where: { villaId, userId: user.sub },
      select: { id: true },
    });

    if (!residentRecord) {
      return err('해당 빌라의 입주민이 아닙니다.', 403);
    }

    const payments = await prisma.invoicePayment.findMany({
      where: { residentRecordId: residentRecord.id },
      include: {
        invoice: {
          include: {
            items: {
              select: { name: true, amount: true },
            },
          },
        },
      },
      orderBy: {
        invoice: { billingMonth: 'desc' },
      },
    });

    return ok({
      payments: payments.map((p) => ({
        id: p.id,
        status: p.status,
        amount: p.amount,
        paidAt: p.paidAt,
        invoice: {
          id: p.invoice.id,
          billingMonth: p.invoice.billingMonth,
          type: p.invoice.type,
          memo: p.invoice.memo,
          items: p.invoice.items,
        },
      })),
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

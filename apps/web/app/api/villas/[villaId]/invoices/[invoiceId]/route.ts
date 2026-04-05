import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET — 청구서 상세 + 세대별 납부 현황 (ADMIN 전용)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; invoiceId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId, invoiceId } = await params;

    // ADMIN 권한 확인
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

    // 청구서 조회
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        payments: {
          include: {
            residentRecord: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
          orderBy: {
            residentRecord: { roomNumber: 'asc' },
          },
        },
      },
    });

    if (!invoice) return err('청구서를 찾을 수 없습니다.', 404);
    if (invoice.villaId !== villaId) return err('권한이 없습니다.', 403);

    // 요약 집계
    const paidPayments = invoice.payments.filter((p) => p.status === 'PAID');
    const unpaidPayments = invoice.payments.filter((p) => p.status !== 'PAID');

    const paidAmount = paidPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );
    const unpaidAmount = unpaidPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    return ok({
      invoice: {
        id: invoice.id,
        type: invoice.type,
        billingMonth: invoice.billingMonth,
        totalAmount: invoice.totalAmount,
        memo: invoice.memo,
        items: invoice.items,
        createdAt: invoice.createdAt,
      },
      payments: invoice.payments.map((p) => ({
        id: p.id,
        roomNumber: p.roomNumber,
        status: p.status,
        amount: p.amount,
        paidAt: p.paidAt,
        residentRecord: p.residentRecord
          ? {
              roomNumber: p.residentRecord.roomNumber,
              residentType: p.residentRecord.residentType,
              user: { name: p.residentRecord.user?.name ?? null },
            }
          : null,
      })),
      summary: {
        paidAmount,
        unpaidAmount,
        paidCount: paidPayments.length,
        unpaidCount: unpaidPayments.length,
      },
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

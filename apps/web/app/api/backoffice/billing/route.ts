import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET /api/backoffice/billing?month=2026-04&villaId=xxx
// 빌라별 청구서·납부 현황 (SUPER_ADMIN 전용)
export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // 'YYYY-MM' 형식, 없으면 전체
    const villaId = searchParams.get('villaId');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = 20;

    const invoices = await prisma.invoice.findMany({
      where: {
        ...(month ? { billingMonth: month } : {}),
        ...(villaId ? { villaId } : {}),
      },
      include: {
        villa: { select: { id: true, name: true } },
        payments: { select: { status: true, amount: true, roomNumber: true } },
      },
      orderBy: [{ billingMonth: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit + 1,
    });

    const hasMore = invoices.length > limit;
    if (hasMore) invoices.pop();

    const result = invoices.map((inv) => {
      const total = parseFloat(inv.totalAmount.toString());
      const paid = inv.payments
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
      const paidCount = inv.payments.filter((p) => p.status === 'PAID').length;
      const totalCount = inv.payments.length;

      return {
        id: inv.id,
        villaId: inv.villaId,
        villaName: inv.villa.name,
        billingMonth: inv.billingMonth,
        type: inv.type,
        totalAmount: total,
        paidAmount: paid,
        paidCount,
        totalCount,
        paidRate: totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0,
        createdAt: inv.createdAt,
      };
    });

    // 전체 집계
    const totalInvoiceCount = await prisma.invoice.count({
      where: {
        ...(month ? { billingMonth: month } : {}),
        ...(villaId ? { villaId } : {}),
      },
    });

    return ok({ invoices: result, hasMore, total: totalInvoiceCount });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

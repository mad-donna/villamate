import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);
  if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

  const villaId = user.villaId;
  if (!villaId) return err('빌라 정보를 찾을 수 없습니다.', 404);

  // 이번 달 납부율 계산
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 최근 6개월 월 목록 생성
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const [allPayments, paidPayments, invoices] = await Promise.all([
    // 이번 달 전체 payments 수
    prisma.invoicePayment.count({
      where: { invoice: { villaId, billingMonth: currentMonth } },
    }),
    // 이번 달 완납 payments 수
    prisma.invoicePayment.count({
      where: { invoice: { villaId, billingMonth: currentMonth }, status: 'PAID' },
    }),
    // 최근 6개월 청구서별 완납 수금액
    prisma.invoice.findMany({
      where: { villaId, billingMonth: { in: months } },
      select: {
        billingMonth: true,
        payments: {
          where: { status: 'PAID' },
          select: { amount: true },
        },
      },
    }),
  ]);

  const monthlyCollection = months.map((month) => {
    const monthInvoices = invoices.filter((inv) => inv.billingMonth === month);
    const total = monthInvoices.reduce((sum, inv) => {
      return sum + inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    }, 0);
    return { month, amount: total };
  });

  const paymentRate = allPayments > 0 ? Math.round((paidPayments / allPayments) * 100) : 0;

  return ok({
    currentMonth,
    paymentRate,
    paidCount: paidPayments,
    totalCount: allPayments,
    monthlyCollection,
  });
}

import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);
  if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

  const villaId = user.villaId;
  if (!villaId) return err('빌라 정보를 찾을 수 없습니다.', 404);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const [allPayments, paidPayments, rows] = await Promise.all([
    prisma.invoicePayment.count({
      where: { invoice: { villaId, billingMonth: currentMonth } },
    }),
    prisma.invoicePayment.count({
      where: { invoice: { villaId, billingMonth: currentMonth }, status: 'PAID' },
    }),
    // DB-level GROUP BY 집계 (M-6)
    prisma.$queryRaw<Array<{ billingMonth: string; total: number }>>(
      Prisma.sql`
        SELECT i."billingMonth", COALESCE(SUM(p.amount), 0)::float AS total
        FROM "Invoice" i
        LEFT JOIN "InvoicePayment" p ON p."invoiceId" = i.id AND p.status = 'PAID'
        WHERE i."villaId" = ${villaId}
          AND i."billingMonth" IN (${Prisma.join(months)})
        GROUP BY i."billingMonth"
      `,
    ),
  ]);

  const monthlyCollection = months.map((month) => {
    const row = rows.find((r) => r.billingMonth === month);
    return { month, amount: row ? row.total : 0 };
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

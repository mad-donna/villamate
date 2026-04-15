import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';
import { SUBSCRIPTION_MONTHLY_PRICE } from '@/lib/pricing';

const MONTHLY_PRICE = SUBSCRIPTION_MONTHLY_PRICE;

// GET /api/backoffice/mrr
// MRR = 현재 ACTIVE 구독 수 × 월 단가
// 최근 12개월 구독 추이 포함
export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const now = new Date();

    // 현재 구독 현황
    const [activeCount, freeTrialCount, expiredCount] = await Promise.all([
      prisma.villa.count({ where: { subscriptionStatus: 'ACTIVE' } }),
      prisma.villa.count({ where: { subscriptionStatus: 'FREE_TRIAL' } }),
      prisma.villa.count({ where: { subscriptionStatus: 'EXPIRED' } }),
    ]);

    // 실제 구독 수 (ACTIVE)
    const mrr = activeCount * MONTHLY_PRICE;
    const arr = mrr * 12;

    // 최근 12개월 신규 ACTIVE 구독 추이 — createdAt 기준으로 근사
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyNewSubs = await prisma.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
             COUNT(*)::bigint AS count
      FROM "Villa"
      WHERE "subscriptionStatus" = 'ACTIVE'
        AND "createdAt" >= ${twelveMonthsAgo}
      GROUP BY 1
      ORDER BY 1
    `;

    // 만료 예정 빌라 (D-30 이내)
    const thirtyDaysLater = new Date(now);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const expiringSoon = await prisma.villa.findMany({
      where: {
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiry: { gte: now, lte: thirtyDaysLater },
      },
      select: {
        id: true,
        name: true,
        subscriptionExpiry: true,
        admin: { select: { name: true, email: true } },
      },
      orderBy: { subscriptionExpiry: 'asc' },
      take: 10,
    });

    // 최근 12개월 레이블 생성
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const subsMap = Object.fromEntries(monthlyNewSubs.map((r) => [r.month, Number(r.count)]));
    const monthlyTrend = months.map((m) => ({
      month: m,
      newSubs: subsMap[m] ?? 0,
      revenue: (subsMap[m] ?? 0) * MONTHLY_PRICE,
    }));

    return ok({
      mrr,
      arr,
      monthlyPrice: MONTHLY_PRICE,
      counts: { active: activeCount, freeTrial: freeTrialCount, expired: expiredCount },
      monthlyTrend,
      expiringSoon,
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

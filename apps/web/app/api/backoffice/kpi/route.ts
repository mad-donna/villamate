import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET /api/backoffice/kpi
// 플랫폼 KPI: 구독 상태 분포 + 최근 6개월 신규 가입 추이
// DB 집계 사용 — 전체 테이블 메모리 로드 없음
export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // 1) 구독 상태 분포 — groupBy (DB 집계)
    const [villaGroups, totalUsers, totalAdmins, totalResidents, monthlyVillas, monthlyUsers] =
      await Promise.all([
        prisma.villa.groupBy({
          by: ['subscriptionStatus'],
          _count: { _all: true },
        }),
        prisma.user.count(),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.user.count({ where: { role: 'RESIDENT' } }),
        // 2) 월별 신규 빌라 — rawQuery (DATE_TRUNC)
        prisma.$queryRaw<{ month: string; count: bigint }[]>`
          SELECT TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
                 COUNT(*)::bigint AS count
          FROM "Villa"
          WHERE "createdAt" >= ${sixMonthsAgo}
          GROUP BY 1
          ORDER BY 1
        `,
        // 3) 월별 신규 사용자 — rawQuery
        prisma.$queryRaw<{ month: string; count: bigint }[]>`
          SELECT TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
                 COUNT(*)::bigint AS count
          FROM "User"
          WHERE "createdAt" >= ${sixMonthsAgo}
          GROUP BY 1
          ORDER BY 1
        `,
      ]);

    const subscriptionDistribution = {
      FREE_TRIAL: 0,
      ACTIVE: 0,
      EXPIRED: 0,
    } as Record<string, number>;

    for (const g of villaGroups) {
      subscriptionDistribution[g.subscriptionStatus] = g._count._all;
    }

    // 최근 6개월 레이블 생성
    const now = new Date();
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const villaMap = Object.fromEntries(monthlyVillas.map((r) => [r.month, Number(r.count)]));
    const userMap = Object.fromEntries(monthlyUsers.map((r) => [r.month, Number(r.count)]));

    const monthlyTrend = months.map((m) => ({
      month: m,
      villas: villaMap[m] ?? 0,
      users: userMap[m] ?? 0,
    }));

    return ok({
      subscriptionDistribution,
      monthlyTrend,
      totals: {
        villas: Object.values(subscriptionDistribution).reduce((a, b) => a + b, 0),
        users: totalUsers,
        admins: totalAdmins,
        residents: totalResidents,
      },
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

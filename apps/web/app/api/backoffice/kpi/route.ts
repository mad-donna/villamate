import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET /api/backoffice/kpi
// 플랫폼 KPI: 구독 상태 분포 + 최근 6개월 신규 빌라 추이
export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const [villas, users] = await Promise.all([
      prisma.villa.findMany({
        select: { subscriptionStatus: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.user.findMany({ select: { role: true, createdAt: true } }),
    ]);

    // 구독 상태 분포
    const subscriptionDistribution = {
      FREE_TRIAL: villas.filter((v) => v.subscriptionStatus === 'FREE_TRIAL').length,
      ACTIVE: villas.filter((v) => v.subscriptionStatus === 'ACTIVE').length,
      EXPIRED: villas.filter((v) => v.subscriptionStatus === 'EXPIRED').length,
    };

    // 최근 6개월 신규 빌라 추이 (KST 기준 YYYY-MM)
    const now = new Date();
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const villasByMonth: Record<string, number> = {};
    const usersByMonth: Record<string, number> = {};
    for (const m of months) {
      villasByMonth[m] = 0;
      usersByMonth[m] = 0;
    }

    for (const v of villas) {
      const d = new Date(v.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in villasByMonth) villasByMonth[key]++;
    }

    for (const u of users) {
      const d = new Date(u.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in usersByMonth) usersByMonth[key]++;
    }

    const monthlyTrend = months.map((m) => ({
      month: m,
      villas: villasByMonth[m],
      users: usersByMonth[m],
    }));

    return ok({ subscriptionDistribution, monthlyTrend });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

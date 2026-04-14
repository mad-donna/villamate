import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET /api/me/villas — 현재 사용자가 관리 중인 빌라 목록 (ADMIN 전용)
export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

    const villas = await prisma.villa.findMany({
      where: { adminId: user.sub },
      select: {
        id: true,
        name: true,
        address: true,
        totalUnits: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
        inviteCode: true,
        createdAt: true,
        _count: { select: { residents: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return ok({
      villas: villas.map((v) => ({
        id: v.id,
        name: v.name,
        address: v.address,
        totalUnits: v.totalUnits,
        subscriptionStatus: v.subscriptionStatus,
        subscriptionExpiry: v.subscriptionExpiry,
        inviteCode: v.inviteCode,
        residentCount: v._count.residents,
      })),
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

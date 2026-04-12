import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

function assertSuperAdmin(role: string) {
  return role === 'SUPER_ADMIN';
}

// GET: 전체 빌라 목록 (구독 상태·통계 포함)
export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (!assertSuperAdmin(user.role)) return err('접근 권한이 없습니다.', 403);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // FREE_TRIAL | ACTIVE | EXPIRED
    const q = searchParams.get('q')?.trim();

    const villas = await prisma.villa.findMany({
      where: {
        ...(status ? { subscriptionStatus: status as 'FREE_TRIAL' | 'ACTIVE' | 'EXPIRED' } : {}),
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        address: true,
        totalUnits: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
        createdAt: true,
        admin: { select: { id: true, name: true, email: true } },
        _count: { select: { residents: true } },
      },
    });

    return ok(
      villas.map((v) => ({
        id: v.id,
        name: v.name,
        address: v.address,
        totalUnits: v.totalUnits,
        subscriptionStatus: v.subscriptionStatus,
        subscriptionExpiry: v.subscriptionExpiry,
        createdAt: v.createdAt,
        admin: v.admin,
        residentCount: v._count.residents,
      })),
    );
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

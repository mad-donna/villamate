import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET /api/villas/search?q=검색어
// 인증 필요. Villa.name 또는 Villa.address에서 검색어 포함 빌라 반환.
export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) {
      return err('인증이 필요합니다.', 401);
    }

    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';

    if (!q) {
      return ok({ villas: [] });
    }

    const villas = await prisma.villa.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { address: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        address: true,
        totalUnits: true,
      },
      orderBy: { name: 'asc' },
      take: 20,
    });

    return ok({ villas });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

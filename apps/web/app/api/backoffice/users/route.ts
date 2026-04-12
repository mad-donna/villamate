import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET: 전체 사용자 목록
export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const role = searchParams.get('role'); // ADMIN | RESIDENT | SUPER_ADMIN

    const users = await prisma.user.findMany({
      where: {
        // 익명화된 탈퇴 회원 제외 여부를 선택할 수 있지만 SUPER_ADMIN은 모두 조회
        ...(role ? { role: role as 'ADMIN' | 'RESIDENT' | 'SUPER_ADMIN' } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
        villasManaged: { select: { id: true, name: true } },
        _count: { select: { residentRecords: true } },
      },
    });

    return ok(
      users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        createdAt: u.createdAt,
        isWithdrawn: u.email.endsWith('@villamate.invalid'),
        managedVilla: u.villasManaged[0] ?? null,
        residentRecordCount: u._count.residentRecords,
      })),
    );
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

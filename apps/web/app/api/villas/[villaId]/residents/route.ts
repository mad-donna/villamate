import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET: 입주민 목록 조회 (ADMIN 전용)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> }
) {
  try {
    const user = await getUser(req);
    if (!user) {
      return err('인증이 필요합니다.', 401);
    }

    const { villaId } = await params;

    // ADMIN 권한 확인
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { id: true, adminId: true },
    });

    if (!villa) {
      return err('빌라를 찾을 수 없습니다.', 404);
    }

    if (villa.adminId !== user.sub) {
      return err('권한이 없습니다.', 403);
    }

    const search = req.nextUrl.searchParams.get('search')?.trim() ?? '';
    // status 파라미터: 'PENDING' | 'APPROVED' | 'REJECTED' — 기본값은 APPROVED
    const statusParam = req.nextUrl.searchParams.get('status') ?? 'APPROVED';
    const allowedStatuses = ['PENDING', 'APPROVED', 'REJECTED'] as const;
    type AllowedStatus = typeof allowedStatuses[number];
    const statusFilter: AllowedStatus = (allowedStatuses as readonly string[]).includes(statusParam)
      ? (statusParam as AllowedStatus)
      : 'APPROVED';

    const residents = await prisma.residentRecord.findMany({
      where: {
        villaId,
        status: statusFilter,
        ...(search
          ? {
              OR: [
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { roomNumber: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { roomNumber: 'asc' },
    });

    return ok({
      residents: residents.map((r) => ({
        id: r.id,
        userId: r.userId,
        roomNumber: r.roomNumber,
        residentType: r.residentType,
        status: r.status,
        joinedAt: r.joinedAt,
        user: r.user,
      })),
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

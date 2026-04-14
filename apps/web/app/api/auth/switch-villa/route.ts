import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { getUser, ok, err } from '@/lib/api';

// POST /api/auth/switch-villa { villaId }
// 관리자가 관리 중인 빌라를 전환 → 새 JWT + villa 정보 반환
export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'ADMIN') return err('관리자만 빌라를 전환할 수 있습니다.', 403);

    const body = (await req.json()) as { villaId?: string };
    if (!body.villaId) return err('villaId를 입력해주세요.', 400);

    // 해당 빌라가 이 관리자의 빌라인지 확인
    const villa = await prisma.villa.findUnique({
      where: { id: body.villaId },
      select: {
        id: true,
        name: true,
        address: true,
        inviteCode: true,
        subscriptionStatus: true,
        adminId: true,
      },
    });

    if (!villa || villa.adminId !== user.sub) {
      return err('접근 권한이 없는 빌라입니다.', 403);
    }

    // 새 JWT 발급 (villaId만 변경)
    const token = await signToken({
      sub: user.sub,
      email: user.email,
      role: user.role,
      villaId: villa.id,
    });

    return ok({
      token,
      villa: {
        id: villa.id,
        name: villa.name,
        address: villa.address,
        inviteCode: villa.inviteCode,
        subscriptionStatus: villa.subscriptionStatus,
      },
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

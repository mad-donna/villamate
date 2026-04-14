import { NextRequest } from 'next/server';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// POST: 동대표 권한 이양 (현 ADMIN → 승인된 입주민)
// body: { newAdminId: string }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { id: true, adminId: true, name: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('현재 동대표만 권한을 이양할 수 있습니다.', 403);

    const body = (await req.json()) as { newAdminId?: string };
    if (!body.newAdminId) return err('새 동대표 ID를 입력해주세요.', 400);
    if (body.newAdminId === user.sub) return err('본인에게 이양할 수 없습니다.', 400);

    // 새 동대표가 해당 빌라의 승인된 입주민인지 확인
    const newAdminResident = await prisma.residentRecord.findFirst({
      where: { villaId, userId: body.newAdminId, status: 'APPROVED' },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });
    if (!newAdminResident) return err('해당 입주민을 찾을 수 없습니다.', 404);

    // 트랜잭션: villa.adminId 변경 + 기존 admin 역할 변경 + 새 admin 역할 변경
    await prisma.$transaction([
      // 빌라 adminId 업데이트
      prisma.villa.update({
        where: { id: villaId },
        data: { adminId: body.newAdminId },
      }),
      // 기존 동대표 → RESIDENT로 변경 (villasManaged 제거됨)
      prisma.user.update({
        where: { id: user.sub },
        data: { role: 'RESIDENT' },
      }),
      // 새 동대표 → ADMIN으로 변경
      prisma.user.update({
        where: { id: body.newAdminId },
        data: { role: 'ADMIN' },
      }),
    ]);

    // 새 동대표에게 알림
    await prisma.notification.create({
      data: {
        userId: body.newAdminId,
        villaId,
        type: 'SYSTEM',
        title: '동대표 권한 이양',
        body: `${villa.name}의 동대표 권한이 이양되었습니다.`,
      },
    }).catch(() => {});

    // 새 JWT 발급 (기존 관리자가 RESIDENT로 변경되었으므로 재로그인 필요)
    return ok({
      success: true,
      message: '동대표 권한이 이양되었습니다. 다시 로그인해주세요.',
      newAdminName: newAdminResident.user.name,
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

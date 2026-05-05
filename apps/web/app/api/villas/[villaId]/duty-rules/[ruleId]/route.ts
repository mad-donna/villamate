import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; ruleId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

    const { villaId, ruleId } = await params;

    const villa = await prisma.villa.findUnique({ where: { id: villaId }, select: { adminId: true } });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

    const rule = await prisma.dutyRule.findFirst({ where: { id: ruleId, villaId } });
    if (!rule) return err('점검 규칙을 찾을 수 없습니다.', 404);

    const body = await req.json() as { lastInspectedAt?: string };

    const lastInspectedAt = body.lastInspectedAt ? new Date(body.lastInspectedAt) : undefined;
    if (lastInspectedAt && isNaN(lastInspectedAt.getTime())) return err('유효하지 않은 날짜입니다.', 400);

    const updated = await prisma.dutyRule.update({
      where: { id: ruleId },
      data: { lastInspectedAt },
    });

    return ok({ rule: updated });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; ruleId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

    const { villaId, ruleId } = await params;

    const villa = await prisma.villa.findUnique({ where: { id: villaId }, select: { adminId: true } });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

    const rule = await prisma.dutyRule.findFirst({ where: { id: ruleId, villaId } });
    if (!rule) return err('점검 규칙을 찾을 수 없습니다.', 404);

    await prisma.dutyRule.delete({ where: { id: ruleId } });

    return ok({ message: '삭제되었습니다.' });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

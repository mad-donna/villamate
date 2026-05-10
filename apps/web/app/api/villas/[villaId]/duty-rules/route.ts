import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

    const { villaId } = await params;

    const villa = await prisma.villa.findUnique({ where: { id: villaId }, select: { adminId: true } });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

    const rules = await prisma.dutyRule.findMany({
      where: { villaId },
      orderBy: { createdAt: 'asc' },
    });

    return ok({ rules });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

    const { villaId } = await params;

    const villa = await prisma.villa.findUnique({ where: { id: villaId }, select: { adminId: true } });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

    const body = await req.json() as { name?: string; intervalDays?: number; lastInspectedAt?: string };

    if (!body.name?.trim()) return err('점검 항목명을 입력해주세요.', 400);
    if (!body.intervalDays || body.intervalDays < 1 || !Number.isInteger(body.intervalDays)) {
      return err('유효한 점검 주기를 입력해주세요. (1 이상의 정수)', 400);
    }

    const lastInspectedAt = body.lastInspectedAt ? new Date(body.lastInspectedAt) : null;
    if (lastInspectedAt && isNaN(lastInspectedAt.getTime())) return err('유효하지 않은 날짜입니다.', 400);

    const rule = await prisma.dutyRule.create({
      data: {
        villaId,
        name: body.name.trim(),
        intervalDays: body.intervalDays,
        lastInspectedAt,
      },
    });

    return ok({ rule }, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

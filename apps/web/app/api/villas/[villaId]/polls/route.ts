import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';
import { requireActiveSubscription } from '@/lib/subscription';

async function assertVillaAccess(villaId: string, userId: string) {
  const villa = await prisma.villa.findUnique({
    where: { id: villaId },
    select: { id: true, adminId: true },
  });
  if (!villa) return null;
  if (villa.adminId === userId) return { isAdmin: true };
  const resident = await prisma.residentRecord.findFirst({
    where: { villaId, userId, status: 'APPROVED' },
    select: { id: true },
  });
  if (!resident) return null;
  return { isAdmin: false };
}

// GET: 투표 목록
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;
    const access = await assertVillaAccess(villaId, user.sub);
    if (!access) return err('접근 권한이 없습니다.', 403);

    const [polls, totalHouseholds] = await Promise.all([
      prisma.poll.findMany({
        where: { villaId },
        include: {
          options: { select: { id: true, text: true } },
          _count: { select: { votes: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.residentRecord.count({
        where: { villaId, residentType: 'HEAD', status: 'APPROVED' },
      }),
    ]);

    return ok({
      totalHouseholds,
      polls: polls.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        isAnonymous: p.isAnonymous,
        endDate: p.endDate,
        createdAt: p.createdAt,
        optionCount: p.options.length,
        voteCount: p._count.votes,
        isClosed: new Date(p.endDate) < new Date(),
      })),
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// POST: 투표 생성 (ADMIN only)
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
      select: { adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('관리자만 투표를 생성할 수 있습니다.', 403);

    const subErr = await requireActiveSubscription(villaId);
    if (subErr) return subErr;

    const body = (await req.json()) as {
      title?: string;
      description?: string;
      isAnonymous?: boolean;
      endDate?: string;
      options?: string[];
    };

    if (!body.title?.trim()) return err('제목을 입력해주세요.', 400);
    if (!body.endDate) return err('종료일을 입력해주세요.', 400);
    if (!body.options || body.options.length < 2) return err('선택지를 2개 이상 입력해주세요.', 400);

    const validOptions = body.options.map((o) => o.trim()).filter(Boolean);
    if (validOptions.length < 2) return err('유효한 선택지를 2개 이상 입력해주세요.', 400);

    const endDate = new Date(body.endDate);
    const minEndDate = new Date(Date.now() + 60 * 60 * 1000);
    if (isNaN(endDate.getTime()) || endDate < minEndDate) {
      return err('종료일은 지금으로부터 1시간 이후여야 합니다.', 400);
    }

    const poll = await prisma.poll.create({
      data: {
        villaId,
        creatorId: user.sub,
        title: body.title.trim(),
        description: body.description?.trim() ?? null,
        isAnonymous: body.isAnonymous ?? false,
        endDate,
        options: {
          create: validOptions.map((text) => ({ text })),
        },
      },
      include: { options: true },
    });

    return ok({ poll }, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

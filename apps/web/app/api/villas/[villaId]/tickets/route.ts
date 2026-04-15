import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> }
) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);

  const { villaId } = await params;

  if (user.role === 'ADMIN') {
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { adminId: true },
    });
    if (!villa || villa.adminId !== user.sub) return err('권한이 없습니다.', 403);
  }

  const where =
    user.role === 'ADMIN'
      ? { villaId }
      : { villaId, reporterId: user.sub };

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      reporter: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return ok({ tickets });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> }
) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);

  const { villaId } = await params;

  // 빌라 소속 및 APPROVED 입주민 여부 검증
  const villa = await prisma.villa.findUnique({
    where: { id: villaId },
    select: { adminId: true },
  });
  if (!villa) return err('빌라를 찾을 수 없습니다.', 404);

  const isAdmin = villa.adminId === user.sub;
  if (!isAdmin) {
    const resident = await prisma.residentRecord.findFirst({
      where: { villaId, userId: user.sub, status: 'APPROVED' },
    });
    if (!resident) return err('접근 권한이 없습니다.', 403);
  }

  const body = await req.json() as {
    title?: string;
    description?: string;
    category?: string;
  };

  const { title, description, category } = body;

  if (!title?.trim()) return err('제목을 입력해주세요.');
  if (title.trim().length > 100) return err('제목은 100자 이하로 입력해주세요.');
  if (!description?.trim()) return err('내용을 입력해주세요.');
  if (description.trim().length > 2000) return err('내용은 2000자 이하로 입력해주세요.');
  if (!category || !['COMMON_FACILITY', 'PARKING', 'NOISE_COMPLAINT', 'ETC'].includes(category)) {
    return err('올바르지 않은 카테고리입니다.');
  }

  try {
    const ticket = await prisma.ticket.create({
      data: {
        villaId,
        reporterId: user.sub,
        title: title.trim(),
        description: description.trim(),
        category: category as 'COMMON_FACILITY' | 'PARKING' | 'NOISE_COMPLAINT' | 'ETC',
      },
      include: {
        reporter: { select: { id: true, name: true } },
      },
    });

    return ok(ticket, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

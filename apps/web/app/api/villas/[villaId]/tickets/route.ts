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
  const body = await req.json() as {
    title?: string;
    description?: string;
    category?: string;
  };

  const { title, description, category } = body;

  if (!title?.trim()) return err('제목을 입력해주세요.');
  if (!description?.trim()) return err('내용을 입력해주세요.');
  if (!category || !['COMMON_FACILITY', 'PARKING', 'NOISE_COMPLAINT', 'ETC'].includes(category)) {
    return err('올바르지 않은 카테고리입니다.');
  }

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
}

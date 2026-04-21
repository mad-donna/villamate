import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { requireActiveSubscription } from '@/lib/subscription';

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);
  if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

  const villaId = user.villaId;
  if (!villaId) return err('빌라 정보를 찾을 수 없습니다.', 404);

  const facilities = await prisma.facility.findMany({
    where: { villaId },
    orderBy: { createdAt: 'asc' },
  });

  return ok({ facilities });
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);
  if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

  const villaId = user.villaId;
  if (!villaId) return err('빌라 정보를 찾을 수 없습니다.', 404);

  const subErr = await requireActiveSubscription(villaId);
  if (subErr) return subErr;

  const body = await req.json() as {
    name?: string;
    description?: string;
    maxPerDay?: number;
  };

  if (!body.name?.trim()) return err('시설 이름을 입력해주세요.');

  const facility = await prisma.facility.create({
    data: {
      villaId,
      name: body.name.trim(),
      description: body.description?.trim() ?? null,
      maxPerDay: typeof body.maxPerDay === 'number' && body.maxPerDay > 0 ? body.maxPerDay : 1,
    },
  });

  return ok(facility, 201);
}

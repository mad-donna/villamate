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

const TIME_RE = /^\d{2}:\d{2}$/;

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
    openTime?: string;
    closeTime?: string;
    maxConcurrent?: number;
  };

  if (!body.name?.trim()) return err('시설 이름을 입력해주세요.');

  if (body.openTime && !TIME_RE.test(body.openTime)) return err('운영 시작 시간 형식이 올바르지 않습니다. (HH:MM)');
  if (body.closeTime && !TIME_RE.test(body.closeTime)) return err('운영 종료 시간 형식이 올바르지 않습니다. (HH:MM)');
  if (body.openTime && body.closeTime && body.openTime >= body.closeTime) {
    return err('종료 시간은 시작 시간보다 늦어야 합니다.');
  }

  const facility = await prisma.facility.create({
    data: {
      villaId,
      name: body.name.trim(),
      description: body.description?.trim() ?? null,
      openTime: body.openTime ?? null,
      closeTime: body.closeTime ?? null,
      maxConcurrent: typeof body.maxConcurrent === 'number' && body.maxConcurrent > 0 ? body.maxConcurrent : 1,
    },
  });

  return ok(facility, 201);
}

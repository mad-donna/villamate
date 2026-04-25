import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';

async function getAdminFacility(id: string, adminId: string) {
  return prisma.facility.findFirst({
    where: { id, villa: { adminId } },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);
  if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

  const { id } = await params;
  const facility = await getAdminFacility(id, user.sub);
  if (!facility) return err('시설을 찾을 수 없습니다.', 404);

  const TIME_RE = /^\d{2}:\d{2}$/;

  const body = await req.json() as {
    name?: string;
    description?: string;
    openTime?: string | null;
    closeTime?: string | null;
    maxConcurrent?: number;
    isActive?: boolean;
  };

  if (body.openTime && !TIME_RE.test(body.openTime)) return err('운영 시작 시간 형식이 올바르지 않습니다. (HH:MM)');
  if (body.closeTime && !TIME_RE.test(body.closeTime)) return err('운영 종료 시간 형식이 올바르지 않습니다. (HH:MM)');

  const openTime = body.openTime !== undefined ? body.openTime : undefined;
  const closeTime = body.closeTime !== undefined ? body.closeTime : undefined;
  if (openTime && closeTime && openTime >= closeTime) {
    return err('종료 시간은 시작 시간보다 늦어야 합니다.');
  }

  const updated = await prisma.facility.update({
    where: { id },
    data: {
      ...(body.name?.trim() ? { name: body.name.trim() } : {}),
      ...(body.description !== undefined ? { description: body.description?.trim() ?? null } : {}),
      ...(body.openTime !== undefined ? { openTime: body.openTime ?? null } : {}),
      ...(body.closeTime !== undefined ? { closeTime: body.closeTime ?? null } : {}),
      ...(typeof body.maxConcurrent === 'number' && body.maxConcurrent > 0 ? { maxConcurrent: body.maxConcurrent } : {}),
      ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
    },
  });

  return ok(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);
  if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

  const { id } = await params;
  const facility = await getAdminFacility(id, user.sub);
  if (!facility) return err('시설을 찾을 수 없습니다.', 404);

  await prisma.facility.delete({ where: { id } });
  return ok({ message: '삭제되었습니다.' });
}

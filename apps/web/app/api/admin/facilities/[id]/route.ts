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

  const body = await req.json() as {
    name?: string;
    description?: string;
    maxPerDay?: number;
    isActive?: boolean;
  };

  const updated = await prisma.facility.update({
    where: { id },
    data: {
      ...(body.name?.trim() ? { name: body.name.trim() } : {}),
      ...(body.description !== undefined ? { description: body.description?.trim() ?? null } : {}),
      ...(typeof body.maxPerDay === 'number' ? { maxPerDay: body.maxPerDay } : {}),
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

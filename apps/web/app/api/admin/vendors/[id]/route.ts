import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import type { VendorCategory } from '@prisma/client';

const VALID_CATEGORIES: VendorCategory[] = [
  'PLUMBING', 'ELECTRICAL', 'CLEANING', 'CONSTRUCTION', 'ELEVATOR', 'ETC',
];

async function getAdminVendor(id: string, adminId: string) {
  return prisma.vendor.findFirst({ where: { id, villa: { adminId } } });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);
  if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

  const { id } = await params;
  const vendor = await getAdminVendor(id, user.sub);
  if (!vendor) return err('업체를 찾을 수 없습니다.', 404);

  const body = await req.json() as {
    name?: string;
    category?: string;
    phone?: string;
    memo?: string;
  };

  if (body.category && !VALID_CATEGORIES.includes(body.category as VendorCategory)) {
    return err('올바르지 않은 카테고리입니다.');
  }

  const updated = await prisma.vendor.update({
    where: { id },
    data: {
      ...(body.name?.trim() ? { name: body.name.trim() } : {}),
      ...(body.category ? { category: body.category as VendorCategory } : {}),
      ...(body.phone?.trim() ? { phone: body.phone.trim() } : {}),
      ...(body.memo !== undefined ? { memo: body.memo?.trim() ?? null } : {}),
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
  const vendor = await getAdminVendor(id, user.sub);
  if (!vendor) return err('업체를 찾을 수 없습니다.', 404);

  await prisma.vendor.delete({ where: { id } });
  return ok({ message: '삭제되었습니다.' });
}

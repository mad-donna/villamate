import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import type { VendorCategory } from '@prisma/client';

const VALID_CATEGORIES: VendorCategory[] = [
  'PLUMBING', 'ELECTRICAL', 'CLEANING', 'CONSTRUCTION', 'ELEVATOR', 'ETC',
];

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);

  // 빌라 소속 확인 (관리자 또는 승인된 입주민)
  let villaId: string | null = null;

  if (user.role === 'ADMIN') {
    villaId = user.villaId ?? null;
  } else {
    const record = await prisma.residentRecord.findFirst({
      where: { userId: user.sub, status: 'APPROVED' },
      orderBy: { joinedAt: 'desc' },
    });
    villaId = record?.villaId ?? null;
  }

  if (!villaId) return err('빌라 정보를 찾을 수 없습니다.', 404);

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') as VendorCategory | null;

  const vendors = await prisma.vendor.findMany({
    where: {
      villaId,
      ...(category && VALID_CATEGORIES.includes(category) ? { category } : {}),
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  return ok({ vendors });
}

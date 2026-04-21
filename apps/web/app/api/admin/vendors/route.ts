import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { requireActiveSubscription } from '@/lib/subscription';
import type { VendorCategory } from '@prisma/client';

const VALID_CATEGORIES: VendorCategory[] = [
  'PLUMBING', 'ELECTRICAL', 'CLEANING', 'CONSTRUCTION', 'ELEVATOR', 'ETC',
];

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);
  if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

  const villaId = user.villaId;
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
    category?: string;
    phone?: string;
    memo?: string;
  };

  if (!body.name?.trim()) return err('업체명을 입력해주세요.');
  if (!body.category || !VALID_CATEGORIES.includes(body.category as VendorCategory)) {
    return err('올바르지 않은 카테고리입니다.');
  }
  if (!body.phone?.trim()) return err('전화번호를 입력해주세요.');

  const vendor = await prisma.vendor.create({
    data: {
      villaId,
      name: body.name.trim(),
      category: body.category as VendorCategory,
      phone: body.phone.trim(),
      memo: body.memo?.trim() ?? null,
    },
  });

  return ok(vendor, 201);
}

import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';

async function getAdminVendor(id: string, adminId: string) {
  return prisma.vendor.findFirst({ where: { id, villa: { adminId } } });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);
  if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

  const { id } = await params;
  const vendor = await getAdminVendor(id, user.sub);
  if (!vendor) return err('업체를 찾을 수 없습니다.', 404);

  const histories = await prisma.vendorHistory.findMany({
    where: { vendorId: id },
    orderBy: { workDate: 'desc' },
  });

  return ok({ histories });
}

export async function POST(
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
    workDate?: string;
    description?: string;
    cost?: number | null;
    receiptUrl?: string | null;
  };

  if (!body.workDate) return err('작업일을 입력해주세요.');
  if (!body.description?.trim()) return err('작업 내용을 입력해주세요.');

  const workDate = new Date(body.workDate);
  if (isNaN(workDate.getTime())) return err('올바르지 않은 날짜입니다.');

  const history = await prisma.vendorHistory.create({
    data: {
      vendorId: id,
      workDate,
      description: body.description.trim(),
      cost: body.cost ?? null,
      receiptUrl: body.receiptUrl?.trim() ?? null,
    },
  });

  return ok(history, 201);
}

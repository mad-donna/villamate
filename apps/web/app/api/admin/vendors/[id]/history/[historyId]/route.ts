import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';

async function getHistory(historyId: string, vendorId: string, adminId: string) {
  return prisma.vendorHistory.findFirst({
    where: { id: historyId, vendorId, vendor: { villa: { adminId } } },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; historyId: string }> }
) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);
  if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

  const { id, historyId } = await params;
  const history = await getHistory(historyId, id, user.sub);
  if (!history) return err('이력을 찾을 수 없습니다.', 404);

  const body = await req.json() as {
    workDate?: string;
    description?: string;
    cost?: number | null;
    receiptUrl?: string | null;
  };

  const data: Record<string, unknown> = {};
  if (body.workDate) {
    const d = new Date(body.workDate);
    if (isNaN(d.getTime())) return err('올바르지 않은 날짜입니다.');
    data.workDate = d;
  }
  if (body.description?.trim()) data.description = body.description.trim();
  if (body.cost !== undefined) data.cost = body.cost;
  if (body.receiptUrl !== undefined) data.receiptUrl = body.receiptUrl?.trim() ?? null;

  const updated = await prisma.vendorHistory.update({ where: { id: historyId }, data });
  return ok(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; historyId: string }> }
) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);
  if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

  const { id, historyId } = await params;
  const history = await getHistory(historyId, id, user.sub);
  if (!history) return err('이력을 찾을 수 없습니다.', 404);

  await prisma.vendorHistory.delete({ where: { id: historyId } });
  return ok({ message: '삭제되었습니다.' });
}

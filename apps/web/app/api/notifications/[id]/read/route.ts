import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUser(req);
  if (!user) return err('인증이 필요합니다.', 401);

  const { id } = await params;

  const notification = await prisma.notification.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!notification) return err('알림을 찾을 수 없습니다.', 404);
  if (notification.userId !== user.sub) return err('권한이 없습니다.', 403);

  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return ok({ ok: true });
}

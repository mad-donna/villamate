import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

export async function PATCH(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return err('인증이 필요합니다.', 401);

  const result = await prisma.notification.updateMany({
    where: { userId: user.sub, isRead: false },
    data: { isRead: true },
  });

  return ok({ updated: result.count });
}

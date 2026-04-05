import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return err('인증이 필요합니다.', 401);

  const notifications = await prisma.notification.findMany({
    where: { userId: user.sub },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return ok({ notifications, unreadCount });
}

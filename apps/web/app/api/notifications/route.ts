import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return err('인증이 필요합니다.', 401);

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);
  const cursor = searchParams.get('cursor') ?? undefined;

  const notifications = await prisma.notification.findMany({
    where: { userId: user.sub },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = notifications.length > limit;
  if (hasMore) notifications.pop();

  const nextCursor = hasMore ? notifications[notifications.length - 1]?.id : null;
  const unreadCount = await prisma.notification.count({
    where: { userId: user.sub, isRead: false },
  });

  return ok({ notifications, unreadCount, nextCursor });
}

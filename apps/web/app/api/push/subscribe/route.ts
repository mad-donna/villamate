import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

interface SubscribeBody {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return err('인증이 필요합니다.', 401);

  const body = (await req.json()) as SubscribeBody;
  const { endpoint, keys } = body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return err('유효하지 않은 구독 정보입니다.', 400);
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { userId: user.sub, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    update: { userId: user.sub, p256dh: keys.p256dh, auth: keys.auth },
  });

  return ok({ subscribed: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return err('인증이 필요합니다.', 401);

  const body = (await req.json()) as { endpoint: string };
  if (!body.endpoint) return err('endpoint가 필요합니다.', 400);

  await prisma.pushSubscription
    .deleteMany({ where: { endpoint: body.endpoint, userId: user.sub } })
    .catch(() => {});

  return ok({ unsubscribed: true });
}

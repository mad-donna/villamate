import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';
import { createNotificationForVilla } from '@/lib/notify';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  const user = await getUser(req);
  if (!user) return err('인증이 필요합니다.', 401);
  if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

  const { villaId } = await params;

  const villa = await prisma.villa.findUnique({
    where: { id: villaId },
    select: { adminId: true },
  });
  if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
  if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

  // 오늘 이미 소프트 넛지를 발송했는지 확인 (1일 1회 쿨타임)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const existing = await prisma.notification.findFirst({
    where: {
      villaId,
      type: 'SYSTEM',
      title: '관리비 납부 안내',
      createdAt: { gte: todayStart },
    },
  });

  if (existing) {
    return err('오늘 이미 납부 안내 공지를 발송했습니다.', 429);
  }

  await createNotificationForVilla(
    villaId,
    'SYSTEM',
    '관리비 납부 안내',
    '이번 달 관리비 납부가 시작되었습니다. 편하실 때 납부해 주시면 감사하겠습니다.',
  );

  return ok({ sent: true });
}

import { prisma } from './prisma';
import { NotificationType } from '@prisma/client';
import { sendPushToUser } from './webpush';

interface CreateNotificationInput {
  userId: string;
  villaId?: string;
  type: NotificationType;
  title: string;
  body: string;
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({ data: input });
  sendPushToUser(input.userId, { title: input.title, body: input.body }).catch(() => {});
  return notification;
}

export async function createNotificationForVilla(
  villaId: string,
  type: NotificationType,
  title: string,
  body: string,
) {
  const records = await prisma.residentRecord.findMany({
    where: { villaId },
    select: { userId: true },
  });
  const adminVilla = await prisma.villa.findUnique({
    where: { id: villaId },
    select: { adminId: true },
  });

  const userIds = [
    ...new Set([
      ...records.map((r) => r.userId),
      ...(adminVilla ? [adminVilla.adminId] : []),
    ]),
  ];

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, villaId, type, title, body })),
  });

  // Web Push — 비동기 발송 (실패해도 알림 저장에 영향 없음)
  Promise.allSettled(
    userIds.map((userId) => sendPushToUser(userId, { title, body })),
  ).catch(() => {});
}

export async function notifyTicketStatusChange(
  ticketId: string,
  reporterId: string,
  villaId: string,
  ticketTitle: string,
  newStatus: 'IN_PROGRESS' | 'RESOLVED',
): Promise<void> {
  const title = newStatus === 'IN_PROGRESS' ? '민원 처리 시작' : '민원 처리 완료';
  const body =
    newStatus === 'IN_PROGRESS'
      ? `"${ticketTitle}" 민원이 처리 중입니다.`
      : `"${ticketTitle}" 민원이 완료되었습니다.`;

  await prisma.notification.create({
    data: {
      userId: reporterId,
      villaId,
      type: NotificationType.TICKET,
      title,
      body,
    },
  });

  sendPushToUser(reporterId, { title, body }).catch(() => {});
}

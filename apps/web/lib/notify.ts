import { prisma } from './prisma';
import { NotificationType } from '@prisma/client';

interface CreateNotificationInput {
  userId: string;
  villaId?: string;
  type: NotificationType;
  title: string;
  body: string;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({ data: input });
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
}

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

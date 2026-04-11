import { NextRequest } from 'next/server';
import { getUser, ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { notifyTicketStatusChange } from '@/lib/notify';
import { TicketStatus } from '@prisma/client';

const VALID_TRANSITIONS: Record<string, TicketStatus> = {
  PENDING: TicketStatus.IN_PROGRESS,
  IN_PROGRESS: TicketStatus.RESOLVED,
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; ticketId: string }> }
) {
  const user = await getUser(req);
  if (!user) return err('Unauthorized', 401);
  if (user.role !== 'ADMIN') return err('Forbidden', 403);

  const { villaId, ticketId } = await params;
  const body = await req.json();
  const { status } = body as { status: string };

  if (!status) return err('status is required');

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId, villaId },
  });
  if (!ticket) return err('Ticket not found', 404);

  const allowedNext = VALID_TRANSITIONS[ticket.status];
  if (!allowedNext || allowedNext !== status) {
    return err(`Invalid status transition: ${ticket.status} → ${status}`);
  }

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: status as TicketStatus },
  });

  notifyTicketStatusChange(
    ticketId,
    ticket.reporterId,
    villaId,
    ticket.title,
    status as 'IN_PROGRESS' | 'RESOLVED',
  ).catch((e) => console.error('[ticket] 알림 발송 실패:', e));

  return ok(updated);
}

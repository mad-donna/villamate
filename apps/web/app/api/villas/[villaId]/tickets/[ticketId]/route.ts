import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/api';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; ticketId: string }> }
) {
  // TODO: implement
  return ok({ message: 'TODO' });
}

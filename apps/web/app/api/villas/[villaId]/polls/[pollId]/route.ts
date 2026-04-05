import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/api';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; pollId: string }> }
) {
  // TODO: implement
  return ok({ message: 'TODO' });
}

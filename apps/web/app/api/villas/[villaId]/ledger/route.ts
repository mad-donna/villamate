import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/api';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> }
) {
  // TODO: implement
  return ok({ message: 'TODO' });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> }
) {
  // TODO: implement
  return ok({ message: 'TODO' });
}

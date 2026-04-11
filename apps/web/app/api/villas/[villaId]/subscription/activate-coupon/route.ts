import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/api';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> }
) {
  return err('준비 중인 기능입니다.', 501);
}

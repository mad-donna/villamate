import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/api';

export async function POST(req: NextRequest) {
  // TODO: implement (Supabase Storage upload)
  return ok({ message: 'TODO' });
}

import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';

// GET /api/guides/[id] — 게시된 가이드 단건 열람 (입주민 공개)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const guide = await prisma.guide.findUnique({ where: { id } });
    if (!guide || !guide.isPublished) return err('가이드를 찾을 수 없습니다.', 404);
    return ok(guide);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

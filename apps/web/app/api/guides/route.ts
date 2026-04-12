import { ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';

// GET /api/guides — 게시된 가이드 목록 (입주민 공개)
export async function GET() {
  try {
    const guides = await prisma.guide.findMany({
      where: { isPublished: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, title: true, category: true, order: true, updatedAt: true },
    });
    return ok(guides);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

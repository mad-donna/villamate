import { ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';

// GET /api/notices — 게시된 시스템 공지 목록 (입주민 공개, 인증 불필요)
export async function GET() {
  try {
    const notices = await prisma.systemNotice.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, content: true, createdAt: true },
      take: 50,
    });
    return ok(notices);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

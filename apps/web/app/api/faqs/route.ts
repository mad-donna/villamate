import { ok, err } from '@/lib/api';
import { prisma } from '@/lib/prisma';

// GET /api/faqs — 게시된 FAQ 목록 (입주민 공개, 인증 불필요)
export async function GET() {
  try {
    const faqs = await prisma.faq.findMany({
      where: { isPublished: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, question: true, answer: true, order: true },
      take: 100,
    });
    return ok(faqs);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

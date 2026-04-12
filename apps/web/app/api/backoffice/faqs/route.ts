import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET /api/backoffice/faqs — 전체 목록 (order asc)
export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const faqs = await prisma.faq.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
    return ok(faqs);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// POST /api/backoffice/faqs — 새 FAQ 생성
export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const body = (await req.json()) as {
      question?: string;
      answer?: string;
      order?: number;
      isPublished?: boolean;
    };
    if (!body.question?.trim() || !body.answer?.trim()) {
      return err('질문과 답변을 입력해주세요.', 400);
    }

    const faq = await prisma.faq.create({
      data: {
        question: body.question.trim(),
        answer: body.answer.trim(),
        order: body.order ?? 0,
        isPublished: body.isPublished ?? false,
      },
    });
    return ok(faq, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

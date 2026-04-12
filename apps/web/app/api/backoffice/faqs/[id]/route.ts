import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// PATCH /api/backoffice/faqs/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const { id } = await params;
    const body = (await req.json()) as {
      question?: string;
      answer?: string;
      order?: number;
      isPublished?: boolean;
    };

    const faq = await prisma.faq.update({
      where: { id },
      data: {
        ...(body.question?.trim() ? { question: body.question.trim() } : {}),
        ...(body.answer?.trim()   ? { answer: body.answer.trim() }     : {}),
        ...(body.order !== undefined ? { order: body.order } : {}),
        ...(body.isPublished !== undefined ? { isPublished: body.isPublished } : {}),
      },
    });
    return ok(faq);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// DELETE /api/backoffice/faqs/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const { id } = await params;
    await prisma.faq.delete({ where: { id } });
    return ok({ ok: true });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

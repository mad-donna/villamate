import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

const VALID_CATEGORIES = ['GENERAL', 'ADMIN', 'RESIDENT', 'BILLING', 'POLL', 'COMMUNITY'] as const;

// GET /api/backoffice/guides/[id] — 내용 포함 단건 조회
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const { id } = await params;
    const guide = await prisma.guide.findUnique({ where: { id } });
    if (!guide) return err('가이드를 찾을 수 없습니다.', 404);
    return ok(guide);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// PATCH /api/backoffice/guides/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const { id } = await params;
    const body = (await req.json()) as {
      title?: string; content?: string;
      category?: string; order?: number; isPublished?: boolean;
    };

    if (
      body.category !== undefined &&
      !VALID_CATEGORIES.includes(body.category as typeof VALID_CATEGORIES[number])
    ) {
      return err('올바르지 않은 카테고리입니다.', 400);
    }

    const guide = await prisma.guide.update({
      where: { id },
      data: {
        ...(body.title?.trim() ? { title: body.title.trim() } : {}),
        ...(body.content !== undefined ? { content: body.content } : {}),
        ...(body.category !== undefined ? { category: body.category } : {}),
        ...(body.order !== undefined ? { order: body.order } : {}),
        ...(body.isPublished !== undefined ? { isPublished: body.isPublished } : {}),
      },
    });
    return ok(guide);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// DELETE /api/backoffice/guides/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const { id } = await params;
    await prisma.guide.delete({ where: { id } });
    return ok({ ok: true });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// PATCH /api/backoffice/notices/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const { id } = await params;
    const body = (await req.json()) as { title?: string; content?: string; isPublished?: boolean };

    const notice = await prisma.systemNotice.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title.trim() } : {}),
        ...(body.content !== undefined ? { content: body.content.trim() } : {}),
        ...(body.isPublished !== undefined ? { isPublished: body.isPublished } : {}),
      },
    });
    return ok(notice);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// DELETE /api/backoffice/notices/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const { id } = await params;
    await prisma.systemNotice.delete({ where: { id } });
    return ok({ ok: true });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

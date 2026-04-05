import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET: 게시글 상세 + 댓글 목록
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; postId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId, postId } = await params;

    // 빌라 소속 확인
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { id: true, adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);

    const isAdmin = villa.adminId === user.sub;
    if (!isAdmin) {
      const resident = await prisma.residentRecord.findFirst({
        where: { villaId, userId: user.sub },
        select: { id: true },
      });
      if (!resident) return err('접근 권한이 없습니다.', 403);
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    if (!post || post.villaId !== villaId) {
      return err('게시글을 찾을 수 없습니다.', 404);
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return ok({
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category,
        isNotice: post.isNotice,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        author: post.author,
      },
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        author: c.author,
      })),
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// DELETE: 게시글 삭제 (작성자 본인 또는 ADMIN)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; postId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId, postId } = await params;

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { id: true, adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, villaId: true, authorId: true },
    });

    if (!post || post.villaId !== villaId) {
      return err('게시글을 찾을 수 없습니다.', 404);
    }

    const isAdmin = villa.adminId === user.sub;
    const isAuthor = post.authorId === user.sub;

    if (!isAdmin && !isAuthor) {
      return err('삭제 권한이 없습니다.', 403);
    }

    await prisma.post.delete({ where: { id: postId } });

    return ok({ ok: true });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

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
        where: { villaId, userId: user.sub, status: 'APPROVED' },
        select: { id: true },
      });
      if (!resident) return err('접근 권한이 없습니다.', 403);
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { likes: true } },
      },
    });

    if (!post || post.villaId !== villaId) {
      return err('게시글을 찾을 수 없습니다.', 404);
    }

    const [comments, myLike] = await Promise.all([
      prisma.comment.findMany({
        where: { postId },
        include: {
          author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.postLike.findUnique({
        where: { postId_userId: { postId, userId: user.sub } },
        select: { id: true },
      }),
    ]);

    return ok({
      post: {
        id: post.id,
        title: post.title,
        content: post.content,
        category: post.category,
        isNotice: post.isNotice,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: post.author,
        likeCount: post._count.likes,
        liked: !!myLike,
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

// PATCH: 게시글 수정 (작성자 본인만)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; postId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId, postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, villaId: true, authorId: true },
    });

    if (!post || post.villaId !== villaId) {
      return err('게시글을 찾을 수 없습니다.', 404);
    }

    if (post.authorId !== user.sub) {
      return err('수정 권한이 없습니다.', 403);
    }

    const body = await req.json() as {
      title?: string;
      content?: string;
      category?: string;
      isNotice?: boolean;
      imageUrl?: string | null;
    };
    const { title, content, category, isNotice, imageUrl } = body;

    if (!title?.trim() || !content?.trim()) {
      return err('제목과 내용을 입력해주세요.', 400);
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title.trim(),
        content: content.trim(),
        ...(category !== undefined ? { category: category as 'GENERAL' | 'ISSUE' | 'NOTICE' } : {}),
        ...(isNotice !== undefined ? { isNotice } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
      },
    });

    return ok({ post: updated });
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

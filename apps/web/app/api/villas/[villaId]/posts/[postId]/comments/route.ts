import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';
import { sendPushToUser } from '@/lib/webpush';

// POST: 댓글 작성 (Phase 2 — API stub)
export async function POST(
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

    // 게시글 존재 확인
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, villaId: true },
    });
    if (!post || post.villaId !== villaId) {
      return err('게시글을 찾을 수 없습니다.', 404);
    }

    const body = (await req.json()) as { content?: string };
    if (!body.content?.trim()) return err('댓글 내용을 입력해주세요.', 400);

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: user.sub,
        content: body.content.trim(),
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    // 원글 작성자에게 알림 (본인 댓글 제외)
    const postWithAuthor = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, title: true },
    });
    if (postWithAuthor && postWithAuthor.authorId !== user.sub) {
      await prisma.notification.create({
        data: {
          userId: postWithAuthor.authorId,
          villaId,
          type: 'COMMUNITY',
          title: '새 댓글이 달렸습니다',
          body: `${comment.author.name}: ${body.content.trim().slice(0, 50)}`,
        },
      });
      sendPushToUser(postWithAuthor.authorId, {
        title: '새 댓글',
        body: `${comment.author.name}: ${body.content.trim().slice(0, 50)}`,
        url: `/community/${postId}`,
      }).catch(() => {});
    }

    return ok({ comment }, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

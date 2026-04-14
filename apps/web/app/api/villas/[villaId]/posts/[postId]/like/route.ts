import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

type Params = { params: Promise<{ villaId: string; postId: string }> };

// POST: 좋아요 토글 (좋아요 → 취소, 취소 → 좋아요)
export async function POST(req: NextRequest, { params }: Params) {
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
      select: { id: true, villaId: true },
    });
    if (!post || post.villaId !== villaId) {
      return err('게시글을 찾을 수 없습니다.', 404);
    }

    const existing = await prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId: user.sub } },
    });

    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } });
      const likeCount = await prisma.postLike.count({ where: { postId } });
      return ok({ liked: false, likeCount });
    } else {
      await prisma.postLike.create({ data: { postId, userId: user.sub } });
      const likeCount = await prisma.postLike.count({ where: { postId } });
      return ok({ liked: true, likeCount });
    }
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

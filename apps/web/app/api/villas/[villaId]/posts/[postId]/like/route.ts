import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
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
        where: { villaId, userId: user.sub, status: 'APPROVED' },
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
    }

    // race condition 방어: 동시 요청으로 P2002(unique 충돌) 발생 시 이미 좋아요 상태로 처리
    try {
      await prisma.postLike.create({ data: { postId, userId: user.sub } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        const likeCount = await prisma.postLike.count({ where: { postId } });
        return ok({ liked: true, likeCount });
      }
      throw e;
    }

    const likeCount = await prisma.postLike.count({ where: { postId } });
    return ok({ liked: true, likeCount });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

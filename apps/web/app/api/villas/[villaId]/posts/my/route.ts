import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET: 내가 쓴 게시글 목록
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;

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

    const posts = await prisma.post.findMany({
      where: { villaId, authorId: user.sub },
      include: {
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return ok({
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        category: p.category,
        isNotice: p.isNotice,
        imageUrl: p.imageUrl,
        createdAt: p.createdAt,
        commentCount: p._count.comments,
      })),
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

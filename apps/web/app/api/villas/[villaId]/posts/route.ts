import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// 빌라 소속 여부 확인 (admin 또는 resident)
async function assertVillaAccess(
  villaId: string,
  userId: string,
): Promise<{ isAdmin: boolean } | null> {
  const villa = await prisma.villa.findUnique({
    where: { id: villaId },
    select: { id: true, adminId: true },
  });
  if (!villa) return null;

  if (villa.adminId === userId) return { isAdmin: true };

  const resident = await prisma.residentRecord.findFirst({
    where: { villaId, userId, status: 'APPROVED' },
    select: { id: true },
  });
  if (!resident) return null;

  return { isAdmin: false };
}

// GET: 게시글 목록 (공지 먼저, 그 다음 최신순)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;

    const access = await assertVillaAccess(villaId, user.sub);
    if (!access) return err('접근 권한이 없습니다.', 403);

    const posts = await prisma.post.findMany({
      where: { villaId },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: [{ isNotice: 'desc' }, { createdAt: 'desc' }],
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
        author: p.author,
        commentCount: p._count.comments,
        likeCount: p._count.likes,
      })),
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// POST: 게시글 작성
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;

    const access = await assertVillaAccess(villaId, user.sub);
    if (!access) return err('접근 권한이 없습니다.', 403);

    const body = (await req.json()) as {
      title?: string;
      content?: string;
      category?: 'GENERAL' | 'NOTICE' | 'ISSUE';
      isNotice?: boolean;
      imageUrl?: string;
    };

    const { title, content, category = 'GENERAL', isNotice = false, imageUrl } = body;

    if (!title?.trim()) return err('제목을 입력해주세요.', 400);
    if (!content?.trim()) return err('내용을 입력해주세요.', 400);

    // 공지 등록은 ADMIN만 가능
    if (isNotice && !access.isAdmin) {
      return err('공지 등록은 관리자만 가능합니다.', 403);
    }

    // 공지 최대 3개 제한
    if (isNotice) {
      const noticeCount = await prisma.post.count({
        where: { villaId, isNotice: true },
      });
      if (noticeCount >= 3) {
        return err('공지는 최대 3개까지 등록 가능합니다.', 400);
      }
    }

    const post = await prisma.post.create({
      data: {
        villaId,
        authorId: user.sub,
        title: title.trim(),
        content: content.trim(),
        category,
        isNotice,
        imageUrl: imageUrl ?? null,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    // 공지 등록 시 전 입주민에게 알림 발송 (비동기, 실패해도 응답에 영향 없음)
    if (isNotice) {
      prisma.residentRecord
        .findMany({
          where: { villaId, status: 'APPROVED' },
          select: { userId: true },
        })
        .then((residents) => {
          if (residents.length === 0) return;
          return prisma.notification.createMany({
            data: residents.map((r) => ({
              userId: r.userId,
              villaId,
              type: 'SYSTEM' as const,
              title: `📢 공지사항: ${post.title}`,
              body: post.content.length > 60
                ? post.content.slice(0, 60) + '...'
                : post.content,
            })),
          });
        })
        .catch(() => {/* 알림 실패는 무시 */});
    }

    return ok({ post }, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

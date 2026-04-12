import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET /api/backoffice/guides — 전체 목록 (order asc)
export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const guides = await prisma.guide.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true, title: true, category: true, order: true,
        isPublished: true, createdAt: true, updatedAt: true,
      },
    });
    return ok(guides);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// POST /api/backoffice/guides — 새 가이드 생성
export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const body = (await req.json()) as {
      title?: string; content?: string;
      category?: string; order?: number; isPublished?: boolean;
    };
    if (!body.title?.trim()) return err('제목을 입력해주세요.', 400);

    const guide = await prisma.guide.create({
      data: {
        title: body.title.trim(),
        content: body.content ?? '',
        category: body.category ?? 'GENERAL',
        order: body.order ?? 0,
        isPublished: body.isPublished ?? false,
      },
    });
    return ok(guide, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

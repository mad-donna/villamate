import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET /api/backoffice/notices — 전체 목록 (최신순)
export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const notices = await prisma.systemNotice.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return ok(notices);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// POST /api/backoffice/notices — 새 공지 생성
export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const body = (await req.json()) as { title?: string; content?: string; isPublished?: boolean };
    if (!body.title?.trim() || !body.content?.trim()) {
      return err('제목과 내용을 입력해주세요.', 400);
    }

    const notice = await prisma.systemNotice.create({
      data: {
        title: body.title.trim(),
        content: body.content.trim(),
        isPublished: body.isPublished ?? false,
      },
    });
    return ok(notice, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

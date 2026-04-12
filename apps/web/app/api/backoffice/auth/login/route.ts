import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { ok, err } from '@/lib/api';

/**
 * POST /api/backoffice/auth/login
 * SUPER_ADMIN 전용 백오피스 로그인.
 * 일반 사용자 및 ADMIN은 401을 반환합니다.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      return err('이메일과 비밀번호를 입력해주세요.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true, role: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return err('이메일 또는 비밀번호가 올바르지 않습니다.', 401);
    }

    if (user.role !== 'SUPER_ADMIN') {
      return err('접근 권한이 없습니다.', 403);
    }

    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return ok({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { err } from '@/lib/api';

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

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
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

    const res = NextResponse.json({
      ok: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    // 서버 사이드 미들웨어 보호를 위한 HttpOnly 세션 쿠키
    res.cookies.set('bo_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/backoffice',
      maxAge: 60 * 60 * 8, // 8시간
    });

    return res;
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

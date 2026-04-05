import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { ok, err } from '@/lib/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, phone } = body as {
      email?: string;
      password?: string;
      name?: string;
      phone?: string;
    };

    // 유효성 검사
    if (!email || !EMAIL_REGEX.test(email)) {
      return err('올바른 이메일 형식이 아닙니다.', 400);
    }
    if (!password || password.length < 8) {
      return err('비밀번호는 8자 이상이어야 합니다.', 400);
    }
    if (!name || name.trim().length < 1) {
      return err('이름을 입력해주세요.', 400);
    }

    // 이메일 중복 확인
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return err('이미 사용 중인 이메일입니다.', 409);
    }

    // 비밀번호 해싱
    const hashed = await bcrypt.hash(password, 10);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name.trim(),
        phone: phone ?? null,
      },
    });

    // password 제외한 안전한 사용자 객체
    const { password: _, ...safeUser } = user;

    // JWT 발급
    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return ok(
      {
        token,
        user: {
          id: safeUser.id,
          email: safeUser.email,
          name: safeUser.name,
          phone: safeUser.phone,
          role: safeUser.role,
        },
      },
      201
    );
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

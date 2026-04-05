import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { ok, err } from '@/lib/api';

const INVALID_CREDENTIALS_MSG = '이메일 또는 비밀번호가 올바르지 않습니다.';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return err('이메일과 비밀번호를 입력해주세요.', 400);
    }

    // 사용자 조회
    const user = await prisma.user.findUnique({ where: { email } });

    // 사용자 없음과 비밀번호 불일치를 동일 메시지로 처리 (보안)
    if (!user) {
      return err(INVALID_CREDENTIALS_MSG, 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return err(INVALID_CREDENTIALS_MSG, 401);
    }

    // 역할별 villaId 조회
    let villaId: string | undefined;

    if (user.role === 'ADMIN') {
      const villa = await prisma.villa.findFirst({
        where: { adminId: user.id },
        select: { id: true },
      });
      villaId = villa?.id;
    } else if (user.role === 'RESIDENT') {
      const record = await prisma.residentRecord.findFirst({
        where: { userId: user.id },
        select: { villaId: true },
      });
      villaId = record?.villaId;
    }
    // SUPER_ADMIN: villaId 없음

    // JWT 발급
    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      villaId,
    });

    const { password: _, ...safeUser } = user;

    return ok({
      token,
      user: {
        id: safeUser.id,
        email: safeUser.email,
        name: safeUser.name,
        phone: safeUser.phone,
        role: safeUser.role,
        villaId,
      },
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

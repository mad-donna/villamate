import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, signToken } from '@/lib/auth';
import { ok, err } from '@/lib/api';

export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return err('인증이 필요합니다.', 401);

  const payload = await verifyToken(token);
  if (!payload || !payload.needsSetup) {
    return err('유효하지 않은 요청입니다.', 403);
  }

  const body = await req.json() as { name?: string; email?: string; phone?: string };
  const { name, email, phone } = body;

  if (!name || name.trim().length < 2) {
    return err('이름은 2자 이상 입력해주세요.', 400);
  }

  // 이메일 변경 시 중복 확인
  if (email && email !== payload.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== payload.sub) {
      return err('이미 사용 중인 이메일입니다.', 409);
    }
  }

  const updated = await prisma.user.update({
    where: { id: payload.sub },
    data: {
      name: name.trim(),
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
    },
  });

  // needsSetup 없는 새 JWT 발급
  const newToken = await signToken({
    sub: updated.id,
    email: updated.email,
    role: updated.role,
    villaId: payload.villaId,
  });

  return ok({
    token: newToken,
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      role: updated.role,
      villaId: payload.villaId,
    },
  });
}

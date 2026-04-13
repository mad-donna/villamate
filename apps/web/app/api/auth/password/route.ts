import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

export async function PATCH(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return err('인증이 필요합니다.', 401);

  const body = await req.json();
  const { currentPassword, newPassword } = body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    return err('현재 비밀번호와 새 비밀번호를 모두 입력해주세요.', 400);
  }

  if (newPassword.length < 8) {
    return err('새 비밀번호는 8자 이상이어야 합니다.', 400);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.sub },
    select: { password: true },
  });

  if (!dbUser) return err('사용자를 찾을 수 없습니다.', 404);
  if (!dbUser.password) return err('소셜 계정은 비밀번호를 변경할 수 없습니다.', 400);

  const passwordMatch = await bcrypt.compare(currentPassword, dbUser.password);
  if (!passwordMatch) {
    return err('현재 비밀번호가 올바르지 않습니다.', 401);
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.sub },
    data: { password: hashed },
  });

  return ok({ message: '비밀번호가 변경되었습니다.' });
}

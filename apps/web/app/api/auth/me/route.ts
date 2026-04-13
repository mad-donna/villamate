import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET /api/auth/me — 현재 로그인 유저 정보 조회
export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return err('인증이 필요합니다.', 401);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.sub },
    select: { id: true, email: true, name: true, phone: true, role: true },
  });
  if (!dbUser) return err('사용자를 찾을 수 없습니다.', 404);

  let villaId: string | undefined;
  let villa = null;

  if (dbUser.role === 'ADMIN') {
    const v = await prisma.villa.findFirst({
      where: { adminId: dbUser.id },
      select: { id: true, name: true, address: true, inviteCode: true, subscriptionStatus: true },
    });
    if (v) { villaId = v.id; villa = v; }
  } else if (dbUser.role === 'RESIDENT') {
    const r = await prisma.residentRecord.findFirst({
      where: { userId: dbUser.id, status: 'APPROVED' },
      select: { villaId: true, villa: { select: { id: true, name: true, address: true, inviteCode: true, subscriptionStatus: true } } },
    });
    if (r) { villaId = r.villaId; villa = r.villa; }
  }

  return ok({ user: { ...dbUser, villaId, villa } });
}

/**
 * DELETE /api/auth/me
 * 회원 탈퇴 — 소프트 삭제(익명화).
 *
 * 처리 내용:
 *  - name → "탈퇴 회원"
 *  - email → deleted_{id}@villamate.invalid  (unique 유지)
 *  - password → bcrypt(random) — 재로그인 불가
 *  - phone → null
 *
 * 데이터 보존 이유: 청구서·납부 이력, 투표 기록, 게시글은 서비스 무결성을 위해 그대로 유지하되,
 * 개인 식별 정보만 제거합니다. (author.name은 "탈퇴 회원"으로 표시됨)
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const existing = await prisma.user.findUnique({
      where: { id: user.sub },
      select: { id: true, role: true },
    });
    if (!existing) return err('사용자를 찾을 수 없습니다.', 404);

    // ADMIN(동대표)은 탈퇴 전에 빌라 관리자를 위임해야 하므로 제한
    if (existing.role === 'ADMIN') {
      const managedVillas = await prisma.villa.count({
        where: { adminId: user.sub },
      });
      if (managedVillas > 0) {
        return err(
          '관리 중인 빌라가 있습니다. 관리자 권한을 위임하거나 빌라를 폐쇄한 후 탈퇴해주세요.',
          400,
        );
      }
    }

    // 랜덤 비밀번호 해시 — 재로그인 차단
    const fakePassword = await bcrypt.hash(crypto.randomUUID(), 10);

    await prisma.user.update({
      where: { id: user.sub },
      data: {
        name: '탈퇴 회원',
        email: `deleted_${user.sub}@villamate.invalid`,
        password: fakePassword,
        phone: null,
      },
    });

    return ok({ message: '회원 탈퇴가 완료되었습니다.' });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

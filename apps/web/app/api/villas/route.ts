import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { getUser, ok, err } from '@/lib/api';

async function generateUniqueInviteCode(): Promise<string> {
  const MAX_ATTEMPTS = 10;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existing = await prisma.villa.findUnique({
      where: { inviteCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }

  // 극히 드물지만 모두 충돌 시 타임스탬프 기반 폴백
  return Date.now().toString(36).substring(-6).toUpperCase();
}

// POST: 빌라 등록
export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) {
      return err('인증이 필요합니다.', 401);
    }

    const body = await req.json();
    const { name, address, totalUnits, roomNumbers, accountBank, accountNumber } = body as {
      name?: string;
      address?: string;
      totalUnits?: number;
      roomNumbers?: string[];
      accountBank?: string;
      accountNumber?: string;
    };

    // 유효성 검사
    if (!name || name.trim().length < 1) {
      return err('빌라 이름을 입력해주세요.', 400);
    }
    if (!address || address.trim().length < 1) {
      return err('주소를 입력해주세요.', 400);
    }
    if (!totalUnits || typeof totalUnits !== 'number' || totalUnits < 1) {
      return err('세대수를 올바르게 입력해주세요.', 400);
    }

    // 초대 코드 생성 (충돌 방지)
    const inviteCode = await generateUniqueInviteCode();

    const villa = await prisma.villa.create({
      data: {
        name: name.trim(),
        address: address.trim(),
        totalUnits,
        inviteCode,
        roomNumbers: roomNumbers ?? [],
        accountBank: accountBank ?? null,
        accountNumber: accountNumber ?? null,
        adminId: user.sub,
      },
    });

    // 역할이 ADMIN이 아닌 경우 DB 업데이트 후 새 토큰 발급
    let newToken: string | undefined;
    if (user.role !== 'ADMIN') {
      await prisma.user.update({
        where: { id: user.sub },
        data: { role: 'ADMIN' },
      });
      newToken = await signToken({
        sub: user.sub,
        email: user.email,
        role: 'ADMIN',
        villaId: villa.id,
      });
    }

    return ok({ ...villa, token: newToken }, 201);
  } catch (e) {
    console.error('[POST /api/villas] error:', e);
    return err('서버 오류가 발생했습니다.', 500);
  }
}

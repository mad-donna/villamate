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

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return err(INVALID_CREDENTIALS_MSG, 401);
    }

    if (!user.password) {
      return err(INVALID_CREDENTIALS_MSG, 401);
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return err(INVALID_CREDENTIALS_MSG, 401);
    }

    let villaId: string | undefined;
    let villaData: {
      id: string;
      name: string;
      address: string;
      inviteCode: string;
      subscriptionStatus: string;
    } | undefined;
    let residentVillaData: {
      id: string;
      name: string;
      address: string;
      inviteCode: string;
      subscriptionStatus: string;
      roomNumber: string;
    } | undefined;

    if (user.role === 'ADMIN') {
      const villa = await prisma.villa.findFirst({
        where: { adminId: user.id },
      });
      if (villa) {
        villaId = villa.id;
        villaData = {
          id: villa.id,
          name: villa.name,
          address: villa.address,
          inviteCode: villa.inviteCode,
          subscriptionStatus: villa.subscriptionStatus,
        };

        // 관리자가 자신의 빌라에 입주민으로도 등록된 경우 (같은 빌라 듀얼 모드)
        const residentRecord = await prisma.residentRecord.findFirst({
          where: { userId: user.id, villaId: villa.id, status: 'APPROVED' },
        });
        if (residentRecord) {
          residentVillaData = {
            id: villa.id,
            name: villa.name,
            address: villa.address,
            inviteCode: villa.inviteCode,
            subscriptionStatus: villa.subscriptionStatus,
            roomNumber: residentRecord.roomNumber,
          };
        }
      }
    } else if (user.role === 'RESIDENT') {
      const record = await prisma.residentRecord.findFirst({
        where: { userId: user.id, status: 'APPROVED' },
        include: { villa: true },
      });
      if (record) {
        villaId = record.villaId;
        villaData = {
          id: record.villa.id,
          name: record.villa.name,
          address: record.villa.address,
          inviteCode: record.villa.inviteCode,
          subscriptionStatus: record.villa.subscriptionStatus,
        };
      }
    }

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
        ...(villaData ? { villa: villaData } : {}),
        ...(residentVillaData ? { residentVilla: residentVillaData } : {}),
      },
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

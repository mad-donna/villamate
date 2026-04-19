import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// POST: 초대 코드로 빌라 가입 (RESIDENT용, ADMIN 자신의 빌라 입주 포함)
export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) {
      return err('인증이 필요합니다.', 401);
    }

    const body = await req.json();
    const { inviteCode, roomNumber } = body as {
      inviteCode?: string;
      roomNumber?: string;
    };

    if (!inviteCode || inviteCode.trim().length === 0) {
      return err('초대 코드를 입력해주세요.', 400);
    }
    if (!roomNumber || roomNumber.trim().length === 0) {
      return err('호수를 입력해주세요.', 400);
    }

    const normalizedRoom = roomNumber.trim().replace(/호$/, '');

    // 초대 코드로 빌라 조회
    const villa = await prisma.villa.findUnique({
      where: { inviteCode: inviteCode.trim().toUpperCase() },
    });
    if (!villa) {
      return err('유효하지 않은 초대 코드입니다.', 404);
    }

    // 해당 villaId + roomNumber에 이미 다른 입주민 있는지 확인
    const roomTaken = await prisma.residentRecord.findFirst({
      where: { villaId: villa.id, roomNumber: normalizedRoom, userId: { not: user.sub } },
    });
    if (roomTaken) {
      return err('이미 등록된 호수입니다.', 409);
    }

    // 동일 빌라에 이미 가입한 사용자 확인
    const alreadyJoined = await prisma.residentRecord.findFirst({
      where: { villaId: villa.id, userId: user.sub },
    });
    if (alreadyJoined) {
      return err('이미 가입된 빌라입니다.', 409);
    }

    // HEAD/MEMBER 판별: 해당 roomNumber에 HEAD가 이미 있으면 MEMBER
    const existingHead = await prisma.residentRecord.findFirst({
      where: { villaId: villa.id, roomNumber: normalizedRoom, residentType: 'HEAD' },
    });
    const residentType = existingHead ? 'MEMBER' : 'HEAD';

    // 관리자가 자신의 빌라에 가입하는 경우 즉시 승인
    const isOwnVilla = villa.adminId === user.sub;
    const status = isOwnVilla ? 'APPROVED' : 'PENDING';

    await prisma.residentRecord.create({
      data: {
        userId: user.sub,
        villaId: villa.id,
        roomNumber: normalizedRoom,
        residentType,
        status,
      },
    });

    return ok({
      villa: {
        id: villa.id,
        name: villa.name,
        address: villa.address,
        inviteCode: villa.inviteCode,
        subscriptionStatus: villa.subscriptionStatus,
      },
      roomNumber: normalizedRoom,
      residentType,
      autoApproved: isOwnVilla,
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

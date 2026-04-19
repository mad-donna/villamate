import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';
import { createNotification } from '@/lib/notify';

// POST /api/villas/[villaId]/residents/join
// 인증 필요. body: { roomNumber: string }
// ResidentRecord를 status: PENDING으로 생성하고 빌라 admin에게 알림을 발송한다.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> }
) {
  try {
    const user = await getUser(req);
    if (!user) {
      return err('인증이 필요합니다.', 401);
    }

    const { villaId } = await params;

    const body = await req.json() as { roomNumber?: string };
    const roomNumber = body.roomNumber?.trim();

    if (!roomNumber) {
      return err('호수를 입력해주세요.', 400);
    }

    // 빌라 존재 여부 확인
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { id: true, name: true, address: true, inviteCode: true, subscriptionStatus: true, adminId: true },
    });

    if (!villa) {
      return err('빌라를 찾을 수 없습니다.', 404);
    }

    // 이미 PENDING 또는 APPROVED 상태로 가입 신청/완료된 경우 409
    const existing = await prisma.residentRecord.findFirst({
      where: {
        userId: user.sub,
        villaId,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (existing) {
      return err('이미 해당 빌라에 가입 신청 중이거나 승인된 계정입니다.', 409);
    }

    // 신청자 이름 조회
    const applicant = await prisma.user.findUnique({
      where: { id: user.sub },
      select: { name: true },
    });

    // 관리자가 자신의 빌라에 입주 신청하는 경우 즉시 승인
    const isOwnVilla = villa.adminId === user.sub;
    const status = isOwnVilla ? 'APPROVED' : 'PENDING';

    await prisma.residentRecord.create({
      data: {
        userId: user.sub,
        villaId,
        roomNumber,
        status,
      },
    });

    if (!isOwnVilla) {
      // 빌라 admin에게 알림 발송
      await createNotification({
        userId: villa.adminId,
        villaId,
        type: 'SYSTEM',
        title: '입주 신청이 도착했습니다',
        body: `${roomNumber}호 ${applicant?.name ?? ''}님이 입주 신청했습니다.`,
      });
    }

    if (isOwnVilla) {
      return ok({
        message: '입주민으로 등록되었습니다.',
        villa: {
          id: villa.id,
          name: villa.name,
          address: villa.address,
          inviteCode: villa.inviteCode,
          subscriptionStatus: villa.subscriptionStatus,
        },
        roomNumber,
      }, 201);
    }

    return ok({ message: '입주 신청이 완료되었습니다. 관리자 승인을 기다려주세요.' }, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

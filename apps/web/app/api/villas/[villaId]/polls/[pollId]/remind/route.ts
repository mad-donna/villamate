import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// POST: 투표 미참여 세대 독촉 알림 발송 (관리자 전용)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; pollId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId, pollId } = await params;

    // 관리자 검증
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('관리자만 독촉 알림을 발송할 수 있습니다.', 403);

    // 투표 확인
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      select: { id: true, title: true, villaId: true, endDate: true },
    });
    if (!poll || poll.villaId !== villaId) return err('투표를 찾을 수 없습니다.', 404);
    if (new Date(poll.endDate) < new Date()) return err('이미 마감된 투표입니다.', 400);

    // 이미 투표한 세대의 roomNumber 목록
    const votedRoomNumbers = await prisma.vote.findMany({
      where: { pollId },
      select: { roomNumber: true },
    });
    const votedSet = new Set(votedRoomNumbers.map((v) => v.roomNumber));

    // 미참여 세대주(HEAD) 조회
    const headResidents = await prisma.residentRecord.findMany({
      where: { villaId, residentType: 'HEAD', status: 'APPROVED' },
      select: { userId: true, roomNumber: true },
    });

    const nonVoters = headResidents.filter((r) => !votedSet.has(r.roomNumber));

    if (nonVoters.length === 0) {
      return ok({ sent: 0, message: '미참여 세대가 없습니다.' });
    }

    // 독촉 알림 발송
    await prisma.notification.createMany({
      data: nonVoters.map((r) => ({
        userId: r.userId,
        villaId,
        type: 'POLL' as const,
        title: '투표 참여를 부탁드립니다',
        body: `"${poll.title}" 투표에 아직 참여하지 않으셨습니다. 마감 전에 의견을 남겨주세요.`,
      })),
    });

    return ok({ sent: nonVoters.length });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

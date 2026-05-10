import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET: 투표 상세 (선택지별 득표수, 내 투표 여부)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; pollId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId, pollId } = await params;

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);

    const isAdmin = villa.adminId === user.sub;
    if (!isAdmin) {
      const resident = await prisma.residentRecord.findFirst({
        where: { villaId, userId: user.sub, status: 'APPROVED' },
        select: { id: true },
      });
      if (!resident) return err('접근 권한이 없습니다.', 403);
    }

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } },
            votes: {
              select: { roomNumber: true },
            },
          },
        },
        _count: { select: { votes: true } },
      },
    });

    if (!poll || poll.villaId !== villaId) return err('투표를 찾을 수 없습니다.', 404);

    // 내 투표 여부 확인
    const myVote = await prisma.vote.findFirst({
      where: { pollId, voterId: user.sub },
      select: { optionId: true },
    });

    // 내 호수 확인 (세대주 여부 포함)
    const myResident = await prisma.residentRecord.findFirst({
      where: { villaId, userId: user.sub, status: 'APPROVED' },
      select: { roomNumber: true, residentType: true },
    });

    const totalVotes = poll._count.votes;
    const isClosed = new Date(poll.endDate) < new Date();

    return ok({
      poll: {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        isAnonymous: poll.isAnonymous,
        endDate: poll.endDate,
        createdAt: poll.createdAt,
        isClosed,
        totalVotes,
        options: poll.options.map((o) => ({
          id: o.id,
          text: o.text,
          voteCount: o._count.votes,
          percent: totalVotes > 0 ? Math.round((o._count.votes / totalVotes) * 100) : 0,
          // 기명 투표 시 호수 목록 포함 (admin 또는 투표 마감 후)
          roomNumbers: (!poll.isAnonymous && (isAdmin || isClosed))
            ? o.votes.map((v) => v.roomNumber)
            : [],
        })),
      },
      myVotedOptionId: myVote?.optionId ?? null,
      myRoomNumber: myResident?.roomNumber ?? null,
      isHead: myResident?.residentType === 'HEAD',
      isAdmin,
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// PATCH: 투표 수정 (관리자 전용, 마감 전만 허용)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; pollId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId, pollId } = await params;

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('관리자만 투표를 수정할 수 있습니다.', 403);

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      select: { id: true, villaId: true, endDate: true },
    });
    if (!poll || poll.villaId !== villaId) return err('투표를 찾을 수 없습니다.', 404);
    if (new Date(poll.endDate) < new Date()) return err('마감된 투표는 수정할 수 없습니다.', 400);

    const body = (await req.json()) as {
      title?: string;
      description?: string;
      isAnonymous?: boolean;
      endDate?: string;
    };

    if (body.title !== undefined && !body.title.trim()) {
      return err('제목을 입력해주세요.', 400);
    }

    let parsedEndDate: Date | undefined;
    if (body.endDate) {
      parsedEndDate = new Date(body.endDate);
      if (isNaN(parsedEndDate.getTime()) || parsedEndDate <= new Date()) {
        return err('종료일은 현재 시간 이후여야 합니다.', 400);
      }
    }

    const updated = await prisma.poll.update({
      where: { id: pollId },
      data: {
        ...(body.title ? { title: body.title.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description.trim() || null } : {}),
        ...(body.isAnonymous !== undefined ? { isAnonymous: body.isAnonymous } : {}),
        ...(parsedEndDate ? { endDate: parsedEndDate } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        isAnonymous: true,
        endDate: true,
      },
    });

    return ok(updated);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

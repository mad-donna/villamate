import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// POST: 투표 참여 (HEAD 세대주 전용, 1세대 1표)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; pollId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId, pollId } = await params;

    // 세대주(HEAD)만 투표 가능
    const resident = await prisma.residentRecord.findFirst({
      where: { villaId, userId: user.sub, status: 'APPROVED' },
      select: { roomNumber: true, residentType: true },
    });
    if (!resident) return err('접근 권한이 없습니다.', 403);
    if (resident.residentType !== 'HEAD') return err('세대주만 투표할 수 있습니다.', 403);

    // 투표 존재 및 마감 여부 확인
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      select: { id: true, villaId: true, endDate: true, options: { select: { id: true } } },
    });
    if (!poll || poll.villaId !== villaId) return err('투표를 찾을 수 없습니다.', 404);
    if (new Date(poll.endDate) < new Date()) return err('마감된 투표입니다.', 400);

    const body = (await req.json()) as { optionId?: string };
    if (!body.optionId) return err('선택지를 선택해주세요.', 400);

    const validOption = poll.options.find((o) => o.id === body.optionId);
    if (!validOption) return err('유효하지 않은 선택지입니다.', 400);

    // 1세대 1표: @@unique([pollId, roomNumber]) 제약조건
    try {
      const vote = await prisma.vote.create({
        data: {
          pollId,
          optionId: body.optionId,
          voterId: user.sub,
          roomNumber: resident.roomNumber,
        },
      });
      return ok({ vote }, 201);
    } catch (e: unknown) {
      // Prisma unique constraint violation (P2002)
      if (
        e !== null &&
        typeof e === 'object' &&
        'code' in e &&
        (e as { code: string }).code === 'P2002'
      ) {
        return err('이미 투표한 세대입니다.', 409);
      }
      throw e;
    }
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

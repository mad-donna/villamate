/**
 * 투표 도메인 테스트
 * - POST /api/villas/[villaId]/polls/[pollId]/vote: 투표 참여
 *   - HEAD 세대주 전용, 마감 투표 차단, 1세대 1표 P2002 처리
 */

import { makeRequest, authHeaders, json } from '../helpers/request';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    residentRecord: { findFirst: jest.fn() },
    poll: { findUnique: jest.fn() },
    vote: { create: jest.fn() },
  },
}));

jest.mock('@/lib/auth', () => ({ signToken: jest.fn(), verifyToken: jest.fn() }));

import { prisma } from '@/lib/prisma';
import { POST } from '@/app/api/villas/[villaId]/polls/[pollId]/vote/route';

const VILLA_ID = 'villa-1';
const POLL_ID = 'poll-1';
const USER_ID = 'user-1';
const OPTION_ID = 'option-1';

const params = Promise.resolve({ villaId: VILLA_ID, pollId: POLL_ID });

function voteReq(body?: unknown) {
  return makeRequest(`/api/villas/${VILLA_ID}/polls/${POLL_ID}/vote`, {
    method: 'POST',
    body,
    headers: authHeaders({ sub: USER_ID, role: 'RESIDENT', villaId: VILLA_ID }),
  }) as never;
}

const activePoll = {
  id: POLL_ID,
  villaId: VILLA_ID,
  endDate: new Date(Date.now() + 86400_000), // 내일
  options: [{ id: OPTION_ID }],
};

const expiredPoll = {
  ...activePoll,
  endDate: new Date(Date.now() - 86400_000), // 어제
};

describe('POST /api/villas/[villaId]/polls/[pollId]/vote', () => {
  beforeEach(() => jest.clearAllMocks());

  test('입주민 record 없으면 403', async () => {
    (prisma.residentRecord.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await POST(voteReq({ optionId: OPTION_ID }), { params });
    expect(res.status).toBe(403);
  });

  test('MEMBER(세대원) 투표 시도 시 403', async () => {
    (prisma.residentRecord.findFirst as jest.Mock).mockResolvedValue({
      roomNumber: '101',
      residentType: 'MEMBER',
    });

    const res = await POST(voteReq({ optionId: OPTION_ID }), { params });
    expect(res.status).toBe(403);
    const data = await json<{ error: string }>(res);
    expect(data.error).toMatch(/세대주/);
  });

  test('마감된 투표에 참여 시 400', async () => {
    (prisma.residentRecord.findFirst as jest.Mock).mockResolvedValue({
      roomNumber: '101',
      residentType: 'HEAD',
    });
    (prisma.poll.findUnique as jest.Mock).mockResolvedValue(expiredPoll);

    const res = await POST(voteReq({ optionId: OPTION_ID }), { params });
    expect(res.status).toBe(400);
    const data = await json<{ error: string }>(res);
    expect(data.error).toMatch(/마감/);
  });

  test('유효하지 않은 선택지 시 400', async () => {
    (prisma.residentRecord.findFirst as jest.Mock).mockResolvedValue({
      roomNumber: '101',
      residentType: 'HEAD',
    });
    (prisma.poll.findUnique as jest.Mock).mockResolvedValue(activePoll);

    const res = await POST(voteReq({ optionId: 'invalid-option' }), { params });
    expect(res.status).toBe(400);
  });

  test('정상 투표 시 201', async () => {
    (prisma.residentRecord.findFirst as jest.Mock).mockResolvedValue({
      roomNumber: '101',
      residentType: 'HEAD',
    });
    (prisma.poll.findUnique as jest.Mock).mockResolvedValue(activePoll);
    (prisma.vote.create as jest.Mock).mockResolvedValue({ id: 'vote-1' });

    const res = await POST(voteReq({ optionId: OPTION_ID }), { params });
    expect(res.status).toBe(201);
  });

  test('중복 투표(P2002) 시 409', async () => {
    (prisma.residentRecord.findFirst as jest.Mock).mockResolvedValue({
      roomNumber: '101',
      residentType: 'HEAD',
    });
    (prisma.poll.findUnique as jest.Mock).mockResolvedValue(activePoll);
    (prisma.vote.create as jest.Mock).mockRejectedValue({ code: 'P2002' });

    const res = await POST(voteReq({ optionId: OPTION_ID }), { params });
    expect(res.status).toBe(409);
    const data = await json<{ error: string }>(res);
    expect(data.error).toMatch(/이미 투표/);
  });
});

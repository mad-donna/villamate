/**
 * api.spec.ts — Integration tests for the Villamate Express API
 *
 * Strategy: Mock @prisma/client entirely before importing the app so that the
 * module-level `const prisma = new PrismaClient()` inside index.ts receives our
 * mock instance.  All database interaction is stubbed — no real DB connection is
 * made during the test run.
 */

import request from 'supertest';

// ─── Mock PrismaClient BEFORE importing the app ───────────────────────────────
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    villa: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    residentRecord: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    invoice: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    invoicePayment: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    post: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    comment: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    externalBilling: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    buildingEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    vehicle: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    poll: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    pollOption: {
      findUnique: jest.fn(),
    },
    vote: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// ─── Import app AFTER the mock is in place ────────────────────────────────────
import { app } from './index';
import { PrismaClient } from '@prisma/client';

// Obtain a reference to the mock instance that index.ts constructed
const prisma = new PrismaClient() as any;

// ─── Helper: reset all mocks between tests ────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
});

// =============================================================================
// 1. External Billing — POST create
// =============================================================================
describe('POST /api/villas/:villaId/external-bills', () => {
  const validBody = {
    targetName: '홍길동',
    phoneNumber: '010-1234-5678',
    amount: 150000,
    description: '주차장 관리비',
    dueDate: '2026-03-31',
  };

  it('returns 201 with the created bill when all fields are provided', async () => {
    const mockBill = {
      id: 'bill-uuid-001',
      villaId: 1,
      ...validBody,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    prisma.externalBilling.create.mockResolvedValue(mockBill);

    const res = await request(app)
      .post('/api/villas/1/external-bills')
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 'bill-uuid-001', status: 'PENDING' });
    expect(prisma.externalBilling.create).toHaveBeenCalledTimes(1);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/villas/1/external-bills')
      .send({ targetName: '홍길동' }); // missing phoneNumber, amount, description, dueDate

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(prisma.externalBilling.create).not.toHaveBeenCalled();
  });

  it('returns 400 for non-numeric villaId', async () => {
    const res = await request(app)
      .post('/api/villas/not-a-number/external-bills')
      .send(validBody);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid villaId');
  });
});

// =============================================================================
// 2. External Billing — GET list
// =============================================================================
describe('GET /api/villas/:villaId/external-bills', () => {
  it('returns 200 with an array of bills', async () => {
    const mockBills = [
      { id: 'bill-001', targetName: '이순신', amount: 100000, status: 'PENDING' },
      { id: 'bill-002', targetName: '강감찬', amount: 200000, status: 'COMPLETED' },
    ];
    prisma.externalBilling.findMany.mockResolvedValue(mockBills);

    const res = await request(app).get('/api/villas/1/external-bills');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(prisma.externalBilling.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { villaId: 1 } })
    );
  });

  it('returns 400 for non-numeric villaId', async () => {
    const res = await request(app).get('/api/villas/abc/external-bills');

    expect(res.status).toBe(400);
  });
});

// =============================================================================
// 3. External Billing — PATCH confirm
// =============================================================================
describe('PATCH /api/villas/:villaId/external-bills/:billId/confirm', () => {
  it('returns 200 and marks the bill as COMPLETED', async () => {
    const mockUpdated = { id: 'bill-uuid-001', status: 'COMPLETED' };
    prisma.externalBilling.update.mockResolvedValue(mockUpdated);

    const res = await request(app).patch('/api/villas/1/external-bills/bill-uuid-001/confirm');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'COMPLETED' });
    expect(prisma.externalBilling.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'bill-uuid-001' },
        data: { status: 'COMPLETED' },
      })
    );
  });
});

// =============================================================================
// 4. Public pay page — GET HTML
// =============================================================================
describe('GET /pay/:billId', () => {
  it('returns 200 with HTML containing Korean billing text', async () => {
    const mockBill = {
      id: 'bill-uuid-001',
      targetName: '홍길동',
      description: '주차장 관리비',
      amount: 150000,
      dueDate: '2026-03-31',
      status: 'PENDING',
      villa: { accountNumber: '123-456-789', bankName: '국민은행' },
    };
    prisma.externalBilling.findUnique.mockResolvedValue(mockBill);

    const res = await request(app).get('/pay/bill-uuid-001');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    // The page contains the "notify" button text (in Korean)
    expect(res.text).toContain('입금 완료 알림 보내기');
    // The page shows the target name
    expect(res.text).toContain('홍길동');
  });

  it('returns 404 HTML when the bill does not exist', async () => {
    prisma.externalBilling.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/pay/nonexistent-id');

    expect(res.status).toBe(404);
    expect(res.text).toContain('청구서를 찾을 수 없습니다');
  });
});

// =============================================================================
// 5. Public notify — POST
// =============================================================================
describe('POST /api/public/pay/:billId/notify', () => {
  it('returns 200 with success:true and sets status to PENDING_CONFIRMATION', async () => {
    const mockUpdated = { id: 'bill-uuid-001', status: 'PENDING_CONFIRMATION' };
    prisma.externalBilling.update.mockResolvedValue(mockUpdated);

    const res = await request(app).post('/api/public/pay/bill-uuid-001/notify');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true });
    expect(prisma.externalBilling.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'bill-uuid-001' },
        data: { status: 'PENDING_CONFIRMATION' },
      })
    );
  });
});

// =============================================================================
// 6. Dashboard — Admin role
// =============================================================================
describe('GET /api/dashboard/:userId?role=ADMIN', () => {
  it('returns 200 with admin stats (totalUnpaidCount, pendingExternalBillsCount, latestNotice, activePollsCount)', async () => {
    prisma.invoicePayment.count.mockResolvedValue(5);
    prisma.externalBilling.count.mockResolvedValue(2);
    prisma.post.findFirst.mockResolvedValue({
      id: 'post-001',
      title: '공지사항 제목',
      createdAt: new Date().toISOString(),
    });
    prisma.poll.count.mockResolvedValue(3);

    const res = await request(app)
      .get('/api/dashboard/admin-user-id')
      .query({ villaId: '1', role: 'ADMIN' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      totalUnpaidCount: 5,
      pendingExternalBillsCount: 2,
      activePollsCount: 3,
    });
    expect(res.body).toHaveProperty('latestNotice');
    expect(res.body.latestNotice).toMatchObject({ title: '공지사항 제목' });
  });

  it('returns 400 when villaId is missing', async () => {
    const res = await request(app)
      .get('/api/dashboard/admin-user-id')
      .query({ role: 'ADMIN' }); // no villaId

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when role is neither ADMIN nor RESIDENT', async () => {
    const res = await request(app)
      .get('/api/dashboard/some-user')
      .query({ villaId: '1', role: 'UNKNOWN' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// =============================================================================
// 7. Dashboard — Resident role
// =============================================================================
describe('GET /api/dashboard/:userId?role=RESIDENT', () => {
  it('returns 200 with resident stats (myUnpaidAmount, latestNotice, myVehicleCount, activePollsCount)', async () => {
    prisma.invoicePayment.aggregate.mockResolvedValue({ _sum: { amount: 75000 } });
    prisma.post.findFirst.mockResolvedValue({
      id: 'post-002',
      title: '입주민 공지',
      createdAt: new Date().toISOString(),
    });
    prisma.vehicle.count.mockResolvedValue(1);
    prisma.vote.findMany.mockResolvedValue([]);
    prisma.poll.count.mockResolvedValue(2);

    const res = await request(app)
      .get('/api/dashboard/resident-user-id')
      .query({ villaId: '1', role: 'RESIDENT' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      myUnpaidAmount: 75000,
      myVehicleCount: 1,
      activePollsCount: 2,
    });
    expect(res.body).toHaveProperty('latestNotice');
  });

  it('returns myUnpaidAmount of 0 when there are no pending payments', async () => {
    prisma.invoicePayment.aggregate.mockResolvedValue({ _sum: { amount: null } });
    prisma.post.findFirst.mockResolvedValue(null);
    prisma.vehicle.count.mockResolvedValue(0);
    prisma.vote.findMany.mockResolvedValue([]);
    prisma.poll.count.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/dashboard/resident-user-id')
      .query({ villaId: '1', role: 'RESIDENT' });

    expect(res.status).toBe(200);
    expect(res.body.myUnpaidAmount).toBe(0);
  });
});

// =============================================================================
// 8. Polls — Create
// =============================================================================
describe('POST /api/villas/:villaId/polls', () => {
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const validBody = {
    title: '엘리베이터 교체 찬반 투표',
    endDate: futureDate,
    isAnonymous: false,
    creatorId: 'admin-user-id',
    options: ['찬성', '반대'],
  };

  it('returns 201 with the created poll when all required fields are provided', async () => {
    const mockPoll = {
      id: 'poll-uuid-001',
      title: validBody.title,
      villaId: 1,
      endDate: futureDate,
      isAnonymous: false,
      creatorId: 'admin-user-id',
      options: [
        { id: 'opt-001', text: '찬성', pollId: 'poll-uuid-001' },
        { id: 'opt-002', text: '반대', pollId: 'poll-uuid-001' },
      ],
    };
    prisma.poll.create.mockResolvedValue(mockPoll);

    const res = await request(app)
      .post('/api/villas/1/polls')
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 'poll-uuid-001', title: validBody.title });
    expect(res.body.options).toHaveLength(2);
    expect(prisma.poll.create).toHaveBeenCalledTimes(1);
  });

  it('returns 400 when options array has fewer than 2 items', async () => {
    const res = await request(app)
      .post('/api/villas/1/polls')
      .send({ ...validBody, options: ['찬성'] });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(prisma.poll.create).not.toHaveBeenCalled();
  });

  it('returns 400 when required fields (title) are missing', async () => {
    const { title: _ignored, ...bodyWithoutTitle } = validBody;
    const res = await request(app)
      .post('/api/villas/1/polls')
      .send(bodyWithoutTitle);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// =============================================================================
// 9. Polls — List
// =============================================================================
describe('GET /api/villas/:villaId/polls', () => {
  it('returns 200 with an array of polls', async () => {
    const mockPolls = [
      {
        id: 'poll-001',
        title: '투표 제목 1',
        options: [],
        _count: { votes: 0 },
      },
      {
        id: 'poll-002',
        title: '투표 제목 2',
        options: [],
        _count: { votes: 3 },
      },
    ];
    prisma.poll.findMany.mockResolvedValue(mockPolls);

    const res = await request(app).get('/api/villas/1/polls');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(prisma.poll.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { villaId: 1 } })
    );
  });
});

// =============================================================================
// 10. Vote — 1세대 1표 enforcement
// =============================================================================
describe('POST /api/villas/:villaId/polls/:pollId/vote — 1세대 1표', () => {
  const pollId = 'poll-uuid-001';
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  it('returns 201 on the first vote from a resident', async () => {
    // Resident is a member of the villa
    prisma.residentRecord.findFirst.mockResolvedValue({ userId: 'resident-1', villaId: 1, roomNumber: '101' });
    // Poll is active (endDate in the future)
    prisma.poll.findUnique.mockResolvedValue({ id: pollId, villaId: 1, endDate: futureDate });
    // No existing vote for this roomNumber in this poll
    prisma.vote.findUnique.mockResolvedValue(null);
    // Vote is created successfully
    prisma.vote.create.mockResolvedValue({
      id: 'vote-uuid-001',
      pollId,
      optionId: 'opt-001',
      voterId: 'resident-1',
      roomNumber: '101',
    });

    const res = await request(app)
      .post(`/api/villas/1/polls/${pollId}/vote`)
      .send({ voterId: 'resident-1', optionId: 'opt-001' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ pollId, roomNumber: '101' });
    expect(prisma.vote.create).toHaveBeenCalledTimes(1);
  });

  it('returns 409 with 이미 투표한 세대입니다 when the same household votes twice', async () => {
    // Resident is still a member
    prisma.residentRecord.findFirst.mockResolvedValue({ userId: 'resident-1', villaId: 1, roomNumber: '101' });
    // Poll is still active
    prisma.poll.findUnique.mockResolvedValue({ id: pollId, villaId: 1, endDate: futureDate });
    // An existing vote already exists for this roomNumber
    prisma.vote.findUnique.mockResolvedValue({
      id: 'vote-existing',
      pollId,
      roomNumber: '101',
    });

    const res = await request(app)
      .post(`/api/villas/1/polls/${pollId}/vote`)
      .send({ voterId: 'resident-1', optionId: 'opt-002' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/이미 투표한 세대입니다/);
    expect(prisma.vote.create).not.toHaveBeenCalled();
  });
});

// =============================================================================
// 11. Vote — non-resident cannot vote
// =============================================================================
describe('POST /api/villas/:villaId/polls/:pollId/vote — non-resident', () => {
  it('returns 403 when the voter is not a resident of the villa', async () => {
    // residentRecord.findFirst returns null → not a resident
    prisma.residentRecord.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/villas/1/polls/poll-uuid-001/vote')
      .send({ voterId: 'outsider-user', optionId: 'opt-001' });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/입주민이 아닙니다/);
    // Should not proceed to check the poll or create a vote
    expect(prisma.poll.findUnique).not.toHaveBeenCalled();
    expect(prisma.vote.create).not.toHaveBeenCalled();
  });
});

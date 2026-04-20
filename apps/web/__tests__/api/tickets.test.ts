/**
 * 민원(Ticket) 도메인 테스트
 * - GET /api/villas/[villaId]/tickets: 목록 (ADMIN=전체, RESIDENT=본인)
 * - POST /api/villas/[villaId]/tickets: 민원 접수 (유효성, 카테고리 검증)
 */

import { makeRequest, authHeaders, json } from '../helpers/request';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    villa: { findUnique: jest.fn() },
    ticket: { findMany: jest.fn(), create: jest.fn() },
    residentRecord: { findFirst: jest.fn() },
  },
}));

jest.mock('@/lib/auth', () => ({ signToken: jest.fn(), verifyToken: jest.fn() }));

import { prisma } from '@/lib/prisma';
import { GET, POST } from '@/app/api/villas/[villaId]/tickets/route';

const VILLA_ID = 'villa-1';
const ADMIN_ID = 'admin-1';
const USER_ID = 'user-1';
const params = Promise.resolve({ villaId: VILLA_ID });

const mockVilla = { id: VILLA_ID, adminId: ADMIN_ID };
const mockTicket = {
  id: 'ticket-1',
  villaId: VILLA_ID,
  reporterId: USER_ID,
  title: '주차 문제',
  description: '무단 주차 차량이 있습니다.',
  category: 'PARKING',
  status: 'PENDING',
  createdAt: new Date(),
  updatedAt: new Date(),
  reporter: { id: USER_ID, name: '홍길동' },
};

describe('GET /api/villas/[villaId]/tickets', () => {
  beforeEach(() => jest.clearAllMocks());

  test('인증 없으면 401', async () => {
    const res = await GET(
      makeRequest(`/api/villas/${VILLA_ID}/tickets`) as never,
      { params },
    );
    expect(res.status).toBe(401);
  });

  test('ADMIN이 다른 빌라 조회 시 403', async () => {
    (prisma.villa.findUnique as jest.Mock).mockResolvedValue({ ...mockVilla, adminId: 'other' });

    const res = await GET(
      makeRequest(`/api/villas/${VILLA_ID}/tickets`, {
        headers: authHeaders({ sub: ADMIN_ID, role: 'ADMIN', villaId: VILLA_ID }),
      }) as never,
      { params },
    );
    expect(res.status).toBe(403);
  });

  test('ADMIN 본인 빌라 조회 시 200 + 전체 티켓', async () => {
    (prisma.villa.findUnique as jest.Mock).mockResolvedValue(mockVilla);
    (prisma.ticket.findMany as jest.Mock).mockResolvedValue([mockTicket]);

    const res = await GET(
      makeRequest(`/api/villas/${VILLA_ID}/tickets`, {
        headers: authHeaders({ sub: ADMIN_ID, role: 'ADMIN', villaId: VILLA_ID }),
      }) as never,
      { params },
    );
    expect(res.status).toBe(200);
    const data = await json<{ tickets: unknown[] }>(res);
    expect(data.tickets).toHaveLength(1);
  });
});

describe('POST /api/villas/[villaId]/tickets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.villa.findUnique as jest.Mock).mockResolvedValue(mockVilla);
    (prisma.residentRecord.findFirst as jest.Mock).mockResolvedValue({ id: 'rr-1' });
  });

  test('제목 누락 시 400', async () => {
    const res = await POST(
      makeRequest(`/api/villas/${VILLA_ID}/tickets`, {
        method: 'POST',
        body: { description: '내용', category: 'PARKING' },
        headers: authHeaders({ sub: USER_ID, role: 'RESIDENT' }),
      }) as never,
      { params },
    );
    expect(res.status).toBe(400);
  });

  test('잘못된 카테고리 시 400', async () => {
    const res = await POST(
      makeRequest(`/api/villas/${VILLA_ID}/tickets`, {
        method: 'POST',
        body: { title: '민원', description: '내용', category: 'INVALID' },
        headers: authHeaders({ sub: USER_ID, role: 'RESIDENT' }),
      }) as never,
      { params },
    );
    expect(res.status).toBe(400);
  });

  test('미승인 입주민은 403', async () => {
    (prisma.residentRecord.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await POST(
      makeRequest(`/api/villas/${VILLA_ID}/tickets`, {
        method: 'POST',
        body: { title: '주차 문제', description: '무단 주차 차량', category: 'PARKING' },
        headers: authHeaders({ sub: USER_ID, role: 'RESIDENT' }),
      }) as never,
      { params },
    );
    expect(res.status).toBe(403);
  });

  test('정상 민원 접수 시 201', async () => {
    (prisma.ticket.create as jest.Mock).mockResolvedValue(mockTicket);

    const res = await POST(
      makeRequest(`/api/villas/${VILLA_ID}/tickets`, {
        method: 'POST',
        body: { title: '주차 문제', description: '무단 주차 차량', category: 'PARKING' },
        headers: authHeaders({ sub: USER_ID, role: 'RESIDENT' }),
      }) as never,
      { params },
    );
    expect(res.status).toBe(201);
  });

  test('모든 카테고리 값 유효성 통과', async () => {
    const validCategories = ['COMMON_FACILITY', 'PARKING', 'NOISE_COMPLAINT', 'ETC'];
    (prisma.ticket.create as jest.Mock).mockResolvedValue(mockTicket);

    for (const category of validCategories) {
      const res = await POST(
        makeRequest(`/api/villas/${VILLA_ID}/tickets`, {
          method: 'POST',
          body: { title: '테스트', description: '내용', category },
          headers: authHeaders({ sub: USER_ID, role: 'RESIDENT' }),
        }) as never,
        { params },
      );
      expect(res.status).toBe(201);
    }
  });
});

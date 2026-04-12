/**
 * 공용 장부 도메인 테스트
 * - GET /api/villas/[villaId]/ledger: 월별 필터 조회
 * - POST /api/villas/[villaId]/ledger: 내역 등록 (ADMIN 전용)
 */

import { makeRequest, authHeaders, json } from '../helpers/request';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    villa: { findUnique: jest.fn() },
    ledgerTransaction: { findMany: jest.fn(), create: jest.fn() },
  },
}));

jest.mock('@/lib/auth', () => ({ signToken: jest.fn(), verifyToken: jest.fn() }));

import { prisma } from '@/lib/prisma';
import { GET, POST } from '@/app/api/villas/[villaId]/ledger/route';

const VILLA_ID = 'villa-1';
const ADMIN_ID = 'admin-1';
const USER_ID = 'user-2';
const params = Promise.resolve({ villaId: VILLA_ID });

const mockVilla = { id: VILLA_ID, adminId: ADMIN_ID };
const mockTx = {
  id: 'tx-1',
  villaId: VILLA_ID,
  type: 'INCOME',
  amount: 100000,
  description: '관리비 수입',
  transactionDate: new Date('2026-04-01'),
  receiptUrl: null,
  createdBy: ADMIN_ID,
  createdAt: new Date(),
};

describe('GET /api/villas/[villaId]/ledger', () => {
  beforeEach(() => jest.clearAllMocks());

  test('인증 없으면 401', async () => {
    const res = await GET(makeRequest(`/api/villas/${VILLA_ID}/ledger`) as never, { params });
    expect(res.status).toBe(401);
  });

  test('빌라 구성원이 정상 조회 시 200', async () => {
    (prisma.villa.findUnique as jest.Mock).mockResolvedValue(mockVilla);
    (prisma.ledgerTransaction.findMany as jest.Mock).mockResolvedValue([mockTx]);

    const res = await GET(
      makeRequest(`/api/villas/${VILLA_ID}/ledger`, {
        headers: authHeaders({ sub: ADMIN_ID, role: 'ADMIN', villaId: VILLA_ID }),
      }) as never,
      { params },
    );
    expect(res.status).toBe(200);
  });
});

describe('POST /api/villas/[villaId]/ledger', () => {
  beforeEach(() => jest.clearAllMocks());

  test('ADMIN이 아닌 경우 403', async () => {
    (prisma.villa.findUnique as jest.Mock).mockResolvedValue(mockVilla);

    const res = await POST(
      makeRequest(`/api/villas/${VILLA_ID}/ledger`, {
        method: 'POST',
        body: { type: 'INCOME', amount: 50000, description: '수입', transactionDate: '2026-04-01' },
        headers: authHeaders({ sub: USER_ID, role: 'RESIDENT', villaId: VILLA_ID }),
      }) as never,
      { params },
    );
    expect(res.status).toBe(403);
  });

  test('필수 필드 누락 시 400', async () => {
    (prisma.villa.findUnique as jest.Mock).mockResolvedValue(mockVilla);

    const res = await POST(
      makeRequest(`/api/villas/${VILLA_ID}/ledger`, {
        method: 'POST',
        body: { type: 'INCOME' }, // amount, description, transactionDate 누락
        headers: authHeaders({ sub: ADMIN_ID, role: 'ADMIN', villaId: VILLA_ID }),
      }) as never,
      { params },
    );
    expect(res.status).toBe(400);
  });

  test('ADMIN이 정상 등록 시 201', async () => {
    (prisma.villa.findUnique as jest.Mock).mockResolvedValue(mockVilla);
    (prisma.ledgerTransaction.create as jest.Mock).mockResolvedValue(mockTx);

    const res = await POST(
      makeRequest(`/api/villas/${VILLA_ID}/ledger`, {
        method: 'POST',
        body: {
          type: 'INCOME',
          amount: 100000,
          description: '관리비 수입',
          transactionDate: '2026-04-01',
        },
        headers: authHeaders({ sub: ADMIN_ID, role: 'ADMIN', villaId: VILLA_ID }),
      }) as never,
      { params },
    );
    expect(res.status).toBe(201);
  });
});

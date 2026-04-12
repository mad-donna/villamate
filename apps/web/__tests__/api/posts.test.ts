/**
 * 커뮤니티 게시글 도메인 테스트
 * - GET /api/villas/[villaId]/posts: 목록 조회 (빌라 접근 검증)
 * - POST /api/villas/[villaId]/posts: 게시글 작성, 공지 권한 검사
 */

import { makeRequest, authHeaders, json } from '../helpers/request';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    villa: { findUnique: jest.fn() },
    residentRecord: { findFirst: jest.fn(), findMany: jest.fn() },
    post: { findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
    notification: { createMany: jest.fn() },
  },
}));

jest.mock('@/lib/auth', () => ({
  signToken: jest.fn(),
  verifyToken: jest.fn(),
}));

import { prisma } from '@/lib/prisma';
import { GET, POST } from '@/app/api/villas/[villaId]/posts/route';

const VILLA_ID = 'villa-1';
const USER_ID = 'user-1';
const ADMIN_ID = 'admin-1';

const mockVilla = { id: VILLA_ID, adminId: ADMIN_ID };
const mockPost = {
  id: 'post-1',
  villaId: VILLA_ID,
  authorId: USER_ID,
  title: '테스트 게시글',
  content: '내용입니다.',
  category: 'GENERAL',
  isNotice: false,
  imageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  author: { id: USER_ID, name: '홍길동' },
  _count: { comments: 0 },
};

const params = Promise.resolve({ villaId: VILLA_ID });

function residentReq(method = 'GET', body?: unknown) {
  return makeRequest(`/api/villas/${VILLA_ID}/posts`, {
    method,
    body,
    headers: authHeaders({ sub: USER_ID, role: 'RESIDENT', villaId: VILLA_ID }),
  }) as never;
}

function adminReq(method = 'GET', body?: unknown) {
  return makeRequest(`/api/villas/${VILLA_ID}/posts`, {
    method,
    body,
    headers: authHeaders({ sub: ADMIN_ID, role: 'ADMIN', villaId: VILLA_ID }),
  }) as never;
}

describe('GET /api/villas/[villaId]/posts', () => {
  beforeEach(() => jest.clearAllMocks());

  test('빌라 접근 권한 없으면 403', async () => {
    (prisma.villa.findUnique as jest.Mock).mockResolvedValue(mockVilla);
    (prisma.residentRecord.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await GET(residentReq(), { params });
    expect(res.status).toBe(403);
  });

  test('입주민이 정상 조회 시 200 + posts 배열', async () => {
    (prisma.villa.findUnique as jest.Mock).mockResolvedValue(mockVilla);
    (prisma.residentRecord.findFirst as jest.Mock).mockResolvedValue({ id: 'r-1' });
    (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPost]);

    const res = await GET(residentReq(), { params });
    expect(res.status).toBe(200);
    const data = await json<{ posts: unknown[] }>(res);
    expect(data.posts).toHaveLength(1);
  });
});

describe('POST /api/villas/[villaId]/posts', () => {
  beforeEach(() => jest.clearAllMocks());

  test('제목 누락 시 400', async () => {
    (prisma.villa.findUnique as jest.Mock).mockResolvedValue(mockVilla);
    (prisma.residentRecord.findFirst as jest.Mock).mockResolvedValue({ id: 'r-1' });

    const res = await POST(
      residentReq('POST', { content: '내용만 있음' }),
      { params },
    );
    expect(res.status).toBe(400);
  });

  test('입주민이 공지 등록 시도 시 403', async () => {
    (prisma.villa.findUnique as jest.Mock).mockResolvedValue(mockVilla);
    (prisma.residentRecord.findFirst as jest.Mock).mockResolvedValue({ id: 'r-1' });

    const res = await POST(
      residentReq('POST', { title: '공지', content: '내용', isNotice: true }),
      { params },
    );
    expect(res.status).toBe(403);
  });

  test('관리자가 정상 게시글 작성 시 201', async () => {
    (prisma.villa.findUnique as jest.Mock).mockResolvedValue(mockVilla);
    (prisma.residentRecord.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.post.create as jest.Mock).mockResolvedValue(mockPost);

    const res = await POST(
      adminReq('POST', { title: '새 게시글', content: '내용입니다.' }),
      { params },
    );
    expect(res.status).toBe(201);
  });

  test('공지 3개 초과 시 400', async () => {
    (prisma.villa.findUnique as jest.Mock).mockResolvedValue(mockVilla);
    (prisma.residentRecord.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.post.count as jest.Mock).mockResolvedValue(3);

    const res = await POST(
      adminReq('POST', { title: '공지', content: '내용', isNotice: true }),
      { params },
    );
    expect(res.status).toBe(400);
  });
});

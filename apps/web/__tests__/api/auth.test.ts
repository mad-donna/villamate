/**
 * 인증 도메인 테스트
 * - POST /api/auth/register: 회원가입 유효성 검사, 중복 이메일
 * - POST /api/auth/login: 로그인 성공/실패, JWT 발급
 */

import { makeRequest, json } from '../helpers/request';

// Prisma 모킹
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    villa: {
      findFirst: jest.fn(),
    },
    residentRecord: {
      findFirst: jest.fn(),
    },
  },
}));

// bcrypt 모킹 (테스트 속도 향상)
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

// JWT 모킹
jest.mock('@/lib/auth', () => ({
  signToken: jest.fn().mockResolvedValue('mock_jwt_token'),
  verifyToken: jest.fn(),
}));

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { POST as register } from '@/app/api/auth/register/route';
import { POST as login } from '@/app/api/auth/login/route';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: '홍길동',
  phone: null,
  password: 'hashed_password',
  role: 'RESIDENT' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  test('필수 필드 누락 시 400 반환', async () => {
    const res = await register(makeRequest('/api/auth/register', { method: 'POST', body: {} }) as never);
    expect(res.status).toBe(400);
  });

  test('비밀번호 8자 미만 시 400 반환', async () => {
    const res = await register(
      makeRequest('/api/auth/register', {
        method: 'POST',
        body: { email: 'test@example.com', password: '123', name: '홍길동' },
      }) as never,
    );
    expect(res.status).toBe(400);
    const data = await json<{ error: string }>(res);
    expect(data.error).toMatch(/8자/);
  });

  test('이미 존재하는 이메일 시 409 반환', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const res = await register(
      makeRequest('/api/auth/register', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123', name: '홍길동' },
      }) as never,
    );
    expect(res.status).toBe(409);
  });

  test('정상 회원가입 시 201 + token 반환', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    const res = await register(
      makeRequest('/api/auth/register', {
        method: 'POST',
        body: { email: 'new@example.com', password: 'password123', name: '홍길동' },
      }) as never,
    );
    expect(res.status).toBe(201);
    const data = await json<{ token: string }>(res);
    expect(data.token).toBe('mock_jwt_token');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  test('이메일·비밀번호 누락 시 400 반환', async () => {
    const res = await login(makeRequest('/api/auth/login', { method: 'POST', body: {} }) as never);
    expect(res.status).toBe(400);
  });

  test('존재하지 않는 이메일 시 401 반환', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await login(
      makeRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'none@example.com', password: 'password123' },
      }) as never,
    );
    expect(res.status).toBe(401);
  });

  test('비밀번호 불일치 시 401 반환', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const res = await login(
      makeRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'wrong' },
      }) as never,
    );
    expect(res.status).toBe(401);
  });

  test('정상 로그인 시 200 + token 반환', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (prisma.villa.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.residentRecord.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await login(
      makeRequest('/api/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123' },
      }) as never,
    );
    expect(res.status).toBe(200);
    const data = await json<{ token: string }>(res);
    expect(data.token).toBe('mock_jwt_token');
  });
});

/**
 * Prisma 클라이언트 모킹 헬퍼
 * jest.mock('@/lib/prisma') 와 함께 사용.
 */
import type { PrismaClient } from '@prisma/client';

type PrismaMock = {
  [K in keyof PrismaClient]: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
    createMany: jest.Mock;
    upsert: jest.Mock;
  };
};

/** 모든 메서드가 jest.fn()인 빈 Prisma 모킹 객체를 반환 */
export function createPrismaMock(): PrismaMock {
  const handler = {
    get(_: object, prop: string) {
      return new Proxy(
        {},
        {
          get(_2: object, method: string) {
            return jest.fn().mockResolvedValue(null);
          },
        },
      );
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Proxy({} as any, handler) as unknown as PrismaMock;
}

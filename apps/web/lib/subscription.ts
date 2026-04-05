import { prisma } from './prisma';
import { err } from './api';

/**
 * Returns an error Response if the villa's subscription is EXPIRED, otherwise null.
 * Use this at the top of route handlers that require an active subscription.
 */
export async function requireActiveSubscription(villaId: string): Promise<Response | null> {
  const villa = await prisma.villa.findUnique({
    where: { id: villaId },
    select: { subscriptionStatus: true },
  });
  if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
  if (villa.subscriptionStatus === 'EXPIRED') {
    return err('구독이 만료되었습니다. 요금제를 갱신해주세요.', 403);
  }
  return null;
}

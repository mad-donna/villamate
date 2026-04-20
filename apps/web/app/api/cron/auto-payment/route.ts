import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { chargeBilling } from '@/lib/toss';
import { createNotification } from '@/lib/notify';
import { SUBSCRIPTION_MONTHLY_PRICE, SUBSCRIPTION_ORDER_NAME } from '@/lib/pricing';
import { decryptBillingKey } from '@/lib/crypto';

const MONTHLY_AMOUNT = SUBSCRIPTION_MONTHLY_PRICE;
const ORDER_NAME = SUBSCRIPTION_ORDER_NAME;

// POST — Vercel Cron: 매일 UTC 15:00 (KST 00:00) 실행
// 당일 만료 또는 이미 만료된 ACTIVE 빌라 중 빌링키 보유 빌라 자동결제
export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return Response.json({ error: 'Server misconfiguration' }, { status: 500 });

  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // 만료됐거나 당일 만료 예정이면서 빌링키가 있는 빌라
  const villas = await prisma.villa.findMany({
    where: {
      subscriptionStatus: { in: ['ACTIVE', 'EXPIRED'] },
      subscriptionExpiry: { lte: today },
      tossBillingKey: { isNot: null },
    },
    select: {
      id: true,
      name: true,
      adminId: true,
      subscriptionExpiry: true,
      tossBillingKey: {
        select: { billingKey: true, customerKey: true },
      },
    },
  });

  if (villas.length === 0) {
    return Response.json({ ok: true, charged: 0, failed: 0 });
  }

  let charged = 0;
  let failed = 0;

  for (const villa of villas) {
    const bk = villa.tossBillingKey!;
    const orderId = `sub_${villa.id}_${Date.now()}`;

    try {
      await chargeBilling({
        billingKey: decryptBillingKey(bk.billingKey),
        customerKey: bk.customerKey,
        amount: MONTHLY_AMOUNT,
        orderId,
        orderName: ORDER_NAME,
      });

      // 구독 30일 연장 — 결제 성공 후 DB 갱신
      const currentExpiry = villa.subscriptionExpiry ?? new Date();
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
      const newExpiry = new Date(baseDate);
      newExpiry.setDate(newExpiry.getDate() + 30);

      try {
        await prisma.villa.update({
          where: { id: villa.id },
          data: { subscriptionStatus: 'ACTIVE', subscriptionExpiry: newExpiry },
        });
      } catch (updateErr) {
        // 결제는 완료됐으나 DB 갱신 실패 — 관리자에게 수동 확인 요청
        console.error(`[auto-payment] 결제 성공 후 구독 갱신 실패 villaId=${villa.id}`, updateErr);
        await createNotification({
          userId: villa.adminId,
          villaId: villa.id,
          type: 'SYSTEM',
          title: '[긴급] 결제 완료 후 구독 갱신 오류',
          body: `${villa.name} 결제는 완료되었으나 구독 갱신에 실패했습니다. 관리자에게 문의해주세요. (orderId: ${orderId})`,
        }).catch(() => {});
        failed++;
        continue;
      }

      await createNotification({
        userId: villa.adminId,
        villaId: villa.id,
        type: 'SYSTEM',
        title: '구독이 자동 갱신되었습니다.',
        body: `${villa.name} 구독이 갱신되었습니다. (${newExpiry.getFullYear()}년 ${newExpiry.getMonth() + 1}월 ${newExpiry.getDate()}일까지)`,
      });

      charged++;
    } catch (e) {
      failed++;
      const message = e instanceof Error ? e.message : '자동결제 실패';

      await createNotification({
        userId: villa.adminId,
        villaId: villa.id,
        type: 'SYSTEM',
        title: '자동결제에 실패했습니다.',
        body: `${villa.name} 구독 자동결제에 실패했습니다. 구독 관리 페이지에서 카드 정보를 확인해주세요. (${message})`,
      }).catch(() => {});
    }
  }

  return Response.json({ ok: true, charged, failed });
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err } from '@/lib/api';
import { getPortOneToken, getPortOnePayment } from '@/lib/portone';

// 인메모리 Rate Limit: billId당 1분에 5회
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 5) return true;
  entry.count++;
  return false;
}

// POST — PortOne imp_uid 검증 후 외부 청구 COMPLETED 처리 (인증 불필요 - 공개)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ billId: string }> },
) {
  try {
    const { billId } = await params;

    if (isRateLimited(billId)) {
      return err('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429);
    }

    const billing = await prisma.externalBilling.findUnique({
      where: { id: billId },
      select: {
        id: true,
        amount: true,
        status: true,
      },
    });

    if (!billing) return err('청구서를 찾을 수 없습니다.', 404);
    if (billing.status === 'COMPLETED') return err('이미 완료된 청구서입니다.', 400);

    const body = await req.json();
    const { imp_uid } = body as { imp_uid?: string };

    if (!imp_uid || typeof imp_uid !== 'string' || imp_uid.trim() === '') {
      return err('imp_uid가 필요합니다.', 400);
    }

    // PortOne 서버 검증
    let portOneToken: string;
    let portOnePayment: Awaited<ReturnType<typeof getPortOnePayment>>;

    try {
      portOneToken = await getPortOneToken();
      portOnePayment = await getPortOnePayment(imp_uid.trim(), portOneToken);
    } catch (e) {
      const message = e instanceof Error ? e.message : '결제 검증 중 오류가 발생했습니다.';
      return err(message, 502);
    }

    // 검증 조건 1: 결제 상태가 'paid'인지 확인
    if (portOnePayment.status !== 'paid') {
      return err(`결제가 완료되지 않았습니다. 현재 상태: ${portOnePayment.status}`, 400);
    }

    // 검증 조건 2: 결제 금액이 DB 금액과 일치하는지 확인
    const dbAmount = Number(billing.amount);
    const pgAmount = portOnePayment.amount;

    if (dbAmount !== pgAmount) {
      return err(
        `결제 금액 불일치 (DB: ${dbAmount}원, PG: ${pgAmount}원). 결제가 취소될 수 있습니다.`,
        400,
      );
    }

    // 검증 조건 3: merchant_uid에 billId가 포함되어 있는지 확인
    if (!portOnePayment.merchant_uid.includes(billId)) {
      return err('merchant_uid가 해당 청구서와 일치하지 않습니다.', 400);
    }

    // 검증 통과 — 청구서 상태를 COMPLETED로 갱신
    const updated = await prisma.externalBilling.update({
      where: { id: billId },
      data: { status: 'COMPLETED' },
    });

    return ok({ billing: updated });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

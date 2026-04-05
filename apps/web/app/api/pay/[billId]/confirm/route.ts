import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err } from '@/lib/api';

/**
 * PortOne REST API 액세스 토큰을 발급합니다.
 */
async function getPortOneToken(): Promise<string> {
  const impKey = process.env.PORTONE_IMP_KEY;
  const impSecret = process.env.PORTONE_IMP_SECRET;

  if (!impKey || !impSecret) {
    throw new Error('PortOne 환경변수(PORTONE_IMP_KEY, PORTONE_IMP_SECRET)가 설정되지 않았습니다.');
  }

  const res = await fetch('https://api.iamport.kr/users/getToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imp_key: impKey, imp_secret: impSecret }),
  });

  if (!res.ok) {
    throw new Error(`PortOne 토큰 발급 실패: ${res.status}`);
  }

  const data = await res.json();
  const token: string | undefined = data?.response?.access_token;

  if (!token) {
    throw new Error('PortOne 액세스 토큰을 파싱할 수 없습니다.');
  }

  return token;
}

/**
 * PortOne REST API에서 결제 정보를 조회합니다.
 */
async function getPortOnePayment(
  impUid: string,
  accessToken: string,
): Promise<{
  status: string;
  amount: number;
  merchant_uid: string;
  pg_provider: string;
}> {
  const res = await fetch(`https://api.iamport.kr/payments/${encodeURIComponent(impUid)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`PortOne 결제 조회 실패: ${res.status}`);
  }

  const data = await res.json();
  const payment = data?.response;

  if (!payment) {
    throw new Error('PortOne 결제 정보를 파싱할 수 없습니다.');
  }

  return {
    status: payment.status,
    amount: payment.amount,
    merchant_uid: payment.merchant_uid,
    pg_provider: payment.pg_provider,
  };
}

// POST — PortOne imp_uid 검증 후 외부 청구 COMPLETED 처리 (인증 불필요 - 공개)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ billId: string }> },
) {
  try {
    const { billId } = await params;

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

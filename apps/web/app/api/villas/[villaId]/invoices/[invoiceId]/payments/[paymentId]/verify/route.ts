import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

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

// POST — PortOne imp_uid 서버 검증 후 납부 상태 갱신
export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ villaId: string; invoiceId: string; paymentId: string }>;
  },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId, invoiceId, paymentId } = await params;

    // RESIDENT 권한 확인 — 본인 빌라 소속 여부
    const residentRecord = await prisma.residentRecord.findFirst({
      where: {
        userId: user.sub,
        villaId,
        status: 'APPROVED',
      },
    });
    if (!residentRecord) return err('해당 빌라의 입주민이 아닙니다.', 403);

    // 납부 내역 조회 — invoiceId와 paymentId가 일치하고 본인 세대 것인지 확인
    const payment = await prisma.invoicePayment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: { select: { billingMonth: true } },
      },
    });

    if (!payment) return err('납부 내역을 찾을 수 없습니다.', 404);
    if (payment.invoiceId !== invoiceId) return err('납부 내역과 청구서가 일치하지 않습니다.', 400);
    if (payment.roomNumber !== residentRecord.roomNumber) return err('본인 세대의 납부 내역만 처리할 수 있습니다.', 403);
    if (payment.status === 'PAID') return err('이미 납부 완료된 청구서입니다.', 400);

    // 요청 body에서 imp_uid 추출
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
    const dbAmount = Number(payment.amount);
    const pgAmount = portOnePayment.amount;

    if (dbAmount !== pgAmount) {
      // 금액 위변조 의심 — 결제 취소 요청은 별도 처리 필요
      return err(
        `결제 금액 불일치 (DB: ${dbAmount}원, PG: ${pgAmount}원). 결제가 취소될 수 있습니다.`,
        400,
      );
    }

    // 검증 조건 3: merchant_uid에 paymentId가 포함되어 있는지 확인
    if (!portOnePayment.merchant_uid.includes(paymentId)) {
      return err('merchant_uid가 해당 납부 내역과 일치하지 않습니다.', 400);
    }

    // 검증 통과 — 납부 상태 갱신
    const updated = await prisma.invoicePayment.update({
      where: { id: paymentId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        impUid: imp_uid.trim(),
        pgProvider: portOnePayment.pg_provider,
      },
    });

    // 장부 자동 기록
    await prisma.ledgerTransaction.create({
      data: {
        villaId,
        type: 'INCOME',
        amount: Number(payment.amount),
        description: `${payment.invoice.billingMonth} 관리비 수납 - ${payment.roomNumber}호`,
        transactionDate: new Date(),
        createdBy: 'system',
      },
    });

    return ok({ payment: updated }, 200);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

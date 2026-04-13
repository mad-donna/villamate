/**
 * Toss Payments 서버사이드 API 유틸
 * 빌링키 발급 및 자동결제 실행
 */

const TOSS_BASE = 'https://api.tosspayments.com/v1';

function getAuthHeader(): string {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) throw new Error('TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다.');
  return `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;
}

export interface TossBillingKeyInfo {
  billingKey: string;
  customerKey: string;
  cardCompany: string | null;
  cardNumber: string | null;
}

export interface TossPaymentResult {
  paymentKey: string;
  orderId: string;
  status: string;
  totalAmount: number;
}

/**
 * authKey로 빌링키 발급
 * Toss 인증 성공 redirect URL에서 받은 authKey + customerKey를 사용
 */
export async function issueBillingKey(
  authKey: string,
  customerKey: string,
): Promise<TossBillingKeyInfo> {
  const res = await fetch(`${TOSS_BASE}/billing/authorizations/${authKey}`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customerKey }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `빌링키 발급 실패 (${res.status}): ${(err as { message?: string }).message ?? '알 수 없는 오류'}`,
    );
  }

  const data = await res.json();
  return {
    billingKey: data.billingKey,
    customerKey: data.customerKey,
    cardCompany: data.card?.company ?? null,
    cardNumber: data.card?.number ?? null,
  };
}

/**
 * 빌링키로 자동결제 실행
 */
export async function chargeBilling(params: {
  billingKey: string;
  customerKey: string;
  amount: number;
  orderId: string;
  orderName: string;
}): Promise<TossPaymentResult> {
  const res = await fetch(`${TOSS_BASE}/billing/${params.billingKey}`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerKey: params.customerKey,
      amount: params.amount,
      orderId: params.orderId,
      orderName: params.orderName,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `자동결제 실패 (${res.status}): ${(err as { message?: string }).message ?? '알 수 없는 오류'}`,
    );
  }

  const data = await res.json();
  return {
    paymentKey: data.paymentKey,
    orderId: data.orderId,
    status: data.status,
    totalAmount: data.totalAmount,
  };
}

export async function getPortOneToken(): Promise<string> {
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

  if (!res.ok) throw new Error(`PortOne 토큰 발급 실패: ${res.status}`);

  const data = await res.json();
  const token: string | undefined = data?.response?.access_token;
  if (!token) throw new Error('PortOne 액세스 토큰을 파싱할 수 없습니다.');

  return token;
}

export async function getPortOnePayment(
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

  if (!res.ok) throw new Error(`PortOne 결제 조회 실패: ${res.status}`);

  const data = await res.json();
  const payment = data?.response;
  if (!payment) throw new Error('PortOne 결제 정보를 파싱할 수 없습니다.');

  return {
    status: payment.status,
    amount: payment.amount,
    merchant_uid: payment.merchant_uid,
    pg_provider: payment.pg_provider,
  };
}

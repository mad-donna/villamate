import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';
import { issueBillingKey } from '@/lib/toss';
import { encryptBillingKey } from '@/lib/crypto';

type Params = { params: Promise<{ villaId: string }> };

async function authorizeAdmin(req: NextRequest, villaId: string) {
  const user = await getUser(req);
  if (!user) return { error: err('인증이 필요합니다.', 401) };
  const villa = await prisma.villa.findUnique({ where: { id: villaId }, select: { adminId: true } });
  if (!villa) return { error: err('빌라를 찾을 수 없습니다.', 404) };
  if (villa.adminId !== user.sub) return { error: err('권한이 없습니다.', 403) };
  return { error: null };
}

// GET — 등록된 카드 정보 조회
export async function GET(req: NextRequest, { params }: Params) {
  const { villaId } = await params;
  const { error } = await authorizeAdmin(req, villaId);
  if (error) return error;

  const billing = await prisma.tossBillingKey.findUnique({
    where: { villaId },
    select: { cardCompany: true, cardNumber: true, createdAt: true },
  });

  return ok({ billing });
}

// POST — authKey로 빌링키 발급 후 저장
export async function POST(req: NextRequest, { params }: Params) {
  const { villaId } = await params;
  const { error } = await authorizeAdmin(req, villaId);
  if (error) return error;

  const body = await req.json() as { authKey?: string; customerKey?: string };
  const { authKey, customerKey } = body;

  if (!authKey || !customerKey) {
    return err('authKey와 customerKey가 필요합니다.', 400);
  }

  let keyInfo;
  try {
    keyInfo = await issueBillingKey(authKey, customerKey);
  } catch (e) {
    return err(e instanceof Error ? e.message : '빌링키 발급에 실패했습니다.', 502);
  }

  const encryptedBillingKey = encryptBillingKey(keyInfo.billingKey);

  await prisma.tossBillingKey.upsert({
    where: { villaId },
    create: {
      villaId,
      billingKey: encryptedBillingKey,
      customerKey: keyInfo.customerKey,
      cardCompany: keyInfo.cardCompany,
      cardNumber: keyInfo.cardNumber,
    },
    update: {
      billingKey: encryptedBillingKey,
      customerKey: keyInfo.customerKey,
      cardCompany: keyInfo.cardCompany,
      cardNumber: keyInfo.cardNumber,
    },
  });

  return ok({
    cardCompany: keyInfo.cardCompany,
    cardNumber: keyInfo.cardNumber,
  });
}

// DELETE — 빌링키 삭제 (자동결제 해제)
export async function DELETE(req: NextRequest, { params }: Params) {
  const { villaId } = await params;
  const { error } = await authorizeAdmin(req, villaId);
  if (error) return error;

  await prisma.tossBillingKey.deleteMany({ where: { villaId } });

  return ok({ unregistered: true });
}

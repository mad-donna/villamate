import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';
import { requireActiveSubscription } from '@/lib/subscription';

// GET — 외부 청구 목록 조회 (ADMIN 전용)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

    const { villaId } = await params;

    // 본인 빌라 확인
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

    const billings = await prisma.externalBilling.findMany({
      where: { villaId },
      orderBy: { createdAt: 'desc' },
    });

    return ok({ billings });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// POST — 외부 청구 생성 (ADMIN 전용)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

    const { villaId } = await params;

    // 본인 빌라 확인
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

    const subErr = await requireActiveSubscription(villaId);
    if (subErr) return subErr;

    const body = await req.json();
    const { targetName, phoneNumber, amount, description, dueDate } = body as {
      targetName?: string;
      phoneNumber?: string;
      amount?: number;
      description?: string;
      dueDate?: string;
    };

    // 필수값 검증
    if (!targetName?.trim()) return err('청구 대상 이름을 입력해주세요.', 400);
    if (!phoneNumber?.trim()) return err('연락처를 입력해주세요.', 400);
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return err('유효한 금액을 입력해주세요.', 400);
    if (!description?.trim()) return err('청구 내용을 입력해주세요.', 400);
    if (!dueDate) return err('납부 기한을 입력해주세요.', 400);

    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) return err('유효하지 않은 납부 기한입니다.', 400);

    const billing = await prisma.externalBilling.create({
      data: {
        villaId,
        targetName: targetName.trim(),
        phoneNumber: phoneNumber.trim(),
        amount: Number(amount),
        description: description.trim(),
        dueDate: parsedDueDate,
      },
    });

    return ok({ billing }, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

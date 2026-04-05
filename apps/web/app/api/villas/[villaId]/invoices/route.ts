import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// ADMIN 권한 및 빌라 소속 확인 헬퍼
async function requireAdmin(userId: string, villaId: string) {
  const villa = await prisma.villa.findUnique({
    where: { id: villaId },
    select: { id: true, adminId: true },
  });
  if (!villa) return { error: err('빌라를 찾을 수 없습니다.', 404) };
  if (villa.adminId !== userId) return { error: err('권한이 없습니다.', 403) };
  return { villa };
}

// GET — 청구서 목록 (ADMIN 전용)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;

    const { error } = await requireAdmin(user.sub, villaId);
    if (error) return error;

    const invoices = await prisma.invoice.findMany({
      where: { villaId },
      include: {
        payments: {
          select: { status: true },
        },
      },
      orderBy: { billingMonth: 'desc' },
    });

    return ok({
      invoices: invoices.map((inv) => {
        const totalCount = inv.payments.length;
        const paidCount = inv.payments.filter((p) => p.status === 'PAID').length;
        return {
          id: inv.id,
          type: inv.type,
          billingMonth: inv.billingMonth,
          totalAmount: inv.totalAmount,
          memo: inv.memo,
          createdAt: inv.createdAt,
          paidCount,
          totalCount,
        };
      }),
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// POST — 청구서 발행 (ADMIN 전용)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;

    const { error } = await requireAdmin(user.sub, villaId);
    if (error) return error;

    const body = await req.json();
    const { type, billingMonth, memo, amount, items } = body;

    // 필수값 검증
    if (!type || !billingMonth) {
      return err('청구 유형과 청구 월은 필수입니다.', 400);
    }
    if (!/^\d{4}-\d{2}$/.test(billingMonth)) {
      return err('청구 월 형식이 올바르지 않습니다. (YYYY-MM)', 400);
    }

    // 같은 billingMonth 중복 체크
    const existing = await prisma.invoice.findFirst({
      where: { villaId, billingMonth },
    });
    if (existing) {
      return err('해당 월 청구서가 이미 존재합니다.', 409);
    }

    // HEAD 세대 수 조회
    const headResidents = await prisma.residentRecord.findMany({
      where: { villaId, residentType: 'HEAD' },
      select: { id: true, roomNumber: true },
    });
    const headCount = headResidents.length;

    if (headCount === 0) {
      return err('등록된 세대주가 없습니다.', 400);
    }

    // 금액 계산
    let totalAmount: number;
    let amountPerResident: number;

    if (type === 'FIXED') {
      if (!amount || Number(amount) <= 0) {
        return err('고정 관리비의 세대당 금액을 입력해주세요.', 400);
      }
      amountPerResident = Number(amount);
      totalAmount = amountPerResident * headCount;
    } else if (type === 'VARIABLE') {
      if (!items || !Array.isArray(items) || items.length === 0) {
        return err('변동 관리비 항목을 입력해주세요.', 400);
      }
      totalAmount = items.reduce((sum: number, item: { name: string; amount: number }) => {
        return sum + Number(item.amount);
      }, 0);
      amountPerResident = Math.floor(totalAmount / headCount);
    } else {
      return err('청구 유형이 올바르지 않습니다. (FIXED 또는 VARIABLE)', 400);
    }

    // 트랜잭션으로 청구서 + InvoicePayment 일괄 생성
    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          villaId,
          type,
          billingMonth,
          memo: memo ?? null,
          totalAmount,
          items:
            type === 'VARIABLE'
              ? {
                  create: items.map((item: { name: string; amount: number }) => ({
                    name: item.name,
                    amount: Number(item.amount),
                  })),
                }
              : undefined,
        },
        include: { items: true },
      });

      // HEAD 세대마다 InvoicePayment 생성
      await tx.invoicePayment.createMany({
        data: headResidents.map((r) => ({
          invoiceId: created.id,
          residentRecordId: r.id,
          roomNumber: r.roomNumber,
          amount: amountPerResident,
          status: 'PENDING',
        })),
      });

      return created;
    });

    return ok({ invoice }, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

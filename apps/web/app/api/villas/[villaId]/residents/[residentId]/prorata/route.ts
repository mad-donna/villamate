import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; residentId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'ADMIN') return err('관리자만 접근할 수 있습니다.', 403);

    const { villaId, residentId } = await params;

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { adminId: true, fixedFee: true, name: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('권한이 없습니다.', 403);

    const resident = await prisma.residentRecord.findFirst({
      where: { id: residentId, villaId, status: 'APPROVED' },
      include: { user: { select: { name: true, phone: true } } },
    });
    if (!resident) return err('입주민 정보를 찾을 수 없습니다.', 404);

    const body = await req.json() as { moveOutDate?: string };
    if (!body.moveOutDate) return err('이사 날짜를 입력해주세요.', 400);

    const moveOut = new Date(body.moveOutDate);
    if (isNaN(moveOut.getTime())) return err('유효하지 않은 날짜입니다.', 400);

    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneMonthLater = new Date(now);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    if (moveOut < oneYearAgo || moveOut > oneMonthLater) {
      return err('이사 날짜는 1년 이내 과거 또는 1개월 이내 미래만 입력할 수 있습니다.', 400);
    }

    const year = moveOut.getFullYear();
    const month = moveOut.getMonth() + 1;
    const usedDays = moveOut.getDate();
    const totalDays = daysInMonth(year, month);
    const billingMonth = `${year}-${String(month).padStart(2, '0')}`;

    // fixedFee 우선, 없으면 해당 월 청구서에서 호수별 금액 조회
    let monthlyFee = villa.fixedFee;
    if (!monthlyFee) {
      const payment = await prisma.invoicePayment.findFirst({
        where: {
          roomNumber: resident.roomNumber,
          invoice: { villaId, billingMonth },
        },
        select: { amount: true },
        orderBy: { invoice: { createdAt: 'desc' } },
      });
      monthlyFee = payment ? Number(payment.amount) : null;
    }

    if (!monthlyFee || monthlyFee <= 0) {
      return err('이 빌라에는 고정 관리비 또는 해당 월 청구서가 없어 일할 계산이 불가합니다.', 422);
    }

    const proratedAmount = Math.ceil(monthlyFee * usedDays / totalDays);
    const dueDate = new Date(year, month - 1, totalDays); // 월말 기한

    const billing = await prisma.externalBilling.create({
      data: {
        villaId,
        targetName: resident.user.name,
        phoneNumber: resident.user.phone ?? '-',
        amount: proratedAmount,
        description: `${billingMonth} 관리비 일할 정산 (${resident.roomNumber}호, ${usedDays}/${totalDays}일)`,
        dueDate,
      },
    });

    return ok({ billing, proratedAmount, usedDays, totalDays, billingMonth }, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

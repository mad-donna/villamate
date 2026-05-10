import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET: 빌라 상세 조회 (입주민 목록 + 최근 청구서 포함)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const { id } = await params;

    const villa = await prisma.villa.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        address: true,
        totalUnits: true,
        inviteCode: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
        fixedFee: true,
        autoPublishDay: true,
        createdAt: true,
        admin: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);

    const [residents, invoices] = await Promise.all([
      prisma.residentRecord.findMany({
        where: { villaId: id },
        select: {
          id: true,
          roomNumber: true,
          residentType: true,
          status: true,
          joinedAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: [{ roomNumber: 'asc' }, { residentType: 'asc' }],
      }),
      prisma.invoice.findMany({
        where: { villaId: id },
        include: { payments: { select: { status: true, amount: true } } },
        orderBy: { billingMonth: 'desc' },
        take: 6,
      }),
    ]);

    const invoiceSummaries = invoices.map((inv) => {
      const paid = inv.payments
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
      const paidCount = inv.payments.filter((p) => p.status === 'PAID').length;
      return {
        id: inv.id,
        billingMonth: inv.billingMonth,
        type: inv.type,
        totalAmount: parseFloat(inv.totalAmount.toString()),
        paidAmount: paid,
        paidCount,
        totalCount: inv.payments.length,
        paidRate: inv.payments.length > 0 ? Math.round((paidCount / inv.payments.length) * 100) : 0,
      };
    });

    return ok({ villa, residents, invoices: invoiceSummaries });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// PATCH: 빌라 구독 상태 수동 변경 (SUPER_ADMIN)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);
    if (user.role !== 'SUPER_ADMIN') return err('접근 권한이 없습니다.', 403);

    const { id } = await params;
    const body = (await req.json()) as {
      subscriptionStatus?: 'FREE_TRIAL' | 'ACTIVE' | 'EXPIRED';
      subscriptionExpiry?: string | null;
    };

    const villa = await prisma.villa.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);

    const VALID_STATUSES = ['FREE_TRIAL', 'ACTIVE', 'EXPIRED'];
    if (
      body.subscriptionStatus !== undefined &&
      !VALID_STATUSES.includes(body.subscriptionStatus)
    ) {
      return err('올바른 구독 상태를 선택해주세요.', 400);
    }

    let expiry: Date | null | undefined;
    if (body.subscriptionExpiry !== undefined) {
      if (body.subscriptionExpiry === null) {
        expiry = null;
      } else {
        expiry = new Date(body.subscriptionExpiry);
        if (isNaN(expiry.getTime())) return err('만료일 형식이 올바르지 않습니다.', 400);
      }
    }

    const updated = await prisma.villa.update({
      where: { id },
      data: {
        ...(body.subscriptionStatus ? { subscriptionStatus: body.subscriptionStatus } : {}),
        ...(expiry !== undefined ? { subscriptionExpiry: expiry } : {}),
      },
      select: {
        id: true,
        name: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
      },
    });

    return ok(updated);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

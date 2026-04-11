import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

async function assertVillaAccess(villaId: string, userId: string) {
  const villa = await prisma.villa.findUnique({
    where: { id: villaId },
    select: { id: true, adminId: true },
  });
  if (!villa) return null;
  if (villa.adminId === userId) return { isAdmin: true };
  const resident = await prisma.residentRecord.findFirst({
    where: { villaId, userId, status: 'APPROVED' },
    select: { id: true },
  });
  if (!resident) return null;
  return { isAdmin: false };
}

// GET: 장부 내역 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;
    const access = await assertVillaAccess(villaId, user.sub);
    if (!access) return err('접근 권한이 없습니다.', 403);

    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    let dateFilter: { gte?: Date; lt?: Date } | undefined;

    if (yearParam && monthParam) {
      const year = parseInt(yearParam, 10);
      const month = parseInt(monthParam, 10);
      if (!isNaN(year) && month >= 1 && month <= 12) {
        const from = new Date(year, month - 1, 1);
        const to = new Date(year, month, 1);
        dateFilter = { gte: from, lt: to };
      }
    }

    const transactions = await prisma.ledgerTransaction.findMany({
      where: {
        villaId,
        ...(dateFilter ? { transactionDate: dateFilter } : {}),
      },
      orderBy: { transactionDate: 'desc' },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of transactions) {
      const amount = Number(t.amount);
      if (t.type === 'INCOME') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }
    }

    return ok({
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        description: t.description,
        transactionDate: t.transactionDate,
        receiptUrl: t.receiptUrl,
        createdAt: t.createdAt,
      })),
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      },
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// POST: 장부 내역 등록 (관리자 전용)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('관리자만 장부를 등록할 수 있습니다.', 403);

    const body = (await req.json()) as {
      type?: string;
      amount?: number;
      description?: string;
      transactionDate?: string;
      receiptUrl?: string;
    };

    const { type, amount, description, transactionDate, receiptUrl } = body;

    if (!type || !['INCOME', 'EXPENSE'].includes(type)) {
      return err('type은 INCOME 또는 EXPENSE여야 합니다.', 400);
    }
    if (amount === undefined || amount === null || typeof amount !== 'number' || amount <= 0) {
      return err('금액은 0보다 커야 합니다.', 400);
    }
    if (!description?.trim()) {
      return err('설명을 입력해주세요.', 400);
    }
    if (!transactionDate) {
      return err('거래 날짜를 입력해주세요.', 400);
    }

    const parsedDate = new Date(transactionDate);
    if (isNaN(parsedDate.getTime())) {
      return err('거래 날짜 형식이 올바르지 않습니다.', 400);
    }

    const transaction = await prisma.ledgerTransaction.create({
      data: {
        villaId,
        type: type as 'INCOME' | 'EXPENSE',
        amount,
        description: description.trim(),
        transactionDate: parsedDate,
        receiptUrl: receiptUrl ?? null,
        createdBy: user.sub,
      },
    });

    return ok(
      {
        id: transaction.id,
        type: transaction.type,
        amount: Number(transaction.amount),
        description: transaction.description,
        transactionDate: transaction.transactionDate,
        receiptUrl: transaction.receiptUrl,
        createdAt: transaction.createdAt,
      },
      201,
    );
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err } from '@/lib/api';

// GET — 외부 청구 단건 조회 (인증 불필요 - 공개)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ billId: string }> },
) {
  try {
    const { billId } = await params;

    const billing = await prisma.externalBilling.findUnique({
      where: { id: billId },
      select: {
        id: true,
        targetName: true,
        phoneNumber: true,
        amount: true,
        description: true,
        dueDate: true,
        status: true,
        createdAt: true,
        villa: {
          select: { name: true },
        },
      },
    });

    if (!billing) return err('청구서를 찾을 수 없습니다.', 404);

    return ok({ billing });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

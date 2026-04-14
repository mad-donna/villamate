import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';
import { requireActiveSubscription } from '@/lib/subscription';

type Params = { params: Promise<{ villaId: string }> };

// GET: 에너지 사용량 목록 (최근 12개월)
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { id: true, adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);

    const isAdmin = villa.adminId === user.sub;
    if (!isAdmin) {
      const resident = await prisma.residentRecord.findFirst({
        where: { villaId, userId: user.sub, status: 'APPROVED' },
        select: { id: true },
      });
      if (!resident) return err('접근 권한이 없습니다.', 403);
    }

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()), 10);

    const usages = await prisma.energyUsage.findMany({
      where: { villaId, year },
      orderBy: { month: 'asc' },
    });

    return ok({ usages });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// POST: 에너지 사용량 등록/수정 (관리자 전용, upsert)
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { id: true, adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);
    if (villa.adminId !== user.sub) return err('관리자만 등록할 수 있습니다.', 403);

    const subErr = await requireActiveSubscription(villaId);
    if (subErr) return subErr;

    const body = (await req.json()) as {
      year?: number;
      month?: number;
      electricKwh?: number | null;
      electricFee?: number | null;
      waterTon?: number | null;
      waterFee?: number | null;
      gasMj?: number | null;
      gasFee?: number | null;
    };

    const { year, month } = body;
    if (!year || !month || month < 1 || month > 12) {
      return err('연도와 월을 올바르게 입력해주세요.', 400);
    }

    const usage = await prisma.energyUsage.upsert({
      where: { villaId_year_month: { villaId, year, month } },
      create: {
        villaId,
        year,
        month,
        electricKwh: body.electricKwh ?? null,
        electricFee: body.electricFee ?? null,
        waterTon: body.waterTon ?? null,
        waterFee: body.waterFee ?? null,
        gasMj: body.gasMj ?? null,
        gasFee: body.gasFee ?? null,
      },
      update: {
        electricKwh: body.electricKwh ?? null,
        electricFee: body.electricFee ?? null,
        waterTon: body.waterTon ?? null,
        waterFee: body.waterFee ?? null,
        gasMj: body.gasMj ?? null,
        gasFee: body.gasFee ?? null,
      },
    });

    return ok({ usage }, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

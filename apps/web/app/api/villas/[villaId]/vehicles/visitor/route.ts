import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { ok, err } from '@/lib/api';
import { secret } from '@/lib/auth';

// POST: QR 스캔 방문 차량 등록 (비로그인, 토큰 검증)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const { villaId } = await params;

    const body = (await req.json()) as {
      token?: string;
      plateNumber?: string;
      modelName?: string;
      visitorName?: string;
      expectedDeparture?: string;
    };

    if (!body.token) return err('토큰이 필요합니다.', 400);

    // JWT 토큰 검증
    let payload: { villaId?: string; purpose?: string };
    try {
      const { payload: p } = await jwtVerify(body.token, secret);
      payload = p as { villaId?: string; purpose?: string };
    } catch {
      return err('유효하지 않거나 만료된 QR 코드입니다.', 401);
    }

    if (payload.purpose !== 'visitor-vehicle' || payload.villaId !== villaId) {
      return err('유효하지 않은 QR 코드입니다.', 401);
    }

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { id: true, adminId: true, name: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);

    const plateNumber = body.plateNumber?.trim().replace(/\s/g, '');
    if (!plateNumber) return err('번호판을 입력해주세요.', 400);
    if (!/^[가-힣0-9]{4,10}$/.test(plateNumber)) {
      return err('올바른 번호판 형식이 아닙니다. (예: 12가3456)', 400);
    }

    // 이미 등록된 번호판이면 덮어쓰기 (upsert)
    const vehicle = await prisma.vehicle.upsert({
      where: { plateNumber_villaId: { plateNumber, villaId } },
      create: {
        villaId,
        ownerId: villa.adminId, // 방문 차량은 관리자 소유로 등록
        plateNumber,
        modelName: body.modelName?.trim() || null,
        isVisitor: true,
        visitorName: body.visitorName?.trim() || null,
        expectedDeparture: body.expectedDeparture?.trim() || null,
      },
      update: {
        modelName: body.modelName?.trim() || null,
        isVisitor: true,
        visitorName: body.visitorName?.trim() || null,
        expectedDeparture: body.expectedDeparture?.trim() || null,
      },
    });

    return ok({ vehicle, villaName: villa.name }, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

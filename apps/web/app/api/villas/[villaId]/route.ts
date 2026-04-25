import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET: 빌라 정보 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> }
) {
  try {
    const user = await getUser(req);
    if (!user) {
      return err('인증이 필요합니다.', 401);
    }

    const { villaId } = await params;

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      include: {
        _count: { select: { residents: true } },
      },
    });

    if (!villa) {
      return err('빌라를 찾을 수 없습니다.', 404);
    }

    // 접근 권한 확인: 해당 빌라의 ADMIN이거나 ResidentRecord가 있어야 함
    const isAdmin = villa.adminId === user.sub;

    if (!isAdmin) {
      const residentRecord = await prisma.residentRecord.findFirst({
        where: { villaId, userId: user.sub },
        select: { id: true },
      });
      if (!residentRecord) {
        return err('접근 권한이 없습니다.', 403);
      }
    }

    const { _count, ...villaData } = villa;

    return ok({
      ...villaData,
      residentCount: _count.residents,
    });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> }
) {
  try {
    const user = await getUser(req);
    if (!user) {
      return err('인증이 필요합니다.', 401);
    }

    const { villaId } = await params;

    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { id: true, adminId: true },
    });

    if (!villa) {
      return err('빌라를 찾을 수 없습니다.', 404);
    }

    if (villa.adminId !== user.sub) {
      return err('권한이 없습니다.', 403);
    }

    const body = await req.json();
    const { name, address, totalUnits, roomNumbers, accountBank, accountNumber, autoPublishDay, fixedFee } =
      body as {
        name?: string;
        address?: string;
        totalUnits?: number;
        roomNumbers?: string[];
        accountBank?: string;
        accountNumber?: string;
        autoPublishDay?: number | null;
        fixedFee?: number | null;
      };

    const updated = await prisma.villa.update({
      where: { id: villaId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(address !== undefined && { address: address.trim() }),
        ...(totalUnits !== undefined && { totalUnits }),
        ...(roomNumbers !== undefined && { roomNumbers }),
        ...(accountBank !== undefined && { accountBank }),
        ...(accountNumber !== undefined && { accountNumber }),
        ...(autoPublishDay !== undefined && { autoPublishDay }),
        ...(fixedFee !== undefined && { fixedFee }),
      },
    });

    return ok(updated);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

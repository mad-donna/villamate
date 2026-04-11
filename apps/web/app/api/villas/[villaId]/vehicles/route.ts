import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';

// GET — 차량 목록 조회 / 번호판 검색 (F-70, F-71)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;

    // 빌라 접근 권한 확인 (관리자 또는 승인된 입주민)
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);

    const isAdmin = villa.adminId === user.sub;
    if (!isAdmin) {
      const resident = await prisma.residentRecord.findFirst({
        where: { villaId, userId: user.sub, status: 'APPROVED' },
      });
      if (!resident) return err('접근 권한이 없습니다.', 403);
    }

    const { searchParams } = new URL(req.url);
    const plate = searchParams.get('plate')?.trim();

    // F-71: 번호판 검색
    if (plate) {
      const vehicles = await prisma.vehicle.findMany({
        where: {
          villaId,
          plateNumber: { contains: plate },
        },
        include: {
          owner: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const results = await Promise.all(
        vehicles.map(async (v) => {
          const resident = await prisma.residentRecord.findFirst({
            where: { villaId, userId: v.ownerId, status: 'APPROVED' },
            select: { roomNumber: true },
          });
          return {
            id: v.id,
            plateNumber: v.plateNumber,
            modelName: v.modelName,
            isVisitor: v.isVisitor,
            expectedDeparture: v.expectedDeparture,
            ownerName: v.owner.name,
            roomNumber: resident?.roomNumber ?? null,
            createdAt: v.createdAt,
          };
        }),
      );

      return ok({ vehicles: results });
    }

    // F-70: 전체 차량 목록 (관리자 = 전체, 입주민 = 본인 등록 차량만)
    const whereClause = isAdmin
      ? { villaId }
      : { villaId, ownerId: user.sub };

    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
      include: {
        owner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const results = await Promise.all(
      vehicles.map(async (v) => {
        const resident = await prisma.residentRecord.findFirst({
          where: { villaId, userId: v.ownerId, status: 'APPROVED' },
          select: { roomNumber: true },
        });
        return {
          id: v.id,
          plateNumber: v.plateNumber,
          modelName: v.modelName,
          isVisitor: v.isVisitor,
          expectedDeparture: v.expectedDeparture,
          ownerName: v.owner.name,
          roomNumber: resident?.roomNumber ?? null,
          createdAt: v.createdAt,
          isOwner: v.ownerId === user.sub,
        };
      }),
    );

    return ok({ vehicles: results });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// POST — 차량 등록 (F-70)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string }> },
) {
  try {
    const user = await getUser(req);
    if (!user) return err('인증이 필요합니다.', 401);

    const { villaId } = await params;

    // 관리자 또는 승인된 입주민만 등록 가능
    const villa = await prisma.villa.findUnique({
      where: { id: villaId },
      select: { adminId: true },
    });
    if (!villa) return err('빌라를 찾을 수 없습니다.', 404);

    const isAdmin = villa.adminId === user.sub;
    if (!isAdmin) {
      const resident = await prisma.residentRecord.findFirst({
        where: { villaId, userId: user.sub, status: 'APPROVED' },
      });
      if (!resident) return err('접근 권한이 없습니다.', 403);
    }

    const body = await req.json() as {
      plateNumber?: string;
      modelName?: string;
      isVisitor?: boolean;
      expectedDeparture?: string;
    };

    const plateNumber = body.plateNumber?.trim().replace(/\s/g, '');
    if (!plateNumber) return err('번호판을 입력해주세요.', 400);
    if (!/^[가-힣0-9]{4,10}$/.test(plateNumber)) {
      return err('올바른 번호판 형식이 아닙니다.', 400);
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        villaId,
        ownerId: user.sub,
        plateNumber,
        modelName: body.modelName?.trim() || null,
        isVisitor: body.isVisitor ?? false,
        expectedDeparture: body.expectedDeparture?.trim() || null,
      },
    });

    return ok({ vehicle }, 201);
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('P2002')) {
      return err('이미 등록된 번호판입니다.', 409);
    }
    return err('서버 오류가 발생했습니다.', 500);
  }
}

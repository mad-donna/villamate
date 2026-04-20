import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';
import { requireActiveSubscription } from '@/lib/subscription';

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

const VALID_CATEGORIES = ['REPAIR', 'INSPECTION', 'CONTRACT', 'CLEANING', 'ETC'] as const;
type Category = (typeof VALID_CATEGORIES)[number];

// GET: 건물 이력 조회 (관리자 + 입주민)
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
    const category = searchParams.get('category');

    const events = await prisma.buildingEvent.findMany({
      where: {
        villaId,
        ...(category && (VALID_CATEGORIES as readonly string[]).includes(category)
          ? { category: category as Category }
          : {}),
      },
      orderBy: { eventDate: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        eventDate: true,
        contractorName: true,
        contactNumber: true,
        attachmentUrl: true,
        createdAt: true,
        creator: { select: { name: true } },
      },
    });

    return ok(events);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// POST: 건물 이력 등록 (관리자 전용)
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
    if (villa.adminId !== user.sub) return err('관리자만 건물 이력을 등록할 수 있습니다.', 403);

    const subErr = await requireActiveSubscription(villaId);
    if (subErr) return subErr;

    const body = (await req.json()) as {
      title?: string;
      description?: string;
      category?: string;
      eventDate?: string;
      contractorName?: string;
      contactNumber?: string;
      attachmentUrl?: string;
    };

    const { title, description, category, eventDate, contractorName, contactNumber, attachmentUrl } =
      body;

    if (!title?.trim()) return err('제목을 입력해주세요.', 400);
    if (!category || !(VALID_CATEGORIES as readonly string[]).includes(category))
      return err('올바른 카테고리를 선택해주세요.', 400);
    if (!eventDate) return err('날짜를 입력해주세요.', 400);

    const parsedDate = new Date(eventDate);
    if (isNaN(parsedDate.getTime())) return err('날짜 형식이 올바르지 않습니다.', 400);

    const event = await prisma.buildingEvent.create({
      data: {
        villaId,
        creatorId: user.sub,
        title: title.trim(),
        description: description?.trim() ?? null,
        category: category as Category,
        eventDate: parsedDate,
        contractorName: contractorName?.trim() ?? null,
        contactNumber: contactNumber?.trim() ?? null,
        attachmentUrl: attachmentUrl ?? null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        eventDate: true,
        contractorName: true,
        contactNumber: true,
        attachmentUrl: true,
        createdAt: true,
      },
    });

    return ok(event, 201);
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

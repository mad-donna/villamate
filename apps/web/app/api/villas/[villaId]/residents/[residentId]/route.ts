import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser, ok, err } from '@/lib/api';
import { createNotification } from '@/lib/notify';

// Prisma FK 제약 위반 에러 코드
const PRISMA_FK_FAILED = 'P2003';

function isFkConstraintError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const asRecord = e as { code?: string };
  return (
    asRecord.code === PRISMA_FK_FAILED ||
    e.message.includes('Foreign key constraint') ||
    e.message.includes('foreign key')
  );
}

// PATCH: 입주 신청 승인/거절 (ADMIN 전용)
// body: { status: 'APPROVED' | 'REJECTED' }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; residentId: string }> }
) {
  try {
    const user = await getUser(req);
    if (!user) {
      return err('인증이 필요합니다.', 401);
    }

    const { villaId, residentId } = await params;

    // ADMIN 권한 확인
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

    const body = await req.json() as { status?: string };
    const status = body.status;

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return err('유효하지 않은 상태값입니다. APPROVED 또는 REJECTED를 입력하세요.', 400);
    }

    // 대상 ResidentRecord 존재 여부 확인
    const record = await prisma.residentRecord.findFirst({
      where: { id: residentId, villaId },
      select: { id: true, userId: true, roomNumber: true },
    });

    if (!record) {
      return err('입주민 정보를 찾을 수 없습니다.', 404);
    }

    // 상태 업데이트
    await prisma.residentRecord.update({
      where: { id: residentId },
      data: { status },
    });

    // 신청자에게 결과 알림 발송
    if (status === 'APPROVED') {
      await createNotification({
        userId: record.userId,
        villaId,
        type: 'SYSTEM',
        title: '입주 신청이 승인되었습니다',
        body: `${record.roomNumber}호 입주 신청이 승인되었습니다. 빌라메이트에 오신 것을 환영합니다!`,
      });
    } else {
      await createNotification({
        userId: record.userId,
        villaId,
        type: 'SYSTEM',
        title: '입주 신청이 반려되었습니다',
        body: `${record.roomNumber}호 입주 신청이 반려되었습니다. 자세한 사항은 관리자에게 문의해주세요.`,
      });
    }

    return ok({ message: status === 'APPROVED' ? '승인되었습니다.' : '거절되었습니다.' });
  } catch {
    return err('서버 오류가 발생했습니다.', 500);
  }
}

// DELETE: 전출 처리 (ADMIN 전용)
// ResidentRecord만 삭제합니다. InvoicePayment 이력은 cascade 없이 보존됩니다.
// 납부 이력이 있는 경우 DB FK 제약으로 인해 409를 반환합니다.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ villaId: string; residentId: string }> }
) {
  try {
    const user = await getUser(req);
    if (!user) {
      return err('인증이 필요합니다.', 401);
    }

    const { villaId, residentId } = await params;

    // ADMIN 권한 확인
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

    // 대상 ResidentRecord 존재 여부 확인
    const record = await prisma.residentRecord.findFirst({
      where: { id: residentId, villaId },
      select: { id: true },
    });

    if (!record) {
      return err('입주민 정보를 찾을 수 없습니다.', 404);
    }

    await prisma.residentRecord.delete({ where: { id: residentId } });

    return ok({ message: '전출 처리되었습니다.' });
  } catch (e: unknown) {
    if (isFkConstraintError(e)) {
      // InvoicePayment 등 연결된 이력이 있어 삭제 불가
      return err(
        '납부 이력이 있는 입주민은 전출 처리할 수 없습니다. 관련 납부 내역을 먼저 정리해주세요.',
        409,
      );
    }
    return err('서버 오류가 발생했습니다.', 500);
  }
}

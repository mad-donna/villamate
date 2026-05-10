import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notify';

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[publish-invoices] CRON_SECRET 환경변수가 설정되지 않았습니다.');
    return Response.json({ error: 'Server misconfiguration' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // KST 기준 오늘 날짜 계산
  const nowKST = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const day = nowKST.getUTCDate();
  const year = nowKST.getUTCFullYear();
  const month = String(nowKST.getUTCMonth() + 1).padStart(2, '0');
  const billingMonth = `${year}-${month}`;

  // autoPublishDay가 오늘이고 구독 활성 상태인 빌라 조회
  const villas = await prisma.villa.findMany({
    where: {
      autoPublishDay: day,
      subscriptionStatus: { in: ['ACTIVE', 'FREE_TRIAL'] },
    },
    select: { id: true, name: true, adminId: true, fixedFee: true },
  });

  if (villas.length === 0) {
    return Response.json({ ok: true, published: 0 });
  }

  let published = 0;
  let skipped = 0;

  for (const villa of villas) {
    // 이번 달 청구서 중복 체크
    const existing = await prisma.invoice.findFirst({
      where: { villaId: villa.id, billingMonth },
    });
    if (existing) {
      skipped++;
      continue;
    }

    // HEAD 세대 조회 (승인된 입주민만, roomNumber 포함)
    const headResidents = await prisma.residentRecord.findMany({
      where: { villaId: villa.id, residentType: 'HEAD', status: 'APPROVED' },
      select: { id: true, roomNumber: true },
    });

    if (headResidents.length === 0) {
      skipped++;
      continue;
    }

    // 청구서 + InvoicePayment 트랜잭션 생성
    const fee = villa.fixedFee ?? 0;
    try {
      await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.create({
          data: {
            villaId: villa.id,
            type: 'FIXED',
            billingMonth,
            totalAmount: fee * headResidents.length,
            memo: null,
          },
        });

        await tx.invoicePayment.createMany({
          data: headResidents.map((r) => ({
            invoiceId: invoice.id,
            residentRecordId: r.id,
            roomNumber: r.roomNumber,
            amount: fee,
            status: 'PENDING',
          })),
        });
      });
    } catch (txErr) {
      console.error(`[publish-invoices] villa=${villa.id} 트랜잭션 실패:`, txErr);
      skipped++;
      continue;
    }

    // 관리자에게 알림 전송
    await createNotification({
      userId: villa.adminId,
      villaId: villa.id,
      type: 'SYSTEM',
      title: '청구서가 자동 발행되었습니다',
      body: fee > 0
        ? `${billingMonth} 고정 관리비 청구서가 자동 발행되었습니다. (세대당 ${fee.toLocaleString('ko-KR')}원)`
        : `${billingMonth} 청구서가 자동 발행되었습니다. 금액을 입력해주세요.`,
    }).catch((e) => console.error(`[publish-invoices] 알림 실패 villaId=${villa.id}`, e));

    published++;
  }

  return Response.json({ ok: true, published, skipped });
}

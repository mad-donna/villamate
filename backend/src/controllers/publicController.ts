import { Request, Response } from 'express';
import prisma from '../prisma';

export function health(req: Request, res: Response) {
  res.status(200).json({ status: 'ok', message: 'Villamate API is running' });
}

export function uploadFile(req: Request, res: Response) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ fileUrl });
}

export async function getPayPage(req: Request, res: Response) {
  const billId = String(req.params.billId);

  try {
    const bill = await prisma.externalBilling.findUnique({
      where: { id: billId },
      include: {
        villa: { select: { accountNumber: true, bankName: true } },
      },
    });

    if (!bill) {
      return res.status(404).send('<html><body><h2>청구서를 찾을 수 없습니다.</h2></body></html>');
    }

    const formattedAmount = bill.amount.toLocaleString('ko-KR');
    const statusLabel =
      bill.status === 'COMPLETED' ? '납부 완료'
      : bill.status === 'PENDING_CONFIRMATION' ? '납부 확인 중'
      : '미납';

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>빌라메이트 청구서</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F2F2F7; min-height: 100vh; }
    .container { max-width: 480px; margin: 0 auto; padding: 24px 16px 40px; }
    .header { text-align: center; padding: 32px 0 24px; }
    .header h1 { font-size: 22px; font-weight: 700; color: #1C1C1E; }
    .header p { font-size: 14px; color: #8E8E93; margin-top: 6px; }
    .card { background: #FFFFFF; border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .card-title { font-size: 12px; font-weight: 600; color: #8E8E93; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #F2F2F7; }
    .row:last-child { border-bottom: none; }
    .row-label { font-size: 15px; color: #3C3C43; }
    .row-value { font-size: 15px; font-weight: 500; color: #1C1C1E; text-align: right; max-width: 60%; }
    .amount-value { font-size: 22px; font-weight: 700; color: #007AFF; }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .status-PENDING { background: #FFF3CD; color: #856404; }
    .status-PENDING_CONFIRMATION { background: #D1ECF1; color: #0C5460; }
    .status-COMPLETED { background: #D4EDDA; color: #155724; }
    .btn { display: block; width: 100%; padding: 16px; background: #4CAF50; color: #FFFFFF; border: none; border-radius: 14px; font-size: 17px; font-weight: 700; cursor: pointer; text-align: center; margin-top: 8px; transition: opacity 0.15s; }
    .btn:active { opacity: 0.8; }
    .btn:disabled { background: #C7C7CC; cursor: not-allowed; }
    .notice { font-size: 13px; color: #8E8E93; text-align: center; margin-top: 16px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>빌라메이트 청구서</h1>
      <p>${bill.targetName}님께 발송된 청구서입니다</p>
    </div>

    <div class="card">
      <div class="card-title">청구 내용</div>
      <div class="row">
        <span class="row-label">내용</span>
        <span class="row-value">${bill.description}</span>
      </div>
      <div class="row">
        <span class="row-label">금액</span>
        <span class="row-value amount-value">${formattedAmount}원</span>
      </div>
      <div class="row">
        <span class="row-label">납부 기한</span>
        <span class="row-value">${bill.dueDate}</span>
      </div>
      <div class="row">
        <span class="row-label">상태</span>
        <span class="status-badge status-${bill.status}">${statusLabel}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">입금 계좌</div>
      <div class="row">
        <span class="row-label">은행</span>
        <span class="row-value">${bill.villa.bankName}</span>
      </div>
      <div class="row">
        <span class="row-label">계좌번호</span>
        <span class="row-value">${bill.villa.accountNumber}</span>
      </div>
    </div>

    <button class="btn" id="notifyBtn" onclick="sendNotify()" ${bill.status === 'COMPLETED' ? 'disabled' : ''}>
      ${bill.status === 'COMPLETED' ? '납부가 완료되었습니다' : '입금 완료 알림 보내기'}
    </button>
    <p class="notice">입금 후 위 버튼을 눌러 관리자에게 알려주세요.<br>관리자가 확인 후 납부 처리됩니다.</p>
  </div>

  <script>
    async function sendNotify() {
      const btn = document.getElementById('notifyBtn');
      btn.disabled = true;
      btn.textContent = '전송 중...';
      try {
        const res = await fetch('/api/public/pay/${billId}/notify', { method: 'POST' });
        if (res.ok) {
          alert('알림이 전송되었습니다! 관리자가 확인 후 처리합니다.');
          btn.textContent = '알림 전송 완료';
        } else {
          throw new Error('서버 오류');
        }
      } catch (e) {
        alert('알림 전송에 실패했습니다. 다시 시도해주세요.');
        btn.disabled = false;
        btn.textContent = '입금 완료 알림 보내기';
      }
    }
  </script>
</body>
</html>`);
  } catch (error) {
    console.error('External bill pay page error:', error);
    res.status(500).send('<html><body><h2>오류가 발생했습니다. 잠시 후 다시 시도해주세요.</h2></body></html>');
  }
}

export async function notifyPayment(req: Request, res: Response) {
  const billId = String(req.params.billId);

  try {
    await prisma.externalBilling.update({
      where: { id: billId },
      data: { status: 'PENDING_CONFIRMATION' },
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('External bill notify error:', error);
    res.status(500).json({ error: 'Failed to update bill status' });
  }
}

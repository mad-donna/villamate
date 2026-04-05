'use client';

export interface InvoicePrintViewProps {
  billingMonth: string; // "2026-04"
  amount: number;
  roomNumber: string;
  villaName: string;
  items?: { name: string; amount: number }[];
  memo?: string | null;
  paidAt?: string | null;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  accountBank?: string | null;
  accountNumber?: string | null;
}

function formatAmount(n: number): string {
  return n.toLocaleString('ko-KR') + '원';
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-');
  return `${y}년 ${Number(m)}월 관리비`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function statusLabel(status: InvoicePrintViewProps['status']): string {
  if (status === 'PAID') return '완납';
  if (status === 'OVERDUE') return '연체';
  return '미납';
}

/** 팝업 창에 주입할 완성된 HTML 문자열을 반환합니다. */
export function buildPrintHtml(props: InvoicePrintViewProps): string {
  const {
    billingMonth,
    amount,
    roomNumber,
    villaName,
    items = [],
    memo,
    paidAt,
    status,
    accountBank,
    accountNumber,
  } = props;

  const isVariable = items.length > 0;

  const itemRows = isVariable
    ? items
        .map(
          (item) => `
        <tr>
          <td>${item.name}</td>
          <td class="text-right">${formatAmount(item.amount)}</td>
        </tr>`,
        )
        .join('')
    : '';

  const itemsSection = isVariable
    ? `
    <table class="items-table">
      <thead>
        <tr>
          <th>항목</th>
          <th class="text-right">금액</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        <tr class="total-row">
          <td><strong>합계</strong></td>
          <td class="text-right"><strong>${formatAmount(amount)}</strong></td>
        </tr>
      </tbody>
    </table>`
    : '';

  const accountSection =
    accountBank || accountNumber
      ? `
    <div class="section">
      <p class="section-title">납부 계좌</p>
      <p class="section-value">${[accountBank, accountNumber].filter(Boolean).join(' · ')}</p>
    </div>`
      : '';

  const paidSection = paidAt
    ? `<p class="paid-date">납부일: ${formatDate(paidAt)}</p>`
    : '';

  const memoSection = memo
    ? `<p class="memo">${memo}</p>`
    : '';

  const statusClass =
    status === 'PAID' ? 'status-paid' : status === 'OVERDUE' ? 'status-overdue' : 'status-pending';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${formatMonth(billingMonth)} - ${villaName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Apple SD Gothic Neo', 'Nanum Gothic', 'Malgun Gothic', serif;
      color: #1a1a1a;
      background: #fff;
      padding: 40px;
      max-width: 620px;
      margin: 0 auto;
    }

    /* ── 헤더 ── */
    .header {
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header-title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header-villa {
      font-size: 14px;
      color: #555;
      margin-top: 4px;
    }

    /* ── 핵심 정보 ── */
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }
    .meta-cell {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 12px 14px;
    }
    .meta-label {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .meta-value {
      font-size: 15px;
      font-weight: 600;
    }

    /* ── 납부 금액 ── */
    .amount-box {
      border: 2px solid #1a1a1a;
      border-radius: 10px;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .amount-label {
      font-size: 13px;
      color: #555;
    }
    .amount-value {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -1px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-paid    { background: #dcfce7; color: #166534; }
    .status-pending { background: #fee2e2; color: #991b1b; }
    .status-overdue { background: #ffedd5; color: #9a3412; }

    /* ── 항목 테이블 ── */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .items-table thead tr {
      background: #f5f5f5;
    }
    .items-table th,
    .items-table td {
      padding: 9px 12px;
      border-bottom: 1px solid #e5e5e5;
      text-align: left;
    }
    .items-table th {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #888;
    }
    .items-table .total-row td {
      border-top: 2px solid #1a1a1a;
      border-bottom: none;
      padding-top: 10px;
    }
    .text-right { text-align: right !important; }

    /* ── 섹션 블록 ── */
    .section {
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #888;
      margin-bottom: 4px;
    }
    .section-value {
      font-size: 14px;
      font-weight: 500;
    }

    .paid-date {
      font-size: 13px;
      color: #555;
      margin-top: 6px;
    }

    .memo {
      font-size: 12px;
      color: #888;
      margin-top: 8px;
      font-style: italic;
    }

    /* ── 하단 브랜딩 ── */
    .footer {
      margin-top: 40px;
      border-top: 1px solid #e5e5e5;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-brand {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: -0.3px;
      color: #1a1a1a;
    }
    .footer-sub {
      font-size: 11px;
      color: #aaa;
    }

    /* ── 프린트 미디어 ── */
    @media print {
      body { padding: 24px; }
      @page { size: A4 portrait; margin: 20mm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <p class="header-title">관리비 청구서</p>
    <p class="header-villa">${villaName}</p>
  </div>

  <div class="meta-grid">
    <div class="meta-cell">
      <p class="meta-label">청구 월</p>
      <p class="meta-value">${formatMonth(billingMonth)}</p>
    </div>
    <div class="meta-cell">
      <p class="meta-label">호수</p>
      <p class="meta-value">${roomNumber}호</p>
    </div>
  </div>

  <div class="amount-box">
    <div>
      <p class="amount-label">납부 금액</p>
      <p class="amount-value">${formatAmount(amount)}</p>
      ${paidSection}
    </div>
    <span class="status-badge ${statusClass}">${statusLabel(status)}</span>
  </div>

  ${itemsSection}

  ${accountSection}

  ${memoSection}

  <div class="footer">
    <span class="footer-brand">VillaMate</span>
    <span class="footer-sub">발행일: ${new Date().toLocaleDateString('ko-KR')}</span>
  </div>

  <script>
    window.onload = function () {
      window.print();
    };
  </script>
</body>
</html>`;
}

/**
 * React 컴포넌트로도 export — 페이지 내 인라인 미리보기 등에 사용 가능합니다.
 * 실제 PDF 저장은 InvoicePDFButton 을 사용하세요.
 */
export default function InvoicePrintView(props: InvoicePrintViewProps) {
  const {
    billingMonth,
    amount,
    roomNumber,
    villaName,
    items = [],
    memo,
    paidAt,
    status,
    accountBank,
    accountNumber,
  } = props;

  const isVariable = items.length > 0;

  return (
    <div className="bg-white p-8 max-w-lg mx-auto text-neutral-900 text-sm font-serif">
      {/* 헤더 */}
      <div className="border-b-2 border-neutral-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">관리비 청구서</h1>
        <p className="text-neutral-500 mt-1">{villaName}</p>
      </div>

      {/* 청구 월 / 호수 */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">청구 월</p>
          <p className="font-semibold">{formatMonth(billingMonth)}</p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">호수</p>
          <p className="font-semibold">{roomNumber}호</p>
        </div>
      </div>

      {/* 금액 박스 */}
      <div className="border-2 border-neutral-900 rounded-xl p-5 flex justify-between items-center mb-6">
        <div>
          <p className="text-xs text-neutral-500">납부 금액</p>
          <p className="text-3xl font-bold tracking-tight mt-1">{formatAmount(amount)}</p>
          {paidAt && (
            <p className="text-xs text-neutral-400 mt-1">납부일: {formatDate(paidAt)}</p>
          )}
        </div>
        <span
          className={[
            'text-xs font-semibold px-2.5 py-1 rounded-full',
            status === 'PAID'
              ? 'bg-green-100 text-green-700'
              : status === 'OVERDUE'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-red-100 text-red-700',
          ].join(' ')}
        >
          {statusLabel(status)}
        </span>
      </div>

      {/* 항목 테이블 (VARIABLE) */}
      {isVariable && (
        <table className="w-full text-xs mb-6 border-collapse">
          <thead>
            <tr className="bg-neutral-50">
              <th className="text-left px-3 py-2 text-neutral-400 uppercase tracking-wide font-normal border-b border-neutral-200">
                항목
              </th>
              <th className="text-right px-3 py-2 text-neutral-400 uppercase tracking-wide font-normal border-b border-neutral-200">
                금액
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td className="px-3 py-2 border-b border-neutral-100">{item.name}</td>
                <td className="px-3 py-2 border-b border-neutral-100 text-right">
                  {formatAmount(item.amount)}
                </td>
              </tr>
            ))}
            <tr>
              <td className="px-3 pt-3 font-bold border-t-2 border-neutral-900">합계</td>
              <td className="px-3 pt-3 text-right font-bold border-t-2 border-neutral-900">
                {formatAmount(amount)}
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/* 납부 계좌 */}
      {(accountBank || accountNumber) && (
        <div className="mb-4">
          <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">납부 계좌</p>
          <p className="font-medium">{[accountBank, accountNumber].filter(Boolean).join(' · ')}</p>
        </div>
      )}

      {/* 메모 */}
      {memo && <p className="text-xs text-neutral-400 italic mb-4">{memo}</p>}

      {/* 하단 */}
      <div className="mt-10 pt-4 border-t border-neutral-200 flex justify-between items-center">
        <span className="font-bold tracking-tight">VillaMate</span>
        <span className="text-xs text-neutral-400">
          발행일: {new Date().toLocaleDateString('ko-KR')}
        </span>
      </div>
    </div>
  );
}

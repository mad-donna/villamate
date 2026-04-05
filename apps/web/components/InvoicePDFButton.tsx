'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { buildPrintHtml, type InvoicePrintViewProps } from '@/components/InvoicePrintView';

interface InvoicePDFButtonProps {
  invoiceData: InvoicePrintViewProps;
  /** 버튼 크기 — Button 컴포넌트와 동일 */
  size?: 'lg' | 'md' | 'sm';
  className?: string;
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-');
  return `${y}년 ${Number(m)}월 관리비`;
}

/** PDF 저장 아이콘 (미니멀 다운로드/프린터 아이콘) */
function PrintIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

/** 공유 아이콘 */
function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

/**
 * 청구서 PDF 저장/공유 버튼
 *
 * - 클릭 시 팝업 창에 프린트 전용 HTML을 주입하고 window.print()를 호출합니다.
 *   브라우저의 "PDF로 저장" 기능을 통해 PDF 파일로 내보낼 수 있습니다.
 * - Web Share API(모바일 Safari/Chrome)가 지원되는 환경에서는 공유 시트를 먼저 엽니다.
 *   공유를 취소하거나 지원하지 않는 경우 프린트 팝업으로 대체합니다.
 */
export default function InvoicePDFButton({
  invoiceData,
  size = 'sm',
  className = '',
}: InvoicePDFButtonProps) {
  const [sharing, setSharing] = useState(false);

  const openPrintPopup = () => {
    const html = buildPrintHtml(invoiceData);
    const popup = window.open('', '_blank', 'width=700,height=900,scrollbars=yes');
    if (!popup) {
      // 팝업 차단 시 fallback 안내
      alert('팝업이 차단되었습니다. 브라우저 팝업 허용 설정 후 다시 시도해 주세요.');
      return;
    }
    popup.document.write(html);
    popup.document.close();
  };

  const handleClick = async () => {
    const title = formatMonth(invoiceData.billingMonth);
    const text = `${invoiceData.villaName} ${invoiceData.roomNumber}호 ${title} ${invoiceData.amount.toLocaleString('ko-KR')}원`;

    // Web Share API — 모바일에서 네이티브 공유 시트 표시
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setSharing(true);
      try {
        await navigator.share({ title, text });
        // 공유 완료 후 PDF 저장 팝업도 추가로 열기
        openPrintPopup();
      } catch (err) {
        // AbortError: 사용자가 공유를 취소한 경우 — PDF 팝업만 열기
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('공유 실패:', err);
        }
        // 취소했거나 실패해도 프린트 팝업은 열어줌
        openPrintPopup();
      } finally {
        setSharing(false);
      }
    } else {
      // Web Share API 미지원 (데스크톱) — 바로 프린트 팝업
      openPrintPopup();
    }
  };

  // Web Share API 지원 여부는 SSR에서 알 수 없으므로 텍스트 고정
  const label = '청구서 저장';

  return (
    <Button
      variant="secondary"
      size={size}
      loading={sharing}
      onClick={handleClick}
      className={['gap-1.5', className].join(' ')}
      aria-label={`${formatMonth(invoiceData.billingMonth)} 청구서 저장`}
    >
      {sharing ? <ShareIcon /> : <PrintIcon />}
      {label}
    </Button>
  );
}

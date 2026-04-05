'use client';

import { useEffect, useState, useCallback } from 'react';
import Script from 'next/script';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import InvoicePDFButton from '@/components/InvoicePDFButton';

// TypeScript: window.IMP 전역 객체 선언 (PortOne SDK 주입)
declare global {
  interface Window {
    IMP: {
      init: (code: string) => void;
      request_pay: (
        params: {
          pg: string;
          pay_method: string;
          merchant_uid: string;
          name: string;
          amount: number;
          buyer_name: string;
          buyer_tel: string;
        },
        callback: (response: PortOneResponse) => void,
      ) => void;
    };
  }
}

interface PortOneResponse {
  success: boolean;
  imp_uid: string | null;
  error_msg?: string;
  error_code?: string;
}

interface InvoicePayment {
  id: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  amount: number;
  paidAt: string | null;
  impUid: string | null;
  invoice: {
    id: string;
    billingMonth: string;
    type: 'FIXED' | 'VARIABLE';
    memo: string | null;
    items: { name: string; amount: number }[];
  };
}

interface VillaInfo {
  name: string;
  accountBank: string | null;
  accountNumber: string | null;
}

function formatAmount(n: number | string) {
  return Number(n).toLocaleString('ko-KR') + '원';
}

function formatMonth(ym: string) {
  const [y, m] = ym.split('-');
  return `${y}년 ${Number(m)}월 관리비`;
}

function getUserInfo(): {
  villaId?: string;
  token?: string;
  name?: string;
  phone?: string;
  roomNumber?: string;
} {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : {};
    return {
      villaId: user.villaId,
      token: localStorage.getItem('token') ?? undefined,
      name: user.name,
      phone: user.phone,
      roomNumber: user.roomNumber,
    };
  } catch {
    return {};
  }
}

const statusBadgeVariant = {
  PAID: '완납',
  PENDING: '미납',
  OVERDUE: '납기임박',
} as const;

export default function ResidentInvoicePage() {
  const [payments, setPayments] = useState<InvoicePayment[]>([]);
  const [villaInfo, setVillaInfo] = useState<VillaInfo | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  // 결제 진행 중인 paymentId를 추적 (중복 클릭 방지)
  const [payingId, setPayingId] = useState<string | null>(null);
  // PortOne SDK 로드 완료 여부
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const userInfo = getUserInfo();
    const { villaId, token } = userInfo;

    setRoomNumber(userInfo.roomNumber ?? '');

    if (!villaId) {
      setError('빌라 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    // 청구서 목록과 빌라 정보를 병렬로 가져옵니다
    Promise.all([
      fetch(`/api/villas/${villaId}/invoices/my`, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      }).then((res) => res.json()),
      fetch(`/api/villas/${villaId}`, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      }).then((res) => res.json()),
    ])
      .then(([invoiceData, villaData]) => {
        if (invoiceData.error) {
          setError(invoiceData.error);
        } else {
          setPayments(invoiceData.payments ?? []);
        }
        if (!villaData.error) {
          setVillaInfo({
            name: villaData.name ?? '',
            accountBank: villaData.accountBank ?? null,
            accountNumber: villaData.accountNumber ?? null,
          });
        }
      })
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  /**
   * PortOne 인앱 결제 플로우
   * 1. IMP.init() 으로 가맹점 식별코드 초기화
   * 2. IMP.request_pay() 호출 → 결제창 오픈
   * 3. 콜백에서 imp_uid 수신 → 서버 검증 API 호출
   * 4. 검증 성공 시 낙관적 UI 업데이트
   */
  const handlePay = useCallback(
    async (payment: InvoicePayment) => {
      if (!sdkReady) {
        alert('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      const impCode = process.env.NEXT_PUBLIC_PORTONE_IMP_CODE;
      if (!impCode) {
        alert('결제 설정이 올바르지 않습니다. 관리자에게 문의해주세요.');
        return;
      }

      const { villaId, token, name, phone } = getUserInfo();
      if (!villaId || !token) {
        alert('로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.');
        return;
      }

      setPayingId(payment.id);

      try {
        // PortOne SDK 초기화
        window.IMP.init(impCode);

        // 결제 요청
        window.IMP.request_pay(
          {
            pg: 'html5_inicis',
            pay_method: 'card',
            // merchant_uid에 paymentId를 포함시켜 서버 검증 시 대조
            merchant_uid: `order_${payment.id}_${Date.now()}`,
            name: formatMonth(payment.invoice.billingMonth),
            amount: Number(payment.amount),
            buyer_name: name ?? '입주민',
            buyer_tel: phone ?? '010-0000-0000',
          },
          async (response: PortOneResponse) => {
            if (!response.success || !response.imp_uid) {
              alert(`결제에 실패했습니다.\n${response.error_msg ?? ''}`);
              setPayingId(null);
              return;
            }

            // 서버 imp_uid 검증 요청
            try {
              const verifyRes = await fetch(
                `/api/villas/${villaId}/invoices/${payment.invoice.id}/payments/${payment.id}/verify`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ imp_uid: response.imp_uid }),
                },
              );

              const verifyData = await verifyRes.json();

              if (!verifyRes.ok || verifyData.error) {
                alert(
                  `결제 검증 실패: ${verifyData.error ?? '알 수 없는 오류가 발생했습니다.'}\n고객센터에 문의해주세요.`,
                );
                setPayingId(null);
                return;
              }

              // 낙관적 UI 업데이트 — 해당 payment의 status를 PAID로 변경
              setPayments((prev) =>
                prev.map((p) =>
                  p.id === payment.id
                    ? {
                        ...p,
                        status: 'PAID' as const,
                        paidAt: new Date().toISOString(),
                        impUid: response.imp_uid,
                      }
                    : p,
                ),
              );

              alert('납부가 완료되었습니다.');
            } catch {
              alert('결제 검증 중 네트워크 오류가 발생했습니다. 고객센터에 문의해주세요.');
            } finally {
              setPayingId(null);
            }
          },
        );
      } catch {
        alert('결제창을 열 수 없습니다. 잠시 후 다시 시도해주세요.');
        setPayingId(null);
      }
    },
    [sdkReady],
  );

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* PortOne JS SDK 동적 로드 */}
      <Script
        src="https://cdn.iamport.kr/v1/iamport.js"
        strategy="lazyOnload"
        onLoad={() => setSdkReady(true)}
      />

      <main className="px-4 pt-6 pb-12">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">관리비 내역</h1>

        {error && (
          <p className="text-center text-error-500 py-8">{error}</p>
        )}

        {!error && payments.length === 0 && (
          <div className="text-center py-16 text-neutral-400">
            <p className="text-4xl mb-3">📋</p>
            <p>청구된 관리비가 없습니다.</p>
          </div>
        )}

        {!error && payments.length > 0 && (
          <ul className="space-y-3">
            {payments.map((p) => (
              <li
                key={p.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* 카드 메인 행 */}
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900">
                        {formatMonth(p.invoice.billingMonth)}
                      </p>
                      <p className="text-lg font-bold text-neutral-900 mt-1">
                        {formatAmount(p.amount)}
                      </p>
                      {p.paidAt && (
                        <p className="text-xs text-neutral-400 mt-0.5">
                          납부일:{' '}
                          {new Date(p.paidAt).toLocaleDateString('ko-KR')}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={statusBadgeVariant[p.status]}>
                        {p.status === 'PAID'
                          ? '완납'
                          : p.status === 'OVERDUE'
                            ? '연체'
                            : '미납'}
                      </Badge>
                    </div>
                  </div>

                  {/* 항목 상세 (VARIABLE이고 items 있을 때) */}
                  {p.invoice.type === 'VARIABLE' && p.invoice.items.length > 0 && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((prev) => (prev === p.id ? null : p.id))
                        }
                        className="text-xs text-primary-600 hover:underline"
                      >
                        {expanded === p.id ? '항목 숨기기 ▲' : '항목 보기 ▼'}
                      </button>
                      {expanded === p.id && (
                        <ul className="mt-2 space-y-1.5 bg-neutral-50 rounded-xl p-3">
                          {p.invoice.items.map((item, i) => (
                            <li
                              key={i}
                              className="flex justify-between text-xs text-neutral-600"
                            >
                              <span>{item.name}</span>
                              <span>{formatAmount(item.amount)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* 메모 */}
                  {p.invoice.memo && (
                    <p className="mt-2 text-xs text-neutral-400">
                      {p.invoice.memo}
                    </p>
                  )}
                </div>

                {/* 하단 버튼 영역 */}
                <div className="px-5 pb-4 flex flex-col gap-2">
                  {/* 납부하기 버튼 (PENDING 또는 OVERDUE일 때만) */}
                  {(p.status === 'PENDING' || p.status === 'OVERDUE') && (
                    <Button
                      className="w-full"
                      size="md"
                      disabled={payingId === p.id}
                      onClick={() => handlePay(p)}
                    >
                      {payingId === p.id ? '결제 처리 중...' : '납부하기'}
                    </Button>
                  )}

                  {/* 청구서 저장 버튼 — 완납/미납 무관하게 항상 표시 */}
                  <InvoicePDFButton
                    size="sm"
                    className="w-full"
                    invoiceData={{
                      billingMonth: p.invoice.billingMonth,
                      amount: p.amount,
                      roomNumber,
                      villaName: villaInfo?.name ?? '',
                      items:
                        p.invoice.type === 'VARIABLE'
                          ? p.invoice.items
                          : [],
                      memo: p.invoice.memo,
                      paidAt: p.paidAt,
                      status: p.status,
                      accountBank: villaInfo?.accountBank,
                      accountNumber: villaInfo?.accountNumber,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

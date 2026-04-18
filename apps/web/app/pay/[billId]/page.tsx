'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface BillingData {
  id: string;
  targetName: string;
  phoneNumber: string;
  amount: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'PENDING_CONFIRMATION' | 'COMPLETED';
  villa: { name: string };
}

const STATUS_LABEL: Record<BillingData['status'], string> = {
  PENDING: '납부 대기',
  PENDING_CONFIRMATION: '납부 확인 중',
  COMPLETED: '납부 완료',
};

function formatAmount(n: number | string) {
  return Number(n).toLocaleString('ko-KR') + '원';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// PortOne JS SDK를 동적으로 로드합니다.
function loadPortOneScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.IMP) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.iamport.kr/v1/iamport.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('PortOne SDK 로드 실패'));
    document.head.appendChild(script);
  });
}

export default function PayPage() {
  const { billId } = useParams<{ billId: string }>();
  const searchParams = useSearchParams();

  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const confirmPayment = useCallback(async (impUid: string) => {
    setPaying(true);
    try {
      const confirmRes = await fetch(`/api/pay/${billId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imp_uid: impUid }),
      });
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) {
        setPayError(confirmData.error ?? '결제 검증 중 오류가 발생했습니다.');
        return;
      }
      setCompleted(true);
    } catch {
      setPayError('결제 검증 중 서버 오류가 발생했습니다. 고객센터에 문의해주세요.');
    } finally {
      setPaying(false);
    }
  }, [billId]);

  const fetchBilling = useCallback(async () => {
    try {
      const res = await fetch(`/api/pay/${billId}`);
      const data = await res.json();
      if (!res.ok) {
        setFetchError(data.error ?? '청구서를 불러오지 못했습니다.');
        return;
      }
      setBilling(data.billing);
      if (data.billing.status === 'COMPLETED') {
        setCompleted(true);
      }
    } catch {
      setFetchError('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [billId]);

  // 모바일 결제 후 redirect 복귀 시 imp_uid 파라미터로 자동 검증
  useEffect(() => {
    const impUid = searchParams.get('imp_uid');
    const impSuccess = searchParams.get('imp_success');
    if (impUid) {
      if (impSuccess === 'false') {
        setPayError(searchParams.get('error_msg') ?? '결제가 취소되었습니다.');
        setLoading(false);
        return;
      }
      fetchBilling().then(() => confirmPayment(impUid));
      return;
    }
    fetchBilling();
  }, [fetchBilling, confirmPayment, searchParams]);

  async function handlePay() {
    if (!billing) return;
    setPayError(null);
    setPaying(true);

    try {
      await loadPortOneScript();

      const impCode = process.env.NEXT_PUBLIC_PORTONE_IMP_CODE;
      if (!impCode) {
        setPayError('결제 설정이 올바르지 않습니다. 관리자에게 문의해주세요.');
        setPaying(false);
        return;
      }

      window.IMP.init(impCode);

      // m_redirect_url: 모바일에서 결제 후 현재 페이지로 복귀 (redirect 방식)
      const redirectUrl = `${window.location.origin}/pay/${billId}`;

      window.IMP.request_pay(
        {
          pg: 'html5_inicis',
          pay_method: 'card',
          merchant_uid: `ext_${billId}_${Date.now()}`,
          name: billing.description,
          amount: Number(billing.amount),
          buyer_name: billing.targetName,
          buyer_tel: billing.phoneNumber,
          m_redirect_url: redirectUrl,
        },
        async (rsp) => {
          // 데스크탑 팝업 방식 콜백 (모바일 redirect는 useEffect에서 처리)
          if (!rsp.success || !rsp.imp_uid) {
            setPayError(rsp.error_msg ?? '결제가 취소되었습니다.');
            setPaying(false);
            return;
          }
          await confirmPayment(rsp.imp_uid);
        },
      );
    } catch (e) {
      setPayError(e instanceof Error ? e.message : '결제 준비 중 오류가 발생했습니다.');
      setPaying(false);
    }
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 데이터 오류
  if (fetchError || !billing) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">📄</p>
        <p className="text-lg font-semibold text-neutral-800 mb-2">청구서를 찾을 수 없습니다</p>
        <p className="text-sm text-neutral-500">{fetchError ?? '올바른 링크인지 확인해주세요.'}</p>
      </div>
    );
  }

  // 납부 완료 화면
  if (completed) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">납부 완료</h1>
        <p className="text-neutral-500 text-sm mb-1">{billing.villa.name}</p>
        <p className="text-neutral-500 text-sm">{billing.targetName}님의 납부가 정상 처리되었습니다.</p>
        <p className="mt-6 text-2xl font-bold text-primary-600">{formatAmount(billing.amount)}</p>
      </div>
    );
  }

  const isPendingConfirmation = billing.status === 'PENDING_CONFIRMATION';

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-neutral-100 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">VM</span>
            </div>
            <span className="font-bold text-neutral-900 text-sm">VillaMate</span>
          </div>
          <span className="text-xs text-neutral-400">안전 결제</span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 pb-32">
        {/* 빌라명 */}
        <p className="text-sm text-neutral-500 mb-1">{billing.villa.name}</p>

        {/* 청구 대상 */}
        <h1 className="text-xl font-bold text-neutral-900 mb-4">
          {billing.targetName}님 청구서
        </h1>

        {/* 금액 카드 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 text-center">
          <p className="text-sm text-neutral-500 mb-2">납부 금액</p>
          <p className="text-4xl font-bold text-primary-600">{formatAmount(billing.amount)}</p>
        </div>

        {/* 상세 정보 카드 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4 space-y-4">
          <div>
            <p className="text-xs text-neutral-400 mb-1">청구 내용</p>
            <p className="text-sm font-medium text-neutral-900">{billing.description}</p>
          </div>
          <div className="h-px bg-neutral-100" />
          <div>
            <p className="text-xs text-neutral-400 mb-1">납부 기한</p>
            <p className="text-sm font-medium text-neutral-900">{formatDate(billing.dueDate)}</p>
          </div>
          <div className="h-px bg-neutral-100" />
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-400">현재 상태</p>
            <StatusBadge status={billing.status} />
          </div>
        </div>

        {/* PENDING_CONFIRMATION 안내 메시지 */}
        {isPendingConfirmation && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-sm text-orange-700 font-medium">납부 확인 중</p>
            <p className="text-xs text-orange-600 mt-0.5">
              관리자가 납부를 확인하고 있습니다. 잠시 기다려주세요.
            </p>
          </div>
        )}

        {/* 에러 메시지 */}
        {payError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-sm text-error-500">{payError}</p>
          </div>
        )}
      </main>

      {/* 하단 납부 버튼 — PENDING 상태일 때만 표시 */}
      {billing.status === 'PENDING' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-4 py-4">
          <div className="max-w-md mx-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handlePay}
              loading={paying}
              disabled={paying}
            >
              {paying ? '처리 중...' : `${formatAmount(billing.amount)} 납부하기`}
            </Button>
            <p className="text-center text-xs text-neutral-400 mt-2">
              KG Inicis 안전 결제 · SSL 암호화
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: BillingData['status'] }) {
  const classes: Record<BillingData['status'], string> = {
    PENDING: 'bg-warning-100 text-warning-700',
    PENDING_CONFIRMATION: 'bg-primary-100 text-primary-700',
    COMPLETED: 'bg-success-100 text-success-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${classes[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

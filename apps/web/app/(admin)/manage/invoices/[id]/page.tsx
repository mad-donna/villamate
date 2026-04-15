'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface InvoiceDetail {
  id: string;
  type: 'FIXED' | 'VARIABLE';
  billingMonth: string;
  totalAmount: number;
  memo: string | null;
  items: { id: string; name: string; amount: number }[];
  createdAt: string;
}

interface Payment {
  id: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  amount: number;
  paidAt: string | null;
  residentRecord: {
    roomNumber: string;
    residentType: string;
    user: { name: string };
  };
}

interface Summary {
  paidAmount: number;
  unpaidAmount: number;
  paidCount: number;
  unpaidCount: number;
}

function formatAmount(n: number | string) {
  return Number(n).toLocaleString('ko-KR') + '원';
}

function formatMonth(ym: string) {
  const [y, m] = ym.split('-');
  return `${y}년 ${Number(m)}월 관리비`;
}

function getVillaId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user.villa?.id ?? null;
  } catch {
    return null;
  }
}

const statusBadgeVariant = {
  PAID: 'success',
  PENDING: 'error',
  OVERDUE: 'warning',
} as const;

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const invoiceId = params.id;

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    const villaId = getVillaId();
    if (!villaId) {
      setError('빌라 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/villas/${villaId}/invoices/${invoiceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
          },
        },
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? '데이터를 불러오지 못했습니다.');
        return;
      }

      setInvoice(data.invoice);
      setPayments(data.payments);
      setSummary(data.summary);
    } catch {
      setError('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // 납부 확인 처리
  async function handleConfirmPayment(paymentId: string) {
    const villaId = getVillaId();
    if (!villaId) return;

    setUpdatingId(paymentId);
    try {
      const res = await fetch(
        `/api/villas/${villaId}/invoices/${invoiceId}/payments/${paymentId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
          },
          body: JSON.stringify({ status: 'PAID' }),
        },
      );
      if (res.ok) {
        // 납부 상태만 낙관적으로 업데이트
        setPayments((prev) =>
          prev.map((p) =>
            p.id === paymentId
              ? { ...p, status: 'PAID', paidAt: new Date().toISOString() }
              : p,
          ),
        );
        setSummary((prev) => {
          if (!prev) return prev;
          const p = payments.find((x) => x.id === paymentId);
          const amount = Number(p?.amount ?? 0);
          return {
            paidAmount: prev.paidAmount + amount,
            unpaidAmount: prev.unpaidAmount - amount,
            paidCount: prev.paidCount + 1,
            unpaidCount: prev.unpaidCount - 1,
          };
        });
      }
    } catch {
      // silent
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !invoice || !summary) {
    return (
      <main className="px-4 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-neutral-500 mb-4 flex items-center gap-1 min-h-[44px] -ml-1 pl-1 pr-3"
        >
          ← 뒤로
        </button>
        <p className="text-center text-error-500 py-8">
          {error ?? '데이터를 불러오지 못했습니다.'}
        </p>
      </main>
    );
  }

  const totalCount = summary.paidCount + summary.unpaidCount;
  const pct = totalCount > 0 ? Math.round((summary.paidCount / totalCount) * 100) : 0;

  return (
    <main className="px-4 pt-6 pb-12">
      {/* 뒤로 */}
      <button
        type="button"
        onClick={() => router.back()}
        className="text-sm text-neutral-500 mb-4 flex items-center gap-1 min-h-[44px] -ml-1 pl-1 pr-3 hover:text-neutral-700"
      >
        ← 뒤로
      </button>

      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-bold text-neutral-900">
          {formatMonth(invoice.billingMonth)}
        </h1>
        <Badge variant={invoice.type === 'FIXED' ? 'info' : 'warning'}>
          {invoice.type === 'FIXED' ? '고정' : '변동'}
        </Badge>
      </div>

      {/* 요약 카드 */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-neutral-500 mb-1">수금액</p>
            <p className="text-lg font-bold text-success-500">
              {formatAmount(summary.paidAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">미납액</p>
            <p className="text-lg font-bold text-error-500">
              {formatAmount(summary.unpaidAmount)}
            </p>
          </div>
        </div>

        {/* 납부율 프로그레스 바 */}
        <div>
          <div className="flex justify-between text-xs text-neutral-500 mb-1">
            <span>납부율</span>
            <span>
              {summary.paidCount}/{totalCount} 세대 ({pct}%)
            </span>
          </div>
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* 메모 */}
        {invoice.memo && (
          <p className="mt-3 text-xs text-neutral-500 border-t border-neutral-100 pt-3">
            {invoice.memo}
          </p>
        )}
      </Card>

      {/* 변동 항목 상세 */}
      {invoice.type === 'VARIABLE' && invoice.items.length > 0 && (
        <Card className="mb-6">
          <p className="text-sm font-semibold text-neutral-700 mb-3">항목 내역</p>
          <ul className="space-y-2">
            {invoice.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between text-sm text-neutral-700"
              >
                <span>{item.name}</span>
                <span className="font-medium">{formatAmount(item.amount)}</span>
              </li>
            ))}
            <li className="flex justify-between text-sm font-bold text-neutral-900 border-t border-neutral-100 pt-2">
              <span>합계</span>
              <span>{formatAmount(invoice.totalAmount)}</span>
            </li>
          </ul>
        </Card>
      )}

      {/* 세대별 납부 현황 */}
      <h2 className="text-base font-semibold text-neutral-800 mb-3">
        세대별 납부 현황
      </h2>

      {payments.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-8">
          납부 내역이 없습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {payments.map((p) => (
            <li
              key={p.id}
              className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3"
            >
              {/* 호수 + 이름 */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900 text-sm">
                  {p.residentRecord.roomNumber}호&nbsp;
                  <span className="font-normal text-neutral-600">
                    {p.residentRecord.user.name}
                  </span>
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {formatAmount(p.amount)}
                </p>
              </div>

              {/* 상태 배지 */}
              <Badge variant={statusBadgeVariant[p.status]}>
                {p.status === 'PAID' ? '완납' : p.status === 'OVERDUE' ? '연체' : '미납'}
              </Badge>

              {/* 납부 확인 버튼 (완납 아닐 때만) */}
              {p.status !== 'PAID' && (
                <Button
                  size="sm"
                  variant="secondary"
                  loading={updatingId === p.id}
                  onClick={() => handleConfirmPayment(p.id)}
                >
                  납부확인
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

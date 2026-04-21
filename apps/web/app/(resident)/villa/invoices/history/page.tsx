'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { apiFetch } from '@/lib/client-api';

interface Payment {
  id: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  amount: number;
  paidAt: string | null;
  invoice: {
    id: string;
    billingMonth: string;
    type: 'FIXED' | 'VARIABLE';
    memo: string | null;
  };
}

type StatusFilter = 'ALL' | 'PAID' | 'PENDING' | 'OVERDUE';

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'PAID', label: '완납' },
  { key: 'PENDING', label: '미납' },
  { key: 'OVERDUE', label: '연체' },
];

const statusBadgeVariant = {
  PAID: 'success',
  PENDING: 'error',
  OVERDUE: 'warning',
} as const;

const statusLabel = {
  PAID: '완납',
  PENDING: '미납',
  OVERDUE: '연체',
} as const;

function formatAmount(n: number) {
  return Number(n).toLocaleString('ko-KR') + '원';
}

function formatMonth(ym: string) {
  const [y, m] = ym.split('-');
  return `${y}년 ${Number(m)}월 관리비`;
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('ALL');

  useEffect(() => {
    const url =
      activeFilter === 'ALL'
        ? '/api/resident/payments/history'
        : `/api/resident/payments/history?status=${activeFilter}`;

    setLoading(true);
    apiFetch(url)
      .then((res) => res.json())
      .then((data: { payments?: Payment[]; error?: string }) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPayments(data.payments ?? []);
        }
      })
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [activeFilter]);

  return (
    <main className="px-4 pt-6 pb-24">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/villa/invoices"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-600"
          aria-label="뒤로가기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-neutral-900">납부 이력</h1>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] ${
              activeFilter === key
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 h-20 animate-pulse" />
          ))}
        </div>
      )}

      {/* 에러 */}
      {!loading && error && (
        <p className="text-center text-error-500 py-12">{error}</p>
      )}

      {/* 빈 상태 */}
      {!loading && !error && payments.length === 0 && (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-4xl mb-3">📋</p>
          <p>납부 이력이 없습니다.</p>
        </div>
      )}

      {/* 목록 */}
      {!loading && !error && payments.length > 0 && (
        <ul className="space-y-3">
          {payments.map((p) => (
            <li key={p.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 text-sm">
                    {formatMonth(p.invoice.billingMonth)}
                  </p>
                  <p className="text-lg font-bold text-neutral-900 mt-0.5">
                    {formatAmount(p.amount)}
                  </p>
                  {p.paidAt && (
                    <p className="text-xs text-neutral-400 mt-0.5">
                      납부일: {new Date(p.paidAt).toLocaleDateString('ko-KR')}
                    </p>
                  )}
                  {p.invoice.memo && (
                    <p className="text-xs text-neutral-400 mt-0.5">{p.invoice.memo}</p>
                  )}
                </div>
                <Badge variant={statusBadgeVariant[p.status]}>
                  {statusLabel[p.status]}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

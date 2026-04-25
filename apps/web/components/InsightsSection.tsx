'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/client-api';

interface MonthlyItem {
  month: string;
  amount: number;
}

interface InsightsData {
  currentMonth: string;
  paymentRate: number;
  paidCount: number;
  totalCount: number;
  monthlyCollection: MonthlyItem[];
}

function formatMonth(ym: string) {
  const [, m] = ym.split('-');
  return `${Number(m)}월`;
}

export function InsightsSection() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiGet<InsightsData>('/api/admin/insights')
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section aria-label="수금 현황" className="space-y-3">
        <div className="h-4 w-28 bg-neutral-100 rounded animate-pulse" />
        <div className="bg-white rounded-2xl shadow-sm p-4 h-32 animate-pulse" />
      </section>
    );
  }

  if (error || !data) {
    return (
      <section aria-label="수금 현황" className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-600">수금 현황</h2>
        <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
          <p className="text-sm text-neutral-400">수금 현황을 불러오지 못했습니다.</p>
        </div>
      </section>
    );
  }

  const maxAmount = Math.max(...data.monthlyCollection.map((m) => m.amount), 1);

  return (
    <section aria-label="수금 현황" className="space-y-4">
      <h2 className="text-sm font-semibold text-neutral-600">수금 현황</h2>

      {/* 이번 달 수금률 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-neutral-700">이번 달 납부율</p>
          <p className="text-lg font-bold text-primary-600">{data.paymentRate}%</p>
        </div>
        <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full transition-all duration-500"
            style={{
              width: `${data.paymentRate}%`,
              backgroundColor:
                data.paymentRate >= 80
                  ? 'var(--color-success-500, #22c55e)'
                  : data.paymentRate >= 50
                    ? 'var(--color-warning-500, #f59e0b)'
                    : 'var(--color-error-500, #ef4444)',
            }}
          />
        </div>
        <p className="text-xs text-neutral-400">
          전체 {data.totalCount}세대 중 {data.paidCount}세대 납부 완료
        </p>
      </div>

      {/* 최근 6개월 수금액 차트 */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <p className="text-sm font-medium text-neutral-700 mb-4">최근 6개월 수금액</p>
        <div className="flex items-end gap-2 h-28">
          {data.monthlyCollection.map((item) => {
            const heightPct = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
            const isCurrentMonth = item.month === data.currentMonth;
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                <p className="text-xs text-neutral-500 truncate">
                  {item.amount > 0
                    ? `${Math.round(item.amount / 10000)}만`
                    : ''}
                </p>
                <div className="w-full flex flex-col justify-end" style={{ height: '72px' }}>
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${Math.max(heightPct, item.amount > 0 ? 4 : 0)}%`,
                      backgroundColor: isCurrentMonth
                        ? 'var(--color-primary-500, #3b82f6)'
                        : 'var(--color-primary-200, #bfdbfe)',
                    }}
                  />
                </div>
                <p
                  className={`text-xs ${isCurrentMonth ? 'font-semibold text-primary-600' : 'text-neutral-400'}`}
                >
                  {formatMonth(item.month)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

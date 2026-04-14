'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { boAuthHeaders } from '@/lib/backoffice-auth';

interface InvoiceSummary {
  id: string;
  villaId: string;
  villaName: string;
  billingMonth: string;
  type: string;
  totalAmount: number;
  paidAmount: number;
  paidCount: number;
  totalCount: number;
  paidRate: number;
  createdAt: string;
}

const TYPE_LABEL: Record<string, string> = {
  MANAGEMENT: '관리비',
  EXTRA: '추가 청구',
};

function formatKRW(n: number) {
  return n.toLocaleString('ko-KR') + '원';
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async (m: string, p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (m) params.set('month', m);
      const res = await fetch(`/api/backoffice/billing?${params}`, { headers: boAuthHeaders() });
      const data = await res.json() as { invoices?: InvoiceSummary[]; hasMore?: boolean; total?: number };
      if (p === 1) {
        setInvoices(data.invoices ?? []);
      } else {
        setInvoices((prev) => [...prev, ...(data.invoices ?? [])]);
      }
      setHasMore(data.hasMore ?? false);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 기본: 이번 달
    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonth(defaultMonth);
    fetchData(defaultMonth, 1);
  }, [fetchData]);

  function handleMonthChange(m: string) {
    setMonth(m);
    setPage(1);
    fetchData(m, 1);
  }

  function loadMore() {
    const next = page + 1;
    setPage(next);
    fetchData(month, next);
  }

  // 집계
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const avgPaidRate = invoices.length > 0
    ? Math.round(invoices.reduce((sum, inv) => sum + inv.paidRate, 0) / invoices.length)
    : 0;

  // 최근 6개월 선택지
  const monthOptions: string[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthOptions.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">청구 현황</h1>
        <p className="text-sm text-neutral-500 mt-0.5">빌라별 청구서 발행·납부 현황</p>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium text-neutral-600">월 선택</label>
        <select
          value={month}
          onChange={(e) => handleMonthChange(e.target.value)}
          className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary-400"
        >
          <option value="">전체</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <span className="text-sm text-neutral-400">총 {total}건</span>
      </div>

      {/* 요약 카드 */}
      {!loading && invoices.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-xs font-medium text-neutral-500 mb-1">청구서 수</p>
            <p className="text-2xl font-bold text-neutral-900">{invoices.length}건</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-xs font-medium text-neutral-500 mb-1">수납 금액</p>
            <p className="text-2xl font-bold text-green-600">{formatKRW(totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-xs font-medium text-neutral-500 mb-1">평균 납부율</p>
            <p className="text-2xl font-bold text-primary-600">{avgPaidRate}%</p>
          </div>
        </div>
      )}

      {/* 청구서 목록 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading && invoices.length === 0 ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-neutral-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 text-sm">청구서가 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-neutral-500">빌라</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">청구월</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">유형</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500">청구금액</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500">수납금액</th>
                <th className="text-center px-4 py-3 font-medium text-neutral-500">납부율</th>
                <th className="text-center px-5 py-3 font-medium text-neutral-500">세대</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-neutral-900">{inv.villaName}</td>
                  <td className="px-4 py-3 text-neutral-600">{inv.billingMonth}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-neutral-500">{TYPE_LABEL[inv.type] ?? inv.type}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-700">{formatKRW(inv.totalAmount)}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">{formatKRW(inv.paidAmount)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <span className={['text-xs font-semibold', inv.paidRate >= 80 ? 'text-green-600' : inv.paidRate >= 50 ? 'text-yellow-600' : 'text-red-500'].join(' ')}>
                        {inv.paidRate}%
                      </span>
                      <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={['h-full rounded-full transition-all', inv.paidRate >= 80 ? 'bg-green-500' : inv.paidRate >= 50 ? 'bg-yellow-500' : 'bg-red-400'].join(' ')}
                          style={{ width: `${inv.paidRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center text-neutral-500 text-xs">
                    {inv.paidCount} / {inv.totalCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {hasMore && (
          <div className="p-4 text-center border-t border-neutral-100">
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              className="text-sm font-medium text-primary-600 disabled:opacity-50"
            >
              {loading ? '로딩 중...' : '더 보기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

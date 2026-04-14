'use client';

import { useEffect, useState } from 'react';
import { boAuthHeaders } from '@/lib/backoffice-auth';

interface MrrData {
  mrr: number;
  arr: number;
  monthlyPrice: number;
  counts: { active: number; freeTrial: number; expired: number };
  monthlyTrend: { month: string; newSubs: number; revenue: number }[];
  expiringSoon: {
    id: string;
    name: string;
    subscriptionExpiry: string;
    admin: { name: string; email: string };
  }[];
}

function formatKRW(n: number) {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억원`;
  if (n >= 10_000) return `${Math.floor(n / 10_000).toLocaleString()}만원`;
  return n.toLocaleString() + '원';
}

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function MrrPage() {
  const [data, setData] = useState<MrrData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/backoffice/mrr', { headers: boAuthHeaders() })
      .then((r) => r.json())
      .then((d: MrrData) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="h-8 w-40 bg-neutral-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-neutral-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!data) return <p className="p-6 text-neutral-400 text-sm">데이터를 불러올 수 없습니다.</p>;

  const maxRevenue = Math.max(...data.monthlyTrend.map((t) => t.revenue), 1);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">MRR 모니터링</h1>
        <p className="text-sm text-neutral-500 mt-0.5">구독 현황 및 월 반복 수익</p>
      </div>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-5 col-span-2 lg:col-span-1">
          <p className="text-xs font-medium text-neutral-500 mb-1">MRR</p>
          <p className="text-3xl font-bold text-primary-600">{formatKRW(data.mrr)}</p>
          <p className="text-xs text-neutral-400 mt-1">월 반복 수익</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs font-medium text-neutral-500 mb-1">ARR</p>
          <p className="text-2xl font-bold text-neutral-900">{formatKRW(data.arr)}</p>
          <p className="text-xs text-neutral-400 mt-1">연 환산 수익</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs font-medium text-neutral-500 mb-1">구독 중</p>
          <p className="text-2xl font-bold text-green-600">{data.counts.active}개</p>
          <p className="text-xs text-neutral-400 mt-1">단가 {data.monthlyPrice.toLocaleString()}원</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs font-medium text-neutral-500 mb-1">만료</p>
          <p className="text-2xl font-bold text-red-500">{data.counts.expired}개</p>
          <p className="text-xs text-neutral-400 mt-1">복구 가능 매출</p>
        </div>
      </div>

      {/* 월별 수익 바 차트 */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-bold text-neutral-700 mb-5">최근 12개월 신규 구독 수익</h2>
        <div className="flex items-end gap-2 h-40">
          {data.monthlyTrend.map((t) => {
            const pct = (t.revenue / maxRevenue) * 100;
            const shortMonth = t.month.slice(5); // 'MM'
            return (
              <div key={t.month} className="flex-1 flex flex-col items-center gap-1 group relative">
                {t.revenue > 0 && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {formatKRW(t.revenue)}<br />{t.newSubs}건
                  </div>
                )}
                <div className="w-full flex items-end" style={{ height: '112px' }}>
                  <div
                    className="w-full rounded-t-sm bg-primary-500 transition-all"
                    style={{ height: `${Math.max(pct, t.revenue > 0 ? 3 : 0)}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-400">{shortMonth}월</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 만료 임박 빌라 */}
      {data.expiringSoon.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100">
            <h2 className="text-sm font-bold text-neutral-700">만료 임박 (D-30 이내)</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-neutral-500">빌라</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">동대표</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">이메일</th>
                <th className="text-right px-6 py-3 font-medium text-neutral-500">만료일</th>
              </tr>
            </thead>
            <tbody>
              {data.expiringSoon.map((v) => {
                const days = daysUntil(v.subscriptionExpiry);
                return (
                  <tr key={v.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-6 py-3 font-medium text-neutral-900">{v.name}</td>
                    <td className="px-4 py-3 text-neutral-600">{v.admin.name}</td>
                    <td className="px-4 py-3 text-neutral-400 text-xs">{v.admin.email}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={['text-xs font-semibold', days <= 7 ? 'text-red-500' : 'text-yellow-600'].join(' ')}>
                        D-{days}
                      </span>
                      <p className="text-xs text-neutral-400">{new Date(v.subscriptionExpiry).toLocaleDateString('ko-KR')}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { boAuthHeaders } from '@/lib/backoffice-auth';

interface KpiData {
  subscriptionDistribution: { FREE_TRIAL: number; ACTIVE: number; EXPIRED: number };
  monthlyTrend: { month: string; villas: number; users: number }[];
  totals: { villas: number; users: number; admins: number; residents: number };
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <p className="text-sm font-medium text-neutral-500 mb-1">{label}</p>
      <p className={['text-3xl font-bold', accent ?? 'text-neutral-900'].join(' ')}>{value}</p>
    </div>
  );
}

// 구독 상태 도넛 차트 (CSS conic-gradient)
function DonutChart({ data }: { data: { FREE_TRIAL: number; ACTIVE: number; EXPIRED: number } }) {
  const total = data.FREE_TRIAL + data.ACTIVE + data.EXPIRED;
  if (total === 0) return <p className="text-sm text-neutral-400 py-8 text-center">데이터 없음</p>;

  const segments = [
    { label: '무료체험', value: data.FREE_TRIAL, hex: '#3b82f6' },
    { label: '구독중',   value: data.ACTIVE,     hex: '#22c55e' },
    { label: '만료',     value: data.EXPIRED,    hex: '#f87171' },
  ];

  let pct = 0;
  const stops = segments
    .map((s) => {
      const share = (s.value / total) * 100;
      const stop = `${s.hex} ${pct}% ${pct + share}%`;
      pct += share;
      return stop;
    })
    .join(', ');

  return (
    <div className="flex items-center gap-6">
      <div
        className="w-28 h-28 rounded-full flex-shrink-0"
        style={{
          background: `conic-gradient(${stops})`,
          mask: 'radial-gradient(circle at center, transparent 44%, black 45%)',
          WebkitMask: 'radial-gradient(circle at center, transparent 44%, black 45%)',
        }}
      />
      <div className="flex flex-col gap-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.hex }} />
            <span className="text-neutral-600 w-16">{s.label}</span>
            <span className="font-semibold text-neutral-900">{s.value}</span>
            <span className="text-neutral-400 text-xs">({((s.value / total) * 100).toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 신규 가입 추이 막대 차트
function BarChart({ data }: { data: { month: string; villas: number; users: number }[] }) {
  const maxVillas = Math.max(...data.map((d) => d.villas), 1);
  const maxUsers  = Math.max(...data.map((d) => d.users), 1);

  const Bar = ({
    values, max, color,
  }: { values: { month: string; v: number }[]; max: number; color: string }) => (
    <div className="flex items-end gap-2 h-20">
      {values.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs font-semibold text-neutral-700">{d.v || ''}</span>
          <div
            className="w-full rounded-t-md transition-all"
            style={{
              height: `${(d.v / max) * 60}px`,
              minHeight: d.v > 0 ? '4px' : '0',
              background: color,
            }}
          />
        </div>
      ))}
    </div>
  );

  const labels = data.map((d) => (
    <div key={d.month} className="flex-1 text-center text-xs text-neutral-400">
      {d.month.slice(5)}월
    </div>
  ));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-neutral-500 mb-2">신규 빌라</p>
        <Bar values={data.map((d) => ({ month: d.month, v: d.villas }))} max={maxVillas} color="#3b82f6" />
        <div className="flex gap-2 mt-1">{labels}</div>
      </div>
      <div>
        <p className="text-xs font-semibold text-neutral-500 mb-2">신규 사용자</p>
        <Bar values={data.map((d) => ({ month: d.month, v: d.users }))} max={maxUsers} color="#f97316" />
        <div className="flex gap-2 mt-1">{labels}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/backoffice/kpi', { headers: boAuthHeaders() })
      .then((r) => r.json() as Promise<KpiData>)
      .then(setKpi)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const skeletonGrid = (n: number) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-24" />
      ))}
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">대시보드</h1>
        <p className="text-sm text-neutral-500 mt-0.5">플랫폼 현황 요약</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {skeletonGrid(4)}
          {skeletonGrid(3)}
        </div>
      ) : kpi ? (
        <>
          {/* 통계 카드 */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">빌라</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="전체 빌라"  value={kpi.totals.villas}                           />
                <StatCard label="무료 체험"  value={kpi.subscriptionDistribution.FREE_TRIAL} accent="text-blue-600"  />
                <StatCard label="구독 중"    value={kpi.subscriptionDistribution.ACTIVE}    accent="text-green-600" />
                <StatCard label="구독 만료"  value={kpi.subscriptionDistribution.EXPIRED}   accent="text-red-500"   />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">사용자</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard label="전체 사용자" value={kpi.totals.users}     />
                <StatCard label="동대표"      value={kpi.totals.admins}    accent="text-orange-600"  />
                <StatCard label="입주민"      value={kpi.totals.residents} accent="text-primary-600" />
              </div>
            </div>
          </div>

          {/* KPI 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-sm font-bold text-neutral-700 mb-5">구독 상태 분포</h2>
              <DonutChart data={kpi.subscriptionDistribution} />
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-sm font-bold text-neutral-700 mb-5">최근 6개월 신규 가입 추이</h2>
              <BarChart data={kpi.monthlyTrend} />
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-neutral-400">데이터를 불러올 수 없습니다.</p>
      )}
    </div>
  );
}

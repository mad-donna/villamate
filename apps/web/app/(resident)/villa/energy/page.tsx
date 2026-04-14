'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface EnergyUsage {
  id: string;
  year: number;
  month: number;
  electricKwh: number | null;
  electricFee: number | null;
  waterTon: number | null;
  waterFee: number | null;
  gasMj: number | null;
  gasFee: number | null;
}

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => CURRENT_YEAR - i);

function formatNum(n: number | null, unit: string) {
  if (n === null || n === undefined) return '-';
  return `${n.toLocaleString()}${unit}`;
}

type Tab = 'electric' | 'water' | 'gas';

export default function ResidentEnergyPage() {
  const router = useRouter();
  const [villaId, setVillaId] = useState('');
  const [year, setYear] = useState(CURRENT_YEAR);
  const [usages, setUsages] = useState<EnergyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('electric');

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { residentVilla?: { id?: string }; villa?: { id?: string } };
    setVillaId(user.residentVilla?.id ?? user.villa?.id ?? '');
  }, []);

  useEffect(() => {
    if (!villaId) return;
    setLoading(true);
    fetch(`/api/villas/${villaId}/energy?year=${year}`)
      .then((r) => r.json())
      .then((d: { usages?: EnergyUsage[] }) => setUsages(d.usages ?? []))
      .finally(() => setLoading(false));
  }, [villaId, year]);

  const maxKwh = Math.max(...usages.map((u) => u.electricKwh ?? 0), 1);
  const maxTon = Math.max(...usages.map((u) => u.waterTon ?? 0), 1);
  const maxMj = Math.max(...usages.map((u) => u.gasMj ?? 0), 1);

  function barData(m: number) {
    const u = usages.find((x) => x.month === m);
    if (tab === 'electric') {
      const val = u?.electricKwh ?? 0;
      return { val, pct: (val / maxKwh) * 100, label: formatNum(val, ' kWh'), fee: u?.electricFee ?? null };
    }
    if (tab === 'water') {
      const val = u?.waterTon ?? 0;
      return { val, pct: (val / maxTon) * 100, label: formatNum(val, ' 톤'), fee: u?.waterFee ?? null };
    }
    const val = u?.gasMj ?? 0;
    return { val, pct: (val / maxMj) * 100, label: formatNum(val, ' MJ'), fee: u?.gasFee ?? null };
  }

  const barColor = tab === 'electric' ? 'bg-yellow-400' : tab === 'water' ? 'bg-blue-400' : 'bg-orange-400';
  const tabLabel = tab === 'electric' ? '⚡ 전기' : tab === 'water' ? '💧 수도' : '🔥 가스';

  // 최근 월 요약 (데이터 있는 가장 최근 월)
  const latestUsage = [...usages].sort((a, b) => b.month - a.month)[0];

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label="뒤로가기"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">에너지 사용량</h1>
          <p className="text-xs text-neutral-500">월별 전기·수도·가스 현황</p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* 연도 선택 */}
        <div className="flex gap-2">
          {YEARS.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={[
                'flex-1 py-2 rounded-xl text-sm font-semibold transition-colors',
                year === y
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200',
              ].join(' ')}
            >
              {y}년
            </button>
          ))}
        </div>

        {/* 최근 월 요약 */}
        {latestUsage && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-xs text-neutral-500 mb-2">{latestUsage.month}월 현황</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-500">{formatNum(latestUsage.electricKwh, '')}</p>
                <p className="text-xs text-neutral-400">kWh</p>
                <p className="text-xs text-neutral-500 mt-0.5">{formatNum(latestUsage.electricFee, '원')}</p>
              </div>
              <div className="text-center border-x border-neutral-100">
                <p className="text-lg font-bold text-blue-500">{formatNum(latestUsage.waterTon, '')}</p>
                <p className="text-xs text-neutral-400">톤</p>
                <p className="text-xs text-neutral-500 mt-0.5">{formatNum(latestUsage.waterFee, '원')}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-orange-500">{formatNum(latestUsage.gasMj, '')}</p>
                <p className="text-xs text-neutral-400">MJ</p>
                <p className="text-xs text-neutral-500 mt-0.5">{formatNum(latestUsage.gasFee, '원')}</p>
              </div>
            </div>
          </div>
        )}

        {/* 탭 선택 */}
        <div className="flex gap-2">
          {(['electric', 'water', 'gas'] as Tab[]).map((t) => {
            const labels: Record<Tab, string> = { electric: '⚡ 전기', water: '💧 수도', gas: '🔥 가스' };
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={[
                  'flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
                  tab === t
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white text-neutral-500 border border-neutral-200',
                ].join(' ')}
              >
                {labels[t]}
              </button>
            );
          })}
        </div>

        {/* 바 차트 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-sm font-semibold text-neutral-800 mb-3">{tabLabel} 사용량</p>
          {loading ? (
            <div className="h-32 animate-pulse bg-neutral-100 rounded-xl" />
          ) : usages.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">등록된 데이터가 없습니다.</p>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {MONTHS.map((label, i) => {
                const m = i + 1;
                const { val, pct, label: valLabel, fee } = barData(m);
                const currentM = new Date().getMonth() + 1;
                const isCurrentMonth = m === currentM && year === CURRENT_YEAR;
                return (
                  <div key={m} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* 툴팁 */}
                    {val > 0 && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {valLabel}
                        {fee !== null && <><br />{fee.toLocaleString()}원</>}
                      </div>
                    )}
                    <div className="w-full flex items-end" style={{ height: '96px' }}>
                      <div
                        className={[
                          'w-full rounded-t-sm transition-all',
                          barColor,
                          isCurrentMonth ? 'opacity-100' : 'opacity-70',
                        ].join(' ')}
                        style={{ height: `${Math.max(pct, val > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    <span className={['text-[10px]', isCurrentMonth ? 'font-bold text-primary-600' : 'text-neutral-400'].join(' ')}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 연간 합계 */}
        {usages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm font-semibold text-neutral-800 mb-3">{year}년 합계</p>
            <div className="space-y-2">
              {usages.reduce((acc, u) => acc + (u.electricFee ?? 0), 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">⚡ 전기 요금</span>
                  <span className="font-semibold">{usages.reduce((acc, u) => acc + (u.electricFee ?? 0), 0).toLocaleString()}원</span>
                </div>
              )}
              {usages.reduce((acc, u) => acc + (u.waterFee ?? 0), 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">💧 수도 요금</span>
                  <span className="font-semibold">{usages.reduce((acc, u) => acc + (u.waterFee ?? 0), 0).toLocaleString()}원</span>
                </div>
              )}
              {usages.reduce((acc, u) => acc + (u.gasFee ?? 0), 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">🔥 가스 요금</span>
                  <span className="font-semibold">{usages.reduce((acc, u) => acc + (u.gasFee ?? 0), 0).toLocaleString()}원</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

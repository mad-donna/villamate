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

export default function AdminEnergyPage() {
  const router = useRouter();
  const [villaId, setVillaId] = useState('');
  const [year, setYear] = useState(CURRENT_YEAR);
  const [usages, setUsages] = useState<EnergyUsage[]>([]);
  const [loading, setLoading] = useState(true);

  // 폼 상태
  const [formMonth, setFormMonth] = useState(new Date().getMonth() + 1);
  const [form, setForm] = useState({
    electricKwh: '', electricFee: '',
    waterTon: '', waterFee: '',
    gasMj: '', gasFee: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villa?: { id?: string } };
    setVillaId(user.villa?.id ?? '');
  }, []);

  useEffect(() => {
    if (!villaId) return;
    fetchUsages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [villaId, year]);

  async function fetchUsages() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') ?? '';
      const res = await fetch(`/api/villas/${villaId}/energy?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json() as { usages?: EnergyUsage[] };
      setUsages(data.usages ?? []);
    } finally {
      setLoading(false);
    }
  }

  // 선택한 월의 기존 데이터를 폼에 채우기
  useEffect(() => {
    const existing = usages.find((u) => u.month === formMonth);
    if (existing) {
      setForm({
        electricKwh: existing.electricKwh !== null ? String(existing.electricKwh) : '',
        electricFee: existing.electricFee !== null ? String(existing.electricFee) : '',
        waterTon: existing.waterTon !== null ? String(existing.waterTon) : '',
        waterFee: existing.waterFee !== null ? String(existing.waterFee) : '',
        gasMj: existing.gasMj !== null ? String(existing.gasMj) : '',
        gasFee: existing.gasFee !== null ? String(existing.gasFee) : '',
      });
    } else {
      setForm({ electricKwh: '', electricFee: '', waterTon: '', waterFee: '', gasMj: '', gasFee: '' });
    }
  }, [formMonth, usages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!villaId || submitting) return;
    setSubmitting(true);
    setSubmitMsg('');
    try {
      const res = await fetch(`/api/villas/${villaId}/energy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
          month: formMonth,
          electricKwh: form.electricKwh ? parseFloat(form.electricKwh) : null,
          electricFee: form.electricFee ? parseInt(form.electricFee) : null,
          waterTon: form.waterTon ? parseFloat(form.waterTon) : null,
          waterFee: form.waterFee ? parseInt(form.waterFee) : null,
          gasMj: form.gasMj ? parseFloat(form.gasMj) : null,
          gasFee: form.gasFee ? parseInt(form.gasFee) : null,
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? '저장에 실패했습니다.');
      setSubmitMsg('저장되었습니다.');
      await fetchUsages();
    } catch (err) {
      setSubmitMsg(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  // 바 차트 — 12개월 전기 사용량
  const maxKwh = Math.max(...usages.map((u) => u.electricKwh ?? 0), 1);
  const maxTon = Math.max(...usages.map((u) => u.waterTon ?? 0), 1);

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
          <p className="text-xs text-neutral-500">전기·수도·가스 월별 현황</p>
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

        {/* 전기 사용량 바 차트 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-sm font-semibold text-neutral-800 mb-3">⚡ 전기 사용량 (kWh)</p>
          {loading ? (
            <div className="h-24 animate-pulse bg-neutral-100 rounded-xl" />
          ) : (
            <div className="flex items-end gap-1 h-24">
              {MONTHS.map((label, i) => {
                const m = i + 1;
                const u = usages.find((x) => x.month === m);
                const val = u?.electricKwh ?? 0;
                const pct = maxKwh > 0 ? (val / maxKwh) * 100 : 0;
                return (
                  <div key={m} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end" style={{ height: '72px' }}>
                      <div
                        className="w-full rounded-t-sm bg-yellow-400 transition-all"
                        style={{ height: `${Math.max(pct, val > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-neutral-400">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 수도 사용량 바 차트 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-sm font-semibold text-neutral-800 mb-3">💧 수도 사용량 (톤)</p>
          {loading ? (
            <div className="h-24 animate-pulse bg-neutral-100 rounded-xl" />
          ) : (
            <div className="flex items-end gap-1 h-24">
              {MONTHS.map((label, i) => {
                const m = i + 1;
                const u = usages.find((x) => x.month === m);
                const val = u?.waterTon ?? 0;
                const pct = maxTon > 0 ? (val / maxTon) * 100 : 0;
                return (
                  <div key={m} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end" style={{ height: '72px' }}>
                      <div
                        className="w-full rounded-t-sm bg-blue-400 transition-all"
                        style={{ height: `${Math.max(pct, val > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-neutral-400">{label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 월별 상세 테이블 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-sm font-semibold text-neutral-800 mb-3">월별 상세</p>
          {loading ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3].map((k) => <div key={k} className="h-8 bg-neutral-100 rounded" />)}
            </div>
          ) : usages.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-4">등록된 데이터가 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-neutral-500 border-b border-neutral-100">
                    <th className="text-left py-2 pr-2">월</th>
                    <th className="text-right py-2 pr-2">전기(kWh)</th>
                    <th className="text-right py-2 pr-2">전기요금</th>
                    <th className="text-right py-2 pr-2">수도(톤)</th>
                    <th className="text-right py-2">수도요금</th>
                  </tr>
                </thead>
                <tbody>
                  {usages.map((u) => (
                    <tr key={u.id} className="border-b border-neutral-50 last:border-0">
                      <td className="py-2 pr-2 font-medium">{u.month}월</td>
                      <td className="text-right py-2 pr-2">{formatNum(u.electricKwh, '')}</td>
                      <td className="text-right py-2 pr-2">{formatNum(u.electricFee, '원')}</td>
                      <td className="text-right py-2 pr-2">{formatNum(u.waterTon, '')}</td>
                      <td className="text-right py-2">{formatNum(u.waterFee, '원')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 데이터 입력 폼 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-sm font-semibold text-neutral-800 mb-3">데이터 입력</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">월 선택</label>
              <select
                value={formMonth}
                onChange={(e) => setFormMonth(parseInt(e.target.value))}
                className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary-400"
              >
                {MONTHS.map((label, i) => (
                  <option key={i + 1} value={i + 1}>{year}년 {label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">전기 사용량 (kWh)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.electricKwh}
                  onChange={(e) => setForm((f) => ({ ...f, electricKwh: e.target.value }))}
                  className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary-400"
                  placeholder="예: 520.5"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">전기 요금 (원)</label>
                <input
                  type="number"
                  min="0"
                  value={form.electricFee}
                  onChange={(e) => setForm((f) => ({ ...f, electricFee: e.target.value }))}
                  className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary-400"
                  placeholder="예: 85000"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">수도 사용량 (톤)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.waterTon}
                  onChange={(e) => setForm((f) => ({ ...f, waterTon: e.target.value }))}
                  className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary-400"
                  placeholder="예: 120.0"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">수도 요금 (원)</label>
                <input
                  type="number"
                  min="0"
                  value={form.waterFee}
                  onChange={(e) => setForm((f) => ({ ...f, waterFee: e.target.value }))}
                  className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary-400"
                  placeholder="예: 32000"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">가스 사용량 (MJ)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.gasMj}
                  onChange={(e) => setForm((f) => ({ ...f, gasMj: e.target.value }))}
                  className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary-400"
                  placeholder="예: 1200.0"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">가스 요금 (원)</label>
                <input
                  type="number"
                  min="0"
                  value={form.gasFee}
                  onChange={(e) => setForm((f) => ({ ...f, gasFee: e.target.value }))}
                  className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary-400"
                  placeholder="예: 48000"
                />
              </div>
            </div>

            {submitMsg && (
              <p className={['text-xs', submitMsg === '저장되었습니다.' ? 'text-primary-600' : 'text-red-500'].join(' ')}>
                {submitMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              {submitting ? '저장 중...' : '저장'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

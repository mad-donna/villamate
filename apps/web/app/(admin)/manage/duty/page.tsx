'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiFetch } from '@/lib/client-api';
import { Chip } from '@/components/ui/Chip';
import { useConfirm } from '@/hooks/useConfirm';

interface DutySchedule {
  id: string;
  units: string[];
  startDate: string;
  interval: 'WEEKLY' | 'BIWEEKLY';
  isActive: boolean;
}

interface DutyRule {
  id: string;
  name: string;
  intervalDays: number;
  lastInspectedAt: string | null;
  isActive: boolean;
}

function getCurrentDutyUnit(units: string[], startDate: string, interval: 'WEEKLY' | 'BIWEEKLY'): string | null {
  if (!units.length) return null;
  const intervalDays = interval === 'WEEKLY' ? 7 : 14;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = new Date(startDate); start.setHours(0, 0, 0, 0);
  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / 86400000);
  if (daysSinceStart < 0) return null;
  return units[Math.floor(daysSinceStart / intervalDays) % units.length];
}

function nextInspectionDate(lastInspectedAt: string | null, intervalDays: number): Date | null {
  if (!lastInspectedAt) return null;
  const d = new Date(lastInspectedAt);
  d.setDate(d.getDate() + intervalDays);
  return d;
}

function daysUntil(date: Date | null): number | null {
  if (!date) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.floor((date.getTime() - today.getTime()) / 86400000);
}

export default function DutyPage() {
  const [villaId, setVillaId] = useState('');
  const [tab, setTab] = useState<'schedule' | 'inspection'>('schedule');
  const [toast, setToast] = useState<string | null>(null);
  const { confirm: confirmDialog, dialog: confirmEl } = useConfirm();

  // 당번 스케줄
  const [schedules, setSchedules] = useState<DutySchedule[]>([]);
  const [schedLoading, setSchedLoading] = useState(true);
  const [showSchedForm, setShowSchedForm] = useState(false);
  const [schedUnits, setSchedUnits] = useState<string[]>([]);
  const [schedUnit, setSchedUnit] = useState('');
  const [schedStartDate, setSchedStartDate] = useState('');
  const [schedInterval, setSchedInterval] = useState<'WEEKLY' | 'BIWEEKLY'>('WEEKLY');
  const [schedSaving, setSchedSaving] = useState(false);
  const [deletingSchedId, setDeletingSchedId] = useState<string | null>(null);

  // 정기 점검
  const [rules, setRules] = useState<DutyRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleInterval, setRuleInterval] = useState('');
  const [ruleLastDate, setRuleLastDate] = useState('');
  const [ruleSaving, setRuleSaving] = useState(false);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [updatingRuleId, setUpdatingRuleId] = useState<string | null>(null);
  const [inspectDates, setInspectDates] = useState<Record<string, string>>({});

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villa?: { id?: string } };
    setVillaId(user.villa?.id ?? '');
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  const fetchSchedules = useCallback(async () => {
    if (!villaId) return;
    setSchedLoading(true);
    try {
      const res = await apiFetch(`/api/villas/${villaId}/duty-schedules`);
      if (res.ok) {
        const data = await res.json() as { schedules: DutySchedule[] };
        setSchedules(data.schedules);
      }
    } finally { setSchedLoading(false); }
  }, [villaId]);

  const fetchRules = useCallback(async () => {
    if (!villaId) return;
    setRulesLoading(true);
    try {
      const res = await apiFetch(`/api/villas/${villaId}/duty-rules`);
      if (res.ok) {
        const data = await res.json() as { rules: DutyRule[] };
        setRules(data.rules);
      }
    } finally { setRulesLoading(false); }
  }, [villaId]);

  useEffect(() => {
    if (villaId) { fetchSchedules(); fetchRules(); }
  }, [villaId, fetchSchedules, fetchRules]);

  async function handleSaveSchedule() {
    if (!villaId || schedUnits.length < 2 || !schedStartDate) return;
    setSchedSaving(true);
    try {
      const res = await apiFetch(`/api/villas/${villaId}/duty-schedules`, {
        method: 'POST',
        body: JSON.stringify({ units: schedUnits, startDate: schedStartDate, interval: schedInterval }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? '저장에 실패했습니다.');
      setShowSchedForm(false);
      setSchedUnits([]); setSchedUnit(''); setSchedStartDate('');
      showToast('당번 스케줄이 등록되었습니다.');
      await fetchSchedules();
    } catch (e) {
      showToast(e instanceof Error ? e.message : '저장에 실패했습니다.');
    } finally { setSchedSaving(false); }
  }

  async function handleDeleteSchedule(id: string) {
    const ok = await confirmDialog({ title: '당번 스케줄 삭제', description: '삭제하면 복구할 수 없습니다. 계속하시겠습니까?', variant: 'destructive', confirmLabel: '삭제' });
    if (!ok) return;
    setDeletingSchedId(id);
    try {
      const res = await apiFetch(`/api/villas/${villaId}/duty-schedules/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      showToast('삭제되었습니다.');
      await fetchSchedules();
    } catch { showToast('삭제에 실패했습니다.'); }
    finally { setDeletingSchedId(null); }
  }

  async function handleSaveRule() {
    if (!villaId || !ruleName || !ruleInterval) return;
    setRuleSaving(true);
    try {
      const res = await apiFetch(`/api/villas/${villaId}/duty-rules`, {
        method: 'POST',
        body: JSON.stringify({ name: ruleName, intervalDays: Number(ruleInterval), lastInspectedAt: ruleLastDate || undefined }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? '저장에 실패했습니다.');
      setShowRuleForm(false);
      setRuleName(''); setRuleInterval(''); setRuleLastDate('');
      showToast('점검 항목이 등록되었습니다.');
      await fetchRules();
    } catch (e) {
      showToast(e instanceof Error ? e.message : '저장에 실패했습니다.');
    } finally { setRuleSaving(false); }
  }

  async function handleDeleteRule(id: string) {
    setDeletingRuleId(id);
    try {
      const res = await apiFetch(`/api/villas/${villaId}/duty-rules/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      showToast('삭제되었습니다.');
      await fetchRules();
    } catch { showToast('삭제에 실패했습니다.'); }
    finally { setDeletingRuleId(null); }
  }

  async function handleMarkInspected(rule: DutyRule) {
    const dateStr = inspectDates[rule.id] || new Date().toISOString().slice(0, 10);
    setUpdatingRuleId(rule.id);
    try {
      const res = await apiFetch(`/api/villas/${villaId}/duty-rules/${rule.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ lastInspectedAt: dateStr }),
      });
      if (!res.ok) throw new Error('업데이트에 실패했습니다.');
      showToast('점검 완료로 기록했습니다.');
      setInspectDates((prev) => { const n = { ...prev }; delete n[rule.id]; return n; });
      await fetchRules();
    } catch { showToast('업데이트에 실패했습니다.'); }
    finally { setUpdatingRuleId(null); }
  }

  const activeSchedule = schedules.find((s) => s.isActive);

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      {confirmEl}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-neutral-900">당번 · 점검 관리</h1>
        <p className="text-sm text-neutral-500 mt-1">공동 당번 순환 및 정기 점검 리마인더를 설정하세요.</p>
      </div>

      {/* 탭 */}
      <div className="flex px-4 gap-2 mb-4">
        {(['schedule', 'inspection'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              tab === t ? 'bg-primary-500 text-white' : 'bg-white text-neutral-600 border border-neutral-200'
            }`}
          >
            {t === 'schedule' ? '공동 당번' : '정기 점검'}
          </button>
        ))}
      </div>

      {/* 공동 당번 탭 */}
      {tab === 'schedule' && (
        <div className="px-4 space-y-3">
          {activeSchedule && (
            <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100">
              <p className="text-xs text-primary-600 font-semibold uppercase tracking-wide mb-1">이번 주 당번</p>
              <p className="text-2xl font-bold text-primary-700">
                {getCurrentDutyUnit(activeSchedule.units, activeSchedule.startDate, activeSchedule.interval) ?? '—'}호
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {activeSchedule.interval === 'WEEKLY' ? '주간' : '격주'} 순환 · 시작일 {new Date(activeSchedule.startDate).toLocaleDateString('ko-KR')}
              </p>
            </div>
          )}

          {schedLoading ? (
            <div className="bg-white rounded-2xl p-4 animate-pulse h-20" />
          ) : schedules.length === 0 && !showSchedForm ? (
            <div className="bg-white rounded-2xl p-6 text-center text-neutral-400 text-sm">
              등록된 당번 스케줄이 없습니다.
            </div>
          ) : (
            schedules.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">
                      {s.interval === 'WEEKLY' ? '주간' : '격주'} 당번 순환
                      {s.isActive && <span className="ml-2 text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">활성</span>}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      시작일: {new Date(s.startDate).toLocaleDateString('ko-KR')}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {s.units.map((u, i) => (
                        <span key={i} className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">
                          {u}호
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={deletingSchedId === s.id}
                    onClick={() => handleDeleteSchedule(s.id)}
                    className="text-error-500 hover:bg-red-50 shrink-0"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))
          )}

          {showSchedForm ? (
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
              <p className="text-sm font-bold text-neutral-900">새 당번 스케줄 등록</p>
              <p className="text-xs text-neutral-400">새 스케줄 등록 시 기존 활성 스케줄은 비활성화됩니다.</p>

              {/* 세대 추가 */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="호수 입력 (예: 101)"
                    value={schedUnit}
                    onChange={(e) => setSchedUnit(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && schedUnit.trim()) {
                        const v = schedUnit.trim().replace(/호$/u, '');
                        if (!schedUnits.includes(v)) setSchedUnits((p) => [...p, v]);
                        setSchedUnit('');
                      }
                    }}
                  />
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    const v = schedUnit.trim().replace(/호$/u, '');
                    if (v && !schedUnits.includes(v)) setSchedUnits((p) => [...p, v]);
                    setSchedUnit('');
                  }}
                  className="shrink-0 self-start"
                >
                  추가
                </Button>
              </div>
              {schedUnits.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {schedUnits.map((u) => (
                    <Chip key={u} label={`${u}호`} onRemove={() => setSchedUnits((p) => p.filter((x) => x !== u))} />
                  ))}
                </div>
              )}

              <Input
                type="date"
                label="시작일"
                value={schedStartDate}
                onChange={(e) => setSchedStartDate(e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">순환 주기</label>
                <div className="flex gap-2">
                  {(['WEEKLY', 'BIWEEKLY'] as const).map((iv) => (
                    <button
                      key={iv}
                      onClick={() => setSchedInterval(iv)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                        schedInterval === iv ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-neutral-600 border-neutral-200'
                      }`}
                    >
                      {iv === 'WEEKLY' ? '주간' : '격주'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  loading={schedSaving}
                  disabled={schedUnits.length < 2 || !schedStartDate}
                  onClick={handleSaveSchedule}
                >
                  등록
                </Button>
                <Button variant="ghost" className="flex-1" onClick={() => { setShowSchedForm(false); setSchedUnits([]); }}>
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" className="w-full" onClick={() => setShowSchedForm(true)}>
              + 새 당번 스케줄 등록
            </Button>
          )}
        </div>
      )}

      {/* 정기 점검 탭 */}
      {tab === 'inspection' && (
        <div className="px-4 space-y-3">
          {rulesLoading ? (
            <div className="bg-white rounded-2xl p-4 animate-pulse h-20" />
          ) : rules.length === 0 && !showRuleForm ? (
            <div className="bg-white rounded-2xl p-6 text-center text-neutral-400 text-sm">
              등록된 점검 항목이 없습니다.
            </div>
          ) : (
            rules.map((rule) => {
              const next = nextInspectionDate(rule.lastInspectedAt, rule.intervalDays);
              const days = daysUntil(next);
              const urgent = days !== null && days <= 30;
              return (
                <div key={rule.id} className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-neutral-900">{rule.name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        주기: {rule.intervalDays >= 365 ? `${Math.round(rule.intervalDays / 365)}년` : `${rule.intervalDays}일`}
                      </p>
                    </div>
                    {days !== null && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        days <= 7 ? 'bg-red-100 text-red-600' : urgent ? 'bg-amber-100 text-amber-600' : 'bg-neutral-100 text-neutral-500'
                      }`}>
                        {days < 0 ? `D+${Math.abs(days)}` : `D-${days}`}
                      </span>
                    )}
                  </div>

                  {rule.lastInspectedAt && (
                    <p className="text-xs text-neutral-400">
                      마지막 점검: {new Date(rule.lastInspectedAt).toLocaleDateString('ko-KR')}
                      {next && <> · 다음 점검: {next.toLocaleDateString('ko-KR')}</>}
                    </p>
                  )}

                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={inspectDates[rule.id] ?? new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setInspectDates((p) => ({ ...p, [rule.id]: e.target.value }))}
                      className="flex-1 h-10 px-3 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Button
                      size="sm"
                      loading={updatingRuleId === rule.id}
                      onClick={() => handleMarkInspected(rule)}
                    >
                      점검 완료
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={deletingRuleId === rule.id}
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-error-500 hover:bg-red-50"
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              );
            })
          )}

          {showRuleForm ? (
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
              <p className="text-sm font-bold text-neutral-900">점검 항목 추가</p>
              <Input
                label="항목명"
                placeholder="소화기 점검"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
              />
              <Input
                type="number"
                label="점검 주기 (일)"
                placeholder="180 (6개월), 365 (1년)"
                value={ruleInterval}
                onChange={(e) => setRuleInterval(e.target.value)}
              />
              <Input
                type="date"
                label="마지막 점검일 (선택)"
                value={ruleLastDate}
                onChange={(e) => setRuleLastDate(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  loading={ruleSaving}
                  disabled={!ruleName || !ruleInterval}
                  onClick={handleSaveRule}
                >
                  추가
                </Button>
                <Button variant="ghost" className="flex-1" onClick={() => setShowRuleForm(false)}>
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" className="w-full" onClick={() => setShowRuleForm(true)}>
              + 점검 항목 추가
            </Button>
          )}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-fit px-5 py-3 bg-neutral-800 text-white text-sm font-medium rounded-2xl shadow-lg z-90">
          {toast}
        </div>
      )}
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiFetch } from '@/lib/client-api';

interface InvoiceSummary {
  id: string;
  type: 'FIXED' | 'VARIABLE';
  billingMonth: string;
  totalAmount: number;
  memo: string | null;
  createdAt: string;
  paidCount: number;
  totalCount: number;
}

interface AutoPublishSettings {
  autoPublishDay: number | null;
  fixedFee: number | null;
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

function AutoPublishCard({ villaId }: { villaId: string }) {
  const [settings, setSettings] = useState<AutoPublishSettings>({ autoPublishDay: null, fixedFee: null });
  const [day, setDay] = useState('');
  const [fee, setFee] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/api/villas/${villaId}`)
      .then((r) => r.json())
      .then((data: AutoPublishSettings & { error?: string }) => {
        if (data.error) return;
        setSettings(data);
        setDay(data.autoPublishDay != null ? String(data.autoPublishDay) : '');
        setFee(data.fixedFee != null ? String(data.fixedFee) : '');
      })
      .catch(() => {});
  }, [villaId]);

  const handleSave = async () => {
    const dayNum = day ? Number(day) : null;
    const feeNum = fee ? Number(fee) : null;
    if (dayNum !== null && (dayNum < 1 || dayNum > 31)) {
      setSettingsError('발행일은 1~31 사이로 입력하세요.');
      return;
    }
    if (feeNum !== null && feeNum < 0) {
      setSettingsError('관리비는 0 이상으로 입력하세요.');
      return;
    }
    setSaving(true);
    setSettingsError(null);
    try {
      const res = await apiFetch(`/api/villas/${villaId}`, {
        method: 'PATCH',
        body: JSON.stringify({ autoPublishDay: dayNum, fixedFee: feeNum }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setSettingsError((data as { error?: string } | null)?.error ?? '저장 중 오류가 발생했습니다.');
        return;
      }
      setSettings({ autoPublishDay: dayNum, fixedFee: feeNum });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSettingsError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const isConfigured = settings.autoPublishDay != null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-neutral-900 text-sm">자동 발행 설정</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isConfigured
              ? `매월 ${settings.autoPublishDay}일 자동 발행 · 세대당 ${settings.fixedFee != null ? formatAmount(settings.fixedFee) : '금액 미설정'}`
              : '매월 지정한 날짜에 고정 관리비 청구서를 자동 발행합니다.'}
          </p>
        </div>
        {isConfigured && (
          <span className="text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded-full font-medium">켜짐</span>
        )}
      </div>

      {settingsError && <p className="text-error-500 text-xs mb-2">{settingsError}</p>}

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs text-neutral-500 mb-1">발행일 (매월)</label>
          <input
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="예: 25"
            className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-neutral-500 mb-1">세대당 고정 관리비</label>
          <input
            type="number"
            min={0}
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder="예: 150000"
            className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        {day && fee ? (
          <p className="text-xs text-neutral-400">
            매월 {day}일 · 세대당 {Number(fee).toLocaleString('ko-KR')}원
          </p>
        ) : (
          <span />
        )}
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saved ? '저장됨 ✓' : saving ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  );
}

export default function InvoiceListPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [villaId, setVillaId] = useState<string | null>(null);

  useEffect(() => {
    const id = getVillaId();
    setVillaId(id);
    if (!id) {
      setError('빌라 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    fetch(`/api/villas/${id}/invoices`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setInvoices(data.invoices ?? []);
        }
      })
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="px-4 pt-6 pb-24">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-neutral-900">청구서 관리</h1>
        <Button
          size="sm"
          onClick={() => router.push('/manage/invoices/new')}
        >
          + 새 청구서
        </Button>
      </div>

      {/* 자동 발행 설정 카드 */}
      {villaId && <AutoPublishCard villaId={villaId} />}

      {/* 로딩 */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 에러 */}
      {!loading && error && (
        <p className="text-center text-error-500 py-8">{error}</p>
      )}

      {/* 빈 목록 */}
      {!loading && !error && invoices.length === 0 && (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-4xl mb-3">📄</p>
          <p>발행된 청구서가 없습니다.</p>
        </div>
      )}

      {/* 청구서 카드 목록 */}
      {!loading && !error && invoices.length > 0 && (
        <ul className="space-y-3">
          {invoices.map((inv) => {
            const pct =
              inv.totalCount > 0
                ? Math.round((inv.paidCount / inv.totalCount) * 100)
                : 0;
            const amountPerUnit =
              inv.totalCount > 0
                ? Math.floor(Number(inv.totalAmount) / inv.totalCount)
                : Number(inv.totalAmount);

            return (
              <li key={inv.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <button
                  type="button"
                  onClick={() => router.push(`/manage/invoices/${inv.id}`)}
                  className="w-full text-left p-5"
                >
                  {/* 상단 행 */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-neutral-900">
                      {formatMonth(inv.billingMonth)}
                    </span>
                    <Badge variant={inv.type === 'FIXED' ? 'info' : 'warning'}>
                      {inv.type === 'FIXED' ? '고정' : '변동'}
                    </Badge>
                  </div>

                  {/* 세대당 금액 */}
                  <p className="text-sm text-neutral-500 mb-3">
                    세대당 {formatAmount(amountPerUnit)}
                  </p>

                  {/* 납부율 프로그레스 바 */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-500 whitespace-nowrap">
                      {inv.paidCount}/{inv.totalCount} 납부완료
                    </span>
                  </div>

                  {/* 발행일 */}
                  <p className="text-xs text-neutral-400 mt-2">
                    {new Date(inv.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </button>

                {/* 복사 버튼 */}
                <div className="px-5 pb-3 border-t border-neutral-100 pt-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/manage/invoices/new?copy=${inv.id}`)}
                    className="text-xs text-neutral-400 hover:text-primary-600 flex items-center gap-1 min-h-[28px] transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    복사해서 발행
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

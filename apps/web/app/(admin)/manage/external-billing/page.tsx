'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AmountInput } from '@/components/ui/AmountInput';

interface ExternalBilling {
  id: string;
  targetName: string;
  phoneNumber: string;
  amount: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'PENDING_CONFIRMATION' | 'COMPLETED';
  createdAt: string;
}

const STATUS_LABEL: Record<ExternalBilling['status'], string> = {
  PENDING: '납부 대기',
  PENDING_CONFIRMATION: '납부 확인 중',
  COMPLETED: '완료',
};

const STATUS_BADGE_VARIANT: Record<
  ExternalBilling['status'],
  'warning' | 'info' | 'success'
> = {
  PENDING: 'warning',
  PENDING_CONFIRMATION: 'info',
  COMPLETED: 'success',
};

function formatAmount(n: number | string) {
  return Number(n).toLocaleString('ko-KR') + '원';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR');
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
  };
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

// 오늘 날짜를 YYYY-MM-DD 형태로 반환
function todayStr() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export default function ExternalBillingPage() {
  const [billings, setBillings] = useState<ExternalBilling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 신규 생성 모달
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    targetName: '',
    phoneNumber: '',
    amount: '',
    description: '',
    dueDate: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 완료 처리 로딩 상태 (billId → true)
  const [confirming, setConfirming] = useState<Record<string, boolean>>({});

  // 링크 복사 상태 (billId → true)
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const fetchBillings = useCallback(async () => {
    const villaId = getVillaId();
    if (!villaId) {
      setError('빌라 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/villas/${villaId}/external-billing`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? '데이터를 불러오지 못했습니다.');
      } else {
        setBillings(data.billings ?? []);
      }
    } catch {
      setError('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBillings();
  }, [fetchBillings]);

  function resetForm() {
    setForm({ targetName: '', phoneNumber: '', amount: '', description: '', dueDate: '' });
    setFormError(null);
  }

  async function handleCreate() {
    const villaId = getVillaId();
    if (!villaId) {
      setFormError('빌라 정보를 찾을 수 없습니다.');
      return;
    }

    if (!form.targetName.trim()) { setFormError('청구 대상 이름을 입력해주세요.'); return; }
    if (!form.phoneNumber.trim()) { setFormError('연락처를 입력해주세요.'); return; }
    if (!form.amount || Number(form.amount) <= 0) { setFormError('유효한 금액을 입력해주세요.'); return; }
    if (!form.description.trim()) { setFormError('청구 내용을 입력해주세요.'); return; }
    if (!form.dueDate) { setFormError('납부 기한을 입력해주세요.'); return; }

    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch(`/api/villas/${villaId}/external-billing`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          targetName: form.targetName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          amount: Number(form.amount),
          description: form.description.trim(),
          dueDate: form.dueDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? '생성 중 오류가 발생했습니다.');
        return;
      }

      setBillings((prev) => [data.billing, ...prev]);
      setShowModal(false);
      resetForm();
    } catch {
      setFormError('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirm(billId: string) {
    const villaId = getVillaId();
    if (!villaId) return;

    setConfirming((prev) => ({ ...prev, [billId]: true }));
    try {
      const res = await fetch(
        `/api/villas/${villaId}/external-billing/${billId}/confirm`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setBillings((prev) =>
          prev.map((b) => (b.id === billId ? { ...b, status: 'COMPLETED' } : b)),
        );
      } else {
        alert(data.error ?? '처리 중 오류가 발생했습니다.');
      }
    } catch {
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setConfirming((prev) => ({ ...prev, [billId]: false }));
    }
  }

  function handleCopyBilling(b: ExternalBilling) {
    setForm({
      targetName: b.targetName,
      phoneNumber: b.phoneNumber,
      amount: String(Math.round(Number(b.amount))),
      description: b.description,
      dueDate: '',
    });
    setFormError(null);
    setShowModal(true);
  }

  async function handleCopyLink(billId: string) {
    const payUrl = `${window.location.origin}/pay/${billId}`;
    try {
      await navigator.clipboard.writeText(payUrl);
      setCopied((prev) => ({ ...prev, [billId]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [billId]: false })), 2000);
    } catch {
      // clipboard API 실패 시 폴백
      const input = document.createElement('input');
      input.value = payUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied((prev) => ({ ...prev, [billId]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [billId]: false })), 2000);
    }
  }

  return (
    <main className="px-4 pt-6 pb-24">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-neutral-900">외부 청구 관리</h1>
        <Button size="sm" onClick={() => { resetForm(); setShowModal(true); }}>
          + 청구서 발송
        </Button>
      </div>

      <p className="text-sm text-neutral-500 mb-6">
        앱 미설치 사용자에게 웹 결제 링크를 발송합니다.
      </p>

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
      {!loading && !error && billings.length === 0 && (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-4xl mb-3">📤</p>
          <p>발송된 외부 청구서가 없습니다.</p>
          <p className="text-xs mt-1">청구서 발송 버튼으로 새 청구서를 만드세요.</p>
        </div>
      )}

      {/* 청구서 목록 */}
      {!loading && !error && billings.length > 0 && (
        <ul className="space-y-3">
          {billings.map((b) => (
            <li key={b.id} className="bg-white rounded-2xl shadow-sm p-5">
              {/* 상단 행 */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-neutral-900">{b.targetName}</span>
                <Badge variant={STATUS_BADGE_VARIANT[b.status]}>
                  {STATUS_LABEL[b.status]}
                </Badge>
              </div>

              {/* 금액 */}
              <p className="text-xl font-bold text-primary-600 mb-1">
                {formatAmount(b.amount)}
              </p>

              {/* 청구 내용 */}
              <p className="text-sm text-neutral-600 mb-1">{b.description}</p>

              {/* 연락처 · 납부 기한 */}
              <div className="flex gap-4 text-xs text-neutral-400 mb-4">
                <span>{b.phoneNumber}</span>
                <span>기한: {formatDate(b.dueDate)}</span>
              </div>

              {/* 액션 버튼 행 */}
              <div className="flex gap-2">
                {/* 웹 결제 링크 복사 */}
                <button
                  type="button"
                  onClick={() => handleCopyLink(b.id)}
                  className="flex-1 min-h-[44px] rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  {copied[b.id] ? '복사 완료!' : '링크 복사'}
                </button>

                {/* 완료 처리 버튼 — PENDING_CONFIRMATION 상태에서만 활성 */}
                {b.status !== 'COMPLETED' && (
                  <button
                    type="button"
                    onClick={() => handleConfirm(b.id)}
                    disabled={confirming[b.id]}
                    className="flex-1 min-h-[44px] rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:bg-neutral-200 disabled:text-neutral-400 transition-colors inline-flex items-center justify-center gap-1"
                  >
                    {confirming[b.id] ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        처리 중
                      </>
                    ) : (
                      '완료 처리'
                    )}
                  </button>
                )}
              </div>

              {/* 복사해서 발행 */}
              <div className="mt-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => handleCopyBilling(b)}
                  className="text-xs text-neutral-400 hover:text-primary-600 flex items-center gap-1 min-h-[28px] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  복사해서 발행
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 신규 청구서 생성 모달 */}
      {showModal && (
        <div
          className="fixed inset-0 z-[60] flex items-end bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); resetForm(); } }}
        >
          <div className="w-full max-w-lg mx-auto bg-white rounded-t-3xl px-5 pt-5 pb-safe-bottom">
            {/* 모달 핸들 */}
            <div className="w-10 h-1 rounded-full bg-neutral-200 mx-auto mb-5" />

            <h2 className="text-lg font-bold text-neutral-900 mb-5">외부 청구서 발송</h2>

            <div className="space-y-4">
              {/* 청구 대상 이름 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  청구 대상 이름 <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.targetName}
                  onChange={(e) => setForm((p) => ({ ...p, targetName: e.target.value }))}
                  placeholder="예: 홍길동"
                  className="w-full rounded-xl border border-neutral-200 px-4 h-11 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 연락처 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  연락처 <span className="text-error-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                  placeholder="010-0000-0000"
                  className="w-full rounded-xl border border-neutral-200 px-4 h-11 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 금액 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  금액 <span className="text-error-500">*</span>
                </label>
                <AmountInput
                  value={form.amount}
                  onChange={(raw) => setForm((p) => ({ ...p, amount: raw }))}
                />
              </div>

              {/* 청구 내용 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  청구 내용 <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="예: 2025년 12월 주차 관리비"
                  className="w-full rounded-xl border border-neutral-200 px-4 h-11 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 납부 기한 */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  납부 기한 <span className="text-error-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  min={todayStr()}
                  onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-200 px-4 h-11 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* 폼 에러 */}
            {formError && (
              <p className="mt-3 text-sm text-error-500 bg-red-50 rounded-xl px-4 py-2">
                {formError}
              </p>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-3 mt-6 mb-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => { setShowModal(false); resetForm(); }}
              >
                취소
              </Button>
              <Button className="flex-1" loading={submitting} onClick={handleCreate}>
                청구서 생성
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

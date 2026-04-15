'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

type InvoiceType = 'FIXED' | 'VARIABLE';

interface VariableItem {
  id: number;
  name: string;
  amount: string;
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

// 현재 연월 기준 YYYY-MM 반환
function currentYM(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function addMonths(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, '0');
  return `${ny}-${nm}`;
}

// 천단위 쉼표 입력 처리
function toNumberStr(raw: string): string {
  return raw.replace(/[^0-9]/g, '');
}

export default function NewInvoicePage() {
  const router = useRouter();

  const [invoiceType, setInvoiceType] = useState<InvoiceType>('FIXED');
  const [billingMonth, setBillingMonth] = useState(currentYM());
  const [memo, setMemo] = useState('');
  const [fixedAmount, setFixedAmount] = useState('');
  const [items, setItems] = useState<VariableItem[]>([
    { id: 1, name: '', amount: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // HEAD 세대 수 (표시용 — 실제 값은 서버에서 계산)
  const [headCount] = useState<number | null>(null);

  // 변동 항목 추가
  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), name: '', amount: '' },
    ]);
  }, []);

  // 변동 항목 삭제
  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 변동 항목 수정
  const updateItem = useCallback(
    (id: number, field: 'name' | 'amount', value: string) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, [field]: field === 'amount' ? toNumberStr(value) : value }
            : item,
        ),
      );
    },
    [],
  );

  // 변동 합계
  const variableTotal = items.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );

  // 발행하기
  async function handleSubmit() {
    const villaId = getVillaId();
    if (!villaId) {
      setError('빌라 정보를 찾을 수 없습니다.');
      return;
    }

    if (invoiceType === 'FIXED' && !fixedAmount) {
      setError('세대당 금액을 입력해주세요.');
      return;
    }
    if (invoiceType === 'VARIABLE') {
      const invalid = items.some((it) => !it.name.trim() || !it.amount);
      if (invalid) {
        setError('모든 항목의 이름과 금액을 입력해주세요.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        type: invoiceType,
        billingMonth,
        memo: memo.trim() || undefined,
      };

      if (invoiceType === 'FIXED') {
        body.amount = Number(fixedAmount);
      } else {
        body.items = items.map((it) => ({
          name: it.name.trim(),
          amount: Number(it.amount),
        }));
      }

      const res = await fetch(`/api/villas/${villaId}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? '발행 중 오류가 발생했습니다.');
        return;
      }

      router.push('/manage/invoices');
    } catch {
      setError('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-4 pt-6 pb-32">
      <h1 className="text-xl font-bold text-neutral-900 mb-6">새 청구서 발행</h1>

      {/* 청구 유형 탭 */}
      <section className="mb-6">
        <p className="text-sm font-medium text-neutral-700 mb-2">청구 유형</p>
        <div className="flex rounded-xl border border-neutral-200 overflow-hidden">
          {(['FIXED', 'VARIABLE'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setInvoiceType(t)}
              className={[
                'flex-1 py-2.5 min-h-[44px] text-sm font-semibold transition-colors',
                invoiceType === t
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-neutral-500 hover:bg-neutral-50',
              ].join(' ')}
            >
              {t === 'FIXED' ? '고정 관리비' : '변동 관리비'}
            </button>
          ))}
        </div>
      </section>

      {/* 청구 월 선택 */}
      <section className="mb-6">
        <p className="text-sm font-medium text-neutral-700 mb-2">청구 월</p>
        <div className="flex items-center justify-between bg-white rounded-xl border border-neutral-200 px-4 py-3">
          <button
            type="button"
            onClick={() => setBillingMonth((prev) => addMonths(prev, -1))}
            className="text-neutral-500 hover:text-neutral-900 text-xl font-bold min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            &#8249;
          </button>
          <span className="text-base font-semibold text-neutral-900">
            {formatMonth(billingMonth)}
          </span>
          <button
            type="button"
            onClick={() => setBillingMonth((prev) => addMonths(prev, 1))}
            className="text-neutral-500 hover:text-neutral-900 text-xl font-bold min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            &#8250;
          </button>
        </div>
      </section>

      {/* 메모 */}
      <section className="mb-6">
        <p className="text-sm font-medium text-neutral-700 mb-2">메모 (선택)</p>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="특이사항 또는 안내 메시지를 입력하세요."
          rows={3}
          className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </section>

      {/* 고정 관리비 입력 */}
      {invoiceType === 'FIXED' && (
        <section className="mb-6">
          <p className="text-sm font-medium text-neutral-700 mb-2">세대당 금액</p>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={fixedAmount ? Number(fixedAmount).toLocaleString('ko-KR') : ''}
              onChange={(e) => setFixedAmount(toNumberStr(e.target.value))}
              placeholder="0"
              className="w-full rounded-xl border border-neutral-200 px-4 h-11 pr-10 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
              원
            </span>
          </div>
          {fixedAmount && headCount !== null && (
            <p className="mt-2 text-xs text-neutral-500">
              총 {headCount}세대 × {formatAmount(Number(fixedAmount))} ={' '}
              {formatAmount(Number(fixedAmount) * headCount)}
            </p>
          )}
          {fixedAmount && headCount === null && (
            <p className="mt-2 text-xs text-neutral-500">
              세대당 {formatAmount(Number(fixedAmount))} × 전체 세대 수
            </p>
          )}
        </section>
      )}

      {/* 변동 관리비 항목 */}
      {invoiceType === 'VARIABLE' && (
        <section className="mb-6">
          <p className="text-sm font-medium text-neutral-700 mb-2">항목 목록</p>
          <ul className="space-y-2 mb-3">
            {items.map((item, idx) => (
              <li key={item.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  placeholder={`항목명 ${idx + 1}`}
                  className="flex-1 rounded-xl border border-neutral-200 px-3 h-11 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="relative w-36">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={item.amount ? Number(item.amount).toLocaleString('ko-KR') : ''}
                    onChange={(e) =>
                      updateItem(item.id, 'amount', e.target.value)
                    }
                    placeholder="0"
                    className="w-full rounded-xl border border-neutral-200 px-3 h-11 pr-8 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
                    원
                  </span>
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-neutral-400 hover:text-error-500 text-lg font-bold min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={addItem}
            className="w-full py-2.5 min-h-[44px] rounded-xl border border-dashed border-neutral-300 text-sm text-neutral-500 hover:border-primary-500 hover:text-primary-600 transition-colors"
          >
            + 항목 추가
          </button>

          {/* 미리보기 */}
          {variableTotal > 0 && (
            <div className="mt-3 bg-neutral-50 rounded-xl p-3">
              <p className="text-xs text-neutral-500">
                총 합계: {formatAmount(variableTotal)}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                ÷ 전체 세대 수 = 세대당 예상 금액
              </p>
            </div>
          )}
        </section>
      )}

      {/* 에러 메시지 */}
      {error && (
        <p className="text-sm text-error-500 bg-red-50 rounded-xl px-4 py-3 mb-4">
          {error}
        </p>
      )}

      {/* 하단 고정 발행 버튼 */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-neutral-100 px-4 py-4">
        <Button
          className="w-full"
          size="lg"
          loading={loading}
          onClick={handleSubmit}
        >
          발행하기
        </Button>
      </div>
    </main>
  );
}

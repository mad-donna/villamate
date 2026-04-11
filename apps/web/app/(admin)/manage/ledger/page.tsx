'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface LedgerTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  transactionDate: string;
  receiptUrl: string | null;
  createdAt: string;
}

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

function formatAmount(amount: number) {
  return amount.toLocaleString('ko-KR') + '원';
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
  });
}

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function AdminLedgerPage() {
  const [villaId, setVillaId] = useState('');

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 등록 폼 상태
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState(todayIso());
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 영수증 업로드 상태
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // 토스트
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villa?: { id?: string } };
    setVillaId(user.villa?.id ?? '');
  }, []);

  const fetchLedger = useCallback(async () => {
    if (!villaId) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token') ?? '';
      const res = await fetch(
        `/api/villas/${villaId}/ledger?year=${year}&month=${month}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json() as {
        transactions: LedgerTransaction[];
        summary: Summary;
      };
      setTransactions(data.transactions);
      setSummary(data.summary);
    } catch {
      setError('장부 내역을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [villaId, year, month]);

  useEffect(() => {
    if (villaId) fetchLedger();
  }, [villaId, fetchLedger]);

  function goPrev() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNext() {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  function resetForm() {
    setFormType('INCOME');
    setFormAmount('');
    setFormDescription('');
    setFormDate(todayIso());
    setFormError('');
    setReceiptUrl(null);
    setReceiptPreview(null);
    setUploadError('');
  }

  function handleOpenForm() {
    resetForm();
    setShowForm(true);
  }

  function handleCancelForm() {
    setShowForm(false);
    resetForm();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 로컬 미리보기
    const objectUrl = URL.createObjectURL(file);
    setReceiptPreview(objectUrl);
    setReceiptUrl(null);
    setUploadError('');
    setUploading(true);

    try {
      const token = localStorage.getItem('token') ?? '';
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('upload failed');
      const data = await res.json() as { url: string };
      setReceiptUrl(data.url);
    } catch {
      setUploadError('영수증 업로드에 실패했습니다. 다시 시도해주세요.');
      setReceiptPreview(null);
    } finally {
      setUploading(false);
      // input 초기화 (같은 파일 재선택 허용)
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleRemoveReceipt() {
    setReceiptUrl(null);
    setReceiptPreview(null);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit() {
    setFormError('');

    const parsedAmount = parseInt(formAmount.replace(/,/g, ''), 10);
    if (!formDescription.trim()) {
      setFormError('내용을 입력해주세요.');
      return;
    }
    if (!formAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('올바른 금액을 입력해주세요.');
      return;
    }
    if (!formDate) {
      setFormError('날짜를 선택해주세요.');
      return;
    }
    if (uploading) {
      setFormError('영수증 업로드가 진행 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') ?? '';
      const res = await fetch(`/api/villas/${villaId}/ledger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: formType,
          amount: parsedAmount,
          description: formDescription.trim(),
          transactionDate: formDate,
          receiptUrl: receiptUrl ?? undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? '등록에 실패했습니다.');
      }
      showToast('내역이 등록되었습니다.');
      setShowForm(false);
      resetForm();
      await fetchLedger();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : '등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900">공용 장부</h1>
        {!showForm && (
          <Button size="sm" onClick={handleOpenForm}>
            + 내역 등록
          </Button>
        )}
      </div>

      {/* 년/월 선택기 */}
      <div className="flex items-center justify-center gap-4 px-4 mb-4">
        <button
          onClick={goPrev}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
          aria-label="이전 달"
        >
          <svg
            className="w-5 h-5 text-neutral-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="text-base font-bold text-neutral-900 w-28 text-center">
          {year}년 {month}월
        </span>
        <button
          onClick={goNext}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
          aria-label="다음 달"
        >
          <svg
            className="w-5 h-5 text-neutral-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* 등록 폼 */}
      {showForm && (
        <div className="px-4 mb-4">
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
            <h2 className="text-base font-bold text-neutral-900">내역 등록</h2>

            {/* 항목 구분 토글 */}
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-2">항목 구분</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormType('INCOME')}
                  className={[
                    'flex-1 min-h-[44px] rounded-xl text-sm font-semibold border transition-colors',
                    formType === 'INCOME'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-500 border-neutral-300 hover:border-neutral-400',
                  ].join(' ')}
                >
                  수입
                </button>
                <button
                  onClick={() => setFormType('EXPENSE')}
                  className={[
                    'flex-1 min-h-[44px] rounded-xl text-sm font-semibold border transition-colors',
                    formType === 'EXPENSE'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-neutral-500 border-neutral-300 hover:border-neutral-400',
                  ].join(' ')}
                >
                  지출
                </button>
              </div>
            </div>

            {/* 금액 */}
            <Input
              label="금액"
              type="number"
              inputMode="numeric"
              placeholder="금액을 입력하세요"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              min={1}
            />

            {/* 내용 */}
            <Input
              label="내용"
              type="text"
              placeholder="내역을 입력하세요"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />

            {/* 날짜 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">날짜</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="h-12 rounded-xl px-4 text-sm border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>

            {/* 영수증 첨부 */}
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-2">영수증 첨부 (선택)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {receiptPreview ? (
                <div className="relative w-full">
                  {/* 미리보기 */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={receiptPreview}
                    alt="영수증 미리보기"
                    className="w-full max-h-48 object-cover rounded-xl border border-neutral-200"
                  />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
                      <svg
                        className="animate-spin w-6 h-6 text-primary-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    </div>
                  )}
                  {!uploading && (
                    <button
                      onClick={handleRemoveReceipt}
                      className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-neutral-800/70 text-white hover:bg-neutral-900 transition-colors"
                      aria-label="영수증 제거"
                    >
                      <svg
                        className="w-4 h-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full min-h-[80px] flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-neutral-300 hover:border-primary-400 hover:bg-primary-50 transition-colors text-neutral-400 hover:text-primary-600"
                >
                  <svg
                    className="w-6 h-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                  <span className="text-sm font-medium">이미지 선택</span>
                </button>
              )}
              {uploadError && (
                <p className="text-xs text-red-500 mt-1">{uploadError}</p>
              )}
              {receiptUrl && !uploading && (
                <p className="text-xs text-green-600 mt-1 font-medium">업로드 완료</p>
              )}
            </div>

            {/* 폼 에러 */}
            {formError && (
              <p className="text-sm text-red-500 font-medium">{formError}</p>
            )}

            {/* 버튼 */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={handleCancelForm}
                disabled={submitting}
              >
                취소
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                loading={submitting}
                disabled={uploading}
                onClick={handleSubmit}
              >
                {uploading ? '업로드 중...' : '등록'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Summary 카드 */}
      {loading ? (
        <div className="px-4 mb-4 grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-3 animate-pulse">
              <div className="h-3 w-10 bg-neutral-200 rounded mb-2" />
              <div className="h-5 w-16 bg-neutral-200 rounded" />
            </div>
          ))}
        </div>
      ) : summary ? (
        <div className="px-4 mb-4 grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl shadow-sm p-3">
            <p className="text-xs font-medium text-neutral-500 mb-1">수입</p>
            <p className="text-sm font-bold text-green-600 leading-tight">
              {formatAmount(summary.totalIncome)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-3">
            <p className="text-xs font-medium text-neutral-500 mb-1">지출</p>
            <p className="text-sm font-bold text-red-500 leading-tight">
              {formatAmount(summary.totalExpense)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-3">
            <p className="text-xs font-medium text-neutral-500 mb-1">잔액</p>
            <p className="text-sm font-bold text-primary-600 leading-tight">
              {formatAmount(summary.balance)}
            </p>
          </div>
        </div>
      ) : null}

      {/* 트랜잭션 목록 */}
      <div className="px-4 space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-10 bg-neutral-200 rounded" />
                  <div className="h-4 w-28 bg-neutral-200 rounded" />
                </div>
                <div className="h-4 w-16 bg-neutral-200 rounded" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-neutral-500">{error}</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={fetchLedger}>
              다시 시도
            </Button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg
              className="w-12 h-12 text-neutral-300 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
            <p className="text-neutral-500 font-medium">이 달의 내역이 없습니다.</p>
            <p className="text-sm text-neutral-400 mt-1">내역을 등록해보세요.</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="bg-white rounded-2xl shadow-sm px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-neutral-400 shrink-0 w-10">
                    {formatDay(tx.transactionDate)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {tx.description}
                    </p>
                    {tx.receiptUrl && (
                      <a
                        href={tx.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:underline"
                      >
                        영수증 보기
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-1">
                  <Badge variant={tx.type === 'INCOME' ? 'success' : 'error'}>
                    {tx.type === 'INCOME' ? '수입' : '지출'}
                  </Badge>
                  <span
                    className={
                      tx.type === 'INCOME'
                        ? 'text-sm font-bold text-green-600'
                        : 'text-sm font-bold text-red-500'
                    }
                  >
                    {tx.type === 'INCOME' ? '+' : '-'}
                    {formatAmount(tx.amount)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-20 left-0 right-0 mx-auto w-fit px-5 py-3 bg-neutral-800 text-white text-sm font-medium rounded-2xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </main>
  );
}

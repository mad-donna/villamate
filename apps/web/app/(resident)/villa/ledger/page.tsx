'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ImageViewer } from '@/components/ui/ImageViewer';

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

export default function LedgerPage() {
  const router = useRouter();
  const [villaId, setVillaId] = useState('');

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as {
      residentVilla?: { id?: string };
      villa?: { id?: string };
    };
    setVillaId(user.residentVilla?.id ?? user.villa?.id ?? '');
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

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => router.back()}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
          aria-label="뒤로가기"
        >
          <svg
            className="w-5 h-5 text-neutral-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-neutral-900">공용 장부</h1>
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
                      <button
                        onClick={() => setViewerSrc(tx.receiptUrl!)}
                        className="text-xs text-primary-600 hover:underline text-left"
                      >
                        영수증 보기
                      </button>
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

      {/* 이미지 뷰어 */}
      {viewerSrc && (
        <ImageViewer src={viewerSrc} alt="영수증" onClose={() => setViewerSrc(null)} />
      )}
    </main>
  );
}

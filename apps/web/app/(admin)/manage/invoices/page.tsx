'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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

export default function InvoiceListPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const villaId = getVillaId();
    if (!villaId) {
      setError('빌라 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    fetch(`/api/villas/${villaId}/invoices`, {
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
              <li key={inv.id}>
                <button
                  type="button"
                  onClick={() => router.push(`/manage/invoices/${inv.id}`)}
                  className="w-full text-left bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
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
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

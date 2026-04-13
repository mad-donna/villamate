'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { boAuthHeaders } from '@/lib/backoffice-auth';

type SubscriptionStatus = 'FREE_TRIAL' | 'ACTIVE' | 'EXPIRED';

interface Villa {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry: string | null;
  createdAt: string;
  admin: { id: string; name: string; email: string };
  residentCount: number;
}

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  FREE_TRIAL: '무료체험',
  ACTIVE: '구독중',
  EXPIRED: '만료',
};

const STATUS_BADGE: Record<SubscriptionStatus, 'info' | 'success' | 'error'> = {
  FREE_TRIAL: 'info',
  ACTIVE: 'success',
  EXPIRED: 'error',
};

function formatDate(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// 구독 상태 수정 모달
function EditSubscriptionModal({
  villa,
  onClose,
  onSaved,
}: {
  villa: Villa;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<SubscriptionStatus>(villa.subscriptionStatus);
  const [expiry, setExpiry] = useState(
    villa.subscriptionExpiry
      ? new Date(villa.subscriptionExpiry).toISOString().slice(0, 10)
      : '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/backoffice/villas/${villa.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...boAuthHeaders() },
        body: JSON.stringify({
          subscriptionStatus: status,
          subscriptionExpiry: expiry ? new Date(expiry).toISOString() : null,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? '저장에 실패했습니다.');
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  const STATUSES: SubscriptionStatus[] = ['FREE_TRIAL', 'ACTIVE', 'EXPIRED'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-neutral-900">구독 상태 변경</h2>
        <p className="text-sm text-neutral-500">{villa.name}</p>

        <div>
          <p className="text-sm font-medium text-neutral-700 mb-2">구독 상태</p>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={[
                  'flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors',
                  status === s
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-neutral-500 border-neutral-300 hover:border-neutral-400',
                ].join(' ')}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">만료일</label>
          <input
            type="date"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="h-11 rounded-xl px-3 text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" size="md" className="flex-1" loading={saving} onClick={handleSave}>
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VillasPage() {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'ALL'>('ALL');
  const [editTarget, setEditTarget] = useState<Villa | null>(null);

  const fetchVillas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      const res = await fetch(`/api/backoffice/villas?${params}`, {
        headers: boAuthHeaders(),
      });
      if (!res.ok) throw new Error('fetch failed');
      const data = (await res.json()) as Villa[];
      setVillas(data);
    } catch {
      setError('빌라 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [q, statusFilter]);

  useEffect(() => {
    fetchVillas();
  }, [fetchVillas]);

  const STATUSES: (SubscriptionStatus | 'ALL')[] = ['ALL', 'FREE_TRIAL', 'ACTIVE', 'EXPIRED'];
  const STATUS_ALL_LABEL: Record<string, string> = {
    ALL: '전체',
    ...STATUS_LABEL,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">빌라 목록</h1>
          <p className="text-sm text-neutral-500 mt-0.5">총 {villas.length}개</p>
        </div>
      </div>

      {/* 검색 + 필터 */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="빌라명 검색"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={[
                'px-3 py-2 rounded-xl text-sm font-semibold border transition-colors whitespace-nowrap',
                statusFilter === s
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-neutral-500 border-neutral-300 hover:border-neutral-400',
              ].join(' ')}
            >
              {STATUS_ALL_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-neutral-500">
          <p>{error}</p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={fetchVillas}>
            다시 시도
          </Button>
        </div>
      ) : villas.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p>검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100">
              <tr className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                <th className="px-4 py-3">빌라명</th>
                <th className="px-4 py-3">관리자</th>
                <th className="px-4 py-3">입주민</th>
                <th className="px-4 py-3">구독 상태</th>
                <th className="px-4 py-3">만료일</th>
                <th className="px-4 py-3">등록일</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {villas.map((villa) => (
                <tr key={villa.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{villa.name}</p>
                    <p className="text-xs text-neutral-400 truncate max-w-[200px]">{villa.address}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-neutral-800">{villa.admin.name}</p>
                    <p className="text-xs text-neutral-400">{villa.admin.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {villa.residentCount} / {villa.totalUnits}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE[villa.subscriptionStatus]}>
                      {STATUS_LABEL[villa.subscriptionStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {formatDate(villa.subscriptionExpiry)}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {formatDate(villa.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditTarget(villa)}
                      className="text-xs font-semibold text-primary-600 hover:text-primary-700 whitespace-nowrap"
                    >
                      상태 변경
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editTarget && (
        <EditSubscriptionModal
          villa={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={fetchVillas}
        />
      )}
    </div>
  );
}

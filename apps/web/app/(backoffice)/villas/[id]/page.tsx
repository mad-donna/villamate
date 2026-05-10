'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { boAuthHeaders } from '@/lib/backoffice-auth';

type SubscriptionStatus = 'FREE_TRIAL' | 'ACTIVE' | 'EXPIRED';

interface VillaDetail {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  inviteCode: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry: string | null;
  fixedFee: number | null;
  autoPublishDay: number | null;
  createdAt: string;
  admin: { id: string; name: string; email: string; phone: string | null };
}

interface Resident {
  id: string;
  roomNumber: string;
  residentType: 'HEAD' | 'MEMBER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  joinedAt: string | null;
  user: { id: string; name: string; email: string };
}

interface InvoiceSummary {
  id: string;
  billingMonth: string;
  type: string;
  totalAmount: number;
  paidAmount: number;
  paidCount: number;
  totalCount: number;
  paidRate: number;
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
const RESIDENT_STATUS_BADGE: Record<string, 'success' | 'warning' | 'error'> = {
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'error',
};
const RESIDENT_STATUS_LABEL: Record<string, string> = {
  APPROVED: '승인',
  PENDING: '대기',
  REJECTED: '거절',
};
const INVOICE_TYPE_LABEL: Record<string, string> = {
  FIXED: '고정 관리비',
  VARIABLE: '변동 관리비',
};

function formatDate(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
function formatKRW(n: number) {
  return n.toLocaleString('ko-KR') + '원';
}

function EditSubscriptionModal({
  villa,
  onClose,
  onSaved,
}: {
  villa: VillaDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<SubscriptionStatus>(villa.subscriptionStatus);
  const [expiry, setExpiry] = useState(
    villa.subscriptionExpiry ? new Date(villa.subscriptionExpiry).toISOString().slice(0, 10) : '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const STATUSES: SubscriptionStatus[] = ['FREE_TRIAL', 'ACTIVE', 'EXPIRED'];

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
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>취소</Button>
          <Button variant="primary" size="md" className="flex-1" loading={saving} onClick={handleSave}>저장</Button>
        </div>
      </div>
    </div>
  );
}

export default function VillaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [villa, setVilla] = useState<VillaDetail | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/backoffice/villas/${id}`, { headers: boAuthHeaders() });
      if (!res.ok) throw new Error('불러오기 실패');
      const data = await res.json() as { villa: VillaDetail; residents: Resident[]; invoices: InvoiceSummary[] };
      setVilla(data.villa);
      setResidents(data.residents);
      setInvoices(data.invoices);
    } catch {
      setError('빌라 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-neutral-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-neutral-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-neutral-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !villa) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center py-20">
        <p className="text-neutral-500">{error || '빌라를 찾을 수 없습니다.'}</p>
        <Button variant="ghost" size="sm" className="mt-3" onClick={() => router.back()}>돌아가기</Button>
      </div>
    );
  }

  const approvedResidents = residents.filter((r) => r.status === 'APPROVED');
  const pendingResidents = residents.filter((r) => r.status === 'PENDING');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
            aria-label="뒤로가기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-neutral-900">{villa.name}</h1>
              <Badge variant={STATUS_BADGE[villa.subscriptionStatus]}>
                {STATUS_LABEL[villa.subscriptionStatus]}
              </Badge>
            </div>
            <p className="text-sm text-neutral-400 mt-0.5">{villa.address}</p>
          </div>
        </div>
        <Button variant="secondary" size="md" onClick={() => setShowEdit(true)}>구독 상태 변경</Button>
      </div>

      {/* 기본 정보 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-medium text-neutral-400 mb-1">총 세대</p>
          <p className="text-xl font-bold text-neutral-900">{villa.totalUnits}세대</p>
          <p className="text-xs text-neutral-400 mt-0.5">입주민 {approvedResidents.length}명</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-medium text-neutral-400 mb-1">구독 만료일</p>
          <p className="text-base font-bold text-neutral-900">{formatDate(villa.subscriptionExpiry)}</p>
          {pendingResidents.length > 0 && (
            <p className="text-xs text-yellow-600 mt-0.5">승인 대기 {pendingResidents.length}명</p>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-medium text-neutral-400 mb-1">고정 관리비</p>
          <p className="text-base font-bold text-neutral-900">
            {villa.fixedFee != null ? formatKRW(villa.fixedFee) : '-'}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">
            {villa.autoPublishDay ? `매월 ${villa.autoPublishDay}일 자동 발행` : '자동 발행 없음'}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-medium text-neutral-400 mb-1">초대 코드</p>
          <p className="text-base font-bold text-neutral-900 font-mono">{villa.inviteCode}</p>
          <p className="text-xs text-neutral-400 mt-0.5">등록일 {formatDate(villa.createdAt)}</p>
        </div>
      </div>

      {/* 관리자 정보 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-sm font-bold text-neutral-700 mb-3">동대표</h2>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
            {villa.admin.name.slice(0, 1)}
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">{villa.admin.name}</p>
            <p className="text-xs text-neutral-400">{villa.admin.email}</p>
            {villa.admin.phone && <p className="text-xs text-neutral-400">{villa.admin.phone}</p>}
          </div>
        </div>
      </div>

      {/* 입주민 목록 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-700">입주민 목록</h2>
          <span className="text-xs text-neutral-400">총 {residents.length}명</span>
        </div>
        {residents.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-8">등록된 입주민이 없습니다.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-neutral-500">호수</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">이름</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">이메일</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">유형</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">입주일</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">상태</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((r) => (
                <tr key={r.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors last:border-0">
                  <td className="px-5 py-3 font-medium text-neutral-900">{r.roomNumber}호</td>
                  <td className="px-4 py-3 text-neutral-800">{r.user.name}</td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">{r.user.email}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">
                    {r.residentType === 'HEAD' ? '세대주' : '구성원'}
                  </td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">{formatDate(r.joinedAt)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={RESIDENT_STATUS_BADGE[r.status]}>
                      {RESIDENT_STATUS_LABEL[r.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 최근 청구서 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-700">최근 청구서 (최대 6개월)</h2>
        </div>
        {invoices.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-8">발행된 청구서가 없습니다.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-neutral-500">청구월</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">유형</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500">청구금액</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-500">수납금액</th>
                <th className="text-center px-5 py-3 font-medium text-neutral-500">납부율</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors last:border-0">
                  <td className="px-5 py-3 font-medium text-neutral-900">{inv.billingMonth}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">
                    {INVOICE_TYPE_LABEL[inv.type] ?? inv.type}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-700">{formatKRW(inv.totalAmount)}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">{formatKRW(inv.paidAmount)}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <span className={[
                        'text-xs font-semibold',
                        inv.paidRate >= 80 ? 'text-green-600' : inv.paidRate >= 50 ? 'text-yellow-600' : 'text-red-500',
                      ].join(' ')}>
                        {inv.paidRate}% ({inv.paidCount}/{inv.totalCount})
                      </span>
                      <div className="w-20 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={[
                            'h-full rounded-full',
                            inv.paidRate >= 80 ? 'bg-green-500' : inv.paidRate >= 50 ? 'bg-yellow-500' : 'bg-red-400',
                          ].join(' ')}
                          style={{ width: `${inv.paidRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showEdit && (
        <EditSubscriptionModal
          villa={villa}
          onClose={() => setShowEdit(false)}
          onSaved={fetchDetail}
        />
      )}
    </div>
  );
}

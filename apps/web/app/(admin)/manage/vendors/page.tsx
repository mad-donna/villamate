'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiFetch } from '@/lib/client-api';
import { useConfirm } from '@/hooks/useConfirm';

type VendorCategory = 'PLUMBING' | 'ELECTRICAL' | 'CLEANING' | 'CONSTRUCTION' | 'ELEVATOR' | 'ETC';

const CATEGORY_LABELS: Record<VendorCategory, string> = {
  PLUMBING: '배관/설비',
  ELECTRICAL: '전기',
  CLEANING: '청소',
  CONSTRUCTION: '건설/공사',
  ELEVATOR: '엘리베이터',
  ETC: '기타',
};

const CATEGORIES: VendorCategory[] = ['PLUMBING', 'ELECTRICAL', 'CLEANING', 'CONSTRUCTION', 'ELEVATOR', 'ETC'];

interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  phone: string;
  memo: string | null;
  createdAt: string;
}

interface VendorHistory {
  id: string;
  vendorId: string;
  workDate: string;
  description: string;
  cost: number | null;
  receiptUrl: string | null;
  createdAt: string;
}

interface VendorFormState {
  name: string;
  category: VendorCategory;
  phone: string;
  memo: string;
}

interface HistoryFormState {
  workDate: string;
  description: string;
  cost: string;
  receiptUrl: string;
}

const EMPTY_VENDOR_FORM: VendorFormState = { name: '', category: 'ETC', phone: '', memo: '' };
const EMPTY_HISTORY_FORM: HistoryFormState = { workDate: '', description: '', cost: '', receiptUrl: '' };

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatCost(cost: number) {
  return cost.toLocaleString('ko-KR') + '원';
}

export default function VendorsPage() {
  const { confirm: confirmDialog, dialog: confirmDialogEl } = useConfirm();

  // 업체 목록
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<VendorCategory | 'ALL'>('ALL');
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [vendorForm, setVendorForm] = useState<VendorFormState>(EMPTY_VENDOR_FORM);
  const [submittingVendor, setSubmittingVendor] = useState(false);

  // 이력 (수리 수첩)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [histories, setHistories] = useState<VendorHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [editHistory, setEditHistory] = useState<VendorHistory | null>(null);
  const [historyForm, setHistoryForm] = useState<HistoryFormState>(EMPTY_HISTORY_FORM);
  const [submittingHistory, setSubmittingHistory] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchVendors = (cat?: VendorCategory | 'ALL') => {
    const active = cat ?? filterCat;
    const url = active !== 'ALL' ? `/api/admin/vendors?category=${active}` : '/api/admin/vendors';
    apiFetch(url)
      .then((r) => r.json())
      .then((data: { vendors?: Vendor[] }) => setVendors(data.vendors ?? []))
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVendors(); }, []); // eslint-disable-line

  const changeFilter = (cat: VendorCategory | 'ALL') => {
    setFilterCat(cat);
    fetchVendors(cat);
  };

  // 업체 CRUD
  const openCreate = () => {
    setEditVendor(null);
    setVendorForm(EMPTY_VENDOR_FORM);
    setShowVendorForm(true);
    setError(null);
  };

  const openEditVendor = (v: Vendor) => {
    setEditVendor(v);
    setVendorForm({ name: v.name, category: v.category, phone: v.phone, memo: v.memo ?? '' });
    setShowVendorForm(true);
    setError(null);
  };

  const handleVendorSubmit = async () => {
    if (!vendorForm.name.trim()) { setError('업체명을 입력해주세요.'); return; }
    if (!vendorForm.phone.trim()) { setError('전화번호를 입력해주세요.'); return; }
    setSubmittingVendor(true);
    setError(null);
    try {
      const res = editVendor
        ? await apiFetch(`/api/admin/vendors/${editVendor.id}`, { method: 'PATCH', body: JSON.stringify(vendorForm) })
        : await apiFetch('/api/admin/vendors', { method: 'POST', body: JSON.stringify(vendorForm) });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError((data as { error?: string } | null)?.error ?? '저장 중 오류가 발생했습니다.');
        return;
      }
      setShowVendorForm(false);
      fetchVendors();
    } catch {
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSubmittingVendor(false);
    }
  };

  const handleDeleteVendor = async (id: string) => {
    if (!await confirmDialog({ title: '업체 삭제', description: '이 업체와 모든 작업 이력을 삭제하시겠습니까?', confirmLabel: '삭제', variant: 'destructive' })) return;
    const res = await apiFetch(`/api/admin/vendors/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError((data as { error?: string } | null)?.error ?? '삭제 중 오류가 발생했습니다.');
      return;
    }
    if (selectedVendor?.id === id) setSelectedVendor(null);
    fetchVendors();
  };

  // 이력 관련
  const openVendorHistory = (v: Vendor) => {
    setSelectedVendor(v);
    setHistories([]);
    setHistoryLoading(true);
    setError(null);
    apiFetch(`/api/admin/vendors/${v.id}/history`)
      .then((r) => r.json())
      .then((data: { histories?: VendorHistory[] }) => setHistories(data.histories ?? []))
      .catch(() => setError('이력을 불러오지 못했습니다.'))
      .finally(() => setHistoryLoading(false));
  };

  const openAddHistory = () => {
    setEditHistory(null);
    setHistoryForm({ ...EMPTY_HISTORY_FORM, workDate: new Date().toISOString().slice(0, 10) });
    setShowHistoryForm(true);
    setError(null);
  };

  const openEditHistory = (h: VendorHistory) => {
    setEditHistory(h);
    setHistoryForm({
      workDate: new Date(h.workDate).toISOString().slice(0, 10),
      description: h.description,
      cost: h.cost != null ? String(h.cost) : '',
      receiptUrl: h.receiptUrl ?? '',
    });
    setShowHistoryForm(true);
    setError(null);
  };

  const handleHistorySubmit = async () => {
    if (!historyForm.workDate) { setError('작업일을 입력해주세요.'); return; }
    if (!historyForm.description.trim()) { setError('작업 내용을 입력해주세요.'); return; }
    if (!selectedVendor) return;

    setSubmittingHistory(true);
    setError(null);
    const payload = {
      workDate: historyForm.workDate,
      description: historyForm.description.trim(),
      cost: historyForm.cost ? Number(historyForm.cost) : null,
      receiptUrl: historyForm.receiptUrl.trim() || null,
    };

    try {
      const res = editHistory
        ? await apiFetch(`/api/admin/vendors/${selectedVendor.id}/history/${editHistory.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await apiFetch(`/api/admin/vendors/${selectedVendor.id}/history`, { method: 'POST', body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError((data as { error?: string } | null)?.error ?? '저장 중 오류가 발생했습니다.');
        return;
      }
      setShowHistoryForm(false);
      openVendorHistory(selectedVendor);
    } catch {
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSubmittingHistory(false);
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    if (!selectedVendor) return;
    if (!await confirmDialog({ title: '이력 삭제', description: '이 작업 이력을 삭제하시겠습니까?', confirmLabel: '삭제', variant: 'destructive' })) return;
    const res = await apiFetch(`/api/admin/vendors/${selectedVendor.id}/history/${historyId}`, { method: 'DELETE' });
    if (res.ok) openVendorHistory(selectedVendor);
  };

  // 이력 패널이 열려있으면 이력 뷰 렌더링
  if (selectedVendor) {
    return (
      <main className="px-4 pt-6 pb-24 min-h-screen bg-neutral-50">
        {confirmDialogEl}

        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => setSelectedVendor(null)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-neutral-900 truncate">{selectedVendor.name}</h1>
            <p className="text-sm text-neutral-500">{CATEGORY_LABELS[selectedVendor.category]} · {selectedVendor.phone}</p>
          </div>
          <Button size="sm" onClick={openAddHistory}>+ 이력 추가</Button>
        </div>

        {error && !showHistoryForm && <p className="text-error-500 text-sm mb-4">{error}</p>}

        {historyLoading && (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="bg-white rounded-2xl shadow-sm p-4 h-20 animate-pulse" />)}
          </div>
        )}

        {!historyLoading && histories.length === 0 && (
          <div className="text-center py-16 text-neutral-400">
            <p className="text-4xl mb-3">🔧</p>
            <p>등록된 작업 이력이 없습니다.</p>
            <p className="text-xs mt-1">이력 추가 버튼으로 작업 내역을 기록하세요.</p>
          </div>
        )}

        {!historyLoading && histories.length > 0 && (
          <ul className="space-y-3">
            {histories.map((h) => (
              <li key={h.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-400 mb-1">{formatDate(h.workDate)}</p>
                    <p className="text-sm font-medium text-neutral-800 whitespace-pre-wrap">{h.description}</p>
                    {h.cost != null && (
                      <p className="text-sm text-primary-600 font-semibold mt-1">{formatCost(h.cost)}</p>
                    )}
                    {h.receiptUrl && (
                      <a
                        href={h.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary-500 mt-1 underline underline-offset-2"
                      >
                        영수증/사진 보기
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditHistory(h)}
                      className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-lg min-h-[44px]"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteHistory(h.id)}
                      className="text-xs text-error-600 bg-error-50 px-2 py-1 rounded-lg min-h-[44px]"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* 이력 등록/수정 바텀시트 */}
        {showHistoryForm && (
          <div className="fixed inset-0 z-60 flex flex-col justify-end bg-black/40">
            <div className="bg-white rounded-t-3xl p-6 space-y-4 max-w-lg mx-auto w-full">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-neutral-900">
                  {editHistory ? '이력 수정' : '작업 이력 추가'}
                </h2>
                <button type="button" onClick={() => setShowHistoryForm(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && <p className="text-error-500 text-sm" role="alert">{error}</p>}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">작업일 *</label>
                  <input
                    type="date"
                    value={historyForm.workDate}
                    onChange={(e) => setHistoryForm((p) => ({ ...p, workDate: e.target.value }))}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">작업 내용 *</label>
                  <textarea
                    value={historyForm.description}
                    onChange={(e) => setHistoryForm((p) => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                    placeholder="예: 3층 화장실 배관 누수 수리"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">비용 (원)</label>
                  <input
                    type="number"
                    value={historyForm.cost}
                    onChange={(e) => setHistoryForm((p) => ({ ...p, cost: e.target.value }))}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    placeholder="선택 입력"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">영수증/사진 URL</label>
                  <input
                    type="url"
                    value={historyForm.receiptUrl}
                    onChange={(e) => setHistoryForm((p) => ({ ...p, receiptUrl: e.target.value }))}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    placeholder="https://... (선택)"
                  />
                </div>
              </div>

              <Button className="w-full" onClick={handleHistorySubmit} disabled={submittingHistory}>
                {submittingHistory ? '저장 중...' : editHistory ? '수정하기' : '추가하기'}
              </Button>
            </div>
          </div>
        )}
      </main>
    );
  }

  // 업체 목록 뷰
  return (
    <main className="px-4 pt-6 pb-24 min-h-screen bg-neutral-50">
      {confirmDialogEl}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">업체 연락처</h1>
          <p className="text-sm text-neutral-500 mt-0.5">업체를 탭하면 작업 이력을 볼 수 있습니다.</p>
        </div>
        <Button size="sm" onClick={openCreate}>+ 등록</Button>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {(['ALL', ...CATEGORIES] as Array<VendorCategory | 'ALL'>).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => changeFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap min-h-[36px] transition-colors ${
              filterCat === cat
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {cat === 'ALL' ? '전체' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {error && !showVendorForm && <p className="text-error-500 text-sm mb-4">{error}</p>}

      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 h-20 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && vendors.length === 0 && (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-4xl mb-3">📞</p>
          <p>등록된 업체가 없습니다.</p>
        </div>
      )}

      {!loading && vendors.length > 0 && (
        <ul className="space-y-3">
          {vendors.map((v) => (
            <li
              key={v.id}
              className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer active:bg-neutral-50 transition-colors"
              onClick={() => openVendorHistory(v)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-neutral-900">{v.name}</p>
                    <Badge variant="info">{CATEGORY_LABELS[v.category]}</Badge>
                  </div>
                  <p className="text-sm text-primary-600 font-medium mt-1">{v.phone}</p>
                  {v.memo && <p className="text-xs text-neutral-400 mt-0.5">{v.memo}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => openEditVendor(v)}
                    className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-lg min-h-[44px]"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteVendor(v.id)}
                    className="text-xs text-error-600 bg-error-50 px-2 py-1 rounded-lg min-h-[44px]"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 업체 등록/수정 바텀시트 */}
      {showVendorForm && (
        <div className="fixed inset-0 z-60 flex flex-col justify-end bg-black/40">
          <div className="bg-white rounded-t-3xl p-6 space-y-4 max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">
                {editVendor ? '업체 수정' : '업체 등록'}
              </h2>
              <button type="button" onClick={() => setShowVendorForm(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && <p className="text-error-500 text-sm" role="alert">{error}</p>}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">업체명 *</label>
                <input
                  type="text"
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="예: 서울 배관 서비스"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">카테고리 *</label>
                <select
                  value={vendorForm.category}
                  onChange={(e) => setVendorForm((p) => ({ ...p, category: e.target.value as VendorCategory }))}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">전화번호 *</label>
                <input
                  type="tel"
                  value={vendorForm.phone}
                  onChange={(e) => setVendorForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">메모</label>
                <input
                  type="text"
                  value={vendorForm.memo}
                  onChange={(e) => setVendorForm((p) => ({ ...p, memo: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="담당자명, 영업시간 등 (선택)"
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleVendorSubmit} disabled={submittingVendor}>
              {submittingVendor ? '저장 중...' : editVendor ? '수정하기' : '등록하기'}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

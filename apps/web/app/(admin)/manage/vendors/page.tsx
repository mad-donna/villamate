'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiFetch } from '@/lib/client-api';

interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  phone: string;
  memo: string | null;
  createdAt: string;
}

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

interface FormState {
  name: string;
  category: VendorCategory;
  phone: string;
  memo: string;
}

const EMPTY_FORM: FormState = { name: '', category: 'ETC', phone: '', memo: '' };

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<VendorCategory | 'ALL'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Vendor | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
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

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (v: Vendor) => {
    setEditTarget(v);
    setForm({ name: v.name, category: v.category, phone: v.phone, memo: v.memo ?? '' });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('업체명을 입력해주세요.'); return; }
    if (!form.phone.trim()) { setError('전화번호를 입력해주세요.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = editTarget
        ? await apiFetch(`/api/admin/vendors/${editTarget.id}`, { method: 'PATCH', body: JSON.stringify(form) })
        : await apiFetch('/api/admin/vendors', { method: 'POST', body: JSON.stringify(form) });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError((data as { error?: string } | null)?.error ?? '저장 중 오류가 발생했습니다.');
        return;
      }
      setShowForm(false);
      fetchVendors();
    } catch {
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('이 업체를 삭제하시겠습니까?')) return;
    const res = await apiFetch(`/api/admin/vendors/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError((data as { error?: string } | null)?.error ?? '삭제 중 오류가 발생했습니다.');
      return;
    }
    fetchVendors();
  };

  return (
    <main className="px-4 pt-6 pb-24 min-h-screen bg-neutral-50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">업체 연락처</h1>
          <p className="text-sm text-neutral-500 mt-0.5">외부 업체 정보를 관리하세요.</p>
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

      {error && !showForm && <p className="text-error-500 text-sm mb-4">{error}</p>}

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
            <li key={v.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-neutral-900">{v.name}</p>
                    <Badge variant="info">{CATEGORY_LABELS[v.category]}</Badge>
                  </div>
                  <p className="text-sm text-primary-600 font-medium mt-1">{v.phone}</p>
                  {v.memo && <p className="text-xs text-neutral-400 mt-0.5">{v.memo}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(v)}
                    className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-lg min-h-[32px]"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(v.id)}
                    className="text-xs text-error-600 bg-error-50 px-2 py-1 rounded-lg min-h-[32px]"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 등록/수정 바텀시트 */}
      {showForm && (
        <div className="fixed inset-0 z-60 flex flex-col justify-end bg-black/40">
          <div className="bg-white rounded-t-3xl p-6 space-y-4 max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">
                {editTarget ? '업체 수정' : '업체 등록'}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400">
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
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="예: 서울 배관 서비스"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">카테고리 *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as VendorCategory }))}
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
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">메모</label>
                <input
                  type="text"
                  value={form.memo}
                  onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="담당자명, 영업시간 등 (선택)"
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
              {submitting ? '저장 중...' : editTarget ? '수정하기' : '등록하기'}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

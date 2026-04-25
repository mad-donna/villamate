'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiFetch } from '@/lib/client-api';
import { useConfirm } from '@/hooks/useConfirm';

interface Facility {
  id: string;
  name: string;
  description: string | null;
  maxPerDay: number;
  isActive: boolean;
  createdAt: string;
}

interface FormState {
  name: string;
  description: string;
  maxPerDay: number;
}

const EMPTY_FORM: FormState = { name: '', description: '', maxPerDay: 1 };

export default function FacilitiesPage() {
  const { confirm: confirmDialog, dialog: confirmDialogEl } = useConfirm();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Facility | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilities = () => {
    apiFetch('/api/admin/facilities')
      .then((r) => r.json())
      .then((data: { facilities?: Facility[] }) => setFacilities(data.facilities ?? []))
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFacilities(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (f: Facility) => {
    setEditTarget(f);
    setForm({ name: f.name, description: f.description ?? '', maxPerDay: f.maxPerDay });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('이름을 입력해주세요.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      if (editTarget) {
        await apiFetch(`/api/admin/facilities/${editTarget.id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch('/api/admin/facilities', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      setShowForm(false);
      fetchFacilities();
    } catch {
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (f: Facility) => {
    const res = await apiFetch(`/api/admin/facilities/${f.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !f.isActive }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError((data as { error?: string } | null)?.error ?? '상태 변경 중 오류가 발생했습니다.');
      return;
    }
    fetchFacilities();
  };

  const handleDelete = async (id: string) => {
    if (!await confirmDialog({ title: '시설 삭제', description: '이 시설을 삭제하시겠습니까?', confirmLabel: '삭제', variant: 'destructive' })) return;
    const res = await apiFetch(`/api/admin/facilities/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError((data as { error?: string } | null)?.error ?? '삭제 중 오류가 발생했습니다.');
      return;
    }
    fetchFacilities();
  };

  return (
    <main className="px-4 pt-6 pb-24 min-h-screen bg-neutral-50">
      {confirmDialogEl}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">공용시설 관리</h1>
          <p className="text-sm text-neutral-500 mt-0.5">시설을 등록하고 예약 현황을 확인하세요.</p>
        </div>
        <Button size="sm" onClick={openCreate}>+ 시설 등록</Button>
      </div>

      {error && !showForm && (
        <p className="text-error-500 text-sm mb-4">{error}</p>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 h-20 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && facilities.length === 0 && (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-4xl mb-3">🏢</p>
          <p>등록된 시설이 없습니다.</p>
        </div>
      )}

      {!loading && facilities.length > 0 && (
        <ul className="space-y-3">
          {facilities.map((f) => (
            <li key={f.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-neutral-900">{f.name}</p>
                    <Badge variant={f.isActive ? 'success' : 'neutral'}>
                      {f.isActive ? '운영중' : '중단'}
                    </Badge>
                  </div>
                  {f.description && (
                    <p className="text-sm text-neutral-500 mt-0.5">{f.description}</p>
                  )}
                  <p className="text-xs text-neutral-400 mt-1">세대당 하루 최대 {f.maxPerDay}회 예약</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(f)}
                    className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-lg min-h-[44px]"
                  >
                    {f.isActive ? '중단' : '재개'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(f)}
                    className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-lg min-h-[44px]"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(f.id)}
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

      {/* 등록/수정 바텀시트 */}
      {showForm && (
        <div className="fixed inset-0 z-60 flex flex-col justify-end bg-black/40">
          <div className="bg-white rounded-t-3xl p-6 space-y-4 max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">
                {editTarget ? '시설 수정' : '시설 등록'}
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
                <label className="block text-sm font-medium text-neutral-700 mb-1">시설 이름 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="예: 헬스장, 세탁실, 독서실"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">설명</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="시설 안내 설명 (선택)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">세대당 하루 최대 예약 횟수</label>
                <input
                  type="number"
                  min={1}
                  value={form.maxPerDay}
                  onChange={(e) => setForm((p) => ({ ...p, maxPerDay: Number(e.target.value) }))}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
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

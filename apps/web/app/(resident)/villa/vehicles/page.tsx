'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Vehicle {
  id: string;
  plateNumber: string;
  modelName: string | null;
  isVisitor: boolean;
  expectedDeparture: string | null;
  ownerName: string;
  roomNumber: string | null;
  createdAt: string;
  isOwner: boolean;
}

export default function VehiclesPage() {
  const router = useRouter();
  const [villaId, setVillaId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 번호판 검색 (F-71)
  const [searchPlate, setSearchPlate] = useState('');
  const [searchResults, setSearchResults] = useState<Vehicle[] | null>(null);
  const [searching, setSearching] = useState(false);

  // 차량 등록 폼 (F-70)
  const [showForm, setShowForm] = useState(false);
  const [formPlate, setFormPlate] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formIsVisitor, setFormIsVisitor] = useState(false);
  const [formDeparture, setFormDeparture] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as {
      role?: string;
      residentVilla?: { id?: string };
      villa?: { id?: string };
    };
    setVillaId(user.residentVilla?.id ?? user.villa?.id ?? '');
    setIsAdmin(user.role === 'ADMIN');
  }, []);

  const fetchVehicles = useCallback(async () => {
    if (!villaId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/villas/${villaId}/vehicles`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json() as { vehicles: Vehicle[] };
      setVehicles(data.vehicles);
    } catch {
      setError('차량 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  useEffect(() => {
    if (villaId) fetchVehicles();
  }, [villaId, fetchVehicles]);

  async function handleSearch() {
    if (!searchPlate.trim() || !villaId) return;
    setSearching(true);
    setSearchResults(null);
    try {
      const res = await fetch(`/api/villas/${villaId}/vehicles?plate=${encodeURIComponent(searchPlate.trim())}`);
      if (!res.ok) throw new Error('search failed');
      const data = await res.json() as { vehicles: Vehicle[] };
      setSearchResults(data.vehicles);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function handleRegister() {
    if (!villaId) return;
    setFormError('');
    if (!formPlate.trim()) { setFormError('번호판을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/villas/${villaId}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plateNumber: formPlate.trim(),
          modelName: formModel.trim() || undefined,
          isVisitor: formIsVisitor,
          expectedDeparture: formDeparture.trim() || undefined,
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? '등록에 실패했습니다.');
      setShowForm(false);
      setFormPlate(''); setFormModel(''); setFormIsVisitor(false); setFormDeparture('');
      await fetchVehicles();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : '등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(vehicleId: string) {
    if (!villaId) return;
    try {
      const res = await fetch(`/api/villas/${villaId}/vehicles/${vehicleId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('삭제에 실패했습니다.');
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      if (searchResults) setSearchResults((prev) => prev?.filter((v) => v.id !== vehicleId) ?? null);
    } catch {
      // 삭제 실패 시 무시하고 목록 재조회
      await fetchVehicles();
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label="뒤로가기"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-neutral-900 flex-1">주차 관리</h1>
        <Button size="sm" onClick={() => setShowForm(true)}>+ 차량 등록</Button>
      </div>

      {/* 번호판 검색 (F-71) */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-semibold text-neutral-500 mb-2">번호판 검색</p>
          <div className="flex gap-2">
            <Input
              placeholder="번호판 입력 (예: 12가3456)"
              value={searchPlate}
              onChange={(e) => {
                setSearchPlate(e.target.value);
                if (!e.target.value.trim()) setSearchResults(null);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              className="flex-1"
            />
            <Button size="sm" onClick={handleSearch} disabled={searching || !searchPlate.trim()}>
              {searching ? '검색 중' : '검색'}
            </Button>
          </div>
          {searchResults !== null && (
            <div className="mt-3">
              {searchResults.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-3">검색 결과가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((v) => (
                    <VehicleRow key={v.id} vehicle={v} isAdmin={isAdmin} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 차량 등록 폼 */}
      {showForm && (
        <div className="px-4 mb-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm font-bold text-neutral-900 mb-3">새 차량 등록</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">번호판 *</label>
                <Input
                  placeholder="예: 12가3456"
                  value={formPlate}
                  onChange={(e) => setFormPlate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">차종</label>
                <Input
                  placeholder="예: 현대 아반떼"
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={formIsVisitor}
                  onClick={() => setFormIsVisitor((v) => !v)}
                  className={`w-10 h-6 rounded-full transition-colors ${formIsVisitor ? 'bg-primary-600' : 'bg-neutral-300'}`}
                >
                  <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${formIsVisitor ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm text-neutral-700">방문 차량</span>
              </div>
              {formIsVisitor && (
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">출차 예정</label>
                  <Input
                    placeholder="예: 2026-04-12 18:00"
                    value={formDeparture}
                    onChange={(e) => setFormDeparture(e.target.value)}
                  />
                </div>
              )}
              {formError && <p className="text-xs text-error-500">{formError}</p>}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => { setShowForm(false); setFormError(''); }}
                  disabled={submitting}
                >
                  취소
                </Button>
                <Button className="flex-1" onClick={handleRegister} disabled={submitting}>
                  {submitting ? '등록 중...' : '등록'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 차량 목록 (F-70) */}
      <div className="px-4">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-1">
          {isAdmin ? '전체 등록 차량' : '내 등록 차량'}
        </p>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
                <div className="h-4 w-1/3 bg-neutral-200 rounded mb-2" />
                <div className="h-3 w-2/3 bg-neutral-100 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-neutral-500">{error}</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={fetchVehicles}>
              다시 시도
            </Button>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="w-12 h-12 text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <p className="text-neutral-500 font-medium">등록된 차량이 없습니다.</p>
            <p className="text-sm text-neutral-400 mt-1">차량을 등록해 주세요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vehicles.map((v) => (
              <VehicleRow key={v.id} vehicle={v} isAdmin={isAdmin} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function VehicleRow({
  vehicle: v,
  isAdmin,
  onDelete,
}: {
  vehicle: Vehicle;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}) {
  const canDelete = isAdmin || v.isOwner;
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-bold text-neutral-900">{v.plateNumber}</span>
          {v.isVisitor && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning-50 text-warning-700">
              방문
            </span>
          )}
        </div>
        {v.modelName && (
          <p className="text-sm text-neutral-500 mt-0.5">{v.modelName}</p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-neutral-400">
          {(isAdmin || v.roomNumber) && v.roomNumber && (
            <span>{v.roomNumber}호 · {v.ownerName}</span>
          )}
          {v.isVisitor && v.expectedDeparture && (
            <span>출차 예정: {v.expectedDeparture}</span>
          )}
        </div>
      </div>
      {canDelete && (
        <button
          type="button"
          onClick={() => onDelete(v.id)}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400 hover:text-error-500 transition-colors rounded-lg"
          aria-label="차량 삭제"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      )}
    </div>
  );
}

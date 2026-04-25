'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { apiFetch } from '@/lib/client-api';

interface Vehicle {
  id: string;
  plateNumber: string;
  modelName: string | null;
  isVisitor: boolean;
  visitorName: string | null;
  expectedDeparture: string | null;
  ownerName: string;
  roomNumber: string | null;
  createdAt: string;
  isOwner: boolean;
}

export default function AdminVehiclesPage() {
  const router = useRouter();
  const [villaId, setVillaId] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 번호판 검색
  const [searchPlate, setSearchPlate] = useState('');
  const [searchResults, setSearchResults] = useState<Vehicle[] | null>(null);
  const [searching, setSearching] = useState(false);

  // QR 코드 모달
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 차량 등록 폼
  const [showForm, setShowForm] = useState(false);
  const [formPlate, setFormPlate] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formIsVisitor, setFormIsVisitor] = useState(false);
  const [formDeparture, setFormDeparture] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villa?: { id?: string } };
    setVillaId(user.villa?.id ?? '');
  }, []);

  const fetchVehicles = useCallback(async () => {
    if (!villaId) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/api/villas/${villaId}/vehicles`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json() as { vehicles?: Vehicle[] };
      setVehicles(data.vehicles ?? []);
    } catch {
      setError('차량 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  async function handleSearch() {
    if (!searchPlate.trim() || searching) return;
    setSearching(true);
    try {
      const res = await apiFetch(`/api/villas/${villaId}/vehicles?plate=${encodeURIComponent(searchPlate)}`);
      const data = await res.json() as { vehicles?: Vehicle[] };
      setSearchResults(data.vehicles ?? []);
    } finally {
      setSearching(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('차량을 삭제하시겠습니까?')) return;
    await apiFetch(`/api/villas/${villaId}/vehicles/${id}`, {
      method: 'DELETE',
    });
    fetchVehicles();
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!formPlate.trim() || submitting) return;
    setSubmitting(true);
    setFormError('');
    try {
      const res = await apiFetch(`/api/villas/${villaId}/vehicles`, {
        method: 'POST',
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
      fetchVehicles();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGenerateQr() {
    if (!villaId || qrLoading) return;
    setQrLoading(true);
    setShowQr(true);
    try {
      const res = await apiFetch(`/api/villas/${villaId}/vehicles/qr-token`);
      const data = await res.json() as { token?: string; error?: string };
      if (!res.ok || !data.token) throw new Error(data.error ?? 'QR 생성 실패');

      const url = `${window.location.origin}/qr-vehicle?v=${villaId}&t=${encodeURIComponent(data.token)}`;
      const dataUrl = await QRCode.toDataURL(url, { width: 280, margin: 2, color: { dark: '#1a1a1a', light: '#ffffff' } });
      setQrDataUrl(dataUrl);
    } catch {
      setShowQr(false);
      alert('QR 코드 생성에 실패했습니다.');
    } finally {
      setQrLoading(false);
    }
  }

  const displayVehicles = searchResults ?? vehicles;
  const visitors = displayVehicles.filter((v) => v.isVisitor);
  const residents = displayVehicles.filter((v) => !v.isVisitor);

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
            aria-label="뒤로가기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-neutral-900">주차 관리</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGenerateQr}
            className="flex items-center gap-1.5 text-sm font-medium text-primary-600 bg-primary-50 px-3 py-2 rounded-xl active:bg-primary-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5a.5.5 0 11-1 0 .5.5 0 011 0zM4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6z" />
            </svg>
            QR 방문 등록
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-white bg-primary-600 px-3 py-2 rounded-xl active:bg-primary-700 transition-colors"
          >
            + 등록
          </button>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* 번호판 검색 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchPlate}
              onChange={(e) => {
                setSearchPlate(e.target.value);
                if (!e.target.value.trim()) setSearchResults(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="번호판으로 검색 (예: 3456)"
              className="flex-1 text-sm border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:border-primary-400 transition-colors"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="text-sm font-semibold text-primary-600 px-3 disabled:opacity-50 min-h-[40px]"
            >
              {searching ? '검색 중' : '검색'}
            </button>
          </div>
          {searchResults !== null && (
            <p className="text-xs text-neutral-400 mt-2">
              검색 결과 {searchResults.length}건
              <button type="button" onClick={() => { setSearchResults(null); setSearchPlate(''); }} className="ml-2 text-primary-500">초기화</button>
            </p>
          )}
        </div>

        {/* 방문 차량 */}
        {visitors.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm font-semibold text-neutral-700 mb-3">🚗 방문 차량 ({visitors.length})</p>
            <div className="space-y-2">
              {visitors.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{v.plateNumber}</p>
                    <p className="text-xs text-neutral-400">
                      {v.visitorName ? `방문: ${v.visitorName}` : '방문 차량'}
                      {v.modelName ? ` · ${v.modelName}` : ''}
                      {v.expectedDeparture ? ` · 출차: ${v.expectedDeparture}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(v.id)}
                    className="text-xs text-neutral-400 hover:text-error-500 transition-colors p-1"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 입주민 차량 */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-neutral-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : error ? (
          <p className="text-sm text-neutral-400 text-center py-8">{error}</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm font-semibold text-neutral-700 mb-3">🏠 입주민 차량 ({residents.length})</p>
            {residents.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-4">등록된 차량이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {residents.map((v) => (
                  <div key={v.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-neutral-900">{v.plateNumber}</p>
                      <p className="text-xs text-neutral-400">
                        {v.roomNumber ? `${v.roomNumber}호` : ''} {v.ownerName}
                        {v.modelName ? ` · ${v.modelName}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(v.id)}
                      className="text-xs text-neutral-400 hover:text-error-500 transition-colors p-1"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR 코드 모달 */}
      {showQr && (
        <div className="fixed inset-0 z-80 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <h2 className="text-lg font-bold text-neutral-900 mb-1">방문 차량 QR 코드</h2>
            <p className="text-xs text-neutral-500 mb-4">방문자가 스캔하면 차량을 등록할 수 있습니다. (24시간 유효)</p>
            {qrLoading ? (
              <div className="w-[280px] h-[280px] mx-auto bg-neutral-100 rounded-xl animate-pulse" />
            ) : qrDataUrl ? (
              <img src={qrDataUrl} alt="QR 코드" className="w-[280px] h-[280px] mx-auto rounded-xl" />
            ) : null}
            <canvas ref={canvasRef} className="hidden" />
            <button
              type="button"
              onClick={() => setShowQr(false)}
              className="mt-4 w-full py-3 rounded-xl bg-neutral-100 text-sm font-semibold text-neutral-700"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 차량 등록 바텀시트 */}
      {showForm && (
        <div className="fixed inset-0 z-70 bg-black/40 flex items-end" onClick={() => setShowForm(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleRegister}
            className="bg-white rounded-t-3xl w-full p-5 space-y-4"
          >
            <h2 className="text-lg font-bold text-neutral-900">차량 등록</h2>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">번호판 *</label>
              <input
                type="text"
                value={formPlate}
                onChange={(e) => setFormPlate(e.target.value)}
                placeholder="예: 12가3456"
                required
                className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">차종 (선택)</label>
              <input
                type="text"
                value={formModel}
                onChange={(e) => setFormModel(e.target.value)}
                placeholder="예: 소나타"
                className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isVisitor"
                checked={formIsVisitor}
                onChange={(e) => setFormIsVisitor(e.target.checked)}
                className="w-4 h-4 rounded accent-primary-600"
              />
              <label htmlFor="isVisitor" className="text-sm text-neutral-700">방문 차량</label>
            </div>
            {formIsVisitor && (
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">출차 예정</label>
                <input
                  type="text"
                  value={formDeparture}
                  onChange={(e) => setFormDeparture(e.target.value)}
                  placeholder="예: 오후 6시"
                  className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
            )}
            {formError && <p role="alert" className="text-xs text-error-600">{formError}</p>}
            <div className="flex gap-2 pb-safe">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-neutral-100 text-sm font-semibold text-neutral-700">취소</button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-primary-600 text-sm font-semibold text-white disabled:opacity-50">
                {submitting ? '등록 중...' : '등록'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

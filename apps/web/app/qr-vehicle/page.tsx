'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function QrVehicleForm() {
  const searchParams = useSearchParams();
  const villaId = searchParams.get('v') ?? '';
  const token = searchParams.get('t') ?? '';

  const [villaName, setVillaName] = useState('');
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [expectedDeparture, setExpectedDeparture] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!villaId || !token) {
      setTokenValid(false);
      return;
    }
    // 빌라 이름 미리 가져오기 (토큰 검증 겸)
    fetch(`/api/villas/${villaId}/vehicles/visitor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, plateNumber: '00테0000' }), // dry-run: plate 형식 오류로 400 응답 유도
    })
      .then((r) => r.json())
      .then((d: { error?: string; villaName?: string }) => {
        if (d.error === '유효하지 않거나 만료된 QR 코드입니다.' || d.error === '유효하지 않은 QR 코드입니다.') {
          setTokenValid(false);
        } else {
          setTokenValid(true);
          if (d.villaName) setVillaName(d.villaName);
        }
      })
      .catch(() => setTokenValid(false));
  }, [villaId, token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!plate.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/villas/${villaId}/vehicles/visitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          plateNumber: plate.trim(),
          modelName: model.trim() || undefined,
          visitorName: visitorName.trim() || undefined,
          expectedDeparture: expectedDeparture || undefined,
        }),
      });
      const data = await res.json() as { error?: string; villaName?: string };
      if (!res.ok) throw new Error(data.error ?? '등록에 실패했습니다.');
      if (data.villaName) setVillaName(data.villaName);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!villaId || !token || tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-neutral-800">유효하지 않은 QR 코드</h1>
          <p className="text-sm text-neutral-500 mt-1">QR 코드가 만료되었거나 잘못된 코드입니다.<br />관리자에게 새 QR 코드를 요청하세요.</p>
        </div>
      </div>
    );
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-pulse space-y-3 w-64">
          <div className="h-6 bg-neutral-200 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-neutral-100 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-neutral-800">등록 완료!</h1>
          <p className="text-sm text-neutral-500 mt-1">
            <span className="font-semibold">{villaName}</span>에<br />
            방문 차량이 등록되었습니다.
          </p>
          <p className="text-xs text-neutral-400 mt-3">이 창을 닫아도 됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-neutral-900">방문 차량 등록</h1>
          {villaName && <p className="text-sm text-neutral-500 mt-0.5">{villaName}</p>}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1 block">
              차량 번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="예: 12가3456"
              className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1 block">방문자 이름</label>
            <input
              type="text"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1 block">차종 (선택)</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="예: 소나타, K5"
              className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 mb-1 block">출차 예정</label>
            <input
              type="text"
              value={expectedDeparture}
              onChange={(e) => setExpectedDeparture(e.target.value)}
              placeholder="예: 오후 6시, 내일 오전"
              className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !plate.trim()}
            className="w-full py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors active:scale-95"
          >
            {submitting ? '등록 중...' : '방문 차량 등록'}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-400 mt-4">
          VillaMate — 빌라 관리 플랫폼
        </p>
      </div>
    </div>
  );
}

export default function QrVehiclePage() {
  return (
    <Suspense>
      <QrVehicleForm />
    </Suspense>
  );
}

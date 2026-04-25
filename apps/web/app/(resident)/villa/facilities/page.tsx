'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiFetch } from '@/lib/client-api';
import { useConfirm } from '@/hooks/useConfirm';

interface Reservation {
  id: string;
  userId: string;
  roomNumber: string;
  timeSlot: string | null;
  note: string | null;
}

interface Facility {
  id: string;
  name: string;
  description: string | null;
  maxPerDay: number;
  reservations: Reservation[];
}

interface FacilitiesResponse {
  facilities: Facility[];
  today: string;
}

export default function FacilitiesPage() {
  const { confirm: confirmDialog, dialog: confirmDialogEl } = useConfirm();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [today, setToday] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState('');

  // 예약 폼 상태
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (raw) {
      try { setMyUserId(JSON.parse(raw)?.id ?? ''); } catch { /* ignore */ }
    }
  }, []);

  const fetchFacilities = () => {
    apiFetch('/api/resident/facilities')
      .then((r) => r.json())
      .then((data: FacilitiesResponse & { error?: string }) => {
        if (data.error) { setError(data.error); return; }
        setFacilities(data.facilities);
        setToday(data.today);
        setDate(data.today);
      })
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFacilities(); }, []);

  const openReserve = (id: string) => {
    setReservingId(id);
    setDate(today);
    setTimeSlot('');
    setNote('');
    setFormError(null);
  };

  const handleReserve = async () => {
    if (!reservingId) return;
    if (!date) { setFormError('날짜를 선택해주세요.'); return; }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await apiFetch(`/api/resident/facilities/${reservingId}/reservations`, {
        method: 'POST',
        body: JSON.stringify({ date, timeSlot: timeSlot || undefined, note: note || undefined }),
      });
      const data = await res.json() as { error?: string };
      if (data.error) { setFormError(data.error); return; }
      setReservingId(null);
      fetchFacilities();
    } catch {
      setFormError('예약 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (facilityId: string, reservationId: string) => {
    const ok = await confirmDialog({ title: '예약 취소', description: '예약을 취소하시겠습니까?', confirmLabel: '취소하기', variant: 'destructive' });
    if (!ok) return;
    await apiFetch(`/api/resident/facilities/${facilityId}/reservations/${reservationId}`, {
      method: 'DELETE',
    });
    fetchFacilities();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="px-4 pt-6 pb-24 min-h-screen bg-neutral-50">
      {confirmDialogEl}
      <h1 className="text-xl font-bold text-neutral-900 mb-2">공용시설 예약</h1>
      <p className="text-sm text-neutral-500 mb-6">오늘 예약 현황을 확인하고 예약하세요.</p>

      {error && <p className="text-error-500 text-sm mb-4">{error}</p>}

      {!error && facilities.length === 0 && (
        <div className="text-center py-16 text-neutral-400">
          <p className="text-4xl mb-3">🏢</p>
          <p>등록된 시설이 없습니다.</p>
        </div>
      )}

      <ul className="space-y-4">
        {facilities.map((f) => {
          const myReservations = f.reservations.filter((r) => r.userId === myUserId);
          const otherReservations = f.reservations.filter((r) => r.userId !== myUserId);
          const canReserve = myReservations.length < f.maxPerDay;

          return (
            <li key={f.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900">{f.name}</p>
                    {f.description && (
                      <p className="text-sm text-neutral-500 mt-0.5">{f.description}</p>
                    )}
                    <p className="text-xs text-neutral-400 mt-1">
                      세대당 하루 최대 {f.maxPerDay}회 · 오늘 총 {f.reservations.length}건 예약
                    </p>
                  </div>
                  {canReserve && (
                    <Button size="sm" onClick={() => openReserve(f.id)}>예약</Button>
                  )}
                </div>

                {/* 내 예약 */}
                {myReservations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {myReservations.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between bg-primary-50 rounded-xl px-3 py-2"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="info">내 예약</Badge>
                            {r.timeSlot && <span className="text-xs text-neutral-600">{r.timeSlot}</span>}
                          </div>
                          {r.note && <p className="text-xs text-neutral-500 mt-0.5">{r.note}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCancel(f.id, r.id)}
                          className="text-xs text-error-600 font-medium min-h-[44px] px-2"
                        >
                          취소
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 다른 입주민 예약 */}
                {otherReservations.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {otherReservations.map((r) => (
                      <div key={r.id} className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 rounded-lg px-3 py-1.5">
                        <span>{r.roomNumber}호</span>
                        {r.timeSlot && <span>{r.timeSlot}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* 예약 바텀시트 */}
      {reservingId && (
        <div className="fixed inset-0 z-60 flex flex-col justify-end bg-black/40">
          <div className="bg-white rounded-t-3xl p-6 space-y-4 max-w-lg mx-auto w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">예약하기</h2>
              <button type="button" onClick={() => setReservingId(null)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && <p className="text-error-500 text-sm" role="alert">{formError}</p>}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">날짜 *</label>
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">이용 시간대 (선택)</label>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="예: 09:00-10:00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">메모 (선택)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="이용 목적 등"
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleReserve} disabled={submitting}>
              {submitting ? '예약 중...' : '예약 확정'}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

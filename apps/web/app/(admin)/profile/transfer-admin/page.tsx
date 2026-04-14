'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearAuth } from '@/lib/client-auth';

interface Resident {
  id: string;
  userId: string;
  roomNumber: string;
  headType: string;
  user: { id: string; name: string; email: string };
}

export default function TransferAdminPage() {
  const router = useRouter();
  const [villaId, setVillaId] = useState('');
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Resident | null>(null);
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villa?: { id?: string } };
    setVillaId(user.villa?.id ?? '');
  }, []);

  useEffect(() => {
    if (!villaId) return;
    fetch(`/api/villas/${villaId}/residents`)
      .then((r) => r.json())
      .then((d: { residents?: Resident[] }) => {
        // HEAD(세대주)만 후보로 표시
        setResidents((d.residents ?? []).filter((r) => r.headType === 'HEAD'));
      })
      .finally(() => setLoading(false));
  }, [villaId]);

  async function handleTransfer() {
    if (!selected || !villaId || transferring) return;

    const confirmed = window.confirm(
      `정말로 ${selected.user.name}님(${selected.roomNumber}호)에게 동대표 권한을 이양하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 현재 계정은 로그아웃됩니다.`,
    );
    if (!confirmed) return;

    setTransferring(true);
    setError('');
    try {
      const res = await fetch(`/api/villas/${villaId}/transfer-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newAdminId: selected.userId }),
      });
      const data = await res.json() as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error ?? '권한 이양에 실패했습니다.');

      alert(data.message ?? '동대표 권한이 이양되었습니다. 다시 로그인해주세요.');
      clearAuth();
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : '권한 이양에 실패했습니다.');
    } finally {
      setTransferring(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
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
        <div>
          <h1 className="text-xl font-bold text-neutral-900">동대표 교체</h1>
          <p className="text-xs text-neutral-500">권한을 이양할 세대주를 선택하세요</p>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* 안내 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-1">⚠️ 주의</p>
          <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
            <li>권한 이양 후 현재 계정은 입주민으로 변경됩니다.</li>
            <li>이 작업은 되돌릴 수 없습니다.</li>
            <li>이양 후 자동으로 로그아웃됩니다.</li>
          </ul>
        </div>

        {/* 세대주 목록 */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-sm font-semibold text-neutral-700 mb-3">세대주 목록</p>
          {loading ? (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-neutral-100 rounded-xl" />)}
            </div>
          ) : residents.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">등록된 세대주가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {residents.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelected(selected?.id === r.id ? null : r)}
                  className={[
                    'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors text-left',
                    selected?.id === r.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-100 hover:border-neutral-200',
                  ].join(' ')}
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm shrink-0">
                    {r.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900">{r.user.name}</p>
                    <p className="text-xs text-neutral-400">{r.roomNumber}호 · {r.user.email}</p>
                  </div>
                  {selected?.id === r.id && (
                    <svg className="w-5 h-5 text-primary-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {/* 이양 버튼 */}
        <button
          type="button"
          onClick={handleTransfer}
          disabled={!selected || transferring}
          className="w-full py-4 rounded-2xl bg-red-500 text-white text-sm font-bold disabled:opacity-40 disabled:bg-neutral-300 transition-colors"
        >
          {transferring
            ? '처리 중...'
            : selected
              ? `${selected.user.name}님에게 동대표 권한 이양`
              : '세대주를 선택하세요'}
        </button>
      </div>
    </main>
  );
}

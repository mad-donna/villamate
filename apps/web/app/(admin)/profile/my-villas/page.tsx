'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveToken, getUser as getStoredUser, setUser } from '@/lib/client-auth';
import type { StoredUser } from '@/lib/client-auth';

interface ManagedVilla {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  subscriptionStatus: string;
  subscriptionExpiry: string | null;
  inviteCode: string;
  residentCount: number;
}

const STATUS_LABEL: Record<string, string> = {
  FREE_TRIAL: '무료체험',
  ACTIVE: '구독중',
  EXPIRED: '만료',
};
const STATUS_COLOR: Record<string, string> = {
  FREE_TRIAL: 'text-blue-600 bg-blue-50',
  ACTIVE: 'text-green-600 bg-green-50',
  EXPIRED: 'text-red-500 bg-red-50',
};

export default function MyVillasPage() {
  const router = useRouter();
  const [villas, setVillas] = useState<ManagedVilla[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVillaId, setCurrentVillaId] = useState('');
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    setCurrentVillaId(user?.villa?.id ?? '');

    fetch('/api/me/villas')
      .then((r) => r.json())
      .then((d: { villas?: ManagedVilla[] }) => setVillas(d.villas ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleSwitch(villa: ManagedVilla) {
    if (villa.id === currentVillaId || switching) return;
    setSwitching(villa.id);
    try {
      const res = await fetch('/api/auth/switch-villa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ villaId: villa.id }),
      });
      const data = await res.json() as { token?: string; villa?: StoredUser['villa']; error?: string };
      if (!res.ok || !data.token) throw new Error(data.error ?? '전환에 실패했습니다.');

      // 토큰 + 사용자 villa 정보 업데이트
      saveToken(data.token);
      const currentUser = getStoredUser();
      if (currentUser && data.villa) {
        setUser({ ...currentUser, villa: data.villa });
      }
      setCurrentVillaId(villa.id);
      router.push('/home');
    } catch (e) {
      alert(e instanceof Error ? e.message : '빌라 전환에 실패했습니다.');
    } finally {
      setSwitching(null);
    }
  }

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
          <div>
            <h1 className="text-xl font-bold text-neutral-900">내 빌라 목록</h1>
            <p className="text-xs text-neutral-500">관리 중인 빌라를 전환합니다</p>
          </div>
        </div>
        <Link
          href="/onboarding"
          className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-2 rounded-xl"
        >
          + 새 빌라
        </Link>
      </div>

      <div className="px-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-24 bg-neutral-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : villas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-400 text-sm mb-4">관리 중인 빌라가 없습니다.</p>
            <Link href="/onboarding" className="text-sm font-semibold text-primary-600">
              빌라 등록하기 →
            </Link>
          </div>
        ) : (
          villas.map((v) => {
            const isCurrent = v.id === currentVillaId;
            return (
              <div
                key={v.id}
                className={[
                  'bg-white rounded-2xl shadow-sm p-4 border-2 transition-colors',
                  isCurrent ? 'border-primary-400' : 'border-transparent',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-neutral-900 truncate">{v.name}</p>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full shrink-0">
                          현재
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 truncate mb-2">{v.address}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={['text-xs font-medium px-2 py-0.5 rounded-full', STATUS_COLOR[v.subscriptionStatus] ?? 'text-neutral-500 bg-neutral-100'].join(' ')}>
                        {STATUS_LABEL[v.subscriptionStatus] ?? v.subscriptionStatus}
                      </span>
                      <span className="text-xs text-neutral-400">
                        입주민 {v.residentCount}명 · {v.totalUnits}세대
                      </span>
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleSwitch(v)}
                      disabled={!!switching}
                      className="text-sm font-semibold text-white bg-primary-600 px-3 py-2 rounded-xl disabled:opacity-50 shrink-0 transition-colors"
                    >
                      {switching === v.id ? '전환 중' : '전환'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}

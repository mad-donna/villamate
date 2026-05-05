'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser as getStoredUser, getToken } from '@/lib/client-auth';
import type { StoredUser } from '@/lib/client-auth';
import { WidgetCard } from '@/components/ui/WidgetCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { InsightsSection } from '@/components/InsightsSection';
import { useToast } from '@/hooks/useToast';

// ---------- 타입 ----------

interface LatestPost {
  id: string;
  title: string;
  createdAt: string;
}

interface AdminStats {
  totalResidents: number;
  unpaidCount: number;
  unpaidAmount: number;
  activePollsCount: number;
  latestPost: LatestPost | null;
}

interface VillaInfo {
  id: string;
  name: string;
  address: string;
  subscriptionStatus: 'FREE_TRIAL' | 'ACTIVE' | 'EXPIRED';
  subscriptionExpiry: string | null;
}

interface AdminDashboardData {
  role: 'ADMIN';
  villa: VillaInfo;
  stats: AdminStats;
}

interface ManagedVilla {
  id: string;
  name: string;
  address: string;
  subscriptionStatus: string;
  inviteCode: string;
}

// ---------- 구독 배지 ----------

const subscriptionLabel: Record<string, string> = {
  FREE_TRIAL: '무료체험 중',
  ACTIVE: '구독중',
  EXPIRED: '구독만료',
};

const subscriptionBadgeClass: Record<string, string> = {
  FREE_TRIAL: 'bg-primary-100 text-primary-700',
  ACTIVE: 'bg-success-100 text-success-700',
  EXPIRED: 'bg-error-100 text-error-700',
};

// ---------- 바로가기 메뉴 ----------

const shortcuts = [
  { label: '청구서 발행', icon: '🧾', href: '/manage/invoices' },
  { label: '입주민 관리', icon: '👥', href: '/manage/residents' },
  { label: '전자투표', icon: '🗳️', href: '/manage/polls' },
  { label: '건물이력', icon: '🏗️', href: '/manage/building' },
  { label: '커뮤니티', icon: '💬', href: '/community' },
  { label: '장부', icon: '📒', href: '/ledger' },
];

// ---------- 로딩 스켈레톤 ----------

function DashboardSkeleton() {
  return (
    <main className="px-4 pt-6 pb-6 space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-20" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    </main>
  );
}

// ---------- 미설치 온보딩 유도 ----------

function NeedsSetup({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <main className="px-4 pt-12 flex flex-col items-center text-center gap-4">
      <span className="text-5xl">🏠</span>
      <h1 className="text-xl font-bold text-neutral-900">빌라가 등록되지 않았습니다</h1>
      <p className="text-sm text-neutral-500">관리할 빌라를 먼저 등록해주세요.</p>
      <Button
        variant="primary"
        size="md"
        className="mt-2"
        onClick={() => router.push('/onboarding')}
      >
        빌라 등록하기
      </Button>
    </main>
  );
}

// ---------- 메인 컴포넌트 ----------

export default function AdminHomePage() {
  const router = useRouter();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [multiVillaCount, setMultiVillaCount] = useState(0);
  const [nudgeSending, setNudgeSending] = useState(false);
  const { toast, toastEl } = useToast();

  // F-99: 빌라 퀵스위치
  const [showVillaPicker, setShowVillaPicker] = useState(false);
  const [villas, setVillas] = useState<ManagedVilla[]>([]);
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    const token = getToken();

    if (!storedUser || !token) {
      router.replace('/login');
      return;
    }

    const villaId = storedUser.villa?.id;

    Promise.all([
      fetch(`/api/dashboard?role=ADMIN${villaId ? `&villaId=${villaId}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (res) => {
        if (!res.ok) throw new Error('dashboard fetch failed');
        return res.json() as Promise<AdminDashboardData | { needsSetup: true }>;
      }),
      fetch('/api/me/villas', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d: { villas?: ManagedVilla[] }) => {
          setVillas(d.villas ?? []);
          return d.villas?.length ?? 0;
        })
        .catch(() => 0),
    ])
      .then(([json, villaCount]) => {
        setMultiVillaCount(villaCount as number);
        if ('needsSetup' in (json as object) && (json as { needsSetup: true }).needsSetup) {
          setNeedsSetup(true);
        } else {
          setData(json as AdminDashboardData);
        }
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSwitchVilla(villaId: string) {
    if (switching) return;
    setSwitching(villaId);
    try {
      const token = getToken();
      const res = await fetch('/api/auth/switch-villa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ villaId }),
      });
      const d = await res.json() as { token?: string; villa?: StoredUser['villa'] };
      if (!res.ok || !d.token) throw new Error();
      const { saveToken, setUser: saveUser } = await import('@/lib/client-auth');
      saveToken(d.token);
      const currentUser = getStoredUser();
      if (currentUser && d.villa) saveUser({ ...currentUser, villa: d.villa });
      setShowVillaPicker(false);
      window.location.reload();
    } catch {
      toast('빌라 전환에 실패했습니다.', 'error');
    } finally {
      setSwitching(null);
    }
  }

  async function handleNudge() {
    if (!data) return;
    const token = getToken();
    setNudgeSending(true);
    try {
      const res = await fetch(`/api/villas/${data.villa.id}/nudge`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 429) {
        toast('오늘 이미 납부 안내 공지를 발송했습니다.', 'error');
      } else if (!res.ok) {
        toast('발송에 실패했습니다. 다시 시도해 주세요.', 'error');
      } else {
        toast('전체 입주민에게 납부 안내 공지를 발송했습니다.', 'success');
      }
    } catch {
      toast('발송에 실패했습니다. 다시 시도해 주세요.', 'error');
    } finally {
      setNudgeSending(false);
    }
  }

  if (loading) return <DashboardSkeleton />;
  if (fetchError) return (
    <main className="px-4 pt-12 flex flex-col items-center text-center gap-4">
      <span className="text-5xl">⚠️</span>
      <h1 className="text-xl font-bold text-neutral-900">데이터를 불러오지 못했습니다</h1>
      <p className="text-sm text-neutral-500">잠시 후 다시 시도해주세요.</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 bg-primary-600 text-white text-sm font-semibold px-6 py-3 min-h-[44px] rounded-2xl active:scale-95 transition-transform"
      >
        다시 시도
      </button>
    </main>
  );
  if (needsSetup) return <NeedsSetup router={router} />;
  if (!data) return null;

  const { villa, stats } = data;
  const storedUser = getStoredUser();
  const userName = storedUser?.name ?? '';
  const isExpired = villa.subscriptionStatus === 'EXPIRED';

  return (
    <>
      {toastEl}
      {/* 구독 만료 배너 */}
      {isExpired && (
        <div className="bg-red-500 text-white text-sm px-4 py-3 flex items-center justify-between min-h-[44px]">
          <span>구독이 만료되었습니다. 주요 기능이 제한됩니다.</span>
          <button
            type="button"
            onClick={() => router.push('/profile/subscription')}
            className="ml-3 min-h-[44px] px-2 font-semibold underline whitespace-nowrap"
          >
            구독하기
          </button>
        </div>
      )}

      <main className="px-4 pt-6 pb-6 space-y-6">
        {/* 헤더 */}
        <header>
          <p className="text-sm text-neutral-500">안녕하세요,</p>
          <h1 className="text-xl font-bold text-neutral-900">{userName}님 👋</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {multiVillaCount > 1 ? (
              <button
                type="button"
                onClick={() => setShowVillaPicker(true)}
                className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                {villa.name}
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            ) : (
              <p className="text-sm text-neutral-500">{villa.name}</p>
            )}
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${subscriptionBadgeClass[villa.subscriptionStatus]}`}
            >
              {subscriptionLabel[villa.subscriptionStatus]}
            </span>
          </div>
        </header>

        {/* 위젯 그리드 (2열) */}
        <section aria-label="요약 위젯">
          <div className="grid grid-cols-2 gap-3">
            <WidgetCard
              title="미납 관리비"
              value={`${stats.unpaidCount}세대`}
              subtitle={
                stats.unpaidAmount > 0
                  ? `총 ${stats.unpaidAmount.toLocaleString()}원`
                  : undefined
              }
              accentColor="error"
              onClick={() => router.push('/manage/invoices')}
            />
            <WidgetCard
              title="진행중 투표"
              value={`${stats.activePollsCount}건`}
              accentColor="warning"
              onClick={() => router.push('/manage/polls')}
            />
          </div>
        </section>

        {/* 최근 공지 */}
        <section aria-label="최근 공지">
          {stats.latestPost ? (
            <button
              type="button"
              onClick={() => router.push(`/community/${stats.latestPost!.id}`)}
              className="w-full bg-white rounded-2xl shadow-sm p-4 border-l-4 border-l-neutral-300 text-left active:scale-95 transition-transform"
            >
              <p className="text-xs text-neutral-500 mb-1">최근 공지</p>
              <p className="text-sm font-semibold text-neutral-900 line-clamp-2">
                {stats.latestPost.title}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                {new Date(stats.latestPost.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </button>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-4 border-l-4 border-l-neutral-200">
              <p className="text-xs text-neutral-500 mb-1">최근 공지</p>
              <p className="text-sm text-neutral-400">등록된 공지가 없습니다.</p>
            </div>
          )}
        </section>

        {/* 소프트 넛지 */}
        {stats.unpaidCount > 0 && (
          <section aria-label="납부 안내 공지">
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-primary-800">납부 안내 공지 보내기</p>
                <p className="text-xs text-primary-600 mt-0.5">
                  전체 입주민에게 부드럽게 납부를 안내합니다.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleNudge}
                loading={nudgeSending}
                className="shrink-0"
              >
                공지 발송
              </Button>
            </div>
          </section>
        )}

        {/* 바로가기 메뉴 */}
        <section aria-label="바로가기">
          <h2 className="text-sm font-semibold text-neutral-600 mb-3">바로가기</h2>
          <div className="grid grid-cols-3 gap-3">
            {shortcuts.map(({ label, icon, href }) => (
              <button
                key={href}
                type="button"
                onClick={() => router.push(href)}
                className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform min-h-[44px] min-w-[44px]"
              >
                <span className="text-2xl" aria-hidden="true">{icon}</span>
                <span className="text-xs font-medium text-neutral-700 text-center leading-tight">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 수금 인사이트 */}
        <InsightsSection />
      </main>

      {/* F-99: 빌라 퀵스위치 바텀시트 */}
      {showVillaPicker && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end"
          onClick={() => setShowVillaPicker(false)}
        >
          <div
            className="bg-white rounded-t-3xl w-full p-5 space-y-3 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-neutral-900">빌라 전환</h2>
              <button
                type="button"
                onClick={() => setShowVillaPicker(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {villas.map((v) => {
              const isCurrent = v.id === villa.id;
              return (
                <div
                  key={v.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-colors ${isCurrent ? 'border-primary-400 bg-primary-50' : 'border-neutral-100 bg-white'}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-neutral-900 truncate">{v.name}</p>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full shrink-0">현재</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">{v.address}</p>
                  </div>
                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleSwitchVilla(v.id)}
                      disabled={!!switching}
                      className="ml-3 text-sm font-semibold text-white bg-primary-600 px-3 py-2 rounded-xl disabled:opacity-50 shrink-0"
                    >
                      {switching === v.id ? '전환 중' : '전환'}
                    </button>
                  )}
                </div>
              );
            })}
            <div className="pb-safe" />
          </div>
        </div>
      )}
    </>
  );
}

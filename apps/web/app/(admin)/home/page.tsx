'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser as getStoredUser, getToken } from '@/lib/client-auth';
import { WidgetCard } from '@/components/ui/WidgetCard';
import { Skeleton } from '@/components/ui/Skeleton';

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

// ---------- 구독 배지 ----------

const subscriptionLabel: Record<string, string> = {
  FREE_TRIAL: '무료체험 중',
  ACTIVE: '구독중',
  EXPIRED: '구독만료',
};

const subscriptionBadgeClass: Record<string, string> = {
  FREE_TRIAL: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-red-100 text-red-700',
};

// ---------- 바로가기 메뉴 ----------

const shortcuts = [
  { label: '청구서 발행', icon: '🧾', href: '/manage/invoices' },
  { label: '입주민 관리', icon: '👥', href: '/manage/residents' },
  { label: '전자투표', icon: '🗳️', href: '/manage/polls' },
  { label: '건물이력', icon: '🏗️', href: '/manage/building-events' },
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
      <button
        type="button"
        onClick={() => router.push('/onboarding')}
        className="mt-2 bg-blue-600 text-white text-sm font-semibold px-6 py-3 min-h-[44px] rounded-2xl active:scale-95 transition-transform"
      >
        빌라 등록하기
      </button>
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

  useEffect(() => {
    const storedUser = getStoredUser();
    const token = getToken();

    if (!storedUser || !token) {
      router.replace('/login');
      return;
    }

    const villaId = storedUser.villa?.id;

    fetch(`/api/dashboard?role=ADMIN${villaId ? `&villaId=${villaId}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('dashboard fetch failed');
        return res.json() as Promise<AdminDashboardData | { needsSetup: true }>;
      })
      .then((json) => {
        if ('needsSetup' in json && json.needsSetup) {
          setNeedsSetup(true);
        } else {
          setData(json as AdminDashboardData);
        }
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [router]);

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
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-neutral-500">{villa.name}</p>
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

        {/* 바로가기 메뉴 */}
        <section aria-label="바로가기">
          <h2 className="text-sm font-semibold text-neutral-600 mb-3">바로가기</h2>
          <div className="grid grid-cols-3 gap-3">
            {shortcuts.map(({ label, icon, href }) => (
              <button
                key={href}
                type="button"
                onClick={() => router.push(href)}
                className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <span className="text-2xl" aria-hidden="true">{icon}</span>
                <span className="text-xs font-medium text-neutral-700 text-center leading-tight">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

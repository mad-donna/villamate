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

interface ResidentStats {
  myUnpaidAmount: number;
  myUnpaidCount: number;
  activePollsCount: number;
  latestPost: LatestPost | null;
}

interface VillaInfo {
  id: string;
  name: string;
  address: string;
}

interface ResidentDashboardData {
  role: 'RESIDENT';
  villa: VillaInfo;
  roomNumber: string;
  stats: ResidentStats;
}

// ---------- 바로가기 메뉴 ----------

const shortcuts = [
  { label: '관리비 납부', icon: '💳', href: '/villa/invoices' },
  { label: '전자투표', icon: '🗳️', href: '/villa/polls' },
  { label: '공지사항', icon: '📢', href: '/resident/community' },
  { label: '건물이력', icon: '🏗️', href: '/villa' },
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
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    </main>
  );
}

// ---------- 미가입 온보딩 유도 ----------

function NeedsSetup({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <main className="px-4 pt-12 flex flex-col items-center text-center gap-4">
      <span className="text-5xl">🔑</span>
      <h1 className="text-xl font-bold text-neutral-900">아직 빌라에 가입하지 않으셨어요</h1>
      <p className="text-sm text-neutral-500">초대 코드를 입력하여 빌라에 가입해주세요.</p>
      <button
        type="button"
        onClick={() => router.push('/join')}
        className="mt-2 bg-blue-600 text-white text-sm font-semibold px-6 py-3 min-h-[44px] rounded-2xl active:scale-95 transition-transform"
      >
        빌라 가입하기
      </button>
    </main>
  );
}

// ---------- 메인 컴포넌트 ----------

export default function ResidentHomePage() {
  const router = useRouter();
  const [data, setData] = useState<ResidentDashboardData | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    const token = getToken();

    if (!storedUser || !token) {
      router.replace('/login');
      return;
    }

    const villaId = storedUser.villa?.id;

    fetch(`/api/dashboard?role=RESIDENT${villaId ? `&villaId=${villaId}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('dashboard fetch failed');
        return res.json() as Promise<ResidentDashboardData | { needsSetup: true }>;
      })
      .then((json) => {
        if ('needsSetup' in json && json.needsSetup) {
          setNeedsSetup(true);
        } else {
          setData(json as ResidentDashboardData);
        }
      })
      .catch(() => setNeedsSetup(true))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <DashboardSkeleton />;
  if (needsSetup) return <NeedsSetup router={router} />;
  if (!data) return null;

  const { villa, roomNumber, stats } = data;
  const storedUser = getStoredUser();
  const userName = storedUser?.name ?? '';

  const hasUnpaid = stats.myUnpaidCount > 0;

  return (
    <main className="px-4 pt-6 pb-6 space-y-6">
      {/* 헤더 */}
      <header>
        <p className="text-sm text-neutral-500">안녕하세요,</p>
        <h1 className="text-xl font-bold text-neutral-900">{userName}님 👋</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {villa.name} {roomNumber}호
        </p>
      </header>

      {/* 위젯 그리드 (2열) */}
      <section aria-label="요약 위젯">
        <div className="grid grid-cols-2 gap-3">
          <WidgetCard
            title="미납 관리비"
            value={
              hasUnpaid
                ? `${stats.myUnpaidAmount.toLocaleString()}원`
                : '완납'
            }
            subtitle={hasUnpaid ? `${stats.myUnpaidCount}건 미납` : '모두 납부 완료'}
            accentColor={hasUnpaid ? 'error' : 'success'}
            onClick={() => router.push('/villa/invoices')}
          />
          <WidgetCard
            title="참여 가능한 투표"
            value={`${stats.activePollsCount}건`}
            accentColor="warning"
            onClick={() => router.push('/villa/polls')}
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
        <div className="grid grid-cols-2 gap-3">
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
  );
}

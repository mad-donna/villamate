'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const CATEGORY_LABEL: Record<string, string> = {
  GENERAL: '일반',
  ADMIN: '관리자',
  RESIDENT: '입주민',
  BILLING: '관리비',
  POLL: '투표',
  COMMUNITY: '커뮤니티',
};

interface GuideItem {
  id: string;
  title: string;
  category: string;
  order: number;
  updatedAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function GuidePage() {
  const router = useRouter();
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/guides')
      .then((r) => r.json() as Promise<GuideItem[]>)
      .then(setGuides)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['ALL', ...Array.from(new Set(guides.map((g) => g.category)))];
  const filtered =
    activeCategory === 'ALL' ? guides : guides.filter((g) => g.category === activeCategory);

  return (
    <main className="px-4 pt-6 pb-20">
      <header className="mb-5">
        <h1 className="text-xl font-bold text-neutral-900">앱 이용 가이드</h1>
        <p className="text-sm text-neutral-500 mt-1">VillaMate 사용법을 확인하세요.</p>
      </header>

      {/* 카테고리 필터 */}
      {!loading && guides.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={[
                'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                activeCategory === c
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-neutral-500 border-neutral-300',
              ].join(' ')}
            >
              {c === 'ALL' ? '전체' : (CATEGORY_LABEL[c] ?? c)}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 h-16 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p>등록된 가이드가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-neutral-50">
          {filtered.map((guide) => (
            <button
              key={guide.id}
              onClick={() => router.push(`/resident/guide/${guide.id}`)}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-neutral-50 active:bg-neutral-100 transition-colors text-left"
            >
              <div>
                <p className="text-sm font-semibold text-neutral-900">{guide.title}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {CATEGORY_LABEL[guide.category] ?? guide.category} · {formatDate(guide.updatedAt)}
                </p>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-neutral-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </main>
  );
}

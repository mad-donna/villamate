'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import DOMPurify from 'dompurify';

const CATEGORY_LABEL: Record<string, string> = {
  GENERAL: '일반',
  ADMIN: '관리자',
  RESIDENT: '입주민',
  BILLING: '관리비',
  POLL: '투표',
  COMMUNITY: '커뮤니티',
};

interface Guide {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
}

export default function GuideDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/guides/${id}`)
      .then(async (r) => {
        if (!r.ok) { setNotFound(true); return; }
        setGuide(await r.json() as Guide);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="px-4 pt-6 pb-6 space-y-4">
        <div className="h-6 w-32 bg-neutral-100 rounded animate-pulse" />
        <div className="h-7 w-3/4 bg-neutral-100 rounded animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-neutral-100 rounded animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  if (notFound || !guide) {
    return (
      <main className="px-4 pt-12 flex flex-col items-center text-center gap-3">
        <p className="text-neutral-500">가이드를 찾을 수 없습니다.</p>
        <button
          onClick={() => router.back()}
          className="text-sm font-semibold text-primary-600"
        >
          돌아가기
        </button>
      </main>
    );
  }

  const safeHtml = DOMPurify.sanitize(guide.content, { USE_PROFILES: { html: true } });

  return (
    <main className="px-4 pt-4 pb-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-neutral-500 mb-4 -ml-1"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        가이드 목록
      </button>

      <div className="mb-6">
        <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
          {CATEGORY_LABEL[guide.category] ?? guide.category}
        </span>
        <h1 className="text-xl font-bold text-neutral-900 mt-2">{guide.title}</h1>
        <p className="text-xs text-neutral-400 mt-1">
          마지막 수정:{' '}
          {new Date(guide.updatedAt).toLocaleDateString('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      <div
        className="prose prose-sm max-w-none text-neutral-800"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </main>
  );
}

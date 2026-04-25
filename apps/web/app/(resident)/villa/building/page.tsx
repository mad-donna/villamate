'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ImageViewer } from '@/components/ui/ImageViewer';
import { apiFetch } from '@/lib/client-api';

type Category = 'REPAIR' | 'INSPECTION' | 'CONTRACT' | 'CLEANING' | 'ETC';

const CATEGORY_LABELS: Record<Category, string> = {
  REPAIR: '하자보수',
  INSPECTION: '정기점검',
  CONTRACT: '유지계약',
  CLEANING: '청소',
  ETC: '기타',
};

const CATEGORY_BADGE: Record<Category, 'warning' | 'error' | 'info' | 'success' | 'neutral'> = {
  REPAIR: 'error',
  INSPECTION: 'info',
  CONTRACT: 'warning',
  CLEANING: 'success',
  ETC: 'neutral',
};

interface BuildingEvent {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  eventDate: string;
  contractorName: string | null;
  contactNumber: string | null;
  attachmentUrl: string | null;
  createdAt: string;
  creator: { name: string };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ResidentBuildingPage() {
  const router = useRouter();
  const [villaId, setVillaId] = useState('');
  const [events, setEvents] = useState<BuildingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'ALL'>('ALL');
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as {
      residentVilla?: { id?: string };
      villa?: { id?: string };
    };
    setVillaId(user.residentVilla?.id ?? user.villa?.id ?? '');
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!villaId) return;
    setLoading(true);
    setError('');
    try {
      const category = filterCategory !== 'ALL' ? `?category=${filterCategory}` : '';
      const res = await apiFetch(`/api/villas/${villaId}/building-events${category}`);
      if (!res.ok) throw new Error('fetch failed');
      const data = (await res.json()) as BuildingEvent[];
      setEvents(data);
    } catch {
      setError('건물 이력을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [villaId, filterCategory]);

  useEffect(() => {
    if (villaId) fetchEvents();
  }, [villaId, fetchEvents]);

  const CATEGORIES: Category[] = ['REPAIR', 'INSPECTION', 'CONTRACT', 'CLEANING', 'ETC'];

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => router.back()}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
          aria-label="뒤로가기"
        >
          <svg
            className="w-5 h-5 text-neutral-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-neutral-900">건물 이력</h1>
      </div>

      {/* 카테고리 필터 */}
      <div className="px-4 mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterCategory('ALL')}
          className={[
            'shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors',
            filterCategory === 'ALL'
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-neutral-500 border-neutral-300 hover:border-neutral-400',
          ].join(' ')}
        >
          전체
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={[
              'shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors',
              filterCategory === cat
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-neutral-500 border-neutral-300 hover:border-neutral-400',
            ].join(' ')}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* 이력 목록 */}
      <div className="px-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-5 w-16 bg-neutral-200 rounded-full" />
                <div className="h-4 w-32 bg-neutral-200 rounded" />
              </div>
              <div className="h-4 w-48 bg-neutral-200 rounded" />
            </div>
          ))
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-neutral-500">{error}</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={fetchEvents}>
              다시 시도
            </Button>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg
              className="w-12 h-12 text-neutral-300 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
              />
            </svg>
            <p className="text-neutral-500 font-medium">등록된 건물 이력이 없습니다.</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-start gap-2 mb-2 flex-wrap">
                <Badge variant={CATEGORY_BADGE[event.category]}>
                  {CATEGORY_LABELS[event.category]}
                </Badge>
                <span className="text-xs text-neutral-400 self-center">
                  {formatDate(event.eventDate)}
                </span>
              </div>
              <p className="text-sm font-semibold text-neutral-900 mb-1">{event.title}</p>
              {event.description && (
                <p className="text-sm text-neutral-600 whitespace-pre-line mb-2">
                  {event.description}
                </p>
              )}
              {(event.contractorName || event.contactNumber) && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {event.contractorName && (
                    <span className="text-xs text-neutral-500">
                      업체:{' '}
                      <span className="font-medium text-neutral-700">{event.contractorName}</span>
                    </span>
                  )}
                  {event.contactNumber && (
                    <span className="text-xs text-neutral-500">
                      연락처:{' '}
                      <a
                        href={`tel:${event.contactNumber}`}
                        className="font-medium text-primary-600"
                      >
                        {event.contactNumber}
                      </a>
                    </span>
                  )}
                </div>
              )}
              {event.attachmentUrl && (
                <div className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.attachmentUrl}
                    alt="첨부 사진"
                    className="w-full max-h-48 object-cover rounded-xl border border-neutral-200 cursor-pointer"
                    onClick={() => setViewerSrc(event.attachmentUrl!)}
                  />
                </div>
              )}
              <p className="text-xs text-neutral-400 mt-2">등록: {event.creator.name}</p>
            </div>
          ))
        )}
      </div>
      {/* 이미지 뷰어 */}
      {viewerSrc && (
        <ImageViewer src={viewerSrc} alt="건물 이력 사진" onClose={() => setViewerSrc(null)} />
      )}
    </main>
  );
}

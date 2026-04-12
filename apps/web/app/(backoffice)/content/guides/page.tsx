'use client';

import { useEffect, useState, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { boAuthHeaders } from '@/lib/backoffice-auth';

const CATEGORIES = ['GENERAL', 'ADMIN', 'RESIDENT', 'BILLING', 'POLL', 'COMMUNITY'];
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
  isPublished: boolean;
  createdAt: string;
}

interface GuideFull extends GuideItem {
  content: string;
}

function GuideModal({
  guide,
  onClose,
  onSaved,
}: {
  guide: GuideFull | null; // null = 신규
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(guide?.title ?? '');
  const [content, setContent] = useState(guide?.content ?? '');
  const [category, setCategory] = useState(guide?.category ?? 'GENERAL');
  const [order, setOrder] = useState(String(guide?.order ?? 0));
  const [isPublished, setIsPublished] = useState(guide?.isPublished ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      // NF-05: DOMPurify로 XSS 방어
      const safeContent = DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });

      const url = guide ? `/api/backoffice/guides/${guide.id}` : '/api/backoffice/guides';
      const res = await fetch(url, {
        method: guide ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', ...boAuthHeaders() },
        body: JSON.stringify({
          title,
          content: safeContent,
          category,
          order: Number(order) || 0,
          isPublished,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? '저장 실패');
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-8 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-neutral-900">
          {guide ? '가이드 수정' : '새 가이드 작성'}
        </h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">제목</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="가이드 제목" />
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-11 rounded-xl border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">노출 순서</label>
            <input
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-24 h-11 rounded-xl border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none mt-6">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-primary-600"
            />
            <span className="text-sm text-neutral-700">앱 내 공개</span>
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">내용</label>
          <RichTextEditor value={content} onChange={setContent} placeholder="가이드 내용을 입력하세요" />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" size="md" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" size="md" className="flex-1" loading={saving} onClick={handleSave}>
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function GuidesPage() {
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalGuide, setModalGuide] = useState<GuideFull | null | undefined>(undefined);
  const [loadingEdit, setLoadingEdit] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchGuides = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backoffice/guides', { headers: boAuthHeaders() });
      if (!res.ok) throw new Error();
      setGuides((await res.json()) as GuideItem[]);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  async function openEdit(id: string) {
    setLoadingEdit(id);
    try {
      const res = await fetch(`/api/backoffice/guides/${id}`, { headers: boAuthHeaders() });
      if (!res.ok) throw new Error('가이드를 불러올 수 없습니다.');
      const data = (await res.json()) as GuideFull;
      setModalGuide(data);
    } catch (e) {
      alert(e instanceof Error ? e.message : '불러오기 실패');
    } finally {
      setLoadingEdit(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('삭제하시겠습니까?')) return;
    setDeleting(id);
    try {
      await fetch(`/api/backoffice/guides/${id}`, { method: 'DELETE', headers: boAuthHeaders() });
      setGuides((prev) => prev.filter((g) => g.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  async function togglePublish(guide: GuideItem) {
    try {
      const res = await fetch(`/api/backoffice/guides/${guide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...boAuthHeaders() },
        body: JSON.stringify({ isPublished: !guide.isPublished }),
      });
      if (!res.ok) return;
      setGuides((prev) =>
        prev.map((g) => (g.id === guide.id ? { ...g, isPublished: !g.isPublished } : g)),
      );
    } catch {
      // silent
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">가이드 라이브러리</h1>
          <p className="text-sm text-neutral-500 mt-0.5">총 {guides.length}건 · order 오름차순 정렬</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setModalGuide(null)}>
          새 가이드 작성
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : guides.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p>등록된 가이드가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100">
              <tr className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                <th className="px-4 py-3 w-12">순서</th>
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3">카테고리</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {guides.map((guide) => (
                <tr key={guide.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-neutral-400 text-center">{guide.order}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900 truncate max-w-xs">{guide.title}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {CATEGORY_LABEL[guide.category] ?? guide.category}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublish(guide)}>
                      <Badge variant={guide.isPublished ? 'success' : 'neutral'}>
                        {guide.isPublished ? '게시중' : '비공개'}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEdit(guide.id)}
                        disabled={loadingEdit === guide.id}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-40"
                      >
                        {loadingEdit === guide.id ? '로딩...' : '수정'}
                      </button>
                      <button
                        onClick={() => handleDelete(guide.id)}
                        disabled={deleting === guide.id}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 disabled:opacity-40"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalGuide !== undefined && (
        <GuideModal
          guide={modalGuide}
          onClose={() => setModalGuide(undefined)}
          onSaved={fetchGuides}
        />
      )}
    </div>
  );
}

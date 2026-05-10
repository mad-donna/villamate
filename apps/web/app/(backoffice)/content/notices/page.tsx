'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { boAuthHeaders } from '@/lib/backoffice-auth';
import { useConfirm } from '@/hooks/useConfirm';

interface SystemNotice {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function NoticeModal({
  notice,
  onClose,
  onSaved,
}: {
  notice: SystemNotice | null; // null = 신규
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(notice?.title ?? '');
  const [content, setContent] = useState(notice?.content ?? '');
  const [isPublished, setIsPublished] = useState(notice?.isPublished ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const url = notice ? `/api/backoffice/notices/${notice.id}` : '/api/backoffice/notices';
      const res = await fetch(url, {
        method: notice ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', ...boAuthHeaders() },
        body: JSON.stringify({ title, content, isPublished }),
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-neutral-900">
          {notice ? '공지 수정' : '새 공지 작성'}
        </h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">제목</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="공지 제목" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="공지 내용"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 accent-primary-600"
          />
          <span className="text-sm text-neutral-700">게시 (입주민에게 공개)</span>
        </label>

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

export default function NoticesPage() {
  const { confirm: confirmDialog, dialog: confirmEl } = useConfirm();
  const [notices, setNotices] = useState<SystemNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalTarget, setModalTarget] = useState<SystemNotice | null | undefined>(undefined); // undefined = 닫힘
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backoffice/notices', { headers: boAuthHeaders() });
      if (!res.ok) throw new Error();
      setNotices((await res.json()) as SystemNotice[]);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  async function handleDelete(id: string) {
    const ok = await confirmDialog({ title: '공지 삭제', description: '삭제한 공지는 복구할 수 없습니다.', variant: 'destructive', confirmLabel: '삭제' });
    if (!ok) return;
    setDeleting(id);
    try {
      await fetch(`/api/backoffice/notices/${id}`, { method: 'DELETE', headers: boAuthHeaders() });
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  async function togglePublish(notice: SystemNotice) {
    try {
      const res = await fetch(`/api/backoffice/notices/${notice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...boAuthHeaders() },
        body: JSON.stringify({ isPublished: !notice.isPublished }),
      });
      if (!res.ok) return;
      setNotices((prev) =>
        prev.map((n) => (n.id === notice.id ? { ...n, isPublished: !n.isPublished } : n)),
      );
    } catch {
      // silent
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">시스템 공지사항</h1>
          <p className="text-sm text-neutral-500 mt-0.5">총 {notices.length}건</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setModalTarget(null)}>
          새 공지 작성
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p>등록된 공지사항이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100">
              <tr className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">등록일</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900 truncate max-w-xs">{notice.title}</p>
                    <p className="text-xs text-neutral-400 truncate max-w-xs mt-0.5">{notice.content}</p>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublish(notice)}>
                      <Badge variant={notice.isPublished ? 'success' : 'neutral'}>
                        {notice.isPublished ? '게시중' : '비공개'}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{formatDate(notice.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setModalTarget(notice)}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(notice.id)}
                        disabled={deleting === notice.id}
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

      {confirmEl}
      {modalTarget !== undefined && (
        <NoticeModal
          notice={modalTarget}
          onClose={() => setModalTarget(undefined)}
          onSaved={fetchNotices}
        />
      )}
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { boAuthHeaders } from '@/lib/backoffice-auth';

interface Faq {
  id: string;
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
}

function FaqModal({
  faq,
  onClose,
  onSaved,
}: {
  faq: Faq | null; // null = 신규
  onClose: () => void;
  onSaved: () => void;
}) {
  const [question, setQuestion] = useState(faq?.question ?? '');
  const [answer, setAnswer] = useState(faq?.answer ?? '');
  const [order, setOrder] = useState(String(faq?.order ?? 0));
  const [isPublished, setIsPublished] = useState(faq?.isPublished ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!question.trim() || !answer.trim()) {
      setError('질문과 답변을 입력해주세요.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const url = faq ? `/api/backoffice/faqs/${faq.id}` : '/api/backoffice/faqs';
      const res = await fetch(url, {
        method: faq ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', ...boAuthHeaders() },
        body: JSON.stringify({ question, answer, order: Number(order) || 0, isPublished }),
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
          {faq ? 'FAQ 수정' : '새 FAQ 작성'}
        </h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">질문</label>
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="자주 묻는 질문"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">답변</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            placeholder="답변 내용"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        <div className="flex items-center gap-4">
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

          <label className="flex items-center gap-2 cursor-pointer select-none mt-5">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-primary-600"
            />
            <span className="text-sm text-neutral-700">게시 (앱 내 공개)</span>
          </label>
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

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalTarget, setModalTarget] = useState<Faq | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backoffice/faqs', { headers: boAuthHeaders() });
      if (!res.ok) throw new Error();
      setFaqs((await res.json()) as Faq[]);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  async function handleDelete(id: string) {
    if (!confirm('삭제하시겠습니까?')) return;
    setDeleting(id);
    try {
      await fetch(`/api/backoffice/faqs/${id}`, { method: 'DELETE', headers: boAuthHeaders() });
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  async function togglePublish(faq: Faq) {
    try {
      const res = await fetch(`/api/backoffice/faqs/${faq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...boAuthHeaders() },
        body: JSON.stringify({ isPublished: !faq.isPublished }),
      });
      if (!res.ok) return;
      setFaqs((prev) =>
        prev.map((f) => (f.id === faq.id ? { ...f, isPublished: !f.isPublished } : f)),
      );
    } catch {
      // silent
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">FAQ</h1>
          <p className="text-sm text-neutral-500 mt-0.5">총 {faqs.length}건 · order 오름차순 정렬</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setModalTarget(null)}>
          새 FAQ 작성
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p>등록된 FAQ가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100">
              <tr className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                <th className="px-4 py-3 w-12">순서</th>
                <th className="px-4 py-3">질문</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-neutral-400 text-center">{faq.order}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900 truncate max-w-xs">{faq.question}</p>
                    <p className="text-xs text-neutral-400 truncate max-w-xs mt-0.5">{faq.answer}</p>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublish(faq)}>
                      <Badge variant={faq.isPublished ? 'success' : 'neutral'}>
                        {faq.isPublished ? '게시중' : '비공개'}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setModalTarget(faq)}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        disabled={deleting === faq.id}
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

      {modalTarget !== undefined && (
        <FaqModal
          faq={modalTarget}
          onClose={() => setModalTarget(undefined)}
          onSaved={fetchFaqs}
        />
      )}
    </div>
  );
}

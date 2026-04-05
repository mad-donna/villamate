'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Chip } from '@/components/ui/Chip';

type Category = 'GENERAL' | 'ISSUE';

const CATEGORY_LABELS: Record<Category, string> = {
  GENERAL: '일반',
  ISSUE: '민원/문의',
};

export default function ResidentNewPostPage() {
  const router = useRouter();
  const [villaId, setVillaId] = useState('');

  const [category, setCategory] = useState<Category>('GENERAL');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villaId?: string };
    setVillaId(user.villaId ?? '');
  }, []);

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.max(100, el.scrollHeight)}px`;
  }

  function validate(): boolean {
    let valid = true;
    if (!title.trim()) {
      setTitleError('제목을 입력해주세요.');
      valid = false;
    } else {
      setTitleError('');
    }
    if (!content.trim()) {
      setContentError('내용을 입력해주세요.');
      valid = false;
    } else {
      setContentError('');
    }
    return valid;
  }

  async function handleSubmit() {
    if (!validate()) return;
    if (!villaId) {
      setSubmitError('빌라 정보를 찾을 수 없습니다.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch(`/api/villas/${villaId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          isNotice: false, // 입주민은 공지 불가
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? '등록에 실패했습니다.');
      router.push('/resident/community');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
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
        <h1 className="text-xl font-bold text-neutral-900">글쓰기</h1>
      </div>

      {/* 폼 영역 */}
      <div className="flex-1 px-4 space-y-5 overflow-y-auto pb-32">
        {/* 카테고리 칩 */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-neutral-700">카테고리</p>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
              <Chip
                key={cat}
                label={CATEGORY_LABELS[cat]}
                selected={category === cat}
                onClick={() => setCategory(cat)}
              />
            ))}
          </div>
        </div>

        {/* 제목 */}
        <Input
          label="제목"
          placeholder="제목을 입력해주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={titleError}
          maxLength={100}
        />

        {/* 내용 */}
        <Textarea
          ref={textareaRef}
          label="내용"
          placeholder="내용을 입력해주세요"
          value={content}
          onChange={handleContentChange}
          error={contentError}
          style={{ minHeight: '100px' }}
        />

        {submitError && (
          <p className="text-sm text-error-500 text-center">{submitError}</p>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-neutral-50 border-t border-neutral-100">
        <Button
          className="w-full"
          size="lg"
          loading={submitting}
          onClick={handleSubmit}
        >
          등록하기
        </Button>
      </div>
    </main>
  );
}

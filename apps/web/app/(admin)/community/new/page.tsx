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

export default function AdminNewPostPage() {
  const router = useRouter();
  const [villaId, setVillaId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [category, setCategory] = useState<Category>('GENERAL');
  const [isNotice, setIsNotice] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villa?: { id?: string }; role?: string };
    setVillaId(user.villa?.id ?? '');
    setIsAdmin(user.role === 'ADMIN');
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // textarea auto-resize
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
      let imageUrl: string | undefined;
      if (imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
        const uploadData = await uploadRes.json() as { url?: string; error?: string };
        if (!uploadRes.ok) throw new Error(uploadData.error ?? '이미지 업로드에 실패했습니다.');
        imageUrl = uploadData.url;
      }
      const token = localStorage.getItem('token') ?? '';
      const res = await fetch(`/api/villas/${villaId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          isNotice: isAdmin && isNotice,
          imageUrl,
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? '등록에 실패했습니다.');
      router.push('/community');
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

        {/* 공지 토글 (ADMIN 전용) */}
        {isAdmin && (
          <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm px-4 py-3">
            <div>
              <p className="text-sm font-medium text-neutral-800">공지로 등록</p>
              <p className="text-xs text-neutral-400 mt-0.5">공지는 최대 3개까지 등록됩니다</p>
            </div>
            <button
              type="button"
              onClick={() => setIsNotice((v) => !v)}
              className={[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                isNotice ? 'bg-primary-600' : 'bg-neutral-300',
              ].join(' ')}
              role="switch"
              aria-checked={isNotice}
            >
              <span
                className={[
                  'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
                  isNotice ? 'translate-x-6' : 'translate-x-1',
                ].join(' ')}
              />
            </button>
          </div>
        )}

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

        {/* 이미지 첨부 */}
        <div>
          <p className="text-sm font-medium text-neutral-700 mb-2">이미지 첨부 (선택)</p>
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="미리보기" className="w-full rounded-xl object-cover max-h-60" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
                aria-label="이미지 제거"
              >✕</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-neutral-200 rounded-xl py-6 flex flex-col items-center gap-2 text-neutral-400 hover:border-primary-300 hover:text-primary-500 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
              <span className="text-sm">사진 추가</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {submitError && (
          <p className="text-sm text-error-500 text-center">{submitError}</p>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pb-4 pt-3 bg-neutral-50 border-t border-neutral-100">
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

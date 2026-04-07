'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Chip } from '@/components/ui/Chip';

type TicketCategory = 'COMMON_FACILITY' | 'PARKING' | 'NOISE_COMPLAINT' | 'ETC';

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  COMMON_FACILITY: '공용시설',
  PARKING: '주차',
  NOISE_COMPLAINT: '소음',
  ETC: '기타',
};

export default function NewTicketPage() {
  const router = useRouter();
  const [villaId, setVillaId] = useState('');

  const [category, setCategory] = useState<TicketCategory>('COMMON_FACILITY');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villaId?: string };
    setVillaId(user.villaId ?? '');
  }, []);

  function handleDescriptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDescription(e.target.value);
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
    if (!description.trim()) {
      setDescriptionError('내용을 입력해주세요.');
      valid = false;
    } else {
      setDescriptionError('');
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
      const res = await fetch(`/api/villas/${villaId}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? '접수에 실패했습니다.');
      router.push('/villa/tickets');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '접수에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
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
        <h1 className="text-xl font-bold text-neutral-900">민원 접수</h1>
      </div>

      <div className="flex-1 px-4 space-y-5 overflow-y-auto pb-32">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-neutral-700">카테고리</p>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(CATEGORY_LABELS) as TicketCategory[]).map((cat) => (
              <Chip
                key={cat}
                label={CATEGORY_LABELS[cat]}
                selected={category === cat}
                onClick={() => setCategory(cat)}
              />
            ))}
          </div>
        </div>

        <Input
          label="제목"
          placeholder="민원 제목을 입력해주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={titleError}
          maxLength={100}
        />

        <Textarea
          ref={textareaRef}
          label="내용"
          placeholder="불편하신 사항을 자세히 적어주세요"
          value={description}
          onChange={handleDescriptionChange}
          error={descriptionError}
          style={{ minHeight: '100px' }}
        />

        {submitError && (
          <p className="text-sm text-error-500 text-center">{submitError}</p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-neutral-50 border-t border-neutral-100">
        <Button
          className="w-full"
          size="lg"
          loading={submitting}
          onClick={handleSubmit}
        >
          접수하기
        </Button>
      </div>
    </main>
  );
}

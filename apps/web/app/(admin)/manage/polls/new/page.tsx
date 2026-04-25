'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { apiFetch } from '@/lib/client-api';

export default function AdminNewPollPage() {
  const router = useRouter();
  const [villaId, setVillaId] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [options, setOptions] = useState(['', '']);

  const [titleError, setTitleError] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const [optionsError, setOptionsError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villa?: { id?: string } };
    setVillaId(user.villa?.id ?? '');
  }, []);

  function handleOptionChange(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function addOption() {
    if (options.length >= 10) return;
    setOptions((prev) => [...prev, '']);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): boolean {
    let valid = true;
    if (!title.trim()) { setTitleError('제목을 입력해주세요.'); valid = false; } else { setTitleError(''); }
    if (!endDate) { setEndDateError('종료일을 선택해주세요.'); valid = false; }
    else if (new Date(endDate) <= new Date()) { setEndDateError('종료일은 현재 시간 이후여야 합니다.'); valid = false; }
    else { setEndDateError(''); }
    const valid_opts = options.map((o) => o.trim()).filter(Boolean);
    if (valid_opts.length < 2) { setOptionsError('선택지를 2개 이상 입력해주세요.'); valid = false; } else { setOptionsError(''); }
    return valid;
  }

  async function handleSubmit() {
    if (!validate() || !villaId) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await apiFetch(`/api/villas/${villaId}/polls`, {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          isAnonymous,
          endDate: new Date(endDate).toISOString(),
          options: options.map((o) => o.trim()).filter(Boolean),
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? '투표 생성에 실패했습니다.');
      router.push('/manage/polls');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '투표 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  // 최소 날짜: 내일
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

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
        <h1 className="text-xl font-bold text-neutral-900">투표 생성</h1>
      </div>

      <div className="flex-1 px-4 space-y-5 overflow-y-auto pb-32">
        <Input
          label="제목"
          placeholder="투표 제목을 입력해주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={titleError}
          maxLength={100}
        />

        <Textarea
          label="설명 (선택)"
          placeholder="투표에 대한 설명을 입력해주세요"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ minHeight: '80px' }}
        />

        {/* 선택지 */}
        <div>
          <p className="text-sm font-medium text-neutral-700 mb-2">선택지</p>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  placeholder={`선택지 ${i + 1}`}
                  maxLength={100}
                  className="flex-1 text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-400 transition-colors"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center text-neutral-400 hover:text-error-500 transition-colors"
                    aria-label="선택지 삭제"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          {optionsError && <p className="text-xs text-error-500 mt-1">{optionsError}</p>}
          {options.length < 10 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 text-sm text-primary-600 font-medium flex items-center gap-1 hover:text-primary-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              선택지 추가
            </button>
          )}
        </div>

        {/* 종료일 */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">종료일</label>
          <input
            type="datetime-local"
            value={endDate}
            min={minDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-400 transition-colors"
          />
          {endDateError && <p className="text-xs text-error-500 mt-1">{endDateError}</p>}
        </div>

        {/* 익명 여부 */}
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm px-4 py-3">
          <div>
            <p className="text-sm font-medium text-neutral-800">익명 투표</p>
            <p className="text-xs text-neutral-400 mt-0.5">켜면 투표 결과에 호수가 표시되지 않습니다</p>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous((v) => !v)}
            className={[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none',
              isAnonymous ? 'bg-primary-600' : 'bg-neutral-300',
            ].join(' ')}
            role="switch"
            aria-checked={isAnonymous}
          >
            <span className={['inline-block h-4 w-4 rounded-full bg-white shadow transition-transform', isAnonymous ? 'translate-x-6' : 'translate-x-1'].join(' ')} />
          </button>
        </div>

        {submitError && <p className="text-sm text-error-500 text-center">{submitError}</p>}
      </div>

      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pb-4 pt-3 bg-neutral-50 border-t border-neutral-100">
        <Button className="w-full" size="lg" loading={submitting} onClick={handleSubmit}>
          투표 생성하기
        </Button>
      </div>
    </main>
  );
}

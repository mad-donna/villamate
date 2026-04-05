'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';

interface AgreementItem {
  key: string;
  label: string;
  required: boolean;
}

const AGREEMENTS: AgreementItem[] = [
  { key: 'terms', label: '이용약관 동의', required: true },
  { key: 'privacy', label: '개인정보 처리방침 동의', required: true },
  { key: 'marketing', label: '마케팅 정보 수신 동의', required: false },
];

export default function AgreementPage() {
  const router = useRouter();

  const [checked, setChecked] = useState<Record<string, boolean>>({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const allChecked = Object.values(checked).every(Boolean);
  const requiredChecked = AGREEMENTS.filter((a) => a.required).every(
    (a) => checked[a.key],
  );

  function toggleAll() {
    const next = !allChecked;
    setChecked({ terms: next, privacy: next, marketing: next });
  }

  function toggle(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleNext() {
    sessionStorage.setItem(
      'agreementDone',
      JSON.stringify({
        terms: checked.terms,
        privacy: checked.privacy,
        marketing: checked.marketing,
      }),
    );
    router.push('/signup/profile');
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col px-4 pt-12 pb-8">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col">
        {/* 타이틀 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 whitespace-pre-line leading-snug">
            {'서비스 이용을 위해\n약관에 동의해주세요'}
          </h1>
        </div>

        {/* 약관 카드 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* 전체 동의 */}
          <button
            type="button"
            onClick={toggleAll}
            className="w-full flex items-center gap-3 px-4 py-4 min-h-[44px] hover:bg-neutral-50 transition-colors"
          >
            <Checkbox checked={allChecked} />
            <span className="text-base font-bold text-neutral-900">
              전체 동의
            </span>
          </button>

          <div className="h-px bg-neutral-100 mx-4" />

          {/* 개별 항목 */}
          {AGREEMENTS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => toggle(item.key)}
              className="w-full flex items-center gap-3 px-4 py-3.5 min-h-[44px] hover:bg-neutral-50 transition-colors"
            >
              <Checkbox checked={checked[item.key]} />
              <span className="text-sm text-neutral-700 flex-1 text-left">
                {item.label}
                {item.required ? (
                  <span className="text-error-500 ml-1">(필수)</span>
                ) : (
                  <span className="text-neutral-400 ml-1">(선택)</span>
                )}
              </span>
            </button>
          ))}
        </div>

        {/* 다음 버튼 */}
        <div className="mt-auto pt-8">
          <Button
            variant="primary"
            size="lg"
            disabled={!requiredChecked}
            onClick={handleNext}
            className="w-full"
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={[
        'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
        checked
          ? 'bg-primary-600 border-primary-600'
          : 'bg-white border-neutral-300',
      ].join(' ')}
    >
      {checked && (
        <svg
          viewBox="0 0 12 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-2.5"
        >
          <path
            d="M1 5l3.5 3.5L11 1"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

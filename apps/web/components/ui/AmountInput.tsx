'use client';

import { useId, useState, useEffect } from 'react';
import { getAmountStep } from '@/lib/amount-step';

interface AmountInputProps {
  label?: string;
  /** 원시 숫자 문자열 (쉼표 없음). 예: "150000" */
  value: string;
  /** 원시 숫자 문자열로 콜백 */
  onChange: (raw: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  /** localStorage 단위 대신 고정 단위 사용 */
  stepOverride?: number;
  min?: number;
}

export function AmountInput({
  label,
  value,
  onChange,
  placeholder = '0',
  error,
  helperText,
  stepOverride,
  min = 0,
}: AmountInputProps) {
  const inputId = useId();
  const [step, setStep] = useState(10000);

  useEffect(() => {
    setStep(stepOverride ?? getAmountStep());
  }, [stepOverride]);

  function handleMinus() {
    const current = Number(value) || 0;
    const next = Math.max(min, current - step);
    onChange(String(next));
  }

  function handlePlus() {
    const current = Number(value) || 0;
    onChange(String(current + step));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    onChange(raw);
  }

  const displayValue = value ? Number(value).toLocaleString('ko-KR') : '';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleMinus}
          aria-label={`${step.toLocaleString('ko-KR')}원 감소`}
          className="w-11 h-11 flex-shrink-0 rounded-xl border border-neutral-200 bg-white text-neutral-600 text-xl font-bold hover:bg-neutral-50 active:bg-neutral-100 transition-colors flex items-center justify-center select-none"
        >
          −
        </button>
        <div className="relative flex-1">
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={[
              'w-full h-11 rounded-xl border px-4 pr-10 text-sm text-neutral-900 placeholder-neutral-400 bg-white',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors',
              error
                ? 'border-error-500 focus:ring-error-500 focus:border-error-500'
                : 'border-neutral-200',
            ].join(' ')}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400 pointer-events-none">
            원
          </span>
        </div>
        <button
          type="button"
          onClick={handlePlus}
          aria-label={`${step.toLocaleString('ko-KR')}원 증가`}
          className="w-11 h-11 flex-shrink-0 rounded-xl border border-neutral-200 bg-white text-neutral-600 text-xl font-bold hover:bg-neutral-50 active:bg-neutral-100 transition-colors flex items-center justify-center select-none"
        >
          +
        </button>
      </div>
      <p className="text-xs text-neutral-400">
        버튼 단위: {step.toLocaleString('ko-KR')}원 (프로필에서 변경 가능)
      </p>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-error-500" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="text-xs text-neutral-500">
          {helperText}
        </p>
      )}
    </div>
  );
}

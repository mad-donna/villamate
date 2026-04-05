'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { saveToken, saveUser, type StoredUser } from '@/lib/client-auth';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export default function ProfilePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // 약관 동의 완료 여부 확인
  useEffect(() => {
    const done = sessionStorage.getItem('agreementDone');
    if (!done) {
      router.replace('/signup/agreement');
    }
  }, [router]);

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = '이름을 입력해주세요.';
    if (!email.trim()) errors.email = '이메일을 입력해주세요.';
    if (password.length < 8) errors.password = '비밀번호는 8자 이상이어야 합니다.';
    if (password !== passwordConfirm)
      errors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);

    try {
      const agreementRaw = sessionStorage.getItem('agreementDone');
      const agreement = agreementRaw ? JSON.parse(agreementRaw) : {};

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone || undefined,
          termsAgreed: agreement.terms ?? true,
          marketingAgreed: agreement.marketing ?? false,
          role: 'RESIDENT',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError('이미 가입된 이메일입니다. 로그인해주세요.');
        } else {
          setError(data.error ?? '회원가입에 실패했습니다.');
        }
        return;
      }

      const { token, user } = data as { token: string; user: StoredUser };
      saveToken(token);
      saveUser(user);
      sessionStorage.removeItem('agreementDone');

      router.push('/select-role');
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    name.trim() && email.trim() && password && passwordConfirm && !loading;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col px-4 pt-12 pb-8">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col">
        {/* 타이틀 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 whitespace-pre-line leading-snug">
            {'기본 정보를\n입력해주세요'}
          </h1>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="이름"
            placeholder="홍길동"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
            required
          />

          <Input
            label="이메일"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            autoComplete="email"
            required
          />

          <Input
            label="비밀번호"
            type="password"
            placeholder="8자 이상 입력해주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            autoComplete="new-password"
            required
          />

          <Input
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호를 다시 입력해주세요"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            error={fieldErrors.passwordConfirm}
            autoComplete="new-password"
            required
          />

          <Input
            label="전화번호 (선택)"
            type="tel"
            placeholder="010-0000-0000"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            inputMode="numeric"
          />

          {error && (
            <p className="text-sm text-error-500 mt-1">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!canSubmit}
            className="w-full mt-2"
          >
            {loading ? '처리 중...' : '가입 완료'}
          </Button>
        </form>
      </div>
    </div>
  );
}

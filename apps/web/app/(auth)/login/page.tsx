'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { saveToken, saveUser, type StoredUser } from '@/lib/client-auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) setError(decodeURIComponent(err));
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? '이메일 또는 비밀번호를 확인해주세요.');
        return;
      }

      const { token, user } = data as { token: string; user: StoredUser };
      saveToken(token);
      saveUser(user);

      if (user.role === 'SUPER_ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/home');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col px-4 pt-12 pb-8">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col">
        {/* 로고 */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-3xl">🏘</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">빌라메이트</h1>
          <p className="text-sm text-neutral-500 mt-1">스마트 빌라 관리 플랫폼</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="이메일"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <Input
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="text-sm text-error-500 mt-1">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!email || !password}
            className="w-full mt-2"
          >
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        {/* 구분선 */}
        <div className="flex items-center gap-3 mt-6">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs text-neutral-400">또는</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        {/* 소셜 로그인 */}
        <div className="flex flex-col gap-3 mt-4">
          <a
            href="/api/auth/oauth/kakao"
            className="flex items-center justify-center gap-2.5 w-full h-12 rounded-xl bg-[#FEE500] text-[#191919] font-semibold text-sm hover:brightness-95 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M9 1C4.582 1 1 3.918 1 7.5c0 2.27 1.365 4.258 3.434 5.44L3.75 17l4.23-2.787A9.3 9.3 0 0 0 9 14c4.418 0 8-2.918 8-6.5S13.418 1 9 1Z" fill="#191919"/>
            </svg>
            카카오로 시작하기
          </a>
          <a
            href="/api/auth/oauth/google"
            className="flex items-center justify-center gap-2.5 w-full h-12 rounded-xl bg-white border border-neutral-200 text-neutral-800 font-semibold text-sm hover:bg-neutral-50 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Google로 시작하기
          </a>
        </div>

        {/* 회원가입 링크 */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          계정이 없으신가요?{' '}
          <Link
            href="/signup/agreement"
            className="text-primary-600 font-semibold hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50" />}>
      <LoginForm />
    </Suspense>
  );
}

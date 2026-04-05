'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { saveToken, saveUser, type StoredUser } from '@/lib/client-auth';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        router.push('/backoffice/dashboard');
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

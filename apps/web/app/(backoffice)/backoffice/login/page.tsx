'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getBoUser } from '@/lib/backoffice-auth';

export default function BackofficeLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 이미 로그인된 SUPER_ADMIN이면 대시보드로 (getBoUser: try/catch 포함)
  useEffect(() => {
    if (getBoUser()) router.replace('/backoffice/dashboard');
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/backoffice/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await res.json()) as {
        token?: string;
        user?: { id: string; email: string; name: string; role: string };
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? '로그인에 실패했습니다.');
        return;
      }

      localStorage.setItem('bo_token', data.token!);
      localStorage.setItem('bo_user', JSON.stringify(data.user!));
      router.push('/backoffice/dashboard');
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-primary-600">VillaMate</span>
          <p className="text-sm text-neutral-500 mt-1">백오피스 관리자 전용</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h1 className="text-lg font-bold text-neutral-900">로그인</h1>

          <Input
            label="이메일"
            type="email"
            placeholder="관리자 이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />

          <Input
            label="비밀번호"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            로그인
          </Button>
        </form>
      </div>
    </div>
  );
}

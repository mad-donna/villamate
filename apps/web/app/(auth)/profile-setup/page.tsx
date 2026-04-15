'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { saveToken, saveUser, type StoredUser } from '@/lib/client-auth';

function ProfileSetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = searchParams.get('token') ?? '';
    setToken(t);
    // URL에서 token 제거
    if (t) router.replace('/profile-setup');
  }, [searchParams, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('이름은 2자 이상 입력해주세요.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('올바른 이메일을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/social-complete', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), email, phone: phone.trim() || undefined }),
      });
      const data = await res.json() as { token?: string; user?: StoredUser; error?: string };
      if (!res.ok) {
        setError(data.error ?? '프로필 저장에 실패했습니다.');
        return;
      }
      saveToken(data.token!);
      saveUser(data.user!);
      router.push('/select-role');
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col px-4 pt-12 pb-8">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 leading-snug">
            프로필을 입력해주세요
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            서비스 이용을 위해 기본 정보가 필요합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="이름"
            placeholder="홍길동"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="이메일"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="전화번호 (선택)"
            type="tel"
            placeholder="010-0000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {error && <p className="text-sm text-error-500">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!name || !email}
            className="w-full mt-2"
          >
            시작하기
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50" />}>
      <ProfileSetupForm />
    </Suspense>
  );
}

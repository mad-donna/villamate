'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveToken, saveUser, type StoredUser } from '@/lib/client-auth';

function SocialAuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = searchParams.get('next') ?? '/home';

    // HttpOnly 쿠키에 담긴 JWT를 exchange-token 엔드포인트로 수령
    fetch('/api/auth/exchange-token')
      .then((r) => {
        if (!r.ok) throw new Error('token not found');
        return r.json();
      })
      .then(async (data: { token?: string; error?: string }) => {
        const token = data.token;
        if (!token) throw new Error('token missing');

        saveToken(token);

        const meRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const meData = (await meRes.json()) as { user?: StoredUser };
        if (meData.user) saveUser(meData.user);

        if (next === '/profile-setup') {
          router.replace(`/profile-setup?token=${encodeURIComponent(token)}`);
        } else {
          router.replace(next);
        }
      })
      .catch(() => router.replace('/login?error=소셜+로그인에+실패했습니다.'));
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function SocialAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SocialAuthHandler />
    </Suspense>
  );
}

'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveToken, saveUser, type StoredUser } from '@/lib/client-auth';

function SocialAuthHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const next = searchParams.get('next') ?? '/home';

    if (!token) {
      router.replace('/login?error=소셜+로그인에+실패했습니다.');
      return;
    }

    // token을 저장하고 사용자 정보 조회
    saveToken(token);

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: { user?: StoredUser; error?: string }) => {
        if (data.user) {
          saveUser(data.user);
        }
        // profile-setup은 token을 쿼리로 전달 (API 호출에 사용)
        if (next === '/profile-setup') {
          router.replace(`/profile-setup?token=${encodeURIComponent(token)}`);
        } else {
          router.replace(next);
        }
      })
      .catch(() => router.replace(next));
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

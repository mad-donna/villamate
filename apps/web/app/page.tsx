'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { getToken, getUser } from '@/lib/client-auth';

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setChecking(false);
      return;
    }

    const user = getUser();
    if (!user) {
      setChecking(false);
      return;
    }

    if (user.role === 'SUPER_ADMIN') {
      router.replace('/dashboard');
    } else if (user.role === 'RESIDENT') {
      router.replace('/resident/home');
    } else {
      router.replace('/home');
    }
  }, [router]);

  if (checking) {
    return <div className="min-h-screen bg-neutral-50" />;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-lg mx-auto px-4">

        {/* Hero */}
        <section className="py-16 flex flex-col items-center text-center">
          <p className="text-2xl font-bold text-primary-600 mb-6">빌라메이트</p>
          <h1 className="text-3xl font-bold text-neutral-900 leading-tight mb-4">
            카카오톡 단톡방 말고,<br />빌라 전용 관리 앱
          </h1>
          <p className="text-neutral-500 mb-10">
            관리비 청구부터 전자투표까지,<br />동대표의 월말 야근을 없애드립니다.
          </p>
          <div className="w-full flex flex-col gap-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => router.push('/signup')}
            >
              동대표로 시작하기
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => router.push('/join')}
            >
              초대코드로 입주민 가입
            </Button>
          </div>
        </section>

        {/* 문제 정의 */}
        <section className="py-12">
          <h2 className="text-xl font-bold text-neutral-900 mb-6 text-center">
            빌라 관리, 이런 문제 있으셨나요?
          </h2>
          <div className="flex flex-col gap-4">
            {[
              {
                emoji: '🗨️',
                text: '카카오톡 단톡방으로 관리비 공지, 이미지가 묻혀버려요',
              },
              {
                emoji: '📒',
                text: '수기 장부에 영수증 분실, 회계 투명성 논란',
              },
              {
                emoji: '⏰',
                text: '월말마다 관리비 수납 독촉, 반복되는 감정 소모',
              },
            ].map(({ emoji, text }) => (
              <div
                key={text}
                className="bg-white rounded-2xl shadow-sm p-5 flex items-start gap-4"
              >
                <span className="text-2xl">{emoji}</span>
                <p className="text-neutral-700 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 핵심 기능 */}
        <section className="py-12">
          <h2 className="text-xl font-bold text-neutral-900 mb-6 text-center">
            빌라메이트가 해결합니다
          </h2>
          <div className="flex flex-col gap-4">
            {[
              {
                emoji: '💳',
                title: '관리비 청구·납부',
                desc: '1/N 자동 계산, 앱으로 납부까지',
              },
              {
                emoji: '🗳️',
                title: '전자투표',
                desc: '시간·장소 없이 안건 처리',
              },
              {
                emoji: '🏢',
                title: '건물 이력',
                desc: '수리·점검 이력 영구 기록',
              },
            ].map(({ emoji, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4"
              >
                <span className="text-3xl">{emoji}</span>
                <div>
                  <p className="font-semibold text-neutral-900">{title}</p>
                  <p className="text-sm text-neutral-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 하단 CTA */}
        <section className="py-12 flex flex-col items-center text-center">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">
            지금 바로 우리 빌라에 도입하세요
          </h2>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => router.push('/signup')}
          >
            무료로 시작하기
          </Button>
          <p className="text-sm text-neutral-400 mt-4">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-primary-600 font-semibold hover:underline">
              로그인
            </Link>
          </p>
        </section>

      </div>
    </div>
  );
}

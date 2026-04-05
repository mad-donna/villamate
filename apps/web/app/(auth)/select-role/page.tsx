'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { getUser, saveUser, type StoredUser } from '@/lib/client-auth';

type Role = 'ADMIN' | 'RESIDENT';

interface RoleCard {
  role: Role;
  icon: string;
  title: string;
  description: string;
  features: string;
}

const ROLE_CARDS: RoleCard[] = [
  {
    role: 'ADMIN',
    icon: '🏢',
    title: '동대표',
    description: '빌라를 직접 관리하고 운영합니다',
    features: '청구서 발행·미납 독촉·입주민 관리',
  },
  {
    role: 'RESIDENT',
    icon: '🏠',
    title: '입주민',
    description: '관리비 납부 및 커뮤니티에 참여합니다',
    features: '관리비 조회·납부·투표 참여',
  },
];

export default function SelectRolePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Role | null>(null);

  function handleNext() {
    if (!selected) return;

    // 로컬 스토리지의 user.role을 선택한 역할로 업데이트 (UI 목적)
    const user = getUser();
    if (user) {
      saveUser({ ...user, role: selected } as StoredUser);
    }

    if (selected === 'ADMIN') {
      router.push('/onboarding');
    } else {
      router.push('/join');
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col px-4 pt-12 pb-8">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col">
        {/* 타이틀 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 whitespace-pre-line leading-snug">
            {'어떤 역할로\n사용하시겠어요?'}
          </h1>
        </div>

        {/* 역할 카드 */}
        <div className="flex flex-col gap-4">
          {ROLE_CARDS.map((card) => {
            const isSelected = selected === card.role;
            return (
              <button
                key={card.role}
                type="button"
                onClick={() => setSelected(card.role)}
                className={[
                  'text-left rounded-2xl p-5 transition-all',
                  isSelected
                    ? 'border-2 border-primary-600 bg-primary-50'
                    : 'border border-neutral-200 bg-white',
                ].join(' ')}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl leading-none mt-0.5">
                    {card.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={[
                        'text-lg font-bold mb-1',
                        isSelected ? 'text-primary-700' : 'text-neutral-900',
                      ].join(' ')}
                    >
                      {card.title}
                    </p>
                    <p className="text-sm text-neutral-600 mb-2">
                      {card.description}
                    </p>
                    <p
                      className={[
                        'text-xs font-medium',
                        isSelected ? 'text-primary-600' : 'text-neutral-400',
                      ].join(' ')}
                    >
                      {card.features}
                    </p>
                  </div>

                  {/* 선택 인디케이터 */}
                  <span
                    className={[
                      'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors',
                      isSelected
                        ? 'border-primary-600 bg-primary-600'
                        : 'border-neutral-300 bg-white',
                    ].join(' ')}
                    aria-hidden="true"
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* 다음 버튼 */}
        <div className="mt-auto pt-8">
          <Button
            variant="primary"
            size="lg"
            disabled={!selected}
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

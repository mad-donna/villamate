'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser, clearAuth, hasDualMode, getViewMode, setViewMode, type StoredUser } from '@/lib/client-auth';
import { getAmountStep, setAmountStep, PRESET_STEPS } from '@/lib/amount-step';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface SectionItem {
  label: string;
  href?: string;
  onClick?: () => void;
  destructive?: boolean;
  rightLabel?: string;
}

interface Section {
  title: string;
  items: SectionItem[];
}

function ProfileAvatar({ name }: { name: string }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';
  return (
    <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold">
      {initial}
    </div>
  );
}

function ChangePasswordSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function reset() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setLoading(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (newPassword.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? '비밀번호 변경에 실패했습니다.');
        return;
      }
      alert('비밀번호가 변경되었습니다.');
      handleClose();
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">비밀번호 변경</h2>
          <button
            onClick={handleClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-400 hover:text-neutral-600 text-xl leading-none"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <Input
          label="현재 비밀번호"
          type="password"
          placeholder="현재 비밀번호 입력"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          label="새 비밀번호"
          type="password"
          placeholder="8자 이상"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          label="새 비밀번호 확인"
          type="password"
          placeholder="새 비밀번호 재입력"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={error}
        />

        <Button className="w-full" loading={loading} onClick={handleSubmit}>
          변경하기
        </Button>
      </div>
    </div>
  );
}

function AmountStepSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<number>(10000);
  const [custom, setCustom] = useState('');
  const [customMode, setCustomMode] = useState(false);

  useEffect(() => {
    if (open) {
      const saved = getAmountStep();
      const isPreset = PRESET_STEPS.includes(saved as (typeof PRESET_STEPS)[number]);
      if (isPreset) {
        setSelected(saved);
        setCustomMode(false);
        setCustom('');
      } else {
        setCustomMode(true);
        setCustom(String(saved));
        setSelected(0);
      }
    }
  }, [open]);

  function handleSave() {
    const step = customMode ? Number(custom.replace(/[^0-9]/g, '')) : selected;
    if (!step || step <= 0) return;
    setAmountStep(step);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">금액 단위 설정</h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-400 hover:text-neutral-600 text-xl leading-none"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-neutral-500">
          금액 입력 시 +/− 버튼으로 조정되는 단위를 설정합니다.
        </p>

        <div className="grid grid-cols-3 gap-2">
          {PRESET_STEPS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setSelected(s); setCustomMode(false); }}
              className={[
                'py-3 rounded-xl border text-sm font-semibold transition-colors',
                !customMode && selected === s
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50',
              ].join(' ')}
            >
              {s.toLocaleString('ko-KR')}원
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setCustomMode(true); setSelected(0); }}
            className={[
              'py-3 rounded-xl border text-sm font-semibold transition-colors',
              customMode
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50',
            ].join(' ')}
          >
            직접 입력
          </button>
        </div>

        {customMode && (
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={custom ? Number(custom.replace(/[^0-9]/g, '') || '0').toLocaleString('ko-KR') : ''}
              onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="금액 단위 입력"
              className="w-full rounded-xl border border-neutral-200 px-4 h-11 pr-10 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">원</span>
          </div>
        )}

        <Button className="w-full" onClick={handleSave}>
          저장
        </Button>
      </div>
    </div>
  );
}

function SectionList({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="text-xs text-neutral-500 uppercase tracking-wider px-4 py-2">
            {section.title}
          </p>
          <div className="bg-white divide-y divide-neutral-100">
            {section.items.map((item) => {
              const baseClass = [
                'flex items-center justify-between px-4 py-4 min-h-[44px] border-b border-neutral-100',
                item.destructive
                  ? 'text-error-500'
                  : 'text-neutral-900',
              ].join(' ');

              if (item.href) {
                return (
                  <Link key={item.label} href={item.href} className={baseClass}>
                    <span className="text-sm font-medium">{item.label}</span>
                    <div className="flex items-center gap-2">
                      {item.rightLabel && (
                        <span className="text-xs text-neutral-400">
                          {item.rightLabel}
                        </span>
                      )}
                      <span className="text-neutral-300 text-lg">›</span>
                    </div>
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={[baseClass, 'w-full text-left'].join(' ')}
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.rightLabel && (
                    <span className="text-xs text-neutral-400">
                      {item.rightLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ResidentProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [passwordSheetOpen, setPasswordSheetOpen] = useState(false);
  const [amountStepSheetOpen, setAmountStepSheetOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(10000);
  const [showAdminSwitch, setShowAdminSwitch] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    setUser(getUser());
    // ADMIN이 입주민 모드로 전환 중인 경우에만 동대표 복귀 버튼 표시
    setShowAdminSwitch(hasDualMode() && getViewMode() === 'resident');
    setCurrentStep(getAmountStep());
  }, []);

  function handleLogout() {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    clearAuth();
    router.push('/login');
  }

  function handleSwitchToAdmin() {
    setViewMode('admin');
    router.push('/home');
  }

  async function handleWithdraw() {
    const confirmed = confirm(
      '정말 탈퇴하시겠습니까?\n계정 정보가 익명화되며 이 작업은 되돌릴 수 없습니다.',
    );
    if (!confirmed) return;
    setWithdrawing(true);
    try {
      const token = localStorage.getItem('token') ?? '';
      const res = await fetch('/api/auth/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        alert(data.error ?? '탈퇴에 실패했습니다.');
        return;
      }
      clearAuth();
      router.push('/login');
    } catch {
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setWithdrawing(false);
    }
  }

  const sections: Section[] = [
    {
      title: '계정',
      items: [
        {
          label: '비밀번호 변경',
          onClick: () => setPasswordSheetOpen(true),
        },
        {
          label: '금액 단위 설정',
          rightLabel: `${currentStep.toLocaleString('ko-KR')}원`,
          onClick: () => setAmountStepSheetOpen(true),
        },
        {
          label: '내 게시글',
          href: '/profile/my-posts',
        },
        {
          label: '알림',
          href: '/profile/notifications',
        },
        {
          label: '내 차량 관리',
          href: '/profile/vehicles',
        },
      ],
    },
    {
      title: '앱 정보',
      items: [
        {
          label: '앱 이용 가이드',
          href: '/resident/guide',
        },
        {
          label: '고객센터 · FAQ',
          href: '/resident/support',
        },
      ],
    },
    {
      title: '계정 관리',
      items: [
        {
          label: '로그아웃',
          destructive: true,
          onClick: handleLogout,
        },
        {
          label: withdrawing ? '처리 중...' : '회원 탈퇴',
          destructive: true,
          onClick: handleWithdraw,
        },
      ],
    },
  ];

  return (
    <main className="pt-6 pb-10">
      {/* 아바타 + 사용자 정보 */}
      <div className="flex flex-col items-center gap-3 px-4 mb-8">
        <ProfileAvatar name={user?.name ?? '?'} />
        <div className="text-center">
          <p className="text-lg font-bold text-neutral-900">{user?.name ?? '-'}</p>
          <p className="text-sm text-neutral-500">{user?.email ?? '-'}</p>
          <span className="inline-block mt-1 text-xs bg-neutral-100 text-neutral-600 font-medium rounded-full px-3 py-0.5">
            입주민
          </span>
        </div>
      </div>

      {/* 듀얼 모드 전환 — ADMIN이 입주민 모드로 접속 중인 경우에만 표시 */}
      {showAdminSwitch && (
        <div className="px-4 mb-6">
          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-800">동대표 모드</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {user?.villa?.name}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSwitchToAdmin}
              className="text-sm font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-xl px-4 py-2 min-h-[40px] hover:bg-neutral-100 transition-colors"
            >
              전환
            </button>
          </div>
        </div>
      )}

      <SectionList sections={sections} />

      <ChangePasswordSheet
        open={passwordSheetOpen}
        onClose={() => setPasswordSheetOpen(false)}
      />
      <AmountStepSheet
        open={amountStepSheetOpen}
        onClose={() => {
          setAmountStepSheetOpen(false);
          setCurrentStep(getAmountStep());
        }}
      />
    </main>
  );
}

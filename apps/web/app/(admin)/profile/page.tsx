'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUser, clearAuth, hasDualMode, setViewMode, type StoredUser } from '@/lib/client-auth';
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

export default function AdminProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [passwordSheetOpen, setPasswordSheetOpen] = useState(false);
  const [dualMode, setDualMode] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setDualMode(hasDualMode());
  }, []);

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

  function handleLogout() {
    if (!confirm('로그아웃 하시겠습니까?')) return;
    clearAuth();
    router.push('/login');
  }

  function handleSwitchToResident() {
    setViewMode('resident');
    router.push('/villa');
  }

  const inviteCode = user?.villa?.inviteCode ?? '-';

  const sections: Section[] = [
    {
      title: '빌라 정보',
      items: [
        {
          label: '초대 코드 보기',
          rightLabel: inviteCode,
          onClick: () => alert(`초대 코드: ${inviteCode}`),
        },
        {
          label: '구독 관리',
          href: '/profile/subscription',
        },
        {
          label: '내 빌라 목록',
          href: '/profile/my-villas',
        },
        {
          label: '동대표 교체',
          href: '/profile/transfer-admin',
        },
      ],
    },
    {
      title: '계정',
      items: [
        {
          label: '비밀번호 변경',
          onClick: () => setPasswordSheetOpen(true),
        },
        {
          label: '알림',
          href: '/profile/notifications',
        },
      ],
    },
    {
      title: '앱 정보',
      items: [
        {
          label: '이용 가이드',
          href: '/profile/guide',
        },
        {
          label: '고객센터',
          onClick: () => alert('고객센터: support@villamate.kr'),
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
          <span className="inline-block mt-1 text-xs bg-primary-50 text-primary-700 font-medium rounded-full px-3 py-0.5">
            관리자
          </span>
        </div>
      </div>

      {/* 듀얼 모드 전환 — ADMIN이 입주민으로도 등록된 경우에만 표시 */}
      {dualMode && (
        <div className="px-4 mb-6">
          <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-primary-800">입주민 모드</p>
              <p className="text-xs text-primary-600 mt-0.5">
                {user?.residentVilla?.name} {user?.residentVilla?.roomNumber}호
              </p>
            </div>
            <button
              type="button"
              onClick={handleSwitchToResident}
              className="text-sm font-semibold text-primary-700 bg-white border border-primary-300 rounded-xl px-4 py-2 min-h-[40px] hover:bg-primary-50 transition-colors"
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
    </main>
  );
}

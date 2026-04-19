'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getUser, saveUser, type StoredUser } from '@/lib/client-auth';

type Tab = 'invite' | 'search';

interface VillaResult {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
}

export default function JoinPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('invite');

  // --- 초대 코드 탭 상태 ---
  const [inviteCode, setInviteCode] = useState('');
  const [inviteRoomNumber, setInviteRoomNumber] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  // --- 빌라 검색 탭 상태 ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VillaResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedVilla, setSelectedVilla] = useState<VillaResult | null>(null);
  const [searchRoomNumber, setSearchRoomNumber] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);

  // =====================
  // 초대 코드 탭 핸들러
  // =====================

  function handleInviteCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    // 대문자 자동 변환, 6자 제한
    const value = e.target.value.toUpperCase().slice(0, 6);
    setInviteCode(value);
  }

  async function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInviteError('');

    if (inviteCode.length !== 6) {
      setInviteError('초대 코드 6자리를 입력해주세요.');
      return;
    }
    if (!inviteRoomNumber.trim()) {
      setInviteError('호수를 입력해주세요.');
      return;
    }

    setInviteLoading(true);

    try {
      const res = await fetch('/api/villas/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode,
          roomNumber: inviteRoomNumber.trim(),
        }),
      });

      const data = await res.json() as {
        error?: string;
        villa?: {
          id: string;
          name: string;
          address: string;
          inviteCode: string;
          subscriptionStatus?: string;
        };
        roomNumber?: string;
        autoApproved?: boolean;
      };

      if (!res.ok) {
        if (res.status === 404) {
          setInviteError('유효하지 않은 초대 코드입니다.');
        } else if (res.status === 409) {
          setInviteError('이미 해당 빌라에 가입된 계정입니다.');
        } else {
          setInviteError(data.error ?? '가입에 실패했습니다.');
        }
        return;
      }

      // 가입 후 user에 villa 정보 저장
      // ADMIN이 가입하는 경우: 기존 관리 villa는 유지하고 residentVilla로 저장 (듀얼 모드)
      // RESIDENT가 가입하는 경우: villa로 저장
      const user = getUser();
      if (user && data.villa) {
        const villaData = {
          id: data.villa.id,
          name: data.villa.name,
          address: data.villa.address,
          inviteCode: data.villa.inviteCode,
          subscriptionStatus: data.villa.subscriptionStatus ?? 'ACTIVE',
        };
        if (user.role === 'ADMIN') {
          saveUser({
            ...user,
            residentVilla: {
              ...villaData,
              roomNumber: data.roomNumber ?? inviteRoomNumber.trim(),
            },
          } as StoredUser);
          // 자신의 빌라에 가입한 경우(즉시 승인) → 관리자 홈으로 이동
          if (data.autoApproved) {
            router.push('/home');
            return;
          }
        } else {
          saveUser({ ...user, villa: villaData } as StoredUser);
        }
      }

      router.push('/resident/home');
    } catch {
      setInviteError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setInviteLoading(false);
    }
  }

  const canInviteSubmit = inviteCode.length === 6 && inviteRoomNumber.trim() && !inviteLoading;

  // =====================
  // 빌라 검색 탭 핸들러
  // =====================

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchError('');
    setSelectedVilla(null);
    setSearchRoomNumber('');
    setJoinError('');

    if (!searchQuery.trim()) {
      setSearchError('검색어를 입력해주세요.');
      return;
    }

    setSearchLoading(true);

    try {
      const token = localStorage.getItem('token') ?? '';
      const res = await fetch(
        `/api/villas/search?q=${encodeURIComponent(searchQuery.trim())}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        setSearchError('검색에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      const data = await res.json() as { villas: VillaResult[] };
      setSearchResults(data.villas);

      if (data.villas.length === 0) {
        setSearchError('검색 결과가 없습니다. 다른 검색어를 사용해보세요.');
      }
    } catch {
      setSearchError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSearchLoading(false);
    }
  }

  function handleSelectVilla(villa: VillaResult) {
    setSelectedVilla(villa);
    setSearchRoomNumber('');
    setJoinError('');
  }

  async function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setJoinError('');

    if (!selectedVilla) return;
    if (!searchRoomNumber.trim()) {
      setJoinError('호수를 입력해주세요.');
      return;
    }

    setJoinLoading(true);

    try {
      const token = localStorage.getItem('token') ?? '';
      const res = await fetch(`/api/villas/${selectedVilla.id}/residents/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomNumber: searchRoomNumber.trim() }),
      });

      const data = await res.json() as { error?: string };

      if (!res.ok) {
        if (res.status === 409) {
          setJoinError('이미 해당 빌라에 가입 신청 중이거나 승인된 계정입니다.');
        } else if (res.status === 404) {
          setJoinError('빌라를 찾을 수 없습니다.');
        } else {
          setJoinError(data.error ?? '입주 신청에 실패했습니다.');
        }
        return;
      }

      setJoinSuccess(true);

      // 3초 후 /home으로 이동
      setTimeout(() => {
        router.push('/resident/home');
      }, 3000);
    } catch {
      setJoinError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setJoinLoading(false);
    }
  }

  // =====================
  // 렌더
  // =====================

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col px-4 pt-12 pb-8">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col">
        {/* 타이틀 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">빌라 가입</h1>
          <p className="text-sm text-neutral-500 mt-1">
            초대 코드가 있으면 바로 가입, 없으면 빌라를 검색해 신청하세요.
          </p>
        </div>

        {/* 탭 */}
        <div className="flex bg-neutral-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('invite')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'invite'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            초대 코드
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'search'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            빌라 검색
          </button>
        </div>

        {/* 탭 1: 초대 코드 */}
        {activeTab === 'invite' && (
          <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">
                초대 코드
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={handleInviteCodeChange}
                placeholder="XXXXXX"
                maxLength={6}
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                className="h-12 rounded-xl px-4 text-lg font-bold border border-neutral-300 bg-white tracking-[0.4em] transition-colors placeholder:text-neutral-300 placeholder:tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center"
              />
              <p className="text-xs text-neutral-500">
                {inviteCode.length}/6자리
              </p>
            </div>

            <Input
              label="호수"
              placeholder="예: 101호"
              value={inviteRoomNumber}
              onChange={(e) => setInviteRoomNumber(e.target.value)}
              required
            />

            {inviteError && (
              <p className="text-sm text-error-500 mt-1">{inviteError}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={inviteLoading}
              disabled={!canInviteSubmit}
              className="w-full mt-2"
            >
              {inviteLoading ? '처리 중...' : '가입하기'}
            </Button>
          </form>
        )}

        {/* 탭 2: 빌라 검색 */}
        {activeTab === 'search' && (
          <div className="flex flex-col gap-4">
            {/* 신청 완료 상태 */}
            {joinSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-base font-semibold text-neutral-900">
                  입주 신청이 완료됐습니다.
                </p>
                <p className="text-sm text-neutral-500">
                  관리자 승인을 기다려주세요.
                  <br />잠시 후 홈 화면으로 이동합니다.
                </p>
              </div>
            ) : (
              <>
                {/* 빌라 검색 폼 */}
                <form onSubmit={handleSearch} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="빌라 이름 또는 주소 검색"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSearchError('');
                      }}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="md"
                    loading={searchLoading}
                    disabled={!searchQuery.trim() || searchLoading}
                    className="shrink-0"
                  >
                    검색
                  </Button>
                </form>

                {searchError && (
                  <p className="text-sm text-error-500">{searchError}</p>
                )}

                {/* 검색 결과 목록 (빌라 미선택 시) */}
                {searchResults.length > 0 && !selectedVilla && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-neutral-500 font-medium">
                      검색 결과 {searchResults.length}건 — 가입할 빌라를 선택하세요
                    </p>
                    {searchResults.map((villa) => (
                      <button
                        key={villa.id}
                        type="button"
                        onClick={() => handleSelectVilla(villa)}
                        className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 hover:border-primary-300 hover:shadow transition-all"
                      >
                        <p className="font-semibold text-neutral-900 text-sm">
                          {villa.name}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {villa.address}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          총 {villa.totalUnits}세대
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {/* 선택된 빌라 + 호수 입력 */}
                {selectedVilla && (
                  <form onSubmit={handleJoinSubmit} className="flex flex-col gap-4">
                    {/* 선택된 빌라 카드 */}
                    <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-primary-900 text-sm">
                            {selectedVilla.name}
                          </p>
                          <p className="text-xs text-primary-700 mt-0.5">
                            {selectedVilla.address}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVilla(null);
                            setSearchRoomNumber('');
                            setJoinError('');
                          }}
                          className="text-primary-500 hover:text-primary-700 text-xs font-medium ml-2 shrink-0"
                        >
                          변경
                        </button>
                      </div>
                    </div>

                    <Input
                      label="호수"
                      placeholder="예: 101호"
                      value={searchRoomNumber}
                      onChange={(e) => {
                        setSearchRoomNumber(e.target.value);
                        setJoinError('');
                      }}
                      required
                    />

                    {joinError && (
                      <p className="text-sm text-error-500">{joinError}</p>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={joinLoading}
                      disabled={!searchRoomNumber.trim() || joinLoading}
                      className="w-full"
                    >
                      {joinLoading ? '신청 중...' : '입주 신청하기'}
                    </Button>
                  </form>
                )}
              </>
            )}
          </div>
        )}

        {/* 동대표로 전환 안내 */}
        <p className="text-center text-sm text-neutral-400 mt-8">
          초대 코드가 없다면?{' '}
          <button
            type="button"
            onClick={() => router.push('/onboarding')}
            className="text-primary-600 font-semibold hover:underline"
          >
            빌라 직접 등록
          </button>
        </p>
      </div>
    </div>
  );
}

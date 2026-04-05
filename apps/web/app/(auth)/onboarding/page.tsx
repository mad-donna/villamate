'use client';

import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getUser, getToken, saveToken, saveUser, type StoredUser } from '@/lib/client-auth';

const BANKS = [
  '국민은행', '신한은행', '우리은행', '하나은행', '농협은행',
  '기업은행', '카카오뱅크', '케이뱅크', '토스뱅크', 'SC제일은행',
  '부산은행', '대구은행', '경남은행', '광주은행', '전북은행', '새마을금고', '신협', '우체국',
];

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          roadAddress: string;
          jibunAddress: string;
          buildingName: string;
          zonecode: string;
        }) => void;
      }) => { open: () => void };
    };
  }
}

export default function OnboardingPage() {
  const router = useRouter();

  const [villaName, setVillaName] = useState('');
  const [address, setAddress] = useState('');
  const [totalUnits, setTotalUnits] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [rooms, setRooms] = useState<string[]>([]);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [postcodeReady, setPostcodeReady] = useState(false);

  function handleAddressSearch() {
    if (!postcodeReady || !window.daum?.Postcode) return;
    new window.daum.Postcode({
      oncomplete(data) {
        setAddress(data.roadAddress || data.jibunAddress);
        if (!villaName.trim() && data.buildingName) {
          setVillaName(data.buildingName);
        }
      },
    }).open();
  }

  function addRoom() {
    const trimmed = roomInput.trim();
    if (!trimmed) return;
    // 중복 제거
    if (rooms.includes(trimmed)) {
      setRoomInput('');
      return;
    }
    setRooms((prev) => [...prev, trimmed]);
    setRoomInput('');
  }

  function removeRoom(room: string) {
    setRooms((prev) => prev.filter((r) => r !== room));
  }

  function handleRoomKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addRoom();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!villaName.trim() || !address.trim() || !totalUnits) {
      setError('빌라 이름, 주소, 세대수는 필수 항목입니다.');
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      const res = await fetch('/api/villas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: villaName.trim(),
          address: address.trim(),
          totalUnits: parseInt(totalUnits, 10),
          roomNumbers: rooms,
          accountBank: bankName || undefined,
          accountNumber: accountNumber.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? '빌라 등록에 실패했습니다.');
        return;
      }

      // 새 토큰이 발급된 경우 저장 (역할이 ADMIN으로 승격)
      if (data.token) {
        saveToken(data.token);
      }

      // 등록된 villa 정보를 localStorage user에 저장
      const user = getUser();
      if (user) {
        saveUser({
          ...user,
          role: 'ADMIN',
          villa: {
            id: data.id,
            name: data.name,
            address: data.address,
            inviteCode: data.inviteCode,
            subscriptionStatus: data.subscriptionStatus ?? 'FREE_TRIAL',
          },
        } as StoredUser);
      }

      router.push('/home');
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = villaName.trim() && address.trim() && totalUnits && !loading;

  return (
    <>
    <Script
      src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
      strategy="lazyOnload"
      onLoad={() => setPostcodeReady(true)}
    />
    <div className="min-h-screen bg-neutral-50 flex flex-col px-4 pt-12 pb-8">
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col">
        {/* 타이틀 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">
            빌라를 등록해주세요
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            빌라 정보를 입력하면 초대 코드가 자동으로 생성됩니다.
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="빌라 이름"
            placeholder="예: 행복빌라"
            value={villaName}
            onChange={(e) => setVillaName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">
              주소 <span className="text-error-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="예: 서울시 강남구 역삼동 123-45"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="flex-1 h-12 rounded-xl px-4 text-sm border border-neutral-300 bg-white transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="button"
                onClick={handleAddressSearch}
                disabled={!postcodeReady}
                className="h-12 px-4 rounded-xl text-sm font-semibold bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0 whitespace-nowrap"
              >
                주소 검색
              </button>
            </div>
          </div>

          <Input
            label="총 세대수"
            type="number"
            placeholder="예: 12"
            value={totalUnits}
            onChange={(e) => setTotalUnits(e.target.value)}
            min="1"
            required
          />

          {/* 세대 호수 입력 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">
              세대 호수
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="예: 101호"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                onKeyDown={handleRoomKeyDown}
                className="flex-1 h-12 rounded-xl px-4 text-sm border border-neutral-300 bg-white transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="button"
                onClick={addRoom}
                disabled={!roomInput.trim()}
                className="h-12 px-4 rounded-xl text-sm font-semibold bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                추가
              </button>
            </div>

            {/* 호수 칩 목록 */}
            {rooms.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {rooms.map((room) => (
                  <span
                    key={room}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-sm text-primary-700 font-medium"
                  >
                    {room}
                    <button
                      type="button"
                      onClick={() => removeRoom(room)}
                      aria-label={`${room} 제거`}
                      className="w-5 h-5 flex items-center justify-center text-primary-400 hover:text-primary-700 transition-colors"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3.5 h-3.5"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 4l8 8M12 4l-8 8"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 구분선 */}
          <div className="h-px bg-neutral-200 my-1" />

          {/* 계좌 정보 (선택) */}
          <p className="text-xs text-neutral-500 -mt-2">
            관리비 수납 계좌 (선택)
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">은행명</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="h-12 rounded-xl px-4 text-sm border border-neutral-300 bg-white transition-colors text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
            >
              <option value="">선택 안 함</option>
              {BANKS.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>

          <Input
            label="계좌번호"
            placeholder="예: 123-456-789012"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />

          {error && (
            <p className="text-sm text-error-500 mt-1">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!canSubmit}
            className="w-full mt-2"
          >
            {loading ? '등록 중...' : '빌라 등록하기'}
          </Button>
        </form>
      </div>
    </div>
    </>
  );
}

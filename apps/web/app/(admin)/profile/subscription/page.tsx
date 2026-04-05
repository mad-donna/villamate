'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type SubscriptionStatus = 'FREE_TRIAL' | 'ACTIVE' | 'EXPIRED';

interface SubscriptionInfo {
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry: string | null;
  daysRemaining: number | null;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

function getVillaId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw).villaId ?? null;
  } catch {
    return null;
  }
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const config: Record<SubscriptionStatus, { label: string; className: string }> = {
    FREE_TRIAL: {
      label: '무료 체험중',
      className: 'bg-blue-100 text-blue-700',
    },
    ACTIVE: {
      label: '구독 활성',
      className: 'bg-green-100 text-green-700',
    },
    EXPIRED: {
      label: '구독 만료',
      className: 'bg-red-100 text-red-700',
    },
  };
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${className}`}>
      {label}
    </span>
  );
}

function formatExpiryDate(iso: string | null): string {
  if (!iso) return '만료됨';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '만료됨';
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}년 ${m}월 ${day}일 까지`;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string, type: 'success' | 'error') {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const villaId = getVillaId();
    if (!villaId) {
      setFetchError('빌라 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }

    fetch(`/api/villas/${villaId}/subscription`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setFetchError(data.error);
        } else {
          setInfo(data as SubscriptionInfo);
        }
      })
      .catch(() => setFetchError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCouponApply() {
    setCouponError('');
    const trimmed = couponCode.trim();
    if (!trimmed) {
      setCouponError('쿠폰 코드를 입력해주세요.');
      return;
    }

    const villaId = getVillaId();
    if (!villaId) {
      setCouponError('빌라 정보를 찾을 수 없습니다.');
      return;
    }

    setCouponLoading(true);
    try {
      const res = await fetch(`/api/villas/${villaId}/subscription/coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.error ?? '쿠폰 적용에 실패했습니다.');
        showToast(data.error ?? '쿠폰 적용에 실패했습니다.', 'error');
        return;
      }

      // 구독 정보 업데이트
      setInfo((prev) =>
        prev
          ? {
              ...prev,
              subscriptionStatus: data.subscriptionStatus,
              subscriptionExpiry: data.subscriptionExpiry,
              daysRemaining:
                data.subscriptionExpiry != null
                  ? Math.max(
                      0,
                      Math.floor(
                        (new Date(data.subscriptionExpiry).getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24),
                      ),
                    )
                  : null,
            }
          : prev,
      );
      setCouponCode('');
      showToast('쿠폰이 성공적으로 적용되었습니다.', 'success');
    } catch {
      setCouponError('네트워크 오류가 발생했습니다.');
      showToast('네트워크 오류가 발생했습니다.', 'error');
    } finally {
      setCouponLoading(false);
    }
  }

  const isExpired = info?.subscriptionStatus === 'EXPIRED';

  return (
    <main className="max-w-lg mx-auto pb-16">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => router.back()}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-neutral-600"
          aria-label="뒤로가기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-neutral-900">구독 관리</h1>
      </div>

      {/* 만료 경고 배너 */}
      {isExpired && (
        <div className="mx-4 mb-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <span className="text-red-500 text-lg leading-none mt-0.5">!</span>
          <p className="text-sm text-red-700 font-medium">
            구독이 만료되어 서비스 이용이 제한됩니다. 아래에서 쿠폰을 적용하거나 요금제를 갱신해주세요.
          </p>
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 오류 */}
      {!loading && fetchError && (
        <p className="text-center text-red-500 py-8 px-4">{fetchError}</p>
      )}

      {/* 본문 */}
      {!loading && !fetchError && info && (
        <div className="px-4 space-y-4">
          {/* 현재 구독 상태 카드 */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="text-base font-semibold text-neutral-900">현재 구독 상태</h2>

            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">상태</span>
              <StatusBadge status={info.subscriptionStatus} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">유효 기간</span>
              <span
                className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-neutral-900'}`}
              >
                {formatExpiryDate(info.subscriptionExpiry)}
              </span>
            </div>

            {info.daysRemaining !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">남은 일수</span>
                <span
                  className={`text-sm font-semibold ${info.daysRemaining <= 7 ? 'text-red-600' : 'text-neutral-900'}`}
                >
                  {info.daysRemaining}일 남음
                </span>
              </div>
            )}
          </div>

          {/* 쿠폰 입력 섹션 */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <h2 className="text-base font-semibold text-neutral-900">쿠폰 적용</h2>
            <p className="text-sm text-neutral-500">쿠폰 코드를 입력하면 구독 기간이 연장됩니다.</p>

            <div className="flex gap-2">
              <Input
                className="flex-1"
                placeholder="쿠폰 코드 입력"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  if (couponError) setCouponError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCouponApply();
                }}
                error={couponError || undefined}
                disabled={couponLoading}
                autoCapitalize="characters"
              />
              <Button
                size="md"
                onClick={handleCouponApply}
                loading={couponLoading}
                disabled={couponLoading || !couponCode.trim()}
                className="shrink-0"
              >
                적용
              </Button>
            </div>
          </div>

          {/* 요금제 안내 카드 */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold text-neutral-900">프리미엄 플랜</h2>
              <span className="text-lg font-bold text-[#2563EB]">월 19,900원</span>
            </div>

            <ul className="space-y-2">
              {[
                '청구서 발행 및 납부 관리',
                '전자투표 (1세대 1표)',
                '커뮤니티 게시판 및 민원 접수',
                '건물 이력 및 계약 관리',
                '주차 차량 등록 및 조회',
                '공용 회계 장부',
                '외부 청구서 발송',
                '알림 및 푸시 메시지',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-neutral-700">
                  <span className="mt-0.5 text-[#16A34A] font-bold">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <p className="text-xs text-neutral-400 border-t border-neutral-100 pt-3">
              구독 문의: support@villamate.kr
            </p>
          </div>
        </div>
      )}

      {/* 토스트 알림 */}
      {toast && (
        <div
          className={[
            'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
            'px-5 py-3 rounded-2xl shadow-lg text-sm font-medium text-white',
            'transition-all duration-300',
            toast.type === 'success' ? 'bg-[#16A34A]' : 'bg-[#DC2626]',
          ].join(' ')}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </main>
  );
}

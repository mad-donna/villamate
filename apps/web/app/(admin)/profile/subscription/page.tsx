'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type SubscriptionStatus = 'FREE_TRIAL' | 'ACTIVE' | 'EXPIRED';

interface SubscriptionInfo {
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry: string | null;
  daysRemaining: number | null;
}

interface CardInfo {
  cardCompany: string | null;
  cardNumber: string | null;
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
    const user = JSON.parse(raw);
    return user.villa?.id ?? null;
  } catch {
    return null;
  }
}

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` };
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const config: Record<SubscriptionStatus, { label: string; className: string }> = {
    FREE_TRIAL: { label: '무료 체험중', className: 'bg-blue-100 text-blue-700' },
    ACTIVE: { label: '구독 활성', className: 'bg-green-100 text-green-700' },
    EXPIRED: { label: '구독 만료', className: 'bg-red-100 text-red-700' },
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
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 까지`;
}

// Toss redirect 처리 — useSearchParams는 Suspense boundary 필요
function TossRedirectHandler({
  onSuccess,
  onFail,
}: {
  onSuccess: (authKey: string, customerKey: string) => void;
  onFail: (message: string) => void;
}) {
  const searchParams = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    const authKey = searchParams.get('authKey');
    const customerKey = searchParams.get('customerKey');
    const code = searchParams.get('code');
    const message = searchParams.get('message');

    if (authKey && customerKey) {
      handled.current = true;
      onSuccess(authKey, customerKey);
    } else if (code) {
      handled.current = true;
      onFail(message ?? '카드 등록에 실패했습니다.');
    }
  }, [searchParams, onSuccess, onFail]);

  return null;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [card, setCard] = useState<CardInfo | null>(null);
  const [cardLoading, setCardLoading] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string, type: 'success' | 'error') {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  useEffect(() => {
    const villaId = getVillaId();
    if (!villaId) { setFetchError('빌라 정보를 찾을 수 없습니다.'); setLoading(false); return; }

    Promise.all([
      fetch(`/api/villas/${villaId}/subscription`, { headers: authHeader() }).then((r) => r.json()),
      fetch(`/api/villas/${villaId}/subscription/billing-key`, { headers: authHeader() }).then((r) => r.json()),
    ])
      .then(([subData, cardData]) => {
        if (subData.error) { setFetchError(subData.error); return; }
        setInfo(subData as SubscriptionInfo);
        setCard((cardData as { billing: CardInfo | null }).billing ?? null);
      })
      .catch(() => setFetchError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  // Toss 빌링키 인증 redirect 성공 처리
  async function handleTossSuccess(authKey: string, customerKey: string) {
    const villaId = getVillaId();
    if (!villaId) return;

    setCardLoading(true);
    try {
      const res = await fetch(`/api/villas/${villaId}/subscription/billing-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ authKey, customerKey }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? '카드 등록에 실패했습니다.', 'error'); return; }
      setCard({ cardCompany: data.cardCompany, cardNumber: data.cardNumber });
      showToast('자동결제 카드가 등록되었습니다.', 'success');
      // URL 파라미터 제거
      router.replace('/profile/subscription');
    } catch {
      showToast('네트워크 오류가 발생했습니다.', 'error');
    } finally {
      setCardLoading(false);
    }
  }

  function handleTossFail(message: string) {
    showToast(message, 'error');
    router.replace('/profile/subscription');
  }

  async function handleRegisterCard() {
    const villaId = getVillaId();
    if (!villaId) return;

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) { showToast('결제 설정 오류입니다. 관리자에게 문의해주세요.', 'error'); return; }

    const toss = await loadTossPayments(clientKey);
    const payment = toss.payment({ customerKey: villaId });

    const origin = window.location.origin;
    await payment.requestBillingAuth({
      method: 'CARD',
      successUrl: `${origin}/profile/subscription`,
      failUrl: `${origin}/profile/subscription`,
    });
  }

  async function handleUnregisterCard() {
    if (!confirm('자동결제를 해제하시겠습니까?\n다음 결제일부터 자동 갱신되지 않습니다.')) return;
    const villaId = getVillaId();
    if (!villaId) return;

    setCardLoading(true);
    try {
      await fetch(`/api/villas/${villaId}/subscription/billing-key`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      setCard(null);
      showToast('자동결제가 해제되었습니다.', 'success');
    } catch {
      showToast('네트워크 오류가 발생했습니다.', 'error');
    } finally {
      setCardLoading(false);
    }
  }

  async function handleCouponApply() {
    setCouponError('');
    const trimmed = couponCode.trim();
    if (!trimmed) { setCouponError('쿠폰 코드를 입력해주세요.'); return; }
    const villaId = getVillaId();
    if (!villaId) { setCouponError('빌라 정보를 찾을 수 없습니다.'); return; }

    setCouponLoading(true);
    try {
      const res = await fetch(`/api/villas/${villaId}/subscription/coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error ?? '쿠폰 적용에 실패했습니다.'); showToast(data.error ?? '쿠폰 적용에 실패했습니다.', 'error'); return; }

      setInfo((prev) =>
        prev ? {
          ...prev,
          subscriptionStatus: data.subscriptionStatus,
          subscriptionExpiry: data.subscriptionExpiry,
          daysRemaining: data.subscriptionExpiry != null
            ? Math.max(0, Math.floor((new Date(data.subscriptionExpiry).getTime() - Date.now()) / 86400000))
            : null,
        } : prev,
      );
      setCouponCode('');
      showToast('쿠폰이 성공적으로 적용되었습니다.', 'success');
    } catch {
      setCouponError('네트워크 오류가 발생했습니다.');
    } finally {
      setCouponLoading(false);
    }
  }

  const isExpired = info?.subscriptionStatus === 'EXPIRED';

  return (
    <main className="max-w-lg mx-auto pb-16">
      <Suspense fallback={null}>
        <TossRedirectHandler onSuccess={handleTossSuccess} onFail={handleTossFail} />
      </Suspense>

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
            구독이 만료되어 서비스 이용이 제한됩니다. 자동결제를 등록하거나 쿠폰을 적용해주세요.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && fetchError && (
        <p className="text-center text-red-500 py-8 px-4">{fetchError}</p>
      )}

      {!loading && !fetchError && info && (
        <div className="px-4 space-y-4">
          {/* 현재 구독 상태 */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <h2 className="text-base font-semibold text-neutral-900">현재 구독 상태</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">상태</span>
              <StatusBadge status={info.subscriptionStatus} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">유효 기간</span>
              <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-neutral-900'}`}>
                {formatExpiryDate(info.subscriptionExpiry)}
              </span>
            </div>
            {info.daysRemaining !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">남은 일수</span>
                <span className={`text-sm font-semibold ${info.daysRemaining <= 7 ? 'text-red-600' : 'text-neutral-900'}`}>
                  {info.daysRemaining}일 남음
                </span>
              </div>
            )}
          </div>

          {/* 자동결제 카드 */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-900">자동결제</h2>
              <span className="text-sm font-bold text-[#2563EB]">월 19,900원</span>
            </div>

            {card ? (
              <>
                <div className="flex items-center gap-3 bg-neutral-50 rounded-xl p-3">
                  <div className="w-9 h-6 bg-gradient-to-br from-neutral-700 to-neutral-900 rounded flex items-center justify-center">
                    <span className="text-white text-[8px] font-bold">CARD</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {card.cardCompany ?? '카드'} {card.cardNumber ? `(${card.cardNumber})` : ''}
                    </p>
                    <p className="text-xs text-neutral-500">매월 구독 만료일에 자동 결제됩니다.</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="w-full"
                  loading={cardLoading}
                  onClick={handleUnregisterCard}
                >
                  자동결제 해제
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-neutral-500">
                  카드를 등록하면 구독 만료일에 자동으로 결제되어 서비스가 끊기지 않습니다.
                </p>
                <Button
                  className="w-full"
                  loading={cardLoading}
                  onClick={handleRegisterCard}
                >
                  카드 등록하기
                </Button>
              </>
            )}
          </div>

          {/* 쿠폰 입력 */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <h2 className="text-base font-semibold text-neutral-900">쿠폰 적용</h2>
            <p className="text-sm text-neutral-500">쿠폰 코드를 입력하면 구독 기간이 연장됩니다.</p>
            <div className="flex gap-2">
              <Input
                className="flex-1"
                placeholder="쿠폰 코드 입력"
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value); if (couponError) setCouponError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCouponApply(); }}
                error={couponError || undefined}
                disabled={couponLoading}
                autoCapitalize="characters"
              />
              <Button size="md" onClick={handleCouponApply} loading={couponLoading} disabled={couponLoading || !couponCode.trim()} className="shrink-0">
                적용
              </Button>
            </div>
          </div>

          {/* 요금제 안내 */}
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

      {toast && (
        <div
          className={[
            'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
            'px-5 py-3 rounded-2xl shadow-lg text-sm font-medium text-white transition-all duration-300',
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

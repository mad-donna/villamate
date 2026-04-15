/**
 * VillaMate 구독 요금 — 단 하나의 진실 소스
 * 이 값을 변경하면 자동결제(auto-payment Cron) + MRR 대시보드 모두 자동 반영됩니다.
 *
 * 주의: 실제 Toss 청구 금액과 MRR 계산 금액이 동일해야 합니다.
 * 가격 변경 시 Toss 콘솔의 빌링키 연동 금액도 함께 검토하세요.
 */
export const SUBSCRIPTION_MONTHLY_PRICE = 19_900; // 원 (KRW)
export const SUBSCRIPTION_ORDER_NAME = 'VillaMate 월간 구독';

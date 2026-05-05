# 빌라메이트 (VillaMate) – Product Context

## 1. 프로젝트 개요

- **서비스명**: 빌라메이트 (VillaMate)
- **목표**: 전문 관리 주체가 없는 대한민국의 빌라 및 다세대 주택 관리 문제를 해결하는 모바일 프롭테크 플랫폼
- **핵심 가치**: 100% 모바일 기반 자동화 시스템으로 동대표의 짐을 덜고 이웃 간 감정 소모를 없애는 것
- **비즈니스 모델**: B2B SaaS 구독 (월 19,900원 / 30일 무료 체험)

## 2. 사용자 유형

| 역할 | 코드 | 주요 책임 |
|------|------|-----------|
| 동대표 | `ADMIN` | 빌라 등록·운영, 입주민 관리, 청구서 발행, 투표 생성 |
| 세대주 | `RESIDENT / HEAD` | 관리비 조회·납부, 커뮤니티, 투표 참여 |
| 세대원 | `RESIDENT / MEMBER` | 커뮤니티 참여 (청구서·투표 제외) |
| 플랫폼 운영자 | `SUPER_ADMIN` | 전체 빌라·사용자 관리, 콘텐츠 발행 |

## 3. 핵심 기능 요구사항

> 기능 구현 현황 및 Phase 로드맵은 `docs/RDD.md` 참조.

### 기능적 요구사항 (요약)

- 공용 비용 입력 시 세대별 분담금을 즉시 1/N으로 계산하고 모바일 청구서 발송
- 관리비 미납자에게 시스템이 자동으로 독촉 알림 발송 (Cron 기반)
- 지출 증빙의 투명성 확보를 위한 공용 장부 및 영수증 첨부 기능
- 주요 안건 처리를 위한 비동기식 모바일 전자투표 (1세대 1표)
- 건물의 수리 이력 및 하자 접수 내역을 영구 기록하는 디지털 아카이빙
- 앱 설치 없이 웹 링크로 청구서 확인 및 결제 가능 (외부 청구)

### 비기능적 요구사항 (요약)

- JWT + bcrypt 기반 보안 인증 (HS256, 30일 세션)
- 구독 가드: 만료 시 핵심 기능 제한 (`lib/subscription.ts`)
- 모바일 퍼스트 반응형 (375px 기준, 터치 타깃 44px 이상)
- XSS 방어: DOMPurify + CSP 헤더 전역 적용
- 핵심 API 응답시간 < 500ms (복합 인덱스 9개 적용)

## 4. 현재 기술 스택 (Next.js 15 리빌드 기준, 2026-04 ~)

> 이전 React Native + Express 버전은 `RDD(backup).md` 참조.

| 구분 | 선택 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) + TypeScript | Vercel 배포, 풀스택 단일 프로젝트 |
| 스타일 | Tailwind CSS v4 | 디자인 토큰 → `docs/DESIGN_SYSTEM.md` |
| ORM | Prisma 6 | Supabase PostgreSQL |
| 인증 | JWT (`jose`) + bcrypt | middleware.ts 전역 적용 |
| 결제 | PortOne (KG Inicis) + Toss Payments 빌링키 | 청구서 PG + 구독 자동결제 |
| 파일 업로드 | Supabase Storage | posts/ledger/building-events 버킷 |
| 푸시 알림 | Web Push (VAPID) + Service Worker | `lib/notify.ts`, PushSubscription 모델 |
| 소셜 로그인 | 카카오 + 구글 OAuth 2.0 PKCE | SocialAccount 모델 |
| 테스트 | Jest 30 + ts-jest | API routes 32개 케이스 |
| 배포 | Vercel (단일) | Cron Jobs 7개 (15:00 UTC 일일) |

## 5. 아키텍처 결정 사항 (중요 결정 로그)

| 결정 | 내용 | 이유 |
|------|------|------|
| React Native → Next.js 전환 | 2026-04-03 전면 리빌드 | Vercel 무료 호스팅, 앱스토어 심사 없음, 코드 공유 |
| NestJS 제거 | Next.js Route Handlers로 통합 | 단일 배포, Vercel Serverless 최적화 |
| Ticket 시스템 → 커뮤니티 통합 | Post 모델에 category 추가 | UX 분산 방지, 공개적 투명성 확보 |
| 구독 가드 (`requireActiveSubscription`) | 라우트 핸들러 최상단 호출 | 기능 제한의 단일 진입점 |
| 빌링키 AES-256-GCM 암호화 | `lib/crypto.ts` | 결제 정보 보안 필수 |
| JWT HttpOnly 쿠키 교환 | 소셜 로그인 콜백 → `/api/auth/exchange-token` | URL 노출 방지 |
| `window.confirm/alert` 전면 제거 | `useConfirm` 훅 + `ConfirmDialog` 컴포넌트 | 디자인 일관성, 접근성 |
| 장부 자동 기록 | 관리비 납부/외부청구 완료 시 LedgerTransaction 자동 생성 (`createdBy:'system'`) | 수작업 누락 방지 |
| OCR 월 한도 — DB 카운터 방식 | Google Vision API 호출을 GCP Quota 대신 `OcrUsageLog` 테이블 카운터로 제한 (월 900건) | 사용자에게 명확한 오류 메시지 제공, GCP 초과 과금 방지 |
| 일할 계산 올림 정책 | 전출 정산 시 `Math.ceil(fee × usedDays / totalDays)` — 소수점 이하 올림 | 관리자 불이익 방지, 정수 금액만 청구 |
| 당번 교체 stateless 계산 | `DutySchedule.startDate` 기준 일수 차이로 현재 당번 세대 매번 재계산 — 별도 상태 저장 없음 | Serverless 환경 최적, DB 쓰기 최소화 |
| ExternalBilling 재활용 (전출 정산) | 전출 정산 전용 모델 없이 기존 `ExternalBilling` + `/pay/[id]` 결제 페이지 재사용 | 신규 모델 없이 동일 결제 플로우 활용 |

## 6. 잔여 기술 부채

| 항목 | 내용 | 우선순위 |
|------|------|----------|
| 카카오 알림톡 | 외부 청구 자동 발송 (F-32), 미납 독촉 (F-37) 미구현 | 높음 |
| 오픈뱅킹 | 공용 통장 조회 권한 연동 미구현 (금융위 허가 필요) | 낮음 |
| 전자투표 본인인증 | PASS 연동 (법적 증거 능력) 미구현 | 낮음 |
| PortOne 운영 MID 전환 | 현재 테스트 MID(`INIpayTest`) 사용 중 — 실결제 전 교체 필요 | 높음 |
| `BILLING_ENCRYPTION_KEY` Vercel 등록 | 64자 hex 키 Vercel 환경변수 미등록 — 자동결제 운영 블로커 | Critical |
| 기존 평문 빌링키 마이그레이션 | `decryptBillingKey()` 호환 one-time 스크립트 미실행 | 높음 |
| `GOOGLE_VISION_API_KEY` Vercel 등록 | F-91 OCR 기능 운영 블로커 — Vercel 환경변수 미등록 시 OCR 동작 안 함 | Medium |

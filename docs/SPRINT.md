# VillaMate — Sprint Backlog

> 기준: `RDD.md` v2.0 (2026-04-23 업데이트)
> 범례: ⬜ 미시작 · 🔄 진행중
> ✅ 완료 항목 상세 내역은 `RDD.md` 변경 이력 및 기능 테이블에서 확인

---

## 완료된 Sprint 요약

| Sprint | 기간 | 주요 내용 |
|--------|------|----------|
| Sprint 1 | ~2026-04-11 | 민원, 커뮤니티, 투표, 차량 관리 |
| Sprint 2 | ~2026-04-11 | 장부, 건물이력, 백오피스 기초 |
| Sprint 3 | 2026-04-12 | 백오피스 KPI/콘텐츠, Jest 테스트 32개 |
| Sprint 4 | 2026-04-13~14 | 소셜 로그인, Web Push, Toss 자동결제, 에너지, QR, 멀티빌라 |
| Sprint 5 | 2026-04-15 | 보안 QA (암호화, JWT, 백오피스), 디자인 토큰, WCAG |
| Sprint 6 | 2026-04-16 | AmountInput, Authorization 헤더 수정, ledger 완전 구현 |
| Sprint 7 | 2026-04-18 | PortOne 결제 안정화, Authorization 헤더 전수 수정 |
| Sprint 8 | 2026-04-19 | 게시글 수정, 복사 기능, 장부 자동 기록, 듀얼 모드 확장 |
| Sprint 9 | 2026-04-20 | 보안·안정성 QA 전수 수정, seed.ts, 테스트 33/33 |
| Sprint 10 | 2026-04-21 | D-01~D-04 해소, 인사이트/납부히스토리/시설예약/업체연락처 |
| Sprint 11 | 2026-04-23 | 백오피스 라우팅 버그 수정, SUPER_ADMIN 계정 생성, 시드 데이터 반영 |

---

## Sprint 12 백로그 — QA / 디자인 검토 결과 (2026-04-24)

> QA 에이전트 + 디자인 에이전트 자동 검토 결과. 심각도 순 정렬.

### 🔴 High — 데이터 무결성 / 보안

| # | 파일 | 내용 | 상태 |
|---|------|------|------|
| H-1 | `app/api/resident/facilities/[id]/reservations/route.ts` | 과거 날짜 예약 서버 검증 없음 — API 직접 호출 시 과거 날짜 예약 가능 | ✅ |
| H-2 | `app/api/villas/[villaId]/invoices/route.ts` L99-101, `app/api/cron/publish-invoices/route.ts` L47-48 | `status: 'APPROVED'` 필터 누락 — PENDING 세대에게 청구서 발행됨 | ✅ |
| H-3 | `app/api/villas/[villaId]/external-billing/[billId]/confirm/route.ts` L32-47 | 결제 완료 처리 + 장부 기록이 트랜잭션으로 미묶음 — 부분 실패 시 데이터 불일치 | ✅ |

### 🟡 Medium — 기능 결함 / 권한

| # | 파일 | 내용 | 상태 |
|---|------|------|------|
| M-1 | `app/(admin)/manage/facilities/page.tsx` | 삭제·토글 시 `res.ok` 미체크로 오류 묵살 | ✅ |
| M-2 | `app/(admin)/manage/vendors/page.tsx` | 삭제 시 `res.ok` 미체크 (`handleDelete`) | ✅ |
| M-4 | `app/api/resident/payments/history/route.ts` | role 검증 없음 — 모든 인증 사용자 접근 가능 | ✅ |
| M-5 | `app/api/villas/[villaId]/posts/[postId]/route.ts` | PATCH 공지 승격 시 ADMIN 권한 미검증 | ✅ |
| M-6 | `app/api/admin/insights/route.ts` | 월별 집계를 JS에서 처리 → DB `groupBy`로 교체 권장 | ⬜ |
| M-8 | `lib/notify.ts` `createNotificationForVilla` | `status: 'APPROVED'` 필터 누락 — PENDING 세대에게 알림 발송 | ✅ |

### 🎨 디자인 — 즉시 수정 가능

| # | 파일 | 내용 | 상태 |
|---|------|------|------|
| D-1 | 앱 전반 | `window.confirm` / `window.alert` → `ConfirmDialog` / `Toast` 컴포넌트 교체 | ✅ |
| D-2 | `app/(resident)/villa/invoices/page.tsx`, `villa/invoices/history/page.tsx` | 납부 상태 Badge 시맨틱 역전 수정 — PENDING=`warning`, OVERDUE=`error` | ✅ |
| D-3 | facilities, vendors, 기타 인라인 버튼 | 삭제 버튼 터치 타깃 `min-h-[32px]` → `min-h-[44px]` | ✅ |

### 🔵 Low

| # | 내용 | 상태 |
|---|------|------|
| L-2 | 예약 바텀시트 `today` 초기화 타이밍 의존성 (`app/(resident)/villa/facilities/page.tsx`) | ⬜ |
| L-3 | 오늘 날짜 예약 조회 시 미래 예약 미표시 | ⬜ |
| L-4 | `InsightsSection` 로드 실패 무음 처리 — 에러 상태 표시 추가 | ⬜ |
| L-5 | 장부 API — 입주민에게 전체 내역 노출 여부 정책 확인 필요 | ⬜ |

---

## 운영 대기 항목 (기술 부채)

> 기능 개발 완료 후 운영 환경 설정 또는 수동 작업이 필요한 항목.

| 항목 | 위험도 | 설명 |
|------|--------|------|
| **신규 테이블 Supabase 적용** | **Critical** | Facility / FacilityReservation / Vendor — Supabase SQL Editor 수동 실행 필요. 미적용 시 공용시설·업체 API 런타임 오류 |
| `BILLING_ENCRYPTION_KEY` Vercel 등록 | **Critical** | Vercel Dashboard → Environment Variables에 64자 hex 키 등록 필요 |
| 기존 평문 빌링키 DB 마이그레이션 | High | `decryptBillingKey()` 호환을 위한 one-time 마이그레이션 스크립트 |
| PortOne 운영 MID 전환 | High | 현재 테스트 MID(`INIpayTest`) 사용 중 — 실결제 전 교체 필요 |

---

## Phase 3 잔여 항목 (미구현 — 외부 의존성 필요)

> 외부 사업자 등록·API 계약·법적 검토가 선행되어야 하는 항목. 빠른 실행 불가.

| # | 기능 | 요구사항 | 비고 |
|---|------|---------|------|
| F-32 | 알림톡 청구 | 외부 청구 알림톡 자동 발송 | 카카오 알림톡 API — 사업자 등록증 필요 |
| F-37 | 알림톡 독촉 | 카카오 알림톡 미납 독촉 자동 발송 | F-32 선행 필요, 고령 입주민 커버 |
| F-61 | 전자투표 본인인증 | 전자투표 본인인증 + 타임스탬프 | PASS 연동, 법적 증거 능력 |
| NF-11 | 오픈뱅킹 | 오픈뱅킹 연동 (조회 권한만) | 금융위 허가 검토 필요 |
| NF-12 | 전자서명 타임스탬프 | 전자투표 법적 타임스탬프 | PASS 연동 선행 필요 |

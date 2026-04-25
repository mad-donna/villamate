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
| Sprint 12 | 2026-04-24~25 | 보안·기능 QA 전수 수정 (H×3, M×5, D×3, L×3), Toast 컴포넌트 신규, fixedFee 고정 관리비 자동 발행 |
| Sprint 13 | 2026-04-25 | 공용시설 예약 구조 개선 (openTime/closeTime/maxConcurrent + 인터벌 오버랩), apiFetch 전수 전환 (32개 파일), 인증 버그 전체 해소 |

---

## 잔여 백로그

### 🟡 Medium — 개선 권고

| # | 파일 | 내용 | 상태 |
|---|------|------|------|
| M-6 | `app/api/admin/insights/route.ts` | 월별 집계를 JS에서 처리 → DB `groupBy`로 교체 권장 | ⬜ |

### 🔵 Low

| # | 내용 | 상태 |
|---|------|------|
| L-5 | 장부 API — 입주민에게 전체 내역 노출 여부 정책 확인 필요 | 🔄 현재 입주민에게 전체 내역 노출 중. 제한이 필요하면 `assertVillaAccess` 수정 필요 |

---

## 운영 대기 항목 (기술 부채)

> 기능 개발 완료 후 운영 환경 설정 또는 수동 작업이 필요한 항목.

| 항목 | 위험도 | 설명 |
|------|--------|------|
| ~~신규 테이블 Supabase 적용~~ | ~~Critical~~ | ~~Facility / FacilityReservation / Vendor~~ — **Sprint 13에서 `prisma db push` 완료** |
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

# VillaMate — Sprint Backlog

> 기준: `RDD.md` v2.0 (2026-04-11 업데이트)
> 범례: ⬜ 미시작 · 🔄 진행중
> ✅ 완료 항목은 `RDD.md` 각 기능 테이블 "상태" 컬럼에서 확인

---

## ✅ Sprint 1 완료 항목 — RDD.md로 이동

| # | 기능 | 완료일 |
|---|------|--------|
| F-51 | 민원 접수 (COMMON_FACILITY / PARKING / NOISE_COMPLAINT / ETC) | 2026-04-07 |
| F-52 | 민원 상태 관리 (PENDING → IN_PROGRESS → RESOLVED, 관리자 전용) | 2026-04-07 |
| F-53 | 민원 상태 변경 시 접수 입주민 알림 | 2026-04-07 |
| - | 루트 URL 랜딩 페이지 (villamate.vercel.app/ 404 해결) | 2026-04-07 |
| F-46 | 커뮤니티 댓글 작성·조회 | 2026-04-10 |
| F-47 | 내 게시글 목록 조회 | 2026-04-10 |
| F-48 | 게시글 이미지 첨부 (Supabase Storage) | 2026-04-10 |
| F-54 | 투표 생성 (제목/선택지/종료일/익명 여부) | 2026-04-10 |
| F-55 | 투표 참여 (라디오 선택, HEAD 세대주 전용) | 2026-04-10 |
| F-56 | 1세대 1표 강제 (DB unique + Prisma P2002 catch) | 2026-04-10 |
| F-57 | 투표 결과 시각화 (퍼센트 바, 기명 시 호수 표시) | 2026-04-10 |
| F-58 | 투표 참여율 프로그레스 바 (totalHouseholds 기반) | 2026-04-11 |
| F-70 | 차량 등록 (일반/방문, 모델명, 출차 예정) | 2026-04-11 |
| F-71 | 번호판 검색 → 호수·이름·방문 여부 표시 | 2026-04-11 |

## ✅ Sprint 2 완료 항목 — RDD.md로 이동

| # | 기능 | 완료일 |
|---|------|--------|
| F-62 | 공용 장부 조회 — 월별 필터 + 수입/지출/잔액 summary | 2026-04-11 |
| F-63 | 수입·지출 내역 등록 (관리자) | 2026-04-11 |
| F-64 | 영수증 이미지 첨부 (Supabase Storage 재사용) | 2026-04-11 |
| F-66 | 건물 이력 등록 (수리·하자 디지털 아카이빙) | 2026-04-11 |
| F-67 | 건물 이력 분류 (5가지 카테고리 필터) | 2026-04-11 |
| F-68 | 건물 이력 사진 첨부 (Supabase Storage) | 2026-04-11 |
| F-69 | 풀스크린 이미지 뷰어 (ImageViewer 공통 컴포넌트) | 2026-04-11 |
| F-41 | 공지 게시글 수동 푸시 알림 (전 입주민 알림함) | 2026-04-11 |
| F-42 | 투표 미참여 세대 수동 독촉 알림 | 2026-04-11 |
| F-59 | 투표 수정 (마감 전 — 제목/설명/익명/종료일) | 2026-04-11 |
| F-60 | 투표 미참여 자동 독촉 Cron (마감 24h 전) | 2026-04-11 |
| F-09 | 회원 탈퇴 (소프트 삭제 — 이메일 익명화) | 2026-04-11 |
| F-76 | 구독 만료 전 알림 Cron (D-7/D-3/D-1) | 2026-04-11 |
| F-78 | 백오피스 SUPER_ADMIN 로그인 | 2026-04-11 |
| F-79 | 백오피스 빌라·사용자 목록 조회 및 구독 상태 관리 | 2026-04-11 |

## ✅ 운영 버그 수정 및 QA (2026-04-11)

| 항목 | 수정 내용 |
|------|----------|
| 관리자 `user.villaId` 버그 (5파일) | `user.villa?.id`로 통일 |
| 커뮤니티 글쓰기 라우팅 404 | `/community/new` → `/resident/community/new` |
| `GET /tickets` 타 빌라 열람 취약점 | ADMIN 소속 빌라 검증 추가 |
| 티켓 알림 실패 → 500 반환 | `.catch()` 비동기 분리 |
| TODO API 4개 200 OK | 501 반환으로 교체 |
| 결제 확인 Rate Limit | 인메모리 billId당 1분 5회 |
| `POST /tickets` try/catch 누락 | 추가 |
| `invoices/my` PENDING 신청자 조회 | `status: 'APPROVED'` 필터 |
| `?role=ADMIN` 대시보드 우회 | JWT role만 신뢰 |
| 업로드 MIME 클라이언트 신뢰 | 매직 바이트 검증 |
| 투표 낙관적 업데이트 오차 | 서버 재조회로 교체 |
| `invoice-reminder` N+1 쿼리 | 단일 OR 쿼리 최적화 |
| 알림 `take:50` 하드코딩 | cursor 페이지네이션 |
| Cron KST 스케줄 오류 | `"0 15 * * *"` 통일 |

## ✅ 운영 버그 수정 (2026-04-07)

| 버그 | 수정 내용 | 완료일 |
|------|-----------|--------|
| Supabase PgBouncer prepared statement 오류 | `DATABASE_URL`에 `?pgbouncer=true` 추가 안내 + API catch 에러 로깅 추가 | 2026-04-07 |
| localStorage `user.villaId` 필드 불일치 | 10개 파일에서 `user.villa?.id` / `user.residentVilla?.id`로 수정 | 2026-04-07 |
| 홈 화면 서버 오류 시 "빌라 미등록" 화면 표시 | `fetchError` 상태 분리, 재시도 버튼 추가 | 2026-04-07 |
| 하단 버튼 BottomNav 겹침 + 전체 폭 | `fixed bottom-14 max-w-lg` 패턴으로 수정 (4개 파일) | 2026-04-07 |

---

## Sprint 2 — 잔여 항목

> Sprint 2 주요 기능은 모두 완료. 아래는 추가 작업이 필요한 항목.

현재 Sprint 2 미구현 항목 없음 — Sprint 3으로 전환.

---

## ✅ Sprint 3 완료 항목

| # | 기능 | 완료일 |
|---|------|--------|
| F-80 | KPI 대시보드 (구독 상태 도넛 차트, 6개월 신규 가입 추이 막대 차트) | 2026-04-12 |
| F-81 | 시스템 공지사항 CRUD (제목/내용/게시 여부, 토글 즉시 반영) | 2026-04-12 |
| F-82 | FAQ CRUD (질문/답변/순서/게시 여부, order 오름차순 정렬) | 2026-04-12 |
| F-83 | 가이드 라이브러리 CRUD (Tiptap 편집기, DOMPurify XSS 방어, 카테고리/순서) | 2026-04-12 |
| F-87 | 앱 이용 가이드 화면 (카테고리 필터, 프로필 → 앱 이용 가이드 바로가기) | 2026-04-12 |
| F-88 | 가이드 열람 (HTML 렌더링, DOMPurify sanitize) | 2026-04-12 |
| NF-05 | XSS 방어 — DOMPurify 저장·렌더링 이중 방어 + CSP 헤더 (X-Frame-Options, X-XSS-Protection 포함) | 2026-04-12 |
| F-90 | 고객센터·FAQ 조회 — 아코디언 FAQ + 시스템 공지 탭 + 이메일 연락처 | 2026-04-12 |
| NF-10 | DB 인덱스 — Post/Poll/Ticket/Notification/Ledger/BuildingEvent/ResidentRecord 등 핵심 쿼리 최적화 | 2026-04-12 |
| NF-14 | e2e 테스트 — Jest + ts-jest, 4개 도메인(auth/posts/polls/tickets/ledger) 32개 케이스 전부 통과 | 2026-04-12 |
| F-89 | 시스템 공지 조회 — F-90 고객센터·FAQ 탭에 포함 완료 | 2026-04-12 |

## ✅ Sprint 4 완료 항목 (Phase 3 선행 구현)

| # | 기능 | 완료일 |
|---|------|--------|
| F-43 | Web Push 알림 (VAPID + Service Worker, PushSubscription 모델, lazy init 패턴) | 2026-04-13 |
| F-77 | Toss Payments 빌링키 자동결제 (TossBillingKey 모델, issueBillingKey/chargeBilling, auto-payment Cron) | 2026-04-13 |
| F-04 | 카카오·구글 소셜 로그인 (OAuth 2.0, state CSRF 방어, SocialAccount 모델) | 2026-04-13 |
| F-05 | 소셜 로그인 후 프로필 보완 (needsSetup JWT flag, /profile-setup, /api/auth/social-complete) | 2026-04-13 |
| - | BottomNav 겹침 버그 수정 + z-index 계층 시스템 확립 (z-50/60/70/80) | 2026-04-13 |
| F-49 | 댓글 푸시 알림 — 댓글 등록 시 원글 작성자 DB 알림 + Web Push | 2026-04-14 |
| F-50 | 게시글 좋아요 — PostLike 모델, 토글 API, Admin/Resident UI 하트 버튼 | 2026-04-14 |
| F-65 | 에너지 사용량 — EnergyUsage 모델, 관리자 입력·차트, 입주민 열람·탭 차트 | 2026-04-14 |
| F-84 | 백오피스 청구 현황 — 빌라별 청구서·납부율 테이블, 월 필터, 수납 집계 | 2026-04-14 |
| F-85 | 백오피스 MRR — MRR/ARR 지표, 월별 수익 바차트, 만료 임박 빌라 목록 | 2026-04-14 |
| F-72 | QR 방문 차량 — JWT QR 토큰 발급, 비로그인 방문자 등록 페이지, 관리자 QR 표시 | 2026-04-14 |
| F-15 | 동대표 교체 — 세대주 목록에서 선택, 역할 이양 트랜잭션, 자동 로그아웃 | 2026-04-14 |
| F-14 | 멀티 빌라 관리 — 내 빌라 목록 페이지, JWT 빌라 전환 API, 홈 전환 버튼 | 2026-04-14 |

---

## Sprint 3 — 잔여 항목 없음

Sprint 3 계획 기능 전체 완료. Sprint 4(Phase 3 장기 항목)으로 전환.

---

## ✅ Sprint 5 완료 항목 — 보안 QA + 디자인 QA (2026-04-15)

| # | 항목 | 완료일 |
|---|------|--------|
| NF-15 | 빌링키 AES-256-GCM 암호화 저장 (`lib/crypto.ts`) | 2026-04-15 |
| NF-16 | JWT URL 노출 제거 — HttpOnly 쿠키 교환 패턴 | 2026-04-15 |
| NF-17 | 백오피스 페이지 경로 서버 사이드 보호 (미들웨어 확장) | 2026-04-15 |
| NF-18 | `window.confirm/alert` 36개 → `useConfirm` + `ConfirmDialog` 교체 | 2026-04-15 |
| NF-19 | 디자인 토큰 17개 추가 (`globals.css` 완전성 확보) | 2026-04-15 |
| NF-20 | WCAG 2.1 AA 접근성 — Chip/NotificationList `<button>` 교체, 터치 타깃 44px | 2026-04-15 |
| - | 구독 가격 단일 소스 (`lib/pricing.ts`) — MRR/Cron 불일치 해소 | 2026-04-15 |
| - | 티켓 입력 길이 제한 + APPROVED 소속 검증 추가 | 2026-04-15 |
| - | PostLike P2002 멱등 처리 | 2026-04-15 |
| - | Cron KST 스케줄 수정 (`vercel.json` auto-payment) | 2026-04-15 |
| - | 파일 업로드 MIME 매직 바이트 검증 | 2026-04-15 |
| - | 백오피스 로그아웃 `bo_session` 쿠키 삭제 엔드포인트 | 2026-04-15 |
| - | 하드코딩 색상 → 시맨틱 토큰 교체 (Badge, WidgetCard, Button 등) | 2026-04-15 |
| - | 내비게이션 href 버그 2건 수정 | 2026-04-15 |
| - | Suspense 폴백 추가 (login, profile-setup) | 2026-04-15 |

---

## ✅ Sprint 6 완료 항목 — UX 개선 + 버그 수정 (2026-04-16)

| # | 항목 | 완료일 |
|---|------|--------|
| - | `AmountInput` 공통 컴포넌트 신규 추가 (− / + 버튼, 단위 프리셋 5종) | 2026-04-16 |
| - | `lib/amount-step.ts` localStorage 기반 금액 단위 유틸 | 2026-04-16 |
| - | 청구서 발행 / 외부 청구 / 변동 항목 AmountInput 적용 | 2026-04-16 |
| - | 관리자·입주민 프로필 '금액 단위 설정' 메뉴 추가 (AmountStepSheet) | 2026-04-16 |
| - | 커뮤니티 글쓰기 Authorization 헤더 누락 수정 (admin + resident 신규 글) | 2026-04-16 |
| - | 커뮤니티 상세 댓글 / 삭제 / 좋아요 Authorization 헤더 누락 수정 (4파일 6호출) | 2026-04-16 |
| - | 세대 호수 관리 저장 Authorization 헤더 누락 수정 | 2026-04-16 |
| - | 세대 호수 하단 시트 모바일 영역(max-w-lg) 제한 적용 | 2026-04-16 |
| - | 토스트 z-index 상향 (z-60 → z-90) — 하단 시트 위 표시 보장 | 2026-04-16 |
| - | `/ledger` 스텁 페이지 → 완전 구현 (관리자 장부 화면) | 2026-04-16 |

## ✅ Sprint 8 완료 항목 — 편의 기능 + 자동화 + 듀얼 모드 확장 (2026-04-19)

| # | 항목 | 완료일 |
|---|------|--------|
| - | 커뮤니티 게시글 수정 기능 (PATCH /posts/[postId], 작성자 전용, admin/resident 수정 페이지) | 2026-04-19 |
| - | 커뮤니티 게시글 "수정됨" 배지 (updatedAt - createdAt > 5s 조건) | 2026-04-19 |
| - | 청구서 복사 (`?copy=` URL 파라미터, Suspense 래퍼, billingMonth +1개월 자동 설정) | 2026-04-19 |
| - | 외부 청구서 복사 (handleCopyBilling — 양식 pre-fill + dueDate 초기화) | 2026-04-19 |
| - | 장부 항목 복사 (handleCopyTx — 날짜 오늘로 초기화) | 2026-04-19 |
| - | 장부 자동 기록 — 관리비 납부 PAID 전환 시 LedgerTransaction 자동 생성 | 2026-04-19 |
| - | 장부 자동 기록 — PortOne 결제 검증 통과 시 LedgerTransaction 자동 생성 | 2026-04-19 |
| - | 장부 자동 기록 — 외부 청구 COMPLETED 처리 시 LedgerTransaction 자동 생성 | 2026-04-19 |
| - | 장부 "자동" 배지 (createdBy === 'system' 파생 필드, 파란색 뱃지) | 2026-04-19 |
| F-23 | 듀얼 모드 확장 — 관리자가 자신의 빌라에 입주민 등록 가능 (같은 빌라) | 2026-04-19 |
| - | 온보딩 "저도 이 빌라의 입주민입니다" 체크박스 + 호수 입력 추가 | 2026-04-19 |
| - | join API 관리자 자신의 빌라 가입 시 즉시 APPROVED 처리 | 2026-04-19 |
| - | 로그인 API full villa object 반환 + 동일 빌라 ResidentRecord → residentVilla 자동 설정 | 2026-04-19 |
| - | 입주민 관리 목록 Authorization 헤더 누락 수정 | 2026-04-19 |
| - | 온보딩 주소 검색 동적 스크립트 로딩 (버튼 항상 활성화) + 주소 필드 위로 이동 | 2026-04-19 |
| - | CSP script-src `t1.daumcdn.net` 추가 (Daum Postcode 스크립트 로드 허용) | 2026-04-19 |
| - | CSP frame-src `*.daum.net`, `*.daumcdn.net`, `*.kakao.com` 추가 (Postcode 팝업 허용) | 2026-04-19 |

---

## ✅ Sprint 7 완료 항목 — 결제 안정화 + 인증 헤더 전수 수정 (2026-04-18)

| # | 항목 | 완료일 |
|---|------|--------|
| - | 하단 시트 BottomNav 겹침 z-index 수정 (외부 청구, 투표 상세, 프로필 4개 파일) | 2026-04-18 |
| - | PortOne CSP 도메인 추가 (script/style/img/connect/frame-src *.iamport.kr *.inicis.com) | 2026-04-18 |
| - | PortOne 모바일 결제 m_redirect_url 추가 + 리다이렉트 복귀 URL 파라미터 처리 | 2026-04-18 |
| - | PortOne PG 코드 MID 명시 (`html5_inicis` → `html5_inicis.INIpayTest`) | 2026-04-18 |
| - | 결제 페이지 `useSearchParams` 제거 → `window.location.search` (Suspense 이슈 해소) | 2026-04-18 |
| - | 커뮤니티 이미지 업로드 Authorization 헤더 추가 (admin/resident 글쓰기) | 2026-04-18 |
| - | 커뮤니티 목록 GET Authorization 헤더 추가 (admin/resident) | 2026-04-18 |
| - | 커뮤니티 게시글 상세 GET Authorization 헤더 추가 (admin/resident) | 2026-04-18 |
| - | 에너지 관리 GET Authorization 헤더 추가 | 2026-04-18 |
| - | 투표 목록 GET Authorization 헤더 추가 (admin/resident) | 2026-04-18 |
| - | 투표 상세 GET + 투표 참여 POST Authorization 헤더 추가 (resident) | 2026-04-18 |
| - | 입주자 관리 GET/DELETE Authorization 헤더 추가 | 2026-04-18 |
| - | 민원 목록 GET Authorization 헤더 추가 (resident) | 2026-04-18 |
| - | 차량 관리 GET/POST/DELETE Authorization 헤더 추가 (admin/resident) | 2026-04-18 |
| - | 내 게시글 목록 GET Authorization 헤더 추가 (resident) | 2026-04-18 |

---

## 운영 대기 항목 (기술 부채)

> 기능 개발 완료 후 운영 환경 설정 또는 데이터 마이그레이션이 필요한 항목.

| 항목 | 위험도 | 설명 |
|------|--------|------|
| `BILLING_ENCRYPTION_KEY` Vercel 등록 | **Critical** | Vercel Dashboard → Environment Variables에 64자 hex 키 등록 필요 |
| 기존 평문 빌링키 DB 마이그레이션 | High | `decryptBillingKey()` 호환을 위한 one-time 마이그레이션 스크립트 |

---

## ✅ Sprint 9 완료 항목 — 보안·안정성 QA + 예시 데이터 (2026-04-20)

| # | 항목 | 완료일 |
|---|------|--------|
| - | `prisma/seed.ts` 신규 — 전 기능 예시 데이터 시드 (건물이력/청구서/외부청구/커뮤니티/장부/민원/투표/에너지) | 2026-04-20 |
| - | `lib/portone.ts` 신규 — PortOne 검증 함수 공통 모듈 추출 (Critical QA #1) | 2026-04-20 |
| - | `status:'APPROVED'` 미승인 입주자 차단 — polls/posts/postId/like 4개 라우트 (High QA #2) | 2026-04-20 |
| - | `$transaction` 납부+장부 원자화 — payments/[paymentId] PATCH + verify POST (High QA #3) | 2026-04-20 |
| - | auto-payment Cron: subscriptionExpiry 재조회 제거 + 갱신 실패 시 긴급 알림 (High QA #4) | 2026-04-20 |
| - | invoice-reminder: `amount: { gt: 0 }` 0원 독촉 방지 (High QA #5) | 2026-04-20 |
| - | vehicles GET: N+1 → ownerIds 배치 조회 + Map 룩업 (High QA #6) | 2026-04-20 |
| - | dashboard: searchParams villaId 제거, JWT villaId만 신뢰 (Medium QA #7) | 2026-04-20 |
| - | invoice-reminder: 중복 체크에 userId 필터 + UUID regex 한정 (Medium QA #8) | 2026-04-20 |
| - | `auth.ts`: JWT_SECRET 전 환경 필수화, 하드코딩 폴백 제거 (Medium QA #9) | 2026-04-20 |
| - | 공지 알림 body HTML 태그 제거 (`replace(/<[^>]*>/g,'')`) (Medium QA #10) | 2026-04-20 |
| - | `requireActiveSubscription` — 청구서/외부청구/투표/건물이력 POST 추가 (Medium QA #11) | 2026-04-20 |
| - | tickets 테스트 mock 수정 + 미승인 입주민 403 케이스 신규 추가, 33/33 통과 | 2026-04-20 |

---

## ✅ QA 잔여 항목 (Low / Design) — 2026-04-21

> Critical·High·Medium 전체 수정 완료. 아래 디자인 명세 불일치 및 마이너 UX 이슈 모두 수정 완료.

| # | 위치 | 수정 내용 | 완료일 |
|---|------|----------|--------|
| D-01 | `components/ui/Button.tsx` | `loading` 상태 → `{loading ? <Spinner /> : children}` (텍스트 숨김 + Spinner 단독 표시) | 2026-04-21 |
| D-02 | `components/ui/Badge.tsx` | variant별 `ring-1 ring-{color}-200` 테두리 추가 | 2026-04-21 |
| D-03 | `app/(admin)/home/page.tsx` | 바로가기 그리드 버튼 `min-h-[44px] min-w-[44px]` 추가 (44px 터치 타깃 확보) | 2026-04-21 |
| D-04 | `app/api/cron/poll-reminder/route.ts` | 주석 스케줄 `"0 0 * * *"` → `"0 15 * * *"` (vercel.json 실제 값과 일치) | 2026-04-21 |

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

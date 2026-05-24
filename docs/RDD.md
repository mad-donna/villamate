# 빌라메이트 (VillaMate) — 요구사항 정의서 (RDD) v2.0

> 최종 업데이트: 2026-04-21
> 기준: 전면 리빌드 — NestJS + Next.js (모바일 웹) 전환
> 이전 버전: `RDD(backup).md` (React Native + Express 기준)
> 범례: ✅ 완료 · 🔄 진행중 · ⬜ 미구현 · 🚫 제외

---

## 1. 서비스 개요

빌라메이트는 전문 관리 주체가 없는 대한민국 빌라·다세대 주택의 관리 업무를 디지털화하는 **B2B SaaS 플랫폼**이다.
동대표(ADMIN)가 빌라를 등록·구독하면, 입주민은 초대 코드로 빌라에 참여해 관리비 조회·납부, 장부 열람, 커뮤니티, 전자투표 등을 이용한다.
슈퍼 관리자는 백오피스 웹에서 플랫폼 전체를 운영한다.

### 사용자 유형

| 구분 | 역할 코드 | 주요 책임 | 진입 경로 |
|------|-----------|-----------|-----------|
| 동대표 | `ADMIN` | 빌라 등록·운영, 입주민 관리, 청구서 발행, 투표 생성 | 모바일 웹 → 역할 선택 → 빌라 등록 |
| 세대주 | `RESIDENT` / `HEAD` | 관리비 조회·납부, 커뮤니티, 투표 참여 | 모바일 웹 → 초대 코드 입력 |
| 세대원 | `RESIDENT` / `MEMBER` | 커뮤니티 참여 (청구서·투표 제외) | 세대주 가입 후 세대원으로 연결 |
| 플랫폼 운영자 | `SUPER_ADMIN` | 전체 빌라·사용자 관리, 콘텐츠 발행 | 백오피스 웹 `/backoffice/login` |

---

## 2. 기술 스택 (리빌드 기준)

| 구분 | 선택 | 이유 |
|------|------|------|
| 사용자 앱 | Next.js 15 (App Router) + TypeScript | 모바일 웹 퍼스트, Vercel 즉시 배포, 앱스토어 심사 없음 |
| 백오피스 웹 | Next.js 15 (동일 프로젝트 `/backoffice` route group) | 코드 공유, 단일 배포 |
| 백엔드 | Next.js 15 Route Handlers (풀스택) | NestJS 제거 — Vercel 무료 호스팅 위해 Next.js API Routes로 통합 |
| ORM | Prisma 7 | 유지 (스키마 이관) |
| 데이터베이스 | Supabase (PostgreSQL + Storage) | DB + 파일 스토리지 통합, 로컬 디스크 제거 |
| 인증 | JWT (`jose` 라이브러리) + bcrypt | Edge 호환, middleware.ts 전역 적용 |
| 구독 체크 | `lib/subscription.ts` requireActiveSubscription() | 라우트 핸들러 최상단에서 호출 |
| CSS | Tailwind CSS v4 | 디자인 시스템 토큰과 1:1 매핑 |
| 푸시 알림 | 카카오 알림톡 (Phase 2) / Web Push (검토) | 모바일 웹 전환으로 Expo Push 제거 |
| 결제 | PortOne (KG Inicis) — 인앱 결제 | 서버 imp_uid 검증 필수 |
| 구독 자동결제 | Toss Payments 빌링키 | Phase 3 |
| 파일 업로드 | Supabase Storage | 로컬 디스크 완전 제거 |
| 배포 | Vercel (단일) | NestJS 제거로 Vercel Serverless Functions만으로 전체 운영 |

---

## 3. 라우트 & 네비게이션 구조

> Next.js App Router Route Groups 기준. Phase 3까지 변경하지 않을 확정 구조.

```
app/
├── (auth)/                        # 공개 — 인증 없이 접근
│   ├── login/
│   ├── signup/
│   │   ├── agreement/
│   │   └── profile/
│   ├── select-role/
│   ├── onboarding/                # ADMIN 빌라 등록
│   ├── join/                      # RESIDENT 초대 코드 가입
│   └── profile-setup/             # 소셜 로그인 후 정보 보완
│
├── (admin)/                       # ADMIN 전용 — JwtGuard + AdminGuard
│   ├── layout.tsx                 # 하단 탭 바 5탭 고정
│   ├── home/                      # 🏠 홈 — 대시보드 위젯
│   ├── manage/                    # ⚙️ 관리
│   │   ├── invoices/
│   │   │   ├── page.tsx           # 청구서 목록
│   │   │   ├── new/               # 청구서 발행
│   │   │   └── [id]/              # 세대별 납부 현황
│   │   ├── residents/             # 입주민 관리
│   │   ├── building/              # 건물 이력
│   │   │   └── new/
│   │   ├── polls/                 # 전자투표
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   └── external-billing/      # 외부 청구
│   ├── community/                 # 💬 커뮤니티
│   │   ├── page.tsx               # 게시글 목록
│   │   ├── new/
│   │   └── [id]/
│   ├── ledger/                    # 📒 장부
│   └── profile/                   # 👤 프로필
│       ├── vehicles/
│       ├── notifications/
│       ├── guide/
│       └── subscription/
│
├── (resident)/                    # RESIDENT 전용 — JwtGuard + ResidentGuard
│   ├── layout.tsx                 # 하단 탭 바 4탭 고정
│   ├── home/                      # 🏠 홈 — 내 현황 위젯
│   ├── community/                 # 💬 커뮤니티 (동일 컴포넌트, role 분기)
│   ├── villa/                     # 🏢 우리 빌라
│   │   ├── page.tsx               # 빌라 정보 허브
│   │   ├── invoices/              # 관리비 조회·납부
│   │   ├── ledger/                # 장부 열람
│   │   ├── building/              # 건물 이력 열람
│   │   ├── polls/                 # 전자투표 참여
│   │   └── tickets/               # 민원 접수
│   └── profile/
│       ├── vehicles/
│       └── notifications/
│
├── (backoffice)/                  # SUPER_ADMIN 전용 — PC 레이아웃
│   ├── layout.tsx                 # 240px 사이드바
│   ├── login/
│   ├── dashboard/
│   ├── villas/
│   │   └── [id]/
│   ├── users/
│   └── content/
│       ├── notices/
│       ├── faqs/
│       └── guides/
│
└── pay/[billId]/                  # 외부 청구 웹 결제 — 공개, 인증 없음
```

### 탭 바 구성 (확정)

**동대표 (ADMIN) — 5탭**

| 순서 | 라벨 | Route | 아이콘 |
|------|------|-------|--------|
| 1 | 홈 | `/home` | `home` |
| 2 | 관리 | `/manage` | `cog-6-tooth` |
| 3 | 커뮤니티 | `/community` | `chat-bubble-oval-left` |
| 4 | 장부 | `/ledger` | `book-open` |
| 5 | 프로필 | `/profile` | `user-circle` |

**입주민 (RESIDENT) — 4탭**

| 순서 | 라벨 | Route | 아이콘 |
|------|------|-------|--------|
| 1 | 홈 | `/home` | `home` |
| 2 | 커뮤니티 | `/community` | `chat-bubble-oval-left` |
| 3 | 우리 빌라 | `/villa` | `building-office-2` |
| 4 | 프로필 | `/profile` | `user-circle` |

---

## 4. 기능적 요구사항 (Functional Requirements)

### 4-1. 인증 및 온보딩

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| F-01 | 이메일 + 비밀번호 로그인 / 신규 가입 | 1 | ✅ | bcrypt 해싱, JWT 발급 |
| F-02 | 회원가입 3단계 플로우 (이메일 → 약관 동의 → 프로필 입력) | 1 | ✅ | |
| F-03 | 역할 선택 (동대표 / 입주민) | 1 | ✅ | |
| F-04 | 카카오·구글 소셜 로그인 | 3 | ✅ | 2026-04-13 완료. OAuth 2.0 PKCE, state CSRF 방어, SocialAccount 모델, 카카오·구글 콜백 |
| F-05 | 소셜 로그인 후 전화번호·이메일 보완 | 3 | ✅ | 2026-04-13 완료. needsSetup JWT flag, /profile-setup 페이지, /api/auth/social-complete |
| F-06 | JWT 기반 세션 유지 (localStorage + 자동 갱신) | 1 | ✅ | 이전 AsyncStorage → localStorage |
| F-07 | 모든 보호 API에 JWT 인증 적용 (middleware.ts 전역) | 1 | ✅ | PUBLIC_API 배열로 예외 처리 |
| F-08 | 401 응답 시 자동 로그아웃 + 로그인 리다이렉트 | 1 | ✅ | Next.js middleware |
| F-09 | 회원 탈퇴 (소프트 삭제 — 익명화) | 2 | ✅ | `deleted_{id}@villamate.invalid` 익명화 |

### 4-2. 빌라 등록 및 관리 (동대표)

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| F-10 | 빌라 등록 (이름, 주소, 세대수, 계좌정보) | 1 | ✅ | |
| F-11 | 6자리 초대 코드 자동 생성 | 1 | ✅ | 충돌 시 재시도 로직 포함 |
| F-12 | 세대 호수 사전 지정 (관리자 등록 → 입주민 선택) | 1 | ✅ | onboarding 칩 UI |
| F-13 | 세대 호수 관리 (등록 후 수정) | 1 | ✅ | residents 페이지 BottomSheet |
| F-14 | 멀티 빌라 관리 (동대표 2개 이상 빌라 전환 UI) | 3 | ✅ | 2026-04-14 완료. GET /api/me/villas, POST /api/auth/switch-villa, /profile/my-villas 페이지 |
| F-15 | 동대표 교체 / 권한 위임 | 3 | ✅ | 2026-04-14 완료. prisma.$transaction 역할 이양 (ADMIN→RESIDENT, 신규 ADMIN), 기존 동대표 자동 로그아웃 |
| F-99 | 다중 빌라 퀵스위치 드롭다운 | 5 | ✅ | 2026-05-05 완료. 관리자 홈 헤더에 빌라명 탭 → Bottom Sheet 드롭다운 즉시 전환. 단일 빌라 시 텍스트만 표시 |

### 4-3. 입주민 가입 및 관리

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| F-16 | 초대 코드 + 호수 입력으로 빌라 가입 | 1 | ✅ | |
| F-17 | 빌라 이름/주소 검색 → 입주 신청 (관리자 승인) | 2 | ✅ | ResidentStatus PENDING/APPROVED/REJECTED |
| F-18 | 입주민 목록 조회 (세대주/세입자 구분) | 1 | ✅ | |
| F-19 | 입주민 전출 처리 | 1 | ✅ | SetNull + roomNumber 이력 보존 |
| F-95 | 전출 정산 일할 계산기 | 5 | ✅ | 2026-05-05 완료. 이사일 입력 → Math.ceil(fixedFee × usedDays / totalDays) → ExternalBilling 생성 → /pay/[id] 결제 링크 복사 |
| F-20 | 초대 코드 복사 | 1 | ✅ | `navigator.clipboard`, 2초 토스트 |
| F-21 | 입주민 검색 및 필터 | 2 | ✅ | |
| F-22 | 세대주(HEAD) vs 세입자(MEMBER) 자동 판별 | 1 | ✅ | 선입주자 여부 분기 |
| F-23 | 듀얼 모드 (ADMIN ↔ RESIDENT 화면 전환) | 2 | ✅ | 동대표 계정으로 입주민 화면 체험. 2026-04-19 확장: 같은 빌라 관리자+입주민 동시 등록 지원, 온보딩 체크박스, join 자동 승인 |

### 4-4. 관리비 청구 및 납부

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| F-24 | 고정 관리비 청구서 발행 (전 세대 동일 금액) | 1 | ✅ | `FIXED` 타입, prisma.$transaction |
| F-25 | 변동 관리비 청구서 발행 (항목별 합산 → 1/N) | 1 | ✅ | `VARIABLE` 타입, 항목별 동적 입력 |
| F-26 | 매월 지정일 고정 관리비 자동 발행 (Cron) | 1 | ✅ | autoPublishDay + fixedFee 기반, KST 기준 실행. fixedFee 미설정 시 0원 |
| F-27 | 세대별 납부 현황 조회 (동대표) | 1 | ✅ | paidCount/totalCount 포함 |
| F-28 | 입주민 청구서 목록 및 수동 납부 처리 | 1 | ✅ | GET /invoices/my + PATCH payments |
| F-29 | PortOne PG 인앱 결제 + 서버 imp_uid 검증 | 2 | ✅ | 수동 납부와 병행 |
| F-30 | 청구서 PDF 저장 및 공유 | 2 | ✅ | 브라우저 Print API |
| F-31 | 앱 미설치 사용자 외부 청구 (웹 결제 페이지) | 2 | ✅ | `/pay/:billId` 공개 라우트 |
| F-32 | 외부 청구 알림톡 자동 발송 | 3 | ⬜ | 카카오 알림톡 API |

### 4-5. 미납 독촉 알림

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| F-33 | 청구서 생성 즉시 입주민 알림 발송 | 1 | ✅ | DB 알림함 저장, createNotificationForVilla |
| F-34 | 미납 3일차 자동 독촉 (Cron, 매일 오전 10시) | 1 | ✅ | /api/cron/invoice-reminder |
| F-35 | 미납 7일차 최종 안내 (Cron) | 1 | ✅ | 동일 Cron에서 처리 |
| F-36 | 관리자 수동 독촉 알림 (1일 1회 쿨타임) | 1 | ✅ | /remind, 429 쿨타임 |
| F-37 | 카카오 알림톡 자동 발송 | 3 | ⬜ | 고령 입주민 커버 목적 |
| F-93 | 소프트 넛지(Soft Nudge) 전체 공지 푸시 버튼 | 4 | ✅ | 관리자 대시보드에서 "이번 달 관리비 납부가 시작되었습니다" 분위기 일러스트 공지를 전체 입주민에게 Web Push·알림함 동시 발송하는 원터치 버튼. 자발적 납부 유도 목적, 기계적 독촉과 별개 채널 |

### 4-6. 앱 내 알림 시스템

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| F-38 | 알림 DB 저장 및 알림함 조회 | 1 | ✅ | GET /api/notifications + unreadCount |
| F-39 | 읽음 처리 (개별 / 전체) | 1 | ✅ | PATCH /notifications/[id]/read, /read-all |
| F-40 | 미읽음 뱃지 (헤더 벨 아이콘) | 1 | ✅ | unreadCount 응답, 프로필 뱃지 |
| F-41 | 관리자 공지 수동 푸시 (→ 전 입주민 알림함) | 2 | ✅ | isNotice POST 시 createMany 알림 |
| F-42 | 투표 미참여 세대 독촉 알림 | 2 | ✅ | /remind 엔드포인트, 수동 트리거 |
| F-43 | Web Push 알림 (브라우저) | 3 | ✅ | 2026-04-13 완료. VAPID + Service Worker, PushSubscription 모델, lazy init으로 빌드 오류 방지 |

### 4-7. 커뮤니티 게시판

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| F-44 | 게시글 작성·조회·삭제 | 1 | ✅ | GET/POST/DELETE, 댓글 포함 |
| F-45 | 공지 게시글 (최대 3개 고정) | 1 | ✅ | ADMIN 전용, max 3 validation |
| F-46 | 댓글 작성·조회 | 2 | ✅ | 2026-04-10 완료 |
| F-47 | 내가 쓴 글 조회 | 2 | ✅ | 2026-04-10 완료 |
| F-48 | 게시글 이미지 첨부 | 2 | ✅ | 2026-04-10 완료. Supabase Storage `posts` 버킷 |
| F-49 | 댓글 푸시 알림 | 3 | ✅ | 2026-04-14 완료. 댓글 POST 후 원글 작성자 DB 알림 + sendPushToUser 비동기 발송 (fire-and-forget) |
| F-50 | 게시글 좋아요 | 3 | ✅ | 2026-04-14 완료. PostLike 모델 @@unique([postId,userId]), 토글 API, 관리자·입주민 하트 UI |

### 4-8. 민원 시스템 (Ticket)

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| F-51 | 민원 접수 (COMMON_FACILITY / PARKING / NOISE_COMPLAINT / ETC) | 2 | ✅ | 커뮤니티와 별도 도메인 |
| F-52 | 민원 상태 관리 (PENDING → IN_PROGRESS → RESOLVED) | 2 | ✅ | 관리자 전용 |
| F-53 | 상태 변경 시 입주민 알림 | 2 | ✅ | |

### 4-9. 전자투표

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| F-54 | 투표 생성 (제목/선택지/종료일/익명 여부) | 2 | ✅ | 2026-04-10 완료 |
| F-55 | 투표 참여 (라디오 선택) | 2 | ✅ | 2026-04-10 완료. HEAD 세대주 전용 |
| F-56 | 1세대 1표 강제 (`@@unique([pollId, roomNumber])`) | 2 | ✅ | 2026-04-10 완료. DB + Prisma P2002 catch 이중 검증 |
| F-57 | 투표 결과 시각화 (퍼센트 바, 기명 시 호수 표시) | 2 | ✅ | 2026-04-10 완료 |
| F-58 | 투표 참여율 프로그레스 바 | 2 | ✅ | 2026-04-11 완료. totalHouseholds 기반 % 바 |
| F-59 | 투표 수정 (마감 전) | 2 | ✅ | PATCH — 제목/설명/익명/종료일 (선택지 제외) |
| F-60 | 미참여자 독촉 알림 | 2 | ✅ | Cron 자동 — 마감 24h 전 미참여 세대주 |
| F-61 | 본인인증 + 타임스탬프 (법적 증거 능력) | 3 | ⬜ | PASS 연동 |

### 4-10. 재무 장부

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| F-62 | 공용 지출 장부 조회 (입주민 투명성) | 2 | ✅ | 2026-04-11 완료. 월별 필터 + summary |
| F-63 | 수입·지출 내역 등록 (동대표) | 2 | ✅ | 2026-04-11 완료 |
| F-64 | 영수증 첨부 (Supabase Storage) | 2 | ✅ | 2026-04-11 완료 |
| F-65 | 에너지 사용량 시각화 (전기/수도 월별 그래프) | 3 | ✅ | 2026-04-14 완료. EnergyUsage 모델 @@unique([villaId,year,month]), 관리자 입력·차트, 입주민 탭 차트·연간 합계 |
| F-91 | AI 영수증 자동 인식 (OCR 장부 기입) | 4 | ✅ | 2026-05-05 완료. Google Vision TEXT_DETECTION API. 월 900건 OcrUsageLog DB 카운터 한도. 날짜·금액·설명 정규식 추출 → 장부 입력 폼 자동 채우기 |

### 4-11. 건물 이력 및 계약 관리

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| F-66 | 건물 수리·하자 이력 디지털 아카이빙 | 2 | ✅ | GET/POST `/building-events` |
| F-67 | 카테고리별 이력 분류 (하자보수/정기점검/유지계약/청소/기타) | 2 | ✅ | `BuildingEventCategory` enum 필터 |
| F-68 | 사진 첨부 (Supabase Storage) | 2 | ✅ | `/api/upload` 연동, photoUrl 저장 |
| F-69 | 계약서/영수증 풀스크린 이미지 뷰어 | 2 | ✅ | `ImageViewer` 공통 컴포넌트 (createPortal) |
| F-96 | 순환형 공동 당번 + 정기 점검 스케줄러 | 5 | ✅ | 2026-05-05 완료. DutySchedule(주간/격주 순환)+DutyRule(점검 주기) 모델 신규. /manage/duty 관리 UI. duty-reminder Cron: 당번 교체일 세대 알림 + D-30/D-7 관리자 리마인더 |

### 4-12. 주차 관리

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| F-70 | 차량 등록 (일반/방문, 모델명, 출차 예정) | 2 | ✅ | 2026-04-11 완료 |
| F-71 | 번호판 검색 → 호수·이름·방문여부 표시 | 2 | ✅ | 2026-04-11 완료. ?plate= 부분 일치 검색 |
| F-72 | QR 스캔 방문 차량 임시 등록 | 3 | ✅ | 2026-04-14 완료. JWT QR 토큰 발급, /qr-vehicle 비로그인 공개 페이지, Vehicle.visitorName 필드 추가 |
| F-94 | 차량 이동 요청 푸시 (이중주차 안심 연락망) | 5 | ✅ | 2026-05-05 완료. 차량 목록 → "이동 요청" 버튼 → 소유 입주민 Web Push + 알림함. 익명 처리. 1시간 쿨타임 (Vehicle.lastNudgedAt). 방문 차량 차단 |

### 4-13. SaaS 구독 모델

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| F-73 | 1개월 무료 체험 → 유료 전환 (월 19,900원) | 1 | ✅ | 구독 관리 페이지 + GET /subscription |
| F-74 | 쿠폰 코드로 무료 기간 활성화 | 1 | ✅ | POST /subscription/coupon, $transaction |
| F-75 | 구독 만료(EXPIRED) 시 핵심 기능 제한 | 1 | ✅ | lib/subscription.ts — requireActiveSubscription() |
| F-76 | 구독 만료 전 알림 (D-7, D-3, D-1) | 2 | ✅ | Cron — `subscription-reminder` |
| F-77 | Toss Payments 빌링키 자동결제 | 3 | ✅ | 2026-04-13 완료. TossBillingKey 모델, issueBillingKey/chargeBilling, auto-payment Cron |

### 4-14. 백오피스 (SUPER_ADMIN)

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| F-78 | SUPER_ADMIN 로그인 (JWT 별도 발급) | 2 | ✅ | bo_token, backoffice/login |
| F-79 | 전체 빌라·사용자 목록 조회 및 상태 관리 | 2 | ✅ | /backoffice/villas, /backoffice/users |
| F-80 | 플랫폼 KPI 대시보드 (구독 상태 차트, 신규 가입 추이) | 2 | ✅ | 2026-04-12 완료. groupBy + $queryRaw 집계, 도넛·막대 차트 |
| F-81 | 시스템 공지사항 CRUD | 2 | ✅ | 2026-04-12 완료 |
| F-82 | FAQ CRUD | 2 | ✅ | 2026-04-12 완료. order 오름차순 정렬 |
| F-83 | 관리자 가이드 라이브러리 CRUD (Tiptap 편집기) | 2 | ✅ | 2026-04-12 완료. DOMPurify XSS 방어, 카테고리 6종 |
| F-84 | 빌라별 청구서/납부 현황 조회 | 3 | ✅ | 2026-04-14 완료. /backoffice/billing — 월 필터, 납부율 프로그레스 바, 수납 집계 카드 |
| F-85 | 구독 현황 및 MRR 모니터링 | 3 | ✅ | 2026-04-14 완료. /backoffice/mrr — MRR/ARR 지표, 12개월 바차트, 만료 임박 빌라 목록 |
| F-92 | O2O 오프라인 안내문 자동 생성 (PDF/이미지) | 4 | ✅ | 2026-05-05 완료. qrcode 패키지 + window.print() @media print 방식. 외부 PDF 라이브러리 없이 브라우저 인쇄 기능 활용. /manage/notice 페이지 |

### 4-15. 사용자 프로필 및 설정

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| F-86 | 비밀번호 변경 | 1 | ✅ | PATCH /api/auth/password |
| F-87 | 앱 이용 가이드 화면 | 2 | ✅ | 2026-04-12 완료. 카테고리 필터, 프로필 바로가기 |
| F-88 | 관리자 가이드 라이브러리 (앱 내 열람) | 2 | ✅ | 2026-04-12 완료. prose 렌더링, DOMPurify sanitize |
| F-89 | 시스템 공지사항 조회 | 2 | ✅ | 2026-04-12 완료. F-90 고객센터 탭에 포함 |
| F-90 | 고객센터 / FAQ 조회 | 2 | ✅ | 2026-04-12 완료. 아코디언 FAQ + 시스템 공지 탭 |

---

## 5. 비기능적 요구사항 (Non-Functional Requirements)

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| NF-01 | 비밀번호 해싱 (bcrypt, rounds: 10) | 1 | ✅ | register API 적용 |
| NF-02 | API 응답에서 민감 필드 제외 (password 등) | 1 | ✅ | 구조분해로 password 제거 |
| NF-03 | JWT 전역 적용 (PUBLIC_API 배열로 예외 처리) | 1 | ✅ | middleware.ts — NestJS 아님 |
| NF-04 | SubscriptionGuard — 유료 기능 라우트 제한 | 1 | ✅ | lib/subscription.ts |
| NF-05 | XSS 방어 (백오피스 Tiptap 콘텐츠 sanitize) | 2 | ✅ | 2026-04-12 완료. DOMPurify 이중 방어 + CSP 헤더 전역 적용 |
| NF-06 | CSRF 방어 | 1 | ✅ | middleware.ts Origin/Referer 검증 레이어 추가 |
| NF-07 | TypeScript strict mode 전면 적용 | 1 | ✅ | prisma 역관계 누락 수정, 쿼리 오류 수정 포함 |
| NF-08 | 모바일 퍼스트 반응형 (375px 기준 → 768px 태블릿 대응) | 1 | ✅ | max-w-lg mx-auto, BottomNav 정렬 |
| NF-09 | 터치 타깃 최소 44×44px | 1 | ✅ | Button.tsx sm min-h-[44px] 적용 |
| NF-10 | 핵심 API 응답 시간 < 500ms (p95) | 2 | ✅ | 2026-04-12 완료. 복합 인덱스 9개 추가, KPI DB 집계 최적화 |
| NF-11 | 오픈뱅킹 연동 — 조회 권한만, 이체 권한 배제 | 3 | ⬜ | 금융위 허가 검토 |
| NF-12 | 전자투표 본인인증 + 타임스탬프 (법적 증거) | 3 | ⬜ | |
| NF-13 | NestJS 도메인별 모듈 분리 (auth / villa / invoice / poll / ...) | 1 | ⬜ | 이전 monolith 재발 방지 |
| NF-14 | 테스트 — NestJS e2e (Jest + supertest) 핵심 도메인 커버 | 2 | ✅ | 2026-04-12 완료. Jest + ts-jest, 5개 도메인 32개 케이스 |
| NF-15 | 빌링키 암호화 저장 (AES-256-GCM) | 3 | ✅ | 2026-04-15 완료. `lib/crypto.ts` — `encryptBillingKey/decryptBillingKey`, `BILLING_ENCRYPTION_KEY` env 필요 |
| NF-16 | JWT URL 노출 방지 (HttpOnly 쿠키 교환 패턴) | 3 | ✅ | 2026-04-15 완료. 소셜 로그인 콜백 → `pending_auth_token` HttpOnly 쿠키 → `/api/auth/exchange-token` 1회성 교환 |
| NF-17 | 백오피스 페이지 경로 서버 사이드 보호 | 3 | ✅ | 2026-04-15 완료. `middleware.ts` matcher 확장, `bo_session` HttpOnly 쿠키 검증 |
| NF-18 | 브라우저 기본 모달 제거 (접근성 + 디자인 일관성) | 3 | ✅ | 2026-04-15 완료. `window.confirm/alert` 36개 → `useConfirm` 훅 + `ConfirmDialog` 컴포넌트 |
| NF-19 | 디자인 토큰 완전성 — 시맨틱 토큰 누락 없음 | 3 | ✅ | 2026-04-15 완료. `globals.css`에 17개 토큰 추가 (`neutral/success/warning/error/primary` 확장) |
| NF-20 | WCAG 2.1 AA 접근성 — 터치 타깃 44px, 시맨틱 인터랙티브 요소 | 3 | ✅ | 2026-04-15 완료. Chip/NotificationList `<button>` 교체, `min-h-[44px]` 적용, `aria-hidden` 추가 |

---

## 6. 디자인 시스템 (요약)

> 상세 명세: `docs/DESIGN_SYSTEM.md`

| 항목 | 결정 |
|------|------|
| Primary 컬러 | `#2563EB` (Blue 600) |
| 폰트 | Pretendard (한국어 + 숫자 `tabular-nums`) |
| Base unit | 4px (Tailwind 기본, 8px 리듬) |
| 아이콘 | Heroicons v2 (Outline/Solid) |
| Border Radius | `rounded-xl` (12px) 기본, 카드 `rounded-2xl` (16px) |
| 다크모드 | Phase 1 미지원 |
| 카드 최소 터치 높이 | 56px |
| 빈 상태 | 아이콘 + 안내 문구 + CTA — 항상 다음 행동 제시 |
| 로딩 | Skeleton (구조 예측 가능) / Spinner (즉시 완료 예상) |

---

## 7. Phase 로드맵

### Phase 1 — 핵심 루프 (Core Loop)
**목표**: 동대표가 청구서를 발행하고 입주민이 납부 확인하는 전체 루프 완성. 유료 구독 전환 유도.

| 카테고리 | 포함 기능 |
|---------|-----------|
| 인프라 | 프로젝트 세팅 (모노레포), NestJS JwtGuard + SubscriptionGuard Day 0, Next.js 라우트 구조, Tailwind 디자인 토큰 |
| 인증 | F-01~03, F-06~08 (이메일 로그인, 역할 선택, JWT) |
| 빌라 | F-10~13 (등록, 초대코드, 호수 지정) |
| 입주민 | F-16~20, F-22 (가입, 목록, 전출, HEAD/MEMBER 판별) |
| 청구서 | F-24~28 (FIXED/VARIABLE 발행, Cron, 납부 현황) |
| 알림 | F-33~36, F-38~40 (독촉 Cron, 알림함 DB) |
| 공지 | F-44, F-45 (게시판 기본, 공지 3개 고정) |
| 구독 | F-73~75 (30일 무료, 쿠폰, SubscriptionGuard) |
| 프로필 | F-86 (비밀번호 변경) |
| 비기능 | NF-01~04, NF-06~08, NF-13 |

**성공 기준**
- 동대표 가입 → 첫 청구서 발행 10분 이내
- 청구서 → 입주민 납부 처리 에러 0건
- 30일 무료 종료 후 유료 전환율 20%

---

### Phase 2 — 인게이지먼트 루프 (Retention Loop)
**목표**: 입주민이 매달 앱을 열 이유 확보. 동대표 이탈 방지.

| 카테고리 | 포함 기능 |
|---------|-----------|
| 인증 | F-09 (회원 탈퇴), F-17 (빌라 검색 가입) |
| 입주민 | F-21, F-23 (검색/필터, 듀얼 모드) |
| 결제 | F-29~31 (PG 인앱 결제 + 서버 검증, 외부 청구) |
| 알림 | F-41~42 (공지 수동 푸시, 투표 독촉) |
| 커뮤니티 | F-46~48 (댓글, 내가 쓴 글, 이미지 첨부) |
| 민원 | F-51~53 (Ticket 접수, 상태 관리, 알림) |
| 전자투표 | F-54~60 (전체) |
| 장부 | F-62~64 (조회, 등록, 영수증 첨부) |
| 건물이력 | F-66~69 (전체, Supabase Storage) |
| 주차 | F-70~71 (차량 등록, 번호판 검색) |
| 구독 | F-76 (만료 전 알림 Cron) |
| 백오피스 | F-78~83 (로그인, 빌라/유저 관리, KPI, 콘텐츠 CRUD) |
| 프로필 | F-87~90 (가이드, 공지, FAQ) |

**성공 기준**
- 월간 활성 입주민 비율 60% 이상
- 전자투표 평균 참여율 70% 이상
- 민원 처리 평균 시간 72시간 이내

---

### Phase 3 — 성장 인프라 (Growth & Trust)
**목표**: 대형 고객 수주, 규제 대응, 자동화 완성.

| 카테고리 | 포함 기능 |
|---------|-----------|
| 인증 | F-04~05 (소셜 로그인) |
| 청구 | F-32 (알림톡 자동 발송) |
| 알림 | F-37, F-43 (알림톡, Web Push) |
| 커뮤니티 | F-49~50 (댓글 알림, 좋아요) |
| 전자투표 | F-61 (본인인증 + 타임스탬프) |
| 장부 | F-65 (에너지 시각화) |
| 주차 | F-72 (QR 방문 차량) |
| 빌라 | F-14~15 (멀티 빌라, 동대표 교체) |
| 구독 | F-77 (Toss 자동결제) |
| 백오피스 | F-84~85 (청구 현황, MRR 모니터링) |
| 비기능 | NF-11~12 (오픈뱅킹, 본인인증) |

**성공 기준**
- Toss 빌링키 자동 갱신 성공률 98%
- 다중 빌라 고객 (부동산 법인) 10개사

---

### Phase 4 — UX 도약 (Delight Layer) ✅ 완료
**목표**: 핵심 사용자(5060 동대표)의 진입 장벽을 극단적으로 낮추고, 오프라인 신뢰도 확보와 자발적 납부 문화를 형성.

| 카테고리 | 포함 기능 | 상태 |
|---------|-----------|------|
| 재무 장부 | F-91 (AI 영수증 OCR 자동 인식) | ✅ 2026-05-05 |
| 운영 도구 | F-92 (O2O 오프라인 안내문 자동 생성) | ✅ 2026-05-05 |
| 납부 독촉 | F-93 (소프트 넛지 전체 공지 푸시 버튼) | ✅ 2026-04-29 |

---

### Phase 5 — Retention & Pain Point 해소
**목표**: 반복 사용 동기 강화, 생활 밀착 기능으로 이탈률 감소.

| 카테고리 | 포함 기능 | 상태 |
|---------|-----------|------|
| 주차 관리 | F-94 (차량 이동 요청 — 이중주차 안심 연락망) | ✅ 2026-05-05 |
| 입주민 관리 | F-95 (전출 정산 일할 계산기) | ✅ 2026-05-05 |
| 건물 관리 | F-96 (순환형 공동 당번 + 정기 점검 스케줄러) | ✅ 2026-05-05 |
| 운영 도구 | F-97 (AI 공지사항 초안 어시스턴트 — Claude API) | ⬜ Claude API 키 필요 |
| 업체 관리 | F-98 (수리 수첩 — 업체 작업 이력 아카이빙) | ✅ 2026-05-24 |
| 빌라 전환 | F-99 (다중 빌라 퀵스위치 드롭다운) | ✅ 2026-05-05 |
| 커뮤니티 | F-100 (반려동물 프로필 + 야간 소음 넛지) | ⬜ petInfo 모델 + opt-out 정책 필요 |

---

## 8. 하지 않을 것

| 항목 | 이유 |
|------|------|
| 입주민 간 1:1 채팅 | 갈등 조장 리스크, 콘텐츠 모더레이션 부담 |
| 부동산 매물 연동 | 핵심 가치와 거리 멀고 경쟁 불가 |
| 관리비 카드결제 중계 (Villamate 수금 후 재송금) | 전자금융업자 등록 필요 |
| 광고/수익 모델 | 구독 SaaS 집중 |
| 수리 업체 매칭 | 현재 단계 핵심 가치 외 |

---

## 9. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-05-24 | Sprint 18 — F-98 수리 수첩 완료 (`VendorHistory` 모델 + API 4개 + 관리자 UI). 기술 부채 3건 해소: 전출 소프트 삭제(`MOVED_OUT`), 미납 리마인더 `referenceId` 중복 방지, prorata PENDING 상태 필터 강화. |
| 2026-04-03 | v2.0 최초 작성 — NestJS + Next.js 전면 리빌드 기준. 이전 RDD는 `RDD(backup).md` 보존. Phase 1/2/3 로드맵, 라우트 구조, 디자인 시스템 반영. |
| 2026-04-04 | Phase 1 전체 완료 (F-26, NF-06~09). Phase 2 시작 — F-17, F-21, F-23, F-NEW 완료. Route group 충돌 해결, 빌라 등록 역할 승격 패턴 추가. |
| 2026-04-05 | Sprint 2 진입 — F-29(PortOne PG 결제), F-30(청구서 PDF), F-31(외부 청구 공개 결제) 완료. InvoicePayment에 impUid/pgProvider 필드 추가. Vercel 배포 완료. |
| 2026-04-07 | Sprint 1 진입 — F-51(민원 접수), F-52(민원 상태 관리), F-53(민원 알림) 완료. 루트 URL 랜딩 페이지 추가. Badge variant 빌드 오류 수정. |
| 2026-04-10 | F-46(커뮤니티 댓글), F-47(내 게시글), F-48(게시글 이미지 첨부), F-54(투표 생성), F-55(투표 참여), F-56(1세대 1표), F-57(투표 결과 시각화) 완료. Supabase Storage `posts` 버킷 연동. `/api/upload` 라우트 구현. 1세대 1표 Prisma P2002 이중 검증 패턴 확립. |
| 2026-04-12 | Sprint 3 완료 — F-80(KPI 대시보드), F-81(시스템 공지사항 CRUD), F-82(FAQ CRUD), F-83(가이드 CRUD), F-87(가이드 목록), F-88(가이드 열람), F-89(공지 조회, F-90 포함), F-90(고객센터·FAQ), NF-05(XSS 방어 완성), NF-10(DB 인덱스 9개), NF-14(Jest 테스트 32개). SystemNotice/Faq/Guide 신규 Prisma 모델 추가. CSP 헤더 전역 적용. Tiptap + DOMPurify 도입. |
| 2026-04-13 | Phase 3 선행 — F-04(카카오·구글 소셜 로그인), F-05(소셜 프로필 보완), F-43(Web Push VAPID), F-77(Toss Payments 빌링키 자동결제) 완료. SocialAccount/PushSubscription/TossBillingKey Prisma 모델 추가. User.password nullable(String?) 변경. auto-payment Cron 등록. BottomNav z-index 계층(z-50/60/70/80) 확립. |
| 2026-04-14 | Sprint 4(Phase 3 선행) 전체 완료 — F-49(댓글 푸시 알림), F-50(게시글 좋아요), F-65(에너지 사용량), F-72(QR 방문 차량), F-84(백오피스 청구 현황), F-85(백오피스 MRR), F-14(멀티 빌라 관리), F-15(동대표 교체). PostLike/EnergyUsage Prisma 모델 추가. Vehicle.visitorName 필드 추가. qrcode npm 패키지 도입. 백오피스 사이드바에 billing/mrr 메뉴 추가. |
| 2026-04-15 | Sprint 5 완료 — 보안 QA(NF-15~17: 빌링키 암호화, JWT HttpOnly, 백오피스 미들웨어) + 디자인 QA(NF-18~20: ConfirmDialog, 디자인 토큰 17개, WCAG 접근성). 하드코딩 색상 38개 → 시맨틱 토큰 교체. window.confirm/alert 36개 → useConfirm 전환. |
| 2026-04-16 | Sprint 6 버그 수정 — AmountInput 공통 컴포넌트 신규 추가(`lib/amount-step.ts` + `components/ui/AmountInput.tsx`). 커뮤니티/입주민 API Authorization 헤더 누락 8건 수정. 세대 호수 하단 시트 레이아웃 및 z-index 수정. /ledger 스텁 페이지 → 완전 구현. Vercel 배포 완료. |
| 2026-04-18 | Sprint 7 버그 수정 — PortOne 외부 결제 안정화(CSP 도메인 추가, m_redirect_url 모바일 리다이렉트, PG MID 명시, useSearchParams 제거). 전체 클라이언트 페이지 GET/POST/DELETE API 인증 헤더 누락 13개 파일 일괄 수정. 하단 시트 BottomNav 겹침 z-index 수정. |
| 2026-04-19 | Sprint 8 — 커뮤니티 게시글 수정(PATCH /posts/[postId], "수정됨" 배지). 청구서/외부청구서/장부 복사 기능. 장부 자동 기록(관리비 납부/외부청구 완료 시 LedgerTransaction 자동 생성, createdBy:'system'). 듀얼 모드 같은 빌라 지원(F-23 확장, 온보딩 체크박스, join 자동 승인, 로그인 API full villa object 반환). Daum Postcode CSP 수정(t1.daumcdn.net, kakao.com). 온보딩 주소 검색 동적 로딩 + 필드 순서 개선. |
| 2026-04-20 | Sprint 9 — 보안·안정성 QA 전수 수정(Critical 1 + High 5 + Medium 5). `lib/portone.ts` 신규(PortOne 검증 공통 모듈). `$transaction` 납부+장부 원자화(payments/verify 2개 라우트). `status:'APPROVED'` 미승인 입주자 차단(polls/posts/like 4개 라우트). `requireActiveSubscription` 가드 추가(청구서/외부청구/투표/건물이력 POST). dashboard villaId searchParam 제거. JWT_SECRET 전 환경 필수화. 공지 알림 HTML 태그 제거. invoice-reminder 0원 필터 + userId 범위 축소. vehicles N+1 → 배치 쿼리. 테스트 33/33 통과. `prisma/seed.ts` 신규(전 기능 예시 데이터 시드). |
| 2026-04-21 | Sprint 10 — QA D-01~D-04 전체 해소(Button loading/Badge 테두리/터치 타깃/Cron 주석). 신규 기능 4종: 관리자 수금 인사이트(`GET /api/admin/insights`, InsightsSection 컴포넌트), 입주민 납부 히스토리(`GET /api/resident/payments/history`), 공용시설 예약(Facility/FacilityReservation 모델 신규, 관리자 CRUD + 입주민 예약), 외부 업체 연락처(Vendor/VendorCategory 모델 신규, CRUD + tel 링크). 버그 수정: 신규 바텀시트 z-50→z-60, 관리자 프로필 pb-10→pb-24, 기존 관리자 듀얼 모드 활성화 경로 추가(프로필 "등록" 버튼). 신규 테이블 Supabase 수동 적용 필요(운영 블로커). |
| 2026-04-23 | Sprint 11 — 백오피스 라우팅 버그 수정. `(backoffice)` route group 실제 URL(`/dashboard`, `/villas` 등) 확정 및 코드 전반 경로 수정. `bo_session` 쿠키 path `/backoffice`→`/` 수정(로그인 루프 버그 해소). `middleware.ts` matcher에 백오피스 페이지 경로 명시 추가. SUPER_ADMIN 계정 DB 생성. `prisma db seed` 실행(햇살 빌라 데모 데이터 반영). |
| 2026-04-24~25 | Sprint 12 — 보안·기능 QA 전수 수정(H×3, M×5, D×3, L×3). Toast/useToast 컴포넌트 신규. window.alert/confirm 완전 제거. Badge 납부 상태 시맨틱 교정. 터치 타깃 표준화. 고정 관리비 자동 발행(fixedFee) 기능 구현: `Villa.fixedFee Int?` 추가, PATCH API 지원, publish-invoices 크론 금액 자동 설정, AutoPublishCard UI. |
| 2026-04-29 | PM 평가 기반 Phase 4 기능적 요구사항 등록 — F-91(AI 영수증 OCR), F-92(O2O 안내문 자동 생성), F-93(소프트 넛지 전체 푸시). Phase 4 로드맵 섹션 신규 추가. F-93 당일 구현 완료 — `POST /api/villas/[villaId]/nudge`, 관리자 홈 넛지 카드 UI. |
| 2026-05-05 | Sprint 15 — F-91(AI OCR, Google Vision, 월 900건 OcrUsageLog 카운터), F-92(O2O 안내문 window.print), M-6(insights API DB groupBy 교체), L-5(장부 전체 공개 정책 확정). Sprint 16 — F-94(차량 이동 요청 넛지, 1h 쿨타임), F-95(전출 일할 정산, ExternalBilling 재활용), F-96(공동 당번 + 정기 점검, DutySchedule/DutyRule 모델 신규, duty-reminder Cron), F-99(다중 빌라 퀵스위치). Phase 5 로드맵 신규 정의. DutyInterval enum + DutySchedule/DutyRule/OcrUsageLog 모델 + Vehicle.lastNudgedAt 추가. vercel.json Cron 7개로 확장. |
| 2026-05-09 | QA-1 인증/온보딩 — RESIDENT roomNumber 유실 수정(login·me·join·onboarding), socialAccount FK 선삭제, invite code substring(-6)→slice(-6) 버그 수정, join 페이지 useEffect 클린업 패턴 적용. QA-2 결제 흐름 — 모바일 결제 취소 시 fetchBilling() 호출 추가, 결제 이중 처리 경쟁 조건 $transaction+updateMany 원자적 처리, PAID→미납 전환 시 역분개 LedgerTransaction 자동 생성, publish-invoices cron 구독 상태 필터 추가(ACTIVE/FREE_TRIAL), pay/confirm in-memory rateLimitMap 제거. QA-3 입주민 관리 — REJECTED 입주민 재신청 허용(join 3곳 status 조건 수정), prorata 날짜 범위 검증 추가(1년이내/1개월이내), residents/page localStorage 직접 파싱→getUser() 헬퍼 전환, toast 타이머 클린업. 기술 부채 신규 등록: 전출 소프트 삭제(High), prorata 중복 방지(Low), 미납 리마인더 regex(Low). |

---

## 2026-04-04 추가 기능

| # | 요구사항 | Phase | 상태 | 비고 |
|---|---------|-------|------|------|
| F-NEW | 빌라 등록 주소 자동완성 (카카오 우편번호 API) | 2 | ✅ | 건물명 자동 입력 포함 |

---

## 2026-04-21 추가 기능 (Sprint 10)

### 디자인 QA 완료 항목

| # | 항목 | 파일 | 상태 |
|---|------|------|------|
| D-01 | Button loading 텍스트 숨김 + Spinner 단독 | `components/ui/Button.tsx` | ✅ |
| D-02 | Badge variant별 `ring-1 ring-{color}-200` 테두리 | `components/ui/Badge.tsx` | ✅ |
| D-03 | 관리자 홈 바로가기 버튼 터치 타깃 44px | `app/(admin)/home/page.tsx` | ✅ |
| D-04 | poll-reminder Cron 주석 스케줄 통일 | `app/api/cron/poll-reminder/route.ts` | ✅ |

### 신규 기능 — 관리자 수금 인사이트

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| - | 이번 달 수금률 (PAID / 전체 건수) 프로그레스 바 표시 | ✅ | `GET /api/admin/insights` |
| - | 최근 6개월 월별 수금액 막대 차트 | ✅ | 순수 CSS, recharts 미사용 |
| - | 관리자 홈 하단 자동 삽입 (`InsightsSection` 컴포넌트) | ✅ | |

### 신규 기능 — 입주민 납부 히스토리

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| - | 전체/완납/미납 탭 필터 납부 이력 조회 | ✅ | `GET /api/resident/payments/history` |
| - | 청구 월·금액·상태 Badge·납부일 표시 | ✅ | `app/(resident)/villa/invoices/history/page.tsx` |

### 신규 기능 — 공용시설 예약 (Sprint 13에서 구조 개선)

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| - | 시설 등록·수정·삭제·운영중단 토글 (관리자) | ✅ | `POST/PATCH/DELETE /api/admin/facilities` |
| - | 운영시간(`openTime/closeTime`) + 동시 예약 가능 건수(`maxConcurrent`) 설정 (관리자) | ✅ | Sprint 13: `maxPerDay` 대체 |
| - | 시설별 예약 현황 조회 (관리자) | ✅ | `GET /api/admin/facilities/[id]/reservations` |
| - | 날짜·시작/종료 시간(`startTime/endTime`)·메모 입력 예약 (입주민) | ✅ | Sprint 13: `timeSlot` 자유 텍스트 대체 |
| - | 인터벌 오버랩 기반 중복 예약 차단 (`maxConcurrent` 기준) | ✅ | Sprint 13: `maxPerDay` 일 기준 → 시간대 기준으로 변경 |
| - | 과거 날짜·운영시간 범위·HH:MM 형식 서버 검증 | ✅ | Sprint 12 H-1 + Sprint 13 추가 |
| - | 내 예약 취소 (입주민) | ✅ | `DELETE /api/resident/facilities/[id]/reservations/[rid]` |
| - | Facility, FacilityReservation 신규 Prisma 모델 | ✅ | `prisma db push` 완료 (Sprint 13) |

### 신규 기능 — 외부 업체 연락처 관리

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| - | 업체 등록·수정·삭제 + 카테고리 필터 6종 (관리자) | ✅ | `POST/PATCH/DELETE /api/admin/vendors` |
| - | 업체 목록 읽기 전용 + `tel:` 전화 바로가기 (입주민) | ✅ | `GET /api/resident/vendors` |
| - | Vendor, VendorCategory enum 신규 Prisma 모델 | ✅ | Supabase 수동 적용 필요 |

### 버그 수정

| 항목 | 원인 | 수정 | 상태 |
|------|------|------|------|
| 신규 페이지 바텀시트 BottomNav 가림 | 바텀시트 z-50 = BottomNav z-50 | 바텀시트 z-60 상향 | ✅ |
| 관리자 프로필 하단 항목 BottomNav 가림 | `pb-10` (40px) < BottomNav 56px | `pb-24` 수정 | ✅ |
| 기존 관리자 듀얼 모드 활성화 불가 | 온보딩 이후 입주민 등록 경로 없음 | 프로필 "등록" 버튼 + join API | ✅ |

---

## 2026-04-24~25 완료 항목 (Sprint 12)

### 보안·기능 QA 수정

| # | 파일 | 내용 | 상태 |
|---|------|------|------|
| H-1 | `app/api/resident/facilities/[id]/reservations/route.ts` | 과거 날짜 예약 서버 검증 추가 (KST 기준) | ✅ |
| H-2 | `app/api/villas/[villaId]/invoices/route.ts`, `publish-invoices/route.ts` | headResidents `status: 'APPROVED'` 필터 추가 | ✅ |
| H-3 | `app/api/villas/[villaId]/external-billing/[billId]/confirm/route.ts` | 결제완료+장부기록 `$transaction` 원자화 | ✅ |
| M-1 | `app/(admin)/manage/facilities/page.tsx` | `useConfirm` 도입 + `res.ok` 체크 | ✅ |
| M-2 | `app/(admin)/manage/vendors/page.tsx` | `handleDelete` `res.ok` 체크 추가 | ✅ |
| M-4 | `app/api/resident/payments/history/route.ts` | RESIDENT/ADMIN role 검증 추가 | ✅ |
| M-5 | `app/api/villas/[villaId]/posts/[postId]/route.ts` | 공지 승격 시 `villa.adminId` 검증 | ✅ |
| M-8 | `lib/notify.ts` `createNotificationForVilla` | `status: 'APPROVED'` 필터 추가 | ✅ |

### 디자인·UX QA 수정

| # | 내용 | 상태 |
|---|------|------|
| D-1 | `Toast` 컴포넌트 + `useToast` 훅 신규. 앱 전반 `window.alert/confirm` 완전 제거 | ✅ |
| D-2 | Badge 납부 상태 시맨틱 수정: PENDING=`warning`, OVERDUE=`error` | ✅ |
| D-3 | 삭제 버튼 터치 타깃 `min-h-[44px]` 표준화 | ✅ |
| L-2 | 시설 예약 바텀시트 `today` KST 초기화 확정 | ✅ |
| L-3 | 시설 API 오늘 이후 예약 포함, 타인 예약 오늘만 표시 | ✅ |
| L-4 | `InsightsSection` 에러 상태 UI 추가 | ✅ |

### 신규 기능 — fixedFee 고정 관리비 자동 발행

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| - | `Villa.fixedFee Int?` DB 필드 추가 | ✅ | `prisma db push` 완료 |
| - | `PATCH /api/villas/[villaId]`에서 `fixedFee` 저장 지원 | ✅ | `autoPublishDay`와 동일 패턴 |
| - | `publish-invoices` 크론 — `fixedFee` 기반 청구서 금액 설정 | ✅ | 미설정 시 0원(하위 호환) |
| - | `AutoPublishCard` UI — 발행일 + 세대당 관리비 설정 카드 | ✅ | `manage/invoices/page.tsx` 상단 |

---

## 2026-05-09~10 완료 항목 (전체 QA 세션)

### QA-1: 인증/온보딩 ✅

| 항목 | 파일 | 내용 |
|------|------|------|
| RESIDENT roomNumber 유실 | `auth/login/route.ts`, `auth/me/route.ts`, `client-auth.ts` | 로그인 API에 roomNumber 포함, StoredUser 인터페이스 확장 |
| 회원 탈퇴 FK 오류 | `auth/me/route.ts` | SocialAccount 선삭제 후 User 삭제 |
| invite code substring 버그 | `villas/route.ts` | `.substring(-6)` → `.slice(-6)` |
| join setTimeout 클린업 누락 | `(auth)/join/page.tsx` | useEffect로 분리해 cleanup 처리 |

### QA-2: 결제 흐름 ✅

| 항목 | 파일 | 내용 |
|------|------|------|
| 모바일 결제 취소 시 빈 화면 | `pay/[billId]/page.tsx` | 취소 분기에 fetchBilling() 추가 |
| 결제 이중 처리 경쟁 조건 | `payments/.../verify/route.ts` | `$transaction` + `updateMany` + `count === 0` 원자 처리 |
| 결제 취소 시 장부 역분개 누락 | `payments/.../route.ts` | PAID→미납 시 EXPENSE 역분개 자동 생성 |
| 비활성 빌라 청구서 자동 발행 | `cron/publish-invoices/route.ts` | `subscriptionStatus: { in: ['ACTIVE', 'FREE_TRIAL'] }` 필터 |
| in-memory rate limit 제거 | `pay/[billId]/confirm/route.ts` | 서버리스 무의미 — PortOne 3중 검증으로 충분 |

### QA-3: 입주민 관리 ✅

| 항목 | 파일 | 내용 |
|------|------|------|
| REJECTED 재신청 불가 | `villas/join/route.ts` | 중복 체크에서 REJECTED 제외 (3곳) |
| 일할 정산 날짜 검증 없음 | `residents/[id]/prorata/route.ts` | 1년 이내 과거/1개월 이내 미래 범위 검증 |
| localStorage 직접 파싱 | `(admin)/manage/residents/page.tsx` | getUser() 헬퍼로 통일 |

### QA-4: 공지/투표 ✅

| 항목 | 파일 | 내용 |
|------|------|------|
| PENDING 입주민 콘텐츠 접근 | `posts/my`, `comments`, `polls/[id]` | `status: 'APPROVED'` 조건 3곳 추가 |
| PATCH로 공지 3개 제한 우회 | `posts/[postId]/route.ts` | 승격 시 개수 재검증 |
| poll-reminder Cron 중복 알림 | `cron/poll-reminder/route.ts` | 오늘 발송 여부 DB 조회 후 스킵 |
| 게시글 목록 HTML 태그 노출 | `community/page.tsx` (admin/resident) | `replace(/<[^>]*>/g, '')` strip |
| 비작성자 수정 URL 직접 접근 | `community/[id]/edit/page.tsx` | author.id 확인 후 router.back() |
| 투표 종료일 UI/API 불일치 | `polls/route.ts` | API에 최소 1시간 후 제한 추가 |

### QA-5: 차량/티켓/점검/F-99 ✅

| 항목 | 심각도 | 파일 | 내용 |
|------|--------|------|------|
| QR 토큰 하드코딩 시크릿 | Critical | `qr-token`, `qr-verify`, `visitor` | `lib/auth.ts` secret export 후 재사용 |
| 당번 Cron UTC/KST 오류 | High | `cron/duty-reminder/route.ts` | getTodayKST() 함수로 통일 |
| 당번 Cron try/catch 없음 | High | `cron/duty-reminder/route.ts` | 루프 내 try/catch 추가 |
| 티켓 빌라 소속 검증 누락 | High | `tickets/route.ts` | villaId 조건 + try/catch 추가 |
| Nudge 알림+DB 비원자 | High | `vehicles/[id]/nudge/route.ts` | DB 갱신 먼저 → 알림 발송 순서 변경 |
| 일할 정산 중복 생성 | Medium | `residents/[id]/prorata/route.ts` | description 기반 409 체크 추가 |
| switch-villa Authorization 누락 | Medium | `(admin)/profile/my-villas/page.tsx` | raw fetch → apiFetch 교체 |
| duty-rules 부동소수점 허용 | Medium | `duty-rules/route.ts` | Number.isInteger() 검증 추가 |
| DutySchedule 비원자 업데이트 | Medium | `duty-schedules/route.ts` | $transaction 원자화 |

### QA-6: 크론 잡 ✅

| 항목 | 파일 | 내용 |
|------|------|------|
| 알림 루프 예외 처리 누락 | `expire-subscriptions`, `publish-invoices` | .catch 추가 |
| subscription-reminder 중복 발송 | `cron/subscription-reminder/route.ts` | 오늘 발송 여부 사전 확인 |
| duty-reminder 문구 오류 | `cron/duty-reminder/route.ts` | "이번 주" → "이번 격주" |
| duty-reminder 중복 발송 | `cron/duty-reminder/route.ts` | 오늘 발송 여부 사전 확인 |

### QA-7: 백오피스 ✅

| 항목 | 파일 | 내용 |
|------|------|------|
| TYPE_LABEL 오타 | `(backoffice)/billing/page.tsx` | MANAGEMENT→FIXED, EXTRA→VARIABLE |
| confirm/alert 미교체 | `content/notices`, `faqs`, `guides` | useConfirm 훅 전환 |
| 빌라 상세 페이지 미구현 | `(backoffice)/villas/[id]/page.tsx` | 전면 구현 (설계-5 B안) |
| 빌라 상세 GET API 없음 | `api/backoffice/villas/[id]/route.ts` | GET 핸들러 신규 추가 |

---

## 2026-05-10 신규 기능

| # | 기능 | 상태 | 비고 |
|---|------|------|------|
| 설계-3 | 관리자 이용 가이드 페이지 | ✅ | `/profile/guide`, `/profile/guide/[id]` (DOMPurify) |
| 설계-5 | 백오피스 빌라 상세 페이지 | ✅ | B안: 통계 카드 + 입주민 + 청구서 테이블 |
| - | 무료 체험 hasUsedTrial 정책 | ✅ | 계정당 1회, 빌라 이양 후에도 유지 |
| - | 운영 정책 문서 POLICY.md | ✅ | 구독·결제·계정 등 11개 영역 |

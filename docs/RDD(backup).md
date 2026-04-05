# 빌라메이트 (VillaMate) — 요구사항 정의서 (RDD)

> 최종 업데이트: 2026-03-12
> 기준: `PRODUCT_CONTEXT.md`, `IA.md`, `PHASE1_SCOPE.md` 통합 정리
> 범례: ✅ 완료 · 🔄 진행중 · ⬜ 미구현 · 🚫 보류

---

## 1. 서비스 개요

빌라메이트는 전문 관리 주체가 없는 대한민국 빌라·다세대 주택의 관리 업무를 디지털화하는 **B2B SaaS 모바일 플랫폼**이다.
동대표(관리자)가 빌라를 등록·구독하면, 입주민은 초대 코드로 빌라에 참여해 관리비 조회·납부, 장부 열람, 커뮤니티, 전자투표 등을 이용한다.
슈퍼 관리자는 백오피스 웹(`admin-web/`)에서 플랫폼 전체를 운영한다.

### 사용자 유형

| 구분 | 역할 코드 | 주요 책임 |
|------|-----------|-----------|
| 동대표 | `ADMIN` | 빌라 등록·운영, 입주민 관리, 청구서 발행, 투표 생성 |
| 세대주 | `RESIDENT` / `HEAD` | 관리비 조회·납부, 커뮤니티, 투표 참여 |
| 세대원 | `RESIDENT` / `MEMBER` | 커뮤니티 참여 (청구서·투표 제외) |
| 플랫폼 운영자 | `SUPER_ADMIN` | 전체 빌라·사용자 관리, 콘텐츠 발행 |

---

## 2. 기능적 요구사항 (Functional Requirements)

### 2-1. 인증 및 온보딩

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| F-01 | 이메일 + 비밀번호 로그인 및 신규 가입 | ✅ | bcrypt 해싱, JWT 발급 |
| F-02 | 회원가입 3단계 플로우 (이메일 → 약관 동의 → 프로필 입력) | ✅ | `SignupAgreementScreen`, `SignupProfileScreen` |
| F-03 | 역할 선택 (동대표 / 입주민) | ✅ | `SelectRoleScreen` |
| F-04 | 카카오·구글 소셜 로그인 | ✅ | 실제 배포 환경 기준 동작 |
| F-05 | 네이버 소셜 로그인 | ⬜ | UI 존재, 연동 미구현 |
| F-06 | 소셜 로그인 후 전화번호·이메일 보완 (`ProfileSetupScreen`) | ✅ | |
| F-07 | AsyncStorage 기반 세션 유지 | ✅ | |
| F-08 | 모바일 API 전체에 JWT 인증 헤더 적용 | ✅ | Axios interceptor 기반 전역 적용 완료 (C1) |
| F-09 | 회원 탈퇴 (소프트 삭제 — 익명화) | ✅ | |

### 2-2. 빌라 등록 및 관리 (동대표)

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| F-10 | 빌라 등록 (이름, 주소, 세대수, 계좌정보) | ✅ | |
| F-11 | 6자리 초대 코드 자동 생성 | ✅ | |
| F-12 | 세대 호수 사전 지정 (관리자 등록 → 입주민 선택 picker) | ✅ | `Villa.roomNumbers[]` |
| F-13 | 세대 호수 관리 (등록 후 수정) | ✅ | `ResidentManagementScreen` 내 |
| F-14 | 멀티 빌라 관리 (동대표 2개 이상 빌라 전환 UI) | ⬜ | 백엔드 1:N 지원, UI 미구현 |
| F-15 | 동대표 교체 / 권한 위임 | ⬜ | |

### 2-3. 입주민 가입 및 관리

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| F-16 | 초대 코드 + 호수 입력으로 빌라 가입 | ✅ | |
| F-17 | 빌라 이름/주소 검색 → 입주 신청 (관리자 승인 대기) | ✅ | `VillaSearchScreen` |
| F-18 | 입주민 목록 조회 (세대주/세입자 구분 뱃지) | ✅ | `ResidentManagementScreen` |
| F-19 | 입주민 전출 처리 | ✅ | |
| F-20 | 초대 코드 클립보드 복사 | ✅ | `expo-clipboard` |
| F-21 | 입주민 검색 및 필터 (전체/입주중/공실/세대주/세입자) | ✅ | |
| F-22 | 세대주(HEAD) vs 세입자(MEMBER) 역할 자동 판별 | ✅ | 가입 시 선입주자 여부로 분기 |

### 2-4. 관리비 청구 및 납부

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| F-23 | 고정 관리비 청구서 발행 (전 세대 동일 금액) | ✅ | `FIXED` 타입 |
| F-24 | 변동 관리비 청구서 발행 (항목별 합산 → 1/N 자동 계산) | ✅ | `VARIABLE` 타입 |
| F-25 | 매월 지정일 고정 관리비 자동 발행 (cron) | ✅ | node-cron |
| F-26 | 세대별 납부 현황 조회 (동대표) | ✅ | `AdminInvoiceDetailScreen` |
| F-27 | 입주민 청구서 목록 및 납부 처리 | ✅ | `ResidentInvoiceScreen` |
| F-28 | 청구서 PDF 저장 및 공유 | ✅ | `expo-print`, `expo-sharing`, 한국어 파일명 |
| F-29 | PG 결제 서버 검증 (`imp_uid` → PortOne API) | ⬜ | 보안 필수, 계속 미구현 |
| F-30 | 앱 미설치 사용자 외부 청구 (모바일 웹 결제 페이지) | ✅ | `ExternalBillingScreen`, `/pay/:billId` HTML 응답 |
| F-31 | 외부 청구 알림톡 자동 발송 | ⬜ | 현재 수동 복사 방식 |

### 2-5. 미납 독촉 알림

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| F-32 | 청구서 생성 즉시 입주민 푸시 알림 발송 | ✅ | |
| F-33 | 미납 3일차 자동 독촉 알림 (cron, 매일 오전 10시) | ✅ | HEAD + expoPushToken 보유자 대상 |
| F-34 | 미납 7일차 최종 안내 알림 (cron) | ✅ | 7일 이후 추가 발송 없음 |
| F-35 | 카카오 알림톡 자동 발송 | ⬜ | 장기 과제 |

### 2-6. 앱 내 알림 시스템

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| F-36 | Expo 푸시 토큰 등록 및 저장 | ✅ | 앱 시작 시 자동 요청 |
| F-37 | 공지 수동 푸시 발송 (동대표 → 전 입주민) | ✅ | `PostDetailScreen` 내 버튼 |
| F-38 | 앱 내 알림함 (`NotificationScreen`) | ✅ | 읽음 처리 자동화 |
| F-39 | 투표 미참여 세대 독촉 알림 | ✅ | `PollDetailScreen` 내 버튼 |

### 2-7. 커뮤니티 게시판

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| F-40 | 게시글 작성·조회·삭제 | ✅ | |
| F-41 | 공지 게시글 (최대 3개 고정) | ✅ | |
| F-42 | 민원·하자 접수 (게시판 통합, 상태 관리) | ✅ | `PENDING → IN_PROGRESS → RESOLVED` |
| F-43 | 댓글 작성·조회 | ✅ | |
| F-44 | 내가 쓴 글 / 민원 내역 조회 | ✅ | `MyPostsScreen` |
| F-45 | 게시글 이미지 첨부 | ⬜ | Q2 로드맵 |
| F-46 | 게시글 좋아요 | ⬜ | Q2 로드맵 |
| F-47 | 댓글 푸시 알림 | ⬜ | Q2 로드맵 |

### 2-8. 전자투표

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| F-48 | 투표 생성 (제목/선택지/종료일/익명 여부) | ✅ | |
| F-49 | 투표 참여 (라디오 선택) | ✅ | HEAD 세대주 전용 |
| F-50 | 1세대 1표 강제 (`@@unique([pollId, roomNumber])`) | ✅ | DB + 서버 이중 검증 |
| F-51 | 투표 결과 시각화 (퍼센트 바, 기명 시 호수 표시) | ✅ | |
| F-52 | 투표 참여율 실시간 프로그레스 바 | ✅ | |
| F-53 | 본인인증 + 타임스탬프 기반 법적 증거 능력 확보 | ⬜ | 장기 과제 |

### 2-9. 재무 장부

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| F-54 | 공용 지출 장부 조회 (입주민 투명성) | ✅ | `LedgerScreen` |
| F-55 | 장부 실데이터 연동 (`LedgerTransaction` DB) | ✅ | `getLedger`, `createLedgerTransaction` API 연동 완료 |
| F-56 | 영수증 첨부 (hasReceipt / receiptUrl) | ✅ | |
| F-57 | 에너지 사용량 시각화 (전기/수도 월별 그래프) | ⬜ | Q2 로드맵 |

### 2-10. 건물 이력 및 계약 관리

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| F-58 | 건물 수리·하자 이력 디지털 아카이빙 | ✅ | `BuildingHistoryScreen`, `BuildingEvent` 모델 |
| F-59 | 사진 첨부 (이미지 업로드 → URL 저장) | ✅ | multer, expo-image-picker |
| F-60 | 계약서/영수증 풀스크린 이미지 뷰어 | ✅ | `ContractDetailScreen` |
| F-61 | 파일 업로드 스토리지 S3 또는 Supabase Storage 마이그레이션 | ⬜ | 현재 로컬 디스크 |

### 2-11. 주차 관리

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| F-62 | 차량 등록 (일반/방문, 모델명, 출차 예정) | ✅ | `VehicleManagementScreen` |
| F-63 | 번호판 검색 → 호수·이름·방문여부 표시 | ✅ | `ParkingSearchScreen` |
| F-64 | QR 스캔으로 방문 차량 임시 등록 | ⬜ | Q2 로드맵 |

### 2-12. SaaS 구독 모델

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| F-65 | 1개월 무료 체험 → 유료 전환 (19,900원/월) | ✅ | `AdminSubscriptionScreen` |
| F-66 | 쿠폰 코드로 무료 기간 활성화 | ✅ | `Coupon` 모델, 원자적 isUsed |
| F-67 | Toss Payments 빌링키 자동결제 (구독료 전용) | ⬜ | 핵심 수익 모델 |
| F-68 | 구독 만료(EXPIRED) 시 핵심 기능 제한 미들웨어 | ✅ | `checkSubscription` 미들웨어 구현, 주요 생성 API 적용 |

### 2-13. 백오피스 관리자 웹

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| F-69 | SUPER_ADMIN 로그인 (JWT, 7일 만료) | ✅ | |
| F-70 | 전체 빌라·사용자 목록 조회 및 상태 관리 | ✅ | |
| F-71 | 시스템 공지사항 CRUD | ✅ | |
| F-72 | FAQ CRUD | ✅ | |
| F-73 | 관리자 가이드 라이브러리 CRUD (Tiptap 편집기, 썸네일) | ✅ | |
| F-74 | 플랫폼 KPI 대시보드 (구독 상태 차트, 신규 가입 추이) | ✅ | Recharts |
| F-75 | 빌라별 청구서/납부 현황 조회 | ⬜ | |

### 2-14. 듀얼 모드 및 UX

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| F-76 | 관리자 ↔ 입주민 모드 전환 (동대표 계정) | ✅ | `AppModeContext` |
| F-77 | 전화번호 입력 자동 포맷 (`010-XXXX-XXXX`) | ✅ | `SignupProfileScreen` |
| F-78 | 앱 이용 가이드 화면 | ✅ | `GuideScreen` |
| F-79 | 관리자 가이드 라이브러리 (모바일 열람) | ✅ | `GuideLibraryScreen`, `GuideDetailScreen` |
| F-80 | 롤링 배너 자동 스크롤 | ✅ | 3초 자동 전환 |

---

## 3. 비기능적 요구사항 (Non-Functional Requirements)

| # | 요구사항 | 상태 | 비고 |
|---|---------|------|------|
| NF-01 | 비밀번호 해싱 (bcrypt, rounds: 10) | ✅ | |
| NF-02 | API 응답에서 민감 필드 제외 (password, expoPushToken) | ✅ | `sanitizeUser()` 헬퍼 |
| NF-03 | JWT 기반 인증 미들웨어 (서버) | ✅ | SUPER_ADMIN + 구독 엔드포인트 |
| NF-04 | JWT 클라이언트 저장 및 API 헤더 일괄 적용 | ✅ | Axios interceptor 완성, 401 자동 로그아웃 포함 |
| NF-05 | XSS 방어 (Admin 웹 DOMPurify sanitize) | ✅ | C5 패치 |
| NF-06 | 오픈뱅킹 연동 — 조회 권한만, 이체 권한 배제 | ⬜ | 장기 과제 |
| NF-07 | 전자투표 본인인증 + 타임스탬프 (법적 증거 능력) | ⬜ | 장기 과제 |
| NF-08 | 최고 수준 보안 인증 (금융 데이터) | ⬜ | 장기 과제 |
| NF-09 | SafeArea 전면 적용 (iOS/Android 대응) | ✅ | `react-native-safe-area-context` |
| NF-10 | 키보드 UX (입력창 자동 스크롤, 버튼 키보드 위 고정) | ✅ | `KeyboardAvoidingView` + `ScrollView` |
| NF-11 | TypeScript 전면 적용 (프론트/백엔드) | ✅ | |
| NF-12 | 백엔드 모듈화 (도메인별 routes/controllers/middlewares 분리) | ✅ | 2026-03-11 리팩토링 완료 |
| NF-13 | 테스트 커버리지 (Jest + supertest) | ✅ | 30/32 통과 |

---

## 4. 기술 스택 (현재 구현 기준)

| 구분 | 현황 |
|------|------|
| Frontend | React Native (Expo) + TypeScript |
| Backend | Express + TypeScript (모듈형 — routes/controllers/middlewares) |
| ORM | Prisma 7 |
| Database | Supabase (PostgreSQL) |
| 인증 | JWT (30일 만료), bcryptjs |
| 결제 | PortOne(KG Inicis) 테스트 PG · Mock Toss Payments |
| 파일 업로드 | multer (로컬 디스크 → S3 마이그레이션 예정) |
| 이미지 선택 | expo-image-picker |
| 날짜 선택 | @react-native-community/datetimepicker |
| SafeArea | react-native-safe-area-context |
| 푸시 알림 | expo-notifications + expo-device + expo-server-sdk |
| PDF | expo-print + expo-sharing + expo-file-system |
| 클립보드 | expo-clipboard |
| 상태 관리 | React Context (AppModeContext) |
| Admin 웹 | React + Vite + TypeScript + Recharts + Tiptap |
| HTML 렌더링 (모바일) | react-native-render-html |
| XSS 방지 | DOMPurify (admin-web) |
| 테스트 | Jest + supertest |

---

## 5. 미구현 항목 우선순위 (백로그)

### 🔴 즉시 (이번 달)

| 우선순위 | 항목 | 관련 요구사항 |
|----------|------|--------------|
| ~~1~~ | ~~JWT 클라이언트 완성 — 모바일 API 인증 헤더 일괄 적용~~ ✅ | ~~NF-04, F-08~~ |
| 2 | 구독료 자동결제 — Toss Payments 빌링키 월 자동청구 | F-67 |
| ~~3~~ | ~~구독 만료(EXPIRED) API 제한 미들웨어~~ ✅ | ~~F-68~~ |
| ~~4~~ | ~~공용 장부 실데이터 연동 (`LedgerTransaction` DB)~~ ✅ | ~~F-55~~ |
| 5 | 동대표 교체 / 권한 위임 | F-15 |

### 🟡 다음 분기 (2026 Q2)

| 항목 | 관련 요구사항 |
|------|--------------|
| PG 결제 서버 검증 (`imp_uid` → PortOne API) | F-29 |
| 외부 청구 알림톡 자동 발송 | F-31 |
| 파일 업로드 S3/Supabase Storage 마이그레이션 | F-61 |
| 멀티 빌라 UI (동대표 2개 이상 전환) | F-14 |
| 민원 트래킹 강화 (상태 변경 + 입주민 실시간 알림) | F-42 |
| 에너지 사용량 시각화 (전기/수도 월별 그래프) | F-57 |
| 커뮤니티 강화 (게시글 이미지 첨부, 좋아요, 댓글 알림) | F-45, F-46, F-47 |
| QR 방문자 차량 임시 등록 | F-64 |
| 백오피스 — 빌라별 청구서/납부 현황 | F-75 |
| 네이버 소셜 로그인 | F-05 |

### 🟢 장기 (2026 하반기~)

| 항목 | 관련 요구사항 | 비고 |
|------|--------------|------|
| 오픈뱅킹 연동 (계좌 조회 권한만) | NF-06, F-55 | 금융위 허가 검토 필요 |
| 관리비 자동이체 | — | 금융위 허가 필요 |
| 전자투표 본인인증 + 타임스탬프 | F-53, NF-07 | 법적 증거 능력 |
| 공용 시설 예약 시스템 | — | |
| 카카오 알림톡 자동 발송 | F-35 | |

### 🚫 하지 않을 것 (현재 단계)

| 항목 | 이유 |
|------|------|
| 입주민 간 1:1 채팅 | 갈등 조장 리스크, 콘텐츠 모더레이션 부담, 핵심 가치와 무관 |
| 부동산 매물 연동 | 핵심 가치와 거리 멀고 경쟁 불가 |
| 관리비 카드결제 중계 (Villamate 수금 후 재송금) | 전자금융업자 등록 필요 — 법적 부담 |

---

## 6. 완료된 기능 전체 목록 (2026-03-11 기준)

### 인증/온보딩 화면
- `LoginScreen` — 소셜(카카오·구글)·이메일 로그인
- `EmailLoginScreen` — 이메일+비밀번호
- `SignupAgreementScreen` — 이용약관·개인정보 동의
- `SignupProfileScreen` — 이름·전화번호 입력 (전화번호 자동 포맷)
- `SelectRoleScreen` — 동대표/입주민 역할 선택
- `ProfileSetupScreen` — 소셜 로그인 후 정보 보완
- `OnboardingScreen` — 빌라 등록 (세대 호수 칩 UI)
- `ResidentJoinScreen` — 초대 코드 + 호수 picker 가입
- `VillaSearchScreen` — 빌라 검색 → 입주 신청
- `AdminSubscriptionScreen` — SaaS 구독 관리

### 관리자 탭 (5개)
- `DashboardScreen` — 위젯 + 롤링배너 + 듀얼 모드 전환
- `ManagementScreen` — 핵심 운영 액션 허브
- `CommunityTabScreen` — 커뮤니티 게시판
- `LedgerTabScreen` → `LedgerScreen` — 장부
- `ProfileScreen` — iOS 설정 스타일

### 입주민 탭 (4개)
- `ResidentDashboardScreen` — 위젯 + 롤링배너 + 관리자 복귀 버튼
- `ResidentCommunityTabScreen` — 커뮤니티 게시판
- `OurVillaScreen` — 빌라 정보 + 건물 이력 갤러리
- `ProfileScreen` — iOS 설정 스타일

### 스택 화면
- `AdminInvoiceScreen`, `AdminInvoiceDetailScreen`, `CreateInvoiceScreen`
- `ResidentInvoiceScreen` (PDF 저장/공유 포함), `PaymentScreen`
- `ResidentManagementScreen` (세대별 카드, 세대주/세입자 뱃지, 검색/필터, 초대코드 복사)
- `PostDetailScreen`, `CreatePostScreen`, `MyPostsScreen`
- `ParkingSearchScreen`, `VehicleManagementScreen`
- `BuildingHistoryScreen`, `CreateBuildingEventScreen`, `ContractDetailScreen`
- `ExternalBillingScreen`
- `CreatePollScreen`, `PollListScreen`, `PollDetailScreen`
- `TicketListScreen`, `CreateTicketScreen` (빌라 도메인 민원/수리 요청, COMMON_FACILITY/PARKING/NOISE_COMPLAINT/ETC 카테고리)
- `ChangePasswordScreen`
- `GuideScreen`, `GuideLibraryScreen`, `GuideDetailScreen`
- `NotificationScreen`, `SystemNoticeScreen`, `CustomerCenterScreen`

### 백오피스 웹 (`admin-web/`)
- `LoginPage`, `Dashboard` (KPI + Recharts), `UsersPage`, `VillasPage`
- `SystemNotices`, `Faqs`, `Guides` (Tiptap 편집기)

---

## 7. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-11 | 최초 작성 — PRODUCT_CONTEXT.md, IA.md, PHASE1_SCOPE.md 통합 정리 |
| 2026-03-11 | 백엔드 모듈화 완료 (NF-12 ✅), 전역 JWT 인증 완성 (F-08, NF-04 ✅), 전자투표 Upsert, 독촉 쿨타임 |
| 2026-03-12 | 장부 실데이터 연동 (F-55 ✅), 구독 만료 미들웨어 (F-68 ✅), 구독 만료 Cron 추가, Ticket 빌라 도메인 재설계, 건물 이력 이미지 업로드 실 연동, Paywall 무한루프 수정 |

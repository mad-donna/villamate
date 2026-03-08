# 빌라메이트 (Villamate) — 정보 아키텍처 (IA)

> 최종 업데이트: 2026-03-08
> 기준 브랜치: `main`

---

## 1. 서비스 개요

빌라메이트는 소규모 빌라·공동주택의 관리 업무를 디지털화하는 B2B SaaS 서비스다.
동대표(관리자)가 빌라를 등록하고 구독을 활성화하면, 입주민은 초대 코드로 빌라에 참여해 관리비 조회·결제, 공용 장부 열람, 커뮤니티 이용, 전자 투표 참여 등을 할 수 있다.
슈퍼 관리자는 별도 백오피스 웹에서 플랫폼 전체를 운영한다.

---

## 2. 사용자 유형

| 구분 | 역할 코드 | 주요 책임 | 진입 경로 |
|------|-----------|-----------|-----------|
| 동대표 | `ADMIN` | 빌라 등록·운영, 입주민 관리, 청구서 발행, 투표 생성 | 앱 → 역할 선택(동대표) → 빌라 등록 |
| 입주민 | `RESIDENT` | 관리비 조회·납부, 커뮤니티, 투표 참여 | 앱 → 역할 선택(입주민) → 초대 코드 입력 |
| 플랫폼 운영자 | `SUPER_ADMIN` | 전체 빌라·사용자 관리, 콘텐츠 발행 | 백오피스 웹 `/login` |

---

## 3. 채널별 구조 개요

| 채널 | 기술 스택 | 주 사용자 |
|------|-----------|-----------|
| 모바일 앱 (동대표) | React Native (Expo) | ADMIN |
| 모바일 앱 (입주민) | React Native (Expo, 동일 앱·역할 분기) | RESIDENT |
| 백오피스 웹 | React + Vite + Tailwind + React Router | SUPER_ADMIN |

---

## 4. 모바일 앱 — 인증 및 온보딩 플로우

### 4-1. 전체 인증 흐름

```
앱 실행
  │
  ├── [AsyncStorage userId + user 존재?]
  │         │
  │        YES ──── phone 등록됨?
  │                    │
  │                   NO ──────────────────────> ProfileSetup
  │                   YES
  │                    │
  │              role == ADMIN?
  │             /             \
  │           YES              NO (RESIDENT)
  │            │                │
  │       빌라 존재?        villa 가입됨?
  │       /        \          /         \
  │     YES         NO      YES           NO
  │      │          │        │             │
  │  Main(탭)   Onboarding  ResidentDashboard(탭)  ResidentJoin
  │
  └── [저장 없음] ──> Login
```

### 4-2. 공통 인증·온보딩 화면

| Route Name | 파일 | 설명 |
|------------|------|------|
| `Login` | `LoginScreen.tsx` | 소셜(카카오·구글)·이메일·전화번호 로그인 |
| `EmailLogin` | `EmailLoginScreen.tsx` | 이메일+비밀번호 입력 |
| `SignupAgreement` | `SignupAgreementScreen.tsx` | 이용약관 동의 |
| `SignupProfile` | `SignupProfileScreen.tsx` | 회원가입 프로필 입력 |
| `ProfileSetup` | `ProfileSetupScreen.tsx` | 소셜 로그인 후 전화번호·이메일 보완 |
| `SelectRole` | `SelectRoleScreen.tsx` | 동대표 / 입주민 역할 선택 |
| `Onboarding` | `OnboardingScreen.tsx` | ADMIN 전용 — 빌라 등록 |
| `AdminSubscription` | `AdminSubscriptionScreen.tsx` | ADMIN 전용 — 구독 상태 검증 |
| `VillaSearch` | `VillaSearchScreen.tsx` | RESIDENT 전용 — 빌라 검색 |
| `ResidentJoin` | `ResidentJoinScreen.tsx` | RESIDENT 전용 — 초대 코드 + 호수 입력 |

---

## 5. 동대표 앱 — 탭 구조

> `MainTabNavigator` (Bottom Tab, 5탭)

```
[🏠 홈] [⚙️ 관리] [💬 커뮤니티] [📒 장부] [👤 프로필]
```

### 5-1. 🏠 홈 탭 (`DashboardScreen`)

**역할**: 상태 인지(Status Awareness) 전용. 액션 버튼 없음.

| 위젯 | 데이터 | 탭 시 이동 |
|------|--------|-----------|
| 미납 관리비 카드 | `totalUnpaidCount` | `AdminInvoice` |
| 확인 대기 카드 | `pendingExternalBillsCount` | `ExternalBilling` |
| 최근 공지 카드 | `latestNotice` | `PostDetail` |
| 진행중인 투표 카드 | `activePollsCount` | `PollList` |
| 입주민 명단 | residents 목록 | — |

### 5-2. ⚙️ 관리 탭 (`ManagementScreen`)

**역할**: 동대표 핵심 운영 액션 전담.

| 메뉴 항목 | 이동 화면 |
|-----------|-----------|
| 새 청구서 발행하기 | `CreateInvoice` |
| 입주민 및 전출입 관리 | `ResidentManagement` |
| 건물 이력 및 계약 관리 | `BuildingHistory` → `ContractDetail` |
| 전자 투표 관리 | `PollList` → `PollDetail` → `CreatePoll` |
| 외부 청구서 발송 | `ExternalBilling` |

### 5-3. 💬 커뮤니티 탭 (`CommunityTabScreen`)

**역할**: 입주민 소통 전담.

- `BoardScreen` 인라인 렌더링 (villaId·userId AsyncStorage 자동 resolve)
- 헤더 우측 📄 아이콘 → `MyPosts` (내가 쓴 글)
- 게시글 탭 → `PostDetail`
- 글쓰기 → `CreatePost`

### 5-4. 📒 장부 탭 (`LedgerTabScreen` → `LedgerScreen`)

**역할**: 재무 투명성 전담.

- 수입·지출 내역 등록·조회
- 영수증 첨부 (hasReceipt / receiptUrl)

### 5-5. 👤 프로필 탭 (`ProfileScreen`)

| 섹션 | 항목 |
|------|------|
| 내 집 | 내 차량 관리 |
| 가이드 (ADMIN만 표시) | 관리자 가이드 라이브러리 |
| 계정 정보 | 비밀번호 변경 |
| 앱 설정 | 푸시 알림 설정 |
| 고객센터 & 약관 | 공지사항, 고객센터(FAQ), 이용약관, 개인정보처리방침 |
| 계정 관리 | 로그아웃, 회원 탈퇴 |

### 5-6. 스택 화면 (탭 외부)

| Route Name | 파일 | 진입 경로 |
|------------|------|-----------|
| `AdminInvoice` | `AdminInvoiceScreen.tsx` | 홈 위젯 또는 관리 탭 |
| `AdminInvoiceDetail` | `AdminInvoiceDetailScreen.tsx` | AdminInvoice에서 |
| `CreateInvoice` | `CreateInvoiceScreen.tsx` | 관리 탭 |
| `ResidentManagement` | `ResidentManagementScreen.tsx` | 관리 탭 |
| `PollList` | `PollListScreen.tsx` | 홈 위젯 또는 관리 탭 |
| `PollDetail` | `PollDetailScreen.tsx` | PollList에서 |
| `CreatePoll` | `CreatePollScreen.tsx` | PollList에서 |
| `BuildingHistory` | `BuildingHistoryScreen.tsx` | 관리 탭 |
| `CreateBuildingEvent` | `CreateBuildingEventScreen.tsx` | BuildingHistory에서 |
| `ContractDetail` | `ContractDetailScreen.tsx` | BuildingHistory에서 |
| `ExternalBilling` | `ExternalBillingScreen.tsx` | 홈 위젯 또는 관리 탭 |
| `ParkingSearch` | `ParkingSearchScreen.tsx` | 관리 탭 |
| `PostDetail` | `PostDetailScreen.tsx` | 커뮤니티 탭 |
| `CreatePost` | `CreatePostScreen.tsx` | 커뮤니티 탭 |
| `MyPosts` | `MyPostsScreen.tsx` | 커뮤니티 탭 헤더 |
| `GuideLibrary` | `GuideLibraryScreen.tsx` | 프로필 탭 (ADMIN) |
| `Notifications` | `NotificationScreen.tsx` | 홈 헤더 벨 아이콘 |
| `SystemNotice` | `SystemNoticeScreen.tsx` | 프로필 탭 |
| `CustomerCenter` | `CustomerCenterScreen.tsx` | 프로필 탭 |
| `VehicleManagement` | `VehicleManagementScreen.tsx` | 프로필 탭 |
| `ChangePassword` | `ChangePasswordScreen.tsx` | 프로필 탭 |

---

## 6. 입주민 앱 — 탭 구조

> `ResidentTabNavigator` (Bottom Tab, 4탭)

```
[🏠 홈] [💬 커뮤니티] [🏢 우리 빌라] [👤 프로필]
```

### 6-1. 🏠 홈 탭 (`ResidentDashboardScreen`)

**역할**: 나의 현황 인지 전용.

| 위젯 | 데이터 | 탭 시 이동 |
|------|--------|-----------|
| 미납 관리비 카드 | `myUnpaidAmount` | `ResidentInvoice` |
| 최근 공지 카드 | `latestNotice` | `PostDetail` |
| 내 차량 카드 | `myVehicleCount` | 프로필 탭 |
| 참여 가능한 투표 카드 | `activePollsCount` | `PollList` |

### 6-2. 💬 커뮤니티 탭 (`ResidentCommunityTabScreen`)

- `BoardScreen` 인라인 렌더링 (villaId·userId AsyncStorage 자동 resolve, userRole='RESIDENT')
- 헤더 우측 📄 아이콘 → `MyPosts` (내가 쓴 글)
- 게시글 탭 → `PostDetail`
- 글쓰기 → `CreatePost`

### 6-3. 🏢 우리 빌라 탭 (`OurVillaScreen`)

**역할**: 빌라 정보 + 투명성 정보 열람.

| 섹션 | 항목 | 이동 화면 |
|------|------|-----------|
| 관리 | 건물 이력 및 수리 내역 | `BuildingHistory` |
| 관리 | 회계 장부 | `Ledger` |
| 관리 | 전자 투표 | `PollList` → `PollDetail` |
| 관리비 | 관리비 조회 | `ResidentInvoice` |
| 차량 | 우리 집 차량 관리 | `VehicleManagement` |
| 가이드 | 이용 가이드 | `Guide` |

### 6-4. 👤 프로필 탭 (`ProfileScreen`)

| 섹션 | 항목 |
|------|------|
| 내 집 | 내 차량 관리 |
| 계정 정보 | 비밀번호 변경 |
| 앱 설정 | 푸시 알림 설정 |
| 고객센터 & 약관 | 공지사항, 고객센터(FAQ), 이용약관, 개인정보처리방침 |
| 계정 관리 | 로그아웃, 회원 탈퇴 |

### 6-5. 스택 화면 (탭 외부)

| Route Name | 파일 | 진입 경로 |
|------------|------|-----------|
| `ResidentInvoice` | `ResidentInvoiceScreen.tsx` | 홈 위젯 또는 우리 빌라 탭 |
| `Payment` | `PaymentScreen.tsx` | ResidentInvoice에서 |
| `PollList` | `PollListScreen.tsx` | 홈 위젯 |
| `PollDetail` | `PollDetailScreen.tsx` | PollList에서 |
| `BuildingHistory` | `BuildingHistoryScreen.tsx` | 우리 빌라 탭 |
| `Ledger` | `LedgerScreen.tsx` | 우리 빌라 탭 |
| `PostDetail` | `PostDetailScreen.tsx` | 커뮤니티 탭 |
| `CreatePost` | `CreatePostScreen.tsx` | 커뮤니티 탭 |
| `MyPosts` | `MyPostsScreen.tsx` | 커뮤니티 탭 헤더 |
| `Guide` | `GuideScreen.tsx` | 우리 빌라 탭 |
| `GuideLibrary` | `GuideLibraryScreen.tsx` | Guide에서 |
| `GuideDetail` | `GuideDetailScreen.tsx` | GuideLibrary에서 |
| `Notifications` | `NotificationScreen.tsx` | 홈 헤더 벨 아이콘 |
| `SystemNotice` | `SystemNoticeScreen.tsx` | 프로필 탭 |
| `CustomerCenter` | `CustomerCenterScreen.tsx` | 프로필 탭 |
| `VehicleManagement` | `VehicleManagementScreen.tsx` | 프로필 탭 |
| `ChangePassword` | `ChangePasswordScreen.tsx` | 프로필 탭 |

---

## 7. 백오피스 웹 — 사이드바 구조

> React Router DOM, `Layout.tsx` 사이드바 + `<Outlet />` 패턴

### 섹션 1: 플랫폼 운영

| 라벨 | Route | 파일 | 역할 |
|------|-------|------|------|
| 📊 대시보드 | `/dashboard` | `Dashboard.tsx` | 전체 KPI (역할별 유저 수, 구독 상태별 빌라 수 차트) |
| 🏢 빌라 관리 | `/villas` | `Villas.tsx` | 빌라 목록, 상태 필터 (APPROVED/PENDING/REJECTED) |
| 🏢 빌라 상세 | `/villas/:villaId` | `VillaDetail.tsx` | 빌라 정보 + 입주민 목록 |
| 👥 사용자 관리 | `/users` | `Users.tsx` | 전체 유저 목록 (역할·상태 표시) |

### 섹션 2: 콘텐츠 관리

| 라벨 | Route | 파일 | 역할 |
|------|-------|------|------|
| 📢 공지사항 | `/notices` | `SystemNotices.tsx` | 시스템 공지 CRUD |
| ❓ FAQ | `/faqs` | `Faqs.tsx` | FAQ CRUD (아코디언 뷰) |
| 📚 매거진/가이드 | `/guides` | `Guides.tsx` | 가이드 CRUD (Tiptap 에디터, 카테고리·썸네일) |

### 인증

- 진입: `/login` → `Login.tsx`
- 인증 성공 시 `localStorage`에 `admin_token`, `admin_user` 저장
- 모든 라우트는 `<ProtectedRoute>` 래퍼로 보호
- 로그아웃 시 localStorage 초기화 → `/login` 리다이렉트

---

## 8. 전체 화면 스택 구조 (AppNavigator)

```
AppNavigator (NativeStack)
│
├── [공통 인증]
│   ├── Login
│   ├── EmailLogin
│   ├── SignupAgreement
│   ├── SignupProfile
│   ├── ProfileSetup
│   └── SelectRole
│
├── [ADMIN 온보딩]
│   ├── Onboarding
│   └── AdminSubscription
│
├── Main ──────────────────── MainTabNavigator (동대표 5탭)
│   ├── 홈 (DashboardScreen)
│   ├── 관리 (ManagementScreen)
│   ├── 커뮤니티 (CommunityTabScreen → BoardScreen)
│   ├── 장부 (LedgerTabScreen → LedgerScreen)
│   └── 프로필 (ProfileScreen)
│
├── [RESIDENT 온보딩]
│   ├── VillaSearch
│   └── ResidentJoin
│
├── ResidentDashboard ─────── ResidentTabNavigator (입주민 4탭)
│   ├── 홈 (ResidentDashboardScreen)
│   ├── 커뮤니티 (ResidentCommunityTabScreen → BoardScreen)
│   ├── 우리 빌라 (OurVillaScreen)
│   └── 프로필 (ProfileScreen)
│
└── [공용 스택 화면 — 양쪽 탭에서 push]
    ├── AdminInvoice / AdminInvoiceDetail / CreateInvoice
    ├── ResidentInvoice / Payment
    ├── ResidentManagement
    ├── PollList / PollDetail / CreatePoll
    ├── BuildingHistory / CreateBuildingEvent / ContractDetail
    ├── ExternalBilling
    ├── ParkingSearch
    ├── Board / PostDetail / CreatePost / MyPosts
    ├── Ledger
    ├── Guide / GuideLibrary / GuideDetail
    ├── Notifications / SystemNotice / CustomerCenter
    └── VehicleManagement / ChangePassword
```

---

## 9. 주요 설계 결정

| 항목 | 현황 | 비고 |
|------|------|------|
| 인증 방식 | JWT (Bearer Token) + AsyncStorage 저장 | 보안 패치 완료 (C1) |
| 비밀번호 응답 | API 응답에서 password 필드 제외 | 보안 패치 완료 (C2) |
| XSS 방어 | 입력값 sanitize 처리 | 보안 패치 완료 (C5) |
| 전자 투표 익명성 | `isAnonymous` 플래그 — 서버에서 voter 정보 마스킹 | DB·API·UI 모두 구현 |
| 투표 참여율 | `totalEligibleVoters` / `totalVotes` Progress Bar | PollDetailScreen 구현 |
| 1세대 1표 | `Vote` 테이블 `@@unique([pollId, roomNumber])` | DB 레벨 강제 |
| 구독 모델 | `subscriptionStatus` / `subscriptionExpiry` — 1개월 무료 | Villa 모델, AdminSubscriptionScreen |
| 푸시 알림 | `expoPushToken` 저장, 수동 발송 API | NotificationScreen |
| 소셜 로그인 | 카카오·구글 구현, Naver UI만 존재 (미연동) | Naver 연동 시 별도 작업 필요 |
| 빌라-ADMIN 관계 | 1 ADMIN → N Villa (현재 UI는 단일 빌라 기준) | 멀티 빌라 UI 미구현 |
| 결제 처리 | PaymentScreen UI만 존재, PG 미연동 | 토스페이먼츠 등 연동 필요 |
| 로컬 상태 관리 | AsyncStorage + useState (전역 상태 관리 없음) | 규모 커지면 Zustand 도입 고려 |
| 데이터베이스 | PostgreSQL (Supabase) + Prisma ORM | `DATABASE_URL`, `DIRECT_URL` 환경변수 필요 |

---

## 10. IA 변경 이력

| 날짜 | 버전 | 주요 변경 |
|------|------|-----------|
| 2026-02-24 | v1.0 | 초기 작성 (MVP 기준) |
| 2026-03-08 | v2.0 | 전면 개편 — 동대표 5탭(장부 탭 신설), 입주민 4탭 공식화, 백오피스 섹션화, 커뮤니티 탭 "내가 쓴 글" 이동, 우리 빌라 탭 회계장부·가이드 추가, 전자투표 익명+참여율 기능 반영 |

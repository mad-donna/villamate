# 빌라메이트 (Villamate) — 정보 아키텍처 (IA)

> 최종 업데이트: 2026-02-24
> 기준 브랜치: `main`

---

## 1. 서비스 개요

빌라메이트는 소규모 빌라·공동주택의 관리 업무를 디지털화하는 모바일 앱이다.
동대표(관리자)가 빌라를 등록하고 청구서를 발행하면, 입주민은 초대 코드로 빌라에 참여해 관리비를 조회·결제하고 공용 장부를 확인할 수 있다.

---

## 2. 사용자 유형

| 구분 | 역할 코드 | 주요 책임 | 진입 경로 |
|------|-----------|-----------|-----------|
| 동대표 | `ADMIN` | 빌라 등록, 입주민 관리, 청구서 발행, 공용 장부 관리 | 회원가입 후 역할 선택 → 빌라 등록 |
| 입주민 | `RESIDENT` | 초대 코드로 빌라 입장, 관리비 조회·결제, 공용 장부 열람 | 회원가입 후 역할 선택 → 초대 코드 입력 |

> 역할(role)은 User 레코드에 저장되며, 소셜 로그인으로 신규 가입 시 기본값은 `RESIDENT`이다.
> 전화번호 테스트 로그인 시에는 로그인 버튼(동대표 / 입주민)으로 역할을 직접 지정한다.

---

## 3. 전체 화면 목록

### 3-1. 인증 / 공통 화면

| 화면 이름 | Route Name | 파일 | 역할 | 진입 조건 |
|-----------|------------|------|------|-----------|
| 로그인 | `Login` | `LoginScreen.tsx` | 소셜·이메일·전화번호 로그인 선택 | 앱 최초 실행 또는 미인증 상태 |
| 이메일 로그인 | `EmailLogin` | `EmailLoginScreen.tsx` | 이메일+비밀번호 입력 | LoginScreen에서 "이메일로 시작하기" 탭 |
| 프로필 설정 | `ProfileSetup` | `ProfileSetupScreen.tsx` | 이름·전화번호 입력, 역할(ADMIN/RESIDENT) 선택 | 소셜/이메일 로그인 후 phone 미등록 시 |

### 3-2. 동대표(ADMIN) 전용 화면

| 화면 이름 | Route Name | 파일 | 역할 | 진입 조건 |
|-----------|------------|------|------|-----------|
| 빌라 등록 | `Onboarding` | `OnboardingScreen.tsx` | 빌라 이름·주소·세대수·공용 계좌 등록, 초대 코드 발급 | ADMIN 로그인 후 등록된 빌라 없을 때 |
| 홈 대시보드 | `Main > 홈` | `DashboardScreen.tsx` | 빌라 현황 요약 (세대수, 입주민 수, 공용 계좌 정보) | ADMIN + 빌라 등록 완료 |
| 청구서 발행 | `Main > 청구` / `CreateInvoice` | `CreateInvoiceScreen.tsx` | 관리비 청구서 작성·발행 | ADMIN 탭 메뉴 또는 스택 직접 이동 |
| 입주민 관리 | `Main > 입주민` | `ResidentManagementScreen.tsx` | 입주민 목록 조회, 호수·납부 현황 관리 | ADMIN 탭 메뉴 |
| 공용 장부 | `Main > 공용 장부` / `Ledger` | `LedgerScreen.tsx` | 수입·지출 내역 등록·조회 | ADMIN 탭 메뉴 (RESIDENT도 열람 가능, 별도 스택 라우트로 접근) |
| 프로필 | `Main > 프로필` | `ProfileScreen.tsx` | 사용자 정보 확인, 로그아웃 | ADMIN 탭 메뉴 |

### 3-3. 입주민(RESIDENT) 전용 화면

| 화면 이름 | Route Name | 파일 | 역할 | 진입 조건 |
|-----------|------------|------|------|-----------|
| 빌라 입장 | `ResidentJoin` | `ResidentJoinScreen.tsx` | 초대 코드 + 동/호수 입력으로 빌라 합류 | RESIDENT 로그인 후 미가입 빌라 없을 때 |
| 마이 홈 | `ResidentDashboard` | `ResidentDashboardScreen.tsx` | 이번 달 관리비 조회, 납부 상태 확인, 결제 수단 선택 | RESIDENT + 빌라 가입 완료 |
| 결제하기 | `Payment` | `PaymentScreen.tsx` | 카드·계좌이체 등 결제 처리 | ResidentDashboard에서 "관리비 결제하기" 탭 |

---

## 4. 네비게이션 구조

### 4-1. 전체 스택 구조 (AppNavigator)

```
AppNavigator (Stack)
├── Login                    -- 진입점 (initialRoute)
├── EmailLogin
├── ProfileSetup
├── Main  ──────────────────── MainTabNavigator (Tab, ADMIN 전용)
│   ├── 홈                   (DashboardScreen)
│   ├── 청구                 (CreateInvoiceScreen)
│   ├── 입주민               (ResidentManagementScreen)
│   ├── 공용 장부            (LedgerScreen)
│   └── 프로필               (ProfileScreen)
├── Onboarding               -- ADMIN 전용 스택
├── CreateInvoice            -- ADMIN 스택 (탭 외부에서 직접 접근 시)
├── ResidentDashboard        -- RESIDENT 전용 스택
├── ResidentJoin             -- RESIDENT 전용 스택
├── Payment                  -- RESIDENT 전용 스택
└── Ledger                   -- 공용 (스택 직접 접근)
```

> MainTabNavigator는 ADMIN 전용이다. RESIDENT는 탭 없이 스택 화면만 사용한다.
> `Ledger`는 탭 내부(ADMIN)와 스택(향후 RESIDENT 연동 가능) 두 경로로 존재한다.

---

## 5. 인증 전/후 전체 플로우

```
앱 실행
  |
  +-- [AsyncStorage에 userId + user 존재?]
  |         |
  |        YES ──── phone 등록됨?
  |                    |
  |                   NO  ──────────────────────────> ProfileSetup
  |                   YES
  |                    |
  |              role == ADMIN?
  |             /             \
  |           YES              NO (RESIDENT)
  |            |                |
  |       빌라 존재?        villa 가입됨?
  |       /        \          /         \
  |     YES         NO      YES           NO
  |      |          |        |             |
  |    Main    Onboarding  ResidentDashboard  ResidentJoin
  |
  +-- [저장 없음] ──────────> Login
                                |
              +-----------------+------------------+----------+
              |                 |                  |          |
          이메일           카카오 로그인       구글 로그인    테스트(전화번호)
              |                 |                  |          |
              +--------+--------+------------------+----------+
                       |
                   백엔드 인증 완료 (User 생성 또는 조회)
                       |
                  phone 없으면 → ProfileSetup
                  phone 있으면 → 역할별 라우팅 (위 트리 반복)
```

---

## 6. ADMIN (동대표) 상세 플로우

```
[최초 가입]
  LoginScreen
    └─> (소셜/이메일) ProfileSetup
          └─> 역할: ADMIN 선택 → Onboarding (빌라 등록)
                    ├─ 빌라 이름, 주소 (다음 우편번호 API), 세대수 입력
                    ├─ 은행 선택 + 공용 계좌번호 입력
                    └─ 등록 완료 → 초대 코드 발급 → Main (탭 진입)

[재방문 / 자동 로그인]
  Login → (빌라 존재 확인) → Main

[일상 업무 — MainTabNavigator]
  홈 탭 (DashboardScreen)
    └─> 빌라 요약 정보 (입주민 수, 공용 계좌 등) 확인

  청구 탭 (CreateInvoiceScreen)
    └─> 관리비 청구서 작성·발행

  입주민 탭 (ResidentManagementScreen)
    └─> 입주민 목록 조회
        └─> 호수별 납부 현황 확인

  공용 장부 탭 (LedgerScreen)
    └─> 수입/지출 항목 등록
        └─> 영수증 첨부 (hasReceipt / receiptUrl)
        └─> 내역 목록 조회

  프로필 탭 (ProfileScreen)
    └─> 사용자 정보 확인
        └─> 로그아웃
```

---

## 7. RESIDENT (입주민) 상세 플로우

```
[최초 가입]
  LoginScreen
    └─> (소셜/이메일) ProfileSetup
          └─> 역할: RESIDENT 선택 → ResidentJoin (빌라 입장)
                    ├─ 초대 코드 입력 (동대표에게 전달받음)
                    ├─ 동/호수 입력
                    └─> ResidentDashboard

[재방문 / 자동 로그인]
  Login → (빌라 가입 여부 확인) → ResidentDashboard

[일상 사용 — ResidentDashboard]
  ResidentDashboard (마이 홈)
    ├─> 이번 달 관리비 금액 확인
    ├─> 납부 기한 확인
    ├─> 납부 상태 (미납 / 납부 완료) 확인
    └─> "관리비 결제하기" 탭
          └─> PaymentScreen (결제 수단 선택)
                └─> 결제 완료 → ResidentDashboard (isPaid: true 파라미터 반환)

[공용 장부 열람]
  ResidentDashboard → Ledger (스택 라우트, 조회 전용)
```

---

## 8. 백엔드 API 목록

| HTTP 메서드 | 엔드포인트 | 역할 | 주요 파라미터 | 사용 화면 |
|-------------|------------|------|---------------|-----------|
| `GET` | `/api/health` | 서버 상태 확인 | - | 내부 헬스체크 |
| `POST` | `/api/auth/login` | 전화번호 기반 로그인 (Find or Create) | `phone`, `name`, `role` | LoginScreen (테스트 모달) |
| `POST` | `/api/auth/email-login` | 이메일 기반 로그인 (Upsert, MVP — 패스워드 해싱 없음) | `email`, `password` | EmailLoginScreen |
| `POST` | `/api/auth/social-login` | 카카오·구글 소셜 로그인 (Find or Create) | `provider`, `providerId`, `email`, `name` | LoginScreen |
| `GET` | `/api/auth/proxy` | 소셜 로그인 OAuth 리다이렉트 중계 (exp:// 딥링크 반환) | `code`, `token` (OAuth params) | OAuth 콜백 |
| `PUT` | `/api/users/:id` | 사용자 프로필 업데이트 (이름, 전화번호, 역할) | `phone`, `role`, `name` | ProfileSetupScreen |
| `POST` | `/api/villas` | 빌라 등록 + 초대 코드 자동 생성 | `name`, `address`, `totalUnits`, `adminId`, `accountNumber`, `bankName` | OnboardingScreen |
| `POST` | `/api/villas/join` | 초대 코드로 빌라 입장 (ResidentRecord 생성) | `userId`, `inviteCode`, `roomNumber` | ResidentJoinScreen |
| `GET` | `/api/villas/:adminId` | ADMIN의 빌라 목록 조회 (입주민 포함) | `adminId` (path) | DashboardScreen, LoginScreen (자동 로그인) |

### 현재 미구현 API (향후 필요)

| 용도 | 예상 엔드포인트 | 관련 화면 |
|------|-----------------|-----------|
| 청구서 발행 | `POST /api/invoices` | CreateInvoiceScreen |
| 청구서 목록 조회 | `GET /api/invoices/:villaId` | ResidentDashboard |
| 결제 처리 | `POST /api/payments` | PaymentScreen |
| 장부 항목 등록 | `POST /api/ledger` | LedgerScreen |
| 장부 내역 조회 | `GET /api/ledger/:villaId` | LedgerScreen |
| 입주민 상세 / 납부 현황 | `GET /api/villas/:villaId/residents` | ResidentManagementScreen |

---

## 9. 데이터 모델 요약

### 모델 관계도

```
User (1) ──── (N) Villa          [관계: VillaAdmin — 동대표가 빌라를 관리]
User (1) ──── (N) ResidentRecord [관계: 입주민이 빌라에 참여]
Villa (1) ─── (N) ResidentRecord [관계: 빌라에 여러 입주민]
Villa (1) ─── (N) LedgerTransaction [관계: 빌라의 수입/지출 내역]
```

### User

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | String (UUID) | PK |
| `role` | String | `ADMIN` 또는 `RESIDENT` (기본값: `RESIDENT`) |
| `provider` | String | `LOCAL`, `KAKAO`, `GOOGLE`, `NAVER` |
| `providerId` | String? | 소셜 로그인 고유 ID (Unique) |
| `email` | String? | 이메일 (Unique) |
| `name` | String | 사용자 이름 |
| `phone` | String? | 전화번호 (Unique) — 미등록 시 ProfileSetup 강제 진입 |
| `profileImage` | String? | 프로필 이미지 URL |
| `status` | String | `ACTIVE` (기본값) |

### Villa

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | Int (autoincrement) | PK |
| `name` | String | 빌라 이름 |
| `address` | String | 도로명 주소 |
| `totalUnits` | Int | 총 세대수 |
| `adminId` | String | FK → User.id (동대표) |
| `accountNumber` | String | 공용 계좌번호 |
| `bankName` | String | 은행명 |
| `inviteCode` | String? | 초대 코드 (Unique, 6자리 랜덤 alphanumeric) |

### ResidentRecord

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | Int | PK |
| `villaId` | Int | FK → Villa.id |
| `userId` | String | FK → User.id |
| `roomNumber` | String | 동/호수 (예: "302호") |
| `joinedAt` | DateTime | 입주 일시 |

### LedgerTransaction

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | Int | PK |
| `villaId` | Int | FK → Villa.id |
| `date` | DateTime | 거래 일시 |
| `description` | String | 내역 설명 |
| `amount` | Int | 금액 (원 단위) |
| `type` | String | `INCOME` (수입) 또는 `EXPENSE` (지출) |
| `hasReceipt` | Boolean | 영수증 첨부 여부 |
| `receiptUrl` | String? | 영수증 이미지 URL |

---

## 10. 주요 설계 결정 및 기술 참고사항

| 항목 | 현황 | 비고 |
|------|------|------|
| 인증 방식 | JWT 없음 — AsyncStorage에 userId/user 객체 저장 | MVP 수준, 프로덕션 전 JWT 도입 필요 |
| 이메일 로그인 | 비밀번호 해싱 없음 | MVP 주석 명시, 보안 강화 필요 |
| 소셜 로그인 | Kakao, Google 구현, Naver UI만 존재 (미연동) | Naver 연동 시 별도 작업 필요 |
| 빌라-ADMIN 관계 | 1 ADMIN → N Villa 구조 (현재 UI는 단일 빌라 기준) | 멀티 빌라 관리 UI 미구현 |
| RESIDENT 장부 접근 | 스택 라우트(`Ledger`)로 접근 가능하나 진입 버튼 미구현 | ResidentDashboard에 장부 버튼 추가 필요 |
| 결제 처리 | PaymentScreen UI만 존재, 실제 PG 연동 없음 | 토스페이먼츠 등 연동 필요 |
| 청구서 데이터 모델 | Invoice 모델 미존재 | LedgerTransaction과 별도 설계 고려 |
| 주소 검색 | 다음 우편번호 API (WebView 내 삽입) | OnboardingScreen |
| 로컬 상태 관리 | AsyncStorage + useState (전역 상태 관리 없음) | 규모 커지면 Zustand/Redux 도입 고려 |
| 데이터베이스 | PostgreSQL (Supabase) + Prisma ORM | `DATABASE_URL`, `DIRECT_URL` 환경변수 필요 |

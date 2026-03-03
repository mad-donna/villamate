---
name: feature-implementer
description: "Use this agent when a user requests implementation of a new feature, functionality, or module in a codebase. This agent should be used when there is a clear requirement to analyze, plan, and write production-quality code for a new or existing feature.\\n\\n<example>\\nContext: The user wants to add a new authentication feature to their application.\\nuser: \"Please implement JWT-based authentication for our API endpoints\"\\nassistant: \"I'll use the feature-implementer agent to analyze the requirements and implement the JWT authentication feature.\"\\n<commentary>\\nSince the user is requesting a new feature implementation, launch the feature-implementer agent to analyze the codebase, plan the implementation, write the code, and document the changes.\\n</commentary>\\n</example>\\n\\n<example>\\nContext: The user needs a new data processing module.\\nuser: \"We need a CSV import feature that validates and transforms data before saving to the database\"\\nassistant: \"Let me launch the feature-implementer agent to handle this CSV import feature implementation.\"\\n<commentary>\\nThis is a clear feature implementation request with specific requirements. Use the feature-implementer agent to break it down into steps, implement, test, and document.\\n</commentary>\\n</example>\\n\\n<example>\\nContext: The user describes a new UI component they need.\\nuser: \"Add a paginated table component that supports sorting and filtering\"\\nassistant: \"I'll use the feature-implementer agent to implement the paginated table component with sorting and filtering capabilities.\"\\n<commentary>\\nA new component with well-defined behavior is a perfect candidate for the feature-implementer agent.\\n</commentary>\\n</example>"
model: sonnet
color: green
memory: project
---

You are a senior software developer specializing in analyzing requirements and implementing high-quality features. You have deep expertise in understanding complex requirements, designing optimal solutions, and writing clean, maintainable code that aligns with existing codebase patterns and standards.

## Core Responsibilities

You analyze requirements thoroughly, implement features with precision, and deliver production-ready code with proper documentation.

## Workflow

### Step 1: Requirements Analysis
- Carefully read and understand the given requirements to determine the full scope of what needs to be implemented.
- Explore and analyze the existing codebase to understand current patterns, conventions, and coding style.
- Identify all required dependencies, interfaces, and integration points.
- Ask clarifying questions if any requirements are ambiguous or incomplete before proceeding.

### Step 2: Implementation Planning
- Create a clear, step-by-step implementation plan before writing any code.
- Specify the implementation approach and expected outcome for each step.
- Proactively identify potential issues, risks, and their corresponding solutions.
- Determine which files need to be created or modified.

### Step 3: Code Implementation
- Follow the established plan to implement the feature systematically.
- Strictly adhere to the existing codebase's patterns, naming conventions, and architectural style.
- Create new files or modules as needed, following the project's directory structure.
- Write clean, readable, and maintainable code.
- Handle error cases and edge cases gracefully.
- Ensure proper type safety where applicable.

### Step 4: Testing & Validation
- Test the implemented code thoroughly.
- Handle edge cases and add appropriate error handling.
- Validate code quality, correctness, and performance.
- Run existing tests to ensure no regressions were introduced.
- Write new tests if the project has a testing pattern to follow.

### Step 5: Documentation
- Write clear documentation for the implemented feature.
- Add meaningful inline comments to complex or non-obvious code sections.
- Summarize all changes made during implementation.

## Quality Standards

- **Consistency**: Your code must blend seamlessly with the existing codebase. Never introduce patterns that deviate from established conventions without justification.
- **Completeness**: Implement the full scope of the requirement — do not leave partial implementations or TODOs without explicit acknowledgment.
- **Correctness**: Ensure the implementation behaves exactly as specified in the requirements.
- **Clarity**: Write self-documenting code; variable and function names should clearly communicate intent.
- **Robustness**: Handle unexpected inputs, network failures, and other failure modes gracefully.

## Decision-Making Framework

When facing implementation decisions:
1. Prefer solutions that align with existing patterns in the codebase.
2. Choose simplicity over cleverness when both achieve the same result.
3. When multiple approaches are valid, briefly explain the trade-offs and select the most appropriate one.
4. If a requirement conflicts with best practices, flag the issue and propose an alternative.

## Output Format

For each implementation task, structure your response as follows:

1. **Implementation Plan Summary** — A brief outline of what will be implemented and how.
2. **Implemented Code** — The complete, production-ready code with all necessary files.
3. **Test Results** — Results of any tests run or test cases validated.
4. **Change Summary** — A concise list of all files created or modified and what changed.

## Self-Verification Checklist

Before finalizing your implementation, verify:
- [ ] Does the code fulfill all stated requirements?
- [ ] Does it follow the existing code style and patterns?
- [ ] Are edge cases and errors handled?
- [ ] Is the code readable and well-commented where necessary?
- [ ] Are there any breaking changes to existing functionality?
- [ ] Is the documentation complete?

**Update your agent memory** as you discover important patterns, architectural decisions, and conventions in this codebase. This builds up institutional knowledge across conversations.

Examples of what to record:
- Key architectural patterns and design decisions (e.g., how services are structured, how state is managed)
- Coding conventions and style preferences specific to this project
- Locations of important modules, utilities, and shared components
- Common implementation patterns used across features (e.g., how API calls are made, how errors are handled)
- Testing patterns and how tests are structured in this project
- Any known constraints or gotchas discovered during implementation

# Persistent Agent Memory

You have a persistent Persistent Agent Memory directory at `D:\villamate\.claude\agent-memory\feature-implementer\`. Its contents persist across conversations.

As you work, consult your memory files to build on previous experience. When you encounter a mistake that seems like it could be common, check your Persistent Agent Memory for relevant notes — and if nothing is written yet, record what you learned.

Guidelines:
- `MEMORY.md` is always loaded into your system prompt — lines after 200 will be truncated, so keep it concise
- Create separate topic files (e.g., `debugging.md`, `patterns.md`) for detailed notes and link to them from MEMORY.md
- Update or remove memories that turn out to be wrong or outdated
- Organize memory semantically by topic, not chronologically
- Use the Write and Edit tools to update your memory files

What to save:
- Stable patterns and conventions confirmed across multiple interactions
- Key architectural decisions, important file paths, and project structure
- User preferences for workflow, tools, and communication style
- Solutions to recurring problems and debugging insights

What NOT to save:
- Session-specific context (current task details, in-progress work, temporary state)
- Information that might be incomplete — verify against project docs before writing
- Anything that duplicates or contradicts existing CLAUDE.md instructions
- Speculative or unverified conclusions from reading a single file

Explicit user requests:
- When the user asks you to remember something across sessions (e.g., "always use bun", "never auto-commit"), save it — no need to wait for multiple interactions
- When the user asks to forget or stop remembering something, find and remove the relevant entries from your memory files
- Since this memory is project-scope and shared with your team via version control, tailor your memories to this project

## Searching past context

When looking for past context:
1. Search topic files in your memory directory:
```
Grep with pattern="<search term>" path="D:\villamate\.claude\agent-memory\feature-implementer\" glob="*.md"
```
2. Session transcript logs (last resort — large files, slow):
```
Grep with pattern="<search term>" path="C:\Users\dmleh\.claude\projects\D--villamate/" glob="*.jsonl"
```
Use narrow search terms (error messages, file paths, function names) rather than broad keywords.

## MEMORY.md

Your MEMORY.md is currently empty. When you notice a pattern worth preserving across sessions, save it here. Anything in MEMORY.md will be included in your system prompt next time.

---

## 프로젝트 진행 기록

### 2026-02-24 — 빌라메이트 MVP 개발 세션

#### 이 세션에서 구현한 기능

1. **이메일/비밀번호 로그인** (`EmailLoginScreen.tsx`)
   - 소셜 로그인 OAuth 프록시 문제 우회용 MVP 대안
   - 백엔드: `POST /api/auth/email-login` (Prisma upsert by email)

2. **입주민 빌라 가입 플로우** (`ResidentJoinScreen.tsx`)
   - 초대 코드 + 호수 입력 → `POST /api/villas/join`
   - 가입 후 AsyncStorage에 `{ ...user, villa }` 저장 → ResidentDashboard로 이동

3. **입주민 관리 화면 리팩터링** (`ResidentManagementScreen.tsx`)
   - 기존: 클라이언트에서 랜덤 코드 생성 (버그 원인)
   - 수정: DB에 저장된 실제 `inviteCode` 조회 후 표시

4. **청구서 관리 화면** (`AdminInvoiceScreen.tsx`)
   - 발행된 청구서 목록 + 입주민별 납부 상태 표시
   - 자동 발행 날짜 설정 (`POST /api/villas/:villaId/auto-billing`)

5. **청구서 생성 화면** (`CreateInvoiceScreen.tsx`)
   - 고정 관리비 (FIXED): 세대당 고정금액 입력
   - 변동 관리비 (VARIABLE): 항목별 금액 입력 → 합산 후 N분의 1 계산
   - 총 청구 금액 / 예상 세대당 금액 실시간 미리보기

6. **입주민 대시보드** (`ResidentDashboardScreen.tsx`)
   - `GET /api/residents/:userId/payments` 로 납부 내역 조회
   - 미납/완료 뱃지, 항목 내역(VARIABLE), 송금완료 처리 버튼

7. **자동 발행 (Auto-billing)** — 백엔드 node-cron
   - 매일 오전 9시 실행, `autoBillingDay === today` 인 빌라에 청구서 자동 생성

#### 핵심 구현 패턴

- **역할 기반 라우팅**: 로그인 후 `user.role`에 따라 분기
  - `ADMIN` → villa 유무 확인 → `Main` 또는 `Onboarding`
  - `RESIDENT` → `user.villa` 유무 → `ResidentDashboard` 또는 `ResidentJoin`

- **AsyncStorage 병합 패턴** (필수):
  ```typescript
  const existing = await AsyncStorage.getItem('user');
  const existingUser = existing ? JSON.parse(existing) : {};
  const merged = { ...existingUser, ...user };
  await AsyncStorage.setItem('user', JSON.stringify(merged));
  ```

- **탭→스택 네비게이션**: `navigation.getParent()?.navigate('ScreenName')`

- **초대 코드**: 빌라 생성 시 서버에서 생성(`Math.random().toString(36)`), DB 저장 → 클라이언트에서 표시만

#### 주요 파일 경로

- 백엔드 진입점: `backend/src/index.ts` (Express 단일 파일 모놀리스)
- Prisma 스키마: `backend/prisma/schema.prisma`
- 프론트 네비게이션: `frontend/src/navigation/AppNavigator.tsx`, `MainTabNavigator.tsx`
- 스크린 디렉토리: `frontend/src/screens/`

---

### 2026-02-26 — 커뮤니티 게시판, 댓글, 차량/주차 관리 세션

#### 이 세션에서 구현한 기능

1. **UI 텍스트 일괄 변경**: "동대표" → "관리자" (4개 스크린의 표시 문자열만 변경, 변수명/라우트 유지)

2. **커뮤니티 게시판** 풀스택 구현
   - DB: `Post` 모델 추가 (`id`, `title`, `content`, `isNotice`, `authorId`, `villaId`, `createdAt`)
   - 백엔드: `GET/POST /api/villas/:villaId/posts`, `PUT /api/posts/:postId/notice` (공지 최대 3개 제한)
   - 프론트: `BoardScreen.tsx` (공지 배지, 관리자 토글), `CreatePostScreen.tsx` (KeyboardAwareScrollView 표준)

3. **탭 네비게이터 리팩터링**
   - Admin 탭 4개: 홈 / 커뮤니티 / 관리 / 프로필
   - Resident 탭 3개: 홈 / 커뮤니티 / 프로필
   - `ManagementScreen.tsx` 신규 생성 (청구서 발행, 입주민 관리, 장부 확인)
   - `CommunityTabScreen.tsx`, `ResidentCommunityTabScreen.tsx` — BoardScreen 래퍼

4. **게시글 상세 화면** (`PostDetailScreen.tsx`)
   - 백엔드: `GET /api/posts/:postId`, `DELETE /api/posts/:postId` (작성자 본인만 삭제)
   - 프론트: 공지 배지, 작성자/호수/날짜, ScrollView 본문, 삭제 버튼

5. **댓글 기능** 풀스택 구현
   - DB: `Comment` 모델 추가
   - 백엔드: `GET/POST /api/posts/:postId/comments`
   - 프론트: `PostDetailScreen`에 댓글 목록 + 하단 입력바 + `KeyboardAvoidingView`

6. **차량/주차 관리** 풀스택 구현
   - DB: `Vehicle` 모델 추가 (`plateNumber`, `isVisitor`, `expectedDeparture`)
   - 백엔드: `POST /api/vehicles`, `GET /api/villas/:villaId/vehicles/search`, `GET/DELETE /api/users/:userId/vehicles`
   - 프론트: `ProfileScreen`에 차량 등록/삭제 UI, `ParkingSearchScreen.tsx` 신규 생성
   - 대시보드(Admin/Resident) 양쪽에 "주차 조회" 버튼 추가

#### 이 세션에서 확립된 구현 패턴

- **탭 내 인라인 컴포넌트의 스택 이동**: `navigation.getParent()?.navigate()` 사용 (BoardScreen → CreatePost)
- **대시보드(탭 스크린)의 스택 이동**: `navigation.navigate()` 직접 사용 (버블링 활용, getParent() 불필요)
- **roomNumber 조회 패턴**: 항상 `residentRecord.findFirst({ where: { userId, villaId } })`로 별도 조회
- **관리자 villaId 폴백**: AsyncStorage에 villa 없으면 `GET /api/users/:userId/villa` API로 조회
- **req.params 타입 안전**: 항상 `String(req.params.paramName)` 래핑 후 사용

---

### 2026-02-25 — 빌라메이트 UX 개선 및 PG 연동 세션

#### 이 세션에서 구현한 기능

1. **Invoice 스키마 리팩터링** (`backend/prisma/schema.prisma`)
   - `title`, `dueDate` 제거 → `billingMonth String` (YYYY-MM), `memo String?` 추가
   - `npx prisma db push` 적용

2. **청구서 생성 UX 개선** (`CreateInvoiceScreen.tsx`)
   - Title/DueDate 입력 제거
   - `< 2026년 2월 >` 화살표 방식 월 선택기 구현 (billingMonth)
   - 선택적 메모 입력 (multiline)

3. **로그인 라우팅 수정** (`LoginScreen.tsx`, `EmailLoginScreen.tsx`)
   - `user.villa` → `merged.villa` 기준 라우팅
   - `GET /api/users/:userId/villa` 신규 엔드포인트 추가 (ResidentRecord 조회)
   - 기기 초기화 후에도 DB에서 villa 소속 확인 가능

4. **계좌번호 클립보드 복사** (`ResidentDashboardScreen.tsx`)
   - `expo-clipboard` + Ionicons `copy-outline` 아이콘 추가

5. **커미션 비즈니스 모델 적용** (`ResidentDashboardScreen.tsx`)
   - 은행 계좌 표시 완전 제거 (직접 송금 차단)
   - '빌라메이트로 결제하기' 버튼 (초록색 `#4CAF50`)
   - 백엔드 입주민용 응답에서 `accountNumber`, `bankName` 필드 제거

6. **PortOne (KG Inicis) PG 연동** (`PaymentScreen.tsx`)
   - `iamport-react-native` + `react-native-webview` 설치
   - `IMP.Payment` 컴포넌트: `userCode: 'imp14397622'`, `pg: 'html5_inicis'`, `app_scheme: 'villamate'`
   - 결제 성공 → `PUT /api/payments/:paymentId/status` COMPLETED
   - `app.json`에 `"scheme": "villamate"` 추가

7. **키보드 UX 표준** (3개 스크린)
   - `react-native-keyboard-aware-scroll-view` 설치 및 적용
   - 구조: `View(flex:1)` > `KeyboardAwareScrollView(enableOnAndroid, extraHeight:120)` + 하단 고정 `KeyboardAvoidingView(behavior:ios-only)`
   - `useSafeAreaInsets` 하단 버튼 패딩: `Math.max(insets.bottom + 16, 24)`

8. **Admin 청구서 상세 화면** (`AdminInvoiceDetailScreen.tsx`)
   - 신규 화면: 세대별 납부 현황 (완납 ✅ / 미납 🚨)
   - 상단 요약: 총 수금액 / 미납액
   - `GET /api/invoices/:invoiceId/payments` 신규 엔드포인트
   - `AdminInvoiceScreen` 카드 탭 → `getParent()?.navigate('AdminInvoiceDetail')` 연결

9. **SafeAreaView 전체 수정** (8개 스크린 + `App.tsx`)
   - `react-native`의 SafeAreaView → `react-native-safe-area-context` 로 일괄 교체
   - `App.tsx`에 `<SafeAreaProvider>` 추가

#### 추가된 구현 패턴

- **billingMonth 포맷 헬퍼**: `'2026-02'` → `'2026년 2월 관리비'`
  ```ts
  const formatBillingMonth = (bm: string) => {
    const [year, month] = bm.split('-');
    return `${year}년 ${parseInt(month)}월 관리비`;
  };
  ```
- **PUT /api/invoices/:invoiceId**: 완납 세대 있으면 400, 없으면 수정 허용
- **roomNumber 위치**: `ResidentRecord`에 있음 (User 모델 아님) — include 시 주의

---

### 2026-02-27 — 차량 관리 고도화, 입주민 전출입, 건물 이력 세션

#### 이 세션에서 구현한 기능

1. **파일 인코딩 복구** (전체 20개 스크린)
   - 한국어 문자가 `?` 시퀀스로 깨진 인코딩 오류 일괄 복구
   - IP 주소 `192.168.219.108` → `192.168.219.178` 4개 파일 수정 (sed 사용)
   - JSX 닫힘 태그 누락 (`텍스트/Text>` → `텍스트</Text>`), placeholder 따옴표 누락 패턴 수정

2. **관리자 차량 등록 버그 수정** (`ProfileScreen.tsx`)
   - 기존: `GET /api/users/${uid}/villa` → 입주민용 (ResidentRecord 조회), 관리자에게 404
   - 수정: `GET /api/villas/${uid}` → 관리자용 (Villa.adminId 조회), `data[0].id` 사용

3. **출차 예정 시간 자유 텍스트 전환**
   - `schema.prisma`: `expectedDeparture DateTime?` → `String?` + `npx prisma db push`
   - 백엔드: `new Date(expectedDeparture)` → 문자열 그대로 저장
   - 프론트: placeholder `출차 예정 시간 (예: 오후 2시에 나가요)`, `formatDeparture` 단순 문자열 반환

4. **차량 모델명(modelName) + 전체 목록 기본 표시**
   - `schema.prisma`: `Vehicle`에 `modelName String?` 추가 + `npx prisma db push`
   - 백엔드: `GET /api/villas/:villaId/vehicles` 신규 (전체 목록, `/search` 라우트 앞에 배치)
   - `ProfileScreen`: 차량 모델 입력 폼, POST body, 카드 표시 추가
   - `ParkingSearchScreen`: 전체 재작성 — 화면 진입 시 `useFocusEffect`로 전체 목록 로드, 로컬 필터링

5. **입주민 전출입 관리** (`ResidentManagementScreen.tsx` 재작성)
   - 백엔드: `GET /api/villas/:villaId/residents` 업데이트 (roomNumber 오름차순), `POST /api/villas/:villaId/residents/:residentId/move-out` (ResidentRecord deleteMany), `GET /api/villas/:villaId/detail` 추가
   - 프론트: 전출 처리 버튼(파괴적 Alert), 처리 중 로딩, 초대 코드 Alert 표시
   - `ManagementScreen`: 메뉴 라벨 → '입주민 및 전출입 관리'

6. **건물 이력 및 계약 관리** (신규 기능)
   - `schema.prisma`: `BuildingEvent` 모델 추가 (id uuid, title, description?, category, eventDate String, contractorName?, contactNumber?, villaId Int, creatorId String, createdAt)
   - 백엔드: `POST/GET /api/villas/:villaId/building-events` 추가
   - 신규 화면: `BuildingHistoryScreen.tsx` (카테고리 색상 뱃지, `useFocusEffect`), `CreateBuildingEventScreen.tsx` (칩 선택, 키보드 UX 표준)
   - `ManagementScreen`: '건물 이력 및 계약 관리' 메뉴 추가, `AppNavigator`에 두 화면 등록

7. **건물 이력 DatePicker + 이미지 업로드**
   - 백엔드: `multer` 설치, `POST /api/upload` 추가, `uploads/` 자동 생성, `/uploads` 정적 서빙
   - `schema.prisma`: `BuildingEvent`에 `attachmentUrl String?` 추가
   - 프론트: `@react-native-community/datetimepicker`, `expo-image-picker` 설치
   - `CreateBuildingEventScreen`: 날짜 TextInput → DateTimePicker 버튼, 이미지 선택 + 미리보기, 제출 시 이미지 먼저 업로드 후 URL 전달
   - `BuildingHistoryScreen`: `attachmentUrl` 있을 경우 카드 내 썸네일 표시

#### 이 세션에서 확립된 추가 패턴

- **관리자 villaId 조회 올바른 경로**: `GET /api/villas/${uid}` (배열 반환, `data[0].id` 사용) — `GET /api/users/${uid}/villa`는 입주민 전용
- **Express 라우트 순서 원칙 재확인**: `/api/villas/:villaId/vehicles`는 `/api/villas/:villaId/vehicles/search`보다 먼저, `/api/villas/:villaId/detail`은 `/api/villas/:adminId`보다 먼저 등록
- **전출 처리 방식**: `User` 모델에 `villaId`/`roomNumber` 컬럼 없음 → `ResidentRecord.deleteMany`로 처리 (청구/납부 내역은 그대로 보존)
- **파일 업로드 multer 경로**: `path.join(__dirname, '..', 'uploads')` — 컴파일 후 `dist/`에서 실행되므로 `..`로 한 단계 위 참조
- **이미지 업로드 FormData 패턴** (React Native):
  ```typescript
  formData.append('file', { uri, name: filename, type: 'image/jpeg' } as any);
  ```
- **자유 텍스트 날짜/시간**: MVP 단계에서 DatePicker 대신 자유 텍스트 허용 시 DB 타입도 `String`으로 맞춰야 함

---

### 2026-02-28 — 외부 웹 청구, 대시보드 고도화, 전자투표 세션

#### 이 세션에서 구현한 기능

1. **API_BASE_URL 공통화** (`frontend/src/config.ts` 신규)
   - 22개 스크린에 하드코딩된 `const API_BASE_URL = '...'` 일괄 제거
   - Python 스크립트로 각 파일에 `import { API_BASE_URL } from '../config'` 자동 삽입
   - 이후 IP 변경 시 `config.ts` 1줄만 수정하면 됨

2. **외부 웹 청구 (External Web Billing)** — 앱 미설치 대상자 청구
   - DB: `ExternalBilling` 모델 추가 (id, targetName, phoneNumber, amount, description, dueDate, status, villaId Int, createdAt)
   - 백엔드: `POST/GET /api/villas/:villaId/external-bills`, `PATCH .../confirm` (COMPLETED), `GET /pay/:billId` (모바일 HTML 반환), `POST /api/public/pay/:billId/notify` (PENDING_CONFIRMATION)
   - 상태 흐름: `PENDING` → `PENDING_CONFIRMATION` (납부자 알림) → `COMPLETED` (관리자 확인)
   - 프론트: `ExternalBillingScreen.tsx` 신규 — 청구서 목록, FAB+모달 생성, Alert로 웹 링크 표시
   - `ManagementScreen`에 "외부 청구서 발송" 메뉴 추가, `AppNavigator`에 등록

3. **대시보드 위젯 기반 전면 개편**
   - 백엔드: `GET /api/dashboard/:userId?villaId=&role=` 신규
     - ADMIN 반환: `totalUnpaidCount`, `pendingExternalBillsCount`, `latestNotice`, `activePollsCount`
     - RESIDENT 반환: `myUnpaidAmount`, `latestNotice`, `myVehicleCount`, `activePollsCount`
   - `DashboardScreen.tsx` (관리자 홈) 전면 재작성: Toss 스타일 위젯 대시보드
     - 위젯 행: 미납 관리비(파랑) + 확인 대기(주황) 나란히, 최근 공지 전체 너비, 진행중인 투표(빨강)
     - 퀵액션 6개 (3×2 그리드): 청구서 발행/주차 조회/입주민 관리/외부 청구/공용 장부/커뮤니티
   - `ResidentDashboardScreen.tsx` (입주민 홈) 전면 재작성
     - 미납 관리비 전체 너비 (미납=빨강/완납=초록), 최근 공지+내 차량 나란히, 참여 가능한 투표(빨강)
     - 퀵액션 pill 4개: 주차 조회/커뮤니티/공용 장부/투표
     - 이름 표시: AsyncStorage 'user' JSON의 name 필드 활용

4. **대시보드 위젯 인터랙션** (TouchableOpacity + 네비게이션)
   - 모든 위젯 `View` → `TouchableOpacity` (activeOpacity 0.7)
   - 각 위젯 헤더에 `widgetHeader` 스타일(flexRow + spaceBetween) + `chevron-forward` 아이콘
   - 관리자: 미납 → `AdminInvoice`, 확인 대기 → `ExternalBilling`, 공지 → `PostDetail`
   - 입주민: 미납 → ScrollView ref로 납부 내역 섹션 스크롤, 공지 → `PostDetail`, 차량 → `'프로필'` 탭
   - 공지 없을 때: chevron 숨김 + `activeOpacity: 1` (비활성)

5. **전자투표 (Electronic Voting)** — 1세대1표
   - DB: `Poll` (id, title, description?, endDate DateTime, isAnonymous, villaId Int, creatorId), `PollOption` (id, text, pollId), `Vote` (id, pollId, optionId, voterId, roomNumber, `@@unique([pollId, roomNumber])`)
   - 1세대1표 강제: DB 레벨 `@@unique` + 서버 409 응답 이중 보장
   - 백엔드: `POST /api/villas/:villaId/polls`, `GET .../polls`, `POST .../polls/:pollId/vote`
     - vote API: ResidentRecord에서 roomNumber 조회 → DB unique 충돌 시 409
   - 대시보드 API: `activePollsCount` 추가 (ADMIN: 전체 활성 투표 수, RESIDENT: 아직 미투표 활성 수)
   - 신규 화면: `CreatePollScreen.tsx` (DateTimePicker, 동적 옵션 추가/삭제, 익명 Switch), `PollListScreen.tsx` (D-N 남음 뱃지), `PollDetailScreen.tsx` (라디오 버튼 투표 → 결과 바 차트 + 기명 시 호수 표시)

#### 이 세션에서 확립된 추가 패턴

- **IP 일괄 교체**: `grep -rl "IP" . --include="*.ts" --include="*.tsx" | xargs sed -i 's/구IP/신IP/g'` — Windows bash에서 작동
- **Python으로 파일 일괄 수정**: sed가 복잡한 경우 Python `open + re.sub + write` 패턴이 더 안정적
- **ScrollView ref 스크롤**: `useRef<any>(null)` + `onLayout` + `scrollRef.current?.scrollTo({ y, animated: true })`
- **위젯 헤더 패턴**: `widgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }`
- **1세대1표 패턴**: Vote 모델에 `@@unique([pollId, roomNumber])` + 백엔드에서 `findUnique({ where: { pollId_roomNumber: { pollId, roomNumber } } })`
- **투표 결과 바**: `barBg`(flex row) + `barFill`(flex: pct) + 나머지(flex: 100-pct) — React Native에서 퍼센트 바 구현
- **DateTimePicker (투표)**: iOS `inline`, Android `default`; `minimumDate={new Date()}` 으로 과거 날짜 차단

---

### 2026-03-01 — 전자투표 Admin 버그 수정, CS 티켓/민원 시스템, UX 정리 세션

#### 이 세션에서 구현/수정한 기능

1. **Admin 전자투표 버그 수정**
   - 근본 원인: 투표 라우트가 `ResidentRecord` 없으면 즉시 403 반환 → Admin은 항상 차단됨
   - 백엔드: ResidentRecord 없을 때 `villa.findFirst`로 Admin 여부 확인 후 `'admin'` sentinel roomNumber 사용
   - 1세대 1표는 `@@unique([pollId, roomNumber])` 그대로 적용 (`'admin'` sentinel 포함)
   - 프론트: `PollDetailScreen`에 `userRole` 파라미터 추가, `hasVoted`/`myOptionId` Admin 판별 로직 추가
   - `PollListScreen`, `DashboardScreen`, `ResidentDashboardScreen`에서 `userRole` 전달 추가
   - 테스트: 23개 모두 통과 (Admin 투표 201 + 중복 투표 409 케이스 추가)

2. **CS 티켓 / 민원 시스템 구현** (이후 커뮤니티 게시판으로 통합 결정으로 제거됨)
   - DB: `Ticket` 모델 추가 (id, title, description, imageUrl?, status, creatorId, villaId, createdAt)
   - 백엔드: `POST/GET /api/villas/:villaId/tickets`, `PATCH .../tickets/:ticketId/status`
   - 프론트: `CreateTicketScreen.tsx`, `TicketListScreen.tsx` 신규 생성
   - Admin 상태 변경 버튼, 컬러 상태 배지 (PENDING=빨강/IN_PROGRESS=주황/RESOLVED=초록)

3. **민원 기능을 커뮤니티 게시판(Post)에 통합** (중복 UX 제거 결정)
   - DB: `Post` 모델에 `category String @default("GENERAL")`, `status String?` 추가
   - 백엔드: `POST /api/villas/:villaId/posts`에 category 처리 추가 (ISSUE면 status='PENDING' 자동 설정)
   - 백엔드: `PATCH /api/villas/:villaId/posts/:postId/status` 신규 (ADMIN만 상태 변경 가능)
   - `CreatePostScreen`: 게시 유형 칩 선택 UI ('일반 게시글' / '민원·하자 접수')
   - `BoardScreen`: ISSUE 게시글에 상태 배지 렌더링
   - `PostDetailScreen`: Admin에게 상태 변경 버튼 3개 표시 (접수 대기/처리 중/처리 완료), 변경 즉시 UI 반영

4. **독립형 티켓 시스템 제거 및 코드 정리**
   - `TicketListScreen.tsx`, `CreateTicketScreen.tsx` 파일 삭제
   - `AppNavigator.tsx`에서 Ticket 관련 import 2개, Stack.Screen 2개 제거
   - `DashboardScreen`, `ResidentDashboardScreen`에서 '민원 접수' 버튼 제거

5. **홈 화면 퀵액션 버튼 정리**
   - Admin 대시보드: 7개 → 3개 ('청구서 발행', '주차 조회', '전자투표') 단일 행 배치
   - `actionRows` 동적 분할 로직 제거 → 단순 단일 행 렌더링으로 교체
   - Resident 대시보드: 4개 pill → 2개 ('주차 조회', '전자투표') 가운데 정렬
   - `flex: 1` 제거 → `paddingHorizontal: 32` 고정 너비, `justifyContent: 'center'`

#### 이 세션에서 확립된 추가 패턴

- **Admin sentinel roomNumber 패턴**: ResidentRecord가 없는 Admin 사용자에게 `'admin'` 문자열을 roomNumber로 사용 → 기존 `@@unique` 제약 재사용하여 중복 투표 방지
- **게시글 카테고리 확장 패턴**: 기존 모델에 `category` + `status` 컬럼 추가로 기능 분기 — 별도 모델 신규 생성 없이 기존 CRUD 재활용
- **Admin 전용 인라인 컨트롤 패턴**: `userRole === 'ADMIN'` 조건으로 동일 상세 화면에서 관리 기능 인라인 렌더링 (별도 화면 불필요)
- **퀵액션 버튼 수와 레이아웃 원칙**: 3개 이하는 단일 행 `flex: 1`, 2개는 `justifyContent: 'center'` + 고정 padding 방식이 더 자연스러운 UX

---

### 2026-03-02 — Expo 푸시 알림, iOS 키보드 UX, ProfileScreen 개편, 마이페이지 고도화 세션

#### 이 세션에서 구현한 기능

1. **Expo 푸시 알림 시스템 구현** (풀스택)
   - DB: `User` 모델에 `expoPushToken String?` 추가, `npx prisma db push` 적용
   - 백엔드 패키지: `expo-server-sdk` 설치
   - 백엔드: `PATCH /api/users/:userId/push-token` — 디바이스 토큰 저장 엔드포인트
   - 백엔드: `POST /api/villas/:villaId/posts/:postId/send-push` — 관리자가 수동으로 공지 푸시 발송
     - 알림 제목: `'새롭게 공지사항 등록된 글이 있습니다. 확인해보실까요?'`
     - 알림 본문: 게시글 제목
     - `Expo.isExpoPushToken()`으로 유효 토큰만 필터링, 청크 단위 발송
   - 프론트: `App.tsx`에 `Notifications.setNotificationHandler` 포그라운드 알림 표시 설정
   - 프론트: 앱 마운트 시 권한 요청 → 토큰 획득 → `PATCH /api/users/:userId/push-token` 호출
   - 프론트: `PostDetailScreen`에 `isNotice === true && userRole === 'ADMIN'` 조건으로 초록색 '공지사항 푸시 발송' 버튼 추가
   - 테스트: `api.spec.ts` — `expo-server-sdk` mock 추가, 32개 전체 통과

2. **iOS 키보드 겹침 UX 수정** (2개 화면)
   - `EmailLoginScreen.tsx`: `react-native-keyboard-aware-scroll-view` (서드파티) 제거 → 표준 RN `KeyboardAvoidingView` + `ScrollView`로 교체
   - `LoginScreen.tsx`: 테스트 로그인 모달 내부에 `KeyboardAvoidingView` 추가 (모달 내 TextInput 키보드 겹침 해소)

3. **ProfileScreen 전면 개편** (iOS Settings 스타일)
   - DB: `User` 모델에 `password String?` 추가, `bcryptjs` 설치
   - 백엔드: `DELETE /api/users/:userId` — 회원 탈퇴 (이름 익명화, 연락처·토큰 null, `status='DELETED'`)
   - 백엔드: `PATCH /api/users/:userId/password` — bcrypt 기반 비밀번호 변경 (`bcrypt.compare` 검증 → `bcrypt.hash(10)` 저장)
   - `ProfileScreen.tsx` 완전 재작성: 원형 아바타(이름 첫 글자), 역할/호수 칩, iOS 설정 스타일 카드 섹션
     - 섹션 구성: 내 집 / 계정 정보 / 앱 설정(푸시 Switch) / 계정 관리(로그아웃+탈퇴)
   - `VehicleManagementScreen.tsx` 신규 생성: 기존 ProfileScreen 차량 관리 로직 분리
   - `ChangePasswordScreen.tsx` 신규 생성: 현재/새/확인 비밀번호 입력 폼, 클라이언트 검증(6자 이상, 일치 확인)
   - `AppNavigator.tsx`: `VehicleManagement`, `ChangePassword` 스택 화면 등록

4. **마이페이지 Perfectionist Profile 고도화**
   - 백엔드: `GET /api/users/:userId/posts` — 유저가 작성한 모든 게시글 (createdAt desc)
   - `MyPostsScreen.tsx` 신규 생성: BoardScreen 카드 UI 재사용, 공지/민원/상태 배지 포함, `PostDetail` 이동
   - `ProfileScreen.tsx` 업데이트:
     - '내가 쓴 글 / 민원 내역' 행 추가 → `MyPosts` 화면 이동
     - '고객센터 & 약관' 섹션 추가 (이용약관, 개인정보처리방침 — Alert 플레이스홀더)
   - `AppNavigator.tsx`: `MyPosts` 스택 화면 등록

#### 이 세션에서 확립된 추가 패턴

- **Expo Push Token 등록 패턴**: `Device.isDevice` 가드 → 권한 요청 → `getExpoPushTokenAsync()` → `PATCH /api/users/:userId/push-token`으로 저장, Android 채널 선행 설정
- **수동 트리거 푸시 패턴**: 자동 발송 대신 관리자가 직접 버튼으로 발송 (`send-push` 엔드포인트 분리) → UX 제어권 관리자에게 부여
- **bcrypt 비밀번호 패턴**: 기존 비밀번호 없으면 `oldPassword` 검증 스킵 (최초 설정 허용), 있으면 `bcrypt.compare` 검증 후 `bcrypt.hash(salt=10)` 저장
- **회원 탈퇴 소프트 처리**: `User` 레코드를 DELETE하지 않고 이름 익명화 + 연락처 null + `status='DELETED'`로 처리 → 연관 InvoicePayment, Comment 등 외래키 보존
- **모달 내 키보드 처리**: 바텀시트 스타일 모달(`justifyContent: 'flex-end'`)에서 `TouchableWithoutFeedback` > `View.modalOverlay` > `KeyboardAvoidingView` > `View.modalContent` 구조
- **Jest에서 expo-server-sdk mock**: `jest.mock()` 팩토리 내부에 `__mockInstance` 참조를 `MockExpo`에 부착 → `clearAllMocks()` 후에도 mock 함수 참조 유지

---
name: Dev
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

---

### 2026-03-03 — 롤링 배너 자동스크롤, 앱 이용 가이드, 알림함 세션

#### 이 세션에서 구현한 기능

1. **롤링 배너 자동스크롤** (`frontend/src/components/RollingBanner.tsx`)
   - `currentIndexRef = useRef(0)` 로 stale closure 방지 (state 대신 ref를 interval 내부에서 사용)
   - `useEffect` + `setInterval(3000ms)` 로 3초마다 자동 슬라이드
   - `flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true })` 호출
   - 컴포넌트 언마운트 시 `clearInterval` cleanup 반환
   - `onViewableItemsChanged`에서 ref + state 동시 업데이트 → 도트 인디케이터 동기화

2. **앱 이용 가이드 화면** (`frontend/src/screens/GuideScreen.tsx`, 신규)
   - 7개 가이드 카드 (방문차량 등록, 전자투표, 커뮤니티, 청구서 납부, 주차관리, 공지사항, 마이페이지)
   - 이모지 아이콘 + 좌측 액센트 바 + 설명 텍스트 카드 스타일
   - `AppNavigator`에 `'Guide'` 라우트로 등록

3. **알림함(NotificationScreen)** (`frontend/src/screens/NotificationScreen.tsx`, 신규)
   - `useFocusEffect` 진입 시 `GET /api/users/:userId/notifications` 로 알림 목록 fetch
   - `isRead === false`인 항목에 파란 점(●) + 굵은 텍스트 unread 표시
   - 화면 마운트 시 `PATCH /api/users/:userId/notifications/read-all` 자동 전체 읽음 처리
   - 빈 알림 시 "알림이 없습니다" 빈 상태 표시

4. **DB 스키마 — Notification 모델 추가** (`backend/prisma/schema.prisma`)
   - `Notification` 모델: `id uuid`, `userId String → User`, `title String`, `body String`, `isRead Boolean @default(false)`, `createdAt DateTime`
   - `User` 모델에 `notifications Notification[]` 관계 필드 추가
   - `npx prisma db push` 실행 완료

5. **백엔드 알림 API 추가** (`backend/src/index.ts`)
   - `POST .../send-push`: 푸시 발송 후 `prisma.notification.createMany`로 전체 입주민에게 DB 알림 레코드 저장 (토큰 없는 입주민 포함)
   - `GET /api/users/:userId/notifications`: 알림 목록 조회 (최신순)
   - `PATCH /api/users/:userId/notifications/read-all`: 전체 미읽음 알림 일괄 읽음 처리

6. **대시보드 헤더에 벨 아이콘 추가** (Admin + Resident 홈)
   - `DashboardScreen`, `ResidentDashboardScreen` 헤더 우상단에 🔔 `Ionicons notifications-outline` 버튼
   - 탭 시 `navigation.navigate('Notifications')` 이동
   - 헤더 레이아웃: `headerRow(flexRow)` + `headerTextGroup(flex:1)` + `bellButton(TouchableOpacity)`

7. **AppNavigator 업데이트**
   - `NotificationScreen` import 및 `Stack.Screen name="Notifications"` 등록

#### 이 세션에서 확립된 추가 패턴

- **자동스크롤 stale closure 패턴**: interval 내부에서는 state 대신 `useRef`를 사용하고, 렌더링용 state는 따로 유지
  ```typescript
  const currentIndexRef = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      const next = (currentIndexRef.current + 1) % banners.length;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      currentIndexRef.current = next;
      setCurrentIndex(next);
    }, 3000);
    return () => clearInterval(id);
  }, []);
  ```
- **알림 읽음 처리 타이밍**: 화면 마운트 시 즉시 read-all API 호출 → 사용자가 목록을 보면서 unread 표시는 확인하고, 다음 방문 시에는 모두 읽음 처리된 상태로 표시
- **notification.createMany 패턴**: 푸시 발송 API 내에서 Expo 토큰 유무와 무관하게 모든 입주민(`records.map((r) => r.userId)`)에게 알림 레코드 생성
- **테스트 mock 업데이트**: `notification.createMany`, `findMany`, `updateMany` mock 추가, 기존 send-push 테스트에 `userId` 필드 추가 → 32/32 통과

---

### 2026-03-04 — 회원가입 플로우 개편, 고객센터/시스템공지, Admin 웹 패널 세션

#### 이 세션에서 구현한 기능

1. **회원가입 3단계 플로우 신규 구현**
   - 기존: `POST /api/auth/email-login`이 신규 사용자도 upsert 처리 (termsAgreed 없이 즉시 계정 생성)
   - 변경: 사용자 미존재 시 `404 + { error: 'USER_NOT_FOUND' }` 반환 → 프론트에서 가입 플로우로 이동
   - 백엔드: `POST /api/auth/register` 신규 — `email`, `password`, `name`, `phoneNumber`, `termsAgreed` 수신
     - 기존 이메일 있으면 409 반환
     - bcrypt.hash(10)으로 비밀번호 저장, `ADMIN` role로 계정 생성
   - `SignupAgreementScreen.tsx` 신규 (Step 2/3):
     - 전체 동의 + 이용약관/개인정보 개별 체크박스
     - `StepIndicator` 컴포넌트: 완료=초록, 현재=파랑, 미완=회색 도트
     - 모두 동의 시 `navigate('SignupProfile', { email, password, termsAgreed: true })`
   - `SignupProfileScreen.tsx` 신규 (Step 3/3):
     - 이름(필수) + 전화번호(선택) 입력
     - `POST /api/auth/register` 호출 → 성공 시 `replace('Onboarding')`
     - 409 시 이미 가입된 이메일 Alert + EmailLogin으로 이동
   - `EmailLoginScreen` 수정: 404 USER_NOT_FOUND → `navigate('SignupAgreement', { email, password })`
   - `AppNavigator`: `SignupAgreement`, `SignupProfile` 스택 화면 등록 (headerShown: false)

2. **고객센터 FAQ 화면 신규 구현**
   - DB: `Faq` 모델 추가 (id uuid, question, answer, createdAt)
   - 백엔드: `GET /api/faqs` (공개), `POST /api/faqs`, `DELETE /api/faqs/:id` (SUPER_ADMIN JWT 전용)
   - `CustomerCenterScreen.tsx` 신규:
     - `GET /api/faqs` 목록 fetch → 아코디언 Q&A 카드 (Q=파랑뱃지, A=초록뱃지)
     - 탭 시 `expandedId` toggle로 답변 표시/숨김
     - 빈 상태: `Ionicons help-circle-outline` + "등록된 FAQ가 없습니다."
   - `AppNavigator`: `CustomerCenter` 스택 등록

3. **시스템 공지사항 화면 신규 구현**
   - DB: `SystemNotice` 모델 추가 (id uuid, title, content, createdAt)
   - 백엔드: `GET /api/system-notices` (공개), `POST /api/system-notices`, `DELETE /api/system-notices/:id` (SUPER_ADMIN JWT 전용)
   - `SystemNoticeScreen.tsx` 신규:
     - `GET /api/system-notices` 조회 → 아코디언 카드 (공지 뱃지, 제목, 날짜)
     - 탭 시 내용 + 날짜(ko-KR) 표시
     - 빈 상태: `Ionicons megaphone-outline` + "등록된 공지사항이 없습니다."
   - `AppNavigator`: `SystemNotice` 스택 등록

4. **Admin 웹 패널 (`admin-web/`) 신규 생성**
   - React + Vite + TypeScript 프로젝트 (별도 디렉토리)
   - 인증: `POST /api/admin/login` → SUPER_ADMIN JWT 발급 (7일 만료)
   - 백엔드 SUPER_ADMIN 전용 엔드포인트:
     - `GET /api/admin/users` — 전체 유저 목록
     - `GET /api/admin/villas` — 전체 빌라 목록
     - FAQ CRUD, SystemNotice CRUD
   - `const JWT_SECRET = process.env.JWT_SECRET || 'villamate-super-secret-2024'`
   - `jsonwebtoken` 패키지 설치 및 `import jwt from 'jsonwebtoken'` 추가

5. **`frontend/src/components/` 디렉토리 신규 생성**
   - `RollingBanner.tsx` — 기존 파일을 `components/` 디렉토리로 이동/분리

#### 이 세션에서 확립된 추가 패턴

- **USER_NOT_FOUND 패턴**: 이메일 로그인 시 사용자 없으면 400 대신 `404 + { error: 'USER_NOT_FOUND' }` 반환 → 프론트에서 분기 처리로 가입 플로우 진입
- **3단계 온보딩 StepIndicator 패턴**:
  ```tsx
  // 완료=초록, 현재=파랑, 미완=회색
  i + 1 < current  → dotDone  (backgroundColor: '#34C759')
  i + 1 === current → dotActive (backgroundColor: '#007AFF')
  i + 1 > current  → dot      (backgroundColor: '#E5E5EA')
  ```
- **아코디언 카드 패턴**: `expandedId(string|null)` state + `toggleExpand(id)` 함수 → `expandedId === item.id` 조건으로 내용 표시
- **SUPER_ADMIN JWT 미들웨어 인라인 패턴**:
  ```typescript
  const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
  if (decoded.role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });
  ```
- **회원가입 route.params 연쇄 전달**: `email + password → SignupAgreement → SignupProfile` 순서로 params 체인

---

### 2026-03-06 — 관리자 가이드 라이브러리, Admin 웹 대시보드 시각화, 보안 취약점 수정 세션

#### 이 세션에서 구현한 기능

1. **관리자 가이드 라이브러리** (매거진 스타일 콘텐츠 시스템)
   - DB: `Guide` 모델 추가 (id uuid, category, title, content, thumbnailUrl?, createdAt)
   - 백엔드: `GET/POST/PUT/DELETE /api/guides`, `GET /api/guides/:id` (GET은 공개, 나머지는 SUPER_ADMIN)
   - Admin 웹: `admin-web/src/pages/Guides.tsx` 신규 — Tiptap 리치 에디터, 카테고리 드롭다운, 썸네일 업로드, 그리드 목록
   - 모바일: `GuideLibraryScreen.tsx` 신규 — 카테고리 탭 필터, FlatList 카드, featuredCard(첫 번째 더 크게)
   - 모바일: `GuideDetailScreen.tsx` 신규 — `react-native-render-html` HTML 렌더링, 히어로 이미지, 카테고리 뱃지
   - Admin 웹 `Layout.tsx` + `App.tsx` 업데이트 (네비게이션 + 라우트 등록)
   - `AppNavigator.tsx` + `DashboardScreen.tsx` 업데이트 (GuideLibrary 라우트 + 홈 퀵액션)

2. **Admin 웹 대시보드 시각화** (`admin-web/src/pages/Dashboard.tsx` 완전 재작성)
   - 백엔드: `GET /api/admin/stats` — Prisma `groupBy`로 빌라 구독 상태별 카운트, 사용자 역할별 카운트
   - KPI 카드 3개: 총 가입자 수(파랑) / 총 등록 빌라 수(초록) / 프리미엄 구독 빌라 수(주황)
   - PieChart(도넛): 빌라 구독 현황 (FREE_TRIAL / ACTIVE / EXPIRED)
   - BarChart: 사용자 역할별 분포 (ADMIN / RESIDENT / SUPER_ADMIN)
   - 패키지: `recharts` 설치, `<ResponsiveContainer width="100%" height={240}>` 래핑

3. **보안 취약점 수정 (C1~C5)**
   - C2: `sanitizeUser()` 헬퍼 추가 + 8개 인증/유저 엔드포인트에 적용 (password 필드 제거)
   - C1: 모든 로그인/회원가입 엔드포인트에 JWT 발급 (`expiresIn: '30d'`), 응답에 `token` 포함
   - C4: `PATCH /api/villas/:villaId/subscribe`에 `authenticateUser` + SUPER_ADMIN 체크 추가
   - C5: Admin 웹 `Guides.tsx`에 `DOMPurify.sanitize()` 적용 (`dompurify` 설치)

#### 이 세션에서 확립된 추가 패턴

- **React 19 Rich Text Editor**: `react-quill` 사용 불가 → `@tiptap/react` + `StarterKit` + 확장 모듈 조합
- **Tiptap 툴바 버튼**: `onMouseDown={(e) => { e.preventDefault(); onClick(); }}` — `onClick` 대신 `onMouseDown` 사용하여 에디터 포커스 유지
- **Tiptap 외부 value sync**: `useRef(value)` + `useEffect`로 prevValue 추적, 변경 시 `editor.commands.setContent(value, false)` 호출
- **useFocusEffect + selectedCategory 의존성**: 카테고리 필터 탭이 있는 목록 화면에서 `useCallback([selectedCategory])` 패턴으로 탭 변경 + 포커스 시 자동 fetch
- **react-native-render-html 사용법**:
  ```tsx
  import RenderHtml from 'react-native-render-html';
  const { width } = useWindowDimensions();
  <RenderHtml contentWidth={width} source={{ html: content }} tagsStyles={tagsStyles} enableExperimentalMarginCollapsing />
  ```
- **Recharts 기본 패턴** (admin-web):
  ```tsx
  import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
  // ResponsiveContainer로 반드시 래핑 (width="100%")
  ```
- **DOMPurify 사용법** (admin-web React):
  ```tsx
  import DOMPurify from 'dompurify';
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }}
  ```

---

---

### 2026-03-08 — IA 개편, 전자투표 고도화, 모의 자동결제 세션

#### 이 세션에서 구현한 기능

1. **전자투표 실시간 참여율 프로그레스 바** (`PollDetailScreen.tsx`)
   - `totalVotes`, `totalEligibleVoters`를 백엔드 `GET /api/villas/:villaId/polls` 응답에 추가
   - `totalEligibleVoters`: `ResidentRecord.count({ where: { villaId } })` — 빌라 입주민 수 기준
   - `participationPct = Math.round((totalVotes / totalEligibleVoters) * 100)`
   - 프로그레스 바 UI: `View(progressBarBg)` + `View(progressBarFill, width: participationPct%)` 패턴

2. **미참여자 푸시 알림 리마인더** (백엔드 + 프론트엔드)
   - `backend/src/utils/push.ts` 신규: `sendPushToTokens(tokens, title, body, data?)` 유틸 함수
   - `POST /api/polls/:pollId/remind` 신규: 관리자 검증 → 미투표 세대 필터링 → 푸시 발송
   - `PollDetailScreen`에 관리자 전용 "🔔 미참여자에게 알림 보내기" 버튼 (ADMIN + isActive 조건)

3. **IA 구조 개편** (다수 파일)
   - 관리자 탭 4개 → 5개: `[홈][관리][커뮤니티][장부][프로필]` (장부 탭 독립)
   - `LedgerTabScreen.tsx` 신규 (LedgerScreen 래퍼)
   - `MainTabNavigator.tsx` 5탭 업데이트
   - `ManagementScreen.tsx`: 장부 메뉴 제거, 전자투표 메뉴 추가 (userId 상태 포함)
   - `OurVillaScreen.tsx`: 회계 장부·전자투표·이용 가이드 메뉴 추가, villaId/userId AsyncStorage 해결
   - `CommunityTabScreen.tsx` / `ResidentCommunityTabScreen.tsx`: 커스텀 헤더 + 📄 아이콘 → MyPosts 이동
   - `DashboardScreen.tsx`: 바로가기 섹션 제거, 상태 위젯만 유지
   - `ProfileScreen.tsx`: Admin 가이드 라이브러리 섹션 추가 (ADMIN only)
   - `admin-web/src/pages/Layout.tsx`: 사이드바 2섹션 분리 (플랫폼 운영 / 콘텐츠 관리)

4. **모의 자동결제 시스템** (Mock Toss Payments)
   - `backend/prisma/schema.prisma`: Villa에 `isAutoBilling`, `billingKey`, `maskedCard` 필드 추가, `npx prisma db push` 적용
   - `POST /api/villas/:villaId/billing`: 카드 등록 → 모의 빌링키 발급 → Villa 업데이트
   - `GET /api/villas/:villaId/billing`: 자동결제 상태 조회
   - `AdminSubscriptionScreen.tsx` 전면 개편:
     - 카드번호/유효기간/비밀번호 입력 바텀시트 모달
     - 카드번호 자동 공백 포맷, MM/YY 슬래시 자동 삽입
     - 등록 완료 시 초록 카드 UI (maskedCard + 다음 결제일)

5. **ProfileScreen 구독/요금제 메뉴 추가**
   - ADMIN 전용 "구독 / 요금제" 섹션 신설 (가이드 섹션 위)
   - `card` 아이콘, `#5856D6` 보라색 → `AdminSubscription` 화면 이동

#### 이 세션에서 확립된 추가 패턴

- **푸시 유틸 분리**: `backend/src/utils/push.ts`로 Expo 청크 발송 로직 분리 — 재사용 가능한 유틸
  ```typescript
  export async function sendPushToTokens(tokens: string[], title: string, body: string, data?: object) {
    const expo = new Expo();
    const messages = tokens.filter(t => Expo.isExpoPushToken(t)).map(to => ({ to, sound: 'default', title, body, data }));
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) { await expo.sendPushNotificationsAsync(chunk); }
  }
  ```
- **미참여자 필터링 패턴**:
  ```typescript
  const allRooms = await prisma.residentRecord.findMany({ where: { villaId }, select: { userId: true } });
  const voters = await prisma.vote.findMany({ where: { pollId }, select: { voterId: true } });
  const voterIds = new Set(voters.map(v => v.voterId));
  const nonVoters = allRooms.filter(r => !voterIds.has(r.userId));
  ```
- **자동결제 상태 조건부 렌더링**: `billingInfo.isAutoBilling`으로 카드 등록 버튼 vs 활성 카드 UI 분기
- **LedgerTabScreen 래퍼 패턴**: 탭 마운트 전용 래퍼 — params 없는 화면은 단순 pass-through 컴포넌트

---

### 2026-03-05 — 백오피스 웹 완성, 공지/FAQ 연동, 온보딩 정규화, SaaS BM 세션

#### 이 세션에서 구현한 기능

1. **역할 선택 화면 신설** (`SelectRoleScreen.tsx`)
   - 약관 동의(SignupAgreementScreen) 이후 역할 선택 단계 추가
   - "동대표로 시작하기" → `Onboarding` (빌라 등록 플로우)
   - "입주민으로 시작하기" → `VillaSearch` 또는 `ResidentJoin` (빌라 가입 플로우)
   - route.params 체인: `{ email, password, name, termsAgreed }` 유지하여 전달

2. **빌라 검색/신청 화면** (`VillaSearchScreen.tsx`)
   - 초대 코드 없이 빌라 이름·주소로 검색 후 입주 신청
   - 관리자가 앱에서 신청 승인 → `ResidentRecord` 생성하는 흐름

3. **'우리 빌라' 탭 신설** (`OurVillaScreen.tsx`)
   - `ResidentTabNavigator`에 4번째 탭 추가 (홈/커뮤니티/우리 빌라/프로필)
   - 빌라 기본 정보(이름, 주소, 세대수) + 건물 이력 사진 썸네일 갤러리
   - `GET /api/villas/:villaId/building-events` 기존 API 재활용

4. **계약 상세 화면** (`ContractDetailScreen.tsx`)
   - `BuildingEvent`의 `attachmentUrl`(계약서/영수증 사진) 풀스크린 뷰어
   - `OurVillaScreen`에서 카드 탭 시 이동

5. **SaaS 구독 관리 화면** (`AdminSubscriptionScreen.tsx`)
   - 구독 상태 표시: `FREE_TRIAL` / `ACTIVE` / `EXPIRED`
   - 1개월 무료 쿠폰 코드 입력 → `POST /api/subscriptions/redeem` → `FREE_TRIAL` 활성화
   - 유료 구독 신청: 계좌번호 표시 → 수동 이체 → "입금 완료 알림" 버튼 (ExternalBilling 패턴 재활용)

6. **입주민 청구서 전용 화면** (`ResidentInvoiceScreen.tsx`)
   - `ResidentDashboardScreen`에 혼재되어 있던 청구서 로직을 독립 화면으로 분리
   - 청구서 목록 + 미납/완납 필터 탭

#### 이 세션에서 확립된 추가 패턴

- **SaaS 구독 상태 흐름**:
  ```
  신규 가입 → FREE_TRIAL (쿠폰 사용 시 1개월)
           → ACTIVE     (유료 전환, 관리자 입금 확인 후)
           → EXPIRED    (만료, 핵심 기능 제한)
  ```
- **무료 쿠폰 패턴**: `POST /api/subscriptions/redeem { code }` → DB `Coupon.isUsed = true`, `Villa.subscriptionStatus = 'FREE_TRIAL'`, `trialEndDate = now + 30days`
- **역할 선택 params 체인 연장**: `email + password + name + termsAgreed` → `SelectRoleScreen` → role에 따라 분기
- **탭 추가 시 순서 원칙**: 입주민 탭은 "홈(집) / 커뮤니티(말풍선) / 우리 빌라(건물) / 프로필(사람)" 순으로 직관적 아이콘 배치

---

### 2026-03-10 — 다중 역할(세대주/세대원), 듀얼 모드, 호수 사전 지정, 알림 자동화 세션

#### 이 세션에서 구현한 기능

1. **다중 역할 입주민 (HEAD vs MEMBER)**
   - `ResidentRecord.residentType String @default("HEAD")` 스키마 추가
   - 가입 시 자동 판별: 해당 `villaId + normalizedRoomNumber`에 HEAD가 이미 있으면 MEMBER, 없으면 HEAD
   - HEAD만 청구서 발행 대상 (`residentType: 'HEAD'` 필터) — 수동 발행 + 자동결제 cron 양쪽 적용
   - HEAD만 투표 가능 — MEMBER는 403 반환(`'투표권은 세대주에게만 있습니다.'`)
   - HEAD만 납부 내역 조회 — MEMBER는 빈 배열 즉시 반환
   - 프론트: `ProfileScreen`에 역할 뱃지 (HEAD=주황 `👑 세대주(대표)`, MEMBER=하늘 `👥 세대원`)
   - 프론트: `PollDetailScreen`에 MEMBER용 비활성 버튼 + 안내 노란 박스

2. **듀얼 모드 (ADMIN ↔ RESIDENT 전환)**
   - `frontend/src/context/AppModeContext.tsx` 신규 — `AppMode: 'ADMIN' | 'RESIDENT'`, `useAppMode()` hook
   - `App.tsx` 최상위에 `<AppModeProvider>` 추가
   - `DashboardScreen`: "🔄 입주민 모드로 전환" 보라색 카드 → AsyncStorage에 villa 병합 후 `ResidentDashboard`로 이동
   - `ResidentDashboardScreen`: `userRole === 'ADMIN'`이면 "👑 관리자 모드로 복귀" 버튼 표시
   - `ProfileScreen`: 동일 복귀 버튼 + 역할 뱃지

3. **세대 호수 사전 지정**
   - `Villa.roomNumbers String[] @default([])` 스키마 추가
   - `POST /api/villas`: `adminRoomNumber`(admin ResidentRecord 생성), `roomNumbers[]` 저장
   - `GET /api/villas/join/rooms?inviteCode=XXX`: 입주민 가입 전 호수 목록 조회 (라우트 순서 주의)
   - `PUT /api/villas/:villaId/rooms`: 관리자가 호수 목록 수정
   - `OnboardingScreen`: 호수 칩 UI (추가/삭제) + `adminRoomNumber` 입력 + 동시 전송
   - `ResidentJoinScreen`: 6자리 초대코드 입력 완료 시 자동 fetch → 호수 picker Modal 표시 (없으면 TextInput 폴백)
   - `DashboardScreen`: "세대 호수 관리" 카드 + 칩 관리 Modal

4. **호수 정규화 버그 수정**
   - `normalizeRoom(room)` 유틸 추가: `room.replace(/호/g, '').trim()`
   - 모든 가입/저장 경로에 정규화 적용 (join, 투표, 청구서 모두)
   - `migrateRoomNumbers()` 스타트업 마이그레이션: 기존 더티 데이터(`'101호'`) → `'101'` 일괄 정규화
   - MEMBER 납부 가드: `residentType === 'MEMBER'`이면 `GET /api/residents/:id/payments` 즉시 `200 []` 반환

5. **미납 관리비 자동 독촉 크론**
   - `POST /api/villas/:villaId/invoices` 청구서 생성 시 즉시 세대주 전체 푸시:
     - 제목: `새 관리비 청구서 도착 📋`, 본문: `${billingMonth} 관리비가 청구되었습니다. ${amountPerResident}원`
   - `cron.schedule('0 10 * * *', ...)` 매일 오전 10시 독촉 크론:
     - 모든 PENDING `InvoicePayment` 조회 → 청구서 생성일 기준 정확히 **3일차**, **7일차**에만 푸시 발송
     - 3일차: `관리비 미납 안내 ⚠️`, 7일차: `[최종 안내] 관리비 납부를 확인해주세요.`
     - 이후 추가 알림 없음

#### 이 세션에서 확립된 추가 패턴

- **라우트 충돌 방지**: `GET /api/villas/join/rooms`를 반드시 `POST /api/villas/join`과 `GET /api/villas/:adminId` 앞에 등록
- **HEAD/MEMBER 자동 판별**:
  ```typescript
  const existing = await prisma.residentRecord.findFirst({ where: { villaId, roomNumber: normalizedRoom } });
  const residentType = existing ? 'MEMBER' : 'HEAD';
  ```
- **AppModeContext 듀얼 모드 패턴**:
  ```typescript
  // 전환 시 villa 데이터를 AsyncStorage에 먼저 병합 후 setAppMode + navigation
  const existing = await AsyncStorage.getItem('user');
  const merged = { ...JSON.parse(existing || '{}'), villa: villaData };
  await AsyncStorage.setItem('user', JSON.stringify(merged));
  setAppMode('RESIDENT');
  navigation.replace('ResidentDashboard');
  ```
- **조건부 독촉 크론 패턴**: `daysSince === 3` 또는 `daysSince === 7`에만 발송 — `Math.floor((now - createdAt) / 86400000)`
- **청구서 생성 후 즉시 푸시**: try/catch 독립 블록 — 푸시 실패가 청구서 생성 응답에 영향 없도록 격리

---

### 2026-03-11 — RDD 문서화, 백엔드 모듈화, 전역 JWT 인증, 전자투표 UX, 독촉 쿨타임 세션

#### 이 세션에서 구현한 기능

1. **RDD (요구사항 정의서) 최초 작성** (`docs/RDD.md` 신규)
   - `PRODUCT_CONTEXT.md`, `IA.md`, `PHASE1_SCOPE.md` 3개 문서를 단일 SSOT(Single Source of Truth)로 통합
   - 전체 기능 요구사항(F-01~F-80) + 비기능 요구사항(NF-01~NF-13) 정의, 완료/진행/미구현 상태 표시
   - 백로그 우선순위(즉시/Q2/장기/하지 않을 것) 명시

2. **백엔드 모듈화 리팩토링** (단일 `index.ts` → 도메인별 파일 분리)
   - `backend/src/routes/` — 도메인별 라우트 파일 분리
   - `backend/src/controllers/` — 컨트롤러 함수 분리
   - `backend/src/middlewares/` — `authenticateUser` 등 미들웨어 분리
   - `backend/src/cron.ts` — 자동 독촉 크론 로직 분리
   - `backend/src/helpers.ts` — `normalizeRoom`, `sanitizeUser`, `formatBillingMonth` 헬퍼 분리
   - `backend/src/migrations.ts` — `migrateRoomNumbers` 스타트업 마이그레이션 분리
   - `backend/src/prisma.ts` — Prisma 클라이언트 단일 인스턴스 분리

3. **프론트엔드 전역 JWT 인증** (Axios Interceptor 기반)
   - `frontend/src/utils/api.ts` 신규 — `axios.create()` 기반 공통 인스턴스
   - `request interceptor`: AsyncStorage에서 `token`을 읽어 `Authorization: Bearer ${token}` 자동 주입
   - `response interceptor`: 401 응답 시 AsyncStorage 전체 초기화 + `LoginScreen`으로 자동 리다이렉트
   - 35개 이상 스크린의 `fetch()` 직접 호출을 axiosInstance 호출로 일괄 교체
   - 이로써 F-08(클라이언트 JWT 헤더 적용), NF-04(JWT 클라이언트 완성) 달성

4. **전자투표 UX 강화** (`PollDetailScreen.tsx`)
   - **투표 수정(Upsert)**: 마감 전 이미 투표한 경우에도 다른 선택지 선택 후 재투표 가능
     - 백엔드: `Vote` upsert 방식으로 변경 (`@@unique([pollId, roomNumber])` 활용)
   - **"✅ 투표 완료" 배지**: `hasVoted === true`이면 해당 선택지 카드에 초록 체크 배지 표시
   - **이전 선택지 자동 선택**: 화면 진입 시 기존 투표 데이터 조회 → `selectedOption`에 사전 세팅

5. **미납 독촉 알림 1일 1회 쿨타임** (`backend/src/cron.ts`)
   - 동일 `InvoicePayment`에 대해 당일 이미 독촉 알림이 발송된 경우 재발송 방지
   - `lastReminderSentAt` 필드 또는 당일 날짜 비교 로직으로 중복 방지
   - 수동 알림 버튼(`PostDetailScreen`)에도 동일 쿨타임 적용

#### 핵심 구현 패턴 (신규)

- **Axios Interceptor 패턴** (`frontend/src/utils/api.ts`):
  ```typescript
  const axiosInstance = axios.create({ baseURL: API_BASE_URL });
  axiosInstance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  axiosInstance.interceptors.response.use(
    (res) => res,
    async (error) => {
      if (error.response?.status === 401) {
        await AsyncStorage.multiRemove(['user', 'token']);
        // navigation.replace('Login') — 최상단 네비게이션 ref로 처리
      }
      return Promise.reject(error);
    }
  );
  ```

- **투표 Upsert 패턴**:
  ```typescript
  await prisma.vote.upsert({
    where: { pollId_roomNumber: { pollId, roomNumber } },
    update: { optionId },
    create: { pollId, optionId, voterId, roomNumber },
  });
  ```

- **백엔드 모듈화 import 패턴**:
  ```typescript
  // backend/src/prisma.ts
  export const prisma = new PrismaClient();
  // backend/src/helpers.ts
  export function normalizeRoom(room: string) { return room.replace(/호/g, '').trim(); }
  // backend/src/routes/villas.ts
  import { prisma } from '../prisma';
  import { normalizeRoom } from '../helpers';
  ```

---

### 2026-03-12 — Paywall 버그 수정, 구독 만료 Cron, Ticket 시스템, 장부/이미지 실데이터 세션

#### 이 세션에서 구현한 기능

1. **Paywall 무한루프 및 BackHandler 버그 수정**
   - `frontend/src/screens/AdminSubscriptionScreen.tsx`:
     - `BackHandler.removeEventListener` → `subscription.remove()` 패턴으로 수정
     - `resolvedVillaId` state 추가 — `route.params → user.villa.id → villaId 키 → API 조회` 3단계 폴백
     - 홈 이동: `navigation.reset({ index: 0, routes: [{ name: 'Main' }] })`
   - `frontend/src/utils/api.ts`:
     - `let isHandlingSubscriptionExpiry = false` 모듈 플래그 추가
     - 403 인터셉터: 현재 경로 === 'AdminSubscription' 또는 플래그 on이면 조기 반환
     - 플래그를 `onPress` 콜백 내에서 리셋
   - `frontend/src/screens/DashboardScreen.tsx`:
     - `ALLOWED_STATUSES = ['ACTIVE', 'FREE_TRIAL']` 배열 허용 목록으로 변경

2. **구독 만료 자동화 Cron** (`backend/src/cron.ts`)
   - `startSubscriptionExpiryCron()` 신규 추가 (매일 자정 `0 0 * * *`)
   - `subscriptionExpiry < now`인 ACTIVE/FREE_TRIAL 빌라 → EXPIRED 일괄 업데이트 (`updateMany`)
   - 각 빌라 admin에게 "구독이 만료되었습니다" 푸시 알림
   - `backend/src/index.ts`에 `startSubscriptionExpiryCron()` 호출 추가

3. **phone/phoneNumber 컬럼 중복 버그 수정**
   - `backend/prisma/schema.prisma`: `User.phoneNumber String?` 제거 (→ `phone String? @unique`만 유지)
   - `backend/src/controllers/authController.ts`: `phoneNumber:` → `phone:`
   - `npx prisma db push --accept-data-loss` 적용

4. **checkSubscription 미들웨어 신규 구현** (`backend/src/middlewares/checkSubscription.ts`)
   - JWT에서 `userId` 조회 → `Villa.adminId` 확인 → `subscriptionStatus`가 ACTIVE/FREE_TRIAL 아니면 403
   - 적용 라우트: 청구서 생성, 공지 작성, 투표 생성, 건물 이력 등록, 외부 청구 생성

5. **구독 다운그레이드 방지** (`backend/src/controllers/villaController.ts`)
   - `subscribe` 함수: ADMIN 역할 호출 시 현재 상태가 ACTIVE이면 409 반환

6. **Ticket(민원/수리) 독립 시스템 재구현**
   - `frontend/src/screens/TicketListScreen.tsx` 신규:
     - 상태 배지: PENDING(노랑)/IN_PROGRESS(파랑)/RESOLVED(초록)
     - 관리자: 탭 → ActionSheet(iOS)/Alert(Android)로 상태 변경
     - 입주민: `residentId` 기준 본인 민원만 필터링, 읽기 전용
     - FAB → CreateTicket 화면 이동
   - `frontend/src/screens/CreateTicketScreen.tsx` 신규:
     - 카테고리 칩: COMMON_FACILITY/PARKING/NOISE_COMPLAINT/ETC
     - `POST /api/villas/:villaId/tickets` 연동
   - `frontend/src/screens/ManagementScreen.tsx`: "민원 및 수리 요청" 메뉴 추가
   - `frontend/src/screens/ResidentDashboardScreen.tsx`: "민원 및 수리 요청" 위젯 카드 추가
   - `frontend/src/navigation/AppNavigator.tsx`: TicketList, CreateTicket 스크린 등록

7. **장부(Ledger) 실데이터 연동** (`frontend/src/screens/LedgerScreen.tsx` 완전 재작성)
   - 더미 TRANSACTIONS 배열 제거 → `api.get('/api/villas/${villaId}/ledger')` 실 조회
   - 동적 잔액: INCOME - EXPENSE 합산
   - "+ 내역 추가" 모달: 날짜/유형/제목/금액 입력 → `POST /api/villas/${villaId}/ledger`
   - villaId: params → user.villa.id → admin API 폴백
   - `backend/src/controllers/villaController.ts`: `getLedger`, `createLedgerTransaction` 추가
   - `backend/src/routes/villaRoutes.ts`: `/api/villas/:villaId/ledger` GET/POST 라우트 추가 (`:adminId` 와일드카드 앞에 배치)

8. **건물 이력 이미지 업로드 실 연동** (`frontend/src/screens/CreateBuildingEventScreen.tsx`)
   - `expo-image-picker`로 사진 선택
   - native `fetch()` + `FormData`로 `POST /api/public/upload` 멀티파트 업로드
   - `Authorization: Bearer ${token}` 헤더 직접 포함 (Axios 경유 안 함)
   - 업로드 중 `uploading` state → 버튼 비활성화 + "업로드 중..." 텍스트
   - 이미지 미리보기 + ✕ 제거 버튼
   - `frontend/app.json`: expo-image-picker 플러그인 + 한국어 `photosPermission` 추가

#### 이 세션에서 확립된 추가 패턴

- **BackHandler 구독 패턴** (React Native 0.65+):
  ```typescript
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => subscription.remove();
  }, []);
  ```

- **구독 만료 Cron 패턴**:
  ```typescript
  cron.schedule('0 0 * * *', async () => {
    const expired = await prisma.villa.findMany({
      where: {
        subscriptionStatus: { in: ['ACTIVE', 'FREE_TRIAL'] },
        subscriptionExpiry: { not: null, lt: new Date() },
      },
      select: { id: true, name: true, adminId: true, admin: { select: { expoPushToken: true } } },
    });
    await prisma.villa.updateMany({
      where: { id: { in: expired.map(v => v.id) } },
      data: { subscriptionStatus: 'EXPIRED' },
    });
    // 각 admin에게 푸시 알림 발송
  });
  ```

- **checkSubscription 미들웨어 패턴**:
  ```typescript
  export async function checkSubscription(req: Request, res: Response, next: NextFunction) {
    const villaId = parseInt(req.params.villaId);
    const villa = await prisma.villa.findUnique({ where: { id: villaId }, select: { subscriptionStatus: true } });
    if (!['ACTIVE', 'FREE_TRIAL'].includes(villa?.subscriptionStatus ?? '')) {
      return res.status(403).json({ error: 'SUBSCRIPTION_EXPIRED' });
    }
    next();
  }
  ```

- **이미지 업로드 native fetch 패턴** (Axios 우회):
  ```typescript
  const token = await AsyncStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', { uri: imageUri, name: 'image.jpg', type: 'image/jpeg' } as any);
  const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const uploadData = await uploadRes.json();
  const fileUrl = uploadData.fileUrl;
  ```

---

## 프로젝트 진행 기록 (2026-04-04)

### 구현된 API 라우트

#### 인증
- `POST /api/auth/register` — 회원가입 (bcrypt 해싱, JWT 발급)
- `POST /api/auth/login` — 로그인 (villaId 페이로드 포함)
- `PATCH /api/auth/password` — 비밀번호 변경 (현재 비밀번호 검증)

#### 빌라 / 입주민
- `POST /api/villas` — 빌라 등록 (초대 코드 자동 생성, 충돌 재시도)
- `POST /api/villas/join` — 초대 코드로 가입 (HEAD/MEMBER 자동 판별)
- `GET/PATCH /api/villas/[villaId]` — 빌라 정보 조회 / 호수 목록 수정
- `GET /api/villas/[villaId]/residents` — 목록 조회 (검색 필터, 호수순 정렬)
- `DELETE /api/villas/[villaId]/residents/[residentId]` — 전출 처리 (SetNull 안전)

#### 청구서
- `GET/POST /api/villas/[villaId]/invoices` — 목록 + FIXED/VARIABLE 발행
- `GET /api/villas/[villaId]/invoices/[invoiceId]` — 상세 + 납부 현황
- `PATCH /api/villas/[villaId]/invoices/[invoiceId]/payments/[paymentId]` — 납부 처리
- `GET /api/villas/[villaId]/invoices/my` — 입주민 본인 청구서
- `POST /api/villas/[villaId]/invoices/[invoiceId]/remind` — 수동 독촉 (1일 쿨타임)

#### 알림
- `GET /api/notifications` — 알림함 조회 + unreadCount
- `PATCH /api/notifications/[id]/read` — 개별 읽음
- `PATCH /api/notifications/read-all` — 전체 읽음

#### 커뮤니티
- `GET/POST /api/villas/[villaId]/posts` — 게시글 목록/작성 (공지 최상단)
- `GET/DELETE /api/villas/[villaId]/posts/[postId]` — 상세/삭제
- `POST /api/villas/[villaId]/posts/[postId]/comments` — 댓글 작성

#### 구독
- `GET /api/villas/[villaId]/subscription` — 구독 상태 + 잔여일
- `POST /api/villas/[villaId]/subscription/coupon` — 쿠폰 활성화 ($transaction)

#### Cron
- `GET /api/cron/invoice-reminder` — 미납 3/7일차 독촉 알림
- `GET /api/cron/expire-subscriptions` — 구독 만료 처리

#### 대시보드
- `GET /api/dashboard` — 역할별 집계 통계 (동대표/입주민 분기)

### 핵심 라이브러리 / 패턴
- `lib/auth.ts` — `signToken()` / `verifyToken()` (jose)
- `lib/api.ts` — `getUser()` / `ok()` / `err()`
- `lib/notify.ts` — `createNotification()` / `createNotificationForVilla()`
- `lib/subscription.ts` — `requireActiveSubscription(villaId)`
- `prisma.$transaction` — 청구서 발행, 쿠폰 활성화 원자적 처리

### 구현된 UI 컴포넌트
`Button`, `Card`, `Badge`, `Input`, `Textarea`, `Chip`, `BottomNav`, `WidgetCard`, `Skeleton`, `NotificationList`

### 구현된 페이지
- **(auth)**: login, signup/agreement, signup/profile, select-role, onboarding, join
- **(admin)**: home, manage/residents, manage/invoices, manage/invoices/new, manage/invoices/[id], community, profile, profile/notifications, profile/subscription
- **(resident)**: home, villa/invoices, community, profile, profile/notifications

---

## 2026-04-04 업데이트

### 신규 API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/villas/search?q=` | 빌라 이름/주소 검색 (입주 신청 전 단계) |
| `POST` | `/api/villas/[villaId]/residents/join` | 입주 신청 (PENDING 생성 + admin 알림) |
| `PATCH` | `/api/villas/[villaId]/residents/[residentId]` | 입주 신청 승인/거절 + 입주민 알림 |
| `GET` | `/api/cron/publish-invoices` | 매월 지정일 자동 청구서 발행 (KST 00:00) |

### 수정된 API 엔드포인트

| 메서드 | 경로 | 변경 내용 |
|--------|------|---------|
| `POST` | `/api/villas` | 역할 승격 — RESIDENT 가입자도 등록 가능, 성공 시 ADMIN role + 새 JWT 발급 |
| `GET` | `/api/villas/[villaId]/residents` | `status = APPROVED` 필터 추가 (PENDING 입주 신청자 제외) |

### 스키마 변경

```prisma
enum ResidentStatus {
  PENDING
  APPROVED
  REJECTED
}

model ResidentRecord {
  // ...기존 필드...
  status ResidentStatus @default(PENDING)
}
```

### 신규 UI

- **`join/page.tsx` 2탭 분리**: "초대 코드로 가입" / "빌라 검색으로 신청" 탭 UI
- **`manage/residents/page.tsx` PENDING 섹션**: 승인 대기 중인 입주 신청 카드 + 승인/거절 버튼
- **듀얼 모드 토글**: admin profile 페이지에 "입주민 화면으로 전환" 버튼, resident profile에 "동대표 모드로 복귀" 버튼
- **입주민 필터 칩**: manage/residents 페이지에 전체/세대주/세입자 칩 필터 추가

### 신규 lib 함수 (`lib/client-auth.ts`)

```typescript
type ViewMode = 'ADMIN' | 'RESIDENT';
export function getViewMode(): ViewMode  // localStorage 'viewMode' 읽기
export function setViewMode(mode: ViewMode): void  // localStorage 저장
export function hasDualMode(): boolean  // user.role === 'ADMIN' 체크
export function getToken(): string | null  // localStorage 'token' 읽기
```

### 카카오 Daum Postcode 연동 패턴 (`onboarding/page.tsx`)

```tsx
// next/script로 lazyOnload
<Script
  src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
  strategy="lazyOnload"
/>

// 사용 시
new window.daum.Postcode({
  oncomplete: (data) => {
    setAddress(data.roadAddress || data.jibunAddress);
    if (data.buildingName) setVillaName(data.buildingName); // 건물명 자동 입력
  },
}).open();
```

### middleware.ts CRON_SECRET 방어

```typescript
// 기존: undefined 비교 허용 → "Bearer undefined" 으로 우회 가능
// 수정: CRON_SECRET 미설정 시 즉시 500
if (!process.env.CRON_SECRET) {
  return Response.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
}
```

### 7일차 독촉 알림 버그 수정

```typescript
// 기존: 3일차 쿨타임 알림이 7일차 조건에서도 중복 체크됨
// 수정: contains 조건으로 분리
const already3d = await prisma.notification.findFirst({
  where: { userId, title: { contains: '3일' }, createdAt: { gte: todayStart } }
});
const already7d = await prisma.notification.findFirst({
  where: { userId, title: { contains: '최종' }, createdAt: { gte: todayStart } }
});

---

## 2026-04-05 업데이트

### PortOne PG 결제 구현 패턴 (F-29)

**서버 검증 API** (`/api/.../payments/[paymentId]/verify`):
```typescript
// 1. PortOne 액세스 토큰 발급
const res = await fetch('https://api.iamport.kr/users/getToken', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ imp_key, imp_secret }),
});
const token = res.data?.response?.access_token;

// 2. 결제 정보 조회
const payment = await fetch(`https://api.iamport.kr/payments/${imp_uid}`, {
  headers: { Authorization: `Bearer ${token}` },
});

// 3. 검증: paid 여부 + 금액 일치 + merchant_uid에 paymentId 포함
if (portOnePayment.status !== 'paid') return err('...');
if (Number(payment.amount) !== dbAmount) return err('금액 불일치');
if (!portOnePayment.merchant_uid.includes(paymentId)) return err('...');
```

**클라이언트 SDK 로드** (`next/script` 사용):
```tsx
<Script
  src="https://cdn.iamport.kr/v1/iamport.js"
  strategy="lazyOnload"
  onLoad={() => setSdkReady(true)}
/>
// 사용 시: window.IMP.init(impCode); window.IMP.request_pay({...}, callback);
```

**merchant_uid 패턴:**
- 인앱 결제: `order_{paymentId}_{Date.now()}`
- 외부 청구: `ext_{billId}_{Date.now()}`

### 청구서 PDF 저장 패턴 (F-30, 외부 라이브러리 없음)

```typescript
// InvoicePDFButton.tsx — 팝업 프린트 방식
const popup = window.open('', '_blank', 'width=800,height=1000');
popup.document.write(/* HTML */);
popup.document.close();
popup.print();

// Web Share API 지원 시 공유
if (navigator.share) {
  await navigator.share({ title: '관리비 청구서', text: '...' });
} else {
  navigator.clipboard.writeText('...');
}
```

**InvoicePrintView 컴포넌트:** `components/InvoicePrintView.tsx` — `@media print` CSS로 프린트 시 탭바 등 숨김.

### 공개 외부 청구 결제 패턴 (F-31)

`/pay/[billId]` 페이지는 JWT 없이 접근 — `middleware.ts`의 `PUBLIC_API`에 `/api/pay/` 이미 포함됨.

PortOne 콜백 처리:
```typescript
window.IMP.request_pay({ ... }, async (rsp) => {
  if (!rsp.success) { setPayError(rsp.error_msg); return; }
  const res = await fetch(`/api/pay/${billId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ imp_uid: rsp.imp_uid }),
  });
  if (res.ok) setCompleted(true);
});
```

### Vercel 배포 구성 (2026-04-05)

`apps/web/package.json` 스크립트:
```json
"build": "prisma generate && next build",
"postinstall": "prisma generate"
```

`apps/web/vercel.json` 필수 필드:
```json
{
  "buildCommand": "prisma generate && next build",
  "outputDirectory": ".next",
  "crons": [...]
}
```

**주의**: `rootDirectory`는 `vercel.json`이 아닌 Vercel 대시보드에서 설정. `vercel.json`은 rootDirectory와 같은 위치에 있어야 함 (`apps/web/vercel.json`).

### TypeScript 전역 타입 선언 관리

여러 페이지에서 `declare global { interface Window { ... } }`를 중복 선언하면 빌드 에러 발생. 모든 전역 Window 확장은 `apps/web/types/globals.d.ts` 한 곳에서 관리.

```typescript
// ❌ 각 페이지 파일에 직접 선언 — 타입 충돌
declare global { interface Window { IMP: ... } }

// ✅ types/globals.d.ts 에서만 선언
declare global {
  interface PortOneResponse { ... }
  interface Window { IMP: ...; daum: ... }
}
export {};

---

## 2026-04-07 업데이트

### 민원 시스템 구현 패턴 (F-51/52/53)

#### API 구현

```typescript
// GET /api/villas/[villaId]/tickets — role 분기
const where = user.role === 'ADMIN'
  ? { villaId }
  : { villaId, reporterId: user.sub };

// PATCH /api/villas/[villaId]/tickets/[ticketId] — 상태 전환 강제
const VALID_TRANSITIONS: Record<string, TicketStatus> = {
  PENDING: TicketStatus.IN_PROGRESS,
  IN_PROGRESS: TicketStatus.RESOLVED,
};
const allowedNext = VALID_TRANSITIONS[ticket.status];
if (!allowedNext || allowedNext !== status) return err('Invalid transition');
```

#### 알림 유틸 (`lib/notify.ts`)

`notifyTicketStatusChange(ticketId, reporterId, villaId, ticketTitle, newStatus)` — 상태 변경 후 `NotificationType.TICKET`으로 Notification 생성.

#### 빌드 오류 패턴 — Badge variant

`BadgeVariant`에 `'default'` 없음 → `'neutral'` 사용. 신규 Badge 사용 시 `Badge.tsx`의 타입 유니온 확인 필수:
```
'완납' | '미납' | '납기임박' | '진행중' | '종료' | 'success' | 'error' | 'warning' | 'info' | 'neutral'
```

#### 루트 랜딩 페이지 (`app/page.tsx`)

`getToken()` / `getUser()` from `@/lib/client-auth`로 localStorage 인증 상태 체크 후 role 기반 redirect. `'use client'` 컴포넌트 필수 (localStorage 접근).
```

---

## 2026-04-07 버그 수정 패턴

### localStorage user 구조 — 올바른 villaId 접근

```typescript
// ❌ 잘못된 패턴 — user.villaId 필드 존재하지 않음 (10개 파일에서 동시 발생)
const user = JSON.parse(raw) as { villaId?: string };
setVillaId(user.villaId ?? '');

// ✅ Admin 페이지 — user.villa?.id
const user = JSON.parse(raw) as { villa?: { id?: string } };
setVillaId(user.villa?.id ?? '');

// ✅ Resident 페이지 — 듀얼 모드 대응 (residentVilla 우선)
const user = JSON.parse(raw) as { residentVilla?: { id?: string }; villa?: { id?: string } };
setVillaId(user.residentVilla?.id ?? user.villa?.id ?? '');
```

**이유**: 회원가입 후 저장되는 StoredUser는 `villa.id`에 빌라 ID를 저장. ADMIN이 입주민으로 별도 빌라 가입 시 `residentVilla.id`에 저장. `villaId` 최상위 필드는 JWT payload에만 존재하고 localStorage에는 없음.

### 하단 고정 버튼 — BottomNav 겹침 방지 패턴

```tsx
// ❌ 잘못된 패턴 — BottomNav(h-14)와 겹치고 전체 뷰포트 폭 차지
<div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 bg-white ...">
  <Button className="w-full">등록하기</Button>
</div>

// ✅ 올바른 패턴 — BottomNav 위에 위치, max-w-lg 레이아웃 따름
<div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pb-4 pt-3 bg-white ...">
  <Button className="w-full">등록하기</Button>
</div>
```

**규칙**: 
- `bottom-14` = BottomNav 높이(h-14=56px) 오프셋
- `left-1/2 -translate-x-1/2 max-w-lg` = 레이아웃 max-w-lg와 동일 폭 유지
- 페이지 콘텐츠는 `pb-32` 이상으로 버튼에 가려지지 않도록

### 대시보드 API 에러 vs needsSetup 분리 패턴

```typescript
// ❌ 잘못된 패턴 — 네트워크 오류도 "빌라 미등록"으로 처리
.catch(() => setNeedsSetup(true))

// ✅ 올바른 패턴 — 에러 원인 분리
.then((json) => {
  if ('needsSetup' in json && json.needsSetup) setNeedsSetup(true);
  else setData(json);
})
.catch(() => setFetchError(true))  // 에러는 별도 상태로
```

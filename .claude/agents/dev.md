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

---

## 2026-04-10 구현 기록

### 오늘 완료된 기능

| 기능 | 파일 | 패턴 |
|------|------|------|
| F-46 댓글 UI | `(admin)/community/[id]/page.tsx`, `(resident)/resident/community/[id]/page.tsx` | 댓글 등록 후 re-fetch 없이 setComments 직접 업데이트 |
| F-47 내 게시글 API | `api/villas/[villaId]/posts/my/route.ts` | `/my` suffix 필터링 패턴 |
| F-47 내 게시글 UI | `(resident)/resident/profile/my-posts/page.tsx` | profile 섹션 하위 신규 페이지 |
| F-48 이미지 업로드 API | `api/upload/route.ts` | Supabase Storage, FormData, service role key |
| F-48 이미지 첨부 UI | `community/new/page.tsx` (admin + resident) | 점선 박스 → 이미지 미리보기 + ✕ 버튼 |
| F-54 투표 생성 API+UI | `api/villas/[villaId]/polls/route.ts` (POST), `manage/polls/new/page.tsx` | 선택지 동적 추가/삭제, datetime-local input |
| F-55 투표 참여 API+UI | `api/villas/[villaId]/polls/[pollId]/vote/route.ts`, `villa/polls/[id]/page.tsx` | HEAD 세대주 확인, 투표 후 즉시 결과 전환 |
| F-56 1세대1표 | API에서 P2002 처리 | `@@unique([pollId, roomNumber])` 이미 스키마 존재 |
| F-57 결과 시각화 | admin `manage/polls/[id]/page.tsx`, resident `villa/polls/[id]/page.tsx` | 퍼센트 바, 기명 시 호수 목록 표시 |

### 신규 확립된 패턴

#### 투표 후 즉시 결과 전환 (re-fetch 없음)

```typescript
// 투표 성공 시 setMyVotedOptionId + setPoll 로컬 업데이트
setMyVotedOptionId(selectedOptionId);
setPoll((prev) => {
  const newTotal = prev.totalVotes + 1;
  return {
    ...prev,
    totalVotes: newTotal,
    options: prev.options.map((o) => {
      const newCount = o.id === selectedOptionId ? o.voteCount + 1 : o.voteCount;
      return { ...o, voteCount: newCount, percent: Math.round((newCount / newTotal) * 100) };
    }),
  };
});
```

#### Supabase Storage 업로드 패턴

```typescript
// API route에서 service role key로 클라이언트 생성
const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// FormData에서 File 객체 추출
const file = formData.get('file') as File | null;
const arrayBuffer = await file.arrayBuffer();
await supabase.storage.from('posts').upload(fileName, arrayBuffer, { contentType: file.type });
const { data } = supabase.storage.from('posts').getPublicUrl(fileName);
```

#### 이미지 첨부 UI 패턴 (글쓰기 폼)

```tsx
// 이미지 없을 때: 점선 박스 버튼 (fileInputRef.current?.click() 트리거)
// 이미지 있을 때: 미리보기 + 절대 위치 ✕ 버튼
// <input type="file"> hidden으로 숨김
```

#### Prisma unique constraint 에러 처리

```typescript
try {
  await prisma.vote.create({ ... });
} catch (e: unknown) {
  if (e !== null && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
    return err('이미 투표한 세대입니다.', 409);
  }
  throw e; // 재throw로 외부 catch 전달
}
```

### 알려진 기술 부채 (2026-04-10 기준)

| 항목 | 심각도 | 비고 |
|------|--------|------|
| Supabase `posts` 버킷 미생성 | High | 배포 환경에서 수동 생성 + Public 설정 필요 |
| F-58 투표 참여율 바 | Low | 전체 세대수 대비 % 미구현 (voteCount 숫자만 표시) |
| `villa/page.tsx` 일부 서브페이지 stub | Medium | ledger, building, invoices 페이지는 내용 있으나 일부 미완성 |

---

## 2026-04-11 업데이트

### 완료된 기능 구현

#### F-58 투표 참여율 프로그레스 바

**변경 파일**: `api/villas/[villaId]/polls/route.ts`, `(resident)/villa/polls/page.tsx`

- `GET /polls` API에 `totalHouseholds` 추가 — `residentRecord.count({ residentType: 'HEAD', status: 'APPROVED' })`와 polls 쿼리를 `Promise.all`로 병렬 실행
- `PollCard` 컴포넌트에 참여율 프로그레스 바 추가: `voteCount / totalHouseholds * 100`
- 진행 중 `bg-primary-500` / 마감 `bg-neutral-400`

#### F-70 차량 등록 + F-71 번호판 검색

**신규 파일**: `api/villas/[villaId]/vehicles/route.ts`, `api/villas/[villaId]/vehicles/[vehicleId]/route.ts`, `(resident)/villa/vehicles/page.tsx`

- 번호판 정규식: `/^[가-힣0-9]{4,10}$/`
- 중복 번호판: Prisma P2002 catch → 409 반환
- 번호판 검색: `?plate=` 쿼리로 `contains` 부분 일치
- 입주민: 본인 차량만 / 관리자: 전체 목록
- `villa/page.tsx`에 주차 관리 메뉴 추가

#### F-62 장부 조회 + F-63 장부 등록 + F-64 영수증 첨부

**변경/신규 파일**: `api/villas/[villaId]/ledger/route.ts`, `(resident)/villa/ledger/page.tsx`, `(admin)/manage/ledger/page.tsx`

- GET: `year`+`month` 쿼리로 월별 필터 (`gte: 1일, lt: 다음달 1일`)
- GET 응답에 `summary: { totalIncome, totalExpense, balance }` 포함
- POST: 관리자 전용, `createdBy: user.sub` 저장
- 영수증: 기존 `/api/upload` 재사용 → `receiptUrl`에 저장

### 버그 수정 패턴 (오늘 확정된 코딩 규칙)

**localStorage villaId 읽기 패턴**:
```typescript
// 관리자
const user = JSON.parse(raw);
return user.villa?.id ?? null;

// 입주민 (겸용)
return user.residentVilla?.id ?? user.villa?.id ?? null;
```

**알림 발송 비동기 분리 패턴**:
```typescript
// 잘못된 패턴 (알림 실패 시 500 반환)
await notifyXxx(...);
return ok(result);

// 올바른 패턴 (알림 실패가 응답에 영향 없음)
notifyXxx(...).catch((e) => console.error('[domain] 알림 실패:', e));
return ok(result);
```

**TODO API 처리 원칙**:
- 구현 전 API는 `return err('준비 중인 기능입니다.', 501)` — 200 OK 반환 금지

### 알려진 기술 부채 (2026-04-11 기준)

| 항목 | 심각도 | 비고 |
|------|--------|------|
| `/api/pay/confirm` Rate Limit 인메모리 | Medium | Upstash Redis 전환 권장 |
| 디자인 토큰 이탈 (alert, 하드코딩 색상) | Medium | 다음 세션 처리 예정 |
| `<Skeleton>` 컴포넌트 미통일 | Low | 일부 페이지 `animate-pulse` 인라인 사용 |
| `<Card>` 컴포넌트 미사용 | Low | 인라인 `p-4/5/6` 혼재 |
| Supabase `posts` 버킷 Public 설정 | High | 배포 환경 수동 확인 필요 |

---

## 2026-04-11 (2차) 업데이트 — F-66~69, F-41/42, F-59/60, F-09, F-76, F-78/79

### 신규 구현 기능

#### F-66~68 건물 이력 등록·분류·사진 첨부

**`app/api/villas/[villaId]/building-events/route.ts`**
- GET: 관리자 + 승인 입주민 접근, `?category=` 필터 지원
- POST: 관리자 전용, `title/category/eventDate` 필수, `photoUrl/vendor/contact` 선택

**`app/(admin)/manage/building/page.tsx`** — 전체 재작성
- 카테고리 필터 바 (REPAIR/INSPECTION/CONTRACT/CLEANING/ETC)
- 인라인 등록 폼: 분류 그리드 선택, 제목/날짜/내용/업체명/연락처/사진
- 사진 업로드 후 `ImageViewer` 연동

**`app/(resident)/villa/building/page.tsx`** — 읽기 전용 목록

#### F-69 ImageViewer 풀스크린 뷰어

**`components/ui/ImageViewer.tsx`** (신규)
```tsx
// createPortal(document.body) + z-[999]
// ESC 키, 배경 클릭 닫기
// body.overflow hidden 토글
export function ImageViewer({ src, alt, onClose }: ImageViewerProps)
```

장부(영수증), 건물 이력 사진 등 공통 사용.

#### F-41 공지 푸시 알림

`POST /api/villas/[villaId]/posts` 변경:
```typescript
// isNotice: true 시 fire-and-forget 알림
prisma.notification.createMany({ data: residentIds.map(...) })
  .then(() => {})
  .catch((e) => console.error('[posts] 알림 실패:', e));
```
`NotificationType.SYSTEM` 사용, 발송 실패가 게시글 등록 응답에 영향 없음.

#### F-42 투표 독촉 알림 (수동)

**`POST /api/villas/[villaId]/polls/[pollId]/remind`**
- 이미 투표한 roomNumber Set 구성 → 미참여 세대주 필터
- `prisma.notification.createMany` POLL 타입 알림

**`app/(admin)/manage/polls/[id]/page.tsx`** — 하단 시트 내 "독촉 알림 보내기" 버튼

#### F-59 투표 수정

**`PATCH /api/villas/[villaId]/polls/[pollId]`**
- 마감된 투표 수정 불가 (400)
- 제목/설명/익명여부/종료일만 수정 가능 (선택지 수정 불가 — 기존 투표 무결성 보장)

관리자 투표 상세 페이지에 "수정" 헤더 버튼 추가 (진행 중 투표만 노출).

#### F-60 투표 독촉 Cron

**`app/api/cron/poll-reminder/route.ts`**
- 마감 24시간 이내 투표 조회 (`endDate: { gt: now, lte: in24h }`)
- 투표한 roomNumber Set → 미참여 HEAD 입주민 필터 → `createMany` POLL 알림

#### F-09 회원 탈퇴

**`app/api/auth/me/route.ts`** (DELETE)
- ADMIN + managedVilla 존재 시 400 (위임 먼저)
- 익명화: name/email/password/phone 덮어쓰기
- `email: deleted_{id}@villamate.invalid` — 탈퇴 판별 키

관리자/입주민 프로필 페이지에 "회원 탈퇴" 항목 추가 (confirm 다이얼로그 포함).

#### F-76 구독 만료 알림 Cron

**`app/api/cron/subscription-reminder/route.ts`**
- D-7 / D-3 / D-1 윈도우 UTC 기준 날짜 산술 계산
- 각 빌라 관리자에게 SYSTEM 알림 발송

#### F-78 백오피스 로그인

**`app/api/backoffice/auth/login/route.ts`**
- POST: bcrypt.compare, `role !== 'SUPER_ADMIN'` → 403
- `signToken` JWT 반환 (기존 `lib/auth.ts` 재사용)

**`app/(backoffice)/backoffice/login/page.tsx`**
- `bo_token`/`bo_user` localStorage 저장 후 대시보드 리다이렉트

**`lib/backoffice-auth.ts`** (신규)
```typescript
export function boAuthHeaders(): Record<string, string>  // Authorization: Bearer bo_token
export function getBoUser(): BoUser | null
export function clearBoAuth()
```

#### F-79 백오피스 빌라·사용자 관리

**`GET /api/backoffice/villas`** — `?status=` + `?q=` 필터, admin 정보 + residentCount 포함
**`PATCH /api/backoffice/villas/[id]`** — subscriptionStatus / subscriptionExpiry 수동 변경
**`GET /api/backoffice/users`** — `?role=` + `?q=` 필터, 탈퇴 회원 판별 포함

프론트엔드:
- `app/(backoffice)/villas/page.tsx` — 구독 상태 배지/필터, `EditSubscriptionModal`
- `app/(backoffice)/users/page.tsx` — 역할 배지, 검색/필터, 탈퇴 회원 dim 처리
- `app/(backoffice)/dashboard/page.tsx` — Stats 카드 (빌라 4개, 사용자 3개)

### 알려진 기술 부채 (2026-04-11 2차 추가)

| 항목 | 심각도 | 비고 |
|------|--------|------|
| 백오피스 서버 사이드 인증 없음 | High | JS 비활성화 시 클라이언트 가드 우회 가능 |
| 건물 이력 사진 `posts` 버킷 공유 | Medium | `building-events` 전용 버킷 분리 권장 |
| 공지 알림 발송 실패 로그 없음 | Low | fire-and-forget — 추적 불가 |

## 2026-04-12 개발 패턴 추가

### Tiptap 편집기 사용 패턴
- `RichTextEditor` 컴포넌트: `components/ui/RichTextEditor.tsx`
- 저장 시 반드시 `DOMPurify.sanitize(content, { USE_PROFILES: { html: true } })` 적용
- 렌더링 시 `dangerouslySetInnerHTML={{ __html: safeHtml }}` + `prose prose-sm` 클래스

### 공개 API 작성 원칙
- 인증 불필요 API는 반드시 `take` 상한 설정 (`take: 100` 기본)
- `isPublished: true` 필터로 비게시 콘텐츠 차단
- PATCH에서 빈 문자열 저장 차단: `body.field?.trim() ? { field: body.field.trim() } : {}`

### 백오피스 CRUD 패턴
- 목록 페이지: 로딩 스켈레톤 → 빈 상태 → 테이블 3단계 분기
- 수정: 단건 조회(`GET /[id]`) 후 모달 표시 (목록 응답에 content 제외)
- 게시 토글: `PATCH { isPublished: !current }` 낙관적 업데이트

### 카테고리 화이트리스트 패턴
```ts
const VALID_CATEGORIES = ['GENERAL', 'ADMIN', ...] as const;
if (!VALID_CATEGORIES.includes(body.category as ...)) return err('올바르지 않은 카테고리', 400);
```

### 신규 패키지
- Tiptap: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`
- XSS: `dompurify`, `@types/dompurify`
- 스타일: `@tailwindcss/typography` (@plugin 방식, globals.css에 선언)
- 테스트: `jest`, `@types/jest`, `ts-jest`, `jest-environment-node`

---

## 2026-04-13 업데이트 — F-43/F-77/F-04/F-05 Phase 3 선행 구현

### 구현된 기능

**F-43 Web Push**
- `lib/webpush.ts` — `getWebPush()` lazy init 패턴 (빌드 타임 env 오류 방지)
- `apps/web/public/sw.js` — Service Worker push/notificationclick 이벤트
- `apps/web/app/api/push/subscribe/route.ts` — POST upsert / DELETE
- `apps/web/app/(resident)/resident/profile/notifications/page.tsx` — PushBanner 컴포넌트
- `lib/notify.ts` — `sendPushToUser()` 비동기 병행 발송 추가

**F-77 Toss Payments 빌링키 자동결제**
- `lib/toss.ts` — `issueBillingKey()`, `chargeBilling()`
- `apps/web/app/api/villas/[villaId]/subscription/billing-key/route.ts` — GET/POST/DELETE
- `apps/web/app/api/cron/auto-payment/route.ts` — 만료 빌라 자동결제 Cron
- `apps/web/app/(admin)/profile/subscription/page.tsx` — 카드 등록/해제 UI
- `apps/web/vercel.json` — auto-payment cron 등록

**F-04/F-05 소셜 로그인**
- `lib/oauth.ts` — `generateState()`, `getKakaoAuthUrl()`, `getGoogleAuthUrl()`, `getOAuthProfile()`
- `apps/web/app/api/auth/oauth/[provider]/route.ts` — state 쿠키 + OAuth redirect
- `apps/web/app/api/auth/callback/[provider]/route.ts` — state 검증, 유저 upsert, JWT 발급
- `apps/web/app/api/auth/social-complete/route.ts` — PATCH 프로필 보완
- `apps/web/app/api/auth/me/route.ts` — GET 현재 유저 조회
- `apps/web/app/(auth)/auth/social/page.tsx` — 토큰 localStorage 저장 중간 페이지
- `apps/web/app/(auth)/profile-setup/page.tsx` — 소셜 신규 유저 프로필 입력
- `apps/web/app/(auth)/login/page.tsx` — 카카오/구글 버튼 추가

### 발생한 오류 및 수정

| 오류 | 원인 | 수정 |
|------|------|------|
| `"No key set vapidDetails.publicKey"` | `webpush.setVapidDetails()` 모듈 최상위 호출 → 빌드 시 env 없음 | `getWebPush()` lazy init 패턴 적용 |
| `requestBillingAuth not on TossPaymentsWidgets` | `widgets().requestBillingAuth()` 미존재 | `payment({ customerKey }).requestBillingAuth()` 사용 |
| `'카드' not assignable to 'CARD'` | Toss SDK 열거형 불일치 | `method: 'CARD'` 대문자 사용 |
| `variant 'outline' not valid` | Button 컴포넌트에 없는 variant | `variant="secondary"`로 수정 |
| `string | null not assignable to string` (bcrypt) | `User.password nullable` 변경 후 null 체크 누락 | `!dbUser.password` null 체크 추가 |

### 환경변수 추가
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY  # Web Push 공개 키
VAPID_PRIVATE_KEY             # Web Push 비공개 키
NEXT_PUBLIC_TOSS_CLIENT_KEY   # Toss Payments (빌드 시 번들 포함 → 추가 후 재배포 필요)
TOSS_SECRET_KEY               # Toss Payments 서버 키
KAKAO_CLIENT_ID / KAKAO_CLIENT_SECRET
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
```

### NEXT_PUBLIC_ 변수 주의사항
`NEXT_PUBLIC_*` 접두사 변수는 빌드 타임에 번들에 포함됨. 환경변수 추가 후 반드시 Vercel 재배포 필요. 기존 배포에는 반영되지 않음.


---

## 2026-04-14 업데이트 — Sprint 4 (F-49/50/65/72/84/85/F-14/15)

### 구현된 기능 (8개)

**F-49 댓글 푸시 알림**
- `app/api/villas/[villaId]/posts/[postId]/comments/route.ts` — `prisma.comment.create` 후 원글 작성자 조회, `authorId !== user.sub`이면 DB 알림 생성 + `sendPushToUser().catch(() => {})` 비동기 발송
- **패턴**: 댓글 응답은 즉시 반환, 알림 발송 실패는 무시 (fire-and-forget)

**F-50 게시글 좋아요**
- `app/api/villas/[villaId]/posts/[postId]/like/route.ts` (신규) — POST 토글: `postLike.findUnique({ where: { postId_userId: ... } })` → 존재하면 delete, 없으면 create, `{ liked, likeCount }` 반환
- `app/api/villas/[villaId]/posts/[postId]/route.ts` — `_count: { select: { likes: true } }` 추가, `Promise.all([comments, myLike])` 병렬 조회
- `app/api/villas/[villaId]/posts/route.ts` — `likes: true` to `_count` 추가
- 관리자·입주민 상세 페이지 — `liking` state, `handleLike()` async, 하트 SVG (좋아요 시 빨간 채움, 미좋아요 시 아웃라인)

**F-65 에너지 사용량**
- `app/api/villas/[villaId]/energy/route.ts` (신규) — GET: `year` 쿼리 파람 기반 조회; POST: `prisma.energyUsage.upsert({ where: { villaId_year_month: ... } })`
- `app/(admin)/manage/energy/page.tsx` (신규) — 연도 탭 (3년), 전기/수도 CSS 바차트, 월별 입력 폼 (6필드), 기존 데이터 자동 채우기
- `app/(resident)/villa/energy/page.tsx` (신규) — 최신 월 요약 카드, 탭 전환 (전기/수도/가스), CSS 바차트 + 호버 툴팁, 연간 합계 섹션

**F-84 백오피스 청구 현황**
- `app/api/backoffice/billing/route.ts` (신규) — GET: `month`(YYYY-MM) + `villaId` + `page` 필터, Invoice include payments, `paidAmount/paidCount/paidRate` 계산
- `app/(backoffice)/billing/page.tsx` (신규) — 최근 6개월 드롭다운, 요약 카드 3개, 납부율 프로그레스 바 (녹색 ≥80%, 노란 ≥50%, 빨간 <50%), load more 페이지네이션

**F-85 백오피스 MRR**
- `app/api/backoffice/mrr/route.ts` (신규) — MRR = ACTIVE 빌라수 × 29,900원, ARR = MRR × 12, 12개월 추이 `prisma.$queryRaw` (TO_CHAR DATE_TRUNC), 만료 임박 D-30 이내 상위 10개
- `app/(backoffice)/mrr/page.tsx` (신규) — MRR/ARR/구독중/만료 카드, 바차트 (호버 툴팁), 만료 임박 테이블 (D-N 뱃지)
- `app/(backoffice)/layout.tsx` — billing + mrr 사이드바 메뉴 추가

**F-72 QR 방문 차량**
- `app/api/villas/[villaId]/vehicles/qr-token/route.ts` (신규) — GET, ADMIN 전용, `jose SignJWT({ villaId, purpose: 'visitor-vehicle' }, 24h 만료)`
- `app/api/villas/[villaId]/vehicles/visitor/route.ts` (신규) — POST, 인증 없음, JWT 검증 (purpose + villaId), Vehicle upsert (`isVisitor: true, ownerId: villa.adminId, visitorName`)
- `app/qr-vehicle/page.tsx` (신규) — Suspense 래핑, `?v=villaId&t=token` URL 파라미터, 등록 폼, 성공/오류 상태
- `app/(admin)/profile/vehicles/page.tsx` (전면 재작성) — QR 버튼 → `/vehicles/qr-token` 호출 → `QRCode.toDataURL()` → 모달 내 QR 이미지 표시, 방문/일반 차량 섹션 분리, 차량 등록 바텀시트

**F-15 동대표 교체**
- `app/api/villas/[villaId]/transfer-admin/route.ts` (신규) — POST `{ newAdminId }`, HEAD 입주민 검증, `prisma.$transaction([villa.update, oldAdmin→RESIDENT, newAdmin→ADMIN])`, 알림 발송
- `app/(admin)/profile/transfer-admin/page.tsx` (신규) — HEAD 입주민 라디오 선택, 경고 배너, 이름 확인 다이얼로그, 성공 시 `clearAuth()` + `/login` 리다이렉트

**F-14 멀티 빌라 관리**
- `app/api/me/villas/route.ts` (신규) — GET, ADMIN 전용, `prisma.villa.findMany({ where: { adminId: user.sub } })` + 입주민 수 집계
- `app/api/auth/switch-villa/route.ts` (신규) — POST `{ villaId }`, `villa.adminId === user.sub` 검증, `signToken` 새 JWT 발급
- `app/(admin)/profile/my-villas/page.tsx` (신규) — 현재 빌라 border 하이라이트, 전환 버튼 → `saveToken + setUser` + `/home` 리다이렉트, "+ 새 빌라" → `/onboarding`
- `app/(admin)/home/page.tsx` — `multiVillaCount` state, `/api/me/villas` 병렬 fetch, count > 1일 때 "빌라 전환" 칩 버튼 표시

### 발생한 오류 및 수정

| 오류 | 원인 | 수정 |
|------|------|------|
| `prisma db push` "already in sync" 후 스키마 적용 안 됨 | visitorName 필드 추가 후 확인 | `db push` 재실행으로 해결 |
| Edit 도구 "Found 2 matches" | 스키마 파일 내 동일 문자열 중복 | 더 많은 컨텍스트 포함으로 unique 확보 |

### 환경변수 추가 없음
이번 세션은 신규 환경변수 없음. qrcode 패키지는 클라이언트 사이드 동작으로 env 불필요.

---

## 2026-04-15 개발 진행사항 — 보안 QA + 디자인 QA 수정

### 신규 파일

| 파일 | 설명 |
|------|------|
| `lib/pricing.ts` | 구독 가격 단일 소스 — `SUBSCRIPTION_MONTHLY_PRICE = 19_900`, `SUBSCRIPTION_ORDER_NAME` |
| `lib/crypto.ts` | AES-256-GCM 암호화 — `encryptBillingKey(plaintext)`, `decryptBillingKey(ciphertext)` |
| `app/api/auth/exchange-token/route.ts` | `pending_auth_token` HttpOnly 쿠키 소비 → JWT 반환 (GET, 1회성) |
| `app/api/villas/[villaId]/vehicles/qr-verify/route.ts` | QR JWT 토큰 검증 전용 (GET, 공개, DB 기록 없음) |
| `app/api/backoffice/auth/logout/route.ts` | `bo_session` 쿠키 삭제 (POST) |
| `components/ui/ConfirmDialog.tsx` | 커스텀 확인 다이얼로그 — `variant: 'default' | 'destructive'`, overlay + rounded-2xl |
| `hooks/useConfirm.tsx` | Promise 기반 confirm 훅 — `const ok = await confirm({ title, message, variant })` |

### 수정된 주요 파일

**보안 관련**

| 파일 | 변경 내용 |
|------|-----------|
| `middleware.ts` | `PUBLIC_PATH_PATTERNS` 배열 추가, matcher에 `/backoffice/:path*` 포함, `/qr-vehicle`·`/visitor` 공개 경로 추가 |
| `app/api/auth/callback/[provider]/route.ts` | JWT를 URL 대신 `pending_auth_token` HttpOnly 쿠키로 설정 (maxAge: 60s) |
| `app/(auth)/auth/social/page.tsx` | `GET /api/auth/exchange-token` 호출 후 JWT 수령 |
| `app/api/backoffice/auth/login/route.ts` | `bo_session` HttpOnly 쿠키 설정 (maxAge: 8h, path: '/backoffice') |
| `app/(backoffice)/layout.tsx` | 로그아웃 시 `POST /api/backoffice/auth/logout` 호출 후 localStorage 클리어 |
| `app/api/villas/[villaId]/tickets/route.ts` | POST: villa 존재 확인 + APPROVED 소속 검증, title ≤100/description ≤2000 제한 |
| `app/api/villas/[villaId]/posts/[postId]/like/route.ts` | Prisma P2002 catch → 멱등 200 응답 |
| `app/api/backoffice/mrr/route.ts` | `freeTrialCount` 필터 수정(`FREE_TRIAL`), 가격을 `SUBSCRIPTION_MONTHLY_PRICE`로 통일 |
| `app/api/cron/auto-payment/route.ts` | `decryptBillingKey()` 호출 추가, 가격을 `SUBSCRIPTION_MONTHLY_PRICE`로 통일 |
| `vercel.json` | auto-payment cron `"0 0 * * *"` → `"0 15 * * *"` (KST 00:00) |
| `app/api/upload/route.ts` | 확장자를 MIME 맵에서 결정, 클라이언트 filename 무시 |
| `app/(auth)/profile-setup/page.tsx` | `useState(() => searchParams.get('token') ?? '')` 초기화 함수 패턴 |
| `app/api/villas/[villaId]/subscription/billing-key/route.ts` | `encryptBillingKey()` 호출 후 DB upsert |

**디자인 관련**

| 파일 | 변경 내용 |
|------|-----------|
| `app/globals.css` | 누락 토큰 17개 추가 (`neutral-600/800`, `success/warning/error-50/100/600/700`, `primary-200/300/400`) |
| `components/ui/Button.tsx` | `lg` size `h-13` → `h-12`, `hover:bg-red-600` → `hover:bg-error-600` |
| `components/ui/Badge.tsx` | 한국어 변형 제거, 하드코딩 색상 → 시맨틱 토큰 |
| `components/ui/Chip.tsx` | `<span onClick>` → `<button type="button" onClick>` |
| `components/ui/WidgetCard.tsx` | `blue-600/red-500/orange-500/green-500` → `primary/error/warning/success` 토큰 |
| `components/ui/NotificationList.tsx` | `<li onClick>` → `<li><button>`, 에러 상태 추가 |
| `app/(admin)/home/page.tsx` | href 수정, 온보딩 CTA Button 컴포넌트 사용 |
| `app/(resident)/resident/home/page.tsx` | href 수정, error/empty 상태 분리 |
| `app/(admin)/profile/subscription/page.tsx` | hex 색상 → 토큰, `pb-16` → `pb-24` |
| `app/(auth)/login/page.tsx` | `<Suspense>` 래퍼 추가, SVG `aria-hidden="true"` |
| `app/(admin)/profile/vehicles/page.tsx` | `hover:red-500` → `hover:error-500`, `formError`에 `role="alert"` |
| `app/(admin)/profile/page.tsx` | `min-h-[40px]` → `min-h-[44px]` |
| `app/(resident)/villa/tickets/page.tsx` | PENDING Badge variant `'neutral'` → `'warning'` |

### 환경변수 추가 (2026-04-15)

| 변수명 | 설명 | 위치 |
|--------|------|------|
| `BILLING_ENCRYPTION_KEY` | AES-256-GCM 키 (64자 hex = 32바이트) | Vercel 프로덕션 환경변수 — **미등록 상태 (수동 등록 필요)** |

### 주의사항
- `BILLING_ENCRYPTION_KEY` 없이 배포되면 빌링키 저장/결제 시 런타임 오류 발생
- 기존 DB의 평문 빌링키는 `decryptBillingKey()` 호출 시 오류 → 수동 마이그레이션 필요

---

## 2026-04-16 업데이트 — AmountInput UX 개선, 버그 수정

### 신규 파일

| 파일 | 설명 |
|------|------|
| `apps/web/lib/amount-step.ts` | localStorage 기반 금액 단위 저장/조회 유틸. `getAmountStep()` / `setAmountStep()` / `PRESET_STEPS` export |
| `apps/web/components/ui/AmountInput.tsx` | − / + 버튼 포함 금액 입력 컴포넌트. `value`(raw 숫자 string), `onChange`, `stepOverride`, `min` props 지원 |

### 수정된 파일

| 파일 | 변경 내용 |
|------|-----------|
| `(admin)/manage/invoices/new/page.tsx` | 세대당 금액 및 변동 항목 금액을 `<AmountInput>`으로 교체. 변동 항목 레이아웃을 수평 행 → 카드 레이아웃으로 변경 |
| `(admin)/manage/external-billing/page.tsx` | 청구 금액 `<input>` → `<AmountInput>`. 검증 및 API 전송 시 쉼표 제거 불필요 (raw 숫자 string 처리) |
| `(admin)/profile/page.tsx` | `AmountStepSheet` 컴포넌트 추가 (프리셋 5개 + 직접 입력). 프로필 설정 목록에 '금액 단위 설정' 항목 추가 |
| `(resident)/resident/profile/page.tsx` | 동일: `AmountStepSheet` + '금액 단위 설정' 항목 |
| `(admin)/manage/residents/page.tsx` | 호수 관리 하단 시트 레이아웃 수정(`left-0 right-0` → `left-1/2 -translate-x-1/2 max-w-lg`). PATCH 요청 Authorization 헤더 추가. 토스트 z-index `z-60` → `z-90` |
| `(admin)/community/new/page.tsx` | POST /posts Authorization 헤더 추가 |
| `(resident)/resident/community/new/page.tsx` | POST /posts Authorization 헤더 추가 |
| `(admin)/community/[id]/page.tsx` | POST /comments, DELETE /posts, POST /like Authorization 헤더 추가 |
| `(resident)/resident/community/[id]/page.tsx` | POST /comments, DELETE /posts, POST /like Authorization 헤더 추가 |
| `(admin)/ledger/page.tsx` | 스텁 페이지 → `(admin)/manage/ledger/page.tsx`와 동일한 완전 구현으로 교체 |

### 코딩 패턴 추가

**금액 단위 localStorage 읽기 (AmountInput 내부)**:
```typescript
const [step, setStep] = useState(10000);
useEffect(() => { setStep(stepOverride ?? getAmountStep()); }, [stepOverride]);
```
- SSR 안전: `getAmountStep()` 내부에서 `typeof window === 'undefined'` 분기
- 컴포넌트 마운트 후 한 번만 읽음 (세션 중 변경 반영 불필요)

**변동 청구서 항목 카드 레이아웃 패턴**:
```tsx
<li key={item.id} className="bg-neutral-50 rounded-2xl p-4 space-y-3">
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium text-neutral-500">항목 {idx + 1}</span>
    {items.length > 1 && <button onClick={() => removeItem(item.id)}>×</button>}
  </div>
  <input type="text" value={item.name} ... />
  <AmountInput value={item.amount} onChange={(raw) => updateItem(item.id, 'amount', raw)} />
</li>
```

### 기술 부채 추가 (2026-04-16)

| 항목 | 위험도 | 비고 |
|------|--------|------|
| `/ledger` ↔ `/manage/ledger` 코드 중복 | Low | 두 경로 동일 구현 — 리다이렉트 또는 공통 컴포넌트 추출 필요 |

---

## 2026-04-18 수정 내용

### PortOne 결제 페이지 수정 (`app/pay/[billId]/page.tsx`)

#### 수정 1 — 모바일 결제 m_redirect_url 추가

KG Inicis 모바일 결제는 팝업 대신 리다이렉트 방식으로 동작. `m_redirect_url` 없으면 결제 후 앱 복귀 불가.

```typescript
window.IMP.request_pay(
  {
    pg: 'html5_inicis.INIpayTest',
    // ...
    m_redirect_url: `${window.location.origin}/pay/${billId}`,  // ← 추가
  },
  async (rsp) => { /* 데스크탑 콜백 */ }
);
```

#### 수정 2 — 모바일 리다이렉트 복귀 처리

```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const impUid = params.get('imp_uid');
  const impSuccess = params.get('imp_success');
  if (impUid) {
    if (impSuccess === 'false') {
      setPayError(params.get('error_msg') ?? '결제가 취소되었습니다.');
      setLoading(false);
      return;
    }
    fetchBilling().then(() => confirmPayment(impUid));
    return;
  }
  fetchBilling();
}, [fetchBilling, confirmPayment]);
```

#### 수정 3 — useSearchParams → window.location.search

`useSearchParams()`는 Next.js 15에서 Suspense 래퍼 없이 사용하면 빌드 시 경고 + 초기 렌더 지연 발생. `window.location.search` (useEffect 내부)로 교체.

#### 수정 4 — PG MID 명시

```typescript
// 수정 전
pg: 'html5_inicis'
// 수정 후
pg: 'html5_inicis.INIpayTest'  // 테스트 MID 포함 명시
```

PortOne 채널 설정과 `pg` 코드의 MID가 일치해야 함. 불일치 시 "등록된 PG 설정 정보를 찾을 수 없습니다." 오류.

### CSP 설정 확장 (`next.config.ts`)

PortOne(iamport) SDK 로드 및 결제창 동작에 필요한 도메인 추가:

```typescript
"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.iamport.kr",
"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.iamport.kr https://*.inicis.com",
"img-src 'self' data: blob: https://*.supabase.co https://*.iamport.kr https://*.inicis.com",
"connect-src 'self' https://*.supabase.co https://*.supabase.com https://*.iamport.kr https://*.inicis.com",
"frame-src https://*.iamport.kr https://*.inicis.com https://*.kcp.co.kr https://*.nicepay.co.kr",
```

> 반드시 와일드카드 `*.iamport.kr` 사용 — 하위 도메인 여러 개 사용됨 (cdn / service / api 등)

### 전체 페이지 인증 헤더 일괄 수정

미들웨어가 모든 `/api/` 경로를 보호하므로 **GET 요청 포함 모든 fetch에 Authorization 헤더 필수**.
아래 패턴을 일괄 적용:

```typescript
// 기존 (오류)
const res = await fetch(`/api/villas/${villaId}/polls`);

// 수정 후 (정상)
const token = localStorage.getItem('token') ?? '';
const res = await fetch(`/api/villas/${villaId}/polls`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

수정된 파일: 에너지, 투표(목록/상세/참여), 입주자 관리, 민원, 차량(GET/POST/DELETE), 커뮤니티(목록/상세), 내 게시글 — 총 13개 파일 30+개 호출.

### 기술 부채 신규 추가 (2026-04-18)

| 항목 | 위험도 | 비고 |
|------|--------|------|
| `lib/client-api.ts` 헬퍼 미활용 | Medium | `apiFetch/apiGet/apiPost/apiPatch/apiDelete`가 이미 토큰 자동 주입을 지원하나, 대부분 페이지가 raw `fetch` 직접 사용. 점진적으로 헬퍼로 마이그레이션하면 이런 누락 방지 가능 |


---

## 2026-04-19 개발 패턴 및 변경사항 (Sprint 8)

### 커뮤니티 게시글 수정 기능

**PATCH `/api/villas/[villaId]/posts/[postId]`** 신규 추가
- 작성자 본인만 수정 가능 (`post.authorId !== user.sub` → 403)
- 수정 가능 필드: `title`, `content`, `category`, `isNotice`, `imageUrl`
- `updatedAt` 필드를 GET 응답에 포함 추가

**"수정됨" 배지 표시 조건**
```typescript
const isEdited = new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 5000;
```
5초 초과 차이가 있을 때 "수정됨" 배지 표시 (저장 즉시 발생하는 미세 차이 방지).

**수정 페이지 라우트**
- 관리자: `/community/[id]/edit`
- 입주민: `/resident/community/[id]/edit`

### 복사 기능 패턴 (청구서 / 외부청구 / 장부)

#### 청구서 복사
URL 파라미터 `?copy={invoiceId}` 방식. `new/page.tsx`에서 마운트 시 해당 청구서 조회 후 폼 pre-fill.
`useSearchParams()` 사용으로 Next.js 15 Suspense 래퍼 필수:
```tsx
export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <NewInvoicePageContent />
    </Suspense>
  );
}
```
복사 시 billingMonth는 현재 월 +1(다음 달)로 자동 설정.

#### 외부 청구서 복사
인라인 상태 pre-fill 방식. `handleCopyBilling(b)` → form 상태 설정 + dueDate 초기화 + 모달 오픈.

#### 장부 복사
`handleCopyTx(tx)` → formType/formAmount/formDescription 설정 + 날짜는 오늘로 초기화 + 폼 오픈.

### 장부 자동 기록 (Auto Ledger)

납부 완료 / 외부 청구 완료 이벤트에서 `LedgerTransaction` 자동 생성:

```typescript
await prisma.ledgerTransaction.create({
  data: {
    villaId,
    type: 'INCOME',
    amount: Number(payment.amount),
    description: `${billingMonth} 관리비 수납 - ${roomNumber}호`,
    transactionDate: new Date(),
    createdBy: 'system',  // ← 자동 기록 식별자
  },
});
```

**중복 방지**: `invoicePayment.PATCH`에서 `wasPaid = existing.status === 'PAID'` 체크 후 조건부 생성.

**프론트엔드**: `isAuto: t.createdBy === 'system'` 파생 필드 → 파란 "자동" 배지 표시.

### 관리자 + 입주민 듀얼 모드 (같은 빌라) 구현

**로그인 API 변경** (`app/api/auth/login/route.ts`):
```typescript
// ADMIN 로그인 시 자신의 빌라 ResidentRecord 확인
const residentRecord = await prisma.residentRecord.findFirst({
  where: { userId: user.id, villaId: villa.id, status: 'APPROVED' },
});
if (residentRecord) {
  residentVillaData = { ...villaInfo, roomNumber: residentRecord.roomNumber };
}
```

**join API 자동 승인** (`app/api/villas/join/route.ts`, `/residents/join/route.ts`):
```typescript
const isOwnVilla = villa.adminId === user.sub;
const status = isOwnVilla ? 'APPROVED' : 'PENDING';
```

**온보딩 페이지** (`app/(auth)/onboarding/page.tsx`):
- "저도 이 빌라의 입주민입니다" 체크박스 + 호수 입력 추가
- 빌라 생성 후 `/api/villas/[id]/residents/join` 추가 호출
- 성공 시 `residentVilla` localStorage 저장

### Daum Postcode 동적 로딩 패턴

Script 컴포넌트 의존 없이 버튼 클릭 시 스크립트 동적 삽입:
```typescript
function handleAddressSearch() {
  if ((window as any).daum?.Postcode) {
    openPostcode();
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
  script.onload = openPostcode;
  document.head.appendChild(script);
}
```
이미 로드된 경우 바로 실행, 최초 클릭 시만 네트워크 요청 발생.

### 기술 부채 신규 추가 (2026-04-19)

| 항목 | 위험도 | 비고 |
|------|--------|------|
| 로그인 시 villa 쿼리 증가 | Low | ADMIN 최대 2쿼리(villa + residentRecord) 추가. 현재 문제없으나 고트래픽 시 캐싱 고려 |

---

## 2026-04-20 구현 사항 (Sprint 9 — QA 보안·안정성 + 예시 데이터)

### 예시 데이터 시드 (`prisma/seed.ts`)

신규 유저가 각 기능을 직관적으로 파악할 수 있도록 햇살 빌라 데모 계정과 기능별 예시 컨텐츠를 시드로 제공.

**실행 방법**: `npx prisma db seed`

**생성 데이터**:
- 관리자 1명 (`admin@villamate.demo`), 입주민 4명 (`r101~r202@villamate.demo`) / 비밀번호: `demo1234!`
- 건물이력 5건, 청구서 2건(3월 고정/4월 변동), 외부청구 3건, 커뮤니티 게시글 4건+댓글, 장부 8건, 민원 4건, 전자투표 3건(첫 번째 투표 결과 포함), 에너지 6개월치

**idempotent 설계**: `upsert` + `findFirst` 중복 체크로 재실행 안전.

**package.json 설정**:
```json
"prisma": { "seed": "npx tsx prisma/seed.ts" }
```

**`.env` DB URL 수정**: `DATABASE_URL`과 `DIRECT_URL` 값이 바뀌어 있던 것 교정 (Supabase pooler URL 기준으로 정상화).

### PortOne 공통 모듈 (`lib/portone.ts`)

```typescript
export async function getPortOneToken(): Promise<string>
export async function getPortOnePayment(impUid, accessToken): Promise<{status, amount, merchant_uid, pg_provider}>
```

- `app/api/pay/[billId]/confirm/route.ts` — 로컬 함수 제거, import로 교체
- `app/api/villas/[villaId]/invoices/[invoiceId]/payments/[paymentId]/verify/route.ts` — 동일

### 보안 패치 요약

**`status: 'APPROVED'` 필터 추가 (4파일)**
```typescript
// 변경 전
where: { villaId, userId }
// 변경 후
where: { villaId, userId, status: 'APPROVED' }
```
적용: `polls/route.ts`, `posts/route.ts`, `posts/[postId]/route.ts`, `posts/[postId]/like/route.ts`

**`$transaction` 원자화 패턴**
```typescript
const [payment] = await prisma.$transaction([
  prisma.invoicePayment.update({ ... }),
  ...(becomesPaid ? [prisma.ledgerTransaction.create({ ... })] : []),
]);
```
적용: `payments/[paymentId]/route.ts` PATCH, `verify/route.ts` POST

**`auth.ts` JWT_SECRET 전 환경 필수화**
```typescript
// 변경 전
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') { ... }
const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-change-me');
// 변경 후
if (!process.env.JWT_SECRET) { throw new Error(...); }
const secret = new TextEncoder().encode(process.env.JWT_SECRET);
```

### 기술 부채 신규 해소

| 항목 | 상태 |
|------|------|
| `requireActiveSubscription` 미적용 라우트 | ✅ 해소 — 4개 POST 추가 |
| 개발환경 JWT 하드코딩 폴백 | ✅ 해소 — 전 환경 필수화 |
| N+1 쿼리 (vehicles) | ✅ 해소 — 배치 조회 |
| PortOne 함수 중복 | ✅ 해소 — lib 모듈화 |

### 잔존 기술 부채

| 항목 | 위험도 | 비고 |
|------|--------|------|
| `BILLING_ENCRYPTION_KEY` Vercel 미등록 | Critical | 잔존 |
| 기존 평문 빌링키 DB 마이그레이션 | High | 잔존 |
| `lib/client-api.ts` 헬퍼 미활용 | Medium | 잔존 |
| 동대표 교체 후 JWT 블랙리스트 없음 | Medium | 잔존 |

---

## 2026-04-21 — Sprint 10 신규 기능 구현

### 구현 기능 4종

#### 1. 관리자 수금 인사이트

- API: `GET /api/admin/insights` — InvoicePayment 집계, 최근 6개월 월별 groupBy billingMonth
- UI: `components/InsightsSection.tsx` — 이번 달 수금률 프로그레스 바 + 6개월 수금액 순수 CSS 막대 차트 (외부 차트 라이브러리 미사용)
- 관리자 홈 하단 자동 삽입 (클라이언트 컴포넌트, `apiFetch` 사용)

#### 2. 입주민 납부 히스토리

- API: `GET /api/resident/payments/history?status=PAID|PENDING|OVERDUE`
- UI: `app/(resident)/villa/invoices/history/page.tsx` — 전체/완납/미납 필터 탭
- `app/(resident)/villa/invoices/page.tsx`에 "납부 이력" 버튼 추가

#### 3. 공용시설 예약

- 신규 DB 모델: `Facility`, `FacilityReservation`
- 관리자 API: CRUD + 운영중단/재개 토글 + 예약 현황 조회
- 입주민 API: 활성 시설 목록(오늘 예약 포함), 예약 생성, 예약 취소
- `maxPerDay` 초과 시 예약 차단 (서버 사이드 검증)
- UI: `app/(admin)/manage/facilities/page.tsx`, `app/(resident)/villa/facilities/page.tsx`

#### 4. 외부 업체 연락처 관리

- 신규 DB 모델: `Vendor`, `VendorCategory` enum
- 관리자: CRUD + 카테고리 필터 (6종)
- 입주민: 읽기 전용 + `tel:` 링크 전화 바로가기
- UI: `app/(admin)/manage/vendors/page.tsx`, `app/(resident)/villa/vendors/page.tsx`

### 버그 수정 3건

1. **바텀시트 z-index 충돌**: 신규 3개 페이지 `z-50` → `z-60` (BottomNav z-50과 충돌 해소)
2. **관리자 프로필 하단 가림**: `pb-10` → `pb-24`
3. **기존 관리자 듀얼 모드 활성화 불가**: 프로필에 "입주민 등록" 바텀시트 추가 — join API 호출 후 `saveUser()`로 즉시 반영

### 패턴 메모

- **바텀시트 z-index 룰**: BottomNav=z-50 / 바텀시트=z-60 / 토스트=z-90
- **신규 테이블**: Supabase SQL Editor 수동 적용 필요 (`prisma migrate dev`는 Vercel 빌드 불가)
- **듀얼 모드 등록 흐름**: `POST /api/villas/${villaId}/residents/join` → `saveUser({...user, residentVilla})`

### 잔존 기술 부채 추가

| 항목 | 위험도 |
|------|--------|
| Facility/FacilityReservation/Vendor 테이블 Supabase 미적용 | High |

---

## 2026-04-23 — 백오피스 라우팅 버그 수정

### 수정된 파일 4개

#### 1. `app/(backoffice)/backoffice/login/page.tsx`
- 로그인 성공 후 `router.push('/backoffice/dashboard')` → `router.push('/dashboard')`
- 이미 로그인된 경우 `router.replace('/backoffice/dashboard')` → `router.replace('/dashboard')`

#### 2. `app/(backoffice)/layout.tsx`
- 사이드바 `platformItems` 링크 전체 수정: `/backoffice/dashboard` → `/dashboard` 등
- `contentItems` 링크 수정: `/backoffice/content/*` → `/content/*`

#### 3. `app/(auth)/login/page.tsx` / `app/page.tsx`
- SUPER_ADMIN 로그인 후 리다이렉트: `/backoffice/dashboard` → `/dashboard`

#### 4. `app/api/backoffice/auth/login/route.ts`
- `bo_session` 쿠키 `path: '/backoffice'` → `path: '/'`
- **핵심 수정**: 쿠키가 `/dashboard` 등 루트 레벨 경로에서 전송되지 않아 미들웨어가 쿠키를 읽지 못하고 로그인 루프 발생하던 버그 해소

#### 5. `middleware.ts`
- `isBackofficePage` 조건 블록 신규 추가
- matcher 배열에 `/dashboard`, `/villas`, `/users`, `/billing`, `/mrr`, `/content/:path*` 추가

### 운영 작업 — SUPER_ADMIN 계정 생성 및 Seed 실행

```bash
# DB에 SUPER_ADMIN 계정 직접 생성 (bcrypt hash)
node -e "..."  # dmlehsasd@gmail.com / SUPER_ADMIN role

# 예시 데이터 시드 실행
npx prisma db seed  # 햇살 빌라 데모 데이터 DB 반영
```

### 패턴 메모
- Next.js App Router route group `(name)/` 은 URL에 포함되지 않음. `(backoffice)/dashboard/` → `/dashboard`

---

## 2026-04-24~25 — Sprint 12 QA 수정 + fixedFee 구현

### 수정된 파일 목록

#### 보안·기능 수정 (High/Medium)

| 파일 | 수정 내용 |
|------|----------|
| `app/api/resident/facilities/[id]/reservations/route.ts` | 과거 날짜 서버 검증 추가 (H-1) |
| `app/api/villas/[villaId]/invoices/route.ts` | headResidents `status: 'APPROVED'` 필터 (H-2) |
| `app/api/cron/publish-invoices/route.ts` | APPROVED 필터 + fixedFee 기반 금액 설정 (H-2 + fixedFee) |
| `app/api/villas/[villaId]/external-billing/[billId]/confirm/route.ts` | $transaction 원자화 (H-3) |
| `app/(admin)/manage/facilities/page.tsx` | useConfirm 도입 + res.ok 체크 (M-1) |
| `app/(admin)/manage/vendors/page.tsx` | handleDelete res.ok 체크 (M-2) |
| `app/api/resident/payments/history/route.ts` | RESIDENT/ADMIN role 검증 (M-4) |
| `app/api/villas/[villaId]/posts/[postId]/route.ts` | isNotice 승격 ADMIN 검증 (M-5) |
| `lib/notify.ts` | createNotificationForVilla APPROVED 필터 (M-8) |

#### 디자인 수정 (D/L)

| 파일 | 수정 내용 |
|------|----------|
| `components/ui/Toast.tsx` | 신규 생성 — 토스트 알림 컴포넌트 |
| `hooks/useToast.tsx` | 신규 생성 — useToast 훅 |
| `app/(resident)/villa/invoices/page.tsx` | alert 7개 → useToast, Badge 시맨틱 수정 (D-1, D-2) |
| `app/(resident)/villa/invoices/history/page.tsx` | Badge 시맨틱 수정 (D-2) |
| `app/(admin)/profile/page.tsx` | alert → useToast (D-1) |
| `app/(admin)/profile/transfer-admin/page.tsx` | window.confirm → useConfirm (D-1) |
| `components/InvoicePDFButton.tsx` | alert → 인라인 에러 상태 (D-1) |
| `app/(admin)/community/[id]/page.tsx` | confirm/alert → useConfirm/useToast (D-1) |
| `app/(resident)/resident/community/[id]/page.tsx` | 동일 (D-1) |
| `app/(resident)/villa/facilities/page.tsx` | 터치 타깃 min-h-[44px], today 초기화 수정 (D-3, L-2) |
| `app/api/resident/facilities/route.ts` | 예약 조회 date: { gte: today } (L-3) |
| `components/InsightsSection.tsx` | 에러 상태 UI 추가 (L-4) |

#### fixedFee 자동 발행

| 파일 | 수정 내용 |
|------|----------|
| `prisma/schema.prisma` | `fixedFee Int?` 추가 (prisma db push 완료) |
| `app/api/villas/[villaId]/route.ts` | PATCH에서 fixedFee 저장 지원 |
| `app/api/cron/publish-invoices/route.ts` | fixedFee 기반 금액 설정 |
| `app/(admin)/manage/invoices/page.tsx` | AutoPublishCard 컴포넌트 추가 |

### 반복 패턴 메모

**residentRecord 쿼리에서 status: 'APPROVED' 빠짐 반복 주의**:
Sprint 9, 12 두 차례 동일 패턴 발견. residentRecord.findMany/findFirst 시 항상 `status: 'APPROVED'` 포함 확인.

**외부 API 호출 + DB 업데이트 조합은 항상 $transaction**:
Sprint 9(납부+장부), Sprint 12(외부청구+장부) 두 차례. 상태 갱신 + 부작용 기록 쌍은 무조건 원자화.

**클라이언트 검증만으로는 불충분**:
H-1(과거 날짜 예약): 클라이언트 `min={today}` 있어도 API에서 반드시 서버 사이드 재검증 필요.
- bo_session 쿠키는 `path: '/'`로 발급해야 백오피스 전체 경로에서 미들웨어가 읽을 수 있음

---

## 2026-04-25 — Sprint 13: 공용시설 예약 구조 개선 + apiFetch 전수 전환

### 수정된 파일 목록

#### 공용시설 예약 구조 개선

| 파일 | 수정 내용 |
|------|----------|
| `prisma/schema.prisma` | `Facility`: `maxPerDay` 제거, `openTime/closeTime/maxConcurrent` 추가. `FacilityReservation`: `timeSlot` 제거, `startTime/endTime` 추가 |
| `app/api/admin/facilities/route.ts` | POST 바디 `maxPerDay` → `openTime/closeTime/maxConcurrent`, TIME_RE 형식 검증 추가 |
| `app/api/admin/facilities/[id]/route.ts` | PATCH 바디 동일 변경, `isActive` 토글 지원 유지 |
| `app/api/resident/facilities/[id]/reservations/route.ts` | POST: `timeSlot` → `startTime/endTime`, 인터벌 오버랩 검증, 운영시간 범위 검증, HH:MM 형식 검증 |
| `app/(admin)/manage/facilities/page.tsx` | 폼 필드 `maxPerDay` → `openTime/closeTime/maxConcurrent` (time picker 2개) |
| `app/(resident)/villa/facilities/page.tsx` | 예약 바텀시트 `timeSlot` → `startTime/endTime` (time input 2개), 운영시간 안내 표시 |

#### 클라이언트 apiFetch 전수 전환 (32개 파일)

**`lib/client-api.ts`**: `API_BASE` 제거, `fetch(path, ...)` 직접 사용

**`(admin)` 경로 변환 파일**:
- `manage/facilities/page.tsx`, `manage/invoices/page.tsx`, `manage/vendors/page.tsx`
- `manage/residents/page.tsx`, `manage/residents/[id]/page.tsx`
- `community/page.tsx`, `community/[id]/page.tsx`, `community/new/page.tsx`
- `profile/page.tsx`, `profile/transfer-admin/page.tsx`
- `home/page.tsx`

**`(resident)` 경로 변환 파일**:
- `villa/tickets/new/page.tsx`, `villa/tickets/page.tsx`, `villa/tickets/[id]/page.tsx`
- `villa/invoices/page.tsx`, `villa/invoices/history/page.tsx`
- `villa/facilities/page.tsx`
- `resident/community/page.tsx`, `resident/community/[id]/page.tsx`, `resident/community/new/page.tsx`
- `resident/vehicles/page.tsx`
- `resident/poll/page.tsx`, `resident/poll/[id]/page.tsx`, `resident/poll/new/page.tsx`
- 기타 resident 경로 페이지들

**예외 유지 (raw fetch)**:
- `/api/upload` 호출부: FormData multipart — `apiFetch`의 `Content-Type: application/json` 오버라이드 방지

#### 빌드 오류 수정

| 파일 | 수정 내용 |
|------|----------|
| `app/(auth)/onboarding/page.tsx` | `const token = localStorage.getItem('token')` 제거 후 잔존 참조 버그. raw fetch → `apiFetch` 전환으로 해소 (saveToken 먼저 호출되므로 apiFetch가 토큰을 읽을 수 있음) |

### 반복 패턴 메모

**FormData 업로드는 `apiFetch` 불가**:
`apiFetch`는 항상 `Content-Type: application/json` 설정 → multipart boundary 손상. 업로드 파일은 raw `fetch` + `Authorization` 헤더 수동 주입 패턴 사용.

**클라이언트 raw fetch 잔존 위험**:
새 페이지 추가 시 `fetch('/api/...')` 직접 사용 금지 — 반드시 `apiFetch` 사용. 예외는 FormData 업로드뿐.

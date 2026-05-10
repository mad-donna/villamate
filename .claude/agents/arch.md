---
name: Arch
description: "Use this agent when you need high-level architectural analysis, design decisions, or structural planning for a software system. Invoke this agent when:\\n- Starting a new project and needing to define the overall architecture\\n- Evaluating existing codebase structure and identifying architectural improvements\\n- Making technology stack decisions or evaluating trade-offs\\n- Designing system components, APIs, or data models\\n- Reviewing architectural consistency across the codebase\\n- Planning scalability, performance, or reliability improvements\\n\\n<example>\\nContext: The user wants to build a new microservices-based application.\\nuser: \"I want to create a new e-commerce platform with microservices architecture. Where should I start?\"\\nassistant: \"I'll use the system-architect agent to analyze your requirements and design an appropriate architecture.\"\\n<commentary>\\nSince the user is asking for architectural guidance on a new system, use the Task tool to launch the system-architect agent to provide a comprehensive architectural plan.\\n</commentary>\\n</example>\\n\\n<example>\\nContext: The user has written a significant amount of code and wants to evaluate the architecture.\\nuser: \"I've built out the core features of my application. Can you review the overall structure?\"\\nassistant: \"Let me launch the system-architect agent to review the codebase structure and provide architectural feedback.\"\\n<commentary>\\nSince the user wants architectural review of existing code, use the Task tool to launch the system-architect agent to analyze and provide recommendations.\\n</commentary>\\n</example>\\n\\n<example>\\nContext: The user is facing scalability issues with their current system.\\nuser: \"Our application is getting slow under load. We're seeing database bottlenecks and API timeouts.\"\\nassistant: \"I'll invoke the system-architect agent to analyze the current architecture and recommend structural improvements for scalability.\"\\n<commentary>\\nSince scalability and architectural changes are needed, use the Task tool to launch the system-architect agent to diagnose and recommend solutions.\\n</commentary>\\n</example>"
model: sonnet
color: blue
memory: project
---

You are a Senior System Architect with deep expertise in software architecture, system design, distributed systems, cloud infrastructure, and engineering best practices. You have 15+ years of experience designing large-scale systems across various domains including fintech, e-commerce, SaaS platforms, and enterprise software.

## Core Responsibilities

You analyze, design, and evaluate software architectures with a focus on:
- **Structural Integrity**: Ensuring components are well-defined, loosely coupled, and highly cohesive
- **Scalability**: Designing systems that handle growth gracefully
- **Reliability**: Building fault-tolerant, resilient architectures
- **Maintainability**: Creating systems that are easy to evolve and understand
- **Security**: Embedding security principles at the architectural level
- **Performance**: Identifying and addressing bottlenecks proactively

## Architectural Analysis Framework

When analyzing or designing a system, you follow this structured approach:

### 1. Requirements Gathering
- Clarify functional requirements (what the system must do)
- Identify non-functional requirements (performance, scalability, availability, security)
- Understand constraints (budget, timeline, team size, existing technology)
- Define success metrics and KPIs

### 2. System Decomposition
- Break down the system into logical components and bounded contexts
- Define service boundaries using Domain-Driven Design principles where appropriate
- Identify shared libraries, utilities, and cross-cutting concerns
- Map data ownership and flow between components

### 3. Architecture Pattern Selection
Choose appropriate patterns based on requirements:
- **Monolith vs Microservices vs Modular Monolith**: Evaluate team size, deployment complexity, and domain complexity
- **Event-Driven Architecture**: For asynchronous workflows, high throughput, loose coupling
- **CQRS/Event Sourcing**: For audit trails, complex query requirements, temporal data
- **Layered Architecture**: For clear separation of concerns in traditional applications
- **Hexagonal/Clean Architecture**: For testability and framework independence

### 4. Technology Stack Evaluation
- Assess technology options against requirements
- Consider team expertise and learning curve
- Evaluate ecosystem maturity, community support, and long-term viability
- Identify potential vendor lock-in risks
- Recommend pragmatic choices over trendy ones

### 5. Data Architecture
- Design data models and storage strategies
- Choose appropriate database types (relational, document, graph, time-series, cache)
- Plan data consistency strategies (eventual vs strong consistency)
- Design for data migration and schema evolution
- Address backup, recovery, and data retention

### 6. Integration Design
- Define API contracts (REST, GraphQL, gRPC, message queues)
- Design authentication and authorization flows
- Plan for external service integrations
- Handle failure modes and circuit breakers

### 7. Infrastructure & Deployment
- Recommend deployment strategies (containers, serverless, VMs)
- Design CI/CD pipeline requirements
- Plan for environment parity (dev/staging/production)
- Address observability: logging, metrics, tracing

## Output Standards

When providing architectural guidance, structure your output as follows:

### For New System Design:
```
## Architecture Overview
[High-level description and chosen architectural style]

## System Components
[List and describe each major component]

## Technology Stack
[Recommended technologies with justification]

## Data Architecture
[Data models, storage choices, flow]

## Integration Points
[APIs, events, external services]

## Infrastructure Requirements
[Deployment, scaling, observability]

## Trade-offs & Risks
[What was sacrificed, potential risks, mitigation]

## Implementation Roadmap
[Phased approach to building the system]
```

### For Architecture Review:
```
## Current Architecture Assessment
[What exists, how it's structured]

## Strengths
[What's working well]

## Issues & Concerns
[Problems identified, ordered by severity]

## Recommendations
[Specific, actionable improvements]

## Migration Path
[How to get from current to target state safely]
```

## Decision-Making Principles

1. **Prefer simplicity**: Choose the simplest architecture that meets requirements. Avoid over-engineering.
2. **Evolve incrementally**: Design for today's scale, with clear paths to scale tomorrow.
3. **Make trade-offs explicit**: Every architectural decision has trade-offs — state them clearly.
4. **Design for failure**: Assume components will fail and design accordingly.
5. **Optimize for the team**: The best architecture is one the team can actually build and maintain.
6. **Question assumptions**: Challenge requirements that lead to unnecessary complexity.
7. **Document decisions**: Use Architecture Decision Records (ADRs) to capture why decisions were made.

## Quality Assurance

Before finalizing any architectural recommendation:
- Verify the design addresses all stated requirements
- Check for single points of failure
- Validate that the proposed solution fits team capabilities
- Ensure security considerations are addressed at each layer
- Confirm observability is built in from the start
- Review for potential bottlenecks under expected load

## Interaction Guidelines

- Ask clarifying questions before diving into design when requirements are ambiguous
- Provide diagrams using Mermaid or ASCII art when visualizing architecture helps understanding
- Always explain the 'why' behind architectural choices, not just the 'what'
- When reviewing existing code, explore the directory structure and key files before making recommendations
- Flag critical issues immediately; prioritize recommendations by impact
- Be pragmatic — acknowledge legacy constraints and provide migration paths, not just ideal-state designs

**Update your agent memory** as you discover architectural patterns, technology choices, domain boundaries, and key structural decisions in this codebase. This builds up institutional knowledge across conversations.

Examples of what to record:
- Identified architectural patterns in use (e.g., layered, hexagonal, event-driven)
- Key technology choices and the reasoning behind them
- Domain boundaries and service ownership
- Critical integration points and API contracts
- Known technical debt and areas flagged for improvement
- Team conventions for structuring modules, naming services, and organizing code
- Infrastructure and deployment patterns observed

# Persistent Agent Memory

You have a persistent Persistent Agent Memory directory at `D:\villamate\.claude\agent-memory\system-architect\`. Its contents persist across conversations.

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
Grep with pattern="<search term>" path="D:\villamate\.claude\agent-memory\system-architect\" glob="*.md"
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

#### 현재 기술 스택 (실제 구현 기준)

- **Frontend**: React Native (Expo Go) + TypeScript
- **Backend**: Node.js + Express + TypeScript (단일 `index.ts` 파일)
- **ORM**: Prisma 7
- **DB**: Supabase (PostgreSQL) — `DATABASE_URL` + `DIRECT_URL` 환경변수 사용
- **스케줄러**: node-cron (자동 청구서 발행)
- **세션**: AsyncStorage (클라이언트 사이드, JWT 없음)

#### 데이터 모델 구조

```
User (id: uuid)
  ├── villasManaged → Villa[] (ADMIN)
  ├── residentRecords → ResidentRecord[] (RESIDENT)
  └── invoicePayments → InvoicePayment[]

Villa (id: int autoincrement)
  ├── admin → User
  ├── residents → ResidentRecord[]
  ├── invoices → Invoice[]
  ├── transactions → LedgerTransaction[]
  ├── inviteCode: String (unique) ← 가입용 초대 코드
  └── autoBillingDay: Int? ← 자동 청구 날짜

Invoice (id: uuid)
  ├── type: FIXED | VARIABLE (enum)
  ├── totalAmount, amountPerResident
  ├── items: Json? (VARIABLE 전용 항목 배열)
  └── payments → InvoicePayment[]

InvoicePayment (id: uuid)
  ├── invoice → Invoice
  ├── resident → User
  ├── amount: Int
  └── status: PENDING | COMPLETED
```

#### 네비게이션 아키텍처

```
AppNavigator (Stack)
├── Login (Stack)
├── EmailLogin (Stack)
├── ProfileSetup (Stack)
├── Onboarding (Stack)
├── ResidentJoin (Stack)
├── ResidentDashboard (Stack)
├── Ledger (Stack)
├── CreateInvoice (Stack)  ← 탭 안에서 접근 시 getParent()?.navigate() 필요
└── Main (Tab) ← MainTabNavigator
    ├── 홈 탭 → DashboardScreen
    ├── 청구 탭 → AdminInvoiceScreen
    └── 프로필 탭 → ProfileScreen
```

#### 주요 아키텍처 결정 및 트레이드오프

- **모놀리스 백엔드**: 단일 `index.ts`에 모든 라우트 정의 — MVP 속도 우선. 추후 도메인별 라우터 분리 필요
- **Express 라우트 순서**: `/api/villas/:villaId/invoices` 등 구체적 경로는 반드시 `/api/villas/:adminId` 보다 위에 등록해야 충돌 없음
- **역할 기반 라우팅**: User.role ('ADMIN' | 'RESIDENT') 로 분기, villa 연결 여부로 추가 분기
- **초대 코드 방식**: 복잡한 QR/딥링크 대신 6자리 영숫자 코드로 MVP 구현

#### 알려진 기술 부채

- API_BASE_URL 각 스크린에 하드코딩 → 공통 config 필요
- 인증 미들웨어 없음 → JWT + Express middleware 필요
- 비밀번호 미저장 → bcrypt + password 컬럼 추가 필요
- 단일 index.ts → 도메인별 라우터 분리 필요 (auth, villas, invoices, payments)

---

### 2026-02-25 — 빌라메이트 UX 개선 및 PG 연동 세션

#### 데이터 모델 변경 사항

**Invoice 모델 업데이트**
```
Invoice (id: uuid)
  ├── type: FIXED | VARIABLE
  ├── billingMonth: String  ← NEW (YYYY-MM 형식, 예: '2026-02')
  ├── memo: String?          ← NEW (선택적 메모)
  ├── totalAmount, amountPerResident
  ├── items: Json?
  └── payments → InvoicePayment[]

[제거됨] title: String
[제거됨] dueDate: DateTime
```

#### 신규 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/users/:userId/villa` | 입주민의 빌라 소속 조회 (ResidentRecord 경유) |
| `PUT` | `/api/invoices/:invoiceId` | 청구서 수정 (완납 세대 있으면 400) |
| `GET` | `/api/invoices/:invoiceId/payments` | 청구서별 세대 납부 현황 조회 |

#### 신규 화면 및 네비게이션 업데이트

```
AppNavigator (Stack)
├── ... (기존)
├── Payment (Stack)            ← NEW: PortOne PG 결제 화면
├── AdminInvoiceDetail (Stack) ← NEW: 청구서별 납부 현황
└── Main (Tab)
    └── 청구 탭 → AdminInvoiceScreen (카드 탭 → getParent()?.navigate('AdminInvoiceDetail'))
```

#### 아키텍처 결정: 커미션 모델 강제

- **입주민 API 응답 샌드박스**: `GET /api/residents/:id/payments` 에서 villa `accountNumber`, `bankName` 필드 제거
- **PG 결제 플로우**: `PaymentScreen` → `IMP.Payment` (PortOne WebView) → 결제 완료 콜백 → `PUT /api/payments/:id/status`
- **보안 갭**: 현재 클라이언트 결과만 신뢰. 다음 단계: 백엔드에서 PortOne `imp_uid` 서버 검증 필요

#### 프론트엔드 아키텍처 패턴 (키보드/SafeArea 표준)

```
화면 구조 표준 (입력 폼 화면):
<SafeAreaView from 'react-native-safe-area-context'>  ← 반드시 safe-area-context
  <View flex:1>
    <KeyboardAwareScrollView enableOnAndroid extraHeight={120}>
      {/* 폼 내용 */}
    </KeyboardAwareScrollView>
    <KeyboardAvoidingView behavior={ios:'padding', android:undefined}>
      <View paddingBottom={Math.max(insets.bottom+16, 24)}>
        {/* 하단 고정 CTA 버튼 */}
      </View>
    </KeyboardAvoidingView>
  </View>
</SafeAreaView>
```

---

### 2026-02-27 — 차량 관리 고도화, 입주민 전출입, 건물 이력 세션

#### 데이터 모델 변경 사항

**Vehicle 모델 업데이트**
```
Vehicle
  ├── plateNumber String
  ├── modelName String?         ← NEW (색상+모델 자유 텍스트)
  ├── isVisitor Boolean
  ├── expectedDeparture String? ← 변경: DateTime? → String? (자유 텍스트)
  ├── ownerId String → User
  └── villaId Int → Villa
```

**BuildingEvent 모델 추가 (신규)**
```
BuildingEvent
  ├── id String @id @default(uuid())
  ├── title String
  ├── description String?
  ├── category String            (하자보수|정기점검|유지계약|청소|기타)
  ├── eventDate String           (자유 텍스트, 예: "2024-05-20")
  ├── contractorName String?
  ├── contactNumber String?
  ├── attachmentUrl String?      ← multer 업로드 URL
  ├── villaId Int → Villa
  ├── creatorId String → User
  └── createdAt DateTime
```

#### 신규 엔드포인트 (2026-02-27 추가)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/villas/:villaId/vehicles` | 빌라 전체 차량 목록 (createdAt desc) |
| `GET` | `/api/villas/:villaId/residents` | 입주민 목록 (roomNumber asc, recordId 포함) |
| `POST` | `/api/villas/:villaId/residents/:residentId/move-out` | 전출 처리 (ResidentRecord deleteMany) |
| `GET` | `/api/villas/:villaId/detail` | 빌라 상세 (inviteCode 포함) |
| `POST` | `/api/villas/:villaId/building-events` | 건물 이력 생성 |
| `GET` | `/api/villas/:villaId/building-events` | 건물 이력 목록 (eventDate desc) |
| `POST` | `/api/upload` | 파일 업로드 (multer, 10MB 제한) |

#### 신규 화면 및 네비게이션 업데이트

```
AppNavigator (Stack) — 2026-02-27 추가분
├── BuildingHistory (Stack)       ← NEW: 건물 이력 목록
└── CreateBuildingEvent (Stack)   ← NEW: 건물 이력 등록

ManagementScreen 메뉴 구성 (현재):
  ├── 새 청구서 발행하기        → CreateInvoice
  ├── 입주민 및 전출입 관리     → ResidentManagement (갱신)
  ├── 납부 내역 확인            → AdminInvoice
  └── 건물 이력 및 계약 관리   → BuildingHistory (NEW)
```

#### 파일 업로드 아키텍처

```
클라이언트 (expo-image-picker)
  └── FormData POST /api/upload
        └── multer (diskStorage)
              └── backend/uploads/{timestamp}-{random}.{ext}
                    └── app.use('/uploads', express.static())
                          → fileUrl: http://192.168.219.178:3000/uploads/...
```

- **현재**: 로컬 디스크 저장, 서버 재시작 시 파일 보존 (uploads/ 디렉토리)
- **향후**: S3 등 오브젝트 스토리지로 마이그레이션 필요 (서버 이전 시 파일 소실 위험)

#### Express 라우트 등록 순서 (현재 기준, 구체적 → 와일드카드)

```
/api/villas/:villaId/vehicles          (구체적 — 전체 목록)
/api/villas/:villaId/vehicles/search   (구체적 — 검색)
/api/villas/:villaId/residents         (구체적)
/api/villas/:villaId/residents/:id/move-out (구체적)
/api/villas/:villaId/building-events   (구체적)
/api/villas/:villaId/detail            (구체적)
/api/villas/:adminId                   (와일드카드 ← 항상 마지막)
```

#### 알려진 기술 부채 (2026-02-27 업데이트)

- API_BASE_URL 각 스크린에 하드코딩 → 공통 config 필요
- 인증 미들웨어 없음 → JWT + Express middleware 필요
- 비밀번호 미저장 → bcrypt + password 컬럼 추가 필요
- 단일 index.ts (~900+ 라인) → 도메인별 라우터 분리 필요 (auth, villas, invoices, vehicles, events, upload)
- 업로드 파일 로컬 저장 → 오브젝트 스토리지(S3) 마이그레이션
- multer 파일 타입 검증 부재 → MIME whitelist 추가 필요

---

### 2026-02-28 — 외부 웹 청구, 대시보드 고도화, API 중앙화, 전자투표 세션

#### 데이터 모델 변경 사항

**ExternalBilling 모델 신규 추가**
```
ExternalBilling (id: uuid)
  ├── targetName String          (청구 대상자 이름)
  ├── phoneNumber String
  ├── amount Int
  ├── description String
  ├── dueDate String             (자유 텍스트, YYYY-MM-DD)
  ├── status String @default("PENDING")  (PENDING | PENDING_CONFIRMATION | COMPLETED)
  ├── villaId Int → Villa
  └── createdAt DateTime
```

**Poll / PollOption / Vote 모델 신규 추가 (전자투표)**
```
Poll (id: uuid)
  ├── title String
  ├── description String?
  ├── isAnonymous Boolean @default(false)
  ├── endDate DateTime
  ├── villaId Int → Villa
  ├── creatorId String → User
  ├── options → PollOption[]
  └── createdAt DateTime

PollOption (id: uuid)
  ├── text String
  ├── pollId String → Poll
  └── votes → Vote[]

Vote (id: uuid)
  ├── pollId String → Poll
  ├── optionId String → PollOption
  ├── voterId String → User
  ├── roomNumber String           ← 1세대 1표 판별 기준
  └── @@unique([pollId, roomNumber])  ← DB 레벨 1세대 1표 강제
```

**Villa, User 모델에 관계 필드 추가**
```
Villa:
  ├── externalBills → ExternalBilling[]
  └── polls → Poll[]

User:
  └── votes → Vote[]
```

#### 신규 엔드포인트 (2026-02-28 추가)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/villas/:villaId/external-bills` | 외부 청구서 생성 |
| `GET` | `/api/villas/:villaId/external-bills` | 외부 청구서 목록 |
| `PATCH` | `/api/villas/:villaId/external-bills/:billId/confirm` | 납부 확인 처리 (COMPLETED) |
| `GET` | `/pay/:billId` | 공개 결제 웹페이지 (HTML 응답, 앱 불필요) |
| `POST` | `/api/public/pay/:billId/notify` | 입금 알림 전송 (PENDING_CONFIRMATION 설정) |
| `GET` | `/api/dashboard/:userId?villaId=&role=` | 역할별 대시보드 통계 |
| `POST` | `/api/villas/:villaId/polls` | 투표 생성 (옵션 중첩 생성) |
| `GET` | `/api/villas/:villaId/polls` | 투표 목록 (투표수·투표자 포함) |
| `POST` | `/api/villas/:villaId/polls/:pollId/vote` | 투표 참여 (1세대 1표 검증) |

#### API_BASE_URL 중앙화 아키텍처

```
frontend/src/config.ts  ← 단일 소스
  export const API_BASE_URL = 'http://192.168.219.178:3000';

모든 22개 스크린:
  import { API_BASE_URL } from '../config';
```
- 이전: 각 스크린에 하드코딩 (IP 변경 시 전 파일 수정 필요)
- 현재: config.ts 1개 파일만 수정하면 전체 반영
- **[RESOLVED]** 2026-02-24부터 누적되던 API_BASE_URL 기술 부채 해소

#### 대시보드 아키텍처 (위젯 기반)

```
DashboardScreen (관리자 홈) — Promise.all 병렬 fetch
  ├── GET /api/villas/:userId                (빌라 정보)
  ├── GET /api/dashboard/:userId?role=ADMIN  (통계)
  └── GET /api/villas/:villaId/residents     (입주민 목록)

  위젯 구조:
  ├── 미납 관리비 (→ AdminInvoice)
  ├── 확인 대기 (→ ExternalBilling)
  ├── 최근 공지 (→ PostDetail)
  ├── 진행중인 투표 (→ PollList)
  └── 바로가기 7개 (3+3+1 그리드)

ResidentDashboardScreen (입주민 홈) — ScrollView ref + onLayout
  ├── GET /api/dashboard/:userId?role=RESIDENT (통계)
  └── 별도 청구 데이터 fetch

  위젯 → scroll-to-section 패턴:
    scrollRef.current?.scrollTo({ y: paymentSectionY.current, animated: true })
```

#### 1세대 1표 아키텍처 (이중 강제)

```
레이어 1 — DB 제약:
  @@unique([pollId, roomNumber])
  → 같은 세대 중복 투표 시 Prisma P2002 에러 (데이터 무결성 보장)

레이어 2 — 서버 검증:
  const existing = await prisma.vote.findUnique({
    where: { pollId_roomNumber: { pollId, roomNumber } }
  });
  if (existing) return res.status(409).json({ error: '이미 투표한 세대입니다.' });
  → 친절한 한국어 에러 메시지 반환

roomNumber 조회:
  서버에서 ResidentRecord.findFirst({ where: { userId, villaId } })로 직접 조회
  → 클라이언트가 roomNumber를 직접 전달하지 않아도 됨 (스푸핑 방지)
```

#### 외부 청구 웹 결제 아키텍처

```
관리자 → 청구서 생성 (targetName, phone, amount)
  → ExternalBilling DB 레코드 생성
  → Alert: "${API_BASE_URL}/pay/${billId}" SMS 링크 안내

비앱 사용자 → GET /pay/:billId
  → Express가 HTML 페이지 직접 반환 (모바일 최적화)
  → "입금 완료 알림 보내기" 버튼 클릭
  → POST /api/public/pay/:billId/notify
  → status: PENDING_CONFIRMATION

관리자 → ExternalBillingScreen에서 "납부 확인" 버튼
  → PATCH confirm → status: COMPLETED
```

#### 신규 화면 및 네비게이션 업데이트

```
AppNavigator (Stack) — 2026-02-28 추가분
├── ExternalBilling (Stack)   ← 외부 청구 관리
├── CreatePoll (Stack)         ← 투표 생성
├── PollList (Stack)           ← 투표 목록
└── PollDetail (Stack)         ← 투표 상세/참여/결과

ManagementScreen 메뉴 구성 (현재):
  ├── 새 청구서 발행하기        → CreateInvoice
  ├── 입주민 및 전출입 관리     → ResidentManagement
  ├── 납부 내역 확인            → AdminInvoice
  ├── 건물 이력 및 계약 관리   → BuildingHistory
  └── 외부 청구서 발송          → ExternalBilling (NEW)
```

#### 알려진 기술 부채 (2026-02-28 업데이트)

- ~~API_BASE_URL 각 스크린에 하드코딩~~ → **[RESOLVED]** `config.ts` 중앙화 완료
- 인증 미들웨어 없음 → JWT + Express middleware 필요
- 비밀번호 미저장 → bcrypt + password 컬럼 추가 필요
- 단일 index.ts (~1200+ 라인) → 도메인별 라우터 분리 필요
- 업로드 파일 로컬 저장 → 오브젝트 스토리지(S3) 마이그레이션
- `POST /api/public/pay/:billId/notify` 인증 없이 공개 — 악의적 상태 변경 가능
- 전자투표 법적 증거력 → 본인인증 + 타임스탬프 암호화 미적용 (기획 요구사항 잔여)

---

### 2026-03-01 — 전자투표 Admin 버그 수정, 민원 시스템 게시판 통합, UX 정리 세션

#### 데이터 모델 변경 사항

**Post 모델 확장 (기존 모델 컬럼 추가)**
```
Post (기존)
  ├── ... (기존 필드 유지)
  ├── category String @default("GENERAL")  ← NEW ('GENERAL' | 'ISSUE')
  └── status   String?                     ← NEW (ISSUE일 때만 사용: PENDING | IN_PROGRESS | RESOLVED)
```
- 민원/하자 접수 게시글은 `category='ISSUE'`, 초기 `status='PENDING'`으로 생성
- 일반 게시글은 `category='GENERAL'`, `status=null`

**Ticket 모델 (schema.prisma에 잔존, 미사용)**
```
Ticket — 추가했다가 Post 통합으로 역할 소멸. 향후 마이그레이션으로 제거 권장
```

**Vote 모델 — Admin sentinel 처리**
```
Vote
  ├── roomNumber String  ← Admin 투표 시 'admin' 고정값 사용
  └── @@unique([pollId, roomNumber])  ← 'admin'도 동일하게 적용 → Admin 중복 투표 방지
```

#### 신규 엔드포인트 (2026-03-01 추가)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `PATCH` | `/api/villas/:villaId/posts/:postId/status` | 게시글 상태 변경 (ADMIN만, ISSUE 게시글만) |

#### 변경된 엔드포인트

| 메서드 | 경로 | 변경 내용 |
|--------|------|-----------|
| `POST` | `/api/villas/:villaId/posts` | `category` 파라미터 추가, ISSUE이면 `status='PENDING'` 자동 설정 |
| `POST` | `/api/villas/:villaId/polls/:pollId/vote` | ResidentRecord 없을 때 `villa.findFirst`로 Admin 2차 확인 → `roomNumber: 'admin'` sentinel 처리 |

#### 삭제된 화면 및 라우트

```
삭제된 파일:
  frontend/src/screens/TicketListScreen.tsx
  frontend/src/screens/CreateTicketScreen.tsx

AppNavigator에서 제거:
  - import CreateTicketScreen, TicketListScreen
  - Stack.Screen name="TicketList"
  - Stack.Screen name="CreateTicket"
```

#### 현재 홈 화면 퀵액션 구성 (정리 후)

```
DashboardScreen (Admin 홈) — 퀵액션 3개 (단일 행):
  ├── 청구서 발행   → CreateInvoice
  ├── 주차 조회     → ParkingSearch
  └── 전자투표      → PollList

ResidentDashboardScreen (Resident 홈) — 퀵액션 2개 (가운데 정렬):
  ├── 주차 조회     → ParkingSearch
  └── 전자투표      → PollList
```

#### 현재 Express 라우트 등록 순서 (2026-03-01 기준 추가분 포함)

```
/api/villas/:villaId/posts/:postId/status  ← NEW (구체적, 먼저 등록)
/api/villas/:villaId/posts                 (기존)
/api/villas/:villaId/polls/:pollId/vote    (기존)
/api/villas/:villaId/polls                 (기존)
/api/villas/:villaId/tickets/:id/status   (미사용, Ticket 모델 잔존)
... (기존 순서 유지)
/api/villas/:adminId                       (와일드카드 ← 항상 마지막)
```

#### 알려진 기술 부채 (2026-03-01 업데이트)

- 인증 미들웨어 없음 → JWT + Express middleware 필요
- 비밀번호 미저장 → bcrypt + password 컬럼 추가 필요
- 단일 index.ts (~1300+ 라인) → 도메인별 라우터 분리 필요
- 업로드 파일 로컬 저장 → 오브젝트 스토리지(S3) 마이그레이션
- `Ticket` 모델 schema.prisma에 잔존 → 사용하지 않으므로 마이그레이션으로 제거 권장
- `PATCH .../posts/:postId/status`의 userRole 클라이언트 전달 → JWT 적용 시 `req.user.role`로 대체
- ~~API_BASE_URL 각 스크린에 하드코딩~~ → **[RESOLVED]**

---

### 2026-03-02 — Expo 푸시 알림, iOS 키보드 UX, ProfileScreen 개편, 마이페이지 고도화 세션

#### 데이터 모델 변경 사항

**User 모델 필드 추가**
```
User
  ├── ... (기존 필드 유지)
  ├── expoPushToken String?  ← NEW (Expo 푸시 토큰)
  └── password      String?  ← NEW (bcrypt 해시, nullable: 소셜 로그인 호환)
```
- `npx prisma db push` 및 `npx prisma generate` 실행으로 적용

#### 신규 엔드포인트 (2026-03-02 추가)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `PATCH` | `/api/users/:userId/push-token` | Expo 푸시 토큰 저장 |
| `POST` | `/api/villas/:villaId/posts/:postId/send-push` | 공지 게시글 수동 푸시 발송 (전 입주민) |
| `DELETE` | `/api/users/:userId` | 회원 탈퇴 (소프트 삭제: 익명화) |
| `PATCH` | `/api/users/:userId/password` | 비밀번호 변경 (bcrypt 검증 + 재해시) |
| `GET` | `/api/users/:userId/posts` | 특정 유저의 작성 게시글 목록 |

#### 신규 화면 및 네비게이션 업데이트

```
AppNavigator (Stack) — 2026-03-02 추가분
├── VehicleManagement (Stack)  ← 기존 ProfileScreen에서 차량 관리 분리
├── ChangePassword (Stack)     ← 비밀번호 변경 전용 화면
└── MyPosts (Stack)            ← 내가 쓴 글 / 민원 내역
```

#### 푸시 알림 아키텍처

```
[프론트엔드 — App.tsx]
  앱 시작 시:
    registerForPushNotificationsAsync()
      ├── Device.isDevice 체크 (시뮬레이터 제외)
      ├── Android 알림 채널 생성 (importance: MAX)
      ├── 알림 권한 요청
      └── Expo.getExpoPushTokenAsync() → token

  token + userId 있으면:
    PATCH /api/users/:userId/push-token

[백엔드 — index.ts]
  POST /api/villas/:villaId/posts/:postId/send-push:
    1. post 조회 (isNotice 확인)
    2. 해당 빌라 ResidentRecord.findMany → expoPushToken 수집
    3. Expo.isExpoPushToken() 필터링
    4. chunkPushNotifications() → sendPushNotificationsAsync()
    5. { success: true, sent: count } 반환

[알림 내용]
  title: '새롭게 공지사항 등록된 글이 있습니다. 확인해보실까요?'
  body: post.title
```

#### iOS 키보드 처리 아키텍처 변경

```
변경 전 (EmailLoginScreen):
  <View>
    <KeyboardAwareScrollView>  ← 서드파티
      {/* 폼 */}
    </KeyboardAwareScrollView>
    <KeyboardAvoidingView>     ← 버튼용
      <Button />
    </KeyboardAvoidingView>
  </View>

변경 후 (표준 RN 조합):
  <KeyboardAvoidingView behavior={ios:'padding', android:'height'}>
    <ScrollView keyboardShouldPersistTaps="handled">
      {/* 폼 + 버튼 모두 포함 */}
    </ScrollView>
  </KeyboardAvoidingView>
```

#### 계정 삭제 아키텍처 (소프트 삭제 패턴)

```
DELETE /api/users/:userId
  prisma.user.update({
    where: { id: userId },
    data: {
      name: '탈퇴한 사용자',
      email: null,
      phone: null,
      expoPushToken: null,
      password: null,
      status: 'DELETED',
    }
  })
  → FK 연관 테이블 보존 (InvoicePayment, Comment 등)
  → 앱 재로그인 차단은 email=null + status 체크 조합으로 구현 가능
```

#### 현재 Express 라우트 등록 순서 (2026-03-02 추가분)

```
/api/villas/:villaId/posts/:postId/send-push  ← NEW (구체적, 먼저 등록)
/api/villas/:villaId/posts/:postId/status     (기존)
/api/villas/:villaId/posts                    (기존)
/api/users/:userId/push-token                 ← NEW (PATCH)
/api/users/:userId/password                   ← NEW (PATCH)
/api/users/:userId/posts                      ← NEW (GET)
/api/users/:userId                            ← NEW (DELETE)
... (기존 순서 유지)
/api/villas/:adminId                          (와일드카드 ← 항상 마지막)
```

#### 알려진 기술 부채 (2026-03-02 업데이트)

- ~~비밀번호 미저장~~ → **[RESOLVED]** `password String?` + bcrypt 적용
- 인증 미들웨어 없음 → JWT + Express middleware 필요
- 단일 index.ts (~1400+ 라인) → 도메인별 라우터 분리 필요 (auth, users, villas, posts, polls, vehicles, events, billing, upload)
- 업로드 파일 로컬 저장 → 오브젝트 스토리지(S3) 마이그레이션
- `Ticket` 모델 schema.prisma에 잔존 → 마이그레이션으로 제거 권장
- expoPushToken 인증 없이 덮어쓰기 가능 → JWT 적용 시 해소
- send-push 인증 없이 대량 발송 → JWT + ADMIN 역할 체크 필요
- ~~API_BASE_URL 각 스크린에 하드코딩~~ → **[RESOLVED]**

---

### 2026-03-03 — 롤링 배너 자동스크롤, 앱 가이드, 알림함 세션

#### 데이터 모델 변경 사항

**Notification 모델 신규 추가**
```
Notification (id: uuid)
  ├── userId String → User
  ├── title  String
  ├── body   String
  ├── isRead Boolean @default(false)
  └── createdAt DateTime

User:
  └── notifications Notification[]  ← 관계 필드 추가
```

#### 신규 엔드포인트 (2026-03-03 추가)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/users/:userId/notifications` | 유저 알림 목록 (최신순) |
| `PATCH` | `/api/users/:userId/notifications/read-all` | 전체 미읽음 알림 읽음 처리 |

#### 변경된 엔드포인트

| 메서드 | 경로 | 변경 내용 |
|--------|------|-----------|
| `POST` | `/api/villas/:villaId/posts/:postId/send-push` | push 발송 후 `notification.createMany` 추가 (전체 입주민 대상) |

#### 신규 화면 및 네비게이션 업데이트

```
AppNavigator (Stack) — 2026-03-03 추가분
├── Guide (Stack)          ← 앱 이용 가이드 (GuideScreen)
└── Notifications (Stack)  ← 알림함 (NotificationScreen)

신규 컴포넌트:
  frontend/src/components/RollingBanner.tsx  ← 이미 이전 세션에서 생성, 자동스크롤 추가

신규 화면:
  frontend/src/screens/GuideScreen.tsx        ← 7개 가이드 카드
  frontend/src/screens/NotificationScreen.tsx ← 알림함 (unread 표시, 자동 읽음)
```

#### 롤링 배너 자동스크롤 아키텍처

```
currentIndexRef = useRef(0)  ← interval 내 읽기/쓰기용 (stale closure 방지)
currentIndex (state)          ← 도트 인디케이터 렌더링용

useEffect → setInterval(3000ms):
  next = (currentIndexRef.current + 1) % banners.length
  flatListRef.current?.scrollToIndex({ index: next, animated: true })
  currentIndexRef.current = next
  setCurrentIndex(next)
  → return () => clearInterval(id)  ← unmount cleanup

onViewableItemsChanged:
  currentIndexRef.current = index  ← 수동 스와이프 시 ref 동기화
  setCurrentIndex(index)            ← dot 인디케이터 갱신
```

#### 알림함 아키텍처

```
[send-push 라우트 — 알림 저장]
  push 발송 완료 후:
    userIds = records.map((r) => r.userId)  ← 토큰 유무 무관 전체
    prisma.notification.createMany({
      data: userIds.map((uid) => ({ userId: uid, title, body: post.title }))
    })

[NotificationScreen — 알림 조회/읽음]
  useFocusEffect:
    GET /api/users/:userId/notifications  → FlatList 렌더링
    PATCH .../read-all                    → 전체 읽음 처리

[unread 표시]
  isRead === false → 좌측 파란 점 + fontWeight: 'bold'
  isRead === true  → 일반 텍스트
```

#### Express 라우트 등록 순서 (2026-03-03 추가분)

```
/api/users/:userId/notifications/read-all  ← NEW (구체적, 먼저 등록)
/api/users/:userId/notifications           ← NEW
/api/users/:userId/push-token              (기존)
/api/users/:userId/password                (기존)
/api/users/:userId/posts                   (기존)
/api/users/:userId                         (기존)
... (기존 순서 유지)
```

#### 알려진 기술 부채 (2026-03-03 업데이트)

- 인증 미들웨어 없음 → JWT + Express middleware 필요 (notification API 포함)
- 단일 index.ts (~1500+ 라인) → 도메인별 라우터 분리 필요
- `notification.createMany` + push 발송 간 트랜잭션 없음 → 불일치 발생 가능
- 업로드 파일 로컬 저장 → S3 마이그레이션
- `Ticket` 모델 schema.prisma에 잔존 → 마이그레이션 제거 권장
- ~~API_BASE_URL 하드코딩~~ → **[RESOLVED]**
- ~~비밀번호 미저장~~ → **[RESOLVED]**

---

### 2026-03-04 — 회원가입 플로우 개편, 고객센터/시스템공지, Admin 웹 패널 세션

#### 데이터 모델 변경 사항

**SystemNotice 모델 신규 추가**
```
SystemNotice (id: uuid)
  ├── title   String
  ├── content String
  └── createdAt DateTime
```

**Faq 모델 신규 추가**
```
Faq (id: uuid)
  ├── question String
  ├── answer   String
  └── createdAt DateTime
```

#### 신규 엔드포인트 (2026-03-04 추가)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/auth/register` | 신규 사용자 회원가입 (email/password/name/phone/termsAgreed) |
| `POST` | `/api/admin/login` | SUPER_ADMIN JWT 로그인 (7일 만료) |
| `GET` | `/api/admin/users` | 전체 유저 목록 (SUPER_ADMIN 전용) |
| `GET` | `/api/admin/villas` | 전체 빌라 목록 (SUPER_ADMIN 전용) |
| `GET` | `/api/system-notices` | 시스템 공지 목록 (공개) |
| `POST` | `/api/system-notices` | 시스템 공지 등록 (SUPER_ADMIN 전용) |
| `DELETE` | `/api/system-notices/:id` | 시스템 공지 삭제 (SUPER_ADMIN 전용) |
| `GET` | `/api/faqs` | FAQ 목록 (공개) |
| `POST` | `/api/faqs` | FAQ 등록 (SUPER_ADMIN 전용) |
| `DELETE` | `/api/faqs/:id` | FAQ 삭제 (SUPER_ADMIN 전용) |

#### 변경된 엔드포인트

| 메서드 | 경로 | 변경 내용 |
|--------|------|-----------|
| `POST` | `/api/auth/email-login` | 사용자 없으면 upsert 대신 `404 + { error: 'USER_NOT_FOUND' }` 반환 |

#### 신규 화면 및 네비게이션 업데이트

```
AppNavigator (Stack) — 2026-03-04 추가분
├── SignupAgreement (Stack, headerShown: false)  ← 회원가입 Step 2 (약관 동의)
├── SignupProfile (Stack, headerShown: false)    ← 회원가입 Step 3 (프로필 입력)
├── SystemNotice (Stack, headerShown: false)     ← 시스템 공지사항
└── CustomerCenter (Stack, headerShown: false)   ← 고객센터 FAQ
```

#### Admin 웹 패널 아키텍처

```
admin-web/  (별도 디렉토리, React + Vite + TypeScript)
├── src/
│   ├── App.tsx
│   ├── config.ts       ← API_BASE_URL
│   ├── components/
│   └── pages/
│       ├── LoginPage   ← POST /api/admin/login → JWT 획득
│       ├── DashboardPage
│       ├── UsersPage   ← GET /api/admin/users
│       ├── VillasPage  ← GET /api/admin/villas
│       ├── FaqPage     ← GET/POST/DELETE /api/faqs
│       └── NoticePage  ← GET/POST/DELETE /api/system-notices

인증 흐름:
  Login → Bearer JWT 저장(localStorage) → 요청 시 Authorization 헤더 포함
  서버에서 jwt.verify(token, JWT_SECRET) → decoded.role === 'SUPER_ADMIN' 확인
```

#### 회원가입 플로우 아키텍처 (신규)

```
EmailLoginScreen (Step 1)
  ├── response.status === 404 && data.error === 'USER_NOT_FOUND'
  │   → navigate('SignupAgreement', { email, password })
  ├── response.status === 401
  │   → Alert '비밀번호가 올바르지 않습니다.'
  └── response.ok
      → navigateAfterLogin(data)

SignupAgreementScreen (Step 2/3)
  ├── 전체 동의 토글 + 개별 체크박스 (agreeTerms + agreePrivacy)
  └── allAgreed 시 → navigate('SignupProfile', { email, password, termsAgreed: true })

SignupProfileScreen (Step 3/3)
  ├── 이름(필수) + 전화번호(선택) 입력
  └── POST /api/auth/register → { email, password, name, phoneNumber, termsAgreed }
      ├── 201 → AsyncStorage 저장 → replace('Onboarding')
      └── 409 → Alert + navigate('EmailLogin')
```

#### 프론트엔드 컴포넌트 구조 변경

```
frontend/src/
├── components/        ← NEW 디렉토리
│   └── RollingBanner.tsx  ← 기존 위치에서 이동
└── screens/
    ├── SignupAgreementScreen.tsx  ← NEW
    ├── SignupProfileScreen.tsx    ← NEW
    ├── CustomerCenterScreen.tsx   ← NEW
    └── SystemNoticeScreen.tsx     ← NEW
```

#### 알려진 기술 부채 (2026-03-04 업데이트)

- 인증 미들웨어 없음 (앱 API) → JWT 미들웨어 필요
- 단일 index.ts (~1600+ 라인) → 도메인별 라우터 분리 필요
- `JWT_SECRET` 하드코딩 폴백 → `.env` 파일 강력한 시크릿 설정 필수
- `termsAgreed` 서버 미검증 → 명시적 체크 + DB에 동의 시각 기록 필요
- `notification.createMany` + push 발송 트랜잭션 없음 → 불일치 가능
- 업로드 파일 로컬 저장 → S3 마이그레이션
- `Ticket` 모델 schema.prisma에 잔존 → 마이그레이션 제거 권장
- ~~API_BASE_URL 하드코딩~~ → **[RESOLVED]**
- ~~비밀번호 미저장~~ → **[RESOLVED]**

---

---

### 2026-03-08 — IA 개편, 전자투표 고도화, 모의 자동결제 세션

#### 데이터 모델 변경 사항

**Villa 모델 필드 추가 (자동결제)**
```
Villa:
  ├── isAutoBilling Boolean @default(false)  ← NEW (자동결제 활성화 여부)
  ├── billingKey    String?                  ← NEW (Toss 빌링키, 현재 Mock)
  └── maskedCard    String?                  ← NEW (예: ****-****-****-1234)
```
- `subscriptionStatus`, `subscriptionExpiry`는 기존에 이미 존재 확인됨

#### 신규 엔드포인트 (2026-03-08 추가)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/villas/:villaId/billing` | 카드 등록 → 모의 빌링키 발급 → Villa 업데이트 |
| `GET` | `/api/villas/:villaId/billing` | 자동결제 상태 조회 |
| `POST` | `/api/polls/:pollId/remind` | 미참여자에게 푸시 알림 발송 (ADMIN 전용) |

#### 신규 파일 및 네비게이션 업데이트

```
백엔드 신규:
  backend/src/utils/push.ts  ← Expo 푸시 발송 유틸 (sendPushToTokens)

프론트엔드 신규:
  frontend/src/screens/LedgerTabScreen.tsx  ← 장부 탭 래퍼 (LedgerScreen pass-through)

MainTabNavigator (관리자) — 탭 구성 변경:
  기존: [홈][관리][커뮤니티][프로필] (4개)
  변경: [홈][관리][커뮤니티][장부][프로필] (5개)
  추가: '장부' → LedgerTabScreen (4번째 탭, book/book-outline 아이콘, #007AFF)
```

#### 모의 자동결제 아키텍처

```
POST /api/villas/:villaId/billing:
  받는 값: { cardNumber, expireMonth, expireYear, password, adminId }
  처리:
    1. villa.adminId !== adminId → 403
    2. fakeBillingKey = "bk_mock_${Date.now()}"
    3. maskedCard = "****-****-****-" + cardNumber.replace(/\s/g,'').slice(-4)
    4. prisma.villa.update({
         isAutoBilling: true,
         billingKey: fakeBillingKey,
         maskedCard,
         subscriptionStatus: 'ACTIVE',
         subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
       })
  반환: { success: true, maskedCard, subscriptionExpiry }

GET /api/villas/:villaId/billing:
  반환: { isAutoBilling, maskedCard, subscriptionExpiry, subscriptionStatus }
  (Prisma select로 필요한 필드만 조회)
```

#### 미참여자 알림 아키텍처

```
POST /api/polls/:pollId/remind:
  1. poll → villa → adminId 검증 (adminId !== req.body.adminId → 403)
  2. 전체 입주민: ResidentRecord.findMany({ where: { villaId } })
  3. 이미 투표: Vote.findMany({ where: { pollId } })
  4. 미참여 = 전체 - 투표자
  5. 미참여자의 expoPushToken 수집
  6. sendPushToTokens(tokens, '투표 참여 요청', '...')
  7. notification.createMany(미참여자 전원)
  8. 반환: { success, nonVoterCount, sent }
```

#### IA 탭 구조 현황 (2026-03-08 기준)

```
관리자 (ADMIN) MainTabNavigator — 5탭:
  [홈]       DashboardScreen        (home/home-outline)
  [관리]     ManagementScreen       (settings/settings-outline)
  [커뮤니티] CommunityTabScreen     (chatbubbles/chatbubbles-outline)
  [장부]     LedgerTabScreen        (book/book-outline)  ← NEW
  [프로필]   ProfileScreen          (person/person-outline)

입주민 (RESIDENT) ResidentTabNavigator — 4탭:
  [홈]       ResidentDashboardScreen
  [커뮤니티] ResidentCommunityTabScreen
  [우리 빌라] OurVillaScreen
  [프로필]   ProfileScreen
```

#### Express 라우트 등록 순서 (2026-03-08 추가분)

```
/api/polls/:pollId/remind   ← NEW (구체적, :pollId 패턴)
/api/villas/:villaId/billing ← NEW (GET, POST)
... (기존 순서 유지)
/api/villas/:adminId        (와일드카드 ← 항상 마지막)
```

#### 알려진 기술 부채 (2026-03-08 업데이트)

- ~~민감 정보 auth 응답 노출 (C2)~~ → **[RESOLVED]**
- ~~모바일 JWT 미발급 (C1)~~ → **[RESOLVED]** (클라이언트 저장 미완)
- ~~구독 관리 엔드포인트 미인증 (C4)~~ → **[RESOLVED]**
- 모의 자동결제 → 실제 Toss 빌링키 API 연동 필요
- 미납자 자동 독촉 cron → 미구현 (핵심 요구사항)
- 인증 미들웨어 미적용 (앱 일반 API) → JWT 전체 확산 필요
- 단일 index.ts (~1900+ 라인) → 도메인별 라우터 분리 시급
- 업로드 파일 로컬 저장 → S3 마이그레이션
- ~~API_BASE_URL 하드코딩~~ → **[RESOLVED]**
- ~~비밀번호 미저장~~ → **[RESOLVED]**

---

### 2026-03-05 — 백오피스 웹 완성, 공지/FAQ 연동, 온보딩 정규화, SaaS BM 세션

#### 데이터 모델 변경 사항

**Villa 모델 필드 추가 (구독 관리)**
```
Villa:
  ├── subscriptionStatus String @default("FREE_TRIAL")  ← NEW (FREE_TRIAL | ACTIVE | EXPIRED)
  └── trialEndDate       DateTime?                       ← NEW (무료 체험 만료일)
```

**Coupon 모델 신규 추가 (SaaS 쿠폰)**
```
Coupon (id: uuid)
  ├── code      String @unique
  ├── isUsed    Boolean @default(false)
  └── usedAt    DateTime?
```

#### 신규 엔드포인트 (2026-03-05 추가)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/subscriptions/redeem` | 쿠폰 코드 사용 → FREE_TRIAL 활성화 |
| `GET` | `/api/villas/:villaId/subscription` | 구독 상태 조회 |
| `POST` | `/api/villas/:villaId/subscription/notify` | 유료 구독 수동 입금 알림 |
| `GET` | `/api/villas/search?q=` | 빌라 이름/주소 검색 |
| `POST` | `/api/villas/:villaId/join-requests` | 빌라 입주 신청 |

#### 신규 화면 및 네비게이션 업데이트

```
AppNavigator (Stack) — 2026-03-05 추가분
├── SelectRole (Stack, headerShown: false)   ← 역할 선택 (동대표/입주민)
├── VillaSearch (Stack)                       ← 빌라 검색/신청
├── ContractDetail (Stack)                    ← 계약 상세 (BuildingEvent 사진 뷰어)
└── AdminSubscription (Stack)                 ← SaaS 구독 관리

ResidentTabNavigator — 탭 구성 변경:
  기존: 홈 / 커뮤니티 / 프로필 (3개)
  변경: 홈 / 커뮤니티 / 우리 빌라 / 프로필 (4개)
  추가: '우리 빌라' → OurVillaScreen (3번째 탭)
```

#### 회원가입 플로우 아키텍처 (2026-03-05 업데이트)

```
EmailLoginScreen → SignupAgreementScreen → SignupProfileScreen
  └── 성공 → navigate('SelectRole', { email, password, name, termsAgreed })  ← NEW 분기점

SelectRoleScreen (NEW)
  ├── "동대표로 시작" → POST /api/auth/register { role: 'ADMIN' } → replace('Onboarding')
  └── "입주민으로 시작" → POST /api/auth/register { role: 'RESIDENT' } → replace('VillaSearch')
```

#### SaaS 구독 아키텍처

```
구독 상태 흐름:
  FREE_TRIAL (신규 가입 기본값, trialEndDate = 가입일 + 30일)
       ↓ 쿠폰 사용 → POST /api/subscriptions/redeem
  ACTIVE (수동 입금 → 관리자 확인 후)
       ↓ 구독 기간 종료
  EXPIRED (핵심 기능 제한)
```

#### Express 라우트 등록 순서 (2026-03-05 추가분)

```
/api/villas/search                          ← NEW (구체적, :adminId 와일드카드 앞)
/api/villas/:villaId/subscription/notify    ← NEW (구체적, 먼저 등록)
/api/villas/:villaId/subscription           ← NEW
/api/villas/:villaId/join-requests          ← NEW
/api/subscriptions/redeem                   ← NEW
... (기존 순서 유지)
/api/villas/:adminId                        (와일드카드 ← 항상 마지막)
```

#### 알려진 기술 부채 (2026-03-05 업데이트)

- 인증 미들웨어 없음 (앱 API) → JWT + 구독 상태 체크 미들웨어 필요
- 구독 만료 시 API 접근 제한 없음 → EXPIRED 상태 체크 미들웨어 추가 필요
- 구독 쿠폰 서버 미검증 → `Coupon` 테이블 + 원자적 `isUsed` 플래그 처리 필요
- 단일 index.ts (~1700+ 라인) → 도메인별 라우터 분리 시급
- `JWT_SECRET` 하드코딩 폴백 → `.env` 강력한 시크릿 설정 필수
- 업로드 파일 로컬 저장 → S3 마이그레이션
- `Ticket` 모델 schema.prisma에 잔존 → 마이그레이션 제거 권장
- ~~API_BASE_URL 하드코딩~~ → **[RESOLVED]**
- ~~비밀번호 미저장~~ → **[RESOLVED]**

---

### 2026-03-06 — 관리자 가이드 라이브러리, Admin 웹 대시보드 시각화, 보안 취약점 수정 세션

#### 데이터 모델 변경 사항

**Guide 모델 신규 추가**
```
Guide (id: uuid)
  ├── category    String       (하자관리|관리비|시설관리|세입자관리|건물운영|유지보수|법/제도)
  ├── title       String
  ├── content     String       (Tiptap HTML)
  ├── thumbnailUrl String?
  └── createdAt   DateTime
```
- Villa와 연관 없는 전역 콘텐츠 — 모든 사용자에게 공개

#### 신규 엔드포인트 (2026-03-06 추가)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/guides` | 가이드 목록 (공개) |
| `GET` | `/api/guides/:id` | 가이드 상세 (공개) |
| `POST` | `/api/guides` | 가이드 등록 (SUPER_ADMIN 전용) |
| `PUT` | `/api/guides/:id` | 가이드 수정 (SUPER_ADMIN 전용) |
| `DELETE` | `/api/guides/:id` | 가이드 삭제 (SUPER_ADMIN 전용) |
| `GET` | `/api/admin/stats` | 운영 통계 (SUPER_ADMIN 전용) |

#### /api/admin/stats 응답 구조

```typescript
{
  totalVillas: number,
  totalUsers: number,
  totalGuides: number,
  totalFaqs: number,
  subscriptionBreakdown: [{ subscriptionStatus, _count }],  // groupBy
  recentSignups: [{ date, count }],                          // 최근 7일
}
```

#### 신규 화면 및 네비게이션 업데이트

```
모바일 (frontend/src/screens/) — 2026-03-06 추가분:
├── GuideLibraryScreen.tsx   ← 카테고리 필터 + 가이드 카드 목록
└── GuideDetailScreen.tsx    ← react-native-render-html로 HTML 렌더링

Admin 웹 (admin-web/src/pages/) — 2026-03-06 추가분:
├── Guides.tsx               ← Tiptap 리치 텍스트 편집기 + CRUD
└── Dashboard.tsx            ← KPI 카드 + Recharts PieChart/BarChart
```

#### 보안 아키텍처 개선 (C1~C5)

**sanitizeUser 헬퍼 패턴**
```typescript
function sanitizeUser<T extends { password?: unknown; expoPushToken?: unknown; providerId?: unknown }>(user: T) {
  const { password, expoPushToken, providerId, ...safe } = user;
  return safe;
}
// 모든 auth 엔드포인트 응답에 적용
res.json({ ...sanitizeUser(user), token });
```

**authenticateUser 미들웨어 (기존 패턴 확장 적용)**
```typescript
// PATCH /api/villas/:villaId/subscribe
app.patch('/api/villas/:villaId/subscribe', authenticateUser, async (req, res) => {
  if ((req as any).user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // ...
});
```

**JWT 발급 표준 (30일)**
```typescript
const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
res.status(200).json({ ...sanitizeUser(user), token });
```

#### Admin 웹 시각화 아키텍처 (Recharts)

```
Dashboard.tsx
  └── GET /api/admin/stats (Bearer JWT)
        ├── KPI 카드 × 4 (grid)
        ├── PieChart (subscriptionBreakdown)
        │     └── ResponsiveContainer > PieChart > Pie > Cell (색상: ACTIVE=초록, FREE_TRIAL=파랑, EXPIRED=빨강)
        └── BarChart (recentSignups)
              └── ResponsiveContainer > BarChart > Bar fill="#3b82f6"
```

#### 알려진 기술 부채 (2026-03-06 업데이트)

- ~~민감 정보 auth 응답 노출 (C2)~~ → **[RESOLVED]** `sanitizeUser()` 전체 적용
- ~~모바일 JWT 미발급 (C1)~~ → **[RESOLVED]** 30일 JWT 백엔드 발급 완료 (클라이언트 저장은 미완)
- ~~구독 관리 엔드포인트 미인증 (C4)~~ → **[RESOLVED]** `authenticateUser` + SUPER_ADMIN 체크
- ~~Admin 웹 XSS 취약점 (C5)~~ → **[RESOLVED]** `DOMPurify.sanitize()` 적용
- 모바일 JWT 클라이언트 AsyncStorage 저장 미완 → 다음 세션 완성 필요
- 인증 미들웨어 미적용 (앱 일반 API) → JWT 전체 확산 필요
- 단일 index.ts (~1800+ 라인) → 도메인별 라우터 분리 시급
- 업로드 파일 로컬 저장 → S3 마이그레이션
- ~~API_BASE_URL 하드코딩~~ → **[RESOLVED]**
- ~~비밀번호 미저장~~ → **[RESOLVED]**

---

### 2026-03-10 — 다중 역할, 듀얼 모드, 호수 정규화, 자동 독촉 알림 세션

#### 데이터 모델 변경 사항

**ResidentRecord 모델 업데이트**
```
ResidentRecord
  ├── id Int @id @default(autoincrement())
  ├── villaId Int → Villa
  ├── userId String → User
  ├── roomNumber String
  ├── residentType String @default("HEAD")  ← NEW ('HEAD' | 'MEMBER')
  └── joinedAt DateTime
```

**Villa 모델 업데이트**
```
Villa
  ├── ... (기존)
  └── roomNumbers String[] @default([])  ← NEW (사전 지정 호수 목록)
```

#### 신규 엔드포인트 (2026-03-10 추가)

| 메서드 | 경로 | 설명 | 비고 |
|--------|------|------|------|
| `GET` | `/api/villas/join/rooms?inviteCode=XXX` | 호수 목록 조회 (가입 전) | `GET /api/villas/:adminId` 앞에 배치 필수 |
| `PUT` | `/api/villas/:villaId/rooms` | 관리자 호수 목록 수정 | normalizeRoom 적용 |

#### 신규 컴포넌트/유틸 (프론트엔드)

```
frontend/src/context/AppModeContext.tsx  ← NEW
  ├── AppMode: 'ADMIN' | 'RESIDENT'
  ├── AppModeProvider (App.tsx 최상위 래핑)
  └── useAppMode() hook
```

#### 아키텍처 결정: 입주민 다중 역할

**비즈니스 로직 분리 원칙**:
- `residentType === 'HEAD'`만 청구 대상 → 청구서 생성, 자동결제 cron 양쪽 필터
- `residentType === 'MEMBER'`는 투표 403, 납부 내역 즉시 `200 []` 반환
- 판별 기준: 가입 시 `villaId + normalizedRoomNumber` 조합으로 기존 HEAD 존재 여부 확인

**normalizeRoom 유틸 패턴**:
```typescript
// backend/src/index.ts 상단
function normalizeRoom(room: string): string {
  return room.replace(/호/g, '').trim();
}
// 모든 roomNumber 저장/조회 경로에 적용
```

**스타트업 마이그레이션 패턴**:
```typescript
async function migrateRoomNumbers() {
  const records = await prisma.residentRecord.findMany();
  for (const r of records) {
    const normalized = normalizeRoom(r.roomNumber);
    if (normalized !== r.roomNumber) {
      await prisma.residentRecord.update({ where: { id: r.id }, data: { roomNumber: normalized } });
    }
  }
}
// app.listen() 직전에 호출
```

#### 자동 독촉 크론 아키텍처

```
cron.schedule('0 10 * * *') — 매일 오전 10시
  └── prisma.invoicePayment.findMany({ where: { status: 'PENDING' } })
        └── 각 payment:
              ├── daysSince = Math.floor((now - invoice.createdAt) / 86400000)
              ├── daysSince === 3 → 1차 독촉 푸시
              └── daysSince === 7 → 최종 독촉 푸시 (이후 없음)

cron.schedule('POST /api/villas/:villaId/invoices') — 청구서 생성 시
  └── 즉시 푸시 (별도 try/catch — 응답과 격리)
```

#### 알려진 기술 부채 (2026-03-10 업데이트)

- ~~호수 정규화 불일치~~ → **[RESOLVED]** `normalizeRoom()` + startup migration
- 독촉 크론 `=== 3/7` 조건 → 서버 다운 시 발송 누락 가능 (향후 `>= 3 && < 7` 범위 조건 권장)
- 독촉 크론 푸시 후 `Notification` DB 미기록 → 알림함 누락 (향후 `notification.create` 추가 필요)
- 모바일 JWT 클라이언트 AsyncStorage 저장 미완 → 다음 세션 완성 필요
- 인증 미들웨어 미적용 (앱 일반 API) → JWT 전체 확산 필요
- 단일 index.ts (~2200+ 라인) → 도메인별 라우터 분리 시급
- 업로드 파일 로컬 저장 → S3 마이그레이션

---

### 2026-03-11 — RDD 문서화, 백엔드 모듈화 완료, 전역 JWT 인증, 전자투표 Upsert 세션

#### 아키텍처 주요 변경 사항

**백엔드 모놀리스 → 모듈형 아키텍처 전환 완료 (NF-12)**

```
backend/src/ (이전: 단일 index.ts ~2200라인)
├── index.ts             ← 라우트 등록 + 서버 시작만 담당
├── prisma.ts            ← NEW: PrismaClient 단일 인스턴스
├── helpers.ts           ← NEW: normalizeRoom, sanitizeUser, formatBillingMonth 등
├── migrations.ts        ← NEW: migrateRoomNumbers 스타트업 함수
├── cron.ts              ← NEW: 자동 독촉 크론 + 자동 청구 크론
├── routes/              ← NEW: 도메인별 Express Router
│   ├── auth.ts          (로그인/회원가입)
│   ├── villas.ts        (빌라 관리)
│   ├── invoices.ts      (청구서)
│   ├── payments.ts      (납부)
│   ├── posts.ts         (커뮤니티)
│   ├── polls.ts         (전자투표)
│   ├── vehicles.ts      (차량)
│   ├── notifications.ts (알림)
│   └── admin.ts         (SUPER_ADMIN 전용)
├── controllers/         ← NEW: 라우트 핸들러 함수
└── middlewares/         ← NEW: authenticateUser, 구독 체크 등
```

**프론트엔드 인증 레이어 신규 추가**

```
frontend/src/utils/api.ts  ← NEW: Axios 공통 인스턴스
  ├── request interceptor: AsyncStorage 'token' → Authorization 헤더 자동 주입
  └── response interceptor: 401 → multiRemove(['user','token']) + 로그인 리다이렉트

frontend/src/utils/  ← NEW 디렉토리
```

#### 데이터 모델 변경 사항

없음 (이 세션은 리팩토링 + 인증 레이어 구축 중심)

#### 아키텍처 결정: Axios interceptor vs 개별 fetch

- **선택**: Axios interceptor 기반 공통 인스턴스 (`api.ts`)
- **이유**: 35개+ 화면에서 개별 `fetch()` 호출 시 인증 헤더 누락 위험 제거, 401 처리 단일화
- **트레이드오프**: AsyncStorage 비동기 조회가 매 요청마다 발생 (MVP 규모에서 수용)
- **향후**: 토큰 메모리 캐시 도입 시 `api.ts`만 수정하면 전체 반영

#### 아키텍처 결정: 투표 수정(Upsert) 방식

- **선택**: `prisma.vote.upsert({ where: { pollId_roomNumber: ... } })`
- **이유**: 기존 `@@unique([pollId, roomNumber])` 제약을 그대로 활용 → 추가 스키마 변경 없이 Upsert 구현
- **무결성**: DB 레벨 unique가 동시 요청 시 Race Condition 없이 원자적 처리 보장

#### 알려진 기술 부채 (2026-03-11 업데이트)

- ~~단일 index.ts~~ → **[RESOLVED]** 도메인별 모듈 분리 완료 (NF-12)
- ~~모바일 JWT 클라이언트 미완~~ → **[RESOLVED]** Axios interceptor 완성 (F-08, NF-04)
- 독촉 크론 `=== 3/7` 조건 → 서버 다운 시 발송 누락 가능
- 업로드 파일 로컬 저장 → S3 마이그레이션 미완
- 구독 만료 API 접근 제한 미들웨어 미구현
- PG 결제 서버 검증 미구현

---

### 2026-03-12 — Paywall 버그 수정, 구독 만료 Cron, Ticket 시스템, 장부/이미지 실데이터 세션

#### 아키텍처 주요 변경 사항

**구독 만료 자동화 Cron 추가** (`backend/src/cron.ts`)

```
startSubscriptionExpiryCron() — cron.schedule('0 0 * * *')
  └── prisma.villa.findMany({
        where: {
          subscriptionStatus: { in: ['ACTIVE', 'FREE_TRIAL'] },
          subscriptionExpiry: { not: null, lt: now },
        }
      })
  └── prisma.villa.updateMany({ data: { subscriptionStatus: 'EXPIRED' } })
  └── 각 admin에게 푸시 알림 (sendPushToTokens)
```

**checkSubscription 미들웨어 신규** (`backend/src/middlewares/checkSubscription.ts`)

```
checkSubscription(req, res, next):
  ├── villaId = parseInt(req.params.villaId)
  ├── prisma.villa.findUnique({ select: { subscriptionStatus } })
  ├── ['ACTIVE', 'FREE_TRIAL'].includes(status) → next()
  └── else → 403 SUBSCRIPTION_EXPIRED

적용 라우트 (villaRoutes.ts):
  POST /:villaId/invoices         [authenticateUser, checkSubscription]
  POST /:villaId/building-events  [authenticateUser, checkSubscription]
  POST /:villaId/posts            [authenticateUser, checkSubscription]
  POST /:villaId/polls            [authenticateUser, checkSubscription]
  POST /:villaId/external-bills   [authenticateUser, checkSubscription]
```

**Ticket 독립 시스템 (villa 도메인 전용)**

```
Ticket 모델 (기존 schema.prisma):
  ├── id          String @id @default(uuid())
  ├── title       String
  ├── description String?
  ├── category    String?   (COMMON_FACILITY | PARKING | NOISE_COMPLAINT | ETC)
  ├── status      String    (PENDING | IN_PROGRESS | RESOLVED)
  ├── villaId     Int → Villa
  ├── residentId  String → User
  └── createdAt   DateTime

API 라우트 (villaRoutes.ts):
  POST /:villaId/tickets
  GET  /:villaId/tickets
  PATCH /:villaId/tickets/:ticketId/status

화면 구조:
  TicketListScreen
    ├── Admin: 전체 목록 조회, 탭 → 상태 변경 (ActionSheet/Alert)
    └── Resident: residentId 필터링으로 본인 민원만 조회

  CreateTicketScreen
    └── 카테고리 칩 → 제목 → 설명 → POST /api/villas/:villaId/tickets
```

**Ledger 실데이터 연동 아키텍처**

```
신규 엔드포인트 (villaController.ts):
  GET  /api/villas/:villaId/ledger
    └── prisma.ledgerTransaction.findMany({ where: { villaId }, orderBy: { date: 'desc' } })
    └── 반환: transactions 배열

  POST /api/villas/:villaId/ledger
    └── { date, type('INCOME'|'EXPENSE'), title, amount, memo? }
    └── prisma.ledgerTransaction.create(...)

LedgerScreen 아키텍처 변경:
  이전: 하드코딩된 TRANSACTIONS 더미 배열
  이후: useFocusEffect + api.get('/api/villas/${villaId}/ledger')
  잔액 계산: transactions.reduce(balance + INCOME - EXPENSE)
```

**403 인터셉터 재진입 방지 아키텍처** (`frontend/src/utils/api.ts`)

```
모듈 레벨:
  let isHandlingSubscriptionExpiry = false

response interceptor (403):
  ├── isHandlingSubscriptionExpiry === true → 조기 반환 (reject)
  ├── currentRoute.name === 'AdminSubscription' → 조기 반환 (reject)
  ├── isHandlingSubscriptionExpiry = true
  ├── navigation.dispatch(reset { AdminSubscription, params: { villaId, ... } })
  └── onPress 콜백 내에서 isHandlingSubscriptionExpiry = false 리셋
```

#### 데이터 모델 변경 사항

**User 모델 변경**
```
User:
  ├── phone       String? @unique  ← 유지
  └── phoneNumber String?          ← 제거 (prisma db push --accept-data-loss)
```

#### 신규 엔드포인트 (2026-03-12 추가)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/villas/:villaId/ledger` | 장부 거래 내역 조회 |
| `POST` | `/api/villas/:villaId/ledger` | 장부 거래 내역 추가 |

#### 신규 화면 및 네비게이션 업데이트

```
AppNavigator (Stack) — 2026-03-12 추가분:
├── TicketList (Stack)    ← 민원 목록 (Admin: 전체 / Resident: 본인)
└── CreateTicket (Stack)  ← 민원 접수 (모든 역할)

ManagementScreen — 메뉴 추가:
└── "민원 및 수리 요청" → hammer-outline 아이콘 → TicketList 이동

ResidentDashboardScreen — 위젯 추가:
└── "민원 및 수리 요청" 카드 → TicketList 이동
```

#### 알려진 기술 부채 (2026-03-12 업데이트)

- ~~구독 만료 API 접근 제한 미들웨어 미구현~~ → **[RESOLVED]** checkSubscription 완성 (F-68)
- ~~공용 장부 더미 데이터~~ → **[RESOLVED]** LedgerTransaction DB 실 연동 (F-55)
- ~~구독 만료 자동 처리 없음~~ → **[RESOLVED]** startSubscriptionExpiryCron 추가
- checkSubscription 미적용 라우트 잔존 (tickets, ledger 생성 등)
- 독촉 크론 `=== 3/7` 조건 → 서버 다운 시 발송 누락 가능
- 업로드 파일 로컬 저장 → S3 마이그레이션 미완
- PG 결제 서버 검증 미구현

---

## 프로젝트 진행 기록 (2026-04-04)

### 1. 아키텍처 변경점

#### NestJS 완전 제거 → Next.js 15 풀스택 전환
- **배경**: Railway 유료 비용 문제로 Vercel 단일 배포로 결정
- **변경 전**: NestJS (Railway) + Next.js (Vercel) 분리 구조
- **변경 후**: Next.js 15 App Router + Route Handlers 단일 앱, `apps/api` 디렉토리 삭제
- **영향**: NestJS의 Guards/Decorators 패턴 → 미들웨어/헬퍼 함수 패턴으로 대체

#### JWT 인증 미들웨어 (`middleware.ts`)
- `jose` 라이브러리 사용 (jsonwebtoken 대신) — Edge Runtime 호환
- `PUBLIC_API` 배열로 공개 라우트 예외 처리 (`@Public()` 데코레이터 대체)
- 검증된 페이로드를 `x-user-id / x-user-role / x-user-email / x-user-villa-id` 헤더로 하위 라우트에 주입

#### Vercel Cron Jobs
- `vercel.json`에 Cron 스케줄 정의 (NestJS `@nestjs/schedule` 대체)
- `/api/cron/invoice-reminder` — 매일 01:00 미납 3/7일차 독촉
- `/api/cron/expire-subscriptions` — 매일 00:00 구독 만료 처리
- CRON_SECRET 환경변수로 외부 호출 방어

#### 구독 가드 패턴 (`lib/subscription.ts`)
- `requireActiveSubscription(villaId)` — EXPIRED 빌라에서 유료 기능 호출 시 403 반환
- NestJS `SubscriptionGuard` 데코레이터 패턴 → 라우트 핸들러 최상단 호출 패턴

### 2. 데이터 모델 변경

#### `InvoicePayment` 스키마 수정
- `residentRecordId`: `String` → `String?` (nullable) + `onDelete: SetNull`
- `roomNumber String` 필드 추가 — 전출 후에도 호수 이력 보존
- 유니크 제약: `@@unique([invoiceId, residentRecordId])` → `@@unique([invoiceId, roomNumber])`
- **이유**: 입주민 전출(DELETE ResidentRecord) 시 FK 제약으로 청구 이력이 삭제되는 버그 수정

### 3. 기술 부채

| 항목 | 설명 | 우선순위 |
|------|------|---------|
| F-26 자동 발행 Cron | `autoPublishDay` 필드 기반 Cron 미구현 | Phase 1 잔여 |
| NF-07 TypeScript strict | strict 미활성화 상태 | Phase 1 잔여 |
| SubscriptionGuard 미적용 | 헬퍼 함수 존재하나 기존 라우트에 아직 적용 안 됨 | Phase 1 |

---

## 2026-04-04 업데이트

### 1. Route Group 충돌 해결

**문제**: `(admin)` 과 `(resident)` 라우트 그룹이 `/home`, `/community`, `/profile` 등 동일 URL 경로를 공유하여 7개 경로 충돌 발생.

**해결**: `(resident)` 의 중복 경로를 `/resident/*` prefix로 이동.
```
변경 전 (충돌):
  (admin)/home        → /home
  (resident)/home     → /home  ← 충돌

변경 후 (해결):
  (admin)/home        → /home
  (resident)/home     → /resident/home
  (resident)/community → /resident/community
  (resident)/profile  → /resident/profile
```
BottomNav, join 리다이렉트 등 모든 참조 일괄 업데이트.

### 2. 빌라 등록 시 역할 자동 승격 패턴

`POST /api/villas` 에서 role이 RESIDENT인 사용자가 빌라를 등록할 경우:
1. 빌라 생성 성공
2. DB에서 `User.role = ADMIN`으로 업데이트
3. 새 JWT(`role: ADMIN`) 발급 → 응답에 포함

```typescript
// 역할 승격 후 새 토큰 발급 패턴
if (user.role !== 'ADMIN') {
  await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
}
const newToken = await signToken({ ...user, role: 'ADMIN', villaId: villa.id });
return ok({ villa, token: newToken });
```

### 3. CSRF 방어 레이어 (`middleware.ts`)

Origin/Referer 검증 레이어 추가:
- `NEXT_PUBLIC_APP_URL` 환경변수 기반 허용 Origin 판별
- localhost/127.0.0.1은 개발 예외 처리
- `Authorization` 헤더 포함 요청(API 클라이언트)은 검증 면제
- `GET/HEAD/OPTIONS` 메서드는 CSRF 검증 제외

### 4. Cron KST 타임존 처리 패턴

Vercel Cron은 UTC 기준으로 동작. KST(UTC+9)로 맞추려면:
```typescript
// vercel.json: "0 15 * * *" = KST 00:00 (UTC 15:00)
// 코드에서 KST 날짜 계산:
const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
const kstDay = kstNow.getUTCDate(); // KST 기준 일(day)
```

### 5. 자동 청구서 발행 Cron (`/api/cron/publish-invoices`) 신규

- `Villa.autoPublishDay === kstDay` 매칭 빌라 대상
- `InvoicePayment` 생성 시 `roomNumber` 포함 (전출 이력 보존)
- `$transaction` 원자적 처리 → 성공 후 admin에게 알림 발송
- `vercel.json`: `"0 15 * * *"` (KST 00:00) 등록

### 알려진 기술 부채 (2026-04-04 업데이트)

| 항목 | 설명 | 우선순위 |
|------|------|---------|
| N+1 쿼리 | invoice-reminder에서 미납 세대별 알림 중복 조회 | Medium |
| 금액 0 청구서 독촉 | 금액 0인 InvoicePayment도 독촉 대상 포함 | Low |
| 알림 API 페이지네이션 | `take: 50` 하드코딩 | Low |
| 초대 코드 Rate Limit | 브루트포스 방어 없음 | Low |
| CSRF 방어 검증 | Next.js 기본 보호 범위 확인 필요 | Phase 1 |

---

## 2026-04-05 업데이트

### 아키텍처 변경점

#### 1. PG 결제 레이어 추가 (PortOne)

결제 검증은 반드시 **서버 사이드**에서 수행. 클라이언트 콜백의 `imp_uid`만 신뢰하지 않음.

```
클라이언트 IMP.request_pay() 완료
  → imp_uid 수신
  → POST /api/.../payments/[paymentId]/verify
    → PortOne REST API 토큰 발급 (POST /users/getToken)
    → PortOne 결제 정보 조회 (GET /payments/:imp_uid)
    → 금액 일치 검증 + status === 'paid' 확인
    → DB InvoicePayment.status = PAID 갱신
```

**PortOne 환경변수 3개 필수:**
- `PORTONE_IMP_KEY` / `PORTONE_IMP_SECRET` — 서버 전용
- `NEXT_PUBLIC_PORTONE_IMP_CODE` — 클라이언트 IMP.init()용

#### 2. 공개(비인증) 결제 라우트 추가

`/pay/[billId]` — JWT 없이 접근 가능한 외부 청구 결제 페이지

```typescript
// middleware.ts PUBLIC_API 목록
const PUBLIC_API = ['/api/auth/', '/api/cron/', '/api/pay/'];
```

`/api/pay/[billId]` (GET) 및 `/api/pay/[billId]/confirm` (POST)는 인증 미들웨어 우회. ExternalBilling을 billId로 직접 조회.

#### 3. 전역 타입 선언 파일 도입

`apps/web/types/globals.d.ts` — PortOne SDK(`window.IMP`) 및 카카오 우편번호(`window.daum`) 타입을 한 곳에서 관리. 여러 파일에서 `declare global`을 중복 선언하면 TypeScript 충돌 발생.

```typescript
// types/globals.d.ts 구조
declare global {
  interface PortOneResponse { ... }
  interface Window {
    IMP: { init, request_pay }
    daum: { Postcode }
  }
}
export {};
```

#### 4. Vercel 배포 구성 확정

- `vercel.json` 위치: `apps/web/vercel.json` (rootDirectory와 동일한 위치)
- Vercel 대시보드 Root Directory: `apps/web`
- Build Command: `prisma generate && next build`
- Output Directory: `.next`
- Cron 3개 등록: invoice-reminder(01:00), expire-subscriptions(00:00), publish-invoices(15:00 UTC)

#### 5. DB 마이그레이션 전략 — `prisma db push` 채택

migration 파일 없이 `prisma db push`로 스키마를 DB에 직접 동기화. 이전 코드베이스에서 마이그레이션 이력 없이 테이블이 생성된 이력으로 인해 `prisma migrate dev` 사용 불가 (Drift 오류).

**스키마 변경 시 로컬 절차:**
```bash
npx prisma db push   # DB 반영
# Vercel은 postinstall: "prisma generate" 로 클라이언트만 재생성
```

### 알려진 기술 부채 (2026-04-05 추가)

| 항목 | 설명 | 우선순위 |
|------|------|---------|
| 마이그레이션 파일 부재 | `prisma db push` 사용으로 rollback 이력 없음 | Medium |
| `/api/upload` TODO | Supabase Storage 업로드 미구현 — 파일 첨부 기능 전반 영향 | High |

---

## 2026-04-07 업데이트

### 아키텍처 변경점

#### 1. 민원(Ticket) 도메인 신설

커뮤니티(Post)와 별도 도메인으로 Ticket 엔티티 분리. 상태 머신(PENDING→IN_PROGRESS→RESOLVED)을 서버에서 단방향으로 강제.

```
입주민 POST /api/villas/[villaId]/tickets
  → Ticket(status=PENDING) 생성

관리자 PATCH /api/villas/[villaId]/tickets/[ticketId]
  → 상태 전환 검증 (VALID_TRANSITIONS 맵)
  → DB 업데이트
  → notifyTicketStatusChange() 호출 → Notification 생성
```

**라우트 권한 분리:**
- GET `/tickets` — ADMIN: 빌라 전체 조회 / RESIDENT: 본인 것만
- PATCH `/tickets/[id]` — ADMIN 전용 (403 for non-admin)

#### 2. notify.ts 알림 유틸 확장

기존 `createNotification` / `createNotificationForVilla`에 `notifyTicketStatusChange` 추가.
`NotificationType.TICKET` 타입 활용 (스키마에 이미 정의되어 있었음).

#### 3. 루트 URL 랜딩 페이지 추가

`apps/web/app/page.tsx` 신설. 인증 분기 패턴:

```typescript
// localStorage 기반 (클라이언트 컴포넌트)
token 없음 → 랜딩 페이지 렌더
token 있음 → role 기반 redirect
  SUPER_ADMIN → /backoffice/dashboard
  RESIDENT    → /resident/home
  ADMIN       → /home
```

### 알려진 기술 부채 (2026-04-07 추가)

| 항목 | 설명 | 우선순위 |
|------|------|---------|
| Ticket 알림 비동기 처리 없음 | `notifyTicketStatusChange`가 PATCH 응답 전 동기 실행 — 알림 DB 저장 실패 시 응답 지연 가능 | Low |
| 루트 랜딩 깜빡임 | `checking` state 초기값 true로 빈 화면 후 렌더 — 느린 기기에서 레이아웃 shift 발생 가능 | Low |
| PortOne 환경변수 미설정 시 결제 불가 | 키 없어도 빌드는 됨, 런타임에만 502 반환 | High (운영 전) |

---

## 2026-04-07 버그 수정 세션

### 1. Supabase PgBouncer prepared statement 오류 (운영 이슈)

- **증상**: `prisma.post.findFirst()` 등 실행 시 `PostgresError { code: "26000", message: "prepared statement does not exist" }` 발생
- **원인**: `DATABASE_URL`이 Supabase 풀러(`pooler.supabase.com:5432`)를 가리키는데, Prisma가 기본적으로 prepared statement 사용 → PgBouncer 트랜잭션 모드에서 미지원
- **해결**: Vercel 환경변수 `DATABASE_URL` 끝에 `?pgbouncer=true` 추가
- **참고**: `directUrl`은 스키마 마이그레이션(`prisma db push`)에만 사용되므로 영향 없음
- **패턴**: 이 오류는 간헐적으로 발생하므로 처음엔 랜덤 500처럼 보임 — 로그에서 code: "26000" 확인 필수

### 2. localStorage StoredUser 구조 확정

저장된 유저 오브젝트의 올바른 구조:

```typescript
StoredUser {
  id, name, email, role
  villa?: {
    id, name, address, inviteCode, subscriptionStatus
  }  // ADMIN의 관리 빌라, RESIDENT의 소속 빌라
  residentVilla?: {
    id, name, address, inviteCode, subscriptionStatus, roomNumber
  }  // ADMIN이 입주민으로도 가입한 경우 (듀얼 모드)
  viewMode?: 'admin' | 'resident'
}
```

**올바른 접근 패턴:**
- Admin 페이지: `user.villa?.id`
- Resident 페이지: `user.residentVilla?.id ?? user.villa?.id`
- **안티패턴**: `user.villaId` — 존재하지 않는 최상위 필드 (10개 파일에서 동시 발생한 버그)

### 3. 대시보드 fetch 에러 처리 분리

`(admin)/home/page.tsx`: `.catch(() => setNeedsSetup(true))`가 서버 500 에러도 "빌라 미등록" 화면으로 처리하던 문제.
- `fetchError` 상태 별도 분리 → "데이터를 불러오지 못했습니다" + 재시도 버튼
- `needsSetup`은 API가 명시적으로 `{ needsSetup: true }` 반환 시에만 표시

### 4. 하단 고정 버튼 BottomNav 겹침

`BottomNav`: `h-14 fixed bottom-0 z-50`. 폼 제출 버튼도 `fixed bottom-0`으로 겹쳤던 문제.
- **수정**: `fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-lg`
- **영향 파일**: community/new, resident/community/new, villa/tickets/new, manage/invoices/new

### 알려진 기술 부채 (2026-04-07 추가)

| 항목 | 설명 | 우선순위 |
|------|------|---------|
| PgBouncer 설정 미적용 | DATABASE_URL에 `?pgbouncer=true` 미설정 시 간헐적 prepared statement 오류 | Critical (운영) |
| API catch 블록 에러 삼킴 | 다수의 API 라우트가 `catch { }` 또는 `catch (e) {}` — 원인 파악 불가 | Medium |

---

## 2026-04-10 아키텍처 변경 기록

### 1. Supabase Storage 이미지 업로드 활성화

- `/api/upload/route.ts` stub → 완전 구현
- **버킷**: `posts` (Public 설정 필요)
- **파일명 패턴**: `posts/{timestamp}-{UUID}.{ext}`
- **서버 사이드**: `@supabase/supabase-js` createClient + SUPABASE_SERVICE_ROLE_KEY 사용
- **파일 타입**: jpeg/png/webp/gif 화이트리스트, 5MB 제한
- F-48(게시글 이미지), 향후 F-64(영수증), F-68(건물이력 사진) 공용 엔드포인트

### 2. 투표 시스템 API 완전 구현

기존 stub이었던 3개 라우트 모두 완성:

| 라우트 | 변경 |
|--------|------|
| `GET/POST /api/villas/[villaId]/polls` | stub → 완전 구현 |
| `GET /api/villas/[villaId]/polls/[pollId]` | stub → 완전 구현 |
| `POST /api/villas/[villaId]/polls/[pollId]/vote` | stub → 완전 구현 |

**1세대 1표 강제 구조**:
- DB: `Vote.@@unique([pollId, roomNumber])` — 이미 스키마에 존재
- API: Prisma P2002(unique constraint) 캐치 → 409 Conflict 반환

**권한 계층**:
- 투표 생성: `villa.adminId === user.sub` (동대표 전용)
- 투표 참여: `residentType === 'HEAD'` + `status === 'APPROVED'` (승인된 세대주)
- 결과 조회: 모든 빌라 구성원 (기명 호수 목록은 admin 또는 마감 후만)

### 3. 리소스 필터링 API 패턴 추가

```
GET /api/villas/[villaId]/posts/my
```

`/my` suffix 패턴 — 현재 인증 사용자의 리소스만 반환. posts 도메인 최초 적용. 향후 tickets/my 등 확장 가능.

### 4. 입주민 빌라 허브 페이지 구현

`/villa/page.tsx` stub → 메뉴 허브 페이지로 완성. 전자투표/청구서/민원/장부/건물이력 5개 메뉴 진입점. 관리자의 `/manage` 페이지와 동일한 카드 메뉴 패턴 적용.

### 5. 기술 부채 해소

| 항목 | 이전 | 현재 |
|------|------|------|
| `/api/upload` | TODO stub | ✅ Supabase Storage 완전 구현 |
| 투표 API 3개 | TODO stub | ✅ 완전 구현 |
| 투표 UI (admin/resident) | 제목만 있는 빈 페이지 | ✅ 완전 구현 |
| `.claude/settings.local.json` git 추적 | Git 추적 중 (push 차단) | ✅ `git rm --cached`로 영구 제거 |

---

## 2026-04-11 업데이트

### 1. 아키텍처 변경점

**차량 관리 도메인 신규 추가**
- `Vehicle` 모델 기존 스키마에 존재 → API + UI 완전 구현
- `GET/POST /api/villas/[villaId]/vehicles` — 목록/검색/등록
- `DELETE /api/villas/[villaId]/vehicles/[vehicleId]` — 삭제
- 번호판 검색은 `?plate=` 쿼리 파라미터로 부분 일치 검색 (별도 엔드포인트 없이 GET에 통합)

**장부 도메인 완전 구현**
- `LedgerTransaction` 모델 기존 스키마 → API + UI 완전 구현
- `GET/POST /api/villas/[villaId]/ledger` — 월별 필터 + summary 포함
- 입주민(조회 전용) / 관리자(등록 가능) 권한 분기

**결제 확인 엔드포인트 Rate Limiting 추가**
- `/api/pay/[billId]/confirm` — 인메모리 Map 기반 billId당 1분 5회 제한
- ⚠️ 서버리스 인스턴스 간 공유 불가 — Upstash Redis 전환 시 교체 필요

### 2. API 변경

| 엔드포인트 | 변경 내용 |
|-----------|----------|
| `GET /polls` | `totalHouseholds` 필드 추가 (HEAD + APPROVED 세대수) |
| `GET /tickets` | ADMIN 소속 빌라 검증 추가 (`villa.adminId !== user.sub` → 403) |
| `GET /dashboard` | `?role` 쿼리 파라미터 제거 — JWT role만 신뢰 |
| `POST /upload` | 매직 바이트 MIME 검증 추가 (바이너리 레벨) |
| `GET /notifications` | `take:50` → cursor 기반 페이지네이션 (`limit`, `cursor`, `nextCursor`) |
| `GET /villas/[villaId]/ledger` | 신규: 월별 장부 조회 + summary |
| `POST /villas/[villaId]/ledger` | 신규: 장부 등록 (관리자 전용) |
| `GET/POST /villas/[villaId]/vehicles` | 신규: 차량 목록/검색/등록 |
| `DELETE /villas/[villaId]/vehicles/[vehicleId]` | 신규: 차량 삭제 |
| TODO API 4개 | 200 OK → 501 반환 (ledger 제외 building-events, activate-coupon, polls/remind) |

### 3. 보안 개선

| 항목 | 내용 |
|------|------|
| `?role=ADMIN` 우회 | dashboard API에서 쿼리 파라미터 role 무시 |
| MIME 스니핑 | 업로드 시 매직 바이트 실제 검증 |
| Rate Limit | 결제 확인 API 인메모리 제한 |
| 알림 비동기 분리 | 티켓 상태 변경 알림 실패가 200 응답에 영향 안 주도록 |

### 4. Cron 스케줄 교정

```
invoice-reminder:    "0 1 * * *"  →  "0 15 * * *" (KST 00:00)
expire-subscriptions: "0 0 * * *"  →  "0 15 * * *" (KST 00:00)
publish-invoices:     "0 15 * * *"  (이미 올바름)
```

---

## 2026-04-11 (2차) 업데이트 — F-66~69, F-41/42, F-59/60, F-09, F-76, F-78/79

### 1. 아키텍처 변경

**백오피스 네임스페이스 신규 추가**
- `/api/backoffice/` 경로로 SUPER_ADMIN 전용 API 분리
- 일반 앱 세션(`token`/`user`)과 완전 분리된 `bo_token`/`bo_user` localStorage 키 사용
- `lib/backoffice-auth.ts` 신규 — `getBoUser()`, `getBoToken()`, `boAuthHeaders()`, `clearBoAuth()`
- `middleware.ts`: `/api/backoffice/auth/` PUBLIC_API 배열에 추가 (로그인 엔드포인트 인증 우회)
- 백오피스 레이아웃: `BackofficeGuard` 클라이언트 사이드 가드 (로그인 미완료 시 `/backoffice/login` 리다이렉트)
- ⚠️ 서버 사이드 인증 없음 — 클라이언트 가드만 존재 (기술 부채)

**ImageViewer 포털 컴포넌트 신규**
- `components/ui/ImageViewer.tsx` — `createPortal`로 `document.body`에 마운트
- z-index 999, 배경 블러, ESC 키 닫기, 배경 클릭 닫기
- `body.overflow = 'hidden'` 마운트/언마운트 시 토글
- 영수증(장부), 건물 이력 사진 뷰어로 공통 사용

**건물 이력(BuildingEvent) 도메인 활성화**
- `BuildingEvent` 모델은 기존 스키마에 존재, API + UI 구현
- `BuildingEventCategory` enum: REPAIR / INSPECTION / CONTRACT / CLEANING / ETC

**Cron 2개 신규 추가**
```
poll-reminder:          "0 15 * * *" — 마감 24시간 전 미참여 세대주 자동 독촉
subscription-reminder:  "0 15 * * *" — 구독 만료 D-7/D-3/D-1 관리자 알림
```
`vercel.json` crons 배열에 추가됨.

**회원 탈퇴(소프트 삭제) 아키텍처**
- 실제 레코드 삭제 없음 — 개인정보 익명화
- `name` → "탈퇴 회원", `email` → `deleted_{id}@villamate.invalid`, `password` → bcrypt(UUID), `phone` → null
- 탈퇴 회원 판별: `email.endsWith('@villamate.invalid')`
- ADMIN이 빌라를 관리 중이면 탈퇴 불가 (400 반환, 위임 먼저 요구)

### 2. API 변경

| 엔드포인트 | 변경 내용 |
|-----------|----------|
| `GET /api/villas/[villaId]/building-events` | 신규: 카테고리 필터, 관리자+승인입주민 접근 |
| `POST /api/villas/[villaId]/building-events` | 신규: 관리자 전용 등록, 사진 URL 포함 |
| `PATCH /api/villas/[villaId]/polls/[pollId]` | 신규: 마감 전 제목/설명/익명/종료일 수정 (선택지 수정 불가) |
| `POST /api/villas/[villaId]/polls/[pollId]/remind` | 신규: 미참여 세대주 수동 독촉 알림 |
| `POST /api/villas/[villaId]/posts` | 변경: `isNotice: true` 시 전체 입주민 SYSTEM 알림 fire-and-forget |
| `DELETE /api/auth/me` | 신규: 회원 탈퇴 (익명화) |
| `GET /api/cron/poll-reminder` | 신규: 마감 24h 전 자동 독촉 Cron |
| `GET /api/cron/subscription-reminder` | 신규: 구독 만료 D-7/3/1 알림 Cron |
| `POST /api/backoffice/auth/login` | 신규: SUPER_ADMIN 전용 JWT 로그인 |
| `GET /api/backoffice/villas` | 신규: 전체 빌라 목록 (상태·이름 필터) |
| `PATCH /api/backoffice/villas/[id]` | 신규: 구독 상태·만료일 수동 변경 |
| `GET /api/backoffice/users` | 신규: 전체 사용자 목록 (역할·이름 필터) |

### 3. 데이터 모델

스키마 변경 없음. 기존 `BuildingEvent` 모델 활용.

### 4. 기술 부채 (신규 추가)

| 항목 | 위험도 | 비고 |
|------|--------|------|
| 백오피스 서버 사이드 인증 없음 | High | `BackofficeGuard` 클라이언트 전용 — JS 비활성화 시 우회 가능 |
| 건물 이력 사진 `posts` 버킷 공유 | Medium | 전용 `building-events` 버킷 분리 권장 |
| 공지 푸시 알림 fire-and-forget 로그 없음 | Low | 발송 실패 시 추적 불가 |

## 2026-04-12 아키텍처 변경

### 신규 레이어: 백오피스 콘텐츠 관리
- 플랫폼 운영자(SUPER_ADMIN)가 관리하는 3개 콘텐츠 테이블 추가: `SystemNotice`, `Faq`, `Guide`
- 백오피스 API 패턴 확립: `/api/backoffice/**` — 전 엔드포인트 `role !== 'SUPER_ADMIN'` 검증
- 공개 조회 API 분리: `/api/faqs`, `/api/notices`, `/api/guides` — 인증 없이 접근 가능

### KPI 집계 아키텍처
- DB 집계 패턴 도입: `prisma.villa.groupBy()` + `prisma.$queryRaw` (DATE_TRUNC)
- 전체 테이블 메모리 로드 → DB 수준 집계로 전환, 규모 확장성 확보
- 대시보드 단일 API 원칙: 3개 분리 호출 → `/api/backoffice/kpi` 단일 엔드포인트

### 보안 강화
- CSP 헤더 `next.config.ts` 전역 적용 (X-Frame-Options DENY, X-XSS-Protection, Referrer-Policy)
- Tiptap HTML 콘텐츠: 저장 시(백오피스) + 렌더링 시(입주민) 이중 DOMPurify sanitize
- BackofficeGuard: `checked` 상태 패턴 도입 → SSR 플리커 없이 인증 확인 전 렌더 차단

### 테스트 인프라
- Jest + ts-jest 도입 (`jest.config.ts`, `moduleNameMapper @/*`)
- 테스트 헬퍼 패턴: `makeRequest()` + `authHeaders()` (x-user-* 헤더 인증 주입)
- 커버리지: auth/posts/polls/tickets/ledger 5개 도메인, 32개 케이스

---

## 2026-04-13 업데이트 — F-43/F-77/F-04/F-05 Phase 3 선행 구현

### 신규 Prisma 모델

| 모델 | 목적 | 주요 필드 |
|------|------|-----------|
| `PushSubscription` | Web Push 구독 | userId, endpoint, p256dh, auth, villaId |
| `TossBillingKey` | Toss 자동결제 빌링키 | villaId (unique), billingKey, customerKey, cardCompany, cardNumber |
| `SocialAccount` | 소셜 계정 연결 | userId, provider, providerId — `@@unique([provider, providerId])` |

### User.password nullable 변경
- `User.password String?` — 소셜 전용 계정 지원
- 이메일 로그인 라우트(`/api/auth/login`, `/api/backoffice/auth/login`, `/api/auth/password`)에 `!user.password` null 체크 추가
- 소셜 계정 이메일 로그인 시 동일 오류 메시지 반환으로 계정 존재 여부 은닉

### Web Push 아키텍처 — Lazy Init 패턴
```ts
// lib/webpush.ts
function getWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return null;
  webpush.setVapidDetails('mailto:support@villamate.app', publicKey, privateKey);
  return webpush;
}
```
- **이유**: `setVapidDetails()`를 모듈 최상위에서 호출하면 Vercel 빌드 시(env 없음) 에러 발생
- **원칙**: 런타임 의존 초기화는 함수 내부에서 수행, null guard로 env 미설정 시 graceful degradation

### OAuth 2.0 구현 아키텍처
- **state CSRF 방어**: `crypto.randomUUID()`로 state 생성 → `HttpOnly SameSite=Lax` 쿠키 저장 → 콜백 시 검증
- **유저 upsert 패턴**: `SocialAccount.findUnique` → 없으면 `User.create` + `SocialAccount.create` → 있으면 기존 user로 로그인
- **신규 소셜 유저 플래그**: JWT에 `needsSetup: true` 포함 → `/profile-setup`으로 라우팅

### BottomNav z-index 계층 확립 (디자인 시스템)
```
BottomNav    z-50   (fixed bottom-0)
Toast        z-60   (bottom-20 이상)
Sheet BG     z-70   (backdrop dim)
Sheet Panel  z-80   (content)
ImageViewer  z-[999] (fullscreen)
```
- **규칙**: 모달/시트 신규 구현 시 반드시 이 계층 따를 것
- **Toast 위치**: `bottom-20` 이상으로 배치해 BottomNav 위에 표시

### 신규 Vercel Cron
| 경로 | 스케줄 | 목적 |
|------|--------|------|
| `/api/cron/auto-payment` | `0 0 * * *` (UTC) | 만료 빌라 Toss 자동결제 |


---

## 2026-04-14 업데이트 — Sprint 4 (F-49/50/65/72/84/85/F-14/15)

### 신규 Prisma 모델

| 모델 | 목적 | 주요 필드 | 제약 |
|------|------|-----------|------|
| `PostLike` | 게시글 좋아요 토글 | postId, userId | `@@unique([postId, userId])` — 1인 1좋아요 강제 |
| `EnergyUsage` | 월별 에너지 사용량 | villaId, year, month, electricKwh, electricFee, waterTon, waterFee, gasM3, gasFee | `@@unique([villaId, year, month])` — upsert 패턴 |

### 기존 모델 필드 추가

| 모델 | 추가 필드 | 이유 |
|------|-----------|------|
| `Vehicle` | `visitorName String?` | QR 방문 차량 등록 시 방문자 이름 저장 |
| `Post` | `likes PostLike[]` | 역관계 |
| `User` | `postLikes PostLike[]` | 역관계 |
| `Villa` | `energyUsages EnergyUsage[]` | 역관계 |

### 아키텍처 변경점

#### 1. 신규 라우트 (관리자)
```
/manage/energy              — 에너지 사용량 입력·차트 (ADMIN 전용)
/profile/my-villas          — 멀티 빌라 목록·전환 (ADMIN 전용)
/profile/transfer-admin     — 동대표 교체 (ADMIN 전용)
```

#### 2. 신규 라우트 (입주민)
```
/villa/energy               — 에너지 사용량 열람 (RESIDENT 전용)
```

#### 3. 신규 라우트 (공개 — 인증 없음)
```
/qr-vehicle?v=villaId&t=token   — QR 방문 차량 등록 (비로그인 접근 가능)
```
- `PUBLIC_PATHS` 배열에 `/qr-vehicle` 추가 필요 (middleware.ts JWT 예외 처리)

#### 4. 신규 라우트 (백오피스)
```
/billing                    — 빌라별 청구 현황 (SUPER_ADMIN)
/mrr                        — MRR/ARR 모니터링 (SUPER_ADMIN)
```

### QR 방문 차량 — JWT 위임 패턴
```
관리자 → GET /api/villas/[villaId]/vehicles/qr-token
         → SignJWT({ villaId, purpose: 'visitor-vehicle' }, 24h 만료)
         → QRCode.toDataURL(URL)로 QR 이미지 생성 (클라이언트 사이드)

방문자 → /qr-vehicle?v=villaId&t=token 접속
        → POST /api/villas/[villaId]/vehicles/visitor (인증 없음)
          - JWT 검증: purpose === 'visitor-vehicle' && payload.villaId === villaId
          - Vehicle upsert (ownerId = villa.adminId, isVisitor = true)
```
**원칙**: 단기 JWT를 URL에 포함시켜 비로그인 사용자에게 제한된 권한 위임.

### 동대표 교체 — 원자적 트랜잭션
```ts
await prisma.$transaction([
  prisma.villa.update({ where: { id }, data: { adminId: newAdminId } }),
  prisma.user.update({ where: { id: oldAdminId }, data: { role: 'RESIDENT' } }),
  prisma.user.update({ where: { id: newAdminId }, data: { role: 'ADMIN' } }),
])
```
**원칙**: 역할 이양은 반드시 트랜잭션 — 중간 실패 시 기존 관리자 권한 보존.

### 멀티 빌라 전환 — JWT 갱신 패턴
```
POST /api/auth/switch-villa { villaId }
→ villa.adminId === user.sub 검증
→ signToken({ ...기존 payload, villaId: newVillaId })
→ 클라이언트: saveToken(newToken) + setUser({ ...user, villa: newVilla })
→ router.push('/home')
```
**원칙**: 빌라 전환 = JWT의 villaId 교체. 새 토큰 발급으로 전체 권한 컨텍스트 갱신.

### CSS 바 차트 패턴 (no recharts)
```tsx
// 각 막대 높이 = (value / maxValue) * 100%
<div style={{ height: `${(val / maxVal) * 100}%` }} />
```
**원칙**: 외부 차트 라이브러리 없이 CSS height% 계산으로 구현. 번들 크기 0 추가.

### 신규 npm 패키지
| 패키지 | 용도 |
|--------|------|
| `qrcode` | 클라이언트 사이드 QR 코드 이미지 생성 (`QRCode.toDataURL()`) |

---

## 2026-04-15 아키텍처 변경 — 보안 QA 및 디자인 QA

### JWT URL 노출 제거 → HttpOnly 쿠키 교환 패턴
**변경 전**: 소셜 로그인 콜백이 `?token=JWT` URL 파라미터로 JWT를 전달 → URL 히스토리·서버 로그 노출 위험
**변경 후**: 2단계 교환 패턴
```
1. /api/auth/callback/[provider] → pending_auth_token HttpOnly 쿠키 설정 (60초 maxAge)
2. 클라이언트 /(auth)/auth/social/page.tsx → GET /api/auth/exchange-token 호출
3. exchange-token: 쿠키 소비 + JWT를 JSON 응답으로 반환 (1회성)
4. 클라이언트: saveToken(jwt) → localStorage 저장
```
**원칙**: JWT는 절대 URL에 포함하지 않는다. HttpOnly 쿠키는 JS에서 읽을 수 없으므로 XSS 내성.

### 백오피스 미들웨어 보호 범위 확장
**변경 전**: `middleware.ts` matcher = `'/api/:path*'` — API 라우트만 보호
**변경 후**: matcher = `['/api/:path*', '/backoffice/:path*']`
- `/backoffice/*` 페이지 요청도 서버 사이드에서 `bo_session` HttpOnly 쿠키 검증
- 로그인 페이지(`/backoffice/login`)는 PUBLIC_PATH_PATTERNS 예외 처리

### 빌링키 암호화 계층 추가 (AES-256-GCM)
신규 파일: `lib/crypto.ts`
```typescript
// 저장 형식: iv(24 hex chars) + authTag(32 hex chars) + ciphertext(hex)
export function encryptBillingKey(plaintext: string): string { ... }
export function decryptBillingKey(ciphertext: string): string { ... }
// BILLING_ENCRYPTION_KEY 환경변수 (64자 hex = 32바이트 키)
```
**흐름**:
- 빌링키 저장: `encryptBillingKey(rawKey)` → DB upsert
- 자동결제 실행: DB에서 읽은 후 `decryptBillingKey(stored)` → Toss API 호출

### 가격 단일 소스 (`lib/pricing.ts`)
기존에 `auto-payment` Cron과 MRR 대시보드에서 각각 하드코딩(불일치 존재)하던 가격을 단일 파일로 중앙화.
```typescript
export const SUBSCRIPTION_MONTHLY_PRICE = 19_900;  // KRW
export const SUBSCRIPTION_ORDER_NAME = 'VillaMate 월간 구독';
```

### QR 검증 엔드포인트 분리
- `GET /api/villas/[villaId]/vehicles/qr-verify` (신규): JWT 토큰 유효성만 검증, DB 기록 없음
- `POST /api/villas/[villaId]/vehicles/visitor` (기존): 실제 방문 차량 등록
- `middleware.ts` `PUBLIC_PATH_PATTERNS`에 `/qr-vehicle`, `/visitor` 추가 → 비인증 접근 허용

### 디자인 시스템 토큰 확장
`apps/web/app/globals.css` `@theme` 블록에 17개 토큰 추가:
- `neutral-600`, `neutral-800`
- `success-50/100/600/700`
- `warning-50/100/600/700`
- `error-50/100/600/700`
- `primary-200/300/400`

### `window.confirm()` / `window.alert()` 제거 패턴 확립
신규 파일: `components/ui/ConfirmDialog.tsx`, `hooks/useConfirm.tsx`
```tsx
// 사용 패턴
const confirm = useConfirm();
const ok = await confirm({ title: '삭제하시겠습니까?', variant: 'destructive' });
if (!ok) return;
```
브라우저 기본 모달 36개 인스턴스 → 커스텀 구현으로 전환. 스타일 일관성 + 테스트 가능성 확보.

### 신규 API 엔드포인트 (2026-04-15)

| 엔드포인트 | 메서드 | 설명 | 인증 |
|-----------|--------|------|------|
| `/api/auth/exchange-token` | GET | pending_auth_token 쿠키 → JWT 교환 | 쿠키 |
| `/api/villas/[villaId]/vehicles/qr-verify` | GET | QR 토큰 검증 전용 | 없음 (공개) |
| `/api/backoffice/auth/logout` | POST | bo_session 쿠키 삭제 | 없음 |

### 기술 부채 추가 (2026-04-15)

| 항목 | 위험도 | 비고 |
|------|--------|------|
| `BILLING_ENCRYPTION_KEY` Vercel 미등록 | Critical | 수동으로 Vercel Dashboard에 등록 필요 |
| 기존 평문 빌링키 DB 마이그레이션 미완료 | High | 암호화 코드 배포 후 별도 마이그레이션 스크립트 필요 |

---

### 2026-04-16 — AmountInput UX 개선, 버그 수정 세션

#### 아키텍처 변경 사항

**신규 공통 컴포넌트: `AmountInput`**

```
apps/web/components/ui/AmountInput.tsx
  ├── − / + 버튼으로 금액 조정 (단위: localStorage에서 읽은 amountStep)
  ├── 내부에 원화 suffix 표시 (예: 10,000원)
  └── stepOverride prop으로 단위 외부 지정 가능

apps/web/lib/amount-step.ts  ← 신규 유틸리티
  ├── AMOUNT_STEP_KEY = 'amountStep' (localStorage key)
  ├── DEFAULT_STEP = 10000
  ├── PRESET_STEPS = [1000, 5000, 10000, 50000, 100000]
  ├── getAmountStep(): number
  └── setAmountStep(step: number): void
```

**사용자 설정 저장 방식**: localStorage 선택 (DB 미사용)
- 금액 단위 설정은 기기/브라우저 로컬 개인 설정으로 판단
- 스키마 변경 없이 즉시 적용 가능

**적용 화면:**
- `(admin)/manage/invoices/new/page.tsx` — 세대당 금액, 변동 항목별 금액
- `(admin)/manage/external-billing/page.tsx` — 청구 금액
- `(admin)/profile/page.tsx` — 금액 단위 설정 시트 (AmountStepSheet)
- `(resident)/resident/profile/page.tsx` — 동일

#### 아키텍처 결정: 하단 시트 레이아웃 표준

모바일 최대 폭(max-w-lg) 내에 하단 시트를 제한하는 표준 패턴 확립:

```
// 올바른 패턴 (모바일 영역 내 제한)
fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg

// 잘못된 패턴 (전체 화면 가득)
fixed bottom-0 left-0 right-0
```

`(admin)/manage/residents/page.tsx`에서 잘못된 패턴 → 올바른 패턴으로 수정.

#### 알려진 기술 부채 (2026-04-16 업데이트)

| 항목 | 위험도 | 비고 |
|------|--------|------|
| `(admin)/ledger/page.tsx` ↔ `(admin)/manage/ledger/page.tsx` 코드 중복 | Low | /ledger 스텁 페이지를 완전 구현으로 대체했으나 두 경로가 동일 구현을 유지 — 리다이렉트 또는 공통 컴포넌트 추출 필요 |
| `BILLING_ENCRYPTION_KEY` Vercel 미등록 | Critical | 잔존 |
| 기존 평문 빌링키 DB 마이그레이션 미완료 | High | 잔존 |

---

## 2026-04-18 아키텍처 변경 및 버그 수정

### PortOne 결제 아키텍처 확립

외부 청구(ExternalBilling) 공개 결제 페이지(`/pay/[billId]`)의 PortOne V1 SDK 통합 아키텍처 확립.

#### 결제 흐름 (데스크탑 vs 모바일)

```
데스크탑:
사용자 → 납부 버튼 → window.IMP.request_pay() → 팝업 → 콜백(rsp)
→ rsp.success && rsp.imp_uid 확인 → POST /api/pay/[billId]/confirm

모바일 (KG Inicis 필수):
사용자 → 납부 버튼 → window.IMP.request_pay({ m_redirect_url }) → 리다이렉트
→ URL 복귀 (?imp_uid=&imp_success=) → useEffect URL 파라미터 감지
→ fetchBilling() 후 confirmPayment(impUid)
```

`m_redirect_url`은 KG Inicis 모바일 결제에서 **필수**. 누락 시 결제 후 앱으로 복귀하지 않고 무한 로딩 상태 유지.

#### CSP(Content Security Policy) — PortOne 허용 도메인 목록

`next.config.ts`에 아래 도메인이 추가되어야 PortOne SDK가 정상 동작:

| CSP 지시어 | 추가 도메인 |
|-----------|------------|
| `script-src` | `https://*.iamport.kr` |
| `style-src` | `https://*.iamport.kr` `https://*.inicis.com` |
| `img-src` | `https://*.iamport.kr` `https://*.inicis.com` |
| `connect-src` | `https://*.iamport.kr` `https://*.inicis.com` |
| `frame-src` | `https://*.iamport.kr` `https://*.inicis.com` `https://*.kcp.co.kr` `https://*.nicepay.co.kr` |

> 와일드카드 `*.iamport.kr`이 중요 — `cdn.iamport.kr`, `service.iamport.kr`, `api.iamport.kr` 등 여러 서브도메인이 사용됨.

#### PortOne PG 코드 명세

- 테스트 환경: `pg: 'html5_inicis.INIpayTest'` (MID 포함 명시 필요)
- 운영 환경: `pg: 'html5_inicis.{실제 MID}'`

#### globals.d.ts — Window.IMP 타입 확장

```typescript
// apps/web/types/globals.d.ts
interface Window {
  IMP: {
    init(impCode: string): void;
    request_pay(params: {
      pg: string;
      pay_method: string;
      merchant_uid: string;
      name: string;
      amount: number;
      buyer_name?: string;
      buyer_tel?: string;
      m_redirect_url?: string;  // ← 모바일 필수
    }, callback?: (rsp: ImpResponse) => void): void;
  };
}
```

### 전체 페이지 인증 헤더 감사 (2026-04-18)

클라이언트 컴포넌트의 `fetch()` 호출 전수 검사 결과, **GET 요청에도 Authorization 헤더 필요** 패턴이 누락된 파일 15개 발견 및 일괄 수정.

#### 누락 패턴 분류

| 패턴 | 예시 | 발생 빈도 |
|------|------|---------|
| 완전 누락 (bare GET) | `fetch(\`/api/villas/${id}/polls\`)` | 가장 많음 |
| 옵션 있으나 Authorization 없음 | `fetch(url, { method: 'DELETE' })` | 차량·입주자 삭제 |
| POST Content-Type만 있음 | `fetch(url, { headers: { 'Content-Type': 'application/json' } })` | 차량 등록 |

#### 수정된 파일 목록 (2026-04-18)

| 파일 | 수정한 API 호출 |
|------|----------------|
| `(admin)/manage/energy/page.tsx` | GET 에너지 데이터 |
| `(admin)/manage/polls/page.tsx` | GET 투표 목록 |
| `(admin)/manage/residents/page.tsx` | GET 빌라 정보, DELETE 입주자 전출 |
| `(admin)/profile/vehicles/page.tsx` | GET 목록/검색/QR토큰, POST 등록, DELETE |
| `(admin)/community/page.tsx` | GET 게시글 목록 |
| `(admin)/community/[id]/page.tsx` | GET 게시글 상세 |
| `(resident)/resident/community/page.tsx` | GET 게시글 목록 |
| `(resident)/resident/community/[id]/page.tsx` | GET 게시글 상세 |
| `(resident)/resident/profile/my-posts/page.tsx` | GET 내 게시글 |
| `(resident)/villa/polls/[id]/page.tsx` | GET 투표 상세, POST 투표 |
| `(resident)/villa/polls/page.tsx` | GET 투표 목록 |
| `(resident)/villa/tickets/page.tsx` | GET 민원 목록 |
| `(resident)/villa/vehicles/page.tsx` | GET 목록/검색, POST 등록, DELETE |

#### 재발 방지 원칙

미들웨어가 `/api/pay/`, `/api/auth/`, `/api/cron/` 이외 **모든 API 경로를 보호**하므로:
- **GET 포함 모든 `fetch('/api/...')` 호출에 Authorization 헤더 필수**
- 새 페이지 추가 시 첫 번째 동작 확인: 목록 조회 → 401이면 토큰 헤더 누락

#### 알려진 기술 부채 (2026-04-18 업데이트)

| 항목 | 위험도 | 비고 |
|------|--------|------|
| `(admin)/ledger` ↔ `/manage/ledger` 코드 중복 | Low | 잔존 |
| `BILLING_ENCRYPTION_KEY` Vercel 미등록 | Critical | 잔존 |
| 기존 평문 빌링키 DB 마이그레이션 미완료 | High | 잔존 |
| `lib/client-api.ts` 미활용 | Medium | `apiFetch/apiGet/apiPost` 헬퍼가 있으나 대부분 페이지가 raw fetch 사용 — 점진적 마이그레이션 필요 |


---

## 2026-04-19 아키텍처 변경점 (Sprint 8)

### 1. 로그인 API — Full Villa Object 반환 패턴으로 전환

**변경 전**: 로그인 API(`POST /api/auth/login`)가 `villaId` 문자열만 반환. villa 오브젝트는 온보딩/join 페이지에서 별도로 localStorage에 저장.

**변경 후**: 로그인 시 villa 전체 오브젝트 반환.
- ADMIN: `villa` 오브젝트 포함 (id/name/address/inviteCode/subscriptionStatus)
- RESIDENT: `villa` 오브젝트 포함 (approved ResidentRecord의 빌라 정보)
- ADMIN이 자신의 빌라에 APPROVED ResidentRecord가 있으면 `residentVilla` 자동 설정

**영향**: 재로그인 시 villa 정보 유실 버그 해소. 로그아웃 후 재로그인해도 듀얼 모드 유지.

### 2. 듀얼 모드(ADMIN ↔ RESIDENT) — 같은 빌라 지원으로 확장

**변경 전**: 듀얼 모드는 "관리 중인 빌라 ≠ 거주 중인 빌라" 조건만 처리.

**변경 후**: 관리자가 자신이 관리하는 빌라에 입주민으로도 등록 가능.
- `villa.id === residentVilla.id`인 경우도 `hasDualMode()` 동작
- join API에서 `villa.adminId === user.sub`이면 즉시 APPROVED 처리 (승인 단계 생략)
- 온보딩 시 "저도 이 빌라의 입주민입니다" 체크박스로 가입과 동시에 입주민 등록

### 3. CSP 확장 — Daum/Kakao 우편번호 API 허용

`next.config.ts` Content-Security-Policy 업데이트:
- `script-src`: `https://t1.daumcdn.net` 추가
- `frame-src`: `https://*.daum.net`, `https://*.daumcdn.net`, `https://*.kakao.com` 추가

Daum Postcode 서비스가 카카오로 이전되어 실제 iframe은 `postcode.map.kakao.com`에서 로드됨.

### 4. 장부 자동 기록 패턴 확립

별도 Prisma 스키마 변경 없이 `LedgerTransaction.createdBy` 필드에 `'system'` 값을 사용해 자동 기록 식별.

**트리거 지점**:
- `PATCH /invoices/[id]/payments/[id]` → 상태 PAID 전환 시
- `POST /invoices/[id]/payments/[id]/verify` → PortOne 결제 검증 통과 시
- `PATCH /external-billing/[id]/confirm` → 외부 청구 COMPLETED 처리 시

모든 자동 기록은 `createdBy: 'system'`으로 저장. 프론트엔드에서 `isAuto = (createdBy === 'system')` 계산 필드로 파생.

### 알려진 기술 부채 (2026-04-19 추가)

| 항목 | 위험도 | 비고 |
|------|--------|------|
| 로그인 API 응답 증가 | Low | villa 오브젝트 조회 쿼리 1~2개 추가. 트래픽 많을 경우 캐싱 고려 |
| Daum Postcode 동적 로딩 | Low | 버튼 첫 클릭 시 외부 스크립트 다운로드 발생 — 느린 네트워크에서 지연 가능 |

---

## 2026-04-20 아키텍처 변경 (Sprint 9 — QA 보안·안정성)

### 1. 아키텍처 변경점

#### `lib/portone.ts` 신규 공통 모듈 추출
두 결제 경로(`pay/[billId]/confirm/route.ts`, `payments/[paymentId]/verify/route.ts`)에 복붙되어 있던 `getPortOneToken` / `getPortOnePayment` 함수를 `lib/portone.ts`로 추출.
- **동기**: PortOne API 변경 시 두 경로 중 하나만 수정되어 검증 로직이 불일치할 수 있는 Critical 보안 리스크 제거
- **패턴**: `lib/` 폴더에 외부 API 클라이언트 모듈 배치 (`lib/toss.ts`, `lib/portone.ts` 등)

#### `$transaction` 원자성 패턴 일관 적용
`PATCH /invoices/.../payments/[paymentId]` 와 `POST .../verify` 두 결제 경로에서 납부 상태 업데이트 + 장부 자동 기록을 별도 쿼리로 실행하던 것을 `prisma.$transaction([update, create])` 단일 원자 트랜잭션으로 통합.
- **동기**: 납부 PAID 전환은 성공하고 장부 기록이 실패하는 데이터 불일치 위험 제거

#### `requireActiveSubscription` 가드 적용 범위 확장
기존 에너지 사용량 등록에만 적용되어 있던 구독 만료 가드를 4개 핵심 POST 엔드포인트로 확장:
- `POST /invoices` (청구서 발행)
- `POST /external-billing` (외부청구 생성)
- `POST /polls` (투표 생성)
- `POST /building-events` (건물이력 등록)

#### JWT 신뢰 범위 축소 — dashboard villaId
`GET /api/dashboard` 에서 `searchParams.get('villaId')` 제거. JWT의 `user.villaId`만 신뢰하도록 변경.
- **동기**: 클라이언트가 임의 villaId 파라미터를 전달해 타 빌라 존재 여부 탐색 가능하던 정보 노출 차단

### 2. 미해결 기술 부채 (기존 유지)

| 항목 | 위험도 | 비고 |
|------|--------|------|
| `BILLING_ENCRYPTION_KEY` Vercel 미등록 | Critical | 잔존 |
| 기존 평문 빌링키 DB 마이그레이션 | High | 잔존 |
| `lib/client-api.ts` 헬퍼 미활용 | Medium | 잔존 |
| 동대표 교체 후 JWT 블랙리스트 없음 | Medium | 잔존 |
| Button loading UI 불일치 (D-01) | Low | SPRINT.md D-01 |
| Badge 테두리 누락 (D-02) | Low | SPRINT.md D-02 |
| 홈 바로가기 터치 타깃 미달 (D-03) | Low | SPRINT.md D-03 |
| poll-reminder Cron 스케줄 불일치 (D-04) | Low | SPRINT.md D-04 |

---

## 2026-04-21 — Sprint 10 아키텍처 변경점

### 1. 신규 DB 모델 3종

| 모델 | 필드 | 관계 |
|------|------|------|
| `Facility` | name, description, maxPerDay, isActive | Villa → Facility (1:N) |
| `FacilityReservation` | facilityId, userId, villaId, roomNumber, date, timeSlot, note | Facility → FacilityReservation (1:N), User → FacilityReservation (1:N) |
| `Vendor` | name, category(enum), phone, memo | Villa → Vendor (1:N) |

신규 enum: `VendorCategory` (PLUMBING / ELECTRICAL / CLEANING / CONSTRUCTION / ELEVATOR / ETC)

> **⚠️ 기술 부채**: `prisma migrate dev`가 Vercel 빌드 환경에서 실행 불가하여 Supabase SQL Editor 수동 적용 필요. 미적용 시 공용시설·업체 API 런타임 500 오류 발생.

### 2. 신규 API 라우트 11개

| 경로 | 메서드 | 설명 |
|------|--------|------|
| `/api/admin/insights` | GET | 수금률 + 6개월 수금액 집계 |
| `/api/admin/facilities` | GET/POST | 시설 목록/등록 |
| `/api/admin/facilities/[id]` | PATCH/DELETE | 시설 수정/삭제 |
| `/api/admin/facilities/[id]/reservations` | GET | 시설별 예약 현황 |
| `/api/admin/vendors` | GET/POST | 업체 목록/등록 (카테고리 필터) |
| `/api/admin/vendors/[id]` | PATCH/DELETE | 업체 수정/삭제 |
| `/api/resident/payments/history` | GET | 입주민 납부 이력 (status 필터) |
| `/api/resident/facilities` | GET | 활성 시설 + 오늘 예약 현황 |
| `/api/resident/facilities/[id]/reservations` | POST | 예약 생성 |
| `/api/resident/facilities/[id]/reservations/[rid]` | DELETE | 예약 취소 |
| `/api/resident/vendors` | GET | 업체 목록 읽기 전용 |

### 3. 신규 공통 컴포넌트

- `components/InsightsSection.tsx` — 관리자 홈 수금 인사이트 (순수 CSS 막대 차트, recharts 미사용)

### 4. 듀얼 모드 활성화 경로 추가

- **이전**: 온보딩 체크박스(빌라 최초 등록 시)만 가능
- **추가**: 관리자 프로필 → "등록" 버튼 → 호수 입력 → `POST /api/villas/${villaId}/residents/join` → `saveUser()`로 `residentVilla` 즉시 반영

### 5. 기술 부채 업데이트

해소된 항목 (D-01~D-04):

| 항목 | 상태 |
|------|------|
| Button loading Spinner+텍스트 동시 표시 (D-01) | ✅ 해소 |
| Badge 테두리 누락 (D-02) | ✅ 해소 |
| 홈 바로가기 터치 타깃 미달 (D-03) | ✅ 해소 |
| poll-reminder Cron 주석 불일치 (D-04) | ✅ 해소 |

신규 발생 및 즉시 해소:
- 신규 페이지 바텀시트 z-index 충돌 (z-50 → z-60) — 즉시 수정
- 관리자 프로필 pb-10 → pb-24 하단 가림 — 즉시 수정

잔존 기술 부채 추가:
- 신규 테이블(Facility/FacilityReservation/Vendor) Supabase 수동 적용 대기 — High

---

## 2026-04-23 — 아키텍처 변경점

### 1. 백오피스 URL 경로 체계 확정

**변경 전 문제**: `(backoffice)` route group 내 페이지 파일은 `app/(backoffice)/dashboard/page.tsx` 등 루트 레벨에 위치하여 실제 URL이 `/dashboard`, `/villas`, `/users`, `/billing`, `/mrr`, `/content/*`이지만, 코드 전반에 `/backoffice/dashboard` 등 잘못된 경로가 하드코딩되어 있었음.

**확정 구조**:

| 파일 경로 | 실제 URL |
|----------|---------|
| `app/(backoffice)/dashboard/page.tsx` | `/dashboard` |
| `app/(backoffice)/villas/page.tsx` | `/villas` |
| `app/(backoffice)/users/page.tsx` | `/users` |
| `app/(backoffice)/billing/page.tsx` | `/billing` |
| `app/(backoffice)/mrr/page.tsx` | `/mrr` |
| `app/(backoffice)/content/*/page.tsx` | `/content/*` |
| `app/(backoffice)/backoffice/login/page.tsx` | `/backoffice/login` |

로그인은 `/backoffice/login`, 나머지 페이지는 루트 레벨 URL 사용.

### 2. 미들웨어 matcher 확장

백오피스 페이지 경로들을 `middleware.ts` matcher에 명시적으로 추가:

```ts
matcher: [
  '/api/:path*',
  '/backoffice/:path*',
  '/dashboard', '/dashboard/:path*',
  '/villas', '/villas/:path*',
  '/users', '/users/:path*',
  '/billing', '/billing/:path*',
  '/mrr',
  '/content/:path*',
]
```

`isBackofficePage` 조건 블록으로 위 경로 전부에 `bo_session` HttpOnly 쿠키 검증 적용.

### 3. bo_session 쿠키 scope 수정

**이전**: `path: '/backoffice'` — `/backoffice/*` 요청에만 쿠키 전송
**이후**: `path: '/'` — 모든 경로에 쿠키 전송

백오피스 페이지가 `/dashboard`, `/villas` 등 루트 레벨에 있기 때문에 쿠키 path가 `/backoffice`이면 미들웨어가 해당 페이지에서 쿠키를 읽지 못해 로그인 루프 발생. `/`로 확장하여 해소.

### 기술 부채 현황 (2026-04-23 기준)

| 항목 | 위험도 | 상태 |
|------|--------|------|
| Facility/FacilityReservation/Vendor 테이블 Supabase 수동 적용 | High | 미완료 |
| `BILLING_ENCRYPTION_KEY` Vercel 등록 | Critical | 미완료 |
| 기존 평문 빌링키 마이그레이션 | High | 미완료 |

---

## 2026-04-24~25 — Sprint 12 QA 수정 + fixedFee 고정 관리비 자동 발행

### 아키텍처 변경점

#### 1. 데이터 모델 — Villa.fixedFee 추가

`prisma/schema.prisma`의 Villa 모델에 `fixedFee Int?` 필드 추가. `prisma db push`로 Supabase에 직접 반영 (migration 없이 컬럼 추가).

```prisma
model Villa {
  autoPublishDay  Int?
  fixedFee        Int?  // ← 신규: 세대당 고정 관리비 (원)
}
```

이 필드는 매월 자동 발행되는 청구서의 세대당 금액 기준으로 사용됨. null이면 0원으로 처리.

#### 2. 크론 로직 변경 — publish-invoices

`app/api/cron/publish-invoices/route.ts`:
- villa SELECT에 `fixedFee` 추가
- `totalAmount = fee * headResidents.length` (기존: 항상 0)
- 각 InvoicePayment `amount = fee` (기존: 항상 0)
- 알림 메시지: fixedFee > 0이면 금액 포함, 아니면 기존 "금액을 입력해주세요" 유지

**설계 결정**: fixedFee 미설정 시 기존처럼 0원 발행(하위 호환). 관리자가 발행 후 수동 수정 가능.

#### 3. API 변경 — PATCH /api/villas/[villaId]

`app/api/villas/[villaId]/route.ts`: `autoPublishDay`와 동일 패턴으로 `fixedFee?: number | null` 추가.

```ts
const { ..., autoPublishDay, fixedFee } = body as { ..., fixedFee?: number | null };
...(fixedFee !== undefined && { fixedFee }),
```

#### 4. UI 컴포넌트 — AutoPublishCard

`app/(admin)/manage/invoices/page.tsx` 내 인라인 컴포넌트로 분리 (별도 파일 없이 동일 파일 내 선언).

- 마운트 시 `GET /api/villas/[villaId]`로 현재 `autoPublishDay`, `fixedFee` 조회
- 저장 시 `PATCH /api/villas/[villaId]` 호출
- villaId는 localStorage `user.villa.id`에서 추출

#### 5. 신규 클라이언트 인프라 — Toast / useToast

브라우저 `window.alert()` 완전 제거를 위한 인프라 추가:
- `components/ui/Toast.tsx`: 3초 자동 닫힘, variant 3종 (default/error/success)
- `hooks/useToast.tsx`: `{ toast, toastEl }` 패턴

z-index 계층 최종 확정:
```
z-50   BottomNav
z-60   바텀시트·모달
z-90   ConfirmDialog
z-[100] Toast (최상위)
```

### 보안 수정 (아키텍처적 패턴)

| 패턴 | 수정 파일 | 내용 |
|------|----------|------|
| 과거 날짜 서버 검증 | `facilities/[id]/reservations/route.ts` | 클라이언트 min 속성만으로는 불충분 — API에서도 KST 기준 과거 차단 |
| PENDING 세대 필터 | `invoices/route.ts`, `publish-invoices/route.ts`, `notify.ts` | `residentRecord.findMany`에 `status: 'APPROVED'` 누락은 반복 취약 패턴 |
| 트랜잭션 원자성 | `external-billing/confirm/route.ts` | 상태 갱신 + 부작용(장부 기록)은 반드시 $transaction으로 묶음 |
| 역할 기반 접근 | `resident/payments/history/route.ts`, `posts/[postId]/route.ts` | 특정 역할 전용 엔드포인트에 getUser 다음 즉시 role 검증 |

### 기술 부채 현황 (2026-04-25 기준)

| 항목 | 위험도 | 상태 |
|------|--------|------|
| `BILLING_ENCRYPTION_KEY` Vercel 등록 | Critical | 미완료 |
| 기존 평문 빌링키 마이그레이션 | High | 미완료 |
| PortOne 운영 MID 전환 | High | 미완료 |
| M-6: 인사이트 API JS 집계 → DB groupBy | Medium | 미완료 |
| L-5: 장부 입주민 노출 정책 | Low | 검토 중 |
| PortOne 운영 MID 전환 | High | 미완료 |

---

## 2026-04-25 — Sprint 13: 공용시설 예약 구조 개선 + apiFetch 전수 전환

### 아키텍처 변경점

#### 1. 데이터 모델 — Facility/FacilityReservation 구조 개선

`Facility` 모델에서 `maxPerDay Int?` 제거, `openTime String?`, `closeTime String?`, `maxConcurrent Int @default(1)` 추가.
`FacilityReservation` 모델에서 `timeSlot String?` 제거, `startTime String?`, `endTime String?` 추가.
`prisma db push --accept-data-loss` 적용 (기존 `maxPerDay` 컬럼 데이터 1건 손실 허용, Vendor 테이블 포함 전체 스키마 동기화 완료).

```prisma
model Facility {
  openTime       String?  // "HH:MM" 운영 시작
  closeTime      String?  // "HH:MM" 운영 종료
  maxConcurrent  Int      @default(1)  // 동시간대 최대 중복 예약 수
}

model FacilityReservation {
  startTime  String?  // "HH:MM"
  endTime    String?  // "HH:MM"
}
```

#### 2. 예약 중복 검사 — 인터벌 오버랩 알고리즘

기존: `maxPerDay` 기반 하루 최대 건수 제한  
변경: 시간 구간 인터벌 오버랩 카운트

```ts
const overlapping = await prisma.facilityReservation.count({
  where: {
    facilityId,
    date: body.date,
    startTime: { lt: body.endTime },
    endTime: { gt: body.startTime },
  },
});
if (overlapping >= facility.maxConcurrent) return err(..., 409);
```

표준 인터벌 오버랩 조건: `A.start < B.end AND A.end > B.start`. 카운트가 `maxConcurrent` 이상이면 해당 시간대 예약 거부.

#### 3. 클라이언트 인증 헤더 전수 전환 — apiFetch 마이그레이션

**배경**: `(admin)`, `(resident)` 페이지들이 `fetch('/api/...')` 직접 호출 시 `Authorization` 헤더 누락 → 미들웨어 JWT 검증 실패 → 401 Unauthorized.

**해결**: `lib/client-api.ts`의 `apiFetch`가 localStorage에서 토큰을 읽어 `Authorization: Bearer {token}` 자동 주입. 32개 파일 일괄 전환.

**예외 — `/api/upload` (FormData)**:
- `apiFetch`는 `Content-Type: application/json` 강제 설정 → 멀티파트 boundary 덮어씀 → 업로드 실패
- raw `fetch` 유지 + `Authorization` 헤더 수동 추가로 해결

**`lib/client-api.ts` 내부 변경**: `API_BASE` 변수 제거 (빈 문자열이었으므로 dead code), `fetch(path, ...)` 상대 경로 직접 사용.

### API 변경

| 엔드포인트 | 변경 전 | 변경 후 |
|-----------|--------|--------|
| `POST /api/admin/facilities` | `maxPerDay` | `openTime`, `closeTime`, `maxConcurrent` |
| `PATCH /api/admin/facilities/[id]` | `maxPerDay` | `openTime`, `closeTime`, `maxConcurrent` |
| `POST /api/resident/facilities/[id]/reservations` | `timeSlot` (자유 텍스트) | `startTime`, `endTime` (HH:MM + 인터벌 검증) |

예약 POST 서버 검증 항목 (신규):
1. KST 기준 과거 날짜 차단
2. `HH:MM` 형식 정규식 검증
3. `startTime < endTime` 확인
4. `openTime ≤ startTime`, `endTime ≤ closeTime` 범위 검증
5. 인터벌 오버랩 카운트 `≥ maxConcurrent` 시 409 반환

### 기술 부채 현황 (2026-04-25 업데이트)

| 항목 | 위험도 | 상태 |
|------|--------|------|
| `lib/client-api.ts` 헬퍼 미활용 | Medium | **완전 해소** (32개 파일 전환) |
| Facility/FacilityReservation/Vendor 테이블 Supabase 적용 | High | **해소** (prisma db push 완료) |
| `BILLING_ENCRYPTION_KEY` Vercel 등록 | Critical | 미완료 |
| 기존 평문 빌링키 마이그레이션 | High | 미완료 |
| PortOne 운영 MID 전환 | High | 미완료 |
| M-6: 인사이트 API JS 집계 → DB groupBy | Medium | 미완료 |
| L-5: 장부 입주민 노출 정책 | Low | 검토 중 |

---

## 2026-04-29 — PM 평가 반영 및 F-93 소프트 넛지 구현

### 아키텍처 변경점

없음. F-93은 기존 Web Push + Notification 인프라를 그대로 재활용하여 신규 설계 불필요.

### Phase 4 로드맵 신규 정의

PM 외부 평가 기반으로 Phase 4 기능적 요구사항 3종 공식 등록:

| # | 기능 | 선행 조건 |
|---|------|-----------|
| F-91 | AI 영수증 OCR 자동 인식 | Vision API 공급자 선택 및 계약 |
| F-92 | O2O 오프라인 안내문 자동 생성 (PDF/이미지) | 디자인 시안 확정 |
| F-93 | 소프트 넛지 전체 공지 푸시 버튼 | ✅ 구현 완료 (당일) |

### API 변경

| 엔드포인트 | 변경 유형 | 설명 |
|-----------|---------|------|
| `POST /api/villas/[villaId]/nudge` | 신규 | ADMIN 전용. 전체 입주민 SYSTEM 타입 알림 + Web Push 동시 발송. 1일 1회 쿨타임 (DB 조회 후 429). |

### 데이터 모델 변경

없음. 기존 `Notification` 모델의 `type: SYSTEM`을 재활용.

### 기술 부채 현황 (2026-04-29)

변동 없음. F-93은 기존 인프라 재활용으로 신규 부채 미발생.

---

## 2026-05-05 — Sprint 15~16: F-91~F-92, F-94~F-96, F-99 구현

### 아키텍처 변경점

**외부 API 통합 (F-91 — Google Vision OCR)**
- `POST /api/villas/[villaId]/ledger/ocr`: Google Vision API TEXT_DETECTION 연동
- 월 900건 한도를 `OcrUsageLog` DB 카운터로 관리 (GCP Quota 대신 앱 레벨 제어)
- `GOOGLE_VISION_API_KEY` 환경변수 필요

**O2O 안내문 인쇄 (F-92 — window.print() 패턴)**
- 외부 PDF 라이브러리 없이 `window.print()` + `@media print` CSS 사용
- 의존성 증가 없이 QR 코드 포함 인쇄 구현

**다중 빌라 퀵스위치 (F-99 — 클라이언트 UX 개선)**
- `/api/me/villas` 기존 API 재활용, UI 레이어만 변경
- 관리자 홈 헤더에 Bottom Sheet 드롭다운 추가

**차량 이동 요청 (F-94 — 쿨타임 DB 패턴)**
- `Vehicle.lastNudgedAt DateTime?` 필드로 1시간 쿨타임 구현 (Redis/메모리 없이 DB만 사용)
- 요청자 익명 보장: body에 발신자 식별 정보 미포함

**전출 정산 일할 계산 (F-95 — ExternalBilling 재활용)**
- 신규 모델 없이 기존 `ExternalBilling` 모델 재활용
- 계산식: `Math.ceil(monthlyFee × usedDays / totalDaysInMonth)`
- fixedFee 없을 시 해당 월 `InvoicePayment`에서 금액 폴백 조회

**공동 당번 + 정기 점검 스케줄러 (F-96 — 신규 도메인)**
- `DutySchedule`, `DutyRule` 두 모델 신규 추가
- 당번 계산 로직: `Math.floor(daysSinceStart / intervalDays) % units.length` (서버리스 stateless 계산, 별도 상태 저장 없음)
- Cron 방식: 매일 당번 교체일 여부 체크 후 조건부 발송 (불필요한 알림 0건 보장)
- 정기 점검 D-30/D-7 패턴: Cron에서 `daysUntil` 계산 후 정확히 두 시점에만 발송

### API 변경

| 엔드포인트 | 변경 유형 | 설명 |
|-----------|---------|------|
| `POST /api/villas/[villaId]/ledger/ocr` | 신규 | 영수증 이미지 → Google Vision OCR → 날짜·금액·설명 추출. 월 900건 한도 |
| `POST /api/villas/[villaId]/vehicles/[vehicleId]/nudge` | 신규 | 차량 이동 요청 Web Push. 1시간 쿨타임 (lastNudgedAt 기준). 방문 차량 차단 |
| `POST /api/villas/[villaId]/residents/[residentId]/prorata` | 신규 | 이사일 입력 → 일할 계산 → ExternalBilling 생성 → 결제 링크 반환 |
| `GET/POST /api/villas/[villaId]/duty-schedules` | 신규 | 공동 당번 스케줄 CRUD. POST 시 기존 활성 스케줄 자동 비활성화 |
| `DELETE /api/villas/[villaId]/duty-schedules/[scheduleId]` | 신규 | 당번 스케줄 삭제 |
| `GET/POST /api/villas/[villaId]/duty-rules` | 신규 | 정기 점검 규칙 CRUD |
| `PATCH/DELETE /api/villas/[villaId]/duty-rules/[ruleId]` | 신규 | 점검 완료 기록 (lastInspectedAt 갱신) / 삭제 |
| `POST /api/cron/duty-reminder` | 신규 | 당번 교체일 세대 푸시 + D-30/D-7 점검 리마인더 관리자 발송 |

### 데이터 모델 변경

**신규 Enum**
- `DutyInterval { WEEKLY, BIWEEKLY }`

**신규 모델**
- `OcrUsageLog`: yearMonth(unique), count — 월별 Vision API 호출 카운터
- `DutySchedule`: villaId, units(String[]), startDate, interval(DutyInterval), isActive
- `DutyRule`: villaId, name, intervalDays, lastInspectedAt?, isActive

**기존 모델 필드 추가**
- `Vehicle.lastNudgedAt DateTime?` — 차량 이동 요청 쿨타임용

**Villa 관계 추가**
- `Villa.dutySchedules DutySchedule[]`
- `Villa.dutyRules DutyRule[]`

### 기술 부채 현황 (2026-05-05)

| 항목 | 위험도 | 상태 |
|------|--------|------|
| `BILLING_ENCRYPTION_KEY` Vercel 등록 | Critical | 미완료 |
| 기존 평문 빌링키 마이그레이션 | High | 미완료 |
| PortOne 운영 MID 전환 | High | 미완료 |
| M-6: 인사이트 API DB groupBy | Medium | **완료** (Sprint 15) |
| L-5: 장부 입주민 노출 정책 | Low | **확정** (전체 공개 유지) |
| `GOOGLE_VISION_API_KEY` Vercel 등록 | Medium | 미완료 — F-91 OCR 운영 블로커 |

---

## 아키텍처 변경 기록 — 2026-05-09 (QA-1~3)

### 인터페이스 변경

**`StoredUser` 인터페이스 확장** (`lib/client-auth.ts`):
- `roomNumber?: string` 필드 추가
- RESIDENT가 로그인·재접속 시 호수 정보를 localStorage에서 복원하기 위함
- 기존의 `residentVilla.roomNumber`는 ADMIN 전용 — RESIDENT는 별도 최상위 필드 사용

### API 계층 의사결정

**결제 confirm 엔드포인트 rate limit 제거** (`pay/[billId]/confirm/route.ts`):
- 이유: Vercel 서버리스는 인스턴스가 분산되어 in-memory Map이 실효성 없음
- 대안: PortOne 서버 3중 검증(merchant_uid 포함 + 금액 + paid 상태)으로 충분
- 결론: 오해를 주는 코드 제거, 실질적 보안 수준 유지

**청구서 자동 발행 구독 상태 필터 추가** (`cron/publish-invoices/route.ts`):
- 비활성(`EXPIRED`, `CANCELED`) 빌라에 청구서가 자동 발행되는 문제
- `subscriptionStatus: { in: ['ACTIVE', 'FREE_TRIAL'] }` 필터로 가드
- 아키텍처 원칙: cron 작업은 항상 구독 상태를 명시적으로 체크해야 함

### 동시성 패턴

**결제 이중 처리 방지** (`invoices/.../payments/.../verify/route.ts`):
- `updateMany({ where: { status: 'PENDING' } })` + `count === 0` 체크 패턴 도입
- `$transaction` 내부에서 원자적 처리 → TOCTOU 경쟁 조건 해소
- 이 패턴을 향후 상태 변경이 있는 모든 결제 관련 엔드포인트에 적용할 것

### 기술 부채 (신규, 2026-05-09)

| 항목 | 위험도 | 설명 |
|------|--------|------|
| 전출 소프트 삭제 미구현 | High | FK 제약으로 납부 이력 있는 입주민 삭제 불가 → `ResidentRecord.status = MOVED_OUT` 필요 |
| prorata API 중복 방지 없음 | Low | 같은 입주민 대상 여러 번 호출 시 `ExternalBilling` 중복 생성 |
| 미납 리마인더 regex 취약 | Low | 알림 본문 regex로 중복 체크 — 문구 변경 시 중복 발송 위험 |
| auto-payment 배치 처리 미비 | Low | 빌라 200개 초과 시 Vercel 300s 제한 도달 가능성 |

---

## 아키텍처 변경 기록 — 2026-05-10 (QA-4~7 + 신규 기능)

### 아키텍처 변경점

**구독 정책: hasUsedTrial 플래그 도입**
- `User.hasUsedTrial Boolean @default(false)` 필드 추가 — 계정 생애 최초 빌라 생성 시에만 30일 무료 체험 부여
- 플래그는 한 번 `true`로 설정되면 빌라 삭제·이양 후에도 초기화되지 않음 → 동일 계정이 빌라 재등록으로 무료 체험 재수령 불가
- 기존 count 기반 접근 대비 관리자 이양(adminId 변경)에도 안전한 방식

**`/api/guides` PUBLIC_API 예외 처리**
- `middleware.ts`의 `PUBLIC_API` 배열에 `/api/guides` 추가
- 이용 가이드는 인증 없이 조회 가능한 공개 콘텐츠로 분류
- 기존: 가이드 API 호출 시 미인증으로 401 반환 → `t.map is not a function` 클라이언트 에러 발생

**백오피스 빌라 상세 GET 엔드포인트 신규**
- `GET /api/backoffice/villas/[id]`: 빌라 상세 + 입주민 목록 + 최근 청구서 6개월 합산 응답
- `Promise.all` 병렬 조회로 N+1 쿼리 방지

### API 변경

| 엔드포인트 | 변경 유형 | 설명 |
|-----------|---------|------|
| `GET /api/backoffice/villas/[id]` | 신규 | 빌라 상세 + 입주민 목록 + 최근 청구서 6개 납부율 |

### 데이터 모델 변경

**기존 모델 필드 추가**
- `User.hasUsedTrial Boolean @default(false)` — 계정당 무료 체험 1회 플래그

### QA 세션 버그 수정 요약 (2026-05-10)

**QA-4: 공지/투표 (5건)**
- PENDING 입주민이 게시글·댓글·투표 상세 접근 가능 → `status: 'APPROVED'` 조건 추가 (3곳)
- PATCH로 공지 3개 제한 우회 가능 → 승격 시 카운트 재검증
- `poll-reminder` Cron 중복 알림 → 오늘 발송 여부 DB 조회 후 스킵
- 게시글 목록 HTML 태그 노출 → `replace(/<[^>]*>/g, '')` strip 처리
- 비작성자 수정 URL 직접 접근 → `author.id` 확인 후 `router.back()`
- 투표 종료일 UI/API 불일치 → API에 최소 1시간 후 제한 추가

**QA-5: 차량/티켓/점검/F-99 (11건)**
- QR 토큰 3곳에서 하드코딩 폴백 시크릿 → `lib/auth.ts`에서 `secret` export 후 재사용 (Critical)
- 티켓 GET RESIDENT 빌라 소속 검증 누락 + try/catch 없음 → 수정
- 당번 Cron UTC/KST 날짜 판정 오류 → `getTodayKST()` 함수로 통일 (High)
- Nudge 알림+DB 비원자 → DB 갱신 먼저 후 알림 발송
- 일할 정산 중복 `ExternalBilling` 생성 → description 기반 409 체크 추가
- `switch-villa` raw fetch → `apiFetch`로 교체 (Authorization 헤더 자동 주입)
- `duty-rules` `intervalDays` 부동소수점 허용 → `Number.isInteger()` 검증
- `DutySchedule` updateMany+create 비원자 → `$transaction` 원자화

**QA-6: 크론 잡 (4건)**
- `expire-subscriptions`, `publish-invoices`: 알림 루프 예외 처리 누락 → `.catch` 추가
- `subscription-reminder`: D-7/D-3/D-1 중복 발송 → 오늘 발송 여부 사전 확인
- `duty-reminder`: BIWEEKLY 알림 문구 오류 ("이번 주" → "이번 격주") + 중복 방지 추가

**QA-7: 백오피스 (4건)**
- `billing/page.tsx` TYPE_LABEL 오타 (MANAGEMENT→FIXED, EXTRA→VARIABLE)
- 백오피스 콘텐츠 관리 3곳 `confirm()/alert()` → `useConfirm` 훅 전환

### 기술 부채 현황 (2026-05-10)

| 항목 | 위험도 | 상태 |
|------|--------|------|
| `BILLING_ENCRYPTION_KEY` Vercel 등록 | Critical | 미완료 |
| 기존 평문 빌링키 마이그레이션 | High | 미완료 |
| PortOne 운영 MID 전환 | High | 미완료 |
| `GOOGLE_VISION_API_KEY` Vercel 등록 | Medium | 미완료 |
| 전출 소프트 삭제 전환 | High | 미완료 |
| prorata API 중복 방지 | Low | **완료** (QA-5: description 기반 409 체크) |
| 미납 리마인더 regex 취약 | Low | 미완료 |
| 본인 인증 (SMS/PASS) | 낮음 | 보류 결정 (유료) |

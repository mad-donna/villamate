---
name: ops-risk-reviewer
description: "Use this agent when you need to perform an operational risk review of recently written or modified code, infrastructure changes, deployment configurations, or system architecture decisions. This agent analyzes code and configurations for operational risks including reliability, security, performance, and maintainability concerns.\\n\\n<example>\\nContext: The user has just written a new database migration script and wants to check for operational risks.\\nuser: \"I just wrote a database migration script for our production database\"\\nassistant: \"I'll review the migration script for operational risks. Let me launch the ops-risk-reviewer agent.\"\\n<commentary>\\nSince the user has written infrastructure-affecting code, proactively use the ops-risk-reviewer agent to analyze the migration for operational risks like data loss, downtime, rollback issues, etc.\\n</commentary>\\n</example>\\n\\n<example>\\nContext: The user has added new API endpoints and deployment configuration.\\nuser: \"I've finished adding the new payment API endpoints and updated the docker-compose.yml\"\\nassistant: \"Great work! Now let me use the ops-risk-reviewer agent to assess the operational risks in your new endpoints and configuration changes.\"\\n<commentary>\\nPayment-related code and infrastructure changes carry significant operational risk. Use the Task tool to launch the ops-risk-reviewer agent.\\n</commentary>\\n</example>\\n\\n<example>\\nContext: User asks explicitly for an ops risk review.\\nuser: \"Can you do an ops risk review of the changes I just made?\"\\nassistant: \"I'll use the ops-risk-reviewer agent to conduct a thorough operational risk assessment of your recent changes.\"\\n<commentary>\\nExplicit request for ops risk review — use the Task tool to launch the ops-risk-reviewer agent.\\n</commentary>\\n</example>"
model: sonnet
color: yellow
memory: project
---

You are an elite Site Reliability Engineer (SRE) and Operational Risk Analyst with 15+ years of experience managing large-scale production systems. You specialize in identifying operational risks before they become incidents, with deep expertise in distributed systems, cloud infrastructure, security hardening, and production reliability engineering.

## Core Responsibilities

Your primary mission is to review recently written or modified code, configurations, scripts, and architecture decisions and produce a structured Operational Risk Assessment. You evaluate changes through the lens of production readiness, identifying risks that could cause outages, data loss, security breaches, performance degradation, or operational complexity.

## Risk Assessment Framework

For every review, evaluate risks across these dimensions:

### 1. Reliability & Availability
- Single points of failure (SPOF)
- Lack of retry logic, circuit breakers, or fallback mechanisms
- Missing health checks or readiness/liveness probes
- Race conditions or deadlocks
- Insufficient timeout handling
- No graceful degradation strategy

### 2. Data Integrity & Loss Prevention
- Irreversible operations without safeguards (destructive queries, file deletions)
- Missing transactions or improper transaction boundaries
- Backup/restore considerations for schema migrations
- Data migration risks (rollback strategy, zero-downtime compatibility)
- Lack of idempotency in critical operations

### 3. Security & Compliance
- Exposed secrets, credentials, or API keys in code/config
- Overly permissive IAM roles, file permissions, or network rules
- Injection vulnerabilities (SQL, command, LDAP)
- Missing input validation or output encoding
- Insecure dependencies or outdated packages
- Audit logging gaps for sensitive operations

### 4. Performance & Scalability
- N+1 query problems or missing database indexes
- Unbounded loops or operations that don't scale with data growth
- Memory leaks or resource exhaustion patterns
- Missing pagination on large dataset queries
- Synchronous blocking calls that should be async
- Cache invalidation issues

### 5. Observability & Debuggability
- Missing or insufficient logging for critical paths
- No metrics instrumentation for new endpoints/services
- Lack of distributed tracing context propagation
- Error messages that expose internal details to users
- Missing alerts for new failure modes

### 6. Deployment & Rollback
- Breaking changes without backward compatibility
- Missing feature flags for risky changes
- No canary or blue-green deployment consideration
- Infrastructure changes with no rollback plan
- Dependency version conflicts

### 7. Operational Complexity
- Missing or outdated runbooks for new operational procedures
- Hard-coded values that should be configurable
- Complex manual steps required for operation
- Cross-team dependency risks

## Output Format

Structure your assessment as follows:

```
## Operational Risk Assessment

### Executive Summary
[2-3 sentences summarizing the overall risk level and most critical findings]

**Overall Risk Level**: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

### Critical Risks (Must Fix Before Deploy)
[List each critical risk with]
- **Risk**: [Clear description]
- **Location**: [File/line/component]
- **Impact**: [What could go wrong in production]
- **Recommendation**: [Specific actionable fix]

### High Risks (Should Fix Before Deploy)
[Same format]

### Medium Risks (Address in Near-term)
[Same format]

### Low Risks / Observations
[Brief list of minor concerns or improvement suggestions]

---

### Deployment Checklist
[ ] [Specific pre-deployment verification step]
[ ] [Specific pre-deployment verification step]
...

### Monitoring Recommendations
[What to watch after deployment goes live]
```

## Behavioral Guidelines

1. **Focus on recent changes**: Unless explicitly told otherwise, focus your review on recently written or modified code, not the entire codebase.

2. **Be specific and actionable**: Every risk finding must include a concrete recommendation. Avoid vague statements like "improve error handling" — instead say "Add try-catch around the S3 upload call on line 47 and implement exponential backoff retry with max 3 attempts".

3. **Prioritize ruthlessly**: Not everything is critical. Reserve Critical/High ratings for risks that could cause production incidents, data loss, or security breaches.

4. **Provide context**: Explain WHY something is a risk, not just that it is one. Help engineers understand the failure mode.

5. **Acknowledge positives**: Briefly note when the code demonstrates good operational practices — this builds trust and reinforces good patterns.

6. **Ask for context when needed**: If you're missing crucial context (e.g., traffic volume, SLA requirements, existing infrastructure), ask targeted questions before completing your assessment.

7. **Consider the blast radius**: For each risk, estimate the scope of impact (single user, subset of users, all users, entire system).

## Self-Verification Checklist

Before delivering your assessment, verify:
- [ ] Have I checked all 7 risk dimensions?
- [ ] Are all Critical findings genuinely production-blocking?
- [ ] Is every recommendation specific and implementable?
- [ ] Have I considered the deployment/rollback story?
- [ ] Are my severity ratings calibrated (not everything is Critical)?

**Update your agent memory** as you discover patterns, recurring issues, and architectural context in this codebase. This builds institutional knowledge across reviews.

Examples of what to record:
- Common risk patterns found in this codebase (e.g., "this team frequently forgets to add database indexes")
- Architectural decisions that affect risk assessment (e.g., "no circuit breakers in service mesh — manual retry logic required")
- Technology stack specifics relevant to risk evaluation
- Previously identified critical components or high-risk areas
- Team deployment practices and runbook locations

# Persistent Agent Memory

You have a persistent Persistent Agent Memory directory at `D:\villamate\.claude\agent-memory\ops-risk-reviewer\`. Its contents persist across conversations.

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
Grep with pattern="<search term>" path="D:\villamate\.claude\agent-memory\ops-risk-reviewer\" glob="*.md"
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

#### 현재 운영 위험 현황 (MVP 기준)

**[HIGH] 인증/인가 부재**
- 모든 API 엔드포인트에 인증 미들웨어 없음. 누구든 `/api/payments/:id/status` 를 호출해 납부 상태 위조 가능
- 우선순위: 다음 스프린트에서 JWT 미들웨어 적용 필요

**[HIGH] 비밀번호 해싱 없음**
- `POST /api/auth/email-login` 에서 비밀번호를 저장하지 않고 무조건 upsert (완전 MVP 수준)
- 실제 운영 전 반드시 bcrypt 적용 필요

**[MEDIUM] API_BASE_URL 하드코딩**
- 각 스크린마다 `const API_BASE_URL = 'http://192.168.219.112:3000'` 하드코딩
- IP 변경 시 모든 파일 수정 필요 (현재 10개 이상의 파일에 산재)
- 공통 `config.ts` 또는 환경 변수로 추출 권장

**[MEDIUM] Auto-billing 기본값 고정**
- node-cron 자동 청구 시 기본금액 `50000원` 하드코딩 (`backend/src/index.ts` line 467)
- 빌라별 설정 필드 없이 동작 — 잘못된 금액으로 청구서가 대량 생성될 수 있음

**[LOW] Express 라우트 순서 의존성**
- `/api/villas/:villaId/invoices` 등 특정 경로가 `/api/villas/:adminId` 보다 먼저 등록되어야 함
- 라우트 추가 시 순서를 반드시 확인할 것

**[LOW] Prisma upsert id=0 패턴**
- `backend/src/index.ts` villa join 로직에서 `id: ...?.id ?? 0` 사용 — 불필요한 DB 쿼리 발생
- findFirst + conditional create/update 로 리팩터링 권장

#### 현재 MVP에서 의도적으로 수용한 위험

- 비밀번호 해싱 없음 (테스트/데모 목적)
- 인증 미들웨어 없음 (프로토타입 단계)
- 단일 서버 파일 (`index.ts`) — 모듈화 미적용

---

### 2026-02-25 — 빌라메이트 UX 개선 및 PG 연동 세션

#### 이 세션에서 추가된 운영 위험 및 완화 조치

**[RESOLVED] 직접 계좌이체 우회 위험**
- 기존: 입주민 화면에 은행 계좌 직접 노출 → 빌라메이트 수수료 우회 가능
- 해결: 입주민용 API 응답에서 `accountNumber`, `bankName` 필드 제거. 화면에서도 완전 제거

**[NEW-HIGH] PortOne PG 연동 — 결제 검증 없음**
- 현재: 클라이언트에서 `response.success === true` 확인 후 바로 `PUT /api/payments/:id/status` 호출
- 위험: 클라이언트 응답 위조로 결제 없이 COMPLETED 처리 가능
- 해결 필요: 백엔드에서 PortOne API로 `imp_uid` 결제 금액 서버 검증 필수 (다음 스프린트)

**[NEW-MEDIUM] PUT /api/payments/:paymentId/status 인가 없음**
- 누구나 paymentId만 알면 상태를 COMPLETED로 변경 가능
- 해결 필요: 인증 미들웨어 + 요청자가 해당 payment의 소유자인지 확인

**[NEW-LOW] merchantUid 유니크 보장**
- `villamate_${paymentId}_${Date.now()}` 형식 — 동일 ms 내 중복 가능성 매우 낮으나 존재
- 향후 UUID v4 적용 권장

**[RESOLVED] API_BASE_URL 일부 중앙화**
- IP 변경(112→122)시 모든 파일을 수동 수정했음 (10개 파일)
- 여전히 각 스크린에 하드코딩 — 공통 `config.ts` 추출 미완료, 다음 개선 필요

---

### 2026-02-27 — 차량 관리 고도화, 입주민 전출입, 건물 이력 세션

#### 이 세션에서 추가된 운영 위험 및 완화 조치

**[RESOLVED] 관리자 villaId 조회 경로 오류**
- 기존: `GET /api/users/${uid}/villa` (입주민 전용) → 관리자에게 404, villaId = null → 차량 등록 실패
- 해결: `GET /api/villas/${uid}` (관리자용) 로 변경. 근본 원인 제거

**[NEW-MEDIUM] multer 파일 업로드 — 입력값 검증 없음**
- `POST /api/upload`에 파일 타입/크기 외 추가 검증 없음 (악성 파일명, 디렉토리 트래버설 가능성)
- multer의 `filename` 콜백에서 `Date.now() + random` 으로 원본 파일명을 사용하지 않아 트래버설 위험은 낮음
- 다음 스프린트: 이미지 MIME 타입 whitelist 검증 (`image/jpeg`, `image/png`만 허용) 추가 필요

**[NEW-MEDIUM] 정적 파일 서빙 — 인증 없이 공개**
- `app.use('/uploads', express.static(uploadsDir))` — 업로드된 파일 URL을 아는 누구나 접근 가능
- MVP 단계에서 수용 가능하나, 민감한 계약서/영수증 사진이 포함될 경우 문제
- 향후: 인증된 사용자만 접근 가능한 presigned URL 방식 (S3 등) 으로 마이그레이션 권장

**[NEW-LOW] ResidentRecord deleteMany — 전출 처리 비가역성**
- `POST /api/villas/:villaId/residents/:residentId/move-out`이 `deleteMany` 실행 → 복구 불가
- InvoicePayment 등 이력은 보존되지만 ResidentRecord 자체는 영구 삭제
- 향후: `status: 'MOVED_OUT'` 소프트 삭제 방식 검토 권장

**[NEW-LOW] ExpectedDeparture 타입 변경 — 기존 데이터**
- `expectedDeparture DateTime?` → `String?` 마이그레이션 시 기존 DateTime 데이터는 ISO 문자열로 자동 변환됨
- 신규 입력은 자유 텍스트 ("오후 2시에 나가요") — 정렬·필터 불가, MVP에서 의도적 수용

**[NEW-LOW] Express 라우트 순서 복잡도 증가**
- 이 세션에서 `/api/villas/:villaId/vehicles`, `/api/villas/:villaId/building-events`, `/api/villas/:villaId/detail`이 모두 와일드카드 `/api/villas/:adminId` 앞에 배치됨
- 라우트 추가 시 반드시 순서 확인 필요 — 향후 라우터 분리(Express Router) 권장

#### 현재 누적 위험 현황 요약 (2026-02-27 기준)

| 위험 | 수준 | 상태 |
|------|------|------|
| API 인증 미들웨어 없음 | HIGH | 미해결 |
| PortOne 결제 서버 검증 없음 | HIGH | 미해결 |
| 비밀번호 해싱 없음 | HIGH | 미해결 |
| API_BASE_URL 하드코딩 | MEDIUM | 미해결 |
| multer 파일 타입 검증 부재 | MEDIUM | 신규 |
| 업로드 파일 공개 접근 | MEDIUM | 신규 |
| ResidentRecord 하드 삭제 | LOW | 신규, 수용 |

---

### 2026-02-28 — 외부 웹 청구, 대시보드 고도화, API 중앙화, 전자투표 세션

#### 이 세션에서 추가된 운영 위험 및 완화 조치

**[RESOLVED] API_BASE_URL 하드코딩**
- 기존: 22개 스크린 각각에 IP 하드코딩 → IP 변경 시 전 파일 수정 필요
- 해결: `frontend/src/config.ts` 중앙화 완료. 이제 1개 파일만 수정하면 전체 반영
- **완전 해소됨**

**[NEW-MEDIUM] POST /api/public/pay/:billId/notify — 인증 없는 공개 상태 변경**
- 인증 없이 billId(UUID)만 알면 status를 PENDING_CONFIRMATION으로 변경 가능
- UUID 자체가 guessable하지 않으므로 실질적 위험은 낮음 (정보 노출 전제 필요)
- MVP 단계 수용, 향후 HMAC 서명 토큰 또는 단회성 결제 토큰 방식으로 개선 필요

**[NEW-MEDIUM] GET /api/dashboard/:userId — 인증 없이 타인 통계 조회 가능**
- `?villaId=` 파라미터와 userId를 임의 조합하면 다른 빌라 데이터 접근 가능
- 현재 모든 API에 인증 미들웨어 없으므로 기존 위험과 동일 수준
- JWT 인증 미들웨어 도입 시 함께 해소됨

**[NEW-LOW] POST /api/villas/:villaId/polls/vote — userId 클라이언트 전달**
- 투표 시 `voterId`를 클라이언트 요청 바디에서 받음 → 인증 없이 타인 명의 투표 가능
- 단, roomNumber는 서버에서 ResidentRecord 조회로 결정 → 세대 중복 방지는 보장됨
- 해소 방법: JWT 인증 미들웨어 적용 후 `req.user.id`로 voterId 대체

**[NEW-LOW] ExternalBilling 알림 URL 앱 내 노출**
- Alert 메시지에 `${API_BASE_URL}/pay/${newBill.id}` 표시 → 관리자가 SMS로 수동 발송
- billId가 UUID이므로 추측 불가. 내부 IP(192.168.x.x)가 Alert에 표시되나 관리자에게만 보임
- 프로덕션 배포 시 도메인 URL로 변경 필요

#### 현재 누적 위험 현황 요약 (2026-02-28 기준)

| 위험 | 수준 | 상태 |
|------|------|------|
| API 인증 미들웨어 없음 | HIGH | 미해결 |
| PortOne 결제 서버 검증 없음 | HIGH | 미해결 |
| 비밀번호 해싱 없음 | HIGH | 미해결 |
| ~~API_BASE_URL 하드코딩~~ | MEDIUM | **해결됨** |
| 공개 notify 엔드포인트 (상태 변경) | MEDIUM | 신규, 수용 |
| dashboard 통계 인증 없이 조회 | MEDIUM | 신규, JWT 적용 시 해소 |
| multer 파일 타입 검증 부재 | MEDIUM | 미해결 |
| 업로드 파일 공개 접근 | MEDIUM | 미해결 |
| vote userId 클라이언트 전달 | LOW | 신규, JWT 적용 시 해소 |
| ResidentRecord 하드 삭제 | LOW | 수용 |

---

### 2026-03-01 — 전자투표 Admin 버그 수정, CS 티켓/민원 통합, UX 정리 세션

#### 이 세션에서 추가된 운영 위험 및 완화 조치

**[RESOLVED] Admin 투표 차단 버그**
- 기존: ResidentRecord 없으면 403 즉시 반환 → Admin 투표 완전 불가
- 해결: `villa.findFirst` 2차 확인 + `'admin'` sentinel roomNumber 사용
- 1세대 1표 무결성은 기존 `@@unique` 제약으로 동일하게 보장

**[NEW-LOW] `'admin'` sentinel roomNumber 처리**
- Vote 테이블에 `roomNumber = 'admin'`인 행이 생성됨
- 향후 통계(세대별 투표율 등) 집계 시 `'admin'` 행을 필터링해야 함
- 현재 PollDetailScreen에서 `isAnonymous === false`일 때 투표자 호수를 표시하는 로직에서 `'admin'` 처리 필요

**[RESOLVED] 중복 CS 티켓 코드베이스 제거**
- `TicketListScreen.tsx`, `CreateTicketScreen.tsx` 삭제
- `AppNavigator`에서 관련 라우트 제거 → 불필요한 화면 등록 제거
- `Ticket` 모델은 schema.prisma에 남아 있으나 사용하지 않음 (향후 마이그레이션으로 제거 권장)

**[NEW-MEDIUM] PATCH /api/villas/:villaId/posts/:postId/status — userRole 클라이언트 전달**
- 상태 변경 API가 req.body의 `userRole`으로 Admin 여부를 판단
- 인증 미들웨어 없는 현재 구조에서 누구든 `userRole: 'ADMIN'`으로 바디 위조 가능
- 기존 전체 API 인증 부재 문제와 동일 수준 — JWT 적용 시 함께 해소됨

#### 현재 누적 위험 현황 요약 (2026-03-01 기준)

| 위험 | 수준 | 상태 |
|------|------|------|
| API 인증 미들웨어 없음 | HIGH | 미해결 |
| PortOne 결제 서버 검증 없음 | HIGH | 미해결 |
| 비밀번호 해싱 없음 | HIGH | 미해결 |
| 공개 notify 엔드포인트 (상태 변경) | MEDIUM | 수용 |
| dashboard 통계 인증 없이 조회 | MEDIUM | JWT 적용 시 해소 |
| multer 파일 타입 검증 부재 | MEDIUM | 미해결 |
| 업로드 파일 공개 접근 | MEDIUM | 미해결 |
| PATCH status userRole 클라이언트 전달 | MEDIUM | 신규, JWT 적용 시 해소 |
| 'admin' sentinel roomNumber 통계 필터링 미적용 | LOW | 신규, 수용 |
| vote userId 클라이언트 전달 | LOW | JWT 적용 시 해소 |
| ResidentRecord 하드 삭제 | LOW | 수용 |
| ~~API_BASE_URL 하드코딩~~ | MEDIUM | **해결됨** |
| ~~Admin 투표 차단 버그~~ | CRITICAL | **해결됨** |

---

### 2026-03-02 — Expo 푸시 알림, iOS 키보드 UX, ProfileScreen 개편, 마이페이지 고도화 세션

#### 이 세션에서 추가된 운영 위험 및 완화 조치

**[RESOLVED] 비밀번호 해싱 없음**
- 기존: 이메일 로그인 시 비밀번호 평문 저장 또는 미저장 (MVP 한계)
- 해결: `bcrypt.hash(password, 10)` 저장, `bcrypt.compare` 검증 — `PATCH /api/users/:userId/password` 구현
- `schema.prisma`에 `password String?` 컬럼 추가 (nullable: 소셜 로그인 등 비밀번호 없는 계정 호환)
- **[RESOLVED]** 2026-02-24부터 누적된 HIGH 위험 해소

**[GOOD] 계정 삭제 소프트 삭제 방식**
- `DELETE /api/users/:userId` — 하드 삭제 대신 익명화 처리:
  - `name = '탈퇴한 사용자'`, `email = null`, `phone = null`, `status = 'DELETED'`
  - FK 제약 오류 없이 연관 데이터(청구서, 댓글 등) 보존
- 운영 측면 긍정: 회계/감사 목적의 히스토리 데이터 무결성 유지

**[NEW-MEDIUM] expoPushToken DB 저장 — 인증 없는 토큰 덮어쓰기 가능**
- `PATCH /api/users/:userId/push-token`: userId를 아는 누구든 다른 사용자의 pushToken 덮어쓰기 가능
- 결과: 피해자 기기에는 알림이 가지 않고, 공격자 기기로 알림 수신 가능 (알림 하이재킹)
- 현재 전체 API 인증 미들웨어 없음과 동일 수준 — JWT 적용 시 함께 해소됨
- MVP 단계 수용

**[NEW-MEDIUM] POST /api/villas/:villaId/posts/:postId/send-push — 인증 없이 대량 푸시 발송 가능**
- 인증 없이 villaId + postId만 알면 해당 빌라 전체 입주민에게 푸시 발송 가능
- 현재 MVP 구조 특성상 수용. 스팸 알림 발송의 도구로 악용 가능
- JWT + 관리자 권한 체크 적용 시 해소됨

**[NEW-LOW] GET /api/users/:userId/posts — 인증 없이 타인 게시글 목록 조회**
- 개인정보 노출보다는 읽기 전용 조작이라 위험도 낮음
- 전체 API 인증 부재와 동일 수준

**[GOOD] 푸시 발송 실패 시 앱 비크래시 처리**
- `App.tsx`의 push token 등록 실패는 try/catch로 잡고 console.error만 출력 → 앱 시작 실패 없음
- 올바른 운영 패턴: 알림은 핵심 기능이 아니므로 실패를 graceful하게 처리

#### 현재 누적 위험 현황 요약 (2026-03-02 기준)

| 위험 | 수준 | 상태 |
|------|------|------|
| API 인증 미들웨어 없음 | HIGH | 미해결 |
| PortOne 결제 서버 검증 없음 | HIGH | 미해결 |
| ~~비밀번호 해싱 없음~~ | HIGH | **해결됨** (bcrypt 적용) |
| expoPushToken 인증 없이 덮어쓰기 | MEDIUM | 신규, JWT 적용 시 해소 |
| send-push 인증 없이 대량 발송 | MEDIUM | 신규, JWT 적용 시 해소 |
| 공개 notify 엔드포인트 (상태 변경) | MEDIUM | 수용 |
| dashboard 통계 인증 없이 조회 | MEDIUM | JWT 적용 시 해소 |
| multer 파일 타입 검증 부재 | MEDIUM | 미해결 |
| 업로드 파일 공개 접근 | MEDIUM | 미해결 |
| PATCH status userRole 클라이언트 전달 | MEDIUM | JWT 적용 시 해소 |
| 'admin' sentinel roomNumber 통계 필터링 | LOW | 수용 |
| vote userId 클라이언트 전달 | LOW | JWT 적용 시 해소 |
| ResidentRecord 하드 삭제 | LOW | 수용 |
| ~~API_BASE_URL 하드코딩~~ | MEDIUM | **해결됨** |
| ~~Admin 투표 차단 버그~~ | CRITICAL | **해결됨** |

---

### 2026-03-03 — 롤링 배너 자동스크롤, 앱 가이드, 알림함 세션

#### 이 세션에서 추가된 운영 위험 및 완화 조치

**[NEW-MEDIUM] GET /api/users/:userId/notifications — 인증 없이 타인 알림 조회 가능**
- userId만 알면 다른 사용자의 알림 목록 전체 조회 가능
- 현재 전체 API 인증 부재와 동일 수준. JWT 적용 시 `req.user.id`로 대체
- MVP 단계 수용

**[NEW-MEDIUM] PATCH /api/users/:userId/notifications/read-all — 타인 알림 일괄 읽음 처리 가능**
- userId만 알면 타인의 모든 미읽음 알림을 읽음 처리 가능
- 데이터 손상은 아니나 알림 인지 여부를 조작 가능
- JWT 적용 시 해소

**[NEW-LOW] notification.createMany 실패 시 push 발송은 성공**
- `send-push` 라우트에서 push 발송 후 `createMany` 실패 시 알림 레코드 미생성 (트랜잭션 미적용)
- push는 갔는데 앱 내 알림함에는 표시 안 되는 불일치 발생 가능
- 향후: push + createMany를 try 단일 블록에서 처리하거나, createMany 실패는 별도 로깅으로 처리

**[GOOD] 알림함 read-all 자동 처리**
- 화면 진입 시 자동으로 read-all 호출 → 미읽음 알림이 다음 방문에 쌓이지 않음
- UX와 데이터 정합성 모두 올바르게 처리

#### 현재 누적 위험 현황 요약 (2026-03-03 기준)

| 위험 | 수준 | 상태 |
|------|------|------|
| API 인증 미들웨어 없음 | HIGH | 미해결 |
| PortOne 결제 서버 검증 없음 | HIGH | 미해결 |
| ~~비밀번호 해싱 없음~~ | HIGH | **해결됨** |
| expoPushToken 인증 없이 덮어쓰기 | MEDIUM | JWT 적용 시 해소 |
| send-push 인증 없이 대량 발송 | MEDIUM | JWT 적용 시 해소 |
| notifications 조회/읽음처리 인증 없음 | MEDIUM | **신규**, JWT 적용 시 해소 |
| 공개 notify 엔드포인트 (상태 변경) | MEDIUM | 수용 |
| dashboard 통계 인증 없이 조회 | MEDIUM | JWT 적용 시 해소 |
| multer 파일 타입 검증 부재 | MEDIUM | 미해결 |
| 업로드 파일 공개 접근 | MEDIUM | 미해결 |
| PATCH status userRole 클라이언트 전달 | MEDIUM | JWT 적용 시 해소 |
| notification.createMany 트랜잭션 없음 | LOW | **신규**, 수용 |
| 'admin' sentinel roomNumber 통계 필터링 | LOW | 수용 |
| vote userId 클라이언트 전달 | LOW | JWT 적용 시 해소 |
| ResidentRecord 하드 삭제 | LOW | 수용 |
| ~~API_BASE_URL 하드코딩~~ | MEDIUM | **해결됨** |
| ~~Admin 투표 차단 버그~~ | CRITICAL | **해결됨** |

---

### 2026-03-04 — 회원가입 플로우 개편, 고객센터/시스템공지, Admin 웹 패널 세션

#### 이 세션에서 추가된 운영 위험 및 완화 조치

**[NEW-HIGH] JWT_SECRET 하드코딩 폴백**
- `const JWT_SECRET = process.env.JWT_SECRET || 'villamate-super-secret-2024'`
- 프로덕션 배포 시 `JWT_SECRET` 환경변수 미설정 시 소스코드에 공개된 시크릿으로 운영될 수 있음
- Admin 웹 패널이 이 JWT로 SUPER_ADMIN 권한 행사 → 시크릿 노출 시 전체 관리 권한 탈취 가능
- 해결 필요: `.env` 파일에 강력한 랜덤 시크릿 설정 필수 (`openssl rand -hex 32`)
- 현재 Admin 웹이 개발/내부 단계이므로 MVP 수용, 배포 전 필수 조치

**[NEW-HIGH] /api/auth/register — termsAgreed 서버 미검증**
- 클라이언트에서 `termsAgreed: true`를 바디에 담아 전송하지만 서버에서 값의 진위를 검증하지 않음
- 누구나 `termsAgreed: false`로 요청해도 계정 생성 가능 (법적 약관 동의 기록 부재)
- MVP 단계 수용, 향후 서버에서 `if (!termsAgreed) return 400` 명시적 검증 및 DB에 동의 시각 기록 필요

**[GOOD] 회원가입/로그인 분리 — 운영 위험 감소**
- 기존 upsert 방식: 동일 이메일로 재요청 시 항상 기존 계정 조회 → 비밀번호 변경 없이 로그인 가능했던 취약점 제거
- 개선: 신규 `POST /api/auth/register`에서 이미 존재하는 이메일은 409 반환 → 중복 가입 차단
- 이메일 로그인은 bcrypt.compare로 비밀번호 검증 → 인증 강도 향상

**[NEW-MEDIUM] Admin 웹 패널 CORS 설정 미적용**
- `app.use(cors())` — 모든 오리진 허용. Admin 웹이 분리된 도메인에서 운영될 경우 제한 없음
- 현재 내부 네트워크(로컬)에서만 운영이므로 실질 위험 낮음
- 향후: `cors({ origin: ['https://admin.villamate.app'] })` 특정 도메인만 허용 필요

**[NEW-LOW] SystemNotice/FAQ DB 모델 — hard delete**
- `DELETE /api/system-notices/:id`, `DELETE /api/faqs/:id`가 실제 DB 행 삭제
- 오류로 삭제 시 복구 불가, 삭제 감사 로그 없음
- Admin 웹이 내부 운영 도구이므로 현재 수용, 향후 soft delete 또는 삭제 로그 추가 고려

**[GOOD] SUPER_ADMIN 전용 API 역할 체크**
- 모든 Admin 전용 엔드포인트에서 `decoded.role !== 'SUPER_ADMIN'` 검증 일관 적용
- 일반 ADMIN 역할의 JWT가 있어도 SUPER_ADMIN API 접근 불가 → 권한 분리 올바름

#### 현재 누적 위험 현황 요약 (2026-03-04 기준)

| 위험 | 수준 | 상태 |
|------|------|------|
| API 인증 미들웨어 없음 (앱 API) | HIGH | 미해결 |
| PortOne 결제 서버 검증 없음 | HIGH | 미해결 |
| JWT_SECRET 하드코딩 폴백 | HIGH | **신규**, 배포 전 필수 조치 |
| termsAgreed 서버 미검증 | HIGH | **신규**, 법적 리스크 |
| ~~비밀번호 해싱 없음~~ | HIGH | **해결됨** |
| expoPushToken 인증 없이 덮어쓰기 | MEDIUM | JWT 적용 시 해소 |
| send-push 인증 없이 대량 발송 | MEDIUM | JWT 적용 시 해소 |
| notifications 조회/읽음처리 인증 없음 | MEDIUM | JWT 적용 시 해소 |
| Admin 웹 CORS 전체 허용 | MEDIUM | **신규**, 수용 |
| 공개 notify 엔드포인트 (상태 변경) | MEDIUM | 수용 |
| dashboard 통계 인증 없이 조회 | MEDIUM | JWT 적용 시 해소 |
| multer 파일 타입 검증 부재 | MEDIUM | 미해결 |
| 업로드 파일 공개 접근 | MEDIUM | 미해결 |
| PATCH status userRole 클라이언트 전달 | MEDIUM | JWT 적용 시 해소 |
| SystemNotice/FAQ hard delete | LOW | **신규**, 수용 |
| notification.createMany 트랜잭션 없음 | LOW | 수용 |
| 'admin' sentinel roomNumber 통계 필터링 | LOW | 수용 |
| vote userId 클라이언트 전달 | LOW | JWT 적용 시 해소 |
| ResidentRecord 하드 삭제 | LOW | 수용 |
| ~~API_BASE_URL 하드코딩~~ | MEDIUM | **해결됨** |
| ~~Admin 투표 차단 버그~~ | CRITICAL | **해결됨** |

---

### 2026-03-06 — 관리자 가이드 라이브러리, Admin 웹 대시보드 시각화, 보안 취약점 수정 세션

#### 이 세션에서 추가된 운영 위험 및 완화 조치

**[RESOLVED] C2: 인증 응답에 password 필드 노출**
- 기존: `res.json(user)` — bcrypt 해시 포함된 password 필드가 모든 인증 응답에 노출
- 해결: `sanitizeUser()` 헬퍼로 `password`, `expoPushToken`, `providerId` 제거 후 응답
- 8개 엔드포인트 모두 적용 완료
- **[RESOLVED]** 2026-03-02부터 존재했던 bcrypt 해시 노출 위험 해소

**[RESOLVED] C1: 모바일 로그인 API JWT 미발급**
- 기존: 로그인/회원가입 응답에 JWT 없음 → 모바일 클라이언트가 인증 토큰 없이 동작
- 해결: 모든 로그인/회원가입 응답에 `jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '30d' })` 추가
- 이제 모바일 앱이 수신한 `token`을 저장하여 인증 필요 요청에 사용 가능
- **주의**: 모바일 앱(AsyncStorage)에 token 저장 로직은 아직 미구현 — 다음 스프린트에서 반드시 추가 필요

**[RESOLVED] C4: PATCH /api/villas/:villaId/subscribe 무인증 구독 활성화**
- 기존: 누구나 villaId만 알면 구독을 무료로 ACTIVE로 변경 가능
- 해결: `authenticateUser` 미들웨어 + `role !== 'SUPER_ADMIN'` 시 403 반환
- **[RESOLVED]** SaaS BM 핵심 게이트웨이 보호

**[RESOLVED] C5: Admin 웹 XSS — dangerouslySetInnerHTML**
- 기존: DB에 저장된 Rich Text HTML을 `dangerouslySetInnerHTML={{ __html: guide.content }}`로 직접 렌더링
- 해결: `DOMPurify.sanitize(guide.content)` 적용
- **[RESOLVED]** Admin 내부 도구라도 XSS 방지 필수 (악의적 관리자 또는 DB 주입 공격 대비)

**[NEW-LOW] 모바일 앱 JWT token 미저장**
- 백엔드가 `token`을 응답에 포함하기 시작했으나, 모바일 앱 측에서 AsyncStorage에 저장하는 로직 미구현
- 현재 상태: JWT 발급은 되지만 앱에서 사용하지 않음 → 인증 미들웨어 적용 효과가 없음
- 해결 필요: 각 로그인 화면(LoginScreen, EmailLoginScreen, SocialLogin 등)에서 `token` 수신 후 `AsyncStorage.setItem('token', token)` 저장 + 모든 fetch 요청에 `Authorization: Bearer ${token}` 헤더 추가

**[NEW-LOW] /api/guides POST/PUT/DELETE — Admin 앱에서도 가이드 관리 가능성**
- SUPER_ADMIN JWT로만 보호되어 있으나, 일반 Admin 사용자도 JWT가 생기면 접근 시도 가능
- SUPER_ADMIN role 체크는 올바르게 적용됨 → 일반 Admin 접근 차단 보장

#### 현재 누적 위험 현황 요약 (2026-03-06 기준)

| 위험 | 수준 | 상태 |
|------|------|------|
| ~~C2: password 필드 API 응답 노출~~ | HIGH | **해결됨** (sanitizeUser 적용) |
| ~~C4: 구독 활성화 무인증~~ | HIGH | **해결됨** (SUPER_ADMIN 인증) |
| ~~C5: Admin 웹 XSS~~ | HIGH | **해결됨** (DOMPurify) |
| 모바일 앱 JWT token 미저장 | MEDIUM | **신규**, 다음 스프린트 필수 |
| API 인증 미들웨어 없음 (앱 API 전반) | HIGH | 부분 해소(구독), 전반 미해결 |
| PortOne 결제 서버 검증 없음 | HIGH | 미해결 |
| JWT_SECRET 하드코딩 폴백 | HIGH | 배포 전 필수 조치 |
| termsAgreed 서버 미검증 | HIGH | 법적 리스크 |
| 구독 쿠폰 서버 미검증 | HIGH | SaaS BM 리스크 |
| 구독 만료 시 API 접근 제한 없음 | MEDIUM | JWT 적용 시 추가 |
| multer 파일 타입 검증 부재 | MEDIUM | 미해결 |
| 업로드 파일 공개 접근 | MEDIUM | 미해결 |
| ~~API_BASE_URL 하드코딩~~ | MEDIUM | **해결됨** |
| ~~Admin 투표 차단 버그~~ | CRITICAL | **해결됨** |
| ~~비밀번호 해싱 없음~~ | HIGH | **해결됨** |

---

### 2026-03-05 — 백오피스 웹 완성, 공지/FAQ 연동, 온보딩 정규화, SaaS BM 세션

#### 이 세션에서 추가된 운영 위험 및 완화 조치

**[NEW-HIGH] 구독 쿠폰 코드 서버 미검증 — SaaS BM 리스크**
- 쿠폰 코드 입력 시 DB 쿠폰 테이블의 존재 여부, `isUsed` 플래그, 만료일 미검증 시 임의 문자열로 무제한 무료 사용 가능
- SaaS 수익 모델의 핵심 게이트웨이인 쿠폰 검증이 취약하면 BM 자체가 붕괴
- **해결 필요**: DB `Coupon` 테이블 (code, isUsed, usedAt) + 서버에서 원자적 `findFirst + update` 처리 (동시 요청 레이스 컨디션 방지)

**[NEW-MEDIUM] 구독 만료 시 API 접근 제한 없음**
- `subscriptionStatus: EXPIRED` Admin도 청구서 발행, 입주민 관리 등 모든 핵심 API 사용 가능
- SaaS 수익 전환 유인이 사라짐 — 구독 검증 미들웨어가 없으면 서비스 무단 사용 가능
- JWT 인증 미들웨어 도입 시 구독 상태 체크 로직 함께 추가 필요

**[NEW-MEDIUM] VillaSearchScreen 입주 신청 — 스팸 신청 가능**
- 초대 코드 없이 누구나 임의 빌라에 입주 신청 가능
- 관리자 승인 플로우가 있으나 대량 스팸 신청 시 관리자 부담 증가
- MVP 단계 수용, 향후 rate limiting 또는 전화번호 인증 추가 권장

**[GOOD] 수동 계좌 송금 BM — 위험 최소화 선택**
- PG 연동 없이 "입금 완료 알림" 버튼 → 관리자 수동 확인 방식 채택
- PG 결제 서버 검증 취약점(기존 HIGH 위험) 노출 범위를 구독 BM에서 완전히 회피한 올바른 설계
- 검증 복잡성 없이 MVP BM 실증에 집중 가능

#### 현재 누적 위험 현황 요약 (2026-03-05 기준)

| 위험 | 수준 | 상태 |
|------|------|------|
| API 인증 미들웨어 없음 (앱 API) | HIGH | 미해결 |
| PortOne 결제 서버 검증 없음 | HIGH | 미해결 |
| JWT_SECRET 하드코딩 폴백 | HIGH | 배포 전 필수 조치 |
| termsAgreed 서버 미검증 | HIGH | 법적 리스크 |
| 구독 쿠폰 서버 미검증 | HIGH | **신규**, SaaS BM 리스크 |
| ~~비밀번호 해싱 없음~~ | HIGH | **해결됨** |
| 구독 만료 시 API 접근 제한 없음 | MEDIUM | **신규**, JWT 적용 시 추가 |
| VillaSearch 스팸 신청 | MEDIUM | **신규**, 수용 |
| expoPushToken 인증 없이 덮어쓰기 | MEDIUM | JWT 적용 시 해소 |
| send-push 인증 없이 대량 발송 | MEDIUM | JWT 적용 시 해소 |
| notifications 조회/읽음처리 인증 없음 | MEDIUM | JWT 적용 시 해소 |
| Admin 웹 CORS 전체 허용 | MEDIUM | 수용 |
| 공개 notify 엔드포인트 (상태 변경) | MEDIUM | 수용 |
| multer 파일 타입 검증 부재 | MEDIUM | 미해결 |
| 업로드 파일 공개 접근 | MEDIUM | 미해결 |
| SystemNotice/FAQ hard delete | LOW | 수용 |
| notification.createMany 트랜잭션 없음 | LOW | 수용 |
| ~~API_BASE_URL 하드코딩~~ | MEDIUM | **해결됨** |
| ~~Admin 투표 차단 버그~~ | CRITICAL | **해결됨** |

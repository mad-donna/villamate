---
name: QA
description: "Use this agent when you need to review recently written or modified code for quality, correctness, security, maintainability, and operational readiness. Trigger this agent after writing a significant chunk of code, completing a feature, writing a database migration, updating deployment configuration, or before submitting a pull request.\n\n<example>\nContext: The user has just implemented a new authentication function.\nuser: \"I just wrote the login function, can you check it?\"\nassistant: \"I'll launch the code-reviewer agent to review your recently written login function.\"\n<commentary>\nSince the user has written new code and wants it reviewed, use the Task tool to launch the code-reviewer agent.\n</commentary>\n</example>\n\n<example>\nContext: The user has completed a feature implementation.\nuser: \"I finished implementing the payment processing module.\"\nassistant: \"Great work! Let me use the code-reviewer agent to review the code you just wrote.\"\n<commentary>\nSince a significant piece of code was completed, proactively use the Task tool to launch the code-reviewer agent.\n</commentary>\n</example>\n\n<example>\nContext: The user has written a database migration or deployment config.\nuser: \"I just wrote a database migration script for our production database.\"\nassistant: \"I'll review the migration for code quality and operational risks.\"\n<commentary>\nInfrastructure-affecting code warrants both a code quality and ops risk review — use the code-reviewer agent.\n</commentary>\n</example>\n\n<example>\nContext: The user is about to submit a pull request.\nuser: \"I'm about to open a PR for this feature branch.\"\nassistant: \"Before you submit the PR, let me run the code-reviewer agent to catch any issues.\"\n<commentary>\nBefore a PR submission, proactively use the Task tool to launch the code-reviewer agent to ensure code quality and production readiness.\n</commentary>\n</example>"
model: sonnet
color: green
memory: project
---

You are an elite code reviewer and operational risk analyst with deep expertise in software engineering principles, security, performance, and production reliability. You review code with two lenses simultaneously: **code quality** (is this correct, clean, and maintainable?) and **operational readiness** (is this safe to ship to production?).

## Core Responsibilities

You review **recently written or modified code** — not the entire codebase — unless explicitly instructed otherwise. Focus your review on the diff, the new additions, or the specific files/functions the user points to.

## Review Dimensions

### 1. Correctness
- Logic errors, off-by-one errors, incorrect conditionals
- Edge cases that aren't handled (null/undefined, empty collections, boundary values)
- Incorrect assumptions about data types or API contracts
- Race conditions or concurrency issues

### 2. Security
- Input validation and sanitization
- SQL injection, XSS, CSRF vulnerabilities
- Insecure use of cryptography or hashing
- Hardcoded secrets, credentials, or sensitive data
- Improper access control or authorization checks
- Exposed internal error details in API responses
- Unsafe deserialization

### 3. Performance & Scalability
- Unnecessary computations inside loops
- N+1 query problems or missing database indexes
- Unbounded queries without pagination
- Memory leaks or excessive memory allocation
- Blocking operations in async contexts
- Operations that don't scale with data growth

### 4. Reliability & Data Integrity
- Irreversible operations without safeguards (destructive queries, file deletions)
- Missing transactions or improper transaction boundaries
- Lack of retry logic or timeout handling for external calls
- No graceful degradation for downstream failures
- Data migration risks (rollback strategy, zero-downtime compatibility)
- Lack of idempotency in critical operations

### 5. Maintainability & Readability
- Unclear variable/function/class names
- Functions that are too long or doing too many things (SRP violations)
- Duplicated code that should be abstracted
- Missing comments for complex or non-obvious logic
- Magic numbers or strings without named constants
- Adherence to project-specific coding standards

### 6. Error Handling & Observability
- Missing try/catch blocks or silent failures
- Insufficient error messages for debugging
- Improper cleanup in error paths (resources not released)
- Missing or insufficient logging for critical paths
- Error messages that expose internal details to users

### 7. Deployment & Operational Risk
- Breaking changes without backward compatibility
- Database migrations with no rollback plan or downtime risk
- Hard-coded values that should be environment-configurable
- Infrastructure or config changes with high blast radius
- Missing feature flags for risky changes

## Output Format

### Summary
A 2-3 sentence overall assessment of the code quality and production readiness, including an overall risk level: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

### Critical Issues 🔴
Issues that **must** be fixed before merging (bugs, security vulnerabilities, data loss risks, production blockers). For each:
- **Location**: File name and line number(s) if available
- **Issue**: Clear description of the problem
- **Impact**: What could go wrong
- **Fix**: Concrete code example or specific guidance

### Major Issues 🟠
Significant problems that should be addressed but may not block merging (performance problems, poor error handling, maintainability concerns, operational risks).

### Minor Issues 🟡
Style, naming, and readability suggestions that would improve code quality.

### Positive Observations ✅
Note what was done well — reinforces good patterns and keeps the review constructive.

### Deployment Checklist
For changes that touch infrastructure, migrations, or production-critical paths, include a pre-deploy checklist:
- [ ] Specific pre-deployment verification step
- [ ] Rollback plan verified
- [ ] ...

## Behavioral Guidelines

- **Be specific**: Always cite the exact location (file, line, function) and provide concrete fix examples.
- **Be constructive**: Frame issues as opportunities for improvement, not criticisms.
- **Be proportionate**: Not every issue is critical — calibrate severity accurately. Reserve Critical for production-blocking issues.
- **Be concise**: Don't over-explain. Developers are professionals.
- **Prioritize**: Lead with the most important issues.
- **Consider blast radius**: For each risk, note the scope of impact (single user, subset, all users, entire system).
- **Ask clarifying questions** if the context or intent of the code is unclear before making assumptions.

## Self-Verification

Before finalizing your review:
1. Re-read your Critical Issues — are they truly critical or did you over-escalate?
2. Did you provide actionable fixes for every issue you raised?
3. Did you acknowledge what was done well?
4. Is your review something a professional developer would find helpful rather than discouraging?
5. For infrastructure changes: did you consider the deployment and rollback story?

**Update your agent memory** as you discover recurring patterns, project-specific conventions, common issues in this codebase, and architectural decisions. This builds institutional knowledge across conversations.

Examples of what to record:
- Coding conventions specific to this project (naming patterns, file structure, preferred libraries)
- Recurring issues or anti-patterns observed in past reviews
- Architectural decisions that explain non-obvious code choices
- Security-sensitive areas of the codebase that deserve extra scrutiny
- Known high-risk areas (payment flows, auth, migrations)

# Persistent Agent Memory

You have a persistent agent memory directory at `D:\villamate\.claude\agent-memory\code-reviewer\`. Its contents persist across conversations.

As you work, consult your memory files to build on previous experience. When you encounter a pattern worth preserving, record it.

Guidelines:
- `MEMORY.md` is always loaded into your system prompt — lines after 200 will be truncated, so keep it concise
- Create separate topic files (e.g., `patterns.md`, `security.md`) for detailed notes and link from MEMORY.md
- Update or remove memories that turn out to be wrong or outdated
- Organize memory semantically by topic, not chronologically

What to save:
- Stable patterns and conventions confirmed across multiple interactions
- Key architectural decisions, important file paths, and project structure
- Recurring bugs or anti-patterns seen in this codebase
- Security-sensitive components that always need extra scrutiny

What NOT to save:
- Session-specific context (current task details, in-progress work, temporary state)
- Information that might be incomplete — verify against project docs before writing
- Anything that duplicates or contradicts existing CLAUDE.md instructions

## Searching past context

When looking for past context:
1. Search topic files in your memory directory:
```
Grep with pattern="<search term>" path="D:\villamate\.claude\agent-memory\code-reviewer\" glob="*.md"
```
2. Session transcript logs (last resort — large files, slow):
```
Grep with pattern="<search term>" path="C:\Users\dmleh\.claude\projects\D--villamate/" glob="*.jsonl"
```

---

## 프로젝트 진행 기록 (2026-04-04)

### 코드 리뷰 체크리스트 (Phase 1 구현 기준)

#### 보안 위험 지점
| 위치 | 위험 | 상태 |
|------|------|------|
| `lib/auth.ts` | JWT_SECRET 환경변수 미설정 시 서버 시작 실패해야 함 | 확인 필요 |
| `/api/cron/*` | CRON_SECRET 검증으로 외부 호출 방어 | ✅ 구현됨 |
| `/api/villas/join` | 초대 코드 브루트포스 (6자리 = 36^6 ≈ 21억) | 현재 Rate Limit 없음 ⚠️ |
| `InvoicePayment.paidAt` | PENDING 재전환 시 paidAt null 초기화 여부 | 확인 필요 |

#### 데이터 정합성
- `InvoicePayment` 유니크: `[invoiceId, roomNumber]` — 전출 후 재입주 시 같은 호수 중복 가능성 확인 필요
- 쿠폰 활성화: `$transaction` 원자적 처리로 이중 사용 방지 ✅
- 알림 1일 쿨타임: DB에 쿨타임 메타데이터 없이 `Notification.createdAt` 조회로 구현 — 알림 삭제 시 쿨타임 우회 가능 ⚠️

#### 운영 리스크
- Vercel Hobby 플랜 Cron: 하루 1회 제한 — 두 개 Cron (invoice-reminder, expire-subscriptions) 확인 필요
- Prisma `$transaction` 타임아웃: 기본 5초 — 대규모 빌라(100세대+) 청구서 발행 시 타임아웃 가능성

#### 알려진 기술 부채
- `SubscriptionGuard` 헬퍼(`requireActiveSubscription`) 존재하나 기존 청구서/알림 라우트에 미적용
- TypeScript strict 미활성화 — `any` 타입 잠재적 존재

---

## 2026-04-04 업데이트

### Critical 수정 (즉시 적용 완료)

**CRON_SECRET undefined 우회 취약점**
- **문제**: CRON_SECRET 환경변수 미설정 시 `Authorization: Bearer undefined` 문자열로 우회 가능했음
- **수정**: 3개 Cron 라우트 모두 `CRON_SECRET === undefined` 시 즉시 500 반환
- **위치**: `/api/cron/invoice-reminder`, `/api/cron/expire-subscriptions`, `/api/cron/publish-invoices`

**JWT_SECRET production throw**
- **문제**: JWT_SECRET 미설정 시 서버가 비정상 동작하지만 시작은 됨
- **수정**: `lib/auth.ts` 초기화 시 `!process.env.JWT_SECRET` → throw Error (서버 기동 불가)
- **효과**: 운영 환경에서 비밀 키 없이 배포 방지

### Major 수정

**Cron KST 스케줄 교정**
- `publish-invoices` 스케줄: `"0 0 * * *"` (UTC 00:00 = KST 09:00) → `"0 15 * * *"` (UTC 15:00 = KST 00:00)
- **이유**: 자정 자동 발행이 실제로는 오전 9시에 실행되던 버그

**7일차 독촉 알림 버그**
- **문제**: 7일차 조건 중복 체크 쿼리가 3일차 알림(`title contains '미납'`)도 포함하여 7일차 알림이 발송되지 않음
- **수정**: 3일차 `title contains '3일'`, 7일차 `title contains '최종'`으로 분리

**트랜잭션 실패 시 알림 오발송**
- **문제**: `$transaction` 내부 실패 후 rollback되어도 외부에서 이미 알림 발송된 경우 존재
- **수정**: 알림 발송을 transaction 외부, `await tx` 성공 확인 이후로 이동

### 미해결 기술 부채

| 항목 | 위험도 | 비고 |
|------|--------|------|
| invoice-reminder N+1 쿼리 | Medium | 미납 세대별 알림 중복 조회 — 대규모 빌라에서 느려질 수 있음 |
| 금액 0 InvoicePayment 독촉 | Low | 금액 0인 청구도 독촉 대상에 포함됨 |
| 알림 API `take: 50` 하드코딩 | Low | 페이지네이션 미구현 |
| 초대 코드 Rate Limit | Low | 6자리 코드 브루트포스 방어 없음 |

---

## 2026-04-05 업데이트

### 신규 구현 QA 체크리스트

#### F-29 PortOne 결제 검증 위험 지점

| 위치 | 위험 | 상태 |
|------|------|------|
| `verify/route.ts` | PortOne API 502 시 결제 완료됐지만 DB 미반영 가능 | ⚠️ 미해결 — 결제 후 수동 확인 필요 |
| `verify/route.ts` | `merchant_uid` 검증: `includes(paymentId)` — 악의적 uid 조작 가능성 낮으나 `startsWith` 더 엄격 | Low |
| 클라이언트 결제 플로우 | `payingId` 중복 클릭 방지 구현됨 | ✅ |
| `InvoicePayment.impUid` | `prisma db push`로 추가됨 — migration 파일 없음 | ⚠️ rollback 불가 |

#### F-30 PDF 저장 위험 지점

| 위치 | 위험 | 상태 |
|------|------|------|
| `InvoicePDFButton` | `window.open` 팝업 차단 브라우저에서 실패 | ⚠️ 팝업 차단 안내 필요 |
| Web Share API | iOS Safari 14+ 지원, 이전 버전 fallback 클립보드 복사 | ✅ 분기 처리됨 |

#### F-31 외부 청구 위험 지점

| 위치 | 위험 | 상태 |
|------|------|------|
| `/api/pay/[billId]/confirm` | 공개 엔드포인트 — Rate Limit 없음, 동일 billId 반복 요청 가능 | ⚠️ |
| `ExternalBillingStatus.COMPLETED` 체크 | 이미 완료 시 400 반환 — 이중 결제 방지 ✅ | ✅ |
| PortOne 금액 검증 | `dbAmount !== pgAmount` 정수 비교 — Decimal 변환 필요 확인 | 확인 필요 |

#### Vercel 배포 운영 리스크

| 항목 | 위험 |
|------|------|
| Cold Start | Serverless Function 콜드 스타트 — Prisma 연결 초기화 지연 가능 |
| DB Connection | Supabase Connection Pooler 사용 필수 (Transaction Pooler, 포트 6543) |
| Cron 실패 알림 | Vercel Cron 실패 시 알림 없음 — 모니터링 미구현 |

---

## 2026-04-07 업데이트

### F-51/52/53 민원 시스템 QA 체크리스트

#### 보안 위험 지점

| 위치 | 위험 | 상태 |
|------|------|------|
| `PATCH /tickets/[ticketId]` | ADMIN role 검증 구현됨 | ✅ |
| `GET /tickets` | RESIDENT는 `reporterId: user.sub` 필터 적용 — 타인 민원 조회 불가 | ✅ |
| `POST /tickets` | villaId는 params에서, reporterId는 JWT에서 — 클라이언트 조작 불가 | ✅ |

#### 데이터 정합성

| 항목 | 상태 |
|------|------|
| 상태 전환 단방향 강제 (VALID_TRANSITIONS 맵) | ✅ PENDING→IN_PROGRESS→RESOLVED만 허용 |
| 알림 생성 실패 시 PATCH 응답 | ⚠️ `notifyTicketStatusChange` 동기 실행 — DB 장애 시 500 반환 |
| villaId 소속 검증 | ✅ `findUnique({ where: { id: ticketId, villaId } })` |

#### 빌드 오류 이력

| 오류 | 원인 | 수정 |
|------|------|------|
| `Type '"default"' is not assignable to type 'BadgeVariant'` | `BadgeVariant`에 `'default'` 없음 | `'neutral'`로 수정 |

---

## 2026-04-07 버그 수정 QA 기록

### 운영 이슈 — PgBouncer prepared statement 오류

| 항목 | 내용 |
|------|------|
| 증상 | 대시보드, 빌라 등록 등 Prisma 쿼리 시 간헐적 500 오류 |
| 로그 | `PostgresError { code: "26000", message: "prepared statement does not exist" }` |
| 원인 | Supabase PgBouncer 트랜잭션 모드 + Prisma prepared statement 기본값 충돌 |
| 해결 | Vercel 환경변수 `DATABASE_URL`에 `?pgbouncer=true` 추가 후 재배포 |
| 재현 | Vercel Serverless Function의 cold start + 연결 풀 교체 시 발생 |
| 체크 | `prisma db push`는 `directUrl`(직접 연결) 사용 → 영향 없음 |

### localStorage 필드 경로 버그 패턴 (안티패턴 등록)

10개 페이지에서 `user.villaId`(존재하지 않는 필드)를 읽어 villaId가 항상 빈 문자열 → API 미호출 → 데이터 미표시.

| 증상 | 원인 | 수정 |
|------|------|------|
| 세대 호수 관리에 "등록된 호수가 없습니다" | `user.villaId` → undefined | `user.villa?.id` |
| 커뮤니티 게시글 미표시 | 동일 | 동일 |
| 민원 목록 미표시 | 동일 | `user.residentVilla?.id ?? user.villa?.id` |

**앞으로 체크 포인트**: localStorage에서 villaId 읽는 코드 신규 작성 시 `user.villa?.id` (admin) 또는 `user.residentVilla?.id ?? user.villa?.id` (resident) 사용 확인.

### fetch 에러 처리 — 잘못된 상태 표시

| 증상 | 원인 | 수정 |
|------|------|------|
| 홈 화면에서 "빌라가 등록되지 않았습니다" (실제로는 서버 오류) | `.catch(() => setNeedsSetup(true))` | `fetchError` 별도 상태 분리 |

### 미해결 기술 부채 (2026-04-07 추가)

| 항목 | 위험도 | 비고 |
|------|--------|------|
| API catch 블록 에러 로깅 미흡 | Medium | `/api/villas/route.ts`에 `console.error` 추가 완료, 나머지 라우트 일괄 적용 필요 |
| Vercel 함수 에러 알림 | Medium | 운영 중 500 에러 무음 처리 — Vercel Webhook/Slack 알림 미설정 |

---

## 2026-04-10 업데이트

### F-46/47/48 커뮤니티 확장 QA 체크리스트

#### F-46 댓글 작성

| 위치 | 위험 | 상태 |
|------|------|------|
| `POST /posts/[postId]/comments` | villaId 소속 확인 + postId 존재 확인 이중 검증 | ✅ |
| 댓글 입력 폼 | 빈 댓글 제출 시 무시 (클라이언트 trim 체크) | ✅ |
| 댓글 등록 후 | re-fetch 없이 응답 comment 객체를 setComments에 직접 추가 | ✅ |
| `commentSubmitting` 가드 | 중복 제출 방지 (disabled 처리) | ✅ |

#### F-47 내 게시글

| 위치 | 위험 | 상태 |
|------|------|------|
| `GET /posts/my` | authorId === user.sub 필터 — 타인 게시글 노출 불가 | ✅ |
| 빌라 소속 확인 | admin OR resident 둘 다 허용 | ✅ |

#### F-48 이미지 첨부

| 위치 | 위험 | 상태 |
|------|------|------|
| `/api/upload` | 파일 타입 화이트리스트 (jpeg/png/webp/gif만 허용) | ✅ |
| `/api/upload` | 5MB 파일 크기 제한 | ✅ |
| `/api/upload` | 인증 필수 (JWT getUser 확인) | ✅ |
| 파일명 | `Date.now()-UUID.ext` 패턴 — 충돌 불가 | ✅ |
| imageUrl 저장 | posts POST API에서 `imageUrl ?? null` 처리 | ✅ |
| ⚠️ Supabase `posts` 버킷 | Public 설정 필요 — 미설정 시 이미지 URL 404 | 배포 시 수동 확인 필요 |

### F-54/55/56 전자투표 QA 체크리스트

#### 투표 생성 (F-54)

| 위치 | 위험 | 상태 |
|------|------|------|
| `POST /polls` | villa.adminId === user.sub 검증 — 관리자 전용 | ✅ |
| 종료일 검증 | `endDate <= new Date()` 시 400 반환 | ✅ |
| 선택지 최소 2개 | validOptions.length < 2 시 400 반환 | ✅ |

#### 투표 참여 (F-55)

| 위치 | 위험 | 상태 |
|------|------|------|
| `POST /vote` | ResidentType.HEAD 확인 — 세대주만 투표 가능 | ✅ |
| `POST /vote` | status === 'APPROVED' 확인 — 미승인 입주민 차단 | ✅ |
| 마감 투표 | `endDate < now()` 시 400 반환 | ✅ |
| 유효한 선택지 | optionId가 해당 poll의 option인지 검증 | ✅ |

#### 1세대 1표 (F-56)

| 위치 | 위험 | 상태 |
|------|------|------|
| DB 제약 | `@@unique([pollId, roomNumber])` — DB 레벨 강제 | ✅ |
| Prisma P2002 처리 | unique 위반 → "이미 투표한 세대입니다." 409 반환 | ✅ |
| 중복 클릭 | `voting` state로 클라이언트 중복 제출 방지 | ✅ |

#### 기명 투표 데이터 노출 정책

- 관리자: 항상 호수 목록 열람 가능
- 입주민: 투표 마감 후에만 열람 가능
- 익명 투표: 항상 호수 목록 비공개

#### 알려진 미구현 항목 (오늘 기준)

| 항목 | 비고 |
|------|------|
| F-58 투표 참여율 프로그레스 바 | 현재 voteCount 숫자만 표시, 전체 세대 대비 % 바 없음 |
| F-59 투표 수정 | 마감 전 수정 미구현 |
| F-60 미참여자 독촉 알림 | 미구현 |

---

## 2026-04-11 업데이트

### 전체 기능 QA 점검 결과

#### Major Issues (수정 완료)

| # | 위치 | 이슈 | 수정 |
|---|------|------|------|
| 1 | 관리자 5개 파일 | `user.villaId` → 항상 null | `user.villa?.id`로 수정 |
| 2 | `community/page.tsx:73` | `/community/new` 404 라우팅 | `/resident/community/new` |
| 3 | `GET /tickets` | ADMIN 타 빌라 민원 열람 가능 | `villa.adminId !== user.sub` 검증 추가 |
| 4 | `tickets/[ticketId]/route.ts` | 알림 실패 시 500 반환 (상태는 변경됨) | `.catch()` 비동기 분리 |
| 5 | TODO API 4개 | 200 OK 반환 (silent failure) | 501 반환으로 교체 |
| 6 | `/api/pay/[billId]/confirm` | Rate Limit 없는 공개 엔드포인트 | 인메모리 billId당 1분 5회 제한 |

#### Minor Issues (수정 완료)

| # | 위치 | 이슈 | 수정 |
|---|------|------|------|
| 1 | `POST /tickets` | try/catch 누락 | 전체 감쌈 |
| 2 | `invoices/my` | PENDING 신청자도 청구서 조회 가능 | `status: 'APPROVED'` 필터 추가 |
| 3 | `dashboard` | `?role=ADMIN` 쿼리 우회 가능 | JWT role만 사용 |
| 4 | `upload/route.ts` | 클라이언트 MIME 신뢰 | 매직 바이트(JPEG/PNG/WebP/GIF) 검증 추가 |
| 5 | `polls/[id]/page.tsx` | 낙관적 업데이트 퍼센트 오차 | 투표 후 서버 재조회 |
| 6 | `invoice-reminder/route.ts` | N+1 쿼리 | 단일 OR 쿼리로 최적화 |
| 7 | `notifications/route.ts` | `take: 50` 하드코딩 | cursor 기반 페이지네이션 |
| 8 | `vercel.json` | Cron KST 오전 실행 오류 | `"0 15 * * *"` (KST 00:00)으로 통일 |

#### Positive (검증 통과)
- 1세대 1표: DB unique + API + 클라이언트 3중 방어 + Race condition P2002 처리 ✅
- PortOne 결제: status + 금액 + merchant_uid 3중 검증 ✅
- CSRF 방어, 에러 메시지 보안, Cron 보안 ✅

#### 해소된 기술 부채
- `invoice-reminder` N+1 쿼리 → 단일 OR 쿼리 최적화 ✅
- 알림 `take: 50` → cursor 페이지네이션 ✅

#### 남은 기술 부채

| 항목 | 위험도 | 비고 |
|------|--------|------|
| `/api/pay/confirm` Rate Limit | Medium | 인메모리 방식 → 서버리스 인스턴스 간 공유 불가. Upstash Redis 전환 권장 |
| 초대 코드 Rate Limit | Low | 6자리 코드 브루트포스 방어 없음 |
| 이미지 업로드 고아 파일 | Low | 게시글 POST 실패 시 Supabase Storage에 파일 잔존 |
| API catch 에러 로깅 | Low | 일부 라우트 `console.error` 미적용 |

---

## 2026-04-11 (2차) 업데이트 — F-66~69, F-41/42, F-59/60, F-09, F-76, F-78/79

### 신규 기능 QA 체크리스트

#### F-09 회원 탈퇴 보안

| 위치 | 위험 | 상태 |
|------|------|------|
| `DELETE /api/auth/me` | ADMIN + 빌라 관리 중이면 탈퇴 차단 | ✅ |
| 탈퇴 후 이메일 | `deleted_{id}@villamate.invalid` — 중복 가입 불가 | ✅ |
| 탈퇴 후 로그인 | bcrypt(random UUID) — 기존 비밀번호로 접근 불가 | ✅ |
| 클라이언트 confirm | 두 단계 확인 다이얼로그 | ✅ |

#### F-59 투표 수정 데이터 정합성

| 위치 | 위험 | 상태 |
|------|------|------|
| 마감 투표 수정 | `endDate < now` 체크 → 400 | ✅ |
| 선택지 수정 불가 | PATCH body에서 options 무시 | ✅ (기존 투표 무결성 보장) |
| 종료일 과거 설정 | `endDate <= now` 시 400 | ✅ |

#### F-76/78 백오피스 보안

| 위치 | 위험 | 상태 |
|------|------|------|
| 백오피스 API | `role !== 'SUPER_ADMIN'` → 403 | ✅ |
| 백오피스 로그인 | `bo_token` vs 일반 `token` 네임스페이스 분리 | ✅ |
| 백오피스 레이아웃 | 클라이언트 사이드 가드만 — 서버 사이드 검증 없음 | ⚠️ 기술 부채 |
| 구독 상태 변경 | VALID_STATUSES 화이트리스트 검증 | ✅ |
| 만료일 형식 | `isNaN(expiry.getTime())` 검증 | ✅ |

#### F-60 Cron 독촉 알림 중복 방지

| 위치 | 위험 | 상태 |
|------|------|------|
| 이미 마감된 투표 | `endDate: { gt: now }` 조건 — 마감 투표 제외 | ✅ |
| 이미 투표한 세대 | `votes` Set 조회 후 필터링 | ✅ |
| 동일 날 중복 Cron | ⚠️ 중복 실행 방지 없음 — Vercel Cron 보장에 의존 | ⚠️ |

### 남은 기술 부채 (2026-04-11 2차 기준)

| 항목 | 위험도 | 비고 |
|------|--------|------|
| 백오피스 서버 사이드 인증 | High | 현재 클라이언트 가드만 존재 |
| `/api/pay/confirm` Rate Limit | Medium | 인메모리 → 서버리스 간 미공유 |
| 건물 이력 사진 `posts` 버킷 공유 | Medium | 전용 버킷 분리 권장 |
| Cron 중복 실행 방지 | Low | Vercel 보장 의존 |
| 공지 알림 발송 실패 추적 | Low | fire-and-forget 로그 없음 |

## 2026-04-12 QA 점검 결과 — Sprint 3

### 점검 범위
백오피스 콘텐츠 관리(F-80~83), 입주민 가이드·고객센터(F-87~90), NF-05/10/14

### Critical: 없음

### Major — 전부 수정 완료
1. **BackofficeGuard 플리커**: `checked` 상태 추가 → 인증 확인 전 `null` 반환
2. **KPI API 풀스캔**: `groupBy` + `$queryRaw DATE_TRUNC` DB 집계로 교체
3. **대시보드 3회 API 호출**: `/api/backoffice/kpi` 단일 호출로 통합 (`totals` 필드 추가)
4. **공개 API 무한 반환**: `take: 100/50/100` 상한 추가
5. **PATCH 빈 문자열 저장**: `trim()` 후 falsy 시 해당 필드 무시

### Minor — 4건 수정, 2건 주석 처리
- ✅ 백오피스 로그인 `JSON.parse` 미보호 → `getBoUser()` 재사용
- ✅ Guide category 화이트리스트 검증 추가
- ✅ 입주민 하단 패딩 pb-6/pb-8 → pb-20 통일
- ✅ `openEdit` 실패 시 alert 에러 피드백
- 📝 RichTextEditor onChange DOMPurify 미적용 (저장 시 적용되므로 실질적 위험 없음)
- 📝 Vercel Cron 5개 동시 스케줄 — Pro 플랜 확인 권장

### 체크리스트 패턴 (공개 API)
- `isPublished: true` 필터 + `take` 상한 + 비게시 404 처리

---

## 2026-04-13 QA 체크리스트 — F-43/F-77/F-04/F-05

### F-43 Web Push 보안

| 위치 | 위험 | 상태 |
|------|------|------|
| `POST /api/push/subscribe` | JWT 인증 필수 — `getUser()` 검증 | ✅ |
| `sendPushToUser()` | push 실패 시 알림함 저장은 보장 (fire-and-forget) | ✅ |
| Service Worker | HTTPS 환경에서만 동작 (Vercel 자동 HTTPS) | ✅ |
| VAPID env 미설정 | `getWebPush()` null 반환 → 푸시 스킵 (graceful degradation) | ✅ |

### F-77 Toss 자동결제 보안

| 위치 | 위험 | 상태 |
|------|------|------|
| `POST /billing-key` | villaId 소속 ADMIN 검증 | ✅ |
| `DELETE /billing-key` | ADMIN 소속 검증 | ✅ |
| `auto-payment Cron` | CRON_SECRET 검증 | ✅ 확인 필요 |
| 빌링키 저장 | DB에 billingKey 평문 저장 — 필요 시 암호화 검토 | ⚠️ 기술 부채 |
| Toss API 실패 | 결제 실패 시 구독 만료 유지 — 재시도 없음 | ⚠️ 재시도 로직 없음 |

### F-04/F-05 소셜 로그인 보안

| 위치 | 위험 | 상태 |
|------|------|------|
| state CSRF 방어 | `HttpOnly SameSite=Lax` 쿠키 → 콜백 검증 | ✅ |
| provider 검증 | `['kakao', 'google']` 화이트리스트 | ✅ |
| 소셜 계정 이메일 로그인 | `!user.password` → 동일 오류 메시지 (계정 존재 여부 은닉) | ✅ |
| `/profile-setup` 인증 | `token` 쿼리 파라미터로 API 호출 (localStorage 미저장 시점 대응) | ✅ |
| `social-complete` API | `needsSetup: false`로 JWT 재발급 — 중복 프로필 설정 방지 필요 | ⚠️ 확인 필요 |

### 남은 기술 부채 (2026-04-13 추가)

| 항목 | 위험도 | 비고 |
|------|--------|------|
| Toss 빌링키 평문 저장 | Medium | 암호화 또는 Toss Vault 검토 |
| Toss 자동결제 재시도 없음 | Medium | 일시적 네트워크 오류 시 당일 결제 실패 |
| 소셜 로그인 환경변수 미설정 | High | KAKAO/GOOGLE 시크릿 Vercel 등록 필요 |
| auto-payment Cron CRON_SECRET | Medium | 기존 Cron 패턴과 동일하게 검증 추가 확인 |

---

## 2026-04-14 QA 체크리스트 — Sprint 4

### F-49 댓글 푸시 알림 보안

| 위치 | 위험 | 상태 |
|------|------|------|
| 댓글 POST 권한 | JWT 인증 + villaId 소속 검증 | ✅ |
| 자기 자신 알림 | `authorId !== user.sub` 체크로 자기 댓글 알림 방지 | ✅ |
| 푸시 실패 처리 | `.catch(() => {})` fire-and-forget — 댓글 저장 성공은 보장 | ✅ |

### F-50 게시글 좋아요 보안

| 위치 | 위험 | 상태 |
|------|------|------|
| 토글 API 인증 | JWT + villaId 소속 검증 | ✅ |
| 중복 좋아요 | `@@unique([postId, userId])` DB 레벨 강제 + Prisma P2002 catch | ✅ |
| likeCount 정확성 | 낙관적 업데이트 없이 서버 응답 값 사용 | ✅ |

### F-65 에너지 사용량 보안

| 위치 | 위험 | 상태 |
|------|------|------|
| 입력 API 권한 | ADMIN 전용 + villaId 소속 검증 | ✅ |
| 조회 API 권한 | 입주민은 자신의 빌라만 조회 가능 | ✅ |
| upsert 중복 | `@@unique([villaId, year, month])` 월 1회 제한 | ✅ |
| 숫자 필드 유효성 | 음수/비숫자 입력 시 Prisma Int 타입 오류 반환 | ⚠️ 클라이언트 min=0 검증만 — 서버 검증 미구현 |

### F-72 QR 방문 차량 보안

| 위치 | 위험 | 상태 |
|------|------|------|
| QR 토큰 발급 | ADMIN 전용 + villaId 소속 검증 | ✅ |
| 비로그인 등록 | JWT `purpose === 'visitor-vehicle'` + `villaId` 일치 이중 검증 | ✅ |
| 토큰 만료 | 24시간 만료 — 장기 유효 QR 남용 방지 | ✅ |
| visitorName | 선택 필드 — 미입력 허용 | ✅ |
| 번호판 중복 | upsert 패턴으로 동일 번호판 재등록 시 업데이트 | ✅ |
| ownerId 위임 | 방문자 차량의 ownerId = villa.adminId (프록시 소유자) | ⚠️ 향후 방문자 차량 소유권 관리 시 재검토 필요 |

### F-84/85 백오피스 보안

| 위치 | 위험 | 상태 |
|------|------|------|
| billing API | `boAuthHeaders()` SUPER_ADMIN JWT 인증 | ✅ |
| mrr API | `boAuthHeaders()` SUPER_ADMIN JWT 인증 | ✅ |
| 타 빌라 데이터 | villaId 필터 — 미지정 시 전체 조회 (SUPER_ADMIN 의도적 전체 조회) | ✅ |
| `$queryRaw` SQL injection | TO_CHAR/DATE_TRUNC만 사용, 파라미터 없음 | ✅ |

### F-14/15 멀티 빌라·동대표 교체 보안

| 위치 | 위험 | 상태 |
|------|------|------|
| 빌라 전환 | `villa.adminId === user.sub` 검증 — 타인 빌라 탈취 방지 | ✅ |
| 동대표 교체 대상 | HEAD 입주민 APPROVED 상태 검증 | ✅ |
| 교체 트랜잭션 | `prisma.$transaction` 원자성 보장 | ✅ |
| 교체 후 기존 관리자 | JWT 무효화 없이 로그아웃 유도 — 기존 토큰은 만료 전까지 유효 | ⚠️ 기술 부채: 토큰 블랙리스트 없음 |

### 기술 부채 (2026-04-14 추가)

| 항목 | 위험도 | 비고 |
|------|--------|------|
| 에너지 입력 서버 유효성 검증 부재 | Low | 클라이언트 min=0만 있음, 음수 서버 입력 가능 |
| 방문 차량 ownerId 프록시 패턴 | Low | 방문자 차량 소유권 관리 로직 미비 |
| 동대표 교체 후 기존 JWT 유효 | Medium | 토큰 블랙리스트 미구현 — 만료 시간(30분?)까지 이전 관리자 토큰 유효 |
| QR 토큰 URL 노출 | Low | 24h 만료로 제한, URL 공유 시 타인도 사용 가능 — 단발성 토큰 발급 필요 시 재검토 |

---

## 2026-04-15 QA 세션 — 전체 보안 QA + 디자인 QA

### 보안 QA 발견 및 수정 항목

#### Critical

| 취약점 | 위치 | 수정 내용 |
|--------|------|-----------|
| JWT URL 노출 | 소셜 로그인 콜백 | pending_auth_token HttpOnly 쿠키 교환 패턴으로 전환 |
| 빌링키 평문 DB 저장 | `TossBillingKey.billingKey` | AES-256-GCM 암호화 (`lib/crypto.ts`) 도입, `encryptBillingKey/decryptBillingKey` |
| 백오피스 페이지 무인증 접근 | `/backoffice/*` 페이지 경로 | 미들웨어 matcher 확장 + `bo_session` HttpOnly 쿠키 검증 |

#### Major

| 취약점 | 위치 | 수정 내용 |
|--------|------|-----------|
| 구독 가격 불일치 (MRR: 29,900 / Cron: 19,900) | `mrr/route.ts`, `auto-payment/route.ts` | `lib/pricing.ts` 단일 소스로 통합 |
| 티켓 비소속 입주민 제출 | `POST /tickets` | villa 존재 검증 + APPROVED 소속 검증 추가 |
| PostLike 레이스 컨디션 | `POST /like` | Prisma P2002 catch → 멱등 응답 |
| 파일 업로드 MIME 클라이언트 신뢰 | `upload/route.ts` | 확장자를 MIME 매핑에서 결정, 클라이언트 filename 무시 |
| Cron 시간대 오류 | `vercel.json` auto-payment | `"0 0 * * *"` → `"0 15 * * *"` (KST 00:00 기준) |

#### Minor

| 항목 | 수정 내용 |
|------|-----------|
| 티켓 제목/내용 길이 제한 없음 | 서버 사이드 title ≤100, description ≤2000 추가 |
| QR 검증과 등록 엔드포인트 혼재 | `qr-verify` GET 엔드포인트 분리, DB 기록 없음 |
| profile-setup 소셜 토큰 race condition | `useState(() => searchParams.get('token'))` 초기화 함수로 수정 |
| 백오피스 로그아웃 쿠키 미삭제 | `POST /api/backoffice/auth/logout` 신규 추가 |

### 디자인 QA 발견 및 수정 항목

#### 접근성 (WCAG 2.1 AA)

| 항목 | 위치 | 수정 내용 |
|------|------|-----------|
| `<span onClick>` 비시맨틱 | `Chip.tsx` | `<button type="button">` 변경 |
| `<li onClick>` 비시맨틱 | `NotificationList.tsx` | `<li><button>` 중첩 구조로 변경 |
| 터치 타깃 미달 (40px) | 여러 페이지 버튼 | `min-h-[44px]` 적용 |
| 장식 SVG aria | 로그인·헤더 SVG | `aria-hidden="true"` 추가 |
| formError 알림 미흡 | `vehicles/page.tsx` | `role="alert"` 추가 |

#### 디자인 시스템 일관성

| 항목 | 수정 내용 |
|------|-----------|
| 하드코딩 색상 38개 파일 | `globals.css`에 누락 토큰 17개 추가 후 시맨틱 토큰으로 교체 |
| `window.confirm/alert` 36개 | `useConfirm` 훅 + `ConfirmDialog` 컴포넌트로 전환 |
| Badge 한국어 변형 제거 | `Badge.tsx` 시맨틱 variant로 통합 |
| 텍스트 계층 불일치 | 헤더 `text-2xl` → `text-xl` 축소 (모바일 기준) |
| Suspense 폴백 누락 | `login/page.tsx`, `profile-setup/page.tsx` — `<Suspense>` 래퍼 추가 |
| href 라우팅 버그 2개 | 관리자 홈 온보딩 CTA, 입주민 홈 커뮤니티 링크 수정 |
| pb-16 → pb-24 | `subscription/page.tsx` — BottomNav 겹침 방지 |

### 남은 기술 부채 (2026-04-15 기준)

| 항목 | 위험도 | 조치 필요 |
|------|--------|----------|
| `BILLING_ENCRYPTION_KEY` Vercel 미등록 | Critical | 사용자가 Vercel Dashboard에 수동 등록 필요 |
| 기존 평문 빌링키 마이그레이션 | High | 암호화 배포 후 one-time 마이그레이션 스크립트 실행 필요 |
| 동대표 교체 후 JWT 블랙리스트 | Medium | 잔존 |
| 에너지 입력 서버 유효성 검증 | Low | 잔존 |

---

## 2026-04-16 버그 수정 QA 세션

### 발견 및 수정된 버그

#### Critical — Authorization 헤더 누락 패턴 (8개 호출)

| 파일 | 누락된 API 호출 | 증상 |
|------|----------------|------|
| `(admin)/community/new/page.tsx` | `POST /posts` | "Unauthorized" |
| `(resident)/resident/community/new/page.tsx` | `POST /posts` | "Unauthorized" |
| `(admin)/community/[id]/page.tsx` | `POST /comments`, `DELETE /posts`, `POST /like` | 각 기능 실패 |
| `(resident)/resident/community/[id]/page.tsx` | `POST /comments`, `DELETE /posts`, `POST /like` | 각 기능 실패 |
| `(admin)/manage/residents/page.tsx` | `PATCH /villas/:id` (호수 저장) | 저장 무반응 |

**원인 패턴**: GET 요청에는 헤더 추가했지만 POST/PATCH/DELETE에서 누락. 새 API 호출 작성 시 인증이 필요한 메서드에 Authorization 헤더 확인 필수.

**올바른 패턴**:
```typescript
const token = localStorage.getItem('token') ?? '';
const res = await fetch(`/api/...`, {
  method: 'POST',  // 또는 PATCH, DELETE
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,  // ← 반드시 포함
  },
  body: JSON.stringify({ ... }),
});
```

#### High — 하단 시트 z-index 계층 버그

**증상**: 세대 호수 저장 후 성공 토스트가 보이지 않음 (하단 시트 뒤에 숨김)

**원인**: 
- 하단 시트: `z-80`
- 성공 토스트: `z-60` (시트보다 낮음)

**수정**: 토스트를 `z-90`으로 상향. `setSheetOpen(false)` → 이후 `showToast()` 순서로 호출해야 토스트가 잔상 없이 표시됨.

**z-index 계층 기준 (2026-04-16 확정)**:
```
z-50  BottomNav
z-70  일반 오버레이 (backdrop)
z-80  하단 시트 (BottomSheet)
z-90  토스트 / 알림 (항상 최상위)
```

#### Medium — 스텁 페이지 안티패턴

**증상**: `/ledger` 접속 시 빈 화면

**원인**: `(admin)/ledger/page.tsx`가 `<h1>장부</h1>`만 반환하는 스텁으로 방치

**수정**: `(admin)/manage/ledger/page.tsx`의 완전한 구현으로 교체

**예방**: 새 라우트 파일 생성 시 스텁 대신 최소한 "준비 중" 안내 문구 + 뒤로가기 버튼 제공 원칙.

### QA 체크리스트 추가 항목

커뮤니티, 민원 등 새 기능 구현 후 반드시 확인:
- [ ] POST/PATCH/DELETE 모든 API 호출에 `Authorization: Bearer ${token}` 포함 여부
- [ ] 성공/오류 토스트가 하단 시트 위에 보이는지 (z-index)
- [ ] 새 라우트 파일이 스텁이 아닌 실제 구현인지

---

## 2026-04-18 QA 결과 및 체크리스트 업데이트

### 발견된 버그 유형 — 인증 헤더 전수 누락

**증상**: 페이지 로드 시 "게시글/투표/민원/차량을 불러오는 데 실패했습니다." 오류
**원인**: GET 요청에 Authorization 헤더 미포함 → 미들웨어 401 반환
**영향 범위**: 13개 파일 30+개 fetch 호출

> **핵심 교훈**: GET 요청도 보호된 API임. `fetch(url)` 단독 사용은 항상 인증 오류 발생.

### PortOne 결제 QA 체크리스트

결제 기능 구현/수정 후 반드시 아래 항목 확인:

| # | 항목 | 확인 방법 |
|---|------|----------|
| 1 | CSP 콘솔 오류 없음 | 브라우저 DevTools Console → 빨간 줄 없음 |
| 2 | PortOne SDK 로드 성공 | `window.IMP` 존재 확인 |
| 3 | PG MID 일치 | PortOne 대시보드 채널 MID == `pg:` 파라미터 MID |
| 4 | 데스크탑 팝업 결제 | PC 브라우저에서 결제창 팝업 열림 → 결제 완료 → 납부 완료 화면 |
| 5 | 모바일 리다이렉트 결제 | 모바일 브라우저에서 결제 후 원래 페이지 복귀 → 납부 완료 화면 |
| 6 | 결제 취소 처리 | 결제창 닫기 → 에러 메시지 표시 (무한 로딩 아님) |
| 7 | 납부 완료 상태 중복 클릭 방지 | COMPLETED 상태 시 납부 버튼 미노출 |

### QA 체크리스트 — 전체 업데이트 (2026-04-18)

새 페이지/기능 구현 후 반드시 확인:

**인증**
- [ ] **GET 포함 모든** `fetch('/api/...')` 호출에 `Authorization: Bearer ${token}` 포함
- [ ] POST/PATCH/DELETE에 Authorization 헤더 포함
- [ ] 미인증 상태에서 해당 페이지 접근 시 로그인 리다이렉트 확인

**UI/UX**
- [ ] 하단 시트가 BottomNav(z-50) 위에 표시되는지 (z-[60] 이상)
- [ ] 성공/오류 토스트가 하단 시트(z-80) 위에 표시되는지 (z-90)
- [ ] 하단 고정 버튼이 BottomNav에 가려지지 않는지 (`bottom-14` 또는 `pb-24`)

**코드 품질**
- [ ] 새 라우트 파일이 스텁이 아닌 실제 구현
- [ ] 이미지 업로드 시 Supabase `posts` 버킷 존재 확인
- [ ] `window.confirm/alert` 사용 금지 (→ `useConfirm` + `ConfirmDialog` 사용)


---

## 2026-04-19 QA 체크리스트 업데이트 (Sprint 8)

### 신규 기능 QA 결과

#### 커뮤니티 게시글 수정 (PATCH /posts/[postId])

| 위치 | 위험 | 상태 |
|------|------|------|
| PATCH 권한 | `post.authorId !== user.sub` → 403 | ✅ |
| 빌라 소속 확인 | `assertVillaAccess` 공통 함수 사용 | ✅ |
| 수정됨 배지 | `updatedAt - createdAt > 5000ms` 조건 | ✅ |
| isNotice 수정 | ADMIN 전용 — villaId 소속 검증 포함 | ✅ |

#### 장부 자동 기록 (Auto Ledger)

| 위치 | 위험 | 상태 |
|------|------|------|
| 납부 PATCH 중복 방지 | `wasPaid` 체크 후 조건부 생성 | ✅ |
| PortOne verify 중복 방지 | `payment.status === 'PAID'` 체크가 이미 존재 (함수 상단 guard) | ✅ |
| 외부 청구 중복 방지 | `billing.status === 'COMPLETED'` 체크 후 400 반환 | ✅ |
| amount 타입 | `Number(billing.amount)` — Prisma Decimal → number 변환 | ✅ |

#### 듀얼 모드 — 같은 빌라 관리자+입주민

| 위치 | 위험 | 상태 |
|------|------|------|
| 로그인 시 residentVilla 자동 설정 | `status: 'APPROVED'` 조건 필수 | ✅ |
| 자동 승인 조건 | `villa.adminId === user.sub` 서버에서 검증 | ✅ |
| 온보딩 ResidentRecord 생성 | 빌라 생성 후 새 토큰으로 join API 호출 | ✅ |
| 기존 PENDING 신청 중복 | join API에서 `PENDING/APPROVED` 중복 체크 → 409 | ✅ |

#### Daum Postcode CSP 수정

| 위치 | 위험 | 상태 |
|------|------|------|
| script-src | `t1.daumcdn.net` 추가 | ✅ |
| frame-src | `*.daum.net`, `*.daumcdn.net`, `*.kakao.com` 추가 | ✅ |
| 동적 스크립트 삽입 | CSP script-src 허용 후 정상 동작 확인 | ✅ |

### QA 체크리스트 추가 항목 (2026-04-19)

게시글 수정 기능 구현 후 반드시 확인:
- [ ] 수정 페이지에서 기존 내용 pre-fill 정상 여부
- [ ] 수정 후 게시글 상세에서 "수정됨" 배지 표시 여부
- [ ] 작성자 외 사용자가 수정 페이지 접근 시 403 처리

자동 장부 기록 관련 확인:
- [ ] 관리비 PAID 전환 후 장부에 "자동" 배지 항목 생성 여부
- [ ] 동일 납부 건 중복 장부 기록 방지 여부 (`wasPaid` guard)
- [ ] 외부 청구 COMPLETED 처리 후 장부 자동 기록 여부

듀얼 모드 확인:
- [ ] 온보딩 시 입주민 체크 후 프로필 → "입주민 모드 전환" 버튼 표시 여부
- [ ] 로그아웃 후 재로그인 시 듀얼 모드 유지 여부

### 남은 기술 부채 (2026-04-19 기준)

| 항목 | 위험도 | 비고 |
|------|--------|------|
| `BILLING_ENCRYPTION_KEY` Vercel 미등록 | Critical | 잔존 |
| 기존 평문 빌링키 DB 마이그레이션 | High | 잔존 |
| `lib/client-api.ts` 헬퍼 미활용 | Medium | 잔존 |
| 동대표 교체 후 JWT 블랙리스트 없음 | Medium | 잔존 |
| 로그인 API 추가 DB 쿼리 | Low | ADMIN 로그인 시 최대 2쿼리 추가 |

---

## 2026-04-20 QA 세션 — 전체 코드베이스 보안·안정성 리뷰

### 전체 평가
Critical 1건, High 5건, Medium 5건, Low/Design 4건 발견. Critical~Medium 전체 수정 완료. Low/Design은 SPRINT.md D-01~D-04로 이관.

### 수정 완료 항목

#### 🔴 Critical
| # | 위치 | 문제 | 수정 |
|---|------|------|------|
| 1 | `pay/confirm/route.ts`, `verify/route.ts` | PortOne 검증 함수 두 파일에 복붙 — 한쪽만 수정될 경우 결제 검증 불일치 | `lib/portone.ts` 공통 모듈로 추출 |

#### 🟠 High
| # | 위치 | 문제 | 수정 |
|---|------|------|------|
| 2 | `polls/route.ts`, `posts/route.ts`, `posts/[postId]`, `like` | `assertVillaAccess`에 `status: 'APPROVED'` 미필터 — PENDING 신청자 정보 열람 가능 | `status: 'APPROVED'` 조건 4개 파일 추가 |
| 3 | `payments/[paymentId]/route.ts`, `verify/route.ts` | 납부 상태 갱신 + 장부 기록 비원자 — 부분 실패 시 데이터 불일치 | `prisma.$transaction` 적용 |
| 4 | `cron/auto-payment/route.ts` | 결제 성공 후 villa.update 실패 시 알림 없음 + subscriptionExpiry 재조회 | 실패 시 관리자 긴급 알림 + 초기 select에 포함 |
| 5 | `cron/invoice-reminder/route.ts` | 0원 청구서도 독촉 알림 발송 | `amount: { gt: 0 }` 조건 추가 |
| 6 | `vehicles/route.ts` | 차량 목록 N+1 쿼리 | ownerIds 배치 조회 + Map 룩업으로 교체 |

#### 🟡 Medium
| # | 위치 | 문제 | 수정 |
|---|------|------|------|
| 7 | `dashboard/route.ts` | 클라이언트 임의 villaId 파라미터 전달 가능 | searchParams 제거, JWT villaId만 사용 |
| 8 | `invoice-reminder/route.ts` | 중복 체크 쿼리가 전체 알림 테이블 스캔 + 불안정한 regex | userId 필터 추가, UUID 형식 regex `[a-f0-9-]{36}` 한정 |
| 9 | `lib/auth.ts` | JWT_SECRET 미설정 시 프로덕션만 throw — 개발 환경 하드코딩 폴백 | 전 환경 throw로 강화 |
| 10 | `posts/route.ts` | 공지 알림 body에 TipTap HTML 태그 노출 | `replace(/<[^>]*>/g, '')` 스트립 후 발송 |
| 11 | `requireActiveSubscription` | 청구서/투표/외부청구/건물이력 POST에 구독 가드 미적용 | 4개 엔드포인트 추가 |

#### 🟢 Low/Design — SPRINT.md D-01~D-04로 이관 (미수정)
- D-01: `Button.tsx` loading Spinner + 텍스트 동시 표시
- D-02: `Badge.tsx` 테두리 누락
- D-03: `(admin)/home` 바로가기 터치 타깃 44px 미달
- D-04: `poll-reminder` Cron 스케줄 불일치

### 테스트 결과
- 수정 전: 29/33 통과 (4건 실패 — tickets POST mock 미등록)
- 수정 후: **33/33 통과**
- 추가 케이스: 미승인 입주민 POST 403 검증 케이스 신규 추가

### 이 프로젝트의 보안 취약 패턴 (반복 주의)
- `residentRecord.findFirst`에 `status: 'APPROVED'` 누락 → 미승인자 데이터 접근
- 외부 결제 API 호출 + DB 업데이트 사이의 비원자성 → `$transaction` 필수
- `searchParams` 파라미터를 그대로 DB 쿼리에 사용 → JWT 값만 신뢰

---

## 2026-04-21 — D-01~D-04 해소 확인 + 신규 버그 발견·수정

### D-01~D-04 전체 해소

| # | 항목 | 수정 내용 | 상태 |
|---|------|----------|------|
| D-01 | Button loading 텍스트+스피너 동시 표시 | `{loading ? <Spinner/> : children}` | ✅ 해소 |
| D-02 | Badge 테두리 누락 | `ring-1 ring-{color}-200` 추가 | ✅ 해소 |
| D-03 | 관리자 홈 바로가기 터치 타깃 44px 미달 | `min-h/w-[44px]` 추가 | ✅ 해소 |
| D-04 | poll-reminder 주석 스케줄 불일치 | 주석 `"0 15 * * *"` 통일 | ✅ 해소 |

### 신규 발견·즉시 수정 버그 3건

#### 1. 바텀시트 BottomNav 가림 (공용시설·업체 3페이지)
- **원인**: 신규 바텀시트 `z-50` = BottomNav `z-50`. DOM 렌더 후순위로 BottomNav가 바텀시트를 덮음
- **수정**: 바텀시트 `z-60` 상향
- **재발 방지**: 이 프로젝트에서 바텀시트/모달은 반드시 `z-60` 이상 사용. BottomNav는 `z-50` 고정

#### 2. 관리자 프로필 하단 가림
- **원인**: `pb-10` (40px) < BottomNav `h-14` (56px)
- **수정**: `pb-24` (96px)
- **재발 방지**: 페이지 `<main>` 하단 패딩은 최소 `pb-24` (기존 패턴 준수)

#### 3. 기존 관리자 듀얼 모드 활성화 불가 (기능 공백)
- **원인**: 온보딩 체크박스 미선택 시 사후 입주민 등록 경로 없음
- **수정**: 관리자 프로필에 "등록" 버튼 + 바텀시트 추가, join API 호출 후 localStorage 즉시 반영
- **검증 포인트**: `hasDualMode()` = true 되어야 "전환" 버튼 표시됨

### 이 프로젝트 반복 패턴 추가 기록

- **바텀시트 z-index 충돌**: Sprint 7, Sprint 10에서 2회 반복. 신규 바텀시트 추가 시 **반드시 z-60 확인**

---

## 2026-04-23 — 백오피스 로그인 플로우 버그 수정

### 발견된 버그 2건

#### 1. 백오피스 로그인 후 404
- **증상**: 로그인 성공 후 `/backoffice/dashboard`로 리다이렉트되지만 404 반환
- **원인**: 실제 파일 경로가 `app/(backoffice)/dashboard/page.tsx`이므로 URL은 `/dashboard`. 코드 전반에 `/backoffice/dashboard`가 잘못 하드코딩됨
- **수정**: 로그인 페이지, 사이드바 링크, app/page.tsx, auth/login/page.tsx의 리다이렉트 경로를 모두 `/dashboard`로 수정

#### 2. 백오피스 대시보드 진입 시 로그인 루프
- **증상**: `/backoffice/login` 로그인 후 별 반응 없음 (다시 로그인 화면으로 복귀)
- **원인**: `bo_session` 쿠키가 `path: '/backoffice'`로 발급되어, `/dashboard` 요청 시 쿠키가 전송되지 않음 → 미들웨어가 `bo_session` 없음으로 판단 → 다시 `/backoffice/login`으로 리다이렉트 → 무한 루프
- **수정**: 쿠키 `path: '/backoffice'` → `path: '/'`

### 재발 방지 체크리스트 추가

백오피스 쿠키 관련:
- `bo_session` 쿠키는 반드시 `path: '/'`로 발급 (`/backoffice`로 제한하면 루트 레벨 페이지에서 미전송)
- 미들웨어 matcher에 백오피스 페이지 실제 URL 경로가 포함되어 있는지 확인

Next.js route group URL 확인:
- `app/(group)/page-name/page.tsx` → URL은 `/page-name` (group 이름 미포함)
- 새 백오피스 페이지 추가 시 실제 URL을 middleware matcher에 등록해야 서버 사이드 보호 적용됨
- **pb 부족**: 페이지마다 수작업 확인 필요. `pb-24` 표준으로 사용할 것

---

## 2026-04-24~25 — Sprint 12 QA 전수 수정 결과

### 점검 범위
Sprint 12 백로그 High 3건, Medium 5건, Design 3건, Low 3건 전체 수정 완료.

### 🔴 High — 전체 수정 완료

| # | 위치 | 문제 | 수정 |
|---|------|------|------|
| H-1 | `app/api/resident/facilities/[id]/reservations/route.ts` | 과거 날짜 예약 서버 검증 없음 | KST `todayKST` 기준 `body.date < todayKST` 시 400 반환 |
| H-2 | `invoices/route.ts`, `publish-invoices/route.ts` | `status: 'APPROVED'` 필터 누락 | headResidents 쿼리에 `status: 'APPROVED'` 추가 |
| H-3 | `external-billing/[billId]/confirm/route.ts` | 결제완료+장부기록 비원자 | `prisma.$transaction([update, create])` 배열 형식으로 묶음 |

### 🟡 Medium — 전체 수정 완료

| # | 위치 | 수정 |
|---|------|------|
| M-1 | `manage/facilities/page.tsx` | `useConfirm` 도입 + `res.ok` 체크 + 에러 표시 |
| M-2 | `manage/vendors/page.tsx` | `handleDelete` `res.ok` 체크 추가 |
| M-4 | `api/resident/payments/history/route.ts` | RESIDENT/ADMIN role 검증 추가 |
| M-5 | `posts/[postId]/route.ts` | `isNotice === true` 시 `villa.adminId` 검증 추가 |
| M-8 | `lib/notify.ts` `createNotificationForVilla` | `status: 'APPROVED'` 필터 추가 |

### 🎨 Design — 전체 수정 완료

| # | 수정 내용 |
|---|----------|
| D-1 | `Toast` 컴포넌트 + `useToast` 훅 신규. 앱 전반 `window.alert/confirm` 교체 완료 |
| D-2 | Badge 시맨틱 수정: PENDING=`'warning'`, OVERDUE=`'error'` |
| D-3 | 삭제 버튼 터치 타깃 `min-h-[44px]` 적용 |

### 🔵 Low — 전체 수정 완료

| # | 수정 내용 |
|---|----------|
| L-2 | 예약 바텀시트 `today` 초기화 `getKSTToday()` 함수로 확정 |
| L-3 | 시설 예약 API `date: { gte: today }` — 오늘 이후 예약 포함, 타인 예약은 오늘만 표시 |
| L-4 | `InsightsSection` 에러 상태 UI 추가 |

### 🆕 fixedFee 고정 관리비 자동 발행

| 항목 | 내용 |
|------|------|
| DB | `Villa.fixedFee Int?` 추가 (`prisma db push` 완료) |
| API | `PATCH /api/villas/[villaId]`에서 `fixedFee` 수신·저장 |
| 크론 | `publish-invoices`에서 `fee = villa.fixedFee ?? 0` 기반 금액 설정 |
| UI | `AutoPublishCard` (`manage/invoices/page.tsx` 내 인라인) — 발행일·금액 저장 |

### 미해결 항목 (다음 스프린트)

| 항목 | 위험도 |
|------|--------|
| M-6 — 인사이트 API JS 집계 → DB groupBy | Low |
| L-5 — 장부 입주민 노출 정책 결정 | Low |
| `BILLING_ENCRYPTION_KEY` Vercel 미등록 | Critical |
| 기존 평문 빌링키 마이그레이션 | High |

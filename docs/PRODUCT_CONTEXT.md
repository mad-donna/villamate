# 빌라메이트 (VillaMate) – Product Context

## 1. 프로젝트 개요

- 서비스명: 빌라메이트 (VillaMate) 
- 목 표: 전문 관리 주체가 없는 대한민국의 빌라 및 다세대 주택 관리 문제를 해결하는 모바일 프롭테크 플랫폼 구축입니다.
- 핵심 가치: 기존 수기 장부나 메신저의 한계를 벗어나, 100% 모바일 기반 자동화 시스템으로 동대표의 짐을 덜고 이웃 간 감정 소모를 없애는 것입니다.

## 2. 요구사항 명세 및 기능 목록
### [기능적 요구사항 (Functional Requirements)]

- 공용 비용 입력 시 세대별 분담금을 즉시 1/N로 계산하고 모바일 청구서를 발송해야 합니다.

- 관리비 미납자에게 시스템이 자동으로 푸시 알림 및 알림톡을 발송하여 독촉해야 합니다.

- 오픈뱅킹 연동을 통해 입주민 전원이 공용 통장 내역을 실시간으로 조회할 수 있어야 합니다.

- 지출 증빙의 투명성 확보를 위한 영수증 게시판 기능이 제공되어야 합니다.

- 주요 안건 처리를 위해 시간과 장소에 구애받지 않는 비동기식 모바일 투표 기능이 필요합니다.

- 건물의 수리 이력 및 하자 접수 내역을 영구 기록하는 '디지털 아카이빙' 기능이 있어야 합니다.

- 디지털 소외 계층을 배려하고 사용자 진입 장벽을 낮추기 위해, 앱 설치 없이 모바일 웹과 알림톡만으로도 청구서 확인 및 결제가 가능해야 합니다.


### [비기능적 요구사항 (Non-Functional Requirements)]

- 전자투표의 법적 증거 능력을 확보하기 위해 본인인증 시스템과 타임스탬프 기술을 반드시 적용해야 합니다.

- 금융 정보 유출에 대한 사용자 불안을 해소하기 위해, 오픈뱅킹 연계 시 이체 권한은 배제하고 오직 '조회 권한'만 획득해야 합니다.

- 민감한 금융 및 주거 데이터를 다루므로 최고 수준의 보안 인증을 획득하고 적용해야 합니다.

## 3. 기술 스택 (제안)
- Frontend: React Native (iOS/Android 앱 대응), React (웹 결제 및 관리자 페이지)

- Backend: Node.js (NestJS) 또는 Java (Spring Boot) - 금융 데이터 연동의 안정성을 고려하여 선택

- Database: PostgreSQL (관계형 데이터 및 트랜잭션 관리), Redis (캐싱 및 세션 관리)

- Infra: AWS (EC2, RDS, S3 등)

## 4. API 명세 (핵심 도메인)
- [POST] /api/v1/billing/calculate: 관리비 1/N 정산 로직 및 청구서 생성

- [POST] /api/v1/notifications/remind: 미납자 대상 알림톡/푸시 자동 발송 트리거

- [GET] /api/v1/banking/transactions: 오픈뱅킹 API를 통한 공용 통장 거래 내역 조회

- [POST] /api/v1/voting/cast: 본인인증 및 타임스탬프가 포함된 투표 데이터 저장

- [GET] /api/v1/archive/history: 건물 수리 및 하자 보수 이력 조회

## 5. 디렉토리 구조 (Backend 예시)
- src/modules/billing/: 정산 및 청구 관련 비즈니스 로직

- src/modules/banking/: 오픈뱅킹 연동 및 외부 금융 API 통신 로직

- src/modules/voting/: 전자투표 처리 및 타임스탬프 암호화 로직

- src/modules/notification/: 카카오 알림톡 및 앱 푸시 발송 서비스

- src/common/auth/: 본인인증 및 JWT 기반 인증 처리

## 6. 개발자 작업 지시서 (Phase 1)
- Task 1: 데이터베이스 모델링. 건물(Building), 세대(Unit), 사용자(User), 청구서(Invoice) 간의 관계형 DB 스키마를 설계합니다.

- Task 2: 관리비 정산 코어 로직 개발. 총비용과 세대별 분담 비율(기본 1/N, 예외 케이스 포함)을 계산하는 API를 작성합니다.

- Task 3: 오픈뱅킹 PoC (Proof of Concept). 오픈뱅킹 테스트베드를 활용하여 계좌 '조회' 권한만으로 거래 내역을 긁어오는 파이프라인을 구축합니다.

- Task 4: 웹 뷰 기반 결제 브릿지 구축. 앱을 설치하지 않은 사용자도 알림톡 링크를 통해 모바일 웹에서 내역을 확인하고 결제할 수 있는 화면을 개발합니다.

---

## 7. MVP 구현 현황 (2026-02-24 기준)

### 실제 구현된 기능

위 6개 섹션은 초기 기획 단계의 이상적인 요구사항입니다. 현재 MVP로 실제 구현된 기능은 다음과 같습니다.

#### 인증
- 이메일/비밀번호 기반 로그인 및 자동 회원가입 (upsert 방식)
- 역할 선택: 동대표(ADMIN) / 입주민(RESIDENT)
- AsyncStorage 기반 세션 유지 (JWT 미적용)
- ~~소셜 로그인 (카카오, 구글)~~: Expo Go 환경의 OAuth redirect 문제로 MVP 단계에서 보류

#### 빌라 관리 (동대표)
- 빌라 등록 (이름, 주소, 세대수, 계좌정보 입력)
- 초대 코드 자동 생성 및 표시 (6자리 영숫자, DB 저장)
- 입주민 목록 조회 (호수 포함)

#### 가입 (입주민)
- 초대 코드 + 호수 입력으로 빌라 가입
- 가입 후 자동으로 입주민 대시보드로 이동

#### 청구서 발행 (동대표)
- **고정 관리비 (FIXED)**: 세대당 동일 금액 입력 → 전체 입주민에게 자동 발행
- **변동 관리비 (VARIABLE)**: 항목별 금액 입력 (예: 배수관 공사비, 승강기 수리비 등) → 합산 후 N분의 1 자동 계산
- 자동 발행 설정: 매월 지정일(1~28일)에 고정 관리비 자동 생성 (node-cron)

#### 납부 관리 (입주민)
- 납부 대기 중인 청구서 목록 조회
- 고정/변동 유형 뱃지 및 항목 내역 표시
- 계좌 정보(은행명, 계좌번호) 표시
- 송금 완료 처리 버튼 (수동 확인 방식, PG 연동 없음)

#### 공용 장부 (입주민)
- 투명한 공용 지출 내역 조회 화면 (LedgerScreen)

### 현재 기술 스택 (실제 사용)

| 구분 | 계획 | 실제 구현 |
|------|------|-----------|
| Frontend | React Native | React Native (Expo Go) + TypeScript |
| Backend | NestJS 또는 Spring Boot | Express + TypeScript (단일 index.ts) |
| ORM | - | Prisma 7 |
| Database | PostgreSQL + Redis | Supabase (PostgreSQL만, Redis 미적용) |
| Infra | AWS | 로컬 개발 서버 + Supabase |
| 인증 | 본인인증 + JWT | 이메일 upsert (비밀번호 해싱 없음, MVP) |
| 결제 | PG 연동 | 수동 완료 처리 (버튼) |
| 알림 | 카카오 알림톡 + 푸시 | 미구현 |
| 오픈뱅킹 | 계좌 조회 연동 | 미구현 |
| 전자투표 | 본인인증 + 타임스탬프 | 미구현 |

### 다음 개발 우선순위 (제안)

1. **보안 강화**: 비밀번호 해싱(bcrypt), JWT 인증 미들웨어 적용
2. **API_BASE_URL 공통화**: 각 스크린에 하드코딩된 IP → 공통 config 파일
3. **알림 기능**: 미납자 푸시 알림 또는 카카오 알림톡 발송
4. **소셜 로그인 재적용**: 실제 배포 환경에서 카카오/구글 OAuth 구현
5. **백엔드 모듈화**: 단일 index.ts → 도메인별 라우터 분리

---

## 8. MVP 구현 현황 (2026-02-25 기준)

### 이 세션에서 추가/변경된 기능

#### Invoice 청구서 UX 리팩터링

- **데이터 모델 변경**: `title`, `dueDate` 필드 제거 → `billingMonth (YYYY-MM)`, `memo (선택)` 추가
- **청구 월 선택기**: `< 2026년 2월 >` 화살표 방식 (직접 입력 불필요)
- **표시 형식**: `'2026-02'` → `'2026년 2월 관리비'` 자동 포맷

#### 커미션 비즈니스 모델 기술적 구현

- **은행 계좌 완전 제거**: 입주민 화면 및 API 응답에서 `accountNumber`, `bankName` 제거 → 직접 계좌이체 차단
- **빌라메이트로 결제하기**: 기존 수동 '송금 완료' 버튼 → PortOne PG 결제 버튼으로 교체
- **PortOne (KG Inicis) 테스트 PG 연동**: `iamport-react-native` 설치, `imp14397622` 테스트 계정

#### Admin 청구서 상세 화면 신규 추가

- 세대별 납부 현황 조회 (`AdminInvoiceDetailScreen.tsx`)
- 상단: 총 수금액 / 미납액 요약 카드
- 리스트: 각 세대별 호수·이름·금액·상태 (완납 ✅ / 미납 🚨)
- 청구서 카드 탭 → 상세 화면 네비게이션 연결

#### Android/iOS UX 표준 확립

- **키보드 UX**: `react-native-keyboard-aware-scroll-view` 전면 적용
  - 입력창 포커스 시 자동 스크롤 (`extraHeight: 120`)
  - 하단 CTA 버튼 키보드 위에 고정
- **SafeArea 전면 교체**: 8개 스크린의 `SafeAreaView` import를 `react-native` → `react-native-safe-area-context`로 수정
- **하단 버튼 패딩**: `Math.max(insets.bottom + 16, 24)` — Android 네비게이션 바 / iOS 홈 인디케이터 대응
- `App.tsx`에 `<SafeAreaProvider>` 루트 래핑 추가

### 현재 기술 스택 (2026-02-25 업데이트)

| 구분 | 실제 구현 |
|------|-----------|
| Frontend | React Native (Expo Go) + TypeScript |
| Backend | Express + TypeScript (단일 index.ts) |
| ORM | Prisma 7 |
| Database | Supabase (PostgreSQL) |
| 결제 | PortOne (KG Inicis) 테스트 PG 연동 완료 |
| 키보드 처리 | react-native-keyboard-aware-scroll-view |
| SafeArea | react-native-safe-area-context (전면 적용) |

### 다음 개발 우선순위 (2026-02-25 업데이트)

1. **PG 결제 서버 검증**: `imp_uid` → 백엔드에서 PortOne API로 결제 금액 서버 검증 (보안 필수)
2. **인증 미들웨어**: JWT 기반 인증 — 납부 상태 위조 방지
3. **API_BASE_URL 공통화**: 각 스크린 하드코딩 → `config.ts` 환경변수
4. **알림 기능**: 미납자 푸시 알림 또는 카카오 알림톡
5. **정산 화면**: 동대표용 수금액 정산 및 관리 화면
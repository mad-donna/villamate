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

---

## 9. MVP 구현 현황 (2026-02-26 기준)

### 이 세션에서 추가/변경된 기능

#### UI 텍스트 전면 변경
- "동대표" → "관리자" (표시 문자열만 변경, 변수명·라우트·백엔드 로직 유지)
- 변경 파일: `LoginScreen`, `ProfileSetupScreen`, `ResidentDashboardScreen`, `ResidentJoinScreen`

#### 커뮤니티 게시판 (신규)

| 구분 | 내용 |
|------|------|
| DB | `Post` 모델: `id`, `title`, `content`, `isNotice(bool)`, `authorId`, `villaId`, `createdAt` |
| 백엔드 | `GET/POST /api/villas/:villaId/posts`, `PUT /api/posts/:postId/notice` |
| 공지 제한 | 공지 최대 3개 — 초과 시 400 반환 |
| 화면 | `BoardScreen.tsx` (공지 배지, 관리자 토글), `CreatePostScreen.tsx` |

#### 게시글 상세 + 댓글 (신규)

| 구분 | 내용 |
|------|------|
| DB | `Comment` 모델: `id`, `content`, `authorId`, `postId`, `createdAt` |
| 백엔드 | `GET /api/posts/:postId`, `DELETE /api/posts/:postId` (작성자 본인만), `GET/POST /api/posts/:postId/comments` |
| 화면 | `PostDetailScreen.tsx` — 공지 배지, 본문, 댓글 목록, 하단 입력바 (KeyboardAvoidingView) |

#### 탭 네비게이터 리팩터링

- **Admin 탭 4개**: 홈(DashboardScreen) / 커뮤니티(BoardScreen) / 관리(ManagementScreen) / 프로필
- **Resident 탭 3개**: 홈(ResidentDashboardScreen) / 커뮤니티(BoardScreen) / 프로필
- `ManagementScreen.tsx` 신규 생성: 청구서 발행 / 입주민 관리 / 장부 확인 메뉴 통합

#### 차량 및 주차 관리 (신규)

| 구분 | 내용 |
|------|------|
| DB | `Vehicle` 모델: `plateNumber`, `isVisitor(bool)`, `expectedDeparture(DateTime?)`, `ownerId`, `villaId` |
| 백엔드 | `POST /api/vehicles`, `GET /api/villas/:villaId/vehicles/search?query=`, `GET/DELETE /api/users/:userId/vehicles` |
| ProfileScreen | 차량 등록/삭제 UI — 일반차량/방문차량 토글, 방문 시 출발 예정 시간 입력 |
| ParkingSearchScreen | 번호판 검색 → 호수·이름·방문여부·출발예정 표시 |
| 대시보드 | Admin/Resident 홈 화면 양쪽에 "주차 조회" 버튼 추가 |

### 현재 구현된 전체 화면 목록 (2026-02-26 기준)

#### 인증/온보딩
- `LoginScreen` — 역할 선택 (관리자/입주민) + 이메일 로그인 이동
- `EmailLoginScreen` — 이메일/비밀번호 로그인
- `ProfileSetupScreen` — 이름 입력 후 역할 선택
- `OnboardingScreen` — 빌라 등록 (관리자)
- `ResidentJoinScreen` — 초대 코드로 빌라 가입 (입주민)

#### 관리자 탭
- `DashboardScreen` (홈) — 빌라 요약, 주요 기능 바로가기
- `BoardScreen` (커뮤니티) — 게시글 목록, 공지 관리
- `ManagementScreen` (관리) — 청구서/입주민/장부 메뉴
- `ProfileScreen` (프로필) — 내 정보, 차량 관리, 로그아웃

#### 입주민 탭
- `ResidentDashboardScreen` (홈) — 납부 현황, 주요 기능 바로가기
- `BoardScreen` (커뮤니티) — 게시글 목록 (공지 읽기 전용)
- `ProfileScreen` (프로필) — 내 정보, 차량 관리, 로그아웃

#### 스택 화면 (탭 위에 push)
- `AdminInvoiceScreen` — 청구서 목록
- `AdminInvoiceDetailScreen` — 세대별 납부 현황
- `CreateInvoiceScreen` — 청구서 발행
- `ResidentManagementScreen` — 입주민 목록 + 초대코드
- `LedgerScreen` — 공용 장부 내역
- `PaymentScreen` — PortOne PG 결제
- `PostDetailScreen` — 게시글 상세 + 댓글
- `CreatePostScreen` — 게시글 작성
- `ParkingSearchScreen` — 주차 조회

### 다음 개발 우선순위 (2026-02-26 업데이트)

1. **보안**: 비밀번호 해싱(bcrypt), JWT 인증 미들웨어
2. **PG 결제 서버 검증**: `imp_uid` → PortOne API 서버 검증
3. **Vehicle 중복 방지**: `@@unique([plateNumber, villaId])` 제약 추가
4. **API_BASE_URL 공통화**: `config.ts` 환경변수로 추출
5. **투표 기능**: 주요 안건 모바일 투표
6. **알림 기능**: 미납자 푸시 알림 또는 카카오 알림톡

---

## 10. MVP 구현 현황 (2026-02-27 기준)

### 이 세션에서 추가/변경된 기능

#### 버그 수정 및 코드 복구

- **파일 인코딩 오류 전체 복구**: 20개 스크린 파일의 한국어 문자가 `?` 시퀀스로 깨지는 인코딩 오류 일괄 복구
- **API IP 주소 수정**: `192.168.219.108` → `192.168.219.124` (4개 파일 수정)
- **관리자 차량 등록 버그 수정**: `GET /api/users/:userId/villa` (입주민 전용) → `GET /api/villas/:userId` (관리자용) 으로 수정

#### 차량 관리 고도화

| 구분 | 내용 |
|------|------|
| DB | `Vehicle.expectedDeparture DateTime?` → `String?` (자유 텍스트 허용) |
| DB | `Vehicle.modelName String?` 추가 (색상+모델명 입력) |
| 백엔드 | `POST /api/vehicles`: `modelName` 파라미터 추가 |
| 백엔드 | `GET /api/villas/:villaId/vehicles` 신규 (전체 목록, createdAt desc) |
| ProfileScreen | 차량 모델 입력 폼 추가, 출차 예정 placeholder 개선 |
| ParkingSearchScreen | 화면 진입 시 전체 목록 자동 표시, 로컬 필터링으로 전환, 모델명 표시 |

#### 입주민 전출입 관리 (신규)

| 구분 | 내용 |
|------|------|
| 백엔드 | `GET /api/villas/:villaId/residents` 개선 (recordId, userId, joinedAt 포함, roomNumber 오름차순) |
| 백엔드 | `POST /api/villas/:villaId/residents/:residentId/move-out` 신규 (ResidentRecord deleteMany, 청구내역 보존) |
| 백엔드 | `GET /api/villas/:villaId/detail` 신규 (inviteCode 포함 빌라 정보) |
| ResidentManagementScreen | 전출 처리 버튼, 확인 Alert, 처리 중 로딩 표시 |
| ResidentManagementScreen | '+ 새 입주민 초대' 버튼 → inviteCode Alert 표시 |
| ManagementScreen | 메뉴 라벨 '입주민 및 전출입 관리' 로 변경 |

#### 건물 이력 및 계약 관리 (신규, 기획 요구사항 구현)

초기 기획 문서의 "건물의 수리 이력 및 하자 접수 내역을 영구 기록하는 디지털 아카이빙 기능" MVP 구현.

| 구분 | 내용 |
|------|------|
| DB | `BuildingEvent` 모델 신규 (id, title, description?, category, eventDate String, contractorName?, contactNumber?, attachmentUrl?, villaId, creatorId, createdAt) |
| 백엔드 | `POST/GET /api/villas/:villaId/building-events` 추가 |
| 백엔드 | `POST /api/upload` 추가 (multer, 로컬 디스크 저장, `/uploads` 정적 서빙) |
| BuildingHistoryScreen | 이력 목록 표시, 카테고리별 색상 뱃지 (하자보수 주황/정기점검 초록/유지계약 파랑/청소 보라/기타 회색) |
| CreateBuildingEventScreen | 카테고리 칩 선택, 제목/내용/날짜/업체/연락처 입력, 사진 첨부 |
| CreateBuildingEventScreen | 날짜: 네이티브 DateTimePicker (Android 달력, iOS 스피너) |
| CreateBuildingEventScreen | 이미지: expo-image-picker → `POST /api/upload` → URL 전달 |
| ManagementScreen | '건물 이력 및 계약 관리' 메뉴 항목 추가 |

### 현재 구현된 전체 화면 목록 (2026-02-27 기준)

#### 인증/온보딩
- `LoginScreen`, `EmailLoginScreen`, `ProfileSetupScreen`, `OnboardingScreen`, `ResidentJoinScreen`

#### 관리자 탭 (4개)
- `DashboardScreen` (홈), `BoardScreen` (커뮤니티), `ManagementScreen` (관리), `ProfileScreen` (프로필)

#### 입주민 탭 (3개)
- `ResidentDashboardScreen` (홈), `BoardScreen` (커뮤니티), `ProfileScreen` (프로필)

#### 스택 화면
- `AdminInvoiceScreen`, `AdminInvoiceDetailScreen`, `CreateInvoiceScreen`
- `ResidentManagementScreen` (전출 처리 + 초대코드)
- `LedgerScreen`, `PaymentScreen`
- `PostDetailScreen`, `CreatePostScreen`
- `ParkingSearchScreen`
- `BuildingHistoryScreen` ← NEW
- `CreateBuildingEventScreen` ← NEW

### 현재 기술 스택 (2026-02-27 업데이트)

| 구분 | 실제 구현 |
|------|-----------|
| Frontend | React Native (Expo Go) + TypeScript |
| Backend | Express + TypeScript (단일 index.ts, ~900+ 라인) |
| ORM | Prisma 7 |
| Database | Supabase (PostgreSQL) |
| 결제 | PortOne (KG Inicis) 테스트 PG 연동 |
| 파일 업로드 | multer (로컬 디스크, `backend/uploads/`) |
| 이미지 선택 | expo-image-picker |
| 날짜 선택 | @react-native-community/datetimepicker |
| 키보드 처리 | react-native-keyboard-aware-scroll-view |
| SafeArea | react-native-safe-area-context |

### 다음 개발 우선순위 (2026-02-27 업데이트)

1. **보안 강화**: 비밀번호 해싱(bcrypt), JWT 인증 미들웨어, PG 결제 `imp_uid` 서버 검증
2. **알림 기능**: 미납자 푸시 알림 또는 카카오 알림톡
3. **공용 장부 실데이터 연동**: LedgerScreen 더미 데이터 → 실제 DB 연동
4. **업로드 스토리지 마이그레이션**: 로컬 디스크 → S3 또는 Supabase Storage
5. **API_BASE_URL 공통화**: 각 스크린 하드코딩 → `config.ts` 환경변수
6. **투표 기능**: 초기 기획 요구사항 잔여 (전자투표 + 본인인증)
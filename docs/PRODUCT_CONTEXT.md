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
- **API IP 주소 수정**: `192.168.219.108` → `192.168.219.178` (4개 파일 수정)
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

---

## 11. MVP 구현 현황 (2026-02-28 기준)

### 이 세션에서 추가/변경된 기능

#### API_BASE_URL 중앙화 (기술 부채 해소)

- `frontend/src/config.ts` 신규 생성:
  ```typescript
  export const API_BASE_URL = 'http://192.168.219.178:3000';
  ```
- 22개 스크린 파일 일괄 업데이트: 하드코딩 제거 → `import { API_BASE_URL } from '../config'`
- 향후 IP/도메인 변경 시 이 파일 1개만 수정하면 전체 반영

#### 외부 청구 기능 (앱 미설치 사용자 대상)

초기 기획 문서의 "앱 설치 없이 모바일 웹과 알림톡만으로 청구서 확인 및 결제 가능" 요구사항 MVP 수준 구현.

| 구분 | 내용 |
|------|------|
| DB | `ExternalBilling` 모델 신규 (id, targetName, phoneNumber, amount, description, dueDate, status, villaId, createdAt) |
| 백엔드 | `POST/GET /api/villas/:villaId/external-bills` |
| 백엔드 | `PATCH /api/villas/:villaId/external-bills/:billId/confirm` (납부 확인) |
| 백엔드 | `GET /pay/:billId` — 모바일 최적화 HTML 페이지 직접 반환 (Express) |
| 백엔드 | `POST /api/public/pay/:billId/notify` — 입금 알림 (PENDING_CONFIRMATION 설정) |
| ExternalBillingScreen | 청구서 목록 (상태 배지), FAB → 생성 모달, "납부 확인" 버튼 |
| ManagementScreen | "외부 청구서 발송" 메뉴 항목 추가 |

상태 흐름: `PENDING` → (비앱 사용자 알림 클릭) `PENDING_CONFIRMATION` → (관리자 확인) `COMPLETED`

#### 대시보드 위젯 고도화

기존 정적 대시보드를 동적 위젯 기반으로 전환. `GET /api/dashboard/:userId?villaId=&role=` 신규 엔드포인트로 역할별 통계 일괄 조회.

**관리자 대시보드 (`DashboardScreen.tsx` 완전 재작성)**

| 위젯 | 데이터 | 이동 |
|------|--------|------|
| 미납 관리비 | `totalUnpaidCount` | AdminInvoice |
| 확인 대기 | `pendingExternalBillsCount` | ExternalBilling |
| 최근 공지 | `latestNotice` | PostDetail |
| 진행중인 투표 | `activePollsCount` | PollList |
| 바로가기 (7개) | — | 각 화면 |

**입주민 대시보드 (`ResidentDashboardScreen.tsx` 완전 재작성)**

| 위젯 | 데이터 | 이동 |
|------|--------|------|
| 미납 관리비 | `myUnpaidAmount` | 같은 화면 내 스크롤 |
| 최근 공지 | `latestNotice` | PostDetail |
| 내 차량 | `myVehicleCount` | 프로필 탭 |
| 참여 가능한 투표 | `activePollsCount` | PollList |

#### 전자투표 기능 (초기 기획 요구사항 달성)

초기 기획 문서의 "주요 안건 처리를 위한 비동기식 모바일 투표 기능" 요구사항 MVP 수준 구현.

| 구분 | 내용 |
|------|------|
| DB | `Poll` 모델 (id, title, description?, isAnonymous, endDate, villaId, creatorId) |
| DB | `PollOption` 모델 (id, text, pollId) |
| DB | `Vote` 모델 (id, pollId, optionId, voterId, roomNumber, `@@unique([pollId, roomNumber])`) |
| 백엔드 | `POST /api/villas/:villaId/polls` (옵션 중첩 생성) |
| 백엔드 | `GET /api/villas/:villaId/polls` (투표수·투표자 포함) |
| 백엔드 | `POST /api/villas/:villaId/polls/:pollId/vote` (1세대 1표 이중 검증) |
| CreatePollScreen | 제목/설명/옵션(동적)/종료일(DateTimePicker)/익명 여부 |
| PollListScreen | 카드 목록, D-N 남은 일, 총 투표수, FAB으로 생성 이동 |
| PollDetailScreen | 미투표: 라디오 선택 → 투표하기 / 투표완료·종료: 퍼센트 바 + 기명 시 호수 칩 표시 |

1세대 1표 구현: DB `@@unique([pollId, roomNumber])` 제약 + 서버 사전 체크(409 반환) 이중 강제

### 현재 구현된 전체 화면 목록 (2026-02-28 기준)

#### 인증/온보딩
- `LoginScreen`, `EmailLoginScreen`, `ProfileSetupScreen`, `OnboardingScreen`, `ResidentJoinScreen`

#### 관리자 탭 (4개)
- `DashboardScreen` (홈 — 위젯), `BoardScreen` (커뮤니티), `ManagementScreen` (관리), `ProfileScreen` (프로필)

#### 입주민 탭 (3개)
- `ResidentDashboardScreen` (홈 — 위젯), `BoardScreen` (커뮤니티), `ProfileScreen` (프로필)

#### 스택 화면 (탭 위에 push)
- `AdminInvoiceScreen`, `AdminInvoiceDetailScreen`, `CreateInvoiceScreen`
- `ResidentManagementScreen` (전출 처리 + 초대코드)
- `LedgerScreen`, `PaymentScreen`
- `PostDetailScreen`, `CreatePostScreen`
- `ParkingSearchScreen`
- `BuildingHistoryScreen`, `CreateBuildingEventScreen`
- `ExternalBillingScreen` ← NEW
- `CreatePollScreen` ← NEW
- `PollListScreen` ← NEW
- `PollDetailScreen` ← NEW

### 현재 기술 스택 (2026-02-28 업데이트)

| 구분 | 실제 구현 |
|------|-----------|
| Frontend | React Native (Expo Go) + TypeScript |
| Backend | Express + TypeScript (단일 index.ts, ~1200+ 라인) |
| ORM | Prisma 7 |
| Database | Supabase (PostgreSQL) |
| API 설정 | `frontend/src/config.ts` (API_BASE_URL 중앙화) |
| 결제 | PortOne (KG Inicis) 테스트 PG 연동 |
| 파일 업로드 | multer (로컬 디스크, `backend/uploads/`) |
| 이미지 선택 | expo-image-picker |
| 날짜 선택 | @react-native-community/datetimepicker v8.4.4 |
| 키보드 처리 | react-native-keyboard-aware-scroll-view |
| SafeArea | react-native-safe-area-context |

### 다음 개발 우선순위 (2026-02-28 업데이트)

1. **보안 강화**: 비밀번호 해싱(bcrypt), JWT 인증 미들웨어, PG 결제 `imp_uid` 서버 검증
2. **알림 기능**: 미납자 푸시 알림 또는 카카오 알림톡 (핵심 기획 요구사항)
3. **공용 장부 실데이터 연동**: LedgerScreen 더미 데이터 → 실제 LedgerTransaction DB 연동
4. **외부 청구 SMS 자동화**: 수동 복사 → 카카오 알림톡 자동 발송 연결
5. **업로드 스토리지 마이그레이션**: 로컬 디스크 → S3 또는 Supabase Storage

---

## 12. MVP 구현 현황 (2026-03-01 기준)

### 이 세션에서 추가/변경된 기능

#### Admin 전자투표 버그 수정

- 버그: Admin 사용자는 `ResidentRecord`가 없어 투표 라우트에서 항상 403 반환
- 수정: ResidentRecord 없을 때 `villa.findFirst`로 Admin 여부 2차 확인, `'admin'` sentinel roomNumber 사용
- 1세대 1표(`@@unique([pollId, roomNumber])`) 제약은 Admin에게도 동일 적용 → 중복 투표 방지 유지
- 프론트: `PollDetailScreen`에 `userRole` 파라미터 추가, Admin 투표 후 결과 화면 정상 표시
- `DashboardScreen`, `ResidentDashboardScreen`, `PollListScreen`에서 `userRole` 전달 일괄 추가

#### 민원/하자 접수 — 게시판(Post) 통합 (UX 통합 결정)

**제품 결정 배경**: 독립 Ticket 시스템은 별도 메뉴/화면으로 인한 UX 분산, 댓글 기능 부재 등 단점 존재. 커뮤니티 게시판에 카테고리를 추가하는 방식으로 통합하여 공개적 투명성 확보 및 앱 UX 단순화.

| 구분 | 내용 |
|------|------|
| DB | `Post` 모델에 `category String @default("GENERAL")`, `status String?` 컬럼 추가 |
| 백엔드 | `POST /api/villas/:villaId/posts` — `category` 파라미터 추가, ISSUE이면 `status='PENDING'` 자동 설정 |
| 백엔드 | `PATCH /api/villas/:villaId/posts/:postId/status` 신규 — ADMIN만 상태 변경 가능 (PENDING / IN_PROGRESS / RESOLVED) |
| CreatePostScreen | 게시 유형 칩 선택 UI 추가: '일반 게시글' / '민원·하자 접수' |
| BoardScreen | ISSUE 게시글에 상태 배지 표시 (접수 대기=빨강 / 처리 중=주황 / 처리 완료=초록) |
| PostDetailScreen | Admin에게 상태 변경 버튼 3개 인라인 표시, 변경 즉시 UI 반영 (로컬 state 업데이트) |

#### 독립형 티켓 시스템 제거

| 구분 | 내용 |
|------|------|
| 삭제 | `frontend/src/screens/TicketListScreen.tsx` |
| 삭제 | `frontend/src/screens/CreateTicketScreen.tsx` |
| AppNavigator | `TicketList`, `CreateTicket` Stack.Screen 및 import 제거 |
| DashboardScreen | '민원 접수' 퀵액션 버튼 제거 |
| ResidentDashboardScreen | '민원 접수' pill 버튼 제거 |

#### 홈 화면 퀵액션 정리 (중복 제거)

**Admin 대시보드 (`DashboardScreen.tsx`)**
- 7개 → 3개로 축소 (제거: 커뮤니티, 공용 장부, 입주민 관리, 외부 청구)
- 남긴 항목: '청구서 발행', '주차 조회', '전자투표'
- `actionRows` 동적 분할 로직 제거 → 단순 단일 행 렌더링

**Resident 대시보드 (`ResidentDashboardScreen.tsx`)**
- 4개 → 2개로 축소 (제거: 커뮤니티, 공용 장부)
- 남긴 항목: '주차 조회', '전자투표' (레이블 '투표' → '전자투표' 변경)
- 스타일: `justifyContent: 'center'`, `flex: 1` 제거, `paddingHorizontal: 32` 고정

### 현재 구현된 전체 화면 목록 (2026-03-01 기준)

#### 인증/온보딩
- `LoginScreen`, `EmailLoginScreen`, `ProfileSetupScreen`, `OnboardingScreen`, `ResidentJoinScreen`

#### 관리자 탭 (4개)
- `DashboardScreen` (홈 — 위젯 + 퀵액션 3개), `BoardScreen` (커뮤니티+민원), `ManagementScreen` (관리), `ProfileScreen` (프로필)

#### 입주민 탭 (3개)
- `ResidentDashboardScreen` (홈 — 위젯 + 퀵액션 2개), `BoardScreen` (커뮤니티+민원), `ProfileScreen` (프로필)

#### 스택 화면 (탭 위에 push)
- `AdminInvoiceScreen`, `AdminInvoiceDetailScreen`, `CreateInvoiceScreen`
- `ResidentManagementScreen` (전출 처리 + 초대코드)
- `LedgerScreen`, `PaymentScreen`
- `PostDetailScreen` (Admin 민원 상태 변경 인라인), `CreatePostScreen` (게시 유형 선택)
- `ParkingSearchScreen`
- `BuildingHistoryScreen`, `CreateBuildingEventScreen`
- `ExternalBillingScreen`
- `CreatePollScreen`, `PollListScreen`, `PollDetailScreen` (Admin 투표 가능)

### 현재 기술 스택 (2026-03-01 업데이트)

| 구분 | 실제 구현 |
|------|-----------|
| Frontend | React Native (Expo Go) + TypeScript |
| Backend | Express + TypeScript (단일 index.ts, ~1300+ 라인) |
| ORM | Prisma 7 |
| Database | Supabase (PostgreSQL) |
| API 설정 | `frontend/src/config.ts` (API_BASE_URL 중앙화) |
| 결제 | PortOne (KG Inicis) 테스트 PG 연동 |
| 파일 업로드 | multer (로컬 디스크, `backend/uploads/`) |
| 이미지 선택 | expo-image-picker |
| 날짜 선택 | @react-native-community/datetimepicker v8.4.4 |
| 키보드 처리 | react-native-keyboard-aware-scroll-view |
| SafeArea | react-native-safe-area-context |

### 다음 개발 우선순위 (2026-03-01 업데이트)

1. **보안 강화**: 비밀번호 해싱(bcrypt), JWT 인증 미들웨어, PG 결제 `imp_uid` 서버 검증
2. **알림 기능**: 미납자 푸시 알림 또는 카카오 알림톡 (핵심 기획 요구사항, 계속 미구현)
3. **공용 장부 실데이터 연동**: LedgerScreen 더미 → 실제 LedgerTransaction DB 연동
4. **외부 청구 SMS 자동화**: 수동 복사 → 카카오 알림톡 자동 발송
5. **업로드 스토리지 마이그레이션**: 로컬 디스크 → S3 또는 Supabase Storage
6. **Ticket 모델 정리**: schema.prisma에 잔존하는 미사용 Ticket 모델 제거

---

## 13. MVP 구현 현황 (2026-03-02 기준)

### 이 세션에서 추가/변경된 기능

#### Expo 푸시 알림 시스템 (신규)

초기 기획의 "미납자 자동 알림" 요구사항의 1단계 인프라 구축.

| 구분 | 내용 |
|------|------|
| DB | `User.expoPushToken String?` 필드 추가 |
| 백엔드 패키지 | `expo-server-sdk` 설치 |
| 백엔드 | `PATCH /api/users/:userId/push-token` 신규 (토큰 저장) |
| 백엔드 | `POST /api/villas/:villaId/posts/:postId/send-push` 신규 (전 입주민 수동 푸시 발송) |
| 프론트 패키지 | `expo-notifications`, `expo-device` 설치 |
| App.tsx | 앱 시작 시 알림 권한 요청 + Expo 토큰 획득 + 서버 저장 |
| PostDetailScreen | '공지사항 푸시 발송' 버튼 추가 (공지 글 + ADMIN 전용, 녹색) |

- **UX 결정**: 공지 등록 시 자동 발송 → 관리자 수동 발송 버튼으로 변경 (관리자 컨트롤 강화)
- 발송 내용: 제목 `'새롭게 공지사항 등록된 글이 있습니다. 확인해보실까요?'`, 본문: 게시글 제목

#### bcrypt 비밀번호 보안 적용 (보안 강화)

| 구분 | 내용 |
|------|------|
| DB | `User.password String?` 필드 추가 |
| 백엔드 패키지 | `bcryptjs`, `@types/bcryptjs` 설치 |
| 백엔드 | `PATCH /api/users/:userId/password` 신규 — `bcrypt.compare(old)` 검증 후 `bcrypt.hash(new, 10)` 저장 |
| ChangePasswordScreen | 현재 비밀번호 / 새 비밀번호 / 확인 입력, 클라이언트 유효성 검사 |

#### 회원 탈퇴 기능 (신규)

| 구분 | 내용 |
|------|------|
| 백엔드 | `DELETE /api/users/:userId` 신규 — 소프트 삭제 (익명화: name='탈퇴한 사용자', 이메일/전화 null, status='DELETED') |
| ProfileScreen | 회원 탈퇴 버튼 + 이중 Alert 확인 → API 호출 → AsyncStorage.clear() → 로그인 화면 이동 |

#### ProfileScreen iOS 설정 앱 스타일 전면 개편

기존 혼잡한 레이아웃 → iOS 설정 앱 스타일의 섹션 카드 기반 구조로 완전 재설계.

| 섹션 | 항목 |
|------|------|
| 내 집 | 내 차량 관리 → VehicleManagementScreen, 내가 쓴 글/민원 내역 → MyPostsScreen |
| 계정 정보 | 비밀번호 변경 → ChangePasswordScreen |
| 앱 설정 | 푸시 알림 Switch 토글 |
| 고객센터 & 약관 | 이용약관, 개인정보처리방침 (플레이스홀더) |
| 계정 관리 | 로그아웃 (빨강), 회원 탈퇴 (회색) |

- 헤더: 이름 첫 글자 아바타, 이름, 역할 칩(ADMIN=파랑, RESIDENT=보라), 호수 칩

#### 차량 관리 전용 화면 분리 (신규)

- 기존 ProfileScreen에 내장 → `VehicleManagementScreen.tsx` 독립 화면으로 분리
- `useFocusEffect` + `useCallback` 패턴으로 진입 시 자동 새로고침
- ADMIN / RESIDENT 역할에 따라 villaId 조회 경로 분기 유지

#### 내가 쓴 글 / 민원 내역 (신규)

| 구분 | 내용 |
|------|------|
| 백엔드 | `GET /api/users/:userId/posts` 신규 — 작성자 기준 게시글 목록 (최신순) |
| MyPostsScreen | FlatList 카드 목록 — 공지 뱃지(파랑), 민원 뱃지(보라), 상태 뱃지 표시 |
| 네비게이션 | 카드 탭 → `PostDetailScreen`으로 이동 |

### 현재 구현된 전체 화면 목록 (2026-03-02 기준)

#### 인증/온보딩
- `LoginScreen`, `EmailLoginScreen`, `ProfileSetupScreen`, `OnboardingScreen`, `ResidentJoinScreen`

#### 관리자 탭 (4개)
- `DashboardScreen` (홈), `BoardScreen` (커뮤니티+민원), `ManagementScreen` (관리), `ProfileScreen` (iOS 설정 스타일)

#### 입주민 탭 (3개)
- `ResidentDashboardScreen` (홈), `BoardScreen` (커뮤니티+민원), `ProfileScreen` (iOS 설정 스타일)

#### 스택 화면 (탭 위에 push)
- `AdminInvoiceScreen`, `AdminInvoiceDetailScreen`, `CreateInvoiceScreen`
- `ResidentManagementScreen`, `LedgerScreen`, `PaymentScreen`
- `PostDetailScreen` (공지 푸시 발송 버튼 포함), `CreatePostScreen`
- `ParkingSearchScreen`
- `BuildingHistoryScreen`, `CreateBuildingEventScreen`
- `ExternalBillingScreen`
- `CreatePollScreen`, `PollListScreen`, `PollDetailScreen`
- `VehicleManagementScreen` ← NEW (차량 관리 독립 화면)
- `ChangePasswordScreen` ← NEW (비밀번호 변경)
- `MyPostsScreen` ← NEW (내가 쓴 글/민원 내역)

### 현재 기술 스택 (2026-03-02 업데이트)

| 구분 | 실제 구현 |
|------|-----------|
| Frontend | React Native (Expo Go) + TypeScript |
| Backend | Express + TypeScript (단일 index.ts, ~1400+ 라인) |
| ORM | Prisma 7 |
| Database | Supabase (PostgreSQL) |
| API 설정 | `frontend/src/config.ts` (API_BASE_URL 중앙화) |
| 결제 | PortOne (KG Inicis) 테스트 PG 연동 |
| 파일 업로드 | multer (로컬 디스크, `backend/uploads/`) |
| 이미지 선택 | expo-image-picker |
| 날짜 선택 | @react-native-community/datetimepicker v8.4.4 |
| 키보드 처리 | react-native-keyboard-aware-scroll-view (일부), 표준 KeyboardAvoidingView (일부) |
| SafeArea | react-native-safe-area-context |
| 푸시 알림 | expo-notifications + expo-device + expo-server-sdk |
| 비밀번호 | bcryptjs (hash rounds: 10) |
| 테스트 | Jest + supertest (32개 테스트) |

### 다음 개발 우선순위 (2026-03-02 업데이트)

1. **알림 고도화**: 미납자 개인 대상 자동 푸시 알림 (핵심 기획 요구사항 — 아직 미구현)
2. **JWT 인증 미들웨어**: API 보안 + 신규 push-token/send-push 엔드포인트 보호
3. **PG 결제 서버 검증**: `imp_uid` → PortOne API 서버 검증 (보안 필수)
4. **공용 장부 실데이터 연동**: LedgerScreen 더미 → 실제 LedgerTransaction DB 연동
5. **외부 청구 SMS 자동화**: 수동 복사 → 카카오 알림톡 자동 발송
6. **업로드 스토리지 마이그레이션**: 로컬 디스크 → S3 또는 Supabase Storage

---

## 14. MVP 구현 현황 (2026-03-03 기준)

### 이 세션에서 추가/변경된 기능

#### 롤링 배너 자동스크롤 (UX 개선)

- **기존**: 수동 스와이프만 가능한 정적 배너
- **변경**: 3초마다 자동으로 다음 배너로 전환
  - `currentIndexRef(useRef)` + `setInterval(3000ms)` 조합 (stale closure 방지)
  - 수동 스와이프 시 `onViewableItemsChanged`에서 ref + state 동시 동기화
  - 컴포넌트 언마운트 시 `clearInterval` cleanup

#### 앱 이용 가이드 화면 신규 추가 (`GuideScreen.tsx`)

- 배너 탭 → 가이드 화면 이동 (`navigation.navigate('Guide')`)
- 7개 카드: 방문차량 등록 / 전자투표 참여 / 커뮤니티 이용 / 청구서 확인 및 납부 / 주차관리 / 공지사항 확인 / 마이페이지 이용
- 이모지 아이콘 + 좌측 액센트 바 + 설명 텍스트 스타일 카드

#### 앱 내 알림함 시스템 신규 추가

Expo 푸시 알림(1단계)에 이어, 앱 내 영구 알림함(2단계) 구현.

| 구분 | 내용 |
|------|------|
| DB | `Notification` 모델 신규 (id, userId → User, title, body, isRead @default(false), createdAt) |
| 백엔드 | `POST .../send-push` 라우트에 `notification.createMany` 추가 (전체 입주민 — 토큰 유무 무관) |
| 백엔드 | `GET /api/users/:userId/notifications` 신규 (최신순 알림 목록) |
| 백엔드 | `PATCH /api/users/:userId/notifications/read-all` 신규 (전체 미읽음 → 읽음) |
| NotificationScreen | **신규** — `useFocusEffect` 진입 시 fetch + read-all 자동 호출, unread 파란 점 표시 |
| AppNavigator | `Notifications` 스택 라우트 등록 |
| DashboardScreen | 헤더 우상단 🔔 벨 아이콘 버튼 추가 → `Notifications` 이동 |
| ResidentDashboardScreen | 동일하게 🔔 벨 아이콘 버튼 추가 |

- **설계 결정**: Expo 토큰 없는 입주민도 앱 내 알림함 확인 가능하도록 토큰 유무 무관하게 전체 createMany
- **읽음 처리**: 화면 진입 시 자동 전체 읽음 처리 → 사용자 별도 액션 불필요

### 현재 구현된 전체 화면 목록 (2026-03-03 기준)

#### 인증/온보딩
- `LoginScreen`, `EmailLoginScreen`, `ProfileSetupScreen`, `OnboardingScreen`, `ResidentJoinScreen`

#### 관리자 탭 (4개)
- `DashboardScreen` (홈 — 롤링배너+위젯, 🔔), `BoardScreen` (커뮤니티+민원), `ManagementScreen` (관리), `ProfileScreen` (iOS 설정 스타일)

#### 입주민 탭 (3개)
- `ResidentDashboardScreen` (홈 — 롤링배너+위젯, 🔔), `BoardScreen` (커뮤니티+민원), `ProfileScreen` (iOS 설정 스타일)

#### 스택 화면 (탭 위에 push)
- `AdminInvoiceScreen`, `AdminInvoiceDetailScreen`, `CreateInvoiceScreen`
- `ResidentManagementScreen`, `LedgerScreen`, `PaymentScreen`
- `PostDetailScreen` (공지 푸시 발송 버튼 포함), `CreatePostScreen`
- `ParkingSearchScreen`
- `BuildingHistoryScreen`, `CreateBuildingEventScreen`
- `ExternalBillingScreen`
- `CreatePollScreen`, `PollListScreen`, `PollDetailScreen`
- `VehicleManagementScreen`, `ChangePasswordScreen`, `MyPostsScreen`
- `GuideScreen` ← NEW (앱 이용 가이드)
- `NotificationScreen` ← NEW (알림함)

### 현재 기술 스택 (2026-03-03 업데이트)

| 구분 | 실제 구현 |
|------|-----------|
| Frontend | React Native (Expo Go) + TypeScript |
| Backend | Express + TypeScript (단일 index.ts, ~1500+ 라인) |
| ORM | Prisma 7 |
| Database | Supabase (PostgreSQL) |
| API 설정 | `frontend/src/config.ts` (API_BASE_URL 중앙화) |
| 결제 | PortOne (KG Inicis) 테스트 PG 연동 |
| 파일 업로드 | multer (로컬 디스크, `backend/uploads/`) |
| 이미지 선택 | expo-image-picker |
| 날짜 선택 | @react-native-community/datetimepicker v8.4.4 |
| 키보드 처리 | react-native-keyboard-aware-scroll-view (일부), 표준 KeyboardAvoidingView (일부) |
| SafeArea | react-native-safe-area-context |
| 푸시 알림 | expo-notifications + expo-device + expo-server-sdk |
| 비밀번호 | bcryptjs (hash rounds: 10) |
| 테스트 | Jest + supertest (32개 테스트) |

### 다음 개발 우선순위 (2026-03-03 업데이트)

1. **미납자 알림 자동화**: 공지 수동 발송을 넘어 미납자 대상 자동 스케줄 알림 (cron 연동 + notification DB 저장)
2. **JWT 인증 미들웨어**: 알림 API 포함 전체 API 보안 강화
3. **PG 결제 서버 검증**: `imp_uid` → PortOne API 서버 검증 (보안 필수)
4. **공용 장부 실데이터 연동**: LedgerScreen 더미 → 실제 LedgerTransaction DB 연동
5. **외부 청구 SMS 자동화**: 수동 복사 → 카카오 알림톡 자동 발송
6. **업로드 스토리지 마이그레이션**: 로컬 디스크 → S3 또는 Supabase Storage

---

## 15. MVP 구현 현황 (2026-03-04 기준)

### 이 세션에서 추가/변경된 기능

#### 회원가입 3단계 플로우 신규 구현 (기존 upsert 방식 교체)

기존: `POST /api/auth/email-login`이 신규 사용자도 upsert로 즉시 계정 생성 → 약관 동의 없이 가입
변경: 사용자 미존재 시 `404 + { error: 'USER_NOT_FOUND' }` → 3단계 가입 플로우로 분기

| 구분 | 내용 |
|------|------|
| 백엔드 | `POST /api/auth/register` 신규 — email/password(bcrypt)/name/phoneNumber/termsAgreed |
| 백엔드 | 기존 이메일 있으면 409 반환 (중복 가입 방지) |
| SignupAgreementScreen | **신규** — Step 2/3: 이용약관 + 개인정보 동의 (전체 동의 + 개별 체크박스) |
| SignupProfileScreen | **신규** — Step 3/3: 이름(필수) + 전화번호(선택) 입력 → 가입 완료 후 Onboarding |
| StepIndicator | 3단계 진행 표시 인라인 컴포넌트 (완료=초록, 현재=파랑, 미완=회색) |
| EmailLoginScreen | 수정: 404 USER_NOT_FOUND → `navigate('SignupAgreement', { email, password })` |
| AppNavigator | `SignupAgreement`, `SignupProfile` 스택 화면 등록 (headerShown: false) |

#### 고객센터 FAQ 기능 (신규)

| 구분 | 내용 |
|------|------|
| DB | `Faq` 모델 신규 (id uuid, question, answer, createdAt) |
| 백엔드 | `GET /api/faqs` (공개), `POST/DELETE /api/faqs/:id` (SUPER_ADMIN JWT 전용) |
| CustomerCenterScreen | **신규** — 아코디언 Q&A 카드 (Q=파랑뱃지, A=초록뱃지, 탭 시 토글) |
| AppNavigator | `CustomerCenter` 스택 등록 (headerShown: false) |

#### 시스템 공지사항 (신규)

| 구분 | 내용 |
|------|------|
| DB | `SystemNotice` 모델 신규 (id uuid, title, content, createdAt) |
| 백엔드 | `GET /api/system-notices` (공개), `POST/DELETE /api/system-notices/:id` (SUPER_ADMIN JWT 전용) |
| SystemNoticeScreen | **신규** — 아코디언 카드 (공지뱃지, 제목, 탭 시 내용+날짜 표시) |
| AppNavigator | `SystemNotice` 스택 등록 (headerShown: false) |

#### Admin 웹 패널 (`admin-web/`) 신규 구축

내부 운영팀이 브라우저에서 서비스를 관리하기 위한 전용 웹 패널.

| 구분 | 내용 |
|------|------|
| 기술 스택 | React + Vite + TypeScript (별도 디렉토리) |
| 인증 | `POST /api/admin/login` → SUPER_ADMIN JWT 발급 (7일 만료) |
| 백엔드 패키지 | `jsonwebtoken` 설치, `JWT_SECRET` 환경변수 (폴백: 하드코딩 시크릿) |
| Admin 전용 API | `GET /api/admin/users`, `GET /api/admin/villas` (SUPER_ADMIN 전용) |
| 기능 | FAQ 등록/삭제, 시스템 공지 등록/삭제, 유저/빌라 목록 조회 |

#### 프론트엔드 구조 개선

- `frontend/src/components/` 디렉토리 신규 생성
- `RollingBanner.tsx` → `components/` 디렉토리로 이동 (컴포넌트 분리 원칙 적용)

### 현재 구현된 전체 화면 목록 (2026-03-04 기준)

#### 인증/온보딩
- `LoginScreen`, `EmailLoginScreen`, `ProfileSetupScreen`, `OnboardingScreen`, `ResidentJoinScreen`
- `SignupAgreementScreen` ← NEW (회원가입 Step 2: 약관 동의)
- `SignupProfileScreen` ← NEW (회원가입 Step 3: 프로필 입력)

#### 관리자 탭 (4개)
- `DashboardScreen` (홈 — 롤링배너+위젯, 🔔), `BoardScreen` (커뮤니티+민원), `ManagementScreen` (관리), `ProfileScreen` (iOS 설정 스타일)

#### 입주민 탭 (3개)
- `ResidentDashboardScreen` (홈 — 롤링배너+위젯, 🔔), `BoardScreen` (커뮤니티+민원), `ProfileScreen` (iOS 설정 스타일)

#### 스택 화면 (탭 위에 push)
- `AdminInvoiceScreen`, `AdminInvoiceDetailScreen`, `CreateInvoiceScreen`
- `ResidentManagementScreen`, `LedgerScreen`, `PaymentScreen`
- `PostDetailScreen`, `CreatePostScreen`
- `ParkingSearchScreen`
- `BuildingHistoryScreen`, `CreateBuildingEventScreen`
- `ExternalBillingScreen`
- `CreatePollScreen`, `PollListScreen`, `PollDetailScreen`
- `VehicleManagementScreen`, `ChangePasswordScreen`, `MyPostsScreen`
- `GuideScreen`, `NotificationScreen`
- `CustomerCenterScreen` ← NEW (고객센터 FAQ)
- `SystemNoticeScreen` ← NEW (시스템 공지사항)

### 현재 기술 스택 (2026-03-04 업데이트)

| 구분 | 실제 구현 |
|------|-----------|
| Frontend | React Native (Expo Go) + TypeScript |
| Backend | Express + TypeScript (단일 index.ts, ~1600+ 라인) |
| ORM | Prisma 7 |
| Database | Supabase (PostgreSQL) |
| API 설정 | `frontend/src/config.ts` (API_BASE_URL 중앙화) |
| 결제 | PortOne (KG Inicis) 테스트 PG 연동 |
| 파일 업로드 | multer (로컬 디스크, `backend/uploads/`) |
| 이미지 선택 | expo-image-picker |
| 날짜 선택 | @react-native-community/datetimepicker v8.4.4 |
| 키보드 처리 | 표준 KeyboardAvoidingView + ScrollView |
| SafeArea | react-native-safe-area-context |
| 푸시 알림 | expo-notifications + expo-device + expo-server-sdk |
| 비밀번호 | bcryptjs (hash rounds: 10) |
| 테스트 | Jest + supertest |
| Admin 웹 | React + Vite + TypeScript (`admin-web/`) |
| Admin 인증 | jsonwebtoken (JWT, SUPER_ADMIN 역할 기반) |

### 다음 개발 우선순위 (2026-03-04 업데이트)

1. **미납자 알림 자동화**: 미납자 대상 자동 스케줄 알림 (cron 연동)
2. **JWT 인증 미들웨어 (앱 API)**: Admin 웹에 이어 앱 API도 JWT 보안 강화
3. **PG 결제 서버 검증**: `imp_uid` → PortOne API 서버 검증 (보안 필수)
4. **공용 장부 실데이터 연동**: LedgerScreen 더미 → 실제 LedgerTransaction DB 연동
5. **Admin 웹 기능 확장**: 빌라별 청구서/납부 현황, 통계 대시보드

---

## 16. MVP 구현 현황 (2026-03-05 기준)

### 이 세션에서 추가/변경된 기능

#### 회원가입 역할 선택 분기 신설 (`SelectRoleScreen.tsx`)

기존 `SignupProfileScreen` 완료 후 바로 Onboarding으로 이동하던 방식에서, 역할 선택 단계를 추가.

| 구분 | 내용 |
|------|------|
| SelectRoleScreen | **신규** — "동대표로 시작하기" / "입주민으로 시작하기" 명시적 선택 |
| 동대표 경로 | SelectRole → `POST /api/auth/register { role: 'ADMIN' }` → `Onboarding` (빌라 등록) |
| 입주민 경로 | SelectRole → `POST /api/auth/register { role: 'RESIDENT' }` → `VillaSearch` 또는 `ResidentJoin` |
| AppNavigator | `SelectRole` 스택 화면 등록 (headerShown: false) |

#### 빌라 검색/신청 화면 신설 (`VillaSearchScreen.tsx`)

초대 코드 없이도 입주 신청 가능한 경로 추가.

| 구분 | 내용 |
|------|------|
| VillaSearchScreen | **신규** — 빌라 이름/주소 검색 → 입주 신청 |
| 백엔드 | `GET /api/villas/search?q=` 신규 — 빌라 이름/주소 검색 |
| 백엔드 | `POST /api/villas/:villaId/join-requests` 신규 — 입주 신청 (관리자 승인 대기) |

#### '우리 빌라' 탭 신설 (`OurVillaScreen.tsx`)

입주민 하단 탭에 빌라 정보 전용 탭 추가. 투명한 프롭테크 UX 완성.

| 구분 | 내용 |
|------|------|
| ResidentTabNavigator | 3개 탭 → 4개 탭 (홈/커뮤니티/**우리 빌라**/프로필) |
| OurVillaScreen | **신규** — 빌라 기본 정보 + 건물 이력 사진 썸네일 갤러리 |
| 데이터 | `GET /api/villas/:villaId/building-events` 기존 API 재활용 (사진 있는 이력만 필터) |

#### 계약 상세 화면 신설 (`ContractDetailScreen.tsx`)

건물 이력의 계약서/영수증 사진 전체 화면 뷰어.

| 구분 | 내용 |
|------|------|
| ContractDetailScreen | **신규** — `BuildingEvent.attachmentUrl` 풀스크린 이미지 뷰어 |
| 네비게이션 | `OurVillaScreen` 카드 탭 → `ContractDetail` 이동 |

#### SaaS B2B 수익 모델 장착 (`AdminSubscriptionScreen.tsx`)

복잡한 PG 결제 대신 수동 계좌 송금 + 무료 쿠폰 방식으로 구독 BM 실증.

| 구분 | 내용 |
|------|------|
| DB | `Villa.subscriptionStatus String @default("FREE_TRIAL")` 추가 (FREE_TRIAL \| ACTIVE \| EXPIRED) |
| DB | `Villa.trialEndDate DateTime?` 추가 |
| DB | `Coupon` 모델 신규 (id, code unique, isUsed, usedAt) |
| 백엔드 | `POST /api/subscriptions/redeem` 신규 — 쿠폰 코드 검증 + FREE_TRIAL 활성화 |
| 백엔드 | `GET /api/villas/:villaId/subscription` 신규 — 구독 상태 조회 |
| 백엔드 | `POST /api/villas/:villaId/subscription/notify` 신규 — 수동 입금 완료 알림 |
| AdminSubscriptionScreen | **신규** — 구독 상태 표시, 쿠폰 입력, 유료 신청(계좌 이체 안내) |
| 구독 흐름 | `FREE_TRIAL(1개월)` → `ACTIVE`(유료) → `EXPIRED`(만료, 기능 제한 예정) |

#### 입주민 청구서 전용 화면 신설 (`ResidentInvoiceScreen.tsx`)

`ResidentDashboardScreen`에서 청구서 관련 로직을 분리하여 단일 책임 원칙 적용.

| 구분 | 내용 |
|------|------|
| ResidentInvoiceScreen | **신규** — 청구서 목록, 미납/완납 필터, 납부 처리 |

### 현재 구현된 전체 화면 목록 (2026-03-05 기준)

#### 인증/온보딩
- `LoginScreen`, `EmailLoginScreen`, `ProfileSetupScreen`, `OnboardingScreen`, `ResidentJoinScreen`
- `SignupAgreementScreen` (회원가입 Step 2: 약관 동의)
- `SignupProfileScreen` (회원가입 Step 3: 프로필 입력)
- `SelectRoleScreen` ← NEW (회원가입 Step 4: 역할 선택 분기)

#### 관리자 탭 (4개)
- `DashboardScreen` (홈 — 롤링배너+위젯, 🔔), `BoardScreen` (커뮤니티+민원), `ManagementScreen` (관리), `ProfileScreen` (iOS 설정 스타일)

#### 입주민 탭 (4개) ← 탭 1개 추가
- `ResidentDashboardScreen` (홈 — 롤링배너+위젯, 🔔), `BoardScreen` (커뮤니티+민원), `OurVillaScreen` ← NEW (우리 빌라), `ProfileScreen` (iOS 설정 스타일)

#### 스택 화면 (탭 위에 push)
- `AdminInvoiceScreen`, `AdminInvoiceDetailScreen`, `CreateInvoiceScreen`
- `ResidentManagementScreen`, `LedgerScreen`, `PaymentScreen`
- `PostDetailScreen`, `CreatePostScreen`
- `ParkingSearchScreen`
- `BuildingHistoryScreen`, `CreateBuildingEventScreen`
- `ExternalBillingScreen`
- `CreatePollScreen`, `PollListScreen`, `PollDetailScreen`
- `VehicleManagementScreen`, `ChangePasswordScreen`, `MyPostsScreen`
- `GuideScreen`, `NotificationScreen`
- `CustomerCenterScreen`, `SystemNoticeScreen`
- `VillaSearchScreen` ← NEW (빌라 검색/신청)
- `ContractDetailScreen` ← NEW (계약 상세)
- `AdminSubscriptionScreen` ← NEW (SaaS 구독 관리)
- `ResidentInvoiceScreen` ← NEW (입주민 청구서 전용)

### 현재 기술 스택 (2026-03-05 업데이트)

| 구분 | 실제 구현 |
|------|-----------|
| Frontend | React Native (Expo Go) + TypeScript |
| Backend | Express + TypeScript (단일 index.ts, ~1700+ 라인) |
| ORM | Prisma 7 |
| Database | Supabase (PostgreSQL) |
| API 설정 | `frontend/src/config.ts` (API_BASE_URL 중앙화) |
| 결제 | PortOne (KG Inicis) 테스트 PG 연동 |
| 파일 업로드 | multer (로컬 디스크, `backend/uploads/`) |
| 이미지 선택 | expo-image-picker |
| 날짜 선택 | @react-native-community/datetimepicker v8.4.4 |
| 키보드 처리 | 표준 KeyboardAvoidingView + ScrollView |
| SafeArea | react-native-safe-area-context |
| 푸시 알림 | expo-notifications + expo-device + expo-server-sdk |
| 비밀번호 | bcryptjs (hash rounds: 10) |
| 테스트 | Jest + supertest |
| Admin 웹 | React + Vite + TypeScript (`admin-web/`) |
| Admin 인증 | jsonwebtoken (JWT, SUPER_ADMIN 역할 기반) |
| SaaS BM | 수동 계좌 송금 + 쿠폰 방식 (PG 없음) |

### 다음 개발 우선순위 (2026-03-05 업데이트)

1. **구독 쿠폰 검증 강화**: DB 기반 Coupon 테이블 + 원자적 isUsed 플래그 처리 (레이스 컨디션 방지)
2. **구독 만료 API 제한**: EXPIRED 상태 시 핵심 기능 제한 서버 미들웨어
3. **미납자 알림 자동화**: cron 기반 미납자 자동 푸시 알림 (핵심 기획 요구사항 — 계속 미구현)
4. **JWT 인증 미들웨어**: 앱 API 전체 보안 강화 + 구독 상태 체크 연동
5. **공용 장부 실데이터 연동**: LedgerScreen 더미 → 실제 LedgerTransaction DB 연동

---

## 17. MVP 구현 현황 (2026-03-06 기준)

### 이 세션에서 추가/변경된 기능

#### 관리자 가이드 라이브러리 (신규)

동대표 실무 지식 허브 — 관리비 분쟁, 하자 처리, 법적 의무 등 카테고리별 아티클 제공.

| 구분 | 내용 |
|------|------|
| DB | `Guide` 모델 신규 (id uuid, category, title, content HTML, thumbnailUrl?, createdAt) |
| 백엔드 | `GET /api/guides`, `GET /api/guides/:id` (공개) |
| 백엔드 | `POST/PUT/DELETE /api/guides` (SUPER_ADMIN JWT 전용) |
| Admin 웹 | `Guides.tsx` — Tiptap 리치 텍스트 편집기 (Bold/Italic/H2/H3/목록/인용 툴바) |
| Admin 웹 | 썸네일 이미지 업로드 (`POST /api/upload`) |
| 모바일 | `GuideLibraryScreen.tsx` — 카테고리 칩 필터, 썸네일 카드 목록 |
| 모바일 | `GuideDetailScreen.tsx` — `react-native-render-html`로 HTML 렌더링, tagsStyles 적용 |
| 콘텐츠 분류 | 하자관리 / 관리비 / 시설관리 / 세입자관리 / 건물운영 / 유지보수 / 법/제도 |

- **기술 선택**: react-quill은 React 19 호환 불가 → Tiptap(`@tiptap/react`) 채택
- **모바일 렌더링**: `react-native-render-html` + `tagsStyles` 객체로 커스텀 스타일 적용

#### Admin 웹 대시보드 시각화 (신규)

운영팀이 서비스 현황을 한눈에 파악할 수 있는 관리 대시보드.

| 구분 | 내용 |
|------|------|
| 백엔드 | `GET /api/admin/stats` 신규 (SUPER_ADMIN 전용, Prisma groupBy 활용) |
| KPI 카드 | 전체 빌라 수 / 사용자 수 / 가이드 수 / FAQ 수 |
| PieChart | 구독 상태별 빌라 분포 (FREE_TRIAL=파랑 / ACTIVE=초록 / EXPIRED=빨강) |
| BarChart | 최근 7일 신규 가입 추이 |
| 패키지 | `recharts` (Recharts 라이브러리) |

#### 보안 취약점 C1~C5 전체 수정 완료

보안 감사에서 식별된 5개 취약점 중 C1~C5 백엔드/프론트엔드 수정 완료.

| 취약점 | 내용 | 수정 방식 |
|--------|------|-----------|
| C1 | 모바일 로그인 JWT 미발급 | 모든 login/register 엔드포인트에 30일 만료 JWT 발급 추가 |
| C2 | auth 응답에 password/expoPushToken/providerId 포함 | `sanitizeUser()` 헬퍼 전체 적용 |
| C4 | 구독 관리 엔드포인트 인증 없음 | `authenticateUser` 미들웨어 + SUPER_ADMIN 역할 체크 |
| C5 | Admin 웹 XSS 취약점 (dangerouslySetInnerHTML) | `DOMPurify.sanitize()` 래핑 (`dompurify` + `@types/dompurify` 설치) |

- **잔여 작업**: 모바일 클라이언트 AsyncStorage에 JWT 토큰 저장 → 다음 세션 완성 예정

### 현재 구현된 전체 화면 목록 (2026-03-06 기준)

#### 인증/온보딩
- `LoginScreen`, `EmailLoginScreen`, `ProfileSetupScreen`, `OnboardingScreen`, `ResidentJoinScreen`
- `SignupAgreementScreen` (회원가입 Step 2: 약관 동의)
- `SignupProfileScreen` (회원가입 Step 3: 프로필 입력)
- `SelectRoleScreen` (회원가입 Step 4: 역할 선택 분기)

#### 관리자 탭 (4개)
- `DashboardScreen` (홈 — 롤링배너+위젯, 🔔), `BoardScreen` (커뮤니티+민원), `ManagementScreen` (관리), `ProfileScreen` (iOS 설정 스타일)

#### 입주민 탭 (4개)
- `ResidentDashboardScreen` (홈 — 롤링배너+위젯, 🔔), `BoardScreen` (커뮤니티+민원), `OurVillaScreen` (우리 빌라), `ProfileScreen` (iOS 설정 스타일)

#### 스택 화면 (탭 위에 push)
- `AdminInvoiceScreen`, `AdminInvoiceDetailScreen`, `CreateInvoiceScreen`
- `ResidentManagementScreen`, `LedgerScreen`, `PaymentScreen`
- `PostDetailScreen`, `CreatePostScreen`
- `ParkingSearchScreen`
- `BuildingHistoryScreen`, `CreateBuildingEventScreen`
- `ExternalBillingScreen`
- `CreatePollScreen`, `PollListScreen`, `PollDetailScreen`
- `VehicleManagementScreen`, `ChangePasswordScreen`, `MyPostsScreen`
- `GuideScreen`, `NotificationScreen`
- `CustomerCenterScreen`, `SystemNoticeScreen`
- `VillaSearchScreen`, `ContractDetailScreen`, `AdminSubscriptionScreen`, `ResidentInvoiceScreen`
- `GuideLibraryScreen` ← NEW (관리자 가이드 라이브러리 목록)
- `GuideDetailScreen` ← NEW (가이드 상세 — HTML 렌더링)

#### Admin 웹 (`admin-web/`)
- `LoginPage`, `UsersPage`, `VillasPage`, `FaqPage`, `NoticePage`
- `Guides.tsx` ← NEW (가이드 CRUD — Tiptap 편집기)
- `Dashboard.tsx` ← NEW (KPI 카드 + Recharts 차트)

### 현재 기술 스택 (2026-03-06 업데이트)

| 구분 | 실제 구현 |
|------|-----------|
| Frontend | React Native (Expo Go) + TypeScript |
| Backend | Express + TypeScript (단일 index.ts, ~1800+ 라인) |
| ORM | Prisma 7 |
| Database | Supabase (PostgreSQL) |
| API 설정 | `frontend/src/config.ts` (API_BASE_URL 중앙화) |
| 결제 | PortOne (KG Inicis) 테스트 PG 연동 |
| 파일 업로드 | multer (로컬 디스크, `backend/uploads/`) |
| 이미지 선택 | expo-image-picker |
| 날짜 선택 | @react-native-community/datetimepicker v8.4.4 |
| 키보드 처리 | 표준 KeyboardAvoidingView + ScrollView |
| SafeArea | react-native-safe-area-context |
| 푸시 알림 | expo-notifications + expo-device + expo-server-sdk |
| 비밀번호 | bcryptjs (hash rounds: 10) |
| 테스트 | Jest + supertest |
| Admin 웹 | React + Vite + TypeScript (`admin-web/`) |
| Admin 인증 | jsonwebtoken (JWT, SUPER_ADMIN 역할 기반) |
| SaaS BM | 수동 계좌 송금 + 쿠폰 방식 (PG 없음) |
| 리치 텍스트 편집 | @tiptap/react + StarterKit + Underline + Link |
| HTML 렌더링 (모바일) | react-native-render-html |
| 대시보드 차트 | Recharts (PieChart, BarChart, ResponsiveContainer) |
| XSS 방지 | DOMPurify (admin-web) |

### 다음 개발 우선순위 (2026-03-06 업데이트)

1. **JWT 클라이언트 저장 완성**: AsyncStorage에 토큰 저장 → 모바일 API 인증 헤더 일괄 적용 (C1 클라이언트 완성)
2. **미납자 알림 자동화**: cron 기반 미납자 자동 푸시 알림 (핵심 기획 요구사항 — 계속 미구현)
3. **구독 만료 API 제한**: EXPIRED 상태 시 핵심 기능 제한 서버 미들웨어
4. **PG 결제 서버 검증**: `imp_uid` → PortOne API 서버 검증 (보안 필수)
5. **공용 장부 실데이터 연동**: LedgerScreen 더미 → 실제 LedgerTransaction DB 연동
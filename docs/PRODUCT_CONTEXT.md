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

### 현재 기술 스택 (2026-03-08 업데이트)

| 구분 | 실제 구현 |
|------|-----------|
| Frontend | React Native (Expo Go) + TypeScript |
| Backend | Express + TypeScript (단일 index.ts, ~1900+ 라인) |
| ORM | Prisma 7 |
| Database | Supabase (PostgreSQL) |
| API 설정 | `frontend/src/config.ts` (API_BASE_URL 중앙화) |
| 결제 | PortOne (KG Inicis) 테스트 PG 연동 + 모의 자동결제 (Mock Toss Payments) |
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

---

## 18. 제품 로드맵 (2026-03-08 기획 세션)

### 배경
전자투표 실시간 참여율, IA 개편, 푸시 알림 인프라 구축을 마친 후, 다음 개발 방향을 논의한 결과를 기록한다.

### BM 결정 사항

| 항목 | 결정 |
|------|------|
| SaaS 구독료 | 19,900원/월 (동대표 1계정) |
| 결제 수단 | Toss Payments 빌링키 자동결제 (구독료 전용) |
| 관리비 카드결제 중계 | **보류** — 전자금융업 등록 필요, 법적 부담이 큼 |
| 관리비 납부 방식 | 현재: 입주민 계좌이체 → 향후: 외부 PG 링크 (Toss Pay) |

> **핵심 판단**: 관리비 카드결제를 Villamate가 중계(수금 후 재송금)하면 전자금융거래법상 전자금융업자 등록이 필요하다. 토스/이니시스 PG가 직접 동대표 계좌로 송금하는 구조라면 등록 불필요하나, 현재 입주민 UX 개선 대비 법적 리스크가 크다. 우선순위를 낮게 유지한다.

---

### 우선순위별 로드맵

#### 즉시 (이번 달, 2026-03)

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 구독료 자동결제 | Toss Payments 빌링키 발급 → 매월 19,900원 자동 청구 | 핵심 |
| 미납자 자동 독촉 알림 | cron job으로 매일 미납자 체크 → 푸시 자동 발송 (기획 요구사항 계속 미구현) | 핵심 |
| 동대표 교체/권한 위임 | 현재 ADMIN 역할 고정 → 새 동대표에게 역할 이전 기능 | 중요 |
| 멀티 빌라 UI | 동대표가 2개 이상 빌라 관리 시 탭 또는 드롭다운 전환 | 중요 |

#### 다음 분기 (4~6월, 2026-Q2)

| 기능 | 설명 |
|------|------|
| 민원 트래킹 강화 | 접수→처리중→완료 상태 변경 + 입주민 실시간 알림 |
| 에너지 사용량 시각화 | 전기/수도 사용량 입력 → 월별 그래프 (환경 의식 + 관리비 예측) |
| PDF 문서 관리 | 입주자 대표회의 회의록, 계약서 등 PDF 업로드·열람 |
| 커뮤니티 강화 | 게시글 좋아요, 댓글 알림 push, 이미지 첨부 |
| QR 방문자 차량 등록 | QR 스캔으로 방문 차량 임시 등록 (주차 관리 자동화) |

#### 장기 (2026 하반기~)

| 기능 | 설명 | 비고 |
|------|------|------|
| 관리비 자동이체 | 오픈뱅킹 API → 입주민 계좌에서 자동 출금 | 금융위 허가 필요 |
| 공용 시설 예약 | 주차장, 세탁실, 옥상 등 시설 예약 시스템 | 빌라마다 시설 편차 큼 |
| 네이버 로그인 | 소셜 로그인으로 온보딩 마찰 감소 | 네이버 검수 리드타임 고려 |

#### 하지 말 것 (현재 단계)

| 기능 | 이유 |
|------|------|
| 입주민 간 채팅 | 갈등 조장 리스크, 콘텐츠 모더레이션 부담, 핵심 가치와 무관 |
| 부동산 매물 연동 | 빌라 관리 핵심 가치와 거리 멀고 네이버/직방과 경쟁 불가 |

---

### IA 개편 이력 (이번 세션, 2026-03-08)

| 변경 내용 | 대상 |
|-----------|------|
| 4탭 → 5탭 (장부 탭 독립) | 관리자 앱 |
| 커뮤니티 헤더에 "내가 쓴 글" 아이콘 추가 | 관리자/입주민 공통 |
| 이용 가이드 → 우리 빌라 탭 하단으로 이동 | 입주민 앱 |
| 전자투표 → 관리 탭 + 우리 빌라 탭 양쪽 노출 | 관리자/입주민 공통 |
| 백오피스 사이드바 2섹션 분리 (운영/콘텐츠) | 관리자 웹 |
| 전자투표 참여율 실시간 프로그레스 바 | PollDetailScreen |
| 미참여자 푸시 알림 (동대표 → 미투표 세대) | PollDetailScreen + backend |

### 다음 개발 우선순위 (2026-03-08 업데이트)

1. **구독료 자동결제**: Toss Payments 빌링키 → 월 자동청구 (BM 완성의 핵심)
2. **미납자 자동 독촉 알림**: cron job + 푸시 (최초 기획 요구사항, 계속 미구현)
3. **동대표 교체/권한 위임**: ADMIN 역할 이전 UI + 백엔드
4. **JWT 클라이언트 완성**: AsyncStorage 토큰 → API 헤더 일괄 적용 (보안 C1 완성)
5. **구독 만료 미들웨어**: EXPIRED 상태 → 핵심 기능 제한

---

## 19. MVP 구현 현황 (2026-03-10 기준)

### 이 세션에서 추가/변경된 기능

#### 다중 역할 입주민 — HEAD(세대주) vs MEMBER(세대원)

같은 호수에 여러 사람이 입주할 수 있도록 역할을 분리. `ResidentRecord.residentType` 필드 추가.

| 구분 | HEAD (세대주) | MEMBER (세대원) |
|------|--------------|----------------|
| 청구서 대상 | ✅ | ❌ |
| 투표 참여 | ✅ | ❌ (비활성 UI + 안내) |
| 납부 내역 조회 | ✅ | 빈 목록 즉시 반환 |
| 역할 배지 | 👑 주황 | 👥 하늘색 |

- 가입 시 자동 판별: `villaId + normalizedRoomNumber` 조합으로 기존 HEAD 존재 여부 확인
- 스키마: `ResidentRecord.residentType String @default("HEAD")`

#### 듀얼 모드 (ADMIN ↔ RESIDENT 전환)

동대표 계정 하나로 관리자/입주민 화면을 전환할 수 있는 모드 스위치.

| 구분 | 내용 |
|------|------|
| Context | `frontend/src/context/AppModeContext.tsx` 신규 — `AppMode: 'ADMIN' \| 'RESIDENT'` |
| 전환 방향 | 관리자 홈 → "🔄 입주민 모드로 전환" (보라색 카드) |
| 복귀 방향 | 입주민 홈/프로필 → "👑 관리자 모드로 복귀" (ADMIN 전용 버튼) |
| 데이터 흐름 | 전환 시 villa 정보를 AsyncStorage `user`에 병합 후 `setAppMode` + 네비게이션 |

#### 세대 호수 사전 지정

관리자가 호수 목록을 미리 등록 → 입주민이 가입 시 목록에서 선택.

| 구분 | 내용 |
|------|------|
| 스키마 | `Villa.roomNumbers String[] @default([])` 추가 |
| 백엔드 | `POST /api/villas`: `roomNumbers[]` + `adminRoomNumber` 함께 수신 |
| 백엔드 | `GET /api/villas/join/rooms?inviteCode=XXX`: 가입 전 호수 목록 조회 (신규) |
| 백엔드 | `PUT /api/villas/:villaId/rooms`: 관리자 호수 목록 수정 (신규) |
| ResidentJoinScreen | 6자리 코드 완성 시 자동 fetch → picker Modal (없으면 TextInput 폴백) |
| OnboardingScreen | 호수 칩 UI (추가/삭제) + `adminRoomNumber` 입력 |
| DashboardScreen | "세대 호수 관리" 카드 + 수정 Modal |

#### 호수 정규화 버그 수정

`'101호'` vs `'101'` 불일치로 발생한 복합 버그 수정.

- `normalizeRoom(room)` 유틸: `room.replace(/호/g, '').trim()`
- 모든 가입/저장 경로 및 조회 경로에 정규화 적용
- `migrateRoomNumbers()` 스타트업 함수: 기존 더티 데이터 일괄 정규화 (idempotent)
- MEMBER 납부 가드: `GET /api/residents/:id/payments`에서 MEMBER이면 즉시 `200 []` 반환

#### 미납 관리비 자동 독촉 알림 — **핵심 기획 요구사항 달성** ✅

초기 기획의 "미납자 알림" 요구사항이 드디어 구현됨.

| 트리거 | 시점 | 제목 | 본문 |
|--------|------|------|------|
| 청구서 생성 즉시 | POST /invoices 응답 후 | 새 관리비 청구서 도착 📋 | ${billingMonth} 관리비가 청구되었습니다. ${amountPerResident}원 |
| 3일차 리마인더 | 매일 오전 10시 cron | 관리비 미납 안내 ⚠️ | 기한 내 납부 부탁드립니다. |
| 7일차 최종 안내 | 매일 오전 10시 cron | 관리비 미납 안내 ⚠️ | [최종 안내] 관리비 납부를 확인해주세요. |

- 대상: PENDING InvoicePayment × HEAD 세대주 × expoPushToken 보유자
- 7일 이후: 추가 알림 없음 (스팸 방지)
- 격리: 청구서 생성 응답과 분리된 try/catch 블록 → 푸시 실패가 생성 실패로 이어지지 않음

### 현재 구현된 전체 화면 목록 (2026-03-10 기준)

#### 인증/온보딩
- `LoginScreen`, `EmailLoginScreen`, `SignupAgreementScreen`, `SignupProfileScreen`, `SelectRoleScreen`
- `OnboardingScreen` (호수 칩 UI 추가), `ResidentJoinScreen` (호수 picker 추가)

#### 관리자 탭 (5개)
- `DashboardScreen` (듀얼 모드 전환 버튼, 호수 관리 Modal), `ManagementScreen`, `CommunityTabScreen`, `LedgerTabScreen`, `ProfileScreen` (역할 배지)

#### 입주민 탭 (4개)
- `ResidentDashboardScreen` (관리자 복귀 버튼), `ResidentCommunityTabScreen`, `OurVillaScreen`, `ProfileScreen` (역할 배지)

#### 스택 화면 (탭 위에 push)
- `AdminInvoiceScreen`, `AdminInvoiceDetailScreen`, `CreateInvoiceScreen`
- `ResidentManagementScreen`, `LedgerScreen`, `PaymentScreen`
- `PostDetailScreen`, `CreatePostScreen`
- `ParkingSearchScreen`, `VehicleManagementScreen`
- `BuildingHistoryScreen`, `CreateBuildingEventScreen`
- `ExternalBillingScreen`
- `CreatePollScreen`, `PollListScreen`, `PollDetailScreen` (MEMBER 가드 UI 추가)
- `ChangePasswordScreen`, `MyPostsScreen`
- `GuideScreen`, `NotificationScreen`
- `CustomerCenterScreen`, `SystemNoticeScreen`
- `VillaSearchScreen`, `ContractDetailScreen`, `AdminSubscriptionScreen`, `ResidentInvoiceScreen`
- `GuideLibraryScreen`, `GuideDetailScreen`

### 현재 기술 스택 (2026-03-10 업데이트)

| 구분 | 실제 구현 |
|------|-----------|
| Frontend | React Native (Expo Go) + TypeScript |
| Backend | Express + TypeScript (단일 index.ts, ~2200+ 라인) |
| ORM | Prisma 7 |
| Database | Supabase (PostgreSQL) |
| API 설정 | `frontend/src/config.ts` (API_BASE_URL 중앙화) |
| 결제 | PortOne (KG Inicis) 테스트 PG 연동 + 모의 자동결제 (Mock Toss Payments) |
| 파일 업로드 | multer (로컬 디스크, `backend/uploads/`) |
| 이미지 선택 | expo-image-picker |
| 날짜 선택 | @react-native-community/datetimepicker v8.4.4 |
| 키보드 처리 | 표준 KeyboardAvoidingView + ScrollView |
| SafeArea | react-native-safe-area-context |
| 푸시 알림 | expo-notifications + expo-device + expo-server-sdk |
| 비밀번호 | bcryptjs (hash rounds: 10) |
| 테스트 | Jest + supertest (30/32 통과, 2개 기존 버그) |
| Admin 웹 | React + Vite + TypeScript (`admin-web/`) |
| Admin 인증 | jsonwebtoken (JWT, SUPER_ADMIN 역할 기반) |
| SaaS BM | 수동 계좌 송금 + 쿠폰 방식 (PG 없음) |
| 리치 텍스트 편집 | @tiptap/react + StarterKit + Underline + Link |
| HTML 렌더링 (모바일) | react-native-render-html |
| 대시보드 차트 | Recharts (PieChart, BarChart, ResponsiveContainer) |
| XSS 방지 | DOMPurify (admin-web) |
| 상태 관리 | React Context (`AppModeContext`) |

### 다음 개발 우선순위 (2026-03-10 업데이트)

1. **JWT 클라이언트 저장 완성**: AsyncStorage 토큰 저장 → 모바일 API 인증 헤더 일괄 적용 (보안 C1 완성)
2. **구독 쿠폰 검증 강화**: DB 기반 Coupon 테이블 + 원자적 사용 처리 (isUsed 플래그)
3. **구독 만료 API 제한**: EXPIRED 상태 → 핵심 기능 제한 미들웨어
4. **동대표 교체/권한 위임**: ADMIN 역할 이전 UI + 백엔드
5. **공용 장부 실데이터 연동**: LedgerScreen 더미 → 실제 LedgerTransaction DB 연동

---

## 20. MVP 구현 현황 (2026-03-11 기준)

### 이 세션에서 추가/변경된 기능

#### RDD (요구사항 정의서) 통합 문서 신규 작성

`docs/RDD.md` 신규 생성 — 기존 PRODUCT_CONTEXT.md / IA.md / PHASE1_SCOPE.md 3개 문서를 단일 SSOT로 통합.
기능 요구사항 F-01~F-80, 비기능 요구사항 NF-01~NF-13 전체 정의 및 상태 표시.

#### 백엔드 모듈화 리팩토링 완료 (NF-12 달성)

단일 `backend/src/index.ts` (~2200+ 라인)를 도메인별 파일로 분리.

| 신규 파일/디렉토리 | 역할 |
|--------------------|------|
| `backend/src/prisma.ts` | PrismaClient 단일 인스턴스 |
| `backend/src/helpers.ts` | normalizeRoom, sanitizeUser, formatBillingMonth 헬퍼 |
| `backend/src/migrations.ts` | migrateRoomNumbers 스타트업 마이그레이션 |
| `backend/src/cron.ts` | 자동 청구 + 자동 독촉 크론 로직 |
| `backend/src/routes/` | 도메인별 Express Router (auth, villas, invoices, polls...) |
| `backend/src/controllers/` | 라우트 핸들러 함수 |
| `backend/src/middlewares/` | authenticateUser 등 미들웨어 |

- `index.ts`는 라우트 등록 + 서버 시작만 담당하는 진입점으로 단순화

#### 프론트엔드 전역 JWT 인증 완성 (F-08, NF-04 달성)

`frontend/src/utils/api.ts` 신규 생성 — Axios interceptor 기반 공통 인스턴스.

- **request interceptor**: `AsyncStorage.getItem('token')` → `Authorization: Bearer ${token}` 자동 주입
- **response interceptor**: 401 응답 시 `AsyncStorage.multiRemove(['user', 'token'])` + 로그인 화면 리다이렉트
- 35개+ 화면의 `fetch()` 직접 호출 → `axiosInstance` 호출로 일괄 교체
- 이로써 보안 C1 완성: 서버 발급 JWT → 클라이언트 일괄 적용 완료

#### 전자투표 UX 강화 — 투표 수정(Upsert) 도입

마감 전 잘못 선택한 입주민의 재투표를 허용하는 UX 개선.

| 항목 | 내용 |
|------|------|
| 투표 수정 | 마감 전 선택지 변경 → `prisma.vote.upsert` (@@unique 제약 활용) |
| 투표 완료 배지 | `hasVoted`이면 해당 선택지에 "✅ 투표 완료" 초록 배지 표시 |
| 이전 선택지 복원 | 화면 진입 시 기존 투표 조회 → `selectedOption` 자동 세팅 |

#### 미납 독촉 알림 1일 1회 쿨타임 추가

동일 청구서에 대해 당일 크론 + 수동 버튼 양쪽에서 중복 발송을 방지.
- 당일 이미 독촉 발송된 경우 재발송 차단
- 입주민이 알림을 스팸으로 인식하지 않도록 최대 1일 1회 보장

### 현재 구현된 전체 화면 목록 (2026-03-11 기준)

#### 인증/온보딩
- `LoginScreen`, `EmailLoginScreen`, `SignupAgreementScreen`, `SignupProfileScreen`, `SelectRoleScreen`
- `OnboardingScreen`, `ResidentJoinScreen` (호수 picker), `VillaSearchScreen`, `ProfileSetupScreen`

#### 관리자 탭 (5개)
- `DashboardScreen`, `ManagementScreen`, `CommunityTabScreen`, `LedgerTabScreen`, `ProfileScreen`

#### 입주민 탭 (4개)
- `ResidentDashboardScreen`, `ResidentCommunityTabScreen`, `OurVillaScreen`, `ProfileScreen`

#### 스택 화면
- `AdminInvoiceScreen`, `AdminInvoiceDetailScreen`, `CreateInvoiceScreen`
- `ResidentInvoiceScreen` (PDF 저장/공유), `PaymentScreen`
- `ResidentManagementScreen`, `LedgerScreen`
- `PostDetailScreen`, `CreatePostScreen`, `MyPostsScreen`
- `ParkingSearchScreen`, `VehicleManagementScreen`
- `BuildingHistoryScreen`, `CreateBuildingEventScreen`, `ContractDetailScreen`
- `ExternalBillingScreen`
- `CreatePollScreen`, `PollListScreen`, `PollDetailScreen` (투표 수정 Upsert, 완료 배지)
- `ChangePasswordScreen`, `GuideScreen`, `GuideLibraryScreen`, `GuideDetailScreen`
- `NotificationScreen`, `SystemNoticeScreen`, `CustomerCenterScreen`
- `AdminSubscriptionScreen`

### 현재 기술 스택 (2026-03-11 업데이트)

| 구분 | 실제 구현 |
|------|-----------|
| Frontend | React Native (Expo Go) + TypeScript |
| Backend | Express + TypeScript (**모듈형** — routes/controllers/middlewares 분리) |
| HTTP 클라이언트 | **Axios** + interceptor 기반 JWT 인증 (`frontend/src/utils/api.ts`) |
| ORM | Prisma 7 |
| Database | Supabase (PostgreSQL) |
| 인증 | JWT (30일 만료), bcryptjs, **Axios interceptor 전역 헤더 적용** |
| 결제 | PortOne (KG Inicis) 테스트 PG + Mock Toss Payments |
| 파일 업로드 | multer (로컬 디스크) |
| 푸시 알림 | expo-notifications + expo-server-sdk |
| PDF | expo-print + expo-sharing |
| 상태 관리 | React Context (AppModeContext) |
| Admin 웹 | React + Vite + TypeScript + Recharts + Tiptap + DOMPurify |
| HTML 렌더링 (모바일) | react-native-render-html |
| 테스트 | Jest + supertest |

### 다음 개발 우선순위 (2026-03-11 업데이트)

1. **구독 만료 API 제한**: EXPIRED 상태 → 청구서 발행 등 핵심 기능 제한 미들웨어
2. **구독료 자동결제 실 연동**: Toss Payments 빌링키 → 실제 월 자동청구
3. **동대표 교체/권한 위임**: ADMIN 역할 이전 UI + 백엔드
4. **PG 결제 서버 검증**: imp_uid → PortOne API 서버 검증
5. **공용 장부 실데이터 연동**: LedgerScreen 더미 → 실제 LedgerTransaction DB 연동

---

## 21. MVP 구현 현황 (2026-03-12 기준)

### 이 세션에서 추가/변경된 기능

#### 구독 만료 자동화 크론 구현 (F-68 완료)

`backend/src/cron.ts`에 `startSubscriptionExpiryCron()` 추가 — 매일 자정(00:00) 실행.

- 만료일 경과한 빌라의 `subscriptionStatus`를 `ACTIVE` / `FREE_TRIAL` → `EXPIRED` 일괄 변경 (`prisma.villa.updateMany`)
- `node-cron` 스케줄: `'0 0 * * *'` (서버 현지 시각 기준)
- `backend/src/index.ts`에서 서버 시작 시 자동 등록

#### checkSubscription 미들웨어 구현 (F-68 완료)

`backend/src/middlewares/checkSubscription.ts` 신규 생성.

```ts
const ALLOWED_STATUSES = ['ACTIVE', 'FREE_TRIAL'];
// villa.subscriptionStatus가 ALLOWED_STATUSES에 없으면 403 반환
```

- 청구서 발행, 공지사항 작성, 투표 생성 등 **쓰기 API**에만 적용 (읽기 API는 미적용)
- 적용 라우트: `POST /invoices`, `POST /notices`, `POST /polls`, `POST /building-history`, `POST /tickets`

#### 공용 장부 실데이터 연동 완료 (F-55 완료)

`LedgerScreen`의 더미 배열 데이터를 실제 DB 연동으로 교체.

| 항목 | 내용 |
|------|------|
| 신규 엔드포인트 | `GET /api/villas/:villaId/ledger` — LedgerTransaction 전체 조회 |
| 신규 엔드포인트 | `POST /api/villas/:villaId/ledger` — 수입/지출 거래 등록 (checkSubscription 적용) |
| 화면 연동 | `LedgerScreen`: `useFocusEffect` + Axios로 실시간 조회 |
| 상태 패턴 | `resolvedVillaId` — `route.params.villaId` → `AsyncStorage` 폴백 체인 |

#### Paywall 무한루프 버그 수정

403 응답 처리 중 Axios interceptor 재진입으로 인한 무한 리다이렉트 루프 해결.

```ts
// frontend/src/utils/api.ts
let isHandlingSubscriptionExpiry = false; // 모듈 레벨 플래그

axiosInstance.interceptors.response.use(null, async (error) => {
  if (error.response?.status === 403 && !isHandlingSubscriptionExpiry) {
    isHandlingSubscriptionExpiry = true;
    // ... 구독 만료 화면으로 이동
    isHandlingSubscriptionExpiry = false;
  }
});
```

#### Android BackHandler 버그 수정

React Native BackHandler API 모던 패턴 적용 — `addEventListener` 반환값(subscription)의 `.remove()` 호출로 누수 방지.

```ts
// 구버전 (버그)
BackHandler.addEventListener('hardwareBackPress', handler);
return () => BackHandler.removeEventListener('hardwareBackPress', handler);

// 신버전 (수정)
const subscription = BackHandler.addEventListener('hardwareBackPress', handler);
return () => subscription.remove();
```

- `navigation.reset()` 패턴으로 로그인/구독 화면에서 뒤로가기 차단

#### FREE_TRIAL 구독 상태 대시보드 접근 허용

`checkSubscription` 미들웨어 최초 구현 시 FREE_TRIAL 상태 빌라의 대시보드가 차단되는 버그 발생 → `ALLOWED_STATUSES`에 `'FREE_TRIAL'` 포함하여 해결.

#### ACTIVE → FREE_TRIAL 다운그레이드 방지

구독 갱신 시 이미 ACTIVE 상태인 빌라가 FREE_TRIAL로 되돌아가는 버그 수정.

```ts
// 구독 갱신 API: 현재 ACTIVE이면 FREE_TRIAL로 강등 금지
if (villa.subscriptionStatus === 'ACTIVE' && newStatus === 'FREE_TRIAL') {
  // 무시
}
```

#### 티켓(민원) 시스템 신규 구현

입주민 민원 접수 및 관리자 처리 흐름 전체 구현.

| 항목 | 내용 |
|------|------|
| 신규 화면 | `TicketListScreen` — 민원 목록 (관리자: 전체, 입주민: 본인 것만) |
| 신규 화면 | `CreateTicketScreen` — 사진 첨부 포함 민원 접수 |
| 카테고리 | `COMMON_FACILITY` / `PARKING` / `NOISE_COMPLAINT` / `ETC` |
| 이미지 업로드 | `expo-image-picker` + native `fetch()` (multipart/form-data) |
| Axios 우회 이유 | Axios interceptor가 multipart 바운더리를 덮어쓰는 문제 → `fetch()` 직접 사용 |

#### 이미지 업로드 native fetch 패턴

```ts
// Axios 대신 native fetch 사용 (multipart 업로드)
const formData = new FormData();
formData.append('image', { uri, name: 'photo.jpg', type: 'image/jpeg' } as any);
const token = await AsyncStorage.getItem('token');
const response = await fetch(`${API_BASE_URL}/api/villas/${villaId}/tickets`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }, // Content-Type 헤더 미설정 (자동)
  body: formData,
});
```

### 현재 구현된 전체 화면 목록 (2026-03-12 기준)

#### 인증/온보딩
- `LoginScreen`, `EmailLoginScreen`, `SignupAgreementScreen`, `SignupProfileScreen`, `SelectRoleScreen`
- `OnboardingScreen`, `ResidentJoinScreen`, `VillaSearchScreen`, `ProfileSetupScreen`

#### 관리자 탭 (5개)
- `DashboardScreen`, `ManagementScreen`, `CommunityTabScreen`, `LedgerTabScreen`, `ProfileScreen`

#### 입주민 탭 (4개)
- `ResidentDashboardScreen`, `ResidentCommunityTabScreen`, `OurVillaScreen`, `ProfileScreen`

#### 스택 화면
- `AdminInvoiceScreen`, `AdminInvoiceDetailScreen`, `CreateInvoiceScreen`
- `ResidentInvoiceScreen`, `PaymentScreen`
- `ResidentManagementScreen`, `LedgerScreen` (실데이터 연동 완료)
- `PostDetailScreen`, `CreatePostScreen`, `MyPostsScreen`
- `ParkingSearchScreen`, `VehicleManagementScreen`
- `BuildingHistoryScreen`, `CreateBuildingEventScreen`, `ContractDetailScreen`
- `ExternalBillingScreen`
- `CreatePollScreen`, `PollListScreen`, `PollDetailScreen`
- `ChangePasswordScreen`, `GuideScreen`, `GuideLibraryScreen`, `GuideDetailScreen`
- `NotificationScreen`, `SystemNoticeScreen`, `CustomerCenterScreen`
- `AdminSubscriptionScreen`
- **`TicketListScreen`** (신규), **`CreateTicketScreen`** (신규)

### 현재 기술 스택 (2026-03-12 업데이트)

| 구분 | 실제 구현 |
|------|-----------|
| Frontend | React Native (Expo Go) + TypeScript |
| Backend | Express + TypeScript (모듈형 — routes/controllers/middlewares 분리) |
| HTTP 클라이언트 | Axios + interceptor 기반 JWT 인증 (`frontend/src/utils/api.ts`) |
| ORM | Prisma 7 |
| Database | Supabase (PostgreSQL) |
| 인증 | JWT (30일 만료), bcryptjs, Axios interceptor 전역 헤더 적용 |
| 결제 | PortOne (KG Inicis) 테스트 PG + Mock Toss Payments |
| 파일 업로드 | multer (로컬 디스크) + native `fetch()` multipart 패턴 |
| 이미지 선택 | expo-image-picker |
| 구독 관리 | node-cron 자동 만료 + checkSubscription 미들웨어 |
| 푸시 알림 | expo-notifications + expo-server-sdk |
| PDF | expo-print + expo-sharing |
| 상태 관리 | React Context (AppModeContext) |
| Admin 웹 | React + Vite + TypeScript + Recharts + Tiptap + DOMPurify |
| HTML 렌더링 (모바일) | react-native-render-html |
| 테스트 | Jest + supertest |

### 다음 개발 우선순위 (2026-03-12 업데이트)

1. **Toss 실결제 연동**: Mock PG → Toss Payments 빌링키 실제 월 자동청구
2. **동대표 교체/권한 위임**: ADMIN 역할 이전 UI + 백엔드
3. **PG 결제 서버 검증**: imp_uid → PortOne API 서버 검증
4. **파일 스토리지 마이그레이션**: multer 로컬 디스크 → AWS S3 또는 Supabase Storage
5. **티켓 상태 알림**: 민원 처리 상태 변경 시 입주민 푸시 알림 발송
---

## 리빌드 진행 현황 (2026-04-04)

### 배경: 전면 리빌드 결정

기존 React Native + Express 코드베이스를 전면 삭제(`ca8ecc0` 커밋)하고 아래 이유로 재설계:
- UI/UX가 계획 없이 기능을 덧붙이다 보니 일관성 붕괴
- React Native → **모바일 웹** 전환 (앱스토어 심사 없음, Vercel 즉시 배포)
- Express monolith → **NestJS** 계획이었으나 Railway 유료 문제로 → **Next.js 풀스택** 단일 배포로 최종 결정

### 확정된 기술 스택 (리빌드)

| 구분 | 결정 | 이유 |
|------|------|------|
| 전체 앱 | Next.js 15 (App Router) + TypeScript | 풀스택, Vercel 무료 배포 |
| 백엔드 | Next.js Route Handlers | NestJS 제거 — 별도 서버 비용 없음 |
| 인증 | `jose` JWT + bcryptjs | Edge Runtime 호환 |
| 인증 미들웨어 | `middleware.ts` + `PUBLIC_API` 배열 | NestJS JwtGuard 대체 |
| 구독 가드 | `lib/subscription.ts` | NestJS SubscriptionGuard 대체 |
| ORM | Prisma 7 | 유지 |
| DB | Supabase PostgreSQL + Storage | 유지 |
| CSS | Tailwind CSS v4 (`@theme` 블록) | |
| 아이콘 | Heroicons v2 | |
| 스케줄러 | Vercel Cron Jobs | NestJS `@nestjs/schedule` 대체 |
| 배포 | Vercel 단일 | 무료 플랜 |

### Phase 1 구현 완료 현황 (2026-04-04)

#### 아키텍처 · 인프라
- Next.js 15 풀스택 스캐폴딩, Prisma + Supabase 연결
- `middleware.ts` JWT 전역 인증 (x-user-* 헤더 주입)
- Vercel Cron: invoice-reminder, expire-subscriptions
- `lib/auth.ts` / `lib/api.ts` / `lib/notify.ts` / `lib/subscription.ts`

#### 구현된 기능
- **인증**: 회원가입 3단계, 로그인, 역할 선택, JWT 세션, 비밀번호 변경
- **빌라**: 등록, 6자리 초대 코드, 호수 지정·수정
- **입주민**: 가입, 목록, 전출 (이력 보존), HEAD/MEMBER 자동 판별
- **청구서**: FIXED/VARIABLE 발행, 납부 현황, 수동 납부 처리, 수동 독촉 (1일 쿨타임)
- **알림**: 독촉 Cron (3/7일), 알림함 DB, 읽음 처리, 미읽음 카운트
- **커뮤니티**: 게시글 CRUD, 공지 (최대 3개), 댓글
- **구독**: 상태 조회, 쿠폰 활성화 ($transaction), SubscriptionGuard 헬퍼
- **대시보드**: 역할별 집계 통계

#### 데이터 모델 주요 변경
- `InvoicePayment.residentRecordId` → nullable + `onDelete: SetNull`
- `InvoicePayment.roomNumber` 추가 (전출 후 이력 보존)
- 유니크: `@@unique([invoiceId, roomNumber])` (기존: `[invoiceId, residentRecordId]`)

#### Phase 1 잔여
- F-26: 매월 지정일 자동 청구서 발행 Cron
- NF-07: TypeScript strict, NF-08/09: 모바일 반응형 검증

### 다음 개발 방향 (Phase 2)

1. **F-29 PG 인앱 결제** (PortOne) — 수익 실현
2. **F-54~60 전자투표** — 입주민 재방문 유인
3. **F-62~64 재무 장부** — 동대표 이탈 방지

---

## 2026-04-04 업데이트

### Phase 1 완전 완료
F-26(자동 청구서 Cron), NF-06(CSRF), NF-07(TypeScript strict), NF-08(모바일 반응형), NF-09(터치 타깃) 완료로 Phase 1 전체 종료.

### Phase 2 진입 — 인증·입주민 루프
- **F-NEW**: 카카오 우편번호 API 빌라 등록 주소 자동완성 (건물명 자동 입력 포함)
- **F-17**: 빌라 검색 → 입주 신청 (PENDING) → 관리자 승인/거절 흐름 완성. `ResidentRecord.status` 필드 추가
- **F-21**: 입주민 필터 칩 (전체/세대주/세입자)
- **F-23**: 듀얼 모드 — ADMIN이 입주민 화면으로 전환 가능 (`viewMode` localStorage)

### 아키텍처 변경
- **Next.js Route group 충돌 해결**: `(admin)`과 `(resident)` 모두 `/home`, `/community`, `/profile` 경로를 갖던 문제 → resident 경로를 `/resident/*`로 이전
- **빌라 등록 역할 승격**: 누구나 빌라를 등록할 수 있되, 성공 시 자동으로 ADMIN 역할로 승격 + 새 JWT 발급

### 환경 설정 완료
- Supabase 연결 (Session pooler: `aws-1-ap-northeast-2.pooler.supabase.com`)
- `prisma db push` 완료 (로컬 개발 환경 기준)
- `.env` / `.env.local` 분리 운용 (Prisma CLI는 `.env` 읽음)

### 현재 기술 부채
| 항목 | 우선순위 |
|------|---------|
| invoice-reminder N+1 쿼리 | Medium |
| 금액 0 청구서 독촉 제외 로직 | Low |
| 알림 API 페이지네이션 (take:50) | Low |
| 초대 코드 Rate Limit | Low |
4. **F-51~53 민원 시스템** — 커뮤니티 연계

---

## 2026-04-05 업데이트

### 1. 아키텍처 변경점

**PG 결제 레이어 추가**
- PortOne(KG이니시스) 인앱 결제 서버 검증 플로우 추가
- 클라이언트 → `IMP.request_pay()` → imp_uid 수신 → 서버 `/verify` 엔드포인트에서 PortOne REST API로 재검증 → DB 상태 갱신
- 공개 결제 라우트 `/pay/[billId]` 추가 — JWT 없이 접근 가능 (middleware PUBLIC_API에 등록)

**전역 타입 선언 파일 추가**
- `apps/web/types/globals.d.ts` — `window.IMP`(PortOne), `window.daum`(카카오 우편번호) 타입을 한 곳에서 관리

**Vercel 배포 완료**
- Railway 완전 종료
- `apps/web/vercel.json` 배치 (rootDirectory와 동일 위치)
- Cron 3개 자동 등록, `prisma generate && next build` 빌드 커맨드 확정

### 2. API 변경

| 엔드포인트 | 메서드 | 인증 | 설명 |
|-----------|--------|------|------|
| `/api/villas/[villaId]/invoices/[invoiceId]/payments/[paymentId]/verify` | POST | JWT | PortOne imp_uid 서버 검증 + InvoicePayment 상태 갱신 |
| `/api/pay/[billId]` | GET | 없음(공개) | 외부 청구서 단건 조회 |
| `/api/pay/[billId]/confirm` | POST | 없음(공개) | 외부 청구 PortOne 검증 후 COMPLETED 처리 |
| `/api/villas/[villaId]/external-billing` | GET/POST | JWT(ADMIN) | 외부 청구 목록 조회 및 생성 |

### 3. 데이터 모델 변경

**`InvoicePayment` 필드 추가** (`prisma db push`로 반영):
```prisma
impUid     String?  // PortOne 결제 고유 ID
pgProvider String?  // 결제 PG사 (예: html5_inicis)
```

### 4. 기술 부채 현황

| 항목 | 심각도 | 내용 |
|------|--------|------|
| `/api/upload` 미구현 | High | Supabase Storage 업로드 TODO — 영수증/사진 첨부 기능 전반 블로커 |
| PortOne 환경변수 | High | PORTONE_IMP_KEY/SECRET/IMP_CODE 미설정 시 런타임 502 |
| migration 파일 부재 | Medium | `prisma db push` 사용으로 rollback 이력 없음 |
| 외부 청구 confirm Rate Limit | Medium | 공개 엔드포인트에 요청 빈도 제한 없음 |
| invoice-reminder N+1 쿼리 | Medium | 대규모 빌라에서 성능 저하 가능 |
| 알림 API 페이지네이션 | Low | `take: 50` 하드코딩 |

---

## 2026-04-07 업데이트

### 1. 아키텍처 변경점

**민원(Ticket) 도메인 신설**
- 커뮤니티(Post)와 별도 도메인으로 분리 (`/api/villas/[villaId]/tickets`)
- 상태 머신(PENDING→IN_PROGRESS→RESOLVED) 서버 단방향 강제 (`VALID_TRANSITIONS` 맵)
- 역할 기반 접근 제어: GET은 role에 따라 전체/본인 필터, PATCH는 ADMIN 전용

**알림 유틸 확장 (`lib/notify.ts`)**
- `notifyTicketStatusChange()` 추가 — 민원 상태 변경 시 접수 입주민에게 `NotificationType.TICKET` 알림 생성

**루트 URL 랜딩 페이지 추가 (`app/page.tsx`)**
- 기존 404 → 인증 분기 랜딩 페이지
- 비로그인: 미니멀 랜딩 (Hero + 문제정의 + 핵심기능 + CTA 2개)
- 로그인: role 기반 자동 redirect (ADMIN→/home, RESIDENT→/resident/home, SUPER_ADMIN→/backoffice/dashboard)

### 2. API 변경

| 엔드포인트 | 메서드 | 인증 | 설명 |
|-----------|--------|------|------|
| `/api/villas/[villaId]/tickets` | GET | JWT | ADMIN: 전체 조회 / RESIDENT: 본인 접수 건만 |
| `/api/villas/[villaId]/tickets` | POST | JWT | 민원 접수 (category, title, description) |
| `/api/villas/[villaId]/tickets/[ticketId]` | PATCH | JWT(ADMIN) | 상태 전환 (PENDING→IN_PROGRESS→RESOLVED) + 알림 생성 |

### 3. 데이터 모델 변경

스키마 변경 없음 — `Ticket`, `NotificationType.TICKET` 모두 기존 schema.prisma에 정의되어 있었음.

### 4. 기술 부채 현황

| 항목 | 심각도 | 내용 |
|------|--------|------|
| `/api/upload` 미구현 | High | Supabase Storage 업로드 TODO — 게시글 이미지(F-48), 영수증(F-64), 건물이력 사진(F-68) 전반 블로커 |
| PortOne 환경변수 | High | PORTONE_IMP_KEY/SECRET/IMP_CODE 미설정 시 런타임 502 |
| Ticket 알림 동기 실행 | Low | `notifyTicketStatusChange` PATCH 응답 전 동기 실행 — 알림 DB 장애 시 500 전파 |
| migration 파일 부재 | Medium | `prisma db push` 사용으로 rollback 이력 없음 |
| 외부 청구 confirm Rate Limit | Medium | 공개 엔드포인트에 요청 빈도 제한 없음 |
| invoice-reminder N+1 쿼리 | Medium | 대규모 빌라에서 성능 저하 가능 |
| 알림 API 페이지네이션 | Low | `take: 50` 하드코딩 |
| 초대 코드 Rate Limit | Low | 브루트포스 방어 없음 |

---

## 16. 운영 버그 수정 현황 (2026-04-07 기준)

### 이 세션에서 수정된 버그

#### Supabase PgBouncer prepared statement 오류
- **증상**: 빌라 등록, 홈 대시보드 등에서 간헐적 서버 500 오류
- **로그**: `PostgresError { code: "26000", message: "prepared statement does not exist" }`
- **원인**: Vercel Serverless 환경에서 Prisma가 Supabase PgBouncer(트랜잭션 모드)에 prepared statement 전송 → 미지원
- **조치**: `DATABASE_URL` 환경변수에 `?pgbouncer=true` 파라미터 추가 필요 (Vercel 대시보드)
- **영향 범위**: 모든 Prisma 쿼리 (간헐적 오류이므로 발견이 늦었음)

#### localStorage user 구조 불일치 (10개 파일 동시 수정)
- **증상**: 세대 호수 관리, 커뮤니티, 민원, 청구서 페이지에서 데이터 미표시
- **원인**: 저장된 유저 구조가 `user.villa.id`인데 코드에서 존재하지 않는 `user.villaId` 참조
- **수정**: admin 페이지 → `user.villa?.id`, resident 페이지 → `user.residentVilla?.id ?? user.villa?.id`
- **영향 파일**: residents, tickets, invoices, community 관련 10개 페이지

#### 홈 화면 간헐적 "빌라가 등록되지 않았습니다"
- **증상**: 홈 화면 재방문 시 빌라가 등록돼 있음에도 빌라 미등록 화면 표시
- **원인**: 대시보드 API fetch 실패 시 `.catch(() => setNeedsSetup(true))`로 오처리
- **수정**: `fetchError` 상태 분리 → "데이터를 불러오지 못했습니다" + 재시도 버튼

#### 하단 고정 버튼이 BottomNav와 겹침
- **증상**: 글쓰기/청구서 발행/민원 접수 화면에서 "등록하기" 버튼이 탭바와 겹치고 전체 화면 폭 차지
- **원인**: `fixed bottom-0 left-0 right-0` — BottomNav 오프셋 없음
- **수정**: `fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-lg` (4개 파일)

### 현재 기술 스택 (2026-04-07 기준)

| 구분 | 실제 구현 |
|------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Backend | Next.js 15 Route Handlers (API Routes) |
| ORM | Prisma 6.x |
| Database | Supabase (PostgreSQL) — PgBouncer 풀러 사용 |
| 인증 | JWT (`jose`) + localStorage |
| 배포 | Vercel (자동 배포, main 브랜치 push) |
| 결제 | PortOne (KG Inicis) |
| 알림 | 앱 내 알림함 (DB 기반) |

### 4. 기술 부채 현황 (2026-04-07 업데이트)

| 항목 | 심각도 | 내용 |
|------|--------|------|
| `DATABASE_URL ?pgbouncer=true` 미적용 | **Critical** | Vercel 환경변수 수동 수정 필요 — 미적용 시 간헐적 운영 장애 |
| `/api/upload` 미구현 | High | Supabase Storage 업로드 — 이미지 첨부 기능(F-48, F-64, F-68) 전반 블로커 |
| PortOne 환경변수 | High | 운영 전 PORTONE_IMP_KEY/SECRET 설정 필수 |
| API catch 블록 에러 로깅 | Medium | 대부분의 API 라우트에서 에러를 삼키고 500만 반환 — 원인 추적 불가 |
| migration 파일 부재 | Medium | `prisma db push` 사용으로 rollback 이력 없음 |
| 외부 청구 Rate Limit | Medium | 공개 엔드포인트에 요청 빈도 제한 없음 |
| invoice-reminder N+1 쿼리 | Medium | 대규모 빌라에서 성능 저하 가능 |
| 알림 API 페이지네이션 | Low | `take: 50` 하드코딩 |
| 초대 코드 Rate Limit | Low | 브루트포스 방어 없음 |

---

## 2026-04-10 업데이트

### 1. 아키텍처 변경점

**커뮤니티 댓글 시스템 완성 (F-46)**
- 기존 "댓글 기능은 준비 중입니다." 플레이스홀더 → 실제 댓글 작성/조회 UI 구현
- 동대표 커뮤니티(`(admin)/community/[id]`)와 입주민 커뮤니티(`(resident)/resident/community/[id]`) 양쪽에 동일 패턴 적용
- 댓글 등록 후 서버 재요청 없이 로컬 state에 즉시 append (optimistic-style UX)

**게시글 이미지 첨부 인프라 완성 (F-48)**
- `/api/upload` 라우트 실구현 — Supabase Storage service role key 사용, `posts/` 버킷에 업로드
- 파일 유효성 검사: allowedTypes whitelist(`image/jpeg`, `image/png`, `image/webp`, `image/gif`), 5MB 최대
- 파일명: `posts/${Date.now()}-${crypto.randomUUID()}.{ext}` 충돌 방지
- 반환: `{ url: publicUrl }` — 게시글 생성 시 `imageUrl`로 전달

**전자투표 도메인 풀 구현 (F-54~57)**
- 3개 API 라우트 모두 stub → 실동작으로 전환:
  - `GET/POST /api/villas/[villaId]/polls` — 목록 조회 + ADMIN 생성
  - `GET /api/villas/[villaId]/polls/[pollId]` — 상세 + myVotedOptionId + isHead + isAdmin
  - `POST /api/villas/[villaId]/polls/[pollId]/vote` — 투표 처리
- 1세대 1표 이중 검증: DB `@@unique([pollId, roomNumber])` + Prisma P2002 catch 패턴
- 투표 결과 즉시 반영: 서버 재요청 없이 `totalVotes`, per-option `voteCount/percent` 로컬 업데이트

**내 게시글 조회 API 신설 (F-47)**
- `GET /api/villas/[villaId]/posts/my` — `authorId: user.sub` 필터, 본인 글 목록 반환
- 입주민 프로필 섹션에 "내 게시글" 메뉴 링크 추가

### 2. API 변경

| 엔드포인트 | 메서드 | 인증 | 설명 |
|-----------|--------|------|------|
| `/api/upload` | POST | JWT | Supabase Storage 파일 업로드 (이미지, 최대 5MB) |
| `/api/villas/[villaId]/posts/my` | GET | JWT | 본인이 작성한 게시글 목록 |
| `/api/villas/[villaId]/polls` | GET | JWT | 투표 목록 (진행중/마감 분리, voteCount/optionCount 포함) |
| `/api/villas/[villaId]/polls` | POST | JWT(ADMIN) | 투표 생성 (선택지 중첩 생성) |
| `/api/villas/[villaId]/polls/[pollId]` | GET | JWT | 투표 상세 (myVotedOptionId, isHead, isAdmin, roomNumbers) |
| `/api/villas/[villaId]/polls/[pollId]/vote` | POST | JWT(HEAD) | 투표 참여 (1세대 1표 강제, P2002 → 409) |

### 3. 데이터 모델 변경

스키마 변경 없음 — `Poll`, `PollOption`, `Vote` 모델(`@@unique([pollId, roomNumber])`)은 기존 schema.prisma에 이미 정의되어 있었음. 이번 세션에서 API/UI 구현을 완성함.

### 4. 기술 부채 현황 (2026-04-10 업데이트)

| 항목 | 심각도 | 내용 |
|------|--------|------|
| `DATABASE_URL ?pgbouncer=true` 미적용 | **Critical** | Vercel 환경변수 수동 수정 필요 — 미적용 시 간헐적 운영 장애 |
| Supabase `posts` 버킷 수동 생성 필요 | **High** | Supabase Dashboard에서 Public 버킷으로 직접 생성해야 F-48 이미지 업로드 동작 |
| PortOne 환경변수 | High | 운영 전 PORTONE_IMP_KEY/SECRET 설정 필수 |
| API catch 블록 에러 로깅 | Medium | 대부분의 API 라우트에서 에러를 삼키고 500만 반환 — 원인 추적 불가 |
| migration 파일 부재 | Medium | `prisma db push` 사용으로 rollback 이력 없음 |
| 외부 청구 Rate Limit | Medium | 공개 엔드포인트에 요청 빈도 제한 없음 |
| invoice-reminder N+1 쿼리 | Medium | 대규모 빌라에서 성능 저하 가능 |
| 알림 API 페이지네이션 | Low | `take: 50` 하드코딩 |
| 초대 코드 Rate Limit | Low | 브루트포스 방어 없음 |

---

## 2026-04-11 아키텍처 변경 및 QA 반영

### 1. 아키텍처 변경점

**보안 패치 (QA 결과 반영)**
- `GET /api/villas/[villaId]/tickets`: ADMIN 역할이 URL villaId를 조작해 타 빌라 민원을 열람할 수 있던 취약점 수정 → JWT sub와 villa.adminId 비교로 소속 빌라 강제 검증
- `GET /api/dashboard`: `?role=ADMIN` 쿼리 파라미터로 권한 우회 가능하던 취약점 제거 → JWT role만 신뢰
- `POST /api/upload`: Content-Type 헤더 위조를 통한 비이미지 파일 업로드 차단 → 매직 바이트(첫 12바이트) MIME 검증 추가 (JPEG/PNG/GIF/WebP 지원)
- `POST /api/pay/[billId]/confirm`: 비인증 엔드포인트 DDoS 방어 → 인메모리 Map 기반 billId당 1분 5회 Rate Limit 추가

**비동기 패턴 개선**
- 티켓 상태 변경 시 알림 발송 실패가 HTTP 500으로 전파되던 문제 수정 → `.catch((e) => console.error(...))` 패턴으로 분리, 알림 실패가 메인 응답에 영향 없음

**신규 도메인: 차량 관리 (F-70/71)**
- `Vehicle` 모델 활용: plateNumber, modelName, isVisitor, expectedDeparture, registeredBy
- GET 시 ADMIN은 전체, 입주민은 본인 등록 차량만 조회
- `?plate=` 쿼리 파라미터로 부분 일치 검색 (`contains` + `mode: 'insensitive'`)
- 번호판 유효성: `/^[가-힣0-9]{4,10}$/` 서버 사이드 정규식 검증
- 중복 등록 시 Prisma P2002 → 409 Conflict

**신규 도메인: 공용 장부 (F-62/63/64)**
- `LedgerTransaction` 모델: type(`INCOME`/`EXPENSE`), amount(Decimal), description, transactionDate, receiptUrl, createdBy
- GET: year+month 쿼리 파라미터로 월별 필터, summary `{ totalIncome, totalExpense, balance }` 자동 집계
- POST: ADMIN 전용, 영수증 이미지는 기존 `/api/upload` 재사용 → `receiptUrl` 저장
- 입주민/관리자 모두 조회 가능, 등록은 ADMIN 전용

**투표 참여율 (F-58)**
- `GET /api/villas/[villaId]/polls` 응답에 `totalHouseholds` 추가 (HEAD + APPROVED 세대 수 병렬 집계)
- `Promise.all([polls query, count query])`로 N+1 없이 단일 요청
- 프론트엔드 PollCard에 참여율 프로그레스 바 (`h-1.5`, primary/neutral 색상 구분)

**성능 개선**
- `GET /api/cron/invoice-reminder`: N+1 쿼리 → 단일 OR 배치 쿼리로 최적화
- `GET /api/notifications`: `take: 50` 하드코딩 → cursor 기반 페이지네이션 (`limit` 최대 50, `nextCursor` 반환)

**Cron 스케줄 수정**
- `vercel.json`: invoice-reminder, expire-subscriptions 모두 `"0 15 * * *"` (UTC) = KST 자정으로 통일

### 2. API 변경

| 엔드포인트 | 메서드 | 인증 | 설명 |
|-----------|--------|------|------|
| `/api/villas/[villaId]/vehicles` | GET | JWT | 차량 목록 (ADMIN=전체, 입주민=본인) + `?plate=` 부분검색 |
| `/api/villas/[villaId]/vehicles` | POST | JWT | 차량 등록 (번호판 정규식 검증, P2002→409) |
| `/api/villas/[villaId]/vehicles/[vehicleId]` | DELETE | JWT | 차량 삭제 (본인 또는 ADMIN) |
| `/api/villas/[villaId]/ledger` | GET | JWT | 장부 조회 (월별 필터, summary 포함) |
| `/api/villas/[villaId]/ledger` | POST | JWT(ADMIN) | 장부 내역 등록 (영수증 URL 포함) |
| `/api/villas/[villaId]/polls` | GET | JWT | **변경**: `totalHouseholds` 필드 추가 |
| `/api/notifications` | GET | JWT | **변경**: cursor 페이지네이션 (`cursor`, `limit`, `nextCursor`) |
| `/api/pay/[billId]/confirm` | POST | - | **변경**: Rate Limit 추가 (1분 5회) |
| `/api/upload` | POST | JWT | **변경**: 매직 바이트 MIME 검증 추가 |

**501로 교체된 미구현 API** (기존 200 OK 반환하던 TODO stub):
- `POST /api/villas/[villaId]/polls/[pollId]/remind`
- `POST /api/subscription/activate-coupon`

### 3. 데이터 모델 변경

스키마 변경 없음 — `Vehicle`, `LedgerTransaction` 모델은 기존 schema.prisma에 이미 정의되어 있었음. 이번 세션에서 API/UI 구현을 완성함.

### 4. 기술 부채 현황 (2026-04-11 업데이트)

| 항목 | 심각도 | 상태 | 내용 |
|------|--------|------|------|
| `DATABASE_URL ?pgbouncer=true` 미적용 | **Critical** | 미해결 | Vercel 환경변수 수동 수정 필요 |
| Supabase `posts`/`receipts` 버킷 수동 생성 | **High** | 미해결 | Dashboard에서 Public 버킷 직접 생성 필요 |
| PortOne 환경변수 | High | 미해결 | 운영 전 PORTONE_IMP_KEY/SECRET 설정 필수 |
| Rate Limit 인메모리 Map | Medium | 부분해결 | 결제 확인만 적용, 인메모리라 서버 재시작 시 초기화 / 멀티 인스턴스 미지원 |
| migration 파일 부재 | Medium | 미해결 | `prisma db push` 사용으로 rollback 이력 없음 |
| API catch 블록 에러 로깅 | Medium | 부분해결 | 알림 관련만 `console.error` 추가, 대부분 API는 여전히 500만 반환 |
| 초대 코드 Rate Limit | Low | 미해결 | 브루트포스 방어 없음 |
| 투표 낙관적 업데이트 제거 | Low | **해결** | 서버 재조회로 교체 (정확도 향상) |
| 알림 API 페이지네이션 | Low | **해결** | cursor 기반 페이지네이션 구현 완료 |
| invoice-reminder N+1 쿼리 | Medium | **해결** | 단일 OR 쿼리로 최적화 완료 |
| Cron KST 스케줄 오류 | Medium | **해결** | `"0 15 * * *"` UTC로 통일 |

---

## 2026-04-11 (2차) 개발 진행사항

### 완료 기능: F-66/67/68/69, F-41/42, F-59/60, F-09, F-76, F-78/79

### 1. 아키텍처 변경

**백오피스 서브시스템 추가**
- `/api/backoffice/` 네임스페이스로 SUPER_ADMIN 전용 API 분리
- 일반 앱 세션(`token`/`user`)과 분리된 `bo_token`/`bo_user` 사용
- `lib/backoffice-auth.ts` 신규 유틸리티
- `BackofficeGuard` 클라이언트 사이드 인증 가드 (서버 사이드 없음 — 기술 부채)

**ImageViewer 공통 컴포넌트**
- `components/ui/ImageViewer.tsx` — `createPortal` 기반 풀스크린 뷰어
- 장부 영수증, 건물 이력 사진 공통 사용

**Cron 2개 추가**
```
poll-reminder:         마감 24h 전 미참여 세대주 자동 독촉 (매일 KST 00:00)
subscription-reminder: 구독 만료 D-7/D-3/D-1 관리자 알림 (매일 KST 00:00)
```

**회원 탈퇴 소프트 삭제 패턴**
- 물리 삭제 없이 개인정보 익명화
- `email: deleted_{id}@villamate.invalid` — 탈퇴 판별 식별자

### 2. 신규 API

| 엔드포인트 | 메서드 | 인증 | 설명 |
|-----------|--------|------|------|
| `/api/villas/[villaId]/building-events` | GET | JWT | 건물 이력 목록 (카테고리 필터) |
| `/api/villas/[villaId]/building-events` | POST | JWT(ADMIN) | 건물 이력 등록 |
| `/api/villas/[villaId]/polls/[pollId]` | PATCH | JWT(ADMIN) | 투표 수정 (선택지 제외) |
| `/api/villas/[villaId]/polls/[pollId]/remind` | POST | JWT(ADMIN) | 미참여 세대주 수동 독촉 |
| `/api/auth/me` | DELETE | JWT | 회원 탈퇴 (익명화) |
| `/api/cron/poll-reminder` | GET | CRON_SECRET | 자동 투표 독촉 Cron |
| `/api/cron/subscription-reminder` | GET | CRON_SECRET | 구독 만료 자동 알림 Cron |
| `/api/backoffice/auth/login` | POST | - | 백오피스 로그인 |
| `/api/backoffice/villas` | GET | bo_token | 전체 빌라 목록 |
| `/api/backoffice/villas/[id]` | PATCH | bo_token | 구독 상태·만료일 변경 |
| `/api/backoffice/users` | GET | bo_token | 전체 사용자 목록 |

**변경된 API**:
- `POST /api/villas/[villaId]/posts`: `isNotice: true` 시 전체 입주민 SYSTEM 알림 fire-and-forget 추가

### 3. 데이터 모델 변경

스키마 변경 없음. 기존 `BuildingEvent` 모델 활성화 (`BuildingEventCategory` enum 포함).

### 4. 기술 부채 현황 (2026-04-11 2차 업데이트)

| 항목 | 심각도 | 상태 | 내용 |
|------|--------|------|------|
| 백오피스 서버 사이드 인증 없음 | **High** | 미해결 | 클라이언트 가드만 — JS 비활성화 시 우회 가능 |
| `DATABASE_URL ?pgbouncer=true` 미적용 | **Critical** | 미해결 | Vercel 환경변수 수동 수정 필요 |
| Supabase `posts` 버킷 Public 설정 | **High** | 미해결 | 건물 이력 사진도 동일 버킷 사용 |
| 건물 이력 전용 Storage 버킷 없음 | Medium | 미해결 | `posts` 버킷 공유 중 — 전용 버킷 분리 권장 |
| Rate Limit 인메모리 Map | Medium | 부분해결 | 결제 확인만 적용, 멀티 인스턴스 미지원 |
| 공지 알림 발송 실패 추적 없음 | Low | 미해결 | fire-and-forget — 발송 실패 추적 불가 |
| Cron 중복 실행 방지 없음 | Low | 미해결 | Vercel Cron 보장에 의존 |

## 2026-04-12 업데이트

### 플랫폼 운영 도구 완성
백오피스(SUPER_ADMIN)가 입주민 앱의 콘텐츠를 직접 관리할 수 있는 시스템이 갖춰졌다.

**콘텐츠 관리 3종**
- 시스템 공지사항: 전 빌라 공통 공지 (게시/비공개)
- FAQ: 자주 묻는 질문 (순서 조정 가능)
- 가이드 라이브러리: 앱 사용 가이드 (Tiptap 리치 텍스트, 카테고리별 분류)

**입주민 앱 접근 경로**
프로필 → 앱 이용 가이드 → 가이드 열람
프로필 → 고객센터 · FAQ → FAQ 아코디언 / 시스템 공지 탭

**KPI 대시보드**
플랫폼 운영자가 구독 상태 분포와 월별 신규 가입 추이를 시각적으로 모니터링할 수 있다.

### 품질 기준 달성
- NF-05 XSS 방어: CSP 헤더 전역 적용 + Tiptap HTML DOMPurify 이중 방어
- NF-10 응답 속도: 핵심 9개 쿼리 복합 인덱스 + KPI DB 집계
- NF-14 테스트: Jest 32개 케이스 (auth/posts/polls/tickets/ledger)

### 기술 부채 현황 (신규)
1. KPI `$queryRaw DATE_TRUNC` — PostgreSQL 전용, DB 교체 시 수정 필요
2. CSP `unsafe-inline` — nonce 기반으로 전환 권장 (Next.js 15 nonce 지원)
3. 공개 API Rate Limit 미구현 — Upstash Redis 도입 시 추가 예정
4. Vercel Cron 5개 동시 실행 — Pro 플랜 이상 확인 필요

---

## 21. 구현 현황 (2026-04-13 기준)

### 이 세션에서 완료된 기능

#### F-43 Web Push 알림 (브라우저)

VAPID 기반 Web Push 알림 인프라 구축. 앱 알림함에 더해 브라우저 네이티브 알림 채널을 추가함으로써, 앱이 백그라운드 상태일 때도 입주민에게 알림을 전달할 수 있게 되었다.

| 구분 | 내용 |
|------|------|
| DB | `PushSubscription` 모델 추가 (userId, endpoint, p256dh, auth, villaId) |
| 환경변수 | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
| 서버 | `lib/webpush.ts` — lazy init 패턴 (`getWebPush()`)으로 빌드 타임 env 오류 방지 |
| API | `POST/DELETE /api/push/subscribe` — 구독 upsert/삭제 |
| 통합 | `lib/notify.ts`의 `createNotification` 등에서 `sendPushToUser()` 비동기 병행 발송 |
| Service Worker | `public/sw.js` — `push` 이벤트 수신, `notificationclick` 핸들링 |
| UI | 입주민 프로필 → 알림 설정 — 푸시 구독 온오프 배너 (`PushBanner`) |

**핵심 기술 결정**: `web-push` 모듈을 모듈 최상위에서 초기화하면 Vercel 빌드 시 환경변수 부재로 오류 발생. `getWebPush()` 함수 내부에서 런타임에만 초기화하는 lazy init 패턴으로 해결.

#### F-77 Toss Payments 빌링키 자동결제

구독 모델의 핵심 수익 자동화. 관리자가 카드를 한 번 등록하면 구독 만료 시 자동으로 갱신된다.

| 구분 | 내용 |
|------|------|
| DB | `TossBillingKey` 모델 추가 (villaId unique, billingKey, customerKey, cardCompany, cardNumber) |
| 환경변수 | `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY` |
| 서버 | `lib/toss.ts` — `issueBillingKey()`, `chargeBilling()` |
| API | `GET/POST/DELETE /api/villas/[villaId]/subscription/billing-key` |
| Cron | `POST /api/cron/auto-payment` — 만료 빌라 자동결제 (UTC 00:00, `vercel.json` 등록) |
| UI | 관리자 프로필 → 구독 → 카드 등록/해제 페이지 (Toss Payments SDK 연동) |

**환경변수 주의**: `NEXT_PUBLIC_TOSS_CLIENT_KEY`는 빌드 시점에 번들 포함되므로 설정 후 반드시 재배포 필요.

#### F-04 카카오·구글 소셜 로그인

OAuth 2.0 Authorization Code Flow 구현. 소셜 계정으로도 빌라메이트에 가입/로그인할 수 있다.

| 구분 | 내용 |
|------|------|
| DB | `SocialAccount` 모델 추가 (userId, provider, providerId — provider+providerId unique), `User.password → String?` (nullable) |
| 환경변수 | `KAKAO_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET` |
| 보안 | state 파라미터 CSRF 방어 — HttpOnly 쿠키 저장 후 콜백 시 검증 |
| API | `GET /api/auth/oauth/[provider]` — state 쿠키 설정 + OAuth redirect |
| API | `GET /api/auth/callback/[provider]` — state 검증, 유저 upsert, JWT 발급 |
| API | `GET /api/auth/me` — 현재 유저 정보 조회 (소셜 로그인 후 localStorage 동기화) |
| 중간 페이지 | `/auth/social` — token 쿼리로 받아 localStorage 저장 후 이동 |
| 로그인 UI | `/login` — 카카오(노랑) / 구글(흰색 테두리) 소셜 버튼 추가 |

**기존 이메일 로그인 영향**: `User.password`를 nullable로 변경함에 따라 소셜 전용 계정은 이메일 로그인 불가 처리 (동일한 `401` 반환으로 계정 존재 여부 은닉).

#### F-05 소셜 로그인 후 프로필 보완

소셜 신규 사용자는 이름/전화번호/역할을 보완해야 앱을 이용할 수 있다.

| 구분 | 내용 |
|------|------|
| JWT | `needsSetup?: boolean` 필드 추가 — 소셜 신규 유저 플래그 |
| API | `PATCH /api/auth/social-complete` — 이름/전화번호/역할 저장, 역할별 villaId 조회 후 JWT 재발급 |
| 페이지 | `/profile-setup` — 이름/전화번호/역할 선택 폼 (token 쿼리로 인증) |

#### BottomNav 겹침 버그 수정 + z-index 계층 시스템

Toast 알림이 BottomNav에 가려지는 문제 등 레이어 충돌 버그를 전면 수정하고 z-index 계층 규칙을 수립했다.

| 레이어 | z-index | 적용 요소 |
|--------|---------|-----------|
| BottomNav | `z-50` | 하단 네비게이션 바 |
| Toast | `z-60` | 토스트 알림 (`bottom-20` 이상 배치) |
| Sheet Overlay | `z-70` | 바텀시트 배경 딤 |
| Sheet Panel | `z-80` | 바텀시트 콘텐츠 |
| ImageViewer | `z-[999]` | 전체화면 이미지 뷰어 |

### 신규 Prisma 모델 (2026-04-13)

| 모델 | 목적 |
|------|------|
| `PushSubscription` | Web Push 구독 엔드포인트 저장 |
| `TossBillingKey` | Toss Payments 자동결제 빌링키 (villaId unique) |
| `SocialAccount` | 소셜 계정 연결 (kakao/google, provider+providerId unique) |

### 환경변수 추가 내역

| 변수 | 용도 | 설정 여부 |
|------|------|-----------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Web Push 공개 키 | ✅ |
| `VAPID_PRIVATE_KEY` | Web Push 비공개 키 | ✅ |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | Toss Payments 클라이언트 키 (테스트) | ✅ |
| `TOSS_SECRET_KEY` | Toss Payments 서버 비밀 키 | ✅ |
| `KAKAO_CLIENT_ID` | 카카오 OAuth 앱 ID | ⬜ 미설정 |
| `KAKAO_CLIENT_SECRET` | 카카오 OAuth 시크릿 | ⬜ 미설정 |
| `GOOGLE_CLIENT_ID` | 구글 OAuth 클라이언트 ID | ⬜ 미설정 |
| `GOOGLE_CLIENT_SECRET` | 구글 OAuth 클라이언트 시크릿 | ⬜ 미설정 |

### 기술 부채 현황 (2026-04-13 추가)
1. 소셜 로그인 환경변수 미설정 — `KAKAO_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET` Vercel 등록 필요
2. Toss 자동결제 Rate Limit 없는 공개 Cron — CRON_SECRET 검증 추가 권장
3. 소셜 계정 연결 해제 UI 미구현 — 현재 DB 직접 삭제만 가능
4. Web Push iOS Safari 지원 — Safari 16.4+ 이상에서만 지원, 하위 버전 graceful degradation 처리됨

---

## 15. MVP 구현 현황 (2026-04-14 기준) — Sprint 4 완료

### 이 세션에서 구현된 기능 (8개)

#### F-49 댓글 푸시 알림
댓글 등록 시 원글 작성자에게 DB 알림 + Web Push 발송. 자기 자신 댓글은 제외. 푸시 실패가 댓글 저장에 영향 없도록 fire-and-forget 패턴 적용.

#### F-50 게시글 좋아요
`PostLike` 모델 신규 추가 (`@@unique([postId, userId])`). 좋아요 토글 API — 이미 좋아요한 경우 취소, 아닌 경우 추가. 관리자·입주민 커뮤니티 상세 페이지에 하트 버튼 추가.

#### F-65 에너지 사용량 시각화
`EnergyUsage` 모델 신규 추가 (`@@unique([villaId, year, month])`). 전기/수도/가스 월별 데이터 upsert. 관리자 — 연도별 탭, CSS 바차트, 월 선택 입력 폼. 입주민 — 최신 월 요약 카드, 에너지원별 탭, 연간 합계.

#### F-72 QR 방문 차량 등록
JWT 위임 패턴: 관리자가 QR 토큰 발급(24h 만료) → QR 코드 생성 → 방문자가 스캔 → 비로그인으로 `/qr-vehicle` 페이지 접속 → 차량 등록. `Vehicle.visitorName` 필드 추가. `qrcode` npm 패키지 도입.

#### F-84 백오피스 청구 현황
빌라별 청구서·납부율 집계. 월 필터, 납부율 프로그레스 바(녹색 ≥80% / 노란 ≥50% / 빨간 <50%), 수납 집계 카드.

#### F-85 백오피스 MRR 모니터링
MRR = ACTIVE 빌라 × 29,900원, ARR = MRR × 12. 12개월 추이 바차트 (`$queryRaw` + PostgreSQL TO_CHAR). 만료 임박 빌라 목록 (D-N 뱃지).

#### F-14 멀티 빌라 관리
동대표가 2개 이상 빌라 보유 시 `/profile/my-villas`에서 전환. `POST /api/auth/switch-villa` — JWT의 villaId 교체 후 새 토큰 발급. 홈 화면 "빌라 전환" 칩 버튼 (빌라 2개 이상일 때만 표시).

#### F-15 동대표 교체
세대주(HEAD) 목록에서 신규 동대표 선택 → `prisma.$transaction`으로 원자적 역할 이양 → 기존 동대표 자동 로그아웃.

### 신규 Prisma 모델 (2026-04-14)

| 모델 | 목적 |
|------|------|
| `PostLike` | 게시글 좋아요 (userId + postId 복합 유니크) |
| `EnergyUsage` | 월별 에너지 사용량 (villaId + year + month 복합 유니크) |

### 변경된 모델

| 모델 | 변경 |
|------|------|
| `Vehicle` | `visitorName String?` 필드 추가 |

### 기술 스택 변경

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| QR 생성 | 외부 URL API | `qrcode` npm 클라이언트 사이드 |

### 기술 부채 현황 (누적)
1. 동대표 교체 후 기존 JWT 즉시 무효화 없음 (블랙리스트 미구현)
2. 에너지 입력 서버 유효성 검증 부재 (클라이언트 min=0만)
3. QR 토큰 URL 공유 시 24h 내 타인 사용 가능 (단발성 토큰 아님)
4. Toss 빌링키 평문 DB 저장
5. 소셜 계정 연결 해제 UI 미구현

### 현재 Phase 완료 현황 (2026-04-14)

| Phase | 상태 | 비고 |
|-------|------|------|
| Phase 1 — 핵심 루프 | ✅ 전체 완료 | |
| Phase 2 — 인게이지먼트 루프 | ✅ 전체 완료 | |
| Phase 3 — 성장 인프라 (구현 가능 항목) | ✅ 완료 | F-32/37/61, NF-11/12는 외부 의존성으로 보류 |

---

## 보안 QA 및 디자인 QA 완료 (2026-04-15 기준)

### 보안 QA — 주요 수정 사항

#### JWT URL 노출 → HttpOnly 쿠키 교환 패턴
소셜 로그인 콜백에서 JWT를 URL(`?token=...`)에 포함하던 방식을 제거.
- 콜백 핸들러가 `pending_auth_token` HttpOnly 쿠키(60초 만료)를 설정
- 클라이언트가 `/api/auth/exchange-token`을 호출해 JWT를 수령
- URL 히스토리·서버 로그에 토큰이 남지 않음

#### 백오피스 페이지 경로 보호
기존에는 API 라우트만 보호되던 미들웨어를 확장해 `/backoffice/*` 페이지 경로도 `bo_session` HttpOnly 쿠키로 서버 사이드 보호.
- `/api/backoffice/auth/logout` — `bo_session` 쿠키 삭제 전담 엔드포인트 신규 추가
- `middleware.ts` matcher: `/api/:path*` + `/backoffice/:path*` 통합

#### 빌링키 암호화 저장 (AES-256-GCM)
Toss Payments 빌링키를 DB에 평문 저장하던 보안 취약점 수정.
- `lib/crypto.ts` 신규 — AES-256-GCM, 12바이트 IV + 16바이트 AuthTag
- 저장 형식: `iv(24 hex) + authTag(32 hex) + ciphertext(hex)`
- `BILLING_ENCRYPTION_KEY` 환경변수(64자 hex) 필요
- 빌링키 저장 시 `encryptBillingKey()`, 결제 시 `decryptBillingKey()` 호출

#### 구독 가격 단일 소스 (`lib/pricing.ts`)
`SUBSCRIPTION_MONTHLY_PRICE = 19_900`과 `SUBSCRIPTION_ORDER_NAME`을 하나의 파일로 중앙화.
기존에 auto-payment Cron(19,900)과 MRR 대시보드(29,900 하드코딩) 사이에 금액 불일치가 있던 문제 해결.

#### QR 검증 전용 엔드포인트 분리
`GET /api/villas/[villaId]/vehicles/qr-verify` 신규 추가 — JWT 토큰 검증만 수행하고 DB 기록 없음.
`/qr-vehicle` 공개 페이지와 `/visitor` 등록 엔드포인트를 미들웨어 예외(PUBLIC_PATH_PATTERNS)에 추가.

#### 파일 업로드 MIME 검증 강화
클라이언트 제공 Content-Type 대신 파일 매직 바이트 기반으로 확장자 결정.

#### 티켓(민원) 입력 제한 추가
- 제목 100자, 내용 2000자 서버 사이드 길이 제한
- APPROVED 입주민만 티켓 제출 가능 (빌라 소속 검증 추가)

#### PostLike 레이스 컨디션 처리
`POST /like`에 Prisma P2002 유니크 충돌 catch → 이미 좋아요 처리로 멱등 응답.

#### Vercel Cron KST 스케줄 수정
`auto-payment` cron이 UTC 00:00으로 설정되어 있던 것을 `0 15 * * *`(KST 00:00)으로 수정.

---

### 신규 파일 (2026-04-15)

| 파일 | 설명 |
|------|------|
| `lib/pricing.ts` | 구독 가격 단일 소스 (`SUBSCRIPTION_MONTHLY_PRICE`, `SUBSCRIPTION_ORDER_NAME`) |
| `lib/crypto.ts` | AES-256-GCM 빌링키 암호화/복호화 (`encryptBillingKey`, `decryptBillingKey`) |
| `app/api/auth/exchange-token/route.ts` | pending_auth_token HttpOnly 쿠키 → JWT 교환 (1회성) |
| `app/api/villas/[villaId]/vehicles/qr-verify/route.ts` | QR 토큰 검증 전용 (DB 기록 없음) |
| `app/api/backoffice/auth/logout/route.ts` | bo_session 쿠키 삭제 |
| `components/ui/ConfirmDialog.tsx` | 커스텀 확인 다이얼로그 (destructive 변형 포함) |
| `hooks/useConfirm.tsx` | Promise 기반 confirm 훅 (`window.confirm` 대체) |

---

### 디자인 QA — 주요 수정 사항

#### 디자인 토큰 17개 신규 추가 (`globals.css`)
`neutral-600`, `neutral-800`, `success-50/100/600/700`, `warning-50/100/600/700`, `error-50/100/600/700`, `primary-200/300/400` 등 참조하는 파일은 많지만 정의가 없던 토큰 일괄 추가.

#### `window.confirm()` / `window.alert()` 제거
브라우저 기본 확인창 36개 인스턴스 → `useConfirm` 훅 + `ConfirmDialog` 컴포넌트로 교체.

#### 접근성 개선
- `Chip.tsx`: `<span onClick>` → `<button type="button" onClick>`
- `NotificationList.tsx`: `<li onClick>` → `<li><button>`로 키보드 접근 가능하게 변경
- 터치 타깃: `min-h-[40px]` → `min-h-[44px]` (WCAG 2.1 AA 기준 준수)
- SVG 장식 요소에 `aria-hidden="true"` 추가

#### 하드코딩 색상 → 시맨틱 토큰 교체
- `Badge.tsx`: 고정 색상 → `primary/success/warning/error` 시맨틱 토큰
- `WidgetCard.tsx`: `blue-600/red-500/orange-500/green-500` → 토큰 기반
- `Button.tsx`: `hover:bg-red-600` → `hover:bg-error-600`
- `app/(admin)/profile/vehicles/page.tsx`: `hover:red-500` → `hover:error-500`

#### 텍스트 계층 정리
여러 페이지 헤더 `text-2xl` → `text-xl`로 축소. 모바일 뷰포트 기준 타이포그래피 위계 일관성 확보.

#### 내비게이션 href 버그 수정
- 관리자 홈: 온보딩 CTA 링크 수정
- 입주민 홈: 라우팅 404 원인 href 수정

#### Suspense 폴백 추가
`useSearchParams()` 사용 페이지(login, profile-setup)에 `<Suspense>` 래퍼 추가 — Next.js 15 빌드 오류 방지.

### 기술 부채 현황 (2026-04-15 업데이트)

| # | 항목 | 위험도 | 상태 |
|---|------|--------|------|
| 1 | 동대표 교체 후 기존 JWT 즉시 무효화 없음 | Medium | 잔존 |
| 2 | 에너지 입력 서버 유효성 검증 부재 | Low | 잔존 |
| 3 | QR 토큰 URL 단발성 미처리 | Low | 잔존 |
| 4 | `BILLING_ENCRYPTION_KEY` Vercel 환경변수 미설정 | **Critical** | **미완료 — 수동 등록 필요** |
| 5 | 기존 평문 빌링키 DB 마이그레이션 미완료 | High | 수동 마이그레이션 필요 |
| 6 | 소셜 계정 연결 해제 UI 미구현 | Low | 잔존 |

---

## 2026-04-16 업데이트 — Sprint 6 UX 개선 및 버그 수정

### 실제 기술 스택 최신 현황 (2026-04-16 기준)

> 이전 세션의 React Native 기반 기록은 초기 MVP 단계입니다. 2026-04-03 이후 **Next.js App Router 기반 웹앱으로 전면 전환**했습니다.

| 구분 | 현재 실제 구현 |
|------|--------------|
| **Frontend** | Next.js 15 (App Router) + TypeScript |
| **UI 프레임워크** | Tailwind CSS v4 (`@import "tailwindcss"`, `@theme` 블록) |
| **Backend** | Next.js Route Handlers (App Router 내장) |
| **ORM** | Prisma (Supabase PostgreSQL) |
| **인증** | JWT (HttpOnly 쿠키 교환 패턴) + bcrypt |
| **소셜 로그인** | 카카오 / 구글 OAuth 2.0 |
| **결제** | PortOne (PG 인앱) + Toss Payments (빌링키 자동결제) |
| **파일 스토리지** | Supabase Storage (posts 버킷) |
| **푸시 알림** | Web Push API (VAPID) |
| **배포** | Vercel (monorepo: `apps/web/`) |
| **스케줄러** | Vercel Cron Jobs (`vercel.json`) |
| **보안** | AES-256-GCM 빌링키 암호화, CSP 헤더, DOMPurify XSS 방어 |

### 신규 UI 패턴 추가 (2026-04-16)

#### AmountInput 컴포넌트
금액 입력이 필요한 모든 화면에서 `<AmountInput>` 사용:
- − / + 버튼으로 단위 조정
- 단위는 localStorage `amountStep` 키로 개인화 (기본 10,000원)
- 관리자·입주민 프로필에서 단위 변경 가능 (프리셋 5종: 1천/5천/1만/5만/10만)

#### 하단 시트 레이아웃 표준 확립
모바일 영역(max-w-lg) 내 제한 패턴: `fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg`

#### z-index 계층 확정
| 레이어 | z-index |
|--------|---------|
| BottomNav | z-50 |
| 오버레이 backdrop | z-70 |
| 하단 시트 (BottomSheet) | z-80 |
| 토스트 / 알림 | z-90 |

### 버그 수정 요약

| 버그 | 원인 | 수정 |
|------|------|------|
| 커뮤니티 글쓰기 "Unauthorized" | POST /posts Authorization 헤더 누락 | 4개 파일 8개 API 호출에 헤더 추가 |
| 세대 호수 저장 무반응 | PATCH Authorization 헤더 누락 + 토스트 z-index 낮음 | 헤더 추가, 토스트 z-90 상향 |
| 하단 시트 PC 전체 폭 | `left-0 right-0` 패턴 사용 | `left-1/2 -translate-x-1/2 max-w-lg` 수정 |
| /ledger 빈 화면 | 스텁 페이지 방치 | 완전 구현 페이지로 대체 |

### 기술 부채 현황 (2026-04-16 업데이트)

| # | 항목 | 위험도 | 상태 |
|---|------|--------|------|
| 1 | `BILLING_ENCRYPTION_KEY` Vercel 환경변수 미설정 | **Critical** | **미완료 — 수동 등록 필요** |
| 2 | 기존 평문 빌링키 DB 마이그레이션 미완료 | High | 수동 마이그레이션 필요 |
| 3 | `/ledger` ↔ `/manage/ledger` 코드 중복 | Low | 리다이렉트 또는 공통 컴포넌트 추출 필요 |
| 4 | 동대표 교체 후 기존 JWT 즉시 무효화 없음 | Medium | 잔존 |
| 5 | 소셜 계정 연결 해제 UI 미구현 | Low | 잔존 |

---

## 2026-04-18 변경 내역 (Sprint 7)

### 1. 아키텍처 변경점

**PortOne 모바일 결제 리다이렉트 패턴 확립**

KG Inicis는 모바일에서 팝업 대신 리다이렉트 방식으로 동작. `m_redirect_url` 필드를 `IMP.request_pay()` 파라미터에 추가하고, 페이지 마운트 시 URL 파라미터(`imp_uid`, `imp_success`)를 감지해 자동 결제 검증을 수행하는 패턴 확립.

**CSP 헤더 PortOne 도메인 확장**

`next.config.ts`의 Content-Security-Policy에 PortOne 관련 도메인 추가:
- `script-src`, `style-src`, `img-src`, `connect-src`: `https://*.iamport.kr`, `https://*.inicis.com`
- `frame-src`: `https://*.iamport.kr`, `https://*.inicis.com`, `https://*.kcp.co.kr`, `https://*.nicepay.co.kr`

### 2. API 변경

없음 (API 라우트 신규 추가/변경 없음)

### 3. 데이터 모델 변경

없음 (Prisma 스키마 변경 없음)

### 4. 기술 부채

**신규 발견 및 수정**

- **API 인증 헤더 전수 누락 (Critical → 수정 완료)**: 클라이언트 페이지 13개에서 GET/POST/DELETE 요청에 Authorization 헤더 미포함. 미들웨어가 모든 `/api/` 경로를 보호하므로 GET도 반드시 헤더 필요. 전수 수정 완료.

**신규 부채 추가**

| 항목 | 위험도 | 설명 |
|------|--------|------|
| `lib/client-api.ts` 헬퍼 미활용 | Medium | `apiFetch/apiGet/apiPost` 등 토큰 자동 주입 헬퍼가 존재하나 대부분 페이지가 raw fetch 사용. 이번처럼 누락 발생 원인. 점진적 헬퍼 전환 권장 |
| Supabase `posts` 버킷 미생성 | High | 이미지 업로드 기능이 구현되어 있으나 Supabase Storage에 버킷이 없으면 동작 불가. 운영자가 수동으로 Public 버킷 생성 필요 |
| PortOne 운영 MID 미전환 | High | 현재 테스트 MID(`INIpayTest`) 사용 중. 실제 운영 전 PortOne 채널 MID로 교체 필요 |

### 버그 수정 요약

| 버그 | 원인 | 수정 파일 수 |
|------|------|------------|
| 커뮤니티 목록 로딩 실패 | GET /posts Authorization 헤더 누락 | 2 |
| 커뮤니티 게시글 상세 실패 | GET /posts/:id Authorization 헤더 누락 | 2 |
| 투표 목록/상세 로딩 실패 | GET /polls Authorization 헤더 누락 | 3 |
| 민원 목록 로딩 실패 | GET /tickets Authorization 헤더 누락 | 1 |
| 차량 목록/등록/삭제 실패 | GET/POST/DELETE /vehicles 인증 누락 | 2 |
| 에너지 데이터 로딩 실패 | GET /energy Authorization 헤더 누락 | 1 |
| 내 게시글 목록 실패 | GET /posts/my Authorization 헤더 누락 | 1 |
| 입주자 정보/전출 실패 | GET/DELETE /residents 인증 누락 | 1 |
| PortOne SDK 로드 실패 | CSP script-src 미허용 | next.config.ts |
| 결제 버튼 무한 로딩 | 모바일 m_redirect_url 누락 + useSearchParams Suspense 이슈 | pay/page.tsx |
| "등록된 PG 설정 없음" | PG 코드에 MID 미명시 | pay/page.tsx |
| 하단 시트 BottomNav 겹침 | z-index z-50 미만 | 4개 파일 |


---

## 2026-04-19 변경 내역 (Sprint 8)

### 1. 아키텍처 변경점

**로그인 API Full Villa Object 반환**

`POST /api/auth/login` 응답에 `villa`, `residentVilla` 전체 오브젝트 포함. 기존에는 `villaId`만 반환하여 재로그인 시 villa 정보 유실 버그 존재. 변경 후 재로그인해도 villa 정보 유지.

**듀얼 모드 — 같은 빌라 관리자+입주민 지원**

기존 듀얼 모드는 "관리 빌라 ≠ 거주 빌라" 케이스만 지원. 이제 관리자가 자신의 빌라에도 입주민으로 등록 가능. join API에서 `adminId === userId`이면 즉시 APPROVED.

**CSP 확장 — Daum/Kakao 우편번호**

`next.config.ts`에 Daum Postcode 관련 도메인 추가:
- `script-src`: `https://t1.daumcdn.net`
- `frame-src`: `https://*.daum.net`, `https://*.daumcdn.net`, `https://*.kakao.com`

Daum Postcode 서비스가 카카오로 이전되어 실제 팝업 iframe이 `postcode.map.kakao.com`에서 열림.

**장부 자동 기록 패턴**

Prisma 스키마 변경 없이 `LedgerTransaction.createdBy = 'system'`으로 자동 기록 식별. 세 가지 트리거: 관리비 납부 완료(PATCH/verify), 외부 청구 수납 완료(confirm).

### 2. API 변경

| 엔드포인트 | 변경 내용 |
|-----------|----------|
| `POST /api/auth/login` | `villa`, `residentVilla` 전체 오브젝트 반환. ADMIN의 동일 빌라 ResidentRecord 감지 → `residentVilla` 자동 설정 |
| `POST /api/villas/join` | `isOwnVilla` 시 즉시 APPROVED 처리. `autoApproved`, `roomNumber`, full `villa` 오브젝트 반환 |
| `POST /api/villas/[villaId]/residents/join` | `isOwnVilla` 시 즉시 APPROVED 처리. 자동 승인 시 villa 정보 응답에 포함 |
| `GET /api/villas/[villaId]/ledger` | `isAuto: createdBy === 'system'` 파생 필드 추가 |
| `PATCH .../payments/[paymentId]` | PAID 전환 시 LedgerTransaction 자동 생성 (중복 방지 `wasPaid` 체크 포함) |
| `POST .../payments/[paymentId]/verify` | PortOne 검증 통과 시 LedgerTransaction 자동 생성 |
| `PATCH .../external-billing/[billId]/confirm` | COMPLETED 처리 시 LedgerTransaction 자동 생성 |
| `PATCH /api/villas/[villaId]/posts/[postId]` | 신규 추가. 게시글 수정 (작성자 전용). `title/content/category/isNotice/imageUrl` 수정 가능 |
| `GET /api/villas/[villaId]/posts/[postId]` | `updatedAt` 필드 응답에 추가 |

### 3. 데이터 모델 변경

없음 (Prisma 스키마 변경 없음)

- `LedgerTransaction.isAuto`: DB 컬럼 없음. `createdBy === 'system'` 계산 필드로 API 응답에서 파생.
- `ResidentRecord.status = 'APPROVED'`: 기존 enum 값 활용, 관리자 자신의 빌라 가입 시 자동 설정.

### 4. 기술 부채

**신규 추가**

| 항목 | 위험도 | 설명 |
|------|--------|------|
| 로그인 API 추가 DB 쿼리 | Low | ADMIN 로그인 시 villa 쿼리 + ResidentRecord 쿼리 추가. 현재 p99 < 500ms이나 트래픽 증가 시 캐싱 고려 |
| Daum Postcode 동적 로딩 지연 | Low | 첫 클릭 시 외부 스크립트 로딩. 느린 네트워크에서 지연 가능 |

**잔존 부채 (변동 없음)**

| 항목 | 위험도 | 비고 |
|------|--------|------|
| `BILLING_ENCRYPTION_KEY` Vercel 미등록 | Critical | 잔존 |
| 기존 평문 빌링키 DB 마이그레이션 | High | 잔존 |
| `lib/client-api.ts` 헬퍼 미활용 | Medium | raw fetch 직접 사용 패턴 잔존 |
| 동대표 교체 후 기존 JWT 유효 | Medium | 잔존 |
| PortOne 운영 MID 미전환 | High | 잔존 |

### 버그 수정 요약

| 버그 | 원인 | 수정 |
|------|------|------|
| 입주민 관리 목록 로딩 실패 | Authorization 헤더 누락 | `manage/residents/page.tsx` |
| 주소 검색 버튼 비활성화 | `lazyOnload` 전략 + `postcodeReady` 의존성 | 동적 스크립트 로딩으로 교체 |
| 주소 검색 팝업 미동작 (CSP) | `script-src` t1.daumcdn.net 미허용 | `next.config.ts` 추가 |
| 주소 검색 팝업 차단 (CSP) | `frame-src` kakao.com 미허용 | `next.config.ts` 추가 |

---

## 2026-04-20 변경 내역 (Sprint 9 — QA + 예시 데이터)

### 1. 아키텍처 변경점

**PortOne 공통 모듈 분리**
`lib/portone.ts` 신규 추가. 결제 검증에 사용되는 `getPortOneToken` / `getPortOnePayment` 를 두 개의 별개 라우트에서 공유. 이후 PortOne API 변경 시 단일 파일만 수정.

**`$transaction` 원자성 일관 적용**
납부 상태 갱신(PATCH /payments) + 장부 자동 기록이 서로 다른 쿼리로 실행되던 것을 `prisma.$transaction`으로 묶어 부분 실패 방지. 적용 대상: 관리자 수동 납부 확인, PortOne 결제 검증 후 자동 기록.

**`requireActiveSubscription` 적용 범위 확장**
구독 만료(EXPIRED) 시 청구서 발행, 외부청구 생성, 투표 생성, 건물이력 등록 모두 403 반환. 기존에는 에너지 사용량 등록만 적용.

**예시 데이터 시드 추가**
`prisma/seed.ts` 신규. `npx prisma db seed` 실행 시 "햇살 빌라" 데모 계정과 전 기능 예시 컨텐츠 자동 삽입. 신규 관리자가 빈 화면 없이 기능을 직관적으로 파악 가능.

### 2. API 변경

| 엔드포인트 | 변경 내용 |
|-----------|----------|
| `GET /api/dashboard` | `?villaId=` 쿼리 파라미터 제거. JWT의 `user.villaId`만 신뢰 |
| `GET /api/villas/[villaId]/vehicles` | N+1 쿼리 제거 → ownerIds 배치 조회 + Map 룩업으로 교체. 응답 형식 동일 |
| `GET|POST /api/villas/[villaId]/polls` | 미승인(PENDING) 입주자 접근 차단 (`status: 'APPROVED'` 필터) |
| `GET /api/villas/[villaId]/posts` | 미승인(PENDING) 입주자 접근 차단 |
| `GET /api/villas/[villaId]/posts/[postId]` | 미승인(PENDING) 입주자 접근 차단 |
| `POST /api/villas/[villaId]/posts/[postId]/like` | 미승인(PENDING) 입주자 접근 차단 |
| `POST /api/villas/[villaId]/invoices` | 구독 EXPIRED 시 403 반환 추가 |
| `POST /api/villas/[villaId]/external-billing` | 구독 EXPIRED 시 403 반환 추가 |
| `POST /api/villas/[villaId]/polls` | 구독 EXPIRED 시 403 반환 추가 |
| `POST /api/villas/[villaId]/building-events` | 구독 EXPIRED 시 403 반환 추가 |
| `PATCH .../payments/[paymentId]` | 상태 갱신 + 장부 기록 `$transaction` 원자화 |
| `POST .../payments/[paymentId]/verify` | PortOne 검증 + 상태 갱신 + 장부 기록 `$transaction` 원자화 |

### 3. 데이터 모델 변경

없음 (Prisma 스키마 변경 없음)

신규 파일:
- `prisma/seed.ts` — 데모 데이터 시드 스크립트
- `lib/portone.ts` — PortOne API 클라이언트 공통 모듈

### 4. 기술 부채

**해소된 항목**

| 항목 | 설명 |
|------|------|
| PortOne 함수 중복 | `lib/portone.ts` 공통 모듈로 해소 |
| `requireActiveSubscription` 미적용 라우트 | 4개 POST 엔드포인트 추가 적용 |
| 개발환경 JWT 하드코딩 폴백 | 전 환경 `JWT_SECRET` 필수화로 해소 |
| vehicles N+1 쿼리 | 배치 조회 + Map 룩업으로 해소 |

**신규 등록 (미수정 — SPRINT.md D-01~D-04)**

| ID | 위치 | 내용 |
|----|------|------|
| D-01 | `Button.tsx:82` | loading 상태 Spinner + 텍스트 동시 표시 |
| D-02 | `Badge.tsx` | variant별 1px 테두리 누락 |
| D-03 | `(admin)/home/page.tsx:271` | 바로가기 버튼 터치 타깃 44px 미달 |
| D-04 | `vercel.json` poll-reminder | Cron 스케줄 KST 불일치 |

**잔존 부채 (변동 없음)**

| 항목 | 위험도 | 비고 |
|------|--------|------|
| `BILLING_ENCRYPTION_KEY` Vercel 미등록 | Critical | 잔존 |
| 기존 평문 빌링키 DB 마이그레이션 | High | 잔존 |
| `lib/client-api.ts` 헬퍼 미활용 | Medium | 잔존 |
| 동대표 교체 후 JWT 블랙리스트 없음 | Medium | 잔존 |
| PortOne 운영 MID 미전환 | High | 잔존 |

### 버그 수정 요약

| 버그 | 원인 | 수정 |
|------|------|------|
| 미승인 입주자 투표·커뮤니티 열람 가능 | `assertVillaAccess`에 `status: 'APPROVED'` 미필터 | 4개 라우트 조건 추가 |
| 납부 PAID 전환 후 장부 기록 누락 가능 | 별도 쿼리 비원자 실행 | `$transaction` 적용 |
| dashboard 타 빌라 존재 여부 탐색 | searchParams villaId 미검증 | JWT villaId만 사용 |
| 0원 청구서 독촉 알림 발송 | amount 필터 없음 | `amount: { gt: 0 }` 추가 |
| 공지 Web Push에 HTML 태그 노출 | TipTap content 직접 slice | `replace(/<[^>]*>/g, '')` 적용 |
| 테스트 4건 실패 | tickets POST mock `residentRecord` 미등록 | mock 추가 + 403 케이스 신규 |

---

## 구현 현황 (2026-04-21 기준)

### Sprint 10 — 즉시 추가 기능 4종 + QA D-01~D-04 해소

#### QA D-01~D-04 완전 해소

| # | 항목 | 수정 내용 |
|---|------|----------|
| D-01 | Button loading 텍스트+스피너 동시 표시 | `{loading ? <Spinner/> : children}` |
| D-02 | Badge 1px 테두리 누락 | `ring-1 ring-{color}-200` 추가 |
| D-03 | 관리자 홈 바로가기 터치 타깃 44px 미달 | `min-h/w-[44px]` 추가 |
| D-04 | poll-reminder Cron 주석 스케줄 불일치 | 주석 `"0 15 * * *"` 통일 |

#### 신규 기능 4종

**1. 관리자 수금 인사이트**
- `GET /api/admin/insights` — 이번 달 수금률, 최근 6개월 수금액 월별 집계
- `components/InsightsSection.tsx` — 순수 CSS 막대 차트 (recharts 미사용), 관리자 홈 하단 자동 표시

**2. 입주민 납부 히스토리**
- `GET /api/resident/payments/history?status=PAID|PENDING|OVERDUE`
- `app/(resident)/villa/invoices/history/page.tsx` — 전체/완납/미납 탭 필터

**3. 공용시설 예약**
- 신규 모델: `Facility` (name, maxPerDay, isActive), `FacilityReservation` (date, timeSlot, note)
- 관리자: 시설 CRUD + 운영중단/재개 토글 + 예약 현황 조회
- 입주민: 날짜·시간대 선택 예약, 내 예약 취소
- 접근: 관리자 `/manage/facilities`, 입주민 `/villa/facilities`

**4. 외부 업체 연락처 관리**
- 신규 모델: `Vendor` (name, category, phone, memo), `VendorCategory` enum
- 관리자: 카테고리별 CRUD, 입주민: 읽기 전용 + `tel:` 전화 바로가기
- 접근: 관리자 `/manage/vendors`, 입주민 `/villa/vendors`

#### 버그 수정 3건

| 버그 | 원인 | 수정 |
|------|------|------|
| 신규 페이지 바텀시트 BottomNav 가림 | 바텀시트 z-50 = BottomNav z-50 | 바텀시트 z-60 상향 |
| 관리자 프로필 하단 항목 가림 | `pb-10` (40px) < BottomNav 56px | `pb-24` 수정 |
| 기존 관리자 듀얼 모드 활성화 불가 | 온보딩 이후 입주민 등록 경로 없음 | 프로필 "등록" 버튼 + join API 호출 추가 |

#### 현재 기술 스택 (2026-04-21 업데이트)

| 구분 | 현황 |
|------|------|
| Frontend | Next.js 15 App Router + TypeScript |
| Backend | Next.js Route Handlers (풀스택) |
| DB 모델 수 | User, Villa, ResidentRecord, Invoice(+Item+Payment), ExternalBilling, Post(+Like+Comment), Poll(+Option+Vote), Ticket, LedgerTransaction, BuildingEvent, Vehicle, Notification, PushSubscription, SocialAccount, TossBillingKey, EnergyUsage, **Facility**, **FacilityReservation**, **Vendor** |
| 배포 | https://villamate.vercel.app (Vercel) |
| 테스트 | 33/33 통과 |

#### 잔존 운영 과제

| 항목 | 위험도 | 비고 |
|------|--------|------|
| **신규 테이블 Supabase 미적용** | **High** | Facility/FacilityReservation/Vendor SQL 수동 적용 필요 |
| `BILLING_ENCRYPTION_KEY` Vercel 미등록 | Critical | 자동결제 불가 |
| 기존 평문 빌링키 마이그레이션 | High | 잔존 |
| PortOne 운영 MID 미전환 | High | 테스트 MID 사용 중 |

---

### Sprint 11 (2026-04-23) — 백오피스 라우팅 버그 수정 + 운영 초기화

#### 아키텍처 수정

**백오피스 URL 경로 체계 확정**

`(backoffice)` route group 내 페이지들의 실제 URL이 `/dashboard`, `/villas` 등 루트 레벨임을 확인하고, 코드 전반에 잘못 하드코딩된 `/backoffice/dashboard` 등의 경로를 일괄 수정.

| 수정 파일 | 수정 내용 |
|----------|---------|
| `app/(backoffice)/backoffice/login/page.tsx` | 리다이렉트 `/backoffice/dashboard` → `/dashboard` |
| `app/(backoffice)/layout.tsx` | 사이드바 링크 `/backoffice/*` → `/*` |
| `app/(auth)/login/page.tsx` | SUPER_ADMIN 리다이렉트 경로 수정 |
| `app/page.tsx` | SUPER_ADMIN 리다이렉트 경로 수정 |
| `app/api/backoffice/auth/login/route.ts` | `bo_session` 쿠키 `path: '/backoffice'` → `path: '/'` |
| `middleware.ts` | matcher에 `/dashboard`, `/villas`, `/users`, `/billing`, `/mrr`, `/content/*` 추가 |

**핵심 버그**: `bo_session` 쿠키가 `path: '/backoffice'`로 발급되어 `/dashboard` 접근 시 쿠키 미전송 → 미들웨어 인증 실패 → 로그인 루프 발생. `path: '/'`로 수정하여 해소.

#### API 변경 없음 (라우팅/인증 버그 수정만)

#### 운영 초기화 작업

| 작업 | 내용 |
|------|------|
| SUPER_ADMIN 계정 생성 | `dmlehsasd@gmail.com` / role=SUPER_ADMIN DB 직접 생성 |
| Seed 데이터 적용 | `npx prisma db seed` 실행 — 햇살 빌라 데모 데이터 DB 반영 |

**시드 데이터 내용**: 햇살 빌라 (초대코드: DEMO-VILLA), 관리자 `admin@villamate.demo`, 입주자 `r101~r202@villamate.demo` / 청구서 2건·외부청구 3건·장부 8건·커뮤니티 4건·민원 4건·투표 3건·에너지 6개월치

#### 현재 기술 스택 (2026-04-23 업데이트)

| 구분 | 현황 |
|------|------|
| Frontend | Next.js 15 App Router + TypeScript |
| Backend | Next.js Route Handlers (풀스택) |
| 배포 | https://villamate.vercel.app (Vercel) |
| 테스트 | 33/33 통과 |

---

### Sprint 12 (2026-04-24~25) — QA 전수 수정 + fixedFee 고정 관리비 자동 발행

#### 보안·기능 수정

| # | 파일 | 수정 내용 |
|---|------|----------|
| H-1 | `facilities/[id]/reservations/route.ts` | 과거 날짜 예약 서버 검증 추가 (KST 기준) |
| H-2 | `invoices/route.ts`, `publish-invoices/route.ts` | headResidents `status: 'APPROVED'` 필터 — PENDING 세대 청구서 발행 차단 |
| H-3 | `external-billing/[billId]/confirm/route.ts` | 결제완료 + 장부기록 `prisma.$transaction` 원자화 |
| M-1 | `manage/facilities/page.tsx` | 삭제·토글 `res.ok` 체크 + `useConfirm` 적용 |
| M-2 | `manage/vendors/page.tsx` | `handleDelete` `res.ok` 체크 추가 |
| M-4 | `resident/payments/history/route.ts` | RESIDENT/ADMIN role 검증 추가 |
| M-5 | `posts/[postId]/route.ts` | PATCH 공지 승격 시 `villa.adminId` 검증 |
| M-8 | `lib/notify.ts` `createNotificationForVilla` | `status: 'APPROVED'` 필터 추가 |

#### 디자인 QA 수정

| # | 수정 내용 |
|---|----------|
| D-1 | `Toast` 컴포넌트 + `useToast` 훅 신규. 앱 전반 `window.alert/confirm` 완전 제거 |
| D-2 | Badge 시맨틱 수정: PENDING=`warning`, OVERDUE=`error` (납부 상태 페이지) |
| D-3 | 삭제 버튼 터치 타깃 `min-h-[44px]` 표준화 |
| L-2 | 시설 예약 today 초기화 KST 기준 확정 |
| L-3 | 시설 예약 API 오늘 이후 예약 포함 조회, 타인 예약 오늘만 표시 |
| L-4 | InsightsSection 에러 상태 UI 추가 |

#### 신규 기능 — fixedFee 고정 관리비 자동 발행

| 레이어 | 내용 |
|--------|------|
| DB | `Villa.fixedFee Int?` 추가 (`prisma db push` 완료) |
| API | `PATCH /api/villas/[villaId]`에서 `fixedFee` 저장 지원 |
| 크론 | `publish-invoices` — `fixedFee ?? 0` 기반 청구서 금액 자동 설정 |
| UI | `AutoPublishCard` (`manage/invoices/page.tsx`) — 발행일 + 금액 설정 카드 |

기존 자동 발행 기능(autoPublishDay)은 금액이 항상 0원이었으나, fixedFee 설정 시 올바른 금액으로 발행됨. 미설정 시 기존처럼 0원 발행(하위 호환).

#### 현재 기술 스택 (2026-04-25 업데이트)

| 구분 | 현황 |
|------|------|
| Frontend | Next.js 15 App Router + TypeScript |
| Backend | Next.js Route Handlers (풀스택) |
| 배포 | https://villamate.vercel.app (Vercel) |
| 테스트 | 33/33 통과 |

#### 잔존 운영 과제

| 항목 | 위험도 |
|------|--------|
| Supabase 신규 테이블(Facility/FacilityReservation/Vendor) SQL 적용 | **Critical** |
| `BILLING_ENCRYPTION_KEY` Vercel 등록 | Critical |
| 기존 평문 빌링키 마이그레이션 | High |
| PortOne 운영 MID 전환 | High |
| 백오피스 | https://villamate.vercel.app/backoffice/login — 정상 동작 확인 |

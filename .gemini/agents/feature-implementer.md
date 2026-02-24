# Role: Feature Implementer (핵심 기능 개발자)

## 핵심 역할
당신은 System Architect가 제공한 설계도와 API 명세서를 바탕으로, 실제 작동하는 깨끗하고 효율적인 코드를 작성하는 시니어 개발자입니다.

## 주요 책임
- 주어진 디렉토리 구조와 기술 스택에 맞춰 각 파일별 코드를 구현합니다.
- 비즈니스 로직을 정확하게 반영하고, 재사용 가능한 컴포넌트/모듈을 작성합니다.
- 에러 핸들링과 예외 처리 로직을 꼼꼼하게 반영합니다.
- 코드를 작성한 후, Code Reviewer가 검토할 수 있도록 구현 의도와 주요 로직을 요약하여 전달합니다.

## 행동 지침
- 하나의 함수/메서드는 하나의 기능만 수행하도록(SRP 원칙) 작성하세요.
- 코드는 자기 문서화(Self-documenting)가 되도록 변수명과 함수명을 명확히 짓고, 필요한 곳에만 간결한 주석을 추가하세요.

## 참고 문서
docs/PRODUCT_CONTEXT.md
---
## Progress Status (2026-02-22)
- **동대표 화면 고도화**: `CreateInvoiceScreen`의 탭 순서 변경 및 자동 발행(Auto-issue) 설정 UI(Switch, Day Input) 구현.
- **입주민 대시보드 구현**: `ResidentDashboardScreen` 개발. 관리비 조회, 항목별 상세 내역(Mock Receipt), 가상 결제 로직(Amount Reset) 포함.
- **PaymentScreen 구현**: WebView 기반 PortOne(Iamport) 연동 및 테스트 결제 환경 구축.
- **LedgerScreen 구현**: 입출금 내역 표시(FlatList) 및 영수증 모달(Receipt Modal) UI 완성.
- **ResidentJoinScreen 구현**: 입주민 전용 초대 코드 및 호실 입력 폼 구축.
- **OnboardingScreen UX 고도화**: Daum Postcode API 연동(WebView), 은행 선택 모달(BottomSheet), 고유번호증 정보 팁 UI 구현.
- **초대 기능 통합**: ResidentManagementScreen에 랜덤 6자리 초대 코드 생성 및 공유(Share API) 기능 연동.

## Progress Status (2026-02-23)
- **Backend & Database 초기화**: Express 서버 구축 및 Prisma 7을 이용한 Supabase PostgreSQL 연동.
- **인증 및 온보딩 연동**: 휴대폰 번호 기반 로그인 및 빌라 등록 API 연동 완료.
- **Admin Dashboard 실데이터 연결**: 등록된 빌라 정보를 백엔드에서 조회하여 화면에 표시하는 로직 구현.
- **앱 리브랜딩**: 앱 이름을 '빌라매니저'에서 '빌라메이트(Villamate)'로 전면 변경 및 관련 UI/설정 업데이트.
- **로그인 UI 전면 개편**: 현대적인 소셜 로그인 버튼(카카오, 네이버, 구글, 이메일) 도입 및 테스트용 로그인 기능을 모달 방식의 Bottom Sheet로 분리.
- **자동 로그인 및 스마트 라우팅**: 사용자 역할 및 빌라 등록 여부에 따른 최적의 진입 화면(Dashboard, Onboarding, ResidentJoin) 자동 연결 로직 구현.
- **카카오 소셜 로그인 구현**: `expo-auth-session`과 자체 Auth Proxy를 결합한 실결 인증 흐름 구현 및 사용자 프로필 연동.
- **프로필 설정 화면(ProfileSetupScreen)**: 소셜 로그인 후 누락된 필수 정보(이름, 휴대폰 번호, 역할)를 수집하는 단계 추가.
- **로그아웃 기능 통합**: 세션 관리를 위한 `AsyncStorage` 초기화 및 로그인 화면 복귀 로직을 빌라 등록 및 프로필 화면에 적용.

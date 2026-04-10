---
name: VillaMate Design System v1
description: 2026-04-03 확정. 색상 토큰, 타이포그래피, 스페이싱, 컴포넌트 명세, 아이콘, UX 패턴 전체
type: project
---

디자인 시스템 v1 전체 명세. 개발팀 핸드오프 기준 문서.

**Why:** 코드 와이프 이후 서비스 재구축 시점에 맞춰 처음부터 설계된 시스템.
**How to apply:** 신규 화면·컴포넌트 제안 시 이 토큰과 패턴을 기준으로 일관성 검토.

## 브랜드 포지셔닝 요약
- Primary Color: #2563EB (Blue 600) — 신뢰·공공성
- Secondary: #10B981 (Emerald 500) — 완납·긍정 상태
- 폰트: Pretendard(한국어) + Inter(숫자/영문)
- 기준 간격 단위: 4px, 주요 컴포넌트는 8px 배수
- 다크모드: Phase 1 미지원, Phase 2 이후 검토

## 색상 토큰 (핵심)
- primary-500: #3B82F6 / primary-600: #2563EB (CTA 버튼)
- secondary-500: #10B981 (완납, 긍정)
- accent-500: #F59E0B (강조, 위젯 하이라이트)
- error-500: #EF4444 / warning-500: #F97316 / success-500: #10B981 / info-500: #3B82F6

## 탭 바 구조 (확정)
- ADMIN 5탭: 홈(Home), 관리(Settings), 커뮤니티(ChatBubbleOvalLeft), 장부(BookOpen), 프로필(UserCircle)
- RESIDENT 4탭: 홈(Home), 커뮤니티(ChatBubbleOvalLeft), 우리빌라(BuildingOffice2), 프로필(UserCircle)
- 아이콘 라이브러리: Heroicons v2 (outline/solid 전환으로 active 상태 표현)

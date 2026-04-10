---
name: VillaMate Product & User Context
description: 빌라메이트 서비스 개요, 사용자 유형(ADMIN/RESIDENT/SUPER_ADMIN), 채널 구조 및 핵심 UX 제약
type: project
---

빌라·다세대 주택 관리 B2B SaaS. 동대표의 수기 장부·카톡 독촉을 앱으로 대체하고 입주민 간 투명한 정보 공유를 목표로 한다.

**사용자 유형**
- ADMIN(동대표): 40~60대 남성, 기술 친숙도 낮음. 청구서 발행·미납 독촉·입주민 관리가 핵심 태스크.
- RESIDENT(입주민): 20~60대 다양. 관리비 확인·납부, 공지 확인, 투표 참여가 핵심.
- SUPER_ADMIN: 내부 운영팀, PC 백오피스 전용.

**채널**
- 모바일 앱(React Native/Expo): ADMIN 5탭(홈/관리/커뮤니티/장부/프로필), RESIDENT 4탭(홈/커뮤니티/우리빌라/프로필)
- 백오피스 웹(React+Vite+Tailwind): SUPER_ADMIN 전용, 사이드바+콘텐츠 구조

**Why:** 디자인 결정 시 ADMIN의 낮은 기술 친숙도를 최우선 접근성 기준으로 삼아야 한다. 텍스트 크기, 터치 타깃, 레이블 명시성이 일반 앱보다 높은 기준이 요구된다.

**How to apply:** 새로운 컴포넌트나 화면 제안 시 "40~60대 비전문가 동대표가 직관적으로 이해하고 조작할 수 있는가"를 1순위 체크포인트로 사용한다.

기능 구현이 완료되었을 때 Notion DB에 기록합니다.

구현한 기능의 정보를 수집해서 아래 형식의 JSON을 만들고, 다음 명령어를 실행하세요:

```bash
echo '<JSON>' | node scripts/notion-log.mjs
```

JSON 필드 안내:
- `기능명` (필수): 구현한 기능 이름 (예: "이메일 로그인")
- `reqId`: RDD 요구사항 ID (예: "F-01")
- `sprint`: "Phase 1" | "Phase 2" | "Phase 3"
- `상태`: "완료" | "진행중" | "보류" (기본값: 완료)
- `구현일`: "YYYY-MM-DD" (생략 시 오늘 날짜 자동 입력)
- `요약`: 기능 한 줄 요약
- `수정된파일`: 주요 수정 파일 목록 (쉼표 구분)
- `스펙편차`: 기획 대비 달라진 점 (없으면 생략)
- `비고`: 기타 메모 (없으면 생략)

예시:
```bash
echo '{"기능명":"이메일 로그인","reqId":"F-01","sprint":"Phase 1","상태":"완료","요약":"bcrypt 해싱, JWT 발급, 역할 분기 포함","수정된파일":"apps/api/src/auth/auth.service.ts, apps/web/app/(auth)/login/page.tsx"}' | node scripts/notion-log.mjs
```

기록 후 SPRINT.md에서 해당 항목 상태도 ✅로 업데이트해주세요.

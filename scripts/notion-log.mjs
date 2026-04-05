#!/usr/bin/env node
/**
 * VillaMate — Notion 기능 기록 스크립트
 * 사용법: echo '<JSON>' | node scripts/notion-log.mjs
 *
 * 입력 JSON 필드:
 *   기능명      (string, 필수) — Notion title
 *   reqId       (string)       — 요구사항 ID (예: F-01, NF-03)
 *   sprint      (string)       — Phase 1 / Phase 2 / Phase 3
 *   상태        (string)       — 완료 | 진행중 | 보류
 *   구현일      (string)       — YYYY-MM-DD (생략 시 오늘)
 *   요약        (string)       — 기능 간단 요약
 *   수정된파일  (string)       — 수정된 파일 목록
 *   스펙편차    (string)       — 기획 대비 달라진 점
 *   비고        (string)       — 기타 메모
 */

import { readFileSync } from 'fs';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = '30fe5d49747881b1848bd77eeb69be04';

if (!NOTION_TOKEN) {
  console.error('❌ NOTION_TOKEN 환경변수가 없습니다.');
  console.error('   .claude/settings.local.json 의 env 섹션에 NOTION_TOKEN을 추가해주세요.');
  process.exit(1);
}

// JSON 읽기: 파일 인자 우선, 없으면 stdin
let raw = '';
const fileArg = process.argv[2];
if (fileArg) {
  // node scripts/notion-log.mjs <json-file> 방식
  try {
    raw = readFileSync(fileArg, 'utf-8').trim();
  } catch (e) {
    console.error('❌ 파일을 읽을 수 없습니다:', fileArg);
    process.exit(1);
  }
} else {
  // echo '<JSON>' | node scripts/notion-log.mjs 방식 (Linux/Mac)
  try {
    raw = readFileSync('/dev/stdin', 'utf-8').trim();
  } catch {
    console.error('❌ stdin에서 데이터를 읽을 수 없습니다.');
    console.error('   Windows에서는 파일 인자를 사용하세요: node scripts/notion-log.mjs <json-file>');
    process.exit(1);
  }
}

let data;
try {
  data = JSON.parse(raw);
} catch {
  console.error('❌ JSON 파싱 실패:', raw);
  process.exit(1);
}

const {
  기능명,
  reqId = '',
  sprint = 'Phase 1',
  상태 = '완료',
  구현일,
  요약 = '',
  수정된파일 = '',
  스펙편차 = '',
  비고 = '',
} = data;

if (!기능명) {
  console.error('❌ 기능명은 필수 항목입니다.');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

const body = {
  parent: { database_id: DATABASE_ID },
  properties: {
    '프로젝트 이름': {
      title: [{ text: { content: 기능명 } }],
    },
    'Req ID': {
      rich_text: [{ text: { content: reqId } }],
    },
    Sprint: {
      select: { name: sprint },
    },
    '상태': {
      status: { name: 상태 },
    },
    '구현일': {
      date: { start: 구현일 ?? today },
    },
    '기능 간단 요약': {
      rich_text: [{ text: { content: 요약 } }],
    },
    '수정된 파일': {
      rich_text: [{ text: { content: 수정된파일 } }],
    },
    '스펙 편차': {
      rich_text: [{ text: { content: 스펙편차 } }],
    },
    '비고': {
      rich_text: [{ text: { content: 비고 } }],
    },
  },
};

const res = await fetch('https://api.notion.com/v1/pages', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${NOTION_TOKEN}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28',
  },
  body: JSON.stringify(body),
});

if (!res.ok) {
  const err = await res.json();
  console.error('❌ Notion API 오류:', JSON.stringify(err, null, 2));
  process.exit(1);
}

const page = await res.json();
console.log(`✅ Notion에 기록되었습니다: ${기능명}`);
console.log(`   URL: ${page.url}`);

/**
 * Supabase Storage 버킷 초기화 스크립트
 *
 * 사용법:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/setup-storage.mjs
 *
 * 이미 존재하는 버킷은 건너뜁니다 (idempotent).
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    '[setup-storage] 환경변수 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 를 설정해주세요.',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/** @type {{ name: string; public: boolean }[]} */
const buckets = [
  {
    name: 'building-events',
    public: true,
  },
  {
    name: 'receipts',
    public: true,
  },
];

async function main() {
  console.log('[setup-storage] Supabase Storage 버킷 설정을 시작합니다...\n');

  for (const bucket of buckets) {
    const { data, error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
    });

    if (error) {
      // 버킷이 이미 존재하는 경우 Supabase는 "already exists" 메시지를 반환
      if (
        error.message?.toLowerCase().includes('already exists') ||
        error.message?.toLowerCase().includes('duplicate')
      ) {
        console.log(`[skip]    "${bucket.name}" — 이미 존재합니다.`);
      } else {
        console.error(`[error]   "${bucket.name}" — ${error.message}`);
      }
      continue;
    }

    console.log(
      `[created] "${bucket.name}" — public: ${bucket.public} (id: ${data?.name ?? bucket.name})`,
    );
  }

  console.log('\n[setup-storage] 완료.');
}

main().catch((err) => {
  console.error('[setup-storage] 예기치 않은 오류:', err);
  process.exit(1);
});

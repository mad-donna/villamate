/**
 * AES-256-GCM 기반 빌링키 암호화 유틸
 *
 * 환경변수 BILLING_ENCRYPTION_KEY — 64자리 16진수 문자열 (32바이트)
 * 생성 방법: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * 저장 포맷: iv(24 hex) + authTag(32 hex) + ciphertext(hex)
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
  const hexKey = process.env.BILLING_ENCRYPTION_KEY;
  if (!hexKey || hexKey.length !== 64) {
    throw new Error(
      'BILLING_ENCRYPTION_KEY 환경변수가 설정되지 않았거나 올바르지 않습니다. (64자리 hex 필요)',
    );
  }
  return Buffer.from(hexKey, 'hex');
}

export function encryptBillingKey(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12); // 96-bit IV (GCM 권장)
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag(); // 16 bytes
  // iv(24 hex) + authTag(32 hex) + encrypted(variable)
  return iv.toString('hex') + authTag.toString('hex') + encrypted.toString('hex');
}

export function decryptBillingKey(ciphertext: string): string {
  const key = getKey();
  const iv = Buffer.from(ciphertext.slice(0, 24), 'hex');
  const authTag = Buffer.from(ciphertext.slice(24, 56), 'hex');
  const encrypted = Buffer.from(ciphertext.slice(56), 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

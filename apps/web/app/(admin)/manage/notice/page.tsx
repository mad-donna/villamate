'use client';

import { useEffect, useState } from 'react';
import { getStoredUser } from '@/lib/client-auth';
import { Button } from '@/components/ui/Button';

export default function NoticePage() {
  const [villaName, setVillaName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    const user = getStoredUser();
    if (user?.villa) {
      setVillaName(user.villa.name);
      setInviteCode(user.villa.inviteCode);
    }
    setAppUrl(window.location.origin);
  }, []);

  useEffect(() => {
    if (!inviteCode || !appUrl) return;
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(`${appUrl}/join?code=${inviteCode}`, {
        width: 220,
        margin: 1,
        color: { dark: '#1e3a8a', light: '#ffffff' },
      }).then((url) => setQrDataUrl(url));
    });
  }, [inviteCode, appUrl]);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          #notice-card {
            position: fixed;
            inset: 0;
            margin: 0;
            border-radius: 0;
            box-shadow: none;
          }
        }
      `}</style>

      {/* 화면용 헤더 */}
      <div className="no-print flex items-center justify-between px-4 pt-6 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">안내문 생성</h1>
          <p className="text-sm text-neutral-500 mt-0.5">인쇄 후 게시판·엘리베이터에 부착하세요.</p>
        </div>
        <Button size="sm" onClick={() => window.print()}>
          인쇄 / PDF 저장
        </Button>
      </div>

      {/* 안내문 */}
      <div className="no-print px-4 pb-24">
        <NoticeCard villaName={villaName} inviteCode={inviteCode} qrDataUrl={qrDataUrl} />
      </div>

      {/* 인쇄 전용 레이어 */}
      <div
        id="notice-card"
        className="hidden print:block bg-white"
        style={{ width: '100%', minHeight: '100vh' }}
      >
        <NoticeCardInner villaName={villaName} inviteCode={inviteCode} qrDataUrl={qrDataUrl} />
      </div>
    </>
  );
}

function NoticeCard({
  villaName,
  inviteCode,
  qrDataUrl,
}: {
  villaName: string;
  inviteCode: string;
  qrDataUrl: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <NoticeCardInner villaName={villaName} inviteCode={inviteCode} qrDataUrl={qrDataUrl} />
    </div>
  );
}

function NoticeCardInner({
  villaName,
  inviteCode,
  qrDataUrl,
}: {
  villaName: string;
  inviteCode: string;
  qrDataUrl: string;
}) {
  return (
    <div style={{ fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif" }}>
      {/* 헤더 */}
      <div style={{ background: '#2563EB', padding: '28px 32px 24px' }}>
        <p style={{ color: '#bfdbfe', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>
          공동주택 관리 서비스
        </p>
        <p style={{ color: '#ffffff', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em' }}>
          빌라메이트
        </p>
      </div>

      {/* 본문 */}
      <div style={{ padding: '28px 32px 36px' }}>
        {/* 빌라명 + 타이틀 */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: '#2563EB', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
            {villaName || '빌라 이름'}
          </p>
          <p style={{ color: '#111827', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            빌라메이트 도입 안내
          </p>
        </div>

        {/* 본문 설명 */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          borderLeft: '3px solid #2563EB',
        }}>
          <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.7' }}>
            입주민 여러분께,<br />
            우리 빌라는 <strong>빌라메이트 앱</strong>으로 공용 관리비 청구·장부 공개·
            공지사항 전달을 운영하고 있습니다.<br />
            아래 초대코드 또는 QR코드로 참여해 주세요.
          </p>
        </div>

        {/* 참여 방법 */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '10px' }}>
            앱 참여 방법
          </p>
          {[
            '앱스토어 / 플레이스토어에서 "빌라메이트" 검색 후 설치',
            '회원가입 후 홈 화면에서 "빌라 참여" 선택',
            '아래 초대코드 입력 또는 QR코드 스캔',
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: '#2563EB', color: '#fff',
                fontSize: '12px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {i + 1}
              </span>
              <p style={{ color: '#374151', fontSize: '13px', lineHeight: '1.6', marginTop: '2px' }}>{step}</p>
            </div>
          ))}
        </div>

        {/* 초대코드 + QR */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {/* 초대코드 */}
          <div style={{ flex: 1 }}>
            <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '8px' }}>
              초대코드
            </p>
            <div style={{
              border: '2px solid #2563EB',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
            }}>
              <p style={{
                color: '#2563EB',
                fontSize: '32px',
                fontWeight: 800,
                letterSpacing: '0.15em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {inviteCode || '------'}
              </p>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '11px', marginTop: '8px', lineHeight: '1.5' }}>
              앱 설치 후 '빌라 참여' 메뉴에서<br />위 코드를 입력하세요.
            </p>
          </div>

          {/* QR코드 */}
          <div style={{ flexShrink: 0 }}>
            <p style={{ color: '#6b7280', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '8px' }}>
              QR코드 스캔
            </p>
            <div style={{
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '10px',
              display: 'inline-block',
            }}>
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="초대 QR코드" width={110} height={110} />
              ) : (
                <div style={{ width: 110, height: 110, background: '#f3f4f6', borderRadius: '8px' }} />
              )}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div style={{
          marginTop: '28px',
          paddingTop: '16px',
          borderTop: '1px solid #f3f4f6',
        }}>
          <p style={{ color: '#d1d5db', fontSize: '11px', textAlign: 'center' }}>
            빌라메이트 · 공동주택 관리 서비스 · villamate.vercel.app
          </p>
        </div>
      </div>
    </div>
  );
}

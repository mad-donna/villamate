import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js 인라인 스크립트 허용 (프로덕션 nonce 적용 시 'unsafe-inline' 제거)
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.iamport.kr",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Supabase Storage 이미지 허용
      "img-src 'self' data: blob: https://*.supabase.co",
      // Supabase API + PortOne(iamport) 연결 허용
      "connect-src 'self' https://*.supabase.co https://*.supabase.com https://*.iamport.kr https://*.inicis.com",
      // PortOne 결제창 팝업/iframe 허용
      "frame-src https://*.iamport.kr https://*.inicis.com https://*.kcp.co.kr https://*.nicepay.co.kr",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;

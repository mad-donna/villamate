import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '빌라메이트',
  description: '스마트 빌라 관리 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

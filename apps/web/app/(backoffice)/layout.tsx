'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartBarIcon,
  BuildingOffice2Icon,
  UsersIcon,
  MegaphoneIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

interface SidebarItem {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const platformItems: SidebarItem[] = [
  { href: '/backoffice/dashboard', label: '대시보드', Icon: ChartBarIcon },
  { href: '/backoffice/villas', label: '빌라 목록', Icon: BuildingOffice2Icon },
  { href: '/backoffice/users', label: '사용자', Icon: UsersIcon },
];

const contentItems: SidebarItem[] = [
  { href: '/backoffice/content/notices', label: '공지사항', Icon: MegaphoneIcon },
  { href: '/backoffice/content/faqs', label: 'FAQ', Icon: QuestionMarkCircleIcon },
  { href: '/backoffice/content/guides', label: '가이드', Icon: BookOpenIcon },
];

function SidebarLink({ item }: { item: SidebarItem }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <Link
      href={item.href}
      className={[
        'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary-50 text-primary-700'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
      ].join(' ')}
      aria-current={isActive ? 'page' : undefined}
    >
      <item.Icon className="h-5 w-5 flex-shrink-0" />
      {item.label}
    </Link>
  );
}

function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 h-screen sticky top-0 bg-white border-r border-neutral-200 p-4 gap-1">
      <div className="px-3 py-4 mb-2">
        <span className="text-lg font-bold text-primary-600">VillaMate</span>
        <p className="text-xs text-neutral-400 mt-0.5">관리자 백오피스</p>
      </div>

      <div>
        <p className="px-3 mb-1 text-xs font-semibold text-neutral-400 uppercase tracking-wide">
          플랫폼 운영
        </p>
        <nav className="flex flex-col gap-0.5">
          {platformItems.map((item) => (
            <SidebarLink key={item.href} item={item} />
          ))}
        </nav>
      </div>

      <div className="mt-4">
        <p className="px-3 mb-1 text-xs font-semibold text-neutral-400 uppercase tracking-wide">
          콘텐츠 관리
        </p>
        <nav className="flex flex-col gap-0.5">
          {contentItems.map((item) => (
            <SidebarLink key={item.href} item={item} />
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

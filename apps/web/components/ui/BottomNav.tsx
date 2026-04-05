'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  href: string;
  label: string;
  IconOutline: React.ComponentType<{ className?: string }>;
  IconSolid: React.ComponentType<{ className?: string }>;
}

interface BottomNavProps {
  items: NavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-14 bg-white border-t border-neutral-200 flex items-stretch z-50"
      aria-label="하단 탭 내비게이션"
    >
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = isActive ? item.IconSolid : item.IconOutline;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors',
              isActive ? 'text-primary-600' : 'text-neutral-400 hover:text-neutral-600',
            ].join(' ')}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="h-6 w-6" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

'use client';

import {
  HomeIcon as HomeOutline,
  Cog6ToothIcon as CogOutline,
  ChatBubbleOvalLeftIcon as ChatOutline,
  BookOpenIcon as BookOutline,
  UserCircleIcon as UserOutline,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  Cog6ToothIcon as CogSolid,
  ChatBubbleOvalLeftIcon as ChatSolid,
  BookOpenIcon as BookSolid,
  UserCircleIcon as UserSolid,
} from '@heroicons/react/24/solid';
import { BottomNav, type NavItem } from '@/components/ui/BottomNav';

const adminNavItems: NavItem[] = [
  {
    href: '/home',
    label: '홈',
    IconOutline: HomeOutline,
    IconSolid: HomeSolid,
  },
  {
    href: '/manage',
    label: '관리',
    IconOutline: CogOutline,
    IconSolid: CogSolid,
  },
  {
    href: '/community',
    label: '커뮤니티',
    IconOutline: ChatOutline,
    IconSolid: ChatSolid,
  },
  {
    href: '/ledger',
    label: '장부',
    IconOutline: BookOutline,
    IconSolid: BookSolid,
  },
  {
    href: '/profile',
    label: '프로필',
    IconOutline: UserOutline,
    IconSolid: UserSolid,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-14 max-w-lg mx-auto">
      {children}
      <BottomNav items={adminNavItems} />
    </div>
  );
}

'use client';

import {
  HomeIcon as HomeOutline,
  ChatBubbleOvalLeftIcon as ChatOutline,
  BuildingOffice2Icon as BuildingOutline,
  UserCircleIcon as UserOutline,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  ChatBubbleOvalLeftIcon as ChatSolid,
  BuildingOffice2Icon as BuildingSolid,
  UserCircleIcon as UserSolid,
} from '@heroicons/react/24/solid';
import { BottomNav, type NavItem } from '@/components/ui/BottomNav';

const residentNavItems: NavItem[] = [
  {
    href: '/resident/home',
    label: '홈',
    IconOutline: HomeOutline,
    IconSolid: HomeSolid,
  },
  {
    href: '/resident/community',
    label: '커뮤니티',
    IconOutline: ChatOutline,
    IconSolid: ChatSolid,
  },
  {
    href: '/villa',
    label: '우리 빌라',
    IconOutline: BuildingOutline,
    IconSolid: BuildingSolid,
  },
  {
    href: '/resident/profile',
    label: '프로필',
    IconOutline: UserOutline,
    IconSolid: UserSolid,
  },
];

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-14 max-w-lg mx-auto">
      {children}
      <BottomNav items={residentNavItems} />
    </div>
  );
}

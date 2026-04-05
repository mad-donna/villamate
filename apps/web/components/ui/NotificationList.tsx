'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from './Button';

type NotificationType =
  | 'INVOICE'
  | 'PAYMENT_REMINDER'
  | 'POLL'
  | 'COMMUNITY'
  | 'SYSTEM'
  | 'TICKET';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_META: Record<NotificationType, { icon: string; label: string }> = {
  INVOICE: { icon: '💰', label: '청구서' },
  PAYMENT_REMINDER: { icon: '🔔', label: '미납 안내' },
  POLL: { icon: '🗳️', label: '투표' },
  COMMUNITY: { icon: '💬', label: '커뮤니티' },
  SYSTEM: { icon: '📢', label: '시스템' },
  TICKET: { icon: '🏷️', label: '민원' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
  }

  async function markAllAsRead() {
    setMarkingAll(true);
    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="space-y-3 px-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-1/3 mb-2" />
            <div className="h-3 bg-neutral-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 pb-4">
        <p className="text-sm text-neutral-500">
          {unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : '모두 읽었습니다'}
        </p>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            loading={markingAll}
            onClick={markAllAsRead}
          >
            모두 읽음
          </Button>
        )}
      </div>

      {/* 알림 없음 */}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <span className="text-4xl mb-3">🔕</span>
          <p className="text-sm">새로운 알림이 없습니다.</p>
        </div>
      )}

      {/* 알림 목록 */}
      <ul className="space-y-0 divide-y divide-neutral-100">
        {notifications.map((n) => {
          const meta = TYPE_META[n.type];
          return (
            <li
              key={n.id}
              onClick={() => !n.isRead && markAsRead(n.id)}
              className={[
                'flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors',
                n.isRead
                  ? 'bg-white'
                  : 'bg-primary-50 border-l-4 border-l-primary-600',
              ].join(' ')}
            >
              <span className="text-xl leading-none pt-0.5" aria-hidden="true">
                {meta.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 rounded-full px-2 py-0.5">
                    {meta.label}
                  </span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                  )}
                </div>
                <p
                  className={[
                    'text-sm leading-snug break-words',
                    n.isRead ? 'text-neutral-700' : 'text-neutral-900 font-semibold',
                  ].join(' ')}
                >
                  {n.title}
                </p>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed break-words">
                  {n.body}
                </p>
                <p className="text-xs text-neutral-400 mt-1">{formatDate(n.createdAt)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

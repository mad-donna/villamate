'use client';

import { useEffect, useState } from 'react';
import { NotificationList } from '@/components/ui/NotificationList';

type PushState = 'unsupported' | 'denied' | 'prompt' | 'subscribed' | 'loading';

function usePushState(): { state: PushState; toggle: () => Promise<void> } {
  const [state, setState] = useState<PushState>('loading');

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported');
      return;
    }
    const permission = Notification.permission;
    if (permission === 'denied') {
      setState('denied');
      return;
    }
    navigator.serviceWorker.ready.then((reg) =>
      reg.pushManager.getSubscription().then((sub) => {
        setState(sub ? 'subscribed' : 'prompt');
      }),
    );
  }, []);

  async function toggle() {
    if (!('serviceWorker' in navigator)) return;

    setState('loading');
    const reg = await navigator.serviceWorker.register('/sw.js');

    if (state === 'subscribed') {
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        const token = localStorage.getItem('token') ?? '';
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      setState('prompt');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setState(permission === 'denied' ? 'denied' : 'prompt');
      return;
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    const token = localStorage.getItem('token') ?? '';
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(sub.toJSON()),
    });

    setState('subscribed');
  }

  return { state, toggle };
}

function PushBanner() {
  const { state, toggle } = usePushState();

  if (state === 'unsupported' || state === 'loading') return null;

  if (state === 'denied') {
    return (
      <div className="mx-4 mb-4 p-3 rounded-xl bg-neutral-100 text-sm text-neutral-500">
        브라우저 설정에서 알림 권한을 허용해야 푸시 알림을 받을 수 있습니다.
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4 p-4 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-primary-800">브라우저 푸시 알림</p>
        <p className="text-xs text-primary-600 mt-0.5">
          {state === 'subscribed' ? '현재 켜져 있습니다.' : '새 알림을 실시간으로 받아보세요.'}
        </p>
      </div>
      <button
        onClick={toggle}
        className={[
          'text-sm font-semibold rounded-xl px-4 py-2 min-h-[40px] transition-colors',
          state === 'subscribed'
            ? 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
            : 'bg-primary-600 text-white hover:bg-primary-700',
        ].join(' ')}
      >
        {state === 'subscribed' ? '끄기' : '켜기'}
      </button>
    </div>
  );
}

export default function ResidentNotificationsPage() {
  return (
    <main className="pt-6 pb-6">
      <div className="px-4 mb-4">
        <h1 className="text-xl font-bold text-neutral-900">알림</h1>
      </div>
      <PushBanner />
      <NotificationList />
    </main>
  );
}

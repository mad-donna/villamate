import { NotificationList } from '@/components/ui/NotificationList';

export default function ResidentNotificationsPage() {
  return (
    <main className="pt-6 pb-6">
      <div className="px-4 mb-4">
        <h1 className="text-2xl font-bold text-neutral-900">알림</h1>
      </div>
      <NotificationList />
    </main>
  );
}

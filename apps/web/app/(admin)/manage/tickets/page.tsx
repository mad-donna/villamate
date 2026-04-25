'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { apiFetch } from '@/lib/client-api';

type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
type TicketCategory = 'COMMON_FACILITY' | 'PARKING' | 'NOISE_COMPLAINT' | 'ETC';

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  createdAt: string;
  reporter: { id: string; name: string };
}

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  COMMON_FACILITY: '공용시설',
  PARKING: '주차',
  NOISE_COMPLAINT: '소음',
  ETC: '기타',
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  PENDING: '접수됨',
  IN_PROGRESS: '처리중',
  RESOLVED: '완료',
};

type FilterOption = 'ALL' | TicketStatus;

const FILTER_OPTIONS: { key: FilterOption; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'PENDING', label: '접수됨' },
  { key: 'IN_PROGRESS', label: '처리중' },
  { key: 'RESOLVED', label: '완료' },
];

function statusBadgeVariant(status: TicketStatus) {
  if (status === 'PENDING') return 'warning' as const;
  if (status === 'IN_PROGRESS') return 'info' as const;
  return 'success' as const;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function TicketsPage() {
  const [villaId, setVillaId] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villa?: { id?: string } };
    setVillaId(user.villa?.id ?? '');
  }, []);

  const fetchTickets = useCallback(async () => {
    if (!villaId) return;
    setLoading(true);
    try {
      const res = await apiFetch(`/api/villas/${villaId}/tickets`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json() as { tickets: Ticket[] };
      setTickets(data.tickets);
    } catch {
      showToast('목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  useEffect(() => {
    if (villaId) fetchTickets();
  }, [villaId, fetchTickets]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }

  async function handleStatusChange(ticket: Ticket, nextStatus: TicketStatus) {
    setUpdatingId(ticket.id);
    try {
      const res = await apiFetch(`/api/villas/${villaId}/tickets/${ticket.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? '상태 변경에 실패했습니다.');
      }
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? { ...t, status: nextStatus } : t))
      );
      showToast('상태가 변경되었습니다.');
    } catch (e) {
      showToast(e instanceof Error ? e.message : '상태 변경에 실패했습니다.');
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered =
    filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-neutral-900">민원 관리</h1>
      </div>

      <div className="px-4 mb-4 flex gap-2 flex-wrap">
        {FILTER_OPTIONS.map(({ key, label }) => (
          <Chip
            key={key}
            label={label}
            selected={filter === key}
            onClick={() => setFilter(key)}
          />
        ))}
      </div>

      <div className="px-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm p-4 animate-pulse"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-32 bg-neutral-200 rounded" />
                <div className="h-5 w-14 bg-neutral-200 rounded-full" />
              </div>
              <div className="h-4 w-20 bg-neutral-200 rounded mb-3" />
              <div className="h-9 w-24 bg-neutral-200 rounded-xl" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg
              className="w-12 h-12 text-neutral-300 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
              />
            </svg>
            <p className="text-neutral-500 font-medium">
              {filter === 'ALL' ? '등록된 민원이 없습니다.' : '해당 상태의 민원이 없습니다.'}
            </p>
          </div>
        ) : (
          filtered.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-sm font-bold text-neutral-900 leading-snug flex-1">
                  {ticket.title}
                </p>
                <Badge variant={statusBadgeVariant(ticket.status)}>
                  {STATUS_LABELS[ticket.status]}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-neutral-500 bg-neutral-100 rounded-full px-2 py-0.5">
                  {CATEGORY_LABELS[ticket.category]}
                </span>
                <span className="text-xs text-neutral-400">
                  {ticket.reporter.name} · {formatDate(ticket.createdAt)}
                </span>
              </div>
              <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                {ticket.description}
              </p>
              {ticket.status === 'PENDING' && (
                <Button
                  variant="secondary"
                  size="sm"
                  loading={updatingId === ticket.id}
                  disabled={updatingId !== null}
                  onClick={() => handleStatusChange(ticket, 'IN_PROGRESS')}
                >
                  처리 시작
                </Button>
              )}
              {ticket.status === 'IN_PROGRESS' && (
                <Button
                  variant="primary"
                  size="sm"
                  loading={updatingId === ticket.id}
                  disabled={updatingId !== null}
                  onClick={() => handleStatusChange(ticket, 'RESOLVED')}
                >
                  완료 처리
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {toast && (
        <div className="fixed bottom-20 left-0 right-0 mx-auto w-fit px-5 py-3 bg-neutral-800 text-white text-sm font-medium rounded-2xl shadow-lg z-50">
          {toast}
        </div>
      )}
    </main>
  );
}

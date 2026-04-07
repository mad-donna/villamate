'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type TicketCategory = 'COMMON_FACILITY' | 'PARKING' | 'NOISE_COMPLAINT' | 'ETC';
type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  createdAt: string;
  reporter: { name: string };
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

const STATUS_VARIANTS: Record<TicketStatus, 'neutral' | 'success' | 'warning'> = {
  PENDING: 'neutral',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TicketsPage() {
  const router = useRouter();
  const [villaId, setVillaId] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villaId?: string };
    setVillaId(user.villaId ?? '');
  }, []);

  const fetchTickets = useCallback(async () => {
    if (!villaId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/villas/${villaId}/tickets`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json() as { tickets: Ticket[] };
      setTickets(data.tickets);
    } catch {
      setError('민원 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  useEffect(() => {
    if (villaId) fetchTickets();
  }, [villaId, fetchTickets]);

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900">민원 접수</h1>
        <Button size="sm" onClick={() => router.push('/villa/tickets/new')}>
          + 접수하기
        </Button>
      </div>

      {loading ? (
        <div className="px-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
              <div className="h-4 w-3/4 bg-neutral-200 rounded mb-2" />
              <div className="h-3 w-full bg-neutral-100 rounded mb-1" />
              <div className="h-3 w-1/2 bg-neutral-100 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <p className="text-neutral-500">{error}</p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={fetchTickets}>
            다시 시도
          </Button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
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
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
            />
          </svg>
          <p className="text-neutral-500 font-medium">접수된 민원이 없습니다.</p>
          <p className="text-sm text-neutral-400 mt-1">불편한 사항을 접수해보세요.</p>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl shadow-sm p-4"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                  {CATEGORY_LABELS[ticket.category]}
                </span>
                <Badge variant={STATUS_VARIANTS[ticket.status]}>
                  {STATUS_LABELS[ticket.status]}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-neutral-900 truncate mb-1">
                {ticket.title}
              </p>
              <p className="text-sm text-neutral-500 line-clamp-2 mb-2">
                {ticket.description}
              </p>
              <p className="text-xs text-neutral-400">
                {formatDate(ticket.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

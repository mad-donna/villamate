'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { apiFetch } from '@/lib/client-api';

interface Poll {
  id: string;
  title: string;
  description: string | null;
  isAnonymous: boolean;
  endDate: string;
  createdAt: string;
  optionCount: number;
  voteCount: number;
  isClosed: boolean;
  totalHouseholds: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ResidentPollsPage() {
  const router = useRouter();
  const [villaId, setVillaId] = useState('');
  const [polls, setPolls] = useState<Poll[]>([]);
  const [totalHouseholds, setTotalHouseholds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { residentVilla?: { id?: string }; villa?: { id?: string } };
    setVillaId(user.residentVilla?.id ?? user.villa?.id ?? '');
  }, []);

  const fetchPolls = useCallback(async () => {
    if (!villaId) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/api/villas/${villaId}/polls`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json() as { polls: Poll[]; totalHouseholds: number };
      setTotalHouseholds(data.totalHouseholds);
      setPolls(data.polls.map((p) => ({ ...p, totalHouseholds: data.totalHouseholds })));
    } catch {
      setError('투표 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  useEffect(() => {
    if (villaId) fetchPolls();
  }, [villaId, fetchPolls]);

  const active = polls.filter((p) => !p.isClosed);
  const closed = polls.filter((p) => p.isClosed);

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-neutral-900">전자투표</h1>
      </div>

      {loading ? (
        <div className="px-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-neutral-200 rounded mb-2" />
              <div className="h-3 w-1/3 bg-neutral-100 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <p className="text-neutral-500">{error}</p>
          <button type="button" className="mt-3 text-sm text-primary-600 font-medium" onClick={fetchPolls}>
            다시 시도
          </button>
        </div>
      ) : polls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <svg className="w-12 h-12 text-neutral-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
          </svg>
          <p className="text-neutral-500 font-medium">등록된 투표가 없습니다.</p>
        </div>
      ) : (
        <div className="px-4 space-y-6">
          {active.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-1">진행중</p>
              <div className="space-y-3">
                {active.map((poll) => (
                  <PollCard key={poll.id} poll={poll} onClick={() => router.push(`/villa/polls/${poll.id}`)} />
                ))}
              </div>
            </div>
          )}
          {closed.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-1">마감</p>
              <div className="space-y-3">
                {closed.map((poll) => (
                  <PollCard key={poll.id} poll={poll} onClick={() => router.push(`/villa/polls/${poll.id}`)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function PollCard({ poll, onClick }: { poll: Poll; onClick: () => void }) {
  const participationRate = poll.totalHouseholds > 0
    ? Math.round((poll.voteCount / poll.totalHouseholds) * 100)
    : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white rounded-2xl shadow-sm p-4 text-left hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-semibold text-neutral-900 flex-1">{poll.title}</p>
        <Badge variant={poll.isClosed ? 'neutral' : 'success'}>
          {poll.isClosed ? '마감' : '진행중'}
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-xs text-neutral-400 mt-2">
        <span>마감 {formatDate(poll.endDate)}</span>
        <span>·</span>
        <span>{poll.isAnonymous ? '익명' : '기명'}</span>
      </div>
      {poll.totalHouseholds > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-neutral-500">참여율</span>
            <span className="font-medium text-neutral-700">
              {poll.voteCount}/{poll.totalHouseholds}세대 ({participationRate}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${poll.isClosed ? 'bg-neutral-400' : 'bg-primary-500'}`}
              style={{ width: `${participationRate}%` }}
            />
          </div>
        </div>
      )}
    </button>
  );
}

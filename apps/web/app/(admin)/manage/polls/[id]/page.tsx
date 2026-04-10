'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';

interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  percent: number;
  roomNumbers: string[];
}

interface PollDetail {
  id: string;
  title: string;
  description: string | null;
  isAnonymous: boolean;
  endDate: string;
  createdAt: string;
  isClosed: boolean;
  totalVotes: number;
  options: PollOption[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminPollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: pollId } = use(params);
  const router = useRouter();
  const [villaId, setVillaId] = useState('');
  const [poll, setPoll] = useState<PollDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villa?: { id?: string } };
    setVillaId(user.villa?.id ?? '');
  }, []);

  useEffect(() => {
    if (!villaId || !pollId) return;
    setLoading(true);
    setError('');
    fetch(`/api/villas/${villaId}/polls/${pollId}`)
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed');
        return res.json() as Promise<{ poll: PollDetail }>;
      })
      .then((data) => setPoll(data.poll))
      .catch(() => setError('투표 정보를 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [villaId, pollId]);

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label="뒤로가기"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-neutral-900">투표 결과</h1>
      </div>

      {loading ? (
        <div className="px-4 space-y-4 animate-pulse">
          <div className="h-6 w-3/4 bg-neutral-200 rounded" />
          <div className="h-4 w-1/3 bg-neutral-100 rounded" />
          <div className="h-40 bg-neutral-100 rounded-2xl" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <p className="text-neutral-500">{error}</p>
        </div>
      ) : poll ? (
        <div className="px-4 space-y-4">
          {/* 헤더 카드 */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-start gap-2 mb-2">
              <h2 className="text-lg font-bold text-neutral-900 flex-1">{poll.title}</h2>
              <Badge variant={poll.isClosed ? 'neutral' : 'success'}>
                {poll.isClosed ? '마감' : '진행중'}
              </Badge>
            </div>
            {poll.description && (
              <p className="text-sm text-neutral-600 mb-3 whitespace-pre-wrap">{poll.description}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-400">
              <span>마감 {formatDate(poll.endDate)}</span>
              <span>{poll.isAnonymous ? '익명 투표' : '기명 투표'}</span>
              <span>총 {poll.totalVotes}세대 참여</span>
            </div>
          </div>

          {/* 결과 카드 */}
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
            <p className="text-sm font-semibold text-neutral-700">투표 결과</p>
            {poll.options.map((opt) => (
              <div key={opt.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-neutral-800">{opt.text}</span>
                  <span className="text-sm font-bold text-primary-600">{opt.percent}%</span>
                </div>
                <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${opt.percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-neutral-400">{opt.voteCount}표</span>
                  {/* 기명 투표 시 호수 표시 */}
                  {!poll.isAnonymous && opt.roomNumbers.length > 0 && (
                    <span className="text-xs text-neutral-400">
                      {opt.roomNumbers.sort().join(', ')}호
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
}

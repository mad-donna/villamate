'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiFetch } from '@/lib/client-api';

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

export default function ResidentPollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: pollId } = use(params);
  const router = useRouter();

  const [villaId, setVillaId] = useState('');
  const [poll, setPoll] = useState<PollDetail | null>(null);
  const [myVotedOptionId, setMyVotedOptionId] = useState<string | null>(null);
  const [isHead, setIsHead] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { residentVilla?: { id?: string }; villa?: { id?: string } };
    setVillaId(user.residentVilla?.id ?? user.villa?.id ?? '');
  }, []);

  useEffect(() => {
    if (!villaId || !pollId) return;
    setLoading(true);
    setError('');
    apiFetch(`/api/villas/${villaId}/polls/${pollId}`)
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed');
        return res.json() as Promise<{
          poll: PollDetail;
          myVotedOptionId: string | null;
          isHead: boolean;
        }>;
      })
      .then((data) => {
        setPoll(data.poll);
        setMyVotedOptionId(data.myVotedOptionId);
        setIsHead(data.isHead);
      })
      .catch(() => setError('투표 정보를 불러오는 데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [villaId, pollId]);

  async function handleVote() {
    if (!selectedOptionId || !villaId || !poll) return;
    setVoting(true);
    setVoteError('');
    try {
      const res = await apiFetch(`/api/villas/${villaId}/polls/${pollId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ optionId: selectedOptionId }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? '투표에 실패했습니다.');

      // 투표 후 서버에서 최신 결과 재조회 (낙관적 업데이트 시 퍼센트 오차 방지)
      setMyVotedOptionId(selectedOptionId);
      const refreshed = await apiFetch(`/api/villas/${villaId}/polls/${pollId}`);
      if (refreshed.ok) {
        const refreshedData = await refreshed.json() as { poll: PollDetail; myVotedOptionId: string | null; isHead: boolean };
        setPoll(refreshedData.poll);
      }
    } catch (e) {
      setVoteError(e instanceof Error ? e.message : '투표에 실패했습니다.');
    } finally {
      setVoting(false);
    }
  }

  const hasVoted = myVotedOptionId !== null;
  const showResults = hasVoted || (poll?.isClosed ?? false);

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
        <h1 className="text-xl font-bold text-neutral-900">전자투표</h1>
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
            </div>
          </div>

          {/* 투표 / 결과 */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            {showResults ? (
              /* 결과 표시 */
              <div className="space-y-4">
                <p className="text-sm font-semibold text-neutral-700">
                  투표 결과 · 총 {poll.totalVotes}세대 참여
                </p>
                {poll.options.map((opt) => {
                  const isMyVote = opt.id === myVotedOptionId;
                  return (
                    <div key={opt.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {isMyVote && (
                            <svg className="w-4 h-4 text-primary-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className={`text-sm ${isMyVote ? 'font-semibold text-primary-700' : 'text-neutral-800'}`}>
                            {opt.text}
                          </span>
                        </div>
                        <span className={`text-sm font-bold ${isMyVote ? 'text-primary-600' : 'text-neutral-500'}`}>
                          {opt.percent}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isMyVote ? 'bg-primary-500' : 'bg-neutral-300'}`}
                          style={{ width: `${opt.percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-400 mt-0.5 block">{opt.voteCount}표</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* 투표 폼 */
              <div>
                <p className="text-sm font-semibold text-neutral-700 mb-3">선택지</p>
                {!isHead && (
                  <div className="mb-3 bg-warning-50 border border-warning-200 rounded-xl px-3 py-2.5">
                    <p className="text-xs text-warning-700 font-medium">세대주만 투표할 수 있습니다.</p>
                  </div>
                )}
                <div className="space-y-2">
                  {poll.options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={!isHead || poll.isClosed}
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={[
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left',
                        selectedOptionId === opt.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 bg-white hover:bg-neutral-50',
                        (!isHead || poll.isClosed) ? 'opacity-60 cursor-default' : 'cursor-pointer',
                      ].join(' ')}
                    >
                      <span className={[
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                        selectedOptionId === opt.id ? 'border-primary-500' : 'border-neutral-300',
                      ].join(' ')}>
                        {selectedOptionId === opt.id && (
                          <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                        )}
                      </span>
                      <span className="text-sm text-neutral-800">{opt.text}</span>
                    </button>
                  ))}
                </div>
                {voteError && <p className="text-xs text-error-500 mt-2">{voteError}</p>}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* 투표 버튼 (투표 전 + 세대주 + 진행중) */}
      {poll && !showResults && isHead && !poll.isClosed && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 pb-4 pt-3 bg-neutral-50 border-t border-neutral-100">
          <Button
            className="w-full"
            size="lg"
            loading={voting}
            disabled={!selectedOptionId}
            onClick={handleVote}
          >
            투표하기
          </Button>
        </div>
      )}
    </main>
  );
}

'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

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

function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

  // 독촉 알림
  const [reminding, setReminding] = useState(false);
  const [remindResult, setRemindResult] = useState<string | null>(null);

  // 수정 시트
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsAnonymous, setEditIsAnonymous] = useState(false);
  const [editEndDate, setEditEndDate] = useState('');
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villa?: { id?: string } };
    setVillaId(user.villa?.id ?? '');
  }, []);

  function loadPoll() {
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
  }

  useEffect(() => {
    loadPoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [villaId, pollId]);

  function openEdit() {
    if (!poll) return;
    setEditTitle(poll.title);
    setEditDescription(poll.description ?? '');
    setEditIsAnonymous(poll.isAnonymous);
    setEditEndDate(toDatetimeLocalValue(poll.endDate));
    setEditError('');
    setEditOpen(true);
  }

  async function handleSaveEdit() {
    setEditError('');
    if (!editTitle.trim()) {
      setEditError('제목을 입력해주세요.');
      return;
    }
    if (!editEndDate || new Date(editEndDate) <= new Date()) {
      setEditError('종료일은 현재 시간 이후여야 합니다.');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token') ?? '';
      const res = await fetch(`/api/villas/${villaId}/polls/${pollId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          isAnonymous: editIsAnonymous,
          endDate: new Date(editEndDate).toISOString(),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? '수정에 실패했습니다.');
      setEditOpen(false);
      loadPoll();
    } catch (e) {
      setEditError(e instanceof Error ? e.message : '수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemind() {
    if (!villaId || !pollId) return;
    setReminding(true);
    setRemindResult(null);
    try {
      const token = localStorage.getItem('token') ?? '';
      const res = await fetch(`/api/villas/${villaId}/polls/${pollId}/remind`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { sent?: number; message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? '발송에 실패했습니다.');
      if (data.sent === 0) {
        setRemindResult('미참여 세대가 없습니다.');
      } else {
        setRemindResult(`${data.sent}세대에 독촉 알림을 발송했습니다.`);
      }
    } catch (e) {
      setRemindResult(e instanceof Error ? e.message : '발송에 실패했습니다.');
    } finally {
      setReminding(false);
    }
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <div className="flex items-center gap-2">
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
        {/* 수정 버튼 — 진행 중인 투표만 */}
        {poll && !poll.isClosed && (
          <button
            type="button"
            onClick={openEdit}
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 min-h-[44px] px-2"
          >
            수정
          </button>
        )}
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
                  {!poll.isAnonymous && opt.roomNumbers.length > 0 && (
                    <span className="text-xs text-neutral-400">
                      {opt.roomNumbers.sort().join(', ')}호
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 독촉 알림 (진행 중인 투표만) */}
          {!poll.isClosed && (
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-sm font-semibold text-neutral-700 mb-1">미참여 세대 독촉</p>
              <p className="text-xs text-neutral-400 mb-3">
                아직 투표하지 않은 세대주에게 알림을 발송합니다.
              </p>
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                loading={reminding}
                onClick={handleRemind}
              >
                독촉 알림 발송
              </Button>
              {remindResult && (
                <p className="text-xs text-center mt-2 text-neutral-600 font-medium">
                  {remindResult}
                </p>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* 수정 바텀 시트 */}
      {editOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setEditOpen(false)}
        >
          <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 space-y-4 max-h-[85dvh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">투표 수정</h2>
              <button
                onClick={() => setEditOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-400 hover:text-neutral-600"
                aria-label="닫기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <Input
              label="제목"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="투표 제목"
              maxLength={100}
            />

            <Textarea
              label="설명 (선택)"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="투표에 대한 설명"
              rows={3}
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">종료일</label>
              <input
                type="datetime-local"
                value={editEndDate}
                min={minDate}
                onChange={(e) => setEditEndDate(e.target.value)}
                className="w-full text-sm border border-neutral-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between bg-neutral-50 rounded-2xl px-4 py-3">
              <div>
                <p className="text-sm font-medium text-neutral-800">익명 투표</p>
                <p className="text-xs text-neutral-400 mt-0.5">호수를 결과에 표시하지 않습니다</p>
              </div>
              <button
                type="button"
                onClick={() => setEditIsAnonymous((v) => !v)}
                className={[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  editIsAnonymous ? 'bg-primary-600' : 'bg-neutral-300',
                ].join(' ')}
                role="switch"
                aria-checked={editIsAnonymous}
              >
                <span
                  className={[
                    'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
                    editIsAnonymous ? 'translate-x-6' : 'translate-x-1',
                  ].join(' ')}
                />
              </button>
            </div>

            {editError && <p className="text-sm text-red-500">{editError}</p>}

            <Button className="w-full" size="lg" loading={saving} onClick={handleSaveEdit}>
              저장하기
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

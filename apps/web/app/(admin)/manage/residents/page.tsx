'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { useConfirm } from '@/hooks/useConfirm';

interface ResidentUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

interface Resident {
  id: string;
  userId: string;
  roomNumber: string;
  residentType: 'HEAD' | 'MEMBER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  joinedAt: string;
  user: ResidentUser;
}

export default function ResidentsPage() {
  const [villaId, setVillaId] = useState<string>('');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [residents, setResidents] = useState<Resident[]>([]);
  const [pendingResidents, setPendingResidents] = useState<Resident[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { confirm: confirmMoveOut, dialog: confirmDialog } = useConfirm();

  // 호수 관리 BottomSheet 상태
  const [sheetOpen, setSheetOpen] = useState(false);
  const [roomNumbers, setRoomNumbers] = useState<string[]>([]);
  const [newRoom, setNewRoom] = useState('');
  const [newRoomError, setNewRoomError] = useState('');
  const [savingRooms, setSavingRooms] = useState(false);
  const newRoomInputRef = useRef<HTMLInputElement>(null);

  // localStorage에서 user 정보 로드 및 목록 fetch
  useEffect(() => {
    const raw = localStorage.getItem('user') ?? '{}';
    const user = JSON.parse(raw) as { villa?: { id?: string; inviteCode?: string } };
    setVillaId(user.villa?.id ?? '');
    setInviteCode(user.villa?.inviteCode ?? '');
  }, []);

  // 호수 목록 로드 (villaId 세팅 이후)
  useEffect(() => {
    if (!villaId) return;
    async function fetchRooms() {
      try {
        const res = await fetch(`/api/villas/${villaId}`);
        if (!res.ok) return;
        const data = await res.json() as { roomNumbers?: string[] };
        setRoomNumbers(data.roomNumbers ?? []);
      } catch {
        // silently fail — non-critical
      }
    }
    fetchRooms();
  }, [villaId]);

  const fetchResidents = useCallback(async () => {
    if (!villaId) return;
    setLoading(true);
    try {
      // APPROVED 목록과 PENDING 목록을 병렬로 조회
      const [approvedRes, pendingRes] = await Promise.all([
        fetch(`/api/villas/${villaId}/residents`),
        fetch(`/api/villas/${villaId}/residents?status=PENDING`),
      ]);

      if (!approvedRes.ok) throw new Error('fetch failed');
      const approvedData = await approvedRes.json() as { residents: Resident[] };
      setResidents(approvedData.residents);

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json() as { residents: Resident[] };
        setPendingResidents(pendingData.residents);
      }
    } catch {
      showToast('목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  useEffect(() => {
    if (villaId) {
      fetchResidents();
    }
  }, [villaId, fetchResidents]);

  // 로컬 필터 — API 재호출 없이 검색어로 필터링
  const filtered = residents.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      r.user.name.toLowerCase().includes(q) ||
      r.roomNumber.toLowerCase().includes(q)
    );
  });

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }

  async function handleCopyInviteCode() {
    if (!inviteCode) {
      showToast('초대 코드를 불러올 수 없습니다.');
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteCode);
      showToast('복사됨!');
    } catch {
      showToast('복사에 실패했습니다.');
    }
  }

  // 호수 추가
  function handleAddRoom() {
    const trimmed = newRoom.trim().replace(/호$/u, '');
    if (!trimmed) {
      setNewRoomError('호수를 입력해주세요.');
      return;
    }
    if (roomNumbers.includes(trimmed)) {
      setNewRoomError('이미 등록된 호수입니다.');
      return;
    }
    setRoomNumbers((prev) => [...prev, trimmed].sort());
    setNewRoom('');
    setNewRoomError('');
    newRoomInputRef.current?.focus();
  }

  // 호수 저장
  async function handleSaveRooms() {
    if (!villaId) return;
    setSavingRooms(true);
    try {
      const res = await fetch(`/api/villas/${villaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomNumbers }),
      });
      if (!res.ok) throw new Error('저장에 실패했습니다.');
      showToast('호수 목록이 저장되었습니다.');
      setSheetOpen(false);
      await fetchResidents();
    } catch {
      showToast('저장에 실패했습니다.');
    } finally {
      setSavingRooms(false);
    }
  }

  // 입주 신청 승인/거절
  async function handleApproval(resident: Resident, status: 'APPROVED' | 'REJECTED') {
    setApprovingId(resident.id);
    try {
      const token = localStorage.getItem('token') ?? '';
      const res = await fetch(`/api/villas/${villaId}/residents/${resident.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? '처리에 실패했습니다.');
      }

      showToast(status === 'APPROVED' ? '승인되었습니다.' : '거절되었습니다.');
      await fetchResidents();
    } catch (e) {
      showToast(e instanceof Error ? e.message : '처리에 실패했습니다.');
    } finally {
      setApprovingId(null);
    }
  }

  async function handleMoveOut(resident: Resident) {
    const confirmed = await confirmMoveOut({
      title: '전출 처리',
      description: `${resident.roomNumber}호 ${resident.user.name}님을 전출 처리하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
      confirmLabel: '전출',
      variant: 'destructive',
    });
    if (!confirmed) return;

    setDeletingId(resident.id);
    try {
      const res = await fetch(`/api/villas/${villaId}/residents/${resident.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? '전출 처리에 실패했습니다.');
      }
      showToast('전출 처리가 완료되었습니다.');
      await fetchResidents();
    } catch (e) {
      showToast(e instanceof Error ? e.message : '전출 처리에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      {confirmDialog}
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-neutral-900">입주민 관리</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSheetOpen(true)}
          >
            호수 관리
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyInviteCode}
          >
            초대 코드 복사
          </Button>
        </div>
      </div>

      {/* PENDING 입주 신청 섹션 — 신청이 있을 때만 표시 */}
      {!loading && pendingResidents.length > 0 && (
        <div className="px-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-bold text-neutral-900">입주 신청 대기</h2>
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-primary-500 text-white text-xs font-bold px-1.5">
              {pendingResidents.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {pendingResidents.map((resident) => (
              <div
                key={resident.id}
                className="bg-white rounded-2xl shadow-sm p-4 border border-primary-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">
                      {resident.roomNumber}호{' '}
                      <span className="font-medium text-neutral-700">
                        {resident.user.name}
                      </span>
                    </p>
                    {resident.user.phone && (
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {resident.user.phone}
                      </p>
                    )}
                  </div>
                  <Badge variant="warning" className="text-amber-700 bg-amber-100 border-0">
                    대기 중
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    loading={approvingId === resident.id}
                    disabled={approvingId !== null}
                    onClick={() => handleApproval(resident, 'APPROVED')}
                    className="flex-1"
                  >
                    승인
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={approvingId === resident.id}
                    disabled={approvingId !== null}
                    onClick={() => handleApproval(resident, 'REJECTED')}
                    className="flex-1 text-error-500 hover:bg-red-50"
                  >
                    거절
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 검색 Input */}
      <div className="px-4 mb-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름 또는 호수 검색"
            className="w-full pl-9 pr-4 h-11 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="px-4 space-y-3">
        {loading ? (
          // 로딩 스켈레톤
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm p-4 animate-pulse"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-10 bg-neutral-200 rounded" />
                  <div className="h-5 w-12 bg-neutral-200 rounded-full" />
                </div>
                <div className="h-9 w-20 bg-neutral-200 rounded-xl" />
              </div>
              <div className="h-4 w-40 bg-neutral-200 rounded" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          // 빈 상태
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
                d="M17 20h5v-2a4 4 0 0 0-4-4h-1M9 20H4v-2a4 4 0 0 1 4-4h1m4-4a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm6-4a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            <p className="text-neutral-500 font-medium">
              {searchQuery.trim()
                ? '검색 결과가 없습니다.'
                : '등록된 입주민이 없습니다.'}
            </p>
            {!searchQuery.trim() && (
              <p className="text-sm text-neutral-400 mt-1">
                초대 코드를 공유해 입주민을 초대해보세요.
              </p>
            )}
          </div>
        ) : (
          // 입주민 카드 리스트
          filtered.map((resident) => (
            <div
              key={resident.id}
              className="bg-white rounded-2xl shadow-sm p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-bold text-neutral-900 shrink-0">
                    {resident.roomNumber}호
                  </span>
                  <Badge
                    variant={resident.residentType === 'HEAD' ? 'info' : 'neutral'}
                    className={
                      resident.residentType === 'HEAD'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-neutral-100 text-neutral-600'
                    }
                  >
                    {resident.residentType === 'HEAD' ? '세대주' : '세입자'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={deletingId === resident.id}
                  disabled={deletingId !== null}
                  onClick={() => handleMoveOut(resident)}
                  className="text-error-500 hover:bg-red-50 shrink-0 ml-2"
                >
                  전출 처리
                </Button>
              </div>
              <p className="text-sm text-neutral-600 mt-1.5 truncate">
                {resident.user.name}
                {resident.user.phone && (
                  <span className="text-neutral-400"> · {resident.user.phone}</span>
                )}
              </p>
            </div>
          ))
        )}
      </div>

      {/* 호수 관리 BottomSheet */}
      {sheetOpen && (
        <>
          {/* 오버레이 */}
          <div
            className="fixed inset-0 bg-black/40 z-70"
            onClick={() => setSheetOpen(false)}
          />
          {/* 시트 */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-80 flex flex-col max-h-[80vh]">
            {/* 핸들 */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-neutral-200" />
            </div>
            <div className="flex items-center justify-between px-5 pb-3 pt-2">
              <h2 className="text-lg font-bold text-neutral-900">세대 호수 관리</h2>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors"
                aria-label="닫기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 입력 영역 */}
            <div className="px-5 pb-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    ref={newRoomInputRef}
                    placeholder="호수 입력 (예: 101)"
                    value={newRoom}
                    onChange={(e) => {
                      setNewRoom(e.target.value);
                      setNewRoomError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddRoom();
                    }}
                    error={newRoomError}
                  />
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleAddRoom}
                  className="shrink-0 self-start mt-0"
                >
                  추가
                </Button>
              </div>
            </div>

            {/* 호수 칩 목록 */}
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              {roomNumbers.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-6">
                  등록된 호수가 없습니다.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {roomNumbers.map((room) => (
                    <Chip
                      key={room}
                      label={`${room}호`}
                      onRemove={() =>
                        setRoomNumbers((prev) => prev.filter((r) => r !== room))
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 저장 버튼 */}
            <div className="px-5 pb-8 pt-3 border-t border-neutral-100">
              <Button
                className="w-full"
                size="lg"
                loading={savingRooms}
                onClick={handleSaveRooms}
              >
                저장
              </Button>
            </div>
          </div>
        </>
      )}

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-20 left-0 right-0 mx-auto w-fit px-5 py-3 bg-neutral-800 text-white text-sm font-medium rounded-2xl shadow-lg z-60">
          {toast}
        </div>
      )}
    </main>
  );
}

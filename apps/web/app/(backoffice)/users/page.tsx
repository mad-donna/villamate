'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { boAuthHeaders } from '@/lib/backoffice-auth';

type Role = 'ADMIN' | 'RESIDENT' | 'SUPER_ADMIN';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  createdAt: string;
  isWithdrawn: boolean;
  managedVilla: { id: string; name: string } | null;
  residentRecordCount: number;
}

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: '동대표',
  RESIDENT: '입주민',
  SUPER_ADMIN: '슈퍼관리자',
};

const ROLE_BADGE: Record<Role, 'warning' | 'info' | 'neutral'> = {
  ADMIN: 'warning',
  RESIDENT: 'info',
  SUPER_ADMIN: 'neutral',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      const res = await fetch(`/api/backoffice/users?${params}`, {
        headers: boAuthHeaders(),
      });
      if (!res.ok) throw new Error('fetch failed');
      const data = (await res.json()) as User[];
      setUsers(data);
    } catch {
      setError('사용자 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [q, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const ROLES: (Role | 'ALL')[] = ['ALL', 'ADMIN', 'RESIDENT', 'SUPER_ADMIN'];
  const ROLE_ALL_LABEL: Record<string, string> = { ALL: '전체', ...ROLE_LABEL };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">사용자 목록</h1>
        <p className="text-sm text-neutral-500 mt-0.5">총 {users.length}명</p>
      </div>

      {/* 검색 + 필터 */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="이름 또는 이메일 검색"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={[
                'px-3 py-2 rounded-xl text-sm font-semibold border transition-colors whitespace-nowrap',
                roleFilter === r
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-neutral-500 border-neutral-300 hover:border-neutral-400',
              ].join(' ')}
            >
              {ROLE_ALL_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-neutral-500">
          <p>{error}</p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={fetchUsers}>
            다시 시도
          </Button>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <p>검색 결과가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100">
              <tr className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                <th className="px-4 py-3">이름</th>
                <th className="px-4 py-3">이메일</th>
                <th className="px-4 py-3">역할</th>
                <th className="px-4 py-3">연결 빌라</th>
                <th className="px-4 py-3">가입일</th>
                <th className="px-4 py-3">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={[
                    'hover:bg-neutral-50 transition-colors',
                    user.isWithdrawn ? 'opacity-50' : '',
                  ].join(' ')}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{user.name}</p>
                    {user.phone && (
                      <p className="text-xs text-neutral-400">{user.phone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 max-w-[180px] truncate">
                    {user.isWithdrawn ? '(탈퇴 회원)' : user.email}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={ROLE_BADGE[user.role]}>
                      {ROLE_LABEL[user.role]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {user.managedVilla ? (
                      <span className="text-xs">{user.managedVilla.name}</span>
                    ) : user.residentRecordCount > 0 ? (
                      <span className="text-xs text-neutral-400">
                        입주 {user.residentRecordCount}건
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {user.isWithdrawn ? (
                      <Badge variant="neutral">탈퇴</Badge>
                    ) : (
                      <Badge variant="success">정상</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

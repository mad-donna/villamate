import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { API_BASE_URL } from '../config';

interface RoleCount { role: string; count: number; }
interface StatusCount { status: string; count: number; }

interface Stats {
  totalUsers: number;
  usersByRole: RoleCount[];
  totalVillas: number;
  villasBySubscription: StatusCount[];
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: '관리자',
  RESIDENT: '입주민',
  SUPER_ADMIN: '슈퍼관리자',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: '구독 활성',
  NONE: '미구독',
  EXPIRED: '만료',
  TRIAL: '체험',
};

const BAR_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const PIE_COLORS = ['#3B82F6', '#E5E7EB', '#F59E0B', '#10B981'];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get(`${API_BASE_URL}/api/admin/stats`, { headers })
      .then((r) => setStats(r.data))
      .catch(() => setError('통계 데이터를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const activeVillas = stats?.villasBySubscription.find((s) => s.status === 'ACTIVE')?.count ?? 0;

  const kpiCards = stats
    ? [
        { label: '총 가입자 수', value: stats.totalUsers, icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: '총 등록 빌라 수', value: stats.totalVillas, icon: '🏢', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: '프리미엄 구독 빌라 수', value: activeVillas, icon: '⭐', color: 'text-amber-600', bg: 'bg-amber-50' },
      ]
    : [];

  const barData = (stats?.usersByRole ?? []).map((r) => ({
    name: ROLE_LABELS[r.role] ?? r.role,
    count: r.count,
  }));

  const pieData = (stats?.villasBySubscription ?? []).map((s) => ({
    name: STATUS_LABELS[s.status] ?? s.status,
    value: s.count,
  }));

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">대시보드</h2>
      <p className="text-sm text-gray-400 mb-6">전체 서비스 현황을 한눈에 확인하세요</p>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-500">{error}</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {kpiCards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center text-2xl shrink-0`}>
                  {card.icon}
                </div>
                <div>
                  <p className={`text-3xl font-bold ${card.color}`}>{card.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart — Villa subscription status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-1">빌라 구독 현황</h3>
              <p className="text-xs text-gray-400 mb-4">구독 상태별 빌라 비율</p>
              {pieData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-300 text-sm">데이터 없음</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name} (${value})`}
                      labelLine={false}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}개`, '']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Bar Chart — Users by role */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-1">역할별 사용자 수</h3>
              <p className="text-xs text-gray-400 mb-4">가입된 사용자의 역할 분포</p>
              {barData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-300 text-sm">데이터 없음</div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={barData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: '#F3F4F6' }}
                      formatter={(value: number) => [`${value.toLocaleString()}명`, '사용자 수']}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {barData.map((_, index) => (
                        <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

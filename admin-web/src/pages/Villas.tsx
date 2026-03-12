import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Villa {
  id: number;
  name: string;
  address: string;
  totalUnits: number;
  status: string;
  subscriptionStatus: string;
  subscriptionExpiry: string | null;
  admin: { id: string; name: string; email: string | null };
  _count: { residents: number };
  createdAt: string;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'APPROVED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        승인됨
      </span>
    );
  }
  if (status === 'REJECTED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        반려됨
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      승인 대기
    </span>
  );
}

const SUBSCRIPTION_LABELS: Record<string, string> = {
  ACTIVE: '구독 활성',
  FREE_TRIAL: '무료 체험',
  EXPIRED: '만료됨',
  NONE: '미구독',
};

function SubscriptionBadge({ status }: { status: string }) {
  if (status === 'ACTIVE') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        {SUBSCRIPTION_LABELS[status]}
      </span>
    );
  }
  if (status === 'FREE_TRIAL') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {SUBSCRIPTION_LABELS[status]}
      </span>
    );
  }
  if (status === 'EXPIRED') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        {SUBSCRIPTION_LABELS[status]}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      {SUBSCRIPTION_LABELS[status] ?? status}
    </span>
  );
}

export default function Villas() {
  const navigate = useNavigate();
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionUpdating, setSubscriptionUpdating] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  const fetchVillas = () => {
    const token = localStorage.getItem('admin_token');
    axios
      .get(`${API_BASE_URL}/api/admin/villas`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setVillas(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVillas();
  }, []);

  const updateStatus = async (villaId: number, status: 'APPROVED' | 'REJECTED') => {
    const token = localStorage.getItem('admin_token');
    try {
      await axios.patch(
        `${API_BASE_URL}/api/admin/villas/${villaId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchVillas();
    } catch (err) {
      console.error('Status update failed:', err);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const updateSubscription = async (villaId: number, status: string) => {
    const token = localStorage.getItem('admin_token');
    setSubscriptionUpdating(villaId);
    setSuccessId(null);
    try {
      await axios.patch(
        `${API_BASE_URL}/api/admin/villas/${villaId}/subscription`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessId(villaId);
      fetchVillas();
      setTimeout(() => setSuccessId(null), 2000);
    } catch (err) {
      console.error('Subscription update failed:', err);
      alert('구독 상태 변경에 실패했습니다.');
    } finally {
      setSubscriptionUpdating(null);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">빌라 관리</h2>
      {loading ? (
        <p className="text-gray-400">불러오는 중...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">빌라명</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주소</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 세대</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">입주자</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리자</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구독</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구독 변경</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등록일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {villas.map((villa) => (
                <tr key={villa.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/villas/${villa.id}`)}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                    >
                      {villa.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{villa.address}</td>
                  <td className="px-4 py-3 text-gray-700">{villa.totalUnits}세대</td>
                  <td className="px-4 py-3 text-gray-700">{villa._count.residents}명</td>
                  <td className="px-4 py-3 text-gray-500">{villa.admin.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={villa.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <SubscriptionBadge status={villa.subscriptionStatus} />
                      {villa.subscriptionExpiry && (
                        <span className="text-xs text-gray-400">
                          {new Date(villa.subscriptionExpiry).toLocaleDateString('ko-KR')} 만료
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={villa.subscriptionStatus}
                        disabled={subscriptionUpdating === villa.id}
                        onChange={(e) => updateSubscription(villa.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="NONE">미구독</option>
                        <option value="FREE_TRIAL">무료 체험</option>
                        <option value="ACTIVE">구독 활성</option>
                        <option value="EXPIRED">만료됨</option>
                      </select>
                      {subscriptionUpdating === villa.id && (
                        <span className="text-xs text-gray-400">저장 중...</span>
                      )}
                      {successId === villa.id && (
                        <span className="text-xs text-green-600 font-medium">저장됨</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(villa.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/villas/${villa.id}`)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        상세 보기
                      </button>
                      {villa.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => updateStatus(villa.id, 'APPROVED')}
                            className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1.5 rounded-lg transition-colors font-medium"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => updateStatus(villa.id, 'REJECTED')}
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded-lg transition-colors font-medium"
                          >
                            반려
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {villas.length === 0 && (
            <p className="text-center text-gray-400 py-8">빌라가 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
}

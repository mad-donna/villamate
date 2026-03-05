import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface VillaInfo {
  id: number;
  name: string;
  address: string;
  totalUnits: number;
  accountNumber: string;
  bankName: string;
}

interface ResidentUser {
  recordId: number;
  roomNumber: string;
  joinedAt: string;
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
}

export default function VillaDetail() {
  const { villaId } = useParams<{ villaId: string }>();
  const navigate = useNavigate();
  const [villa, setVilla] = useState<VillaInfo | null>(null);
  const [users, setUsers] = useState<ResidentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    axios
      .get(`${API_BASE_URL}/api/admin/villas/${villaId}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setVilla(res.data.villa);
        setUsers(res.data.users);
      })
      .catch((err) => {
        setError(err.response?.data?.error || '데이터를 불러오는 데 실패했습니다.');
      })
      .finally(() => setLoading(false));
  }, [villaId]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  if (error || !villa) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate('/villas')}
          className="mb-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          ← 목록으로 돌아가기
        </button>
        <p className="text-red-500">{error || '빌라를 찾을 수 없습니다.'}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Back button */}
      <button
        onClick={() => navigate('/villas')}
        className="mb-6 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        ← 목록으로 돌아가기
      </button>

      {/* Villa info card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{villa.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{villa.address}</p>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium">
            총 {villa.totalUnits}세대
          </span>
        </div>
        <div className="mt-4 flex gap-6 text-sm text-gray-600">
          <span>🏦 {villa.bankName}</span>
          <span>계좌 {villa.accountNumber}</span>
          <span>입주자 {users.length}명</span>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">입주자 목록</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">호수</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전화번호</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">입주일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.recordId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{user.roomNumber}</td>
                <td className="px-4 py-3 text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-500">{user.email || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{user.phone || '-'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {user.role === 'ADMIN' ? '관리자' : '입주자'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(user.joinedAt).toLocaleDateString('ko-KR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center text-gray-400 py-8">등록된 입주자가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

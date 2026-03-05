import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Villa {
  id: number;
  name: string;
  address: string;
  totalUnits: number;
  admin: { id: string; name: string; email: string | null };
  _count: { residents: number };
  createdAt: string;
}

export default function Villas() {
  const navigate = useNavigate();
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    axios
      .get(`${API_BASE_URL}/api/admin/villas`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setVillas(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(villa.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/villas/${villa.id}`)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      상세 보기
                    </button>
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

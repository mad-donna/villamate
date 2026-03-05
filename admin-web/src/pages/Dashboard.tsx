import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Stats {
  users: number;
  villas: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ users: 0, villas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${API_BASE_URL}/api/admin/users`, { headers }),
      axios.get(`${API_BASE_URL}/api/admin/villas`, { headers }),
    ])
      .then(([usersRes, villasRes]) => {
        setStats({ users: usersRes.data.length, villas: villasRes.data.length });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: '전체 사용자', value: stats.users, icon: '👥' },
    { label: '등록된 빌라', value: stats.villas, icon: '🏢' },
  ];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">대시보드</h2>

      {loading ? (
        <p className="text-gray-400">불러오는 중...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

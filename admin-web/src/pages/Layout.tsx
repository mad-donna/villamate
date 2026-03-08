import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const navSections = [
  {
    title: '플랫폼 운영',
    items: [
      { to: '/dashboard', label: '대시보드', icon: '📊' },
      { to: '/villas', label: '빌라 관리', icon: '🏢' },
      { to: '/users', label: '사용자 관리', icon: '👥' },
    ],
  },
  {
    title: '콘텐츠 관리',
    items: [
      { to: '/notices', label: '공지사항', icon: '📢' },
      { to: '/faqs', label: 'FAQ', icon: '❓' },
      { to: '/guides', label: '매거진/가이드', icon: '📚' },
    ],
  },
];

export default function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Villamate</h1>
          <p className="text-xs text-gray-400">백오피스</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                      }`
                    }
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2 truncate">{user.name || '관리자'}</p>
          <button
            onClick={handleLogout}
            className="w-full text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-left"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

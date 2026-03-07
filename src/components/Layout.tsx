import { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { RefreshCw, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const routeTitles: Record<string, { title: string }> = {
  '/': { title: 'Business Metrics' },
  '/pipeline': { title: 'Deals' },
  '/companies': { title: 'Companies' },
  '/contacts': { title: 'People' },
  '/activities': { title: 'Activities' },
  '/risk-flags': { title: 'Risk Flags' },
  '/settings': { title: 'Settings' },
};

export default function Layout() {
  const location = useLocation();
  const { dbUser, logout } = useAuth();
  const { refreshData } = useData();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const pathBase = '/' + (location.pathname.split('/')[1] || '');
  const route = routeTitles[pathBase] || routeTitles['/'];
  const isDetail = location.pathname.split('/').length > 2;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = dbUser ? `${dbUser.first_name[0]}${dbUser.last_name[0]}` : '??';

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="ml-[232px] flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-[46px] border-b border-gray-200 flex items-center justify-between px-5 bg-white shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-2 text-[13px]">
            {isDetail && route && (
              <>
                <Link to={pathBase} className="text-gray-400 hover:text-gray-600">{route.title}</Link>
                <span className="text-gray-300">/</span>
              </>
            )}
            <span className="text-gray-900 font-medium">{isDetail ? 'Detail' : route?.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshData()}
              className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
            {/* User avatar + dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 hover:bg-gray-50 rounded-md px-1.5 py-1 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-semibold text-violet-700">
                  {initials}
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-[220px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="text-[12px] font-medium text-gray-900">
                      {dbUser?.first_name} {dbUser?.last_name}
                    </div>
                    <div className="text-[11px] text-gray-500">{dbUser?.email}</div>
                    <div className="text-[10px] text-violet-600 mt-0.5">{dbUser?.role}</div>
                  </div>
                  <button
                    onClick={() => { setShowUserMenu(false); logout(); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

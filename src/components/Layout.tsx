import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { RefreshCw } from 'lucide-react';

const routeTitles: Record<string, { title: string; parent?: string; parentPath?: string }> = {
  '/': { title: 'Business Metrics' },
  '/pipeline': { title: 'Deals' },
  '/companies': { title: 'Companies' },
  '/contacts': { title: 'People' },
  '/risk-flags': { title: 'Risk Flags' },
  '/settings': { title: 'Settings' },
};

export default function Layout() {
  const location = useLocation();

  const pathBase = '/' + (location.pathname.split('/')[1] || '');
  const route = routeTitles[pathBase] || routeTitles['/'];
  const isDetail = location.pathname.split('/').length > 2;

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
            <button className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-3 h-3" />
              Refresh data
            </button>
            <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-semibold text-violet-700">
              NK
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

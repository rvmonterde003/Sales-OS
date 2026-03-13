import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { RefreshCw } from 'lucide-react';
import { useData } from '../context/DataContext';

const routeTitles: Record<string, { title: string }> = {
  '/': { title: 'Dashboard' },
  '/metrics': { title: 'Business Metrics' },
  '/deals': { title: 'Deals' },
  '/pipeline': { title: 'Pipeline View' },
  '/leads': { title: 'Leads' },
  '/companies': { title: 'Law Firms' },
  '/contacts': { title: 'People' },
  '/activities': { title: 'Activities' },
  '/risk-flags': { title: 'Risk Flags' },
  '/how-to': { title: 'How To' },
  '/profile': { title: 'Profile' },
};

export default function Layout() {
  const location = useLocation();
  const { refreshData } = useData();

  const pathBase = '/' + (location.pathname.split('/')[1] || '');
  const route = routeTitles[pathBase] || routeTitles['/'];
  const isDetail = location.pathname.split('/').length > 2;

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="ml-[232px] flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-[46px] border-b border-gray-200 flex items-center justify-between px-5 bg-white shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-2 text-[13px]">
            {isDetail && route && (
              <>
                <span className="text-gray-400">{route.title}</span>
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
          </div>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Kanban,
  Building2,
  Users,
  AlertTriangle,
  Scale,
  ChevronDown,
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  LogOut,
  HelpCircle,
  CircleDollarSign,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const recordItems = [
  { to: '/leads', icon: Users, label: 'Leads', color: 'bg-cyan-500' },
  { to: '/companies', icon: Building2, label: 'Law Firms', color: 'bg-purple-500' },
  { to: '/contacts', icon: Users, label: 'Contacts', color: 'bg-green-500' },
  { to: '/deals', icon: CircleDollarSign, label: 'Deals', color: 'bg-orange-400' },
  { to: '/pipeline', icon: Kanban, label: 'Pipeline View', color: 'bg-indigo-400' },
];

export default function Sidebar() {
  const location = useLocation();
  const { dbUser, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const initials = dbUser ? `${dbUser.first_name[0]}${dbUser.last_name[0]}` : '??';

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  return (
    <>
      <aside className="fixed left-0 top-0 bottom-0 w-[232px] bg-white border-r border-gray-200 flex flex-col z-50 select-none">
        {/* Logo */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <Scale className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-semibold text-gray-900">Sales OS</span>
            <ChevronDown className="w-3 h-3 text-gray-400 ml-auto" />
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="space-y-0.5 pb-3">
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={isActive('/')} end />
            <SidebarLink to="/metrics" icon={BarChart3} label="Business Metrics" active={isActive('/metrics')} />
            <SidebarLink to="/activities" icon={MessageSquare} label="Activities" active={isActive('/activities')} />
            <SidebarLink to="/risk-flags" icon={AlertTriangle} label="Risk Flags" active={isActive('/risk-flags')} />
          </div>

          <div className="pb-3">
            <div className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              <ChevronDown className="w-3 h-3" />
              Records
            </div>
            <div className="mt-0.5 space-y-0.5">
              {recordItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`sidebar-item flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] ${
                    isActive(item.to) ? 'active font-medium' : 'text-gray-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded ${item.color} flex items-center justify-center`}>
                    <item.icon className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                  </span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {/* How To */}
        <div className="px-3 pb-1">
          <SidebarLink to="/how-to" icon={HelpCircle} label="How To" active={isActive('/how-to')} />
        </div>

        {/* Footer: Profile */}
        <div className="px-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <NavLink to="/profile" className="flex items-center gap-2 flex-1 min-w-0 rounded-md hover:bg-gray-50 -mx-1 px-1 py-0.5 transition-colors">
              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-semibold text-violet-700 shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-gray-900 truncate">{dbUser?.first_name} {dbUser?.last_name}</div>
                <div className="text-[10px] text-gray-400 truncate">{dbUser?.email}</div>
              </div>
            </NavLink>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[200]" onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[340px]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-[15px] font-semibold text-gray-900">Sign out</h2>
              <p className="text-[12px] text-gray-500 mt-1">Are you sure you want to sign out?</p>
            </div>
            <div className="flex justify-end gap-2 p-4">
              <button onClick={() => setShowLogoutConfirm(false)}
                className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
              <button onClick={handleLogout}
                className="px-3 py-1.5 text-[13px] text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors font-medium">Sign out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SidebarLink({
  to, icon: Icon, label, active, end,
}: {
  to: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; active: boolean; end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={`sidebar-item flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] ${
        active ? 'active font-medium' : 'text-gray-700'
      }`}
    >
      <Icon className={`w-3.5 h-3.5 ${active ? 'text-violet-600' : 'text-gray-400'}`} strokeWidth={active ? 2 : 1.5} />
      {label}
    </NavLink>
  );
}

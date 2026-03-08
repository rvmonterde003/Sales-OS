import { NavLink, useLocation } from 'react-router-dom';
import {
  Kanban,
  Building2,
  Users,
  AlertTriangle,
  Settings,
  Scale,
  ChevronDown,
  BarChart3,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';

const recordItems = [
  { to: '/companies', icon: Building2, label: 'Companies', color: 'bg-purple-500' },
  { to: '/contacts', icon: Users, label: 'Contacts', color: 'bg-green-500' },
  { to: '/pipeline', icon: Kanban, label: 'Deals', color: 'bg-orange-400' },
];

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[232px] bg-white border-r border-gray-200 flex flex-col z-50 select-none">
      {/* Logo / Workspace */}
      <div className="px-3 pt-3 pb-1">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
            <Scale className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[13px] font-semibold text-gray-900">Sales OS</span>
          <ChevronDown className="w-3 h-3 text-gray-400 ml-auto" />
        </div>
      </div>

      {/* Main nav scroll area */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {/* Top nav items */}
        <div className="space-y-0.5 pb-3">
          <SidebarLink to="/" icon={BarChart3} label="Business Metrics" active={isActive('/')} end />
          <SidebarLink to="/revenue" icon={TrendingUp} label="Revenue Timeline" active={isActive('/revenue')} />
          <SidebarLink to="/activities" icon={MessageSquare} label="Activities" active={isActive('/activities')} />
          <SidebarLink to="/risk-flags" icon={AlertTriangle} label="Risk Flags" active={isActive('/risk-flags')} />
        </div>

        {/* Records */}
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

      {/* Footer */}
      <div className="px-3 py-3 border-t border-gray-100">
        <NavLink
          to="/settings"
          className={`sidebar-item flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] ${
            isActive('/settings') ? 'active font-medium' : 'text-gray-500'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          Settings
        </NavLink>
      </div>
    </aside>
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

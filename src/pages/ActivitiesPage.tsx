import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../lib/helpers';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import ActivityLogModal from '../components/ActivityLogModal';
import { Plus, Search } from 'lucide-react';

export default function ActivitiesPage() {
  const { activities, companies, getUserName } = useData();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showLog, setShowLog] = useState(false);

  const filtered = activities.filter(a => {
    const company = companies.find(c => c.id === a.company_id);
    const matchesSearch = !search ||
      (a.notes || '').toLowerCase().includes(search.toLowerCase()) ||
      (company?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || a.activity_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      <div className="flex items-center justify-between px-5 py-2 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-gray-900">Activity Feed</span>
          <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{activities.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-md text-[12px] w-48 focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-md text-[12px] px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-400">
            <option value="">All types</option>
            {['Call', 'Email', 'Meeting', 'Note', 'Prospecting Touch'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={() => setShowLog(true)}
            className="flex items-center gap-1.5 bg-violet-600 text-white text-[12px] font-medium px-3 py-1.5 rounded-md hover:bg-violet-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Log Activity
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="attio-table w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              <th className="text-left font-medium text-gray-500 px-4 py-2">Type</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2">Company</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 w-[40%]">Notes</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2">Logged by</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2">When</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(act => {
              const company = companies.find(c => c.id === act.company_id);
              return (
                <tr key={act.id} className="border-b border-gray-100">
                  <td className="px-4 py-2.5"><StatusBadge status={act.activity_type} variant="tag" /></td>
                  <td className="px-4 py-2.5">
                    {company ? (
                      <Link to={`/companies/${company.id}`} className="text-gray-900 hover:text-violet-600 font-medium text-[12px]">{company.name}</Link>
                    ) : '--'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 text-[12px] truncate max-w-0">{act.notes || '--'}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{getUserName(act.logged_by)}</td>
                  <td className="px-4 py-2.5 text-gray-400 text-[12px] whitespace-nowrap">{formatDateTime(act.activity_timestamp)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[13px] text-gray-400">No activities found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 px-5 py-2 bg-white text-[12px] text-gray-400 shrink-0">{filtered.length} count</div>
      <ActivityLogModal isOpen={showLog} onClose={() => setShowLog(false)} />
    </div>
  );
}

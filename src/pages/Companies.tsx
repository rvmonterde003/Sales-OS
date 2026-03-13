import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { timeAgo, formatDate, COMPANY_STATUSES } from '../lib/helpers';
import { useData } from '../context/DataContext';
import { useRole } from '../hooks/useRole';
import StatusBadge from '../components/StatusBadge';
import { Search, SlidersHorizontal, Check } from 'lucide-react';

type CompanySort = 'name-az' | 'name-za' | 'newest' | 'oldest';

export default function Companies() {
  const { companies, contacts, opportunities, getUserName } = useData();
  const { canSeeRepData } = useRole();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<CompanySort>('name-az');
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);


  // Only show qualified companies that have opportunities, or customers
  const lawFirms = useMemo(() => {
    return companies.filter(c => {
      if (c.status === 'Customer' || c.status === 'Former') return true;
      if (c.lead_status === 'Qualified') {
        return opportunities.some(o => o.company_id === c.id);
      }
      return false;
    });
  }, [companies, opportunities]);

  const filtered = useMemo(() => {
    const result = lawFirms.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.industry || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    switch (sortBy) {
      case 'name-az': return result.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-za': return result.sort((a, b) => b.name.localeCompare(a.name));
      case 'newest': return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest': return result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      default: return result;
    }
  }, [lawFirms, search, statusFilter, sortBy]);

  const activeFilters = [
    statusFilter !== 'all' ? { label: `Status: ${statusFilter}`, clear: () => setStatusFilter('all') } : null,
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      <div className="flex items-center justify-between px-5 py-2 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
            <span className="w-3.5 h-3.5 rounded bg-purple-500 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">L</span>
            </span>
            All Law Firms
          </button>
          <div className="relative" ref={settingsRef}>
            <button onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 text-[12px] text-gray-500 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
              <SlidersHorizontal className="w-3 h-3" /> View settings
            </button>
            {showSettings && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-[180px] py-1">
                <div className="px-3 py-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">Sort by</div>
                {([
                  { value: 'name-az', label: 'Name A → Z' },
                  { value: 'name-za', label: 'Name Z → A' },
                  { value: 'newest', label: 'Newest first' },
                  { value: 'oldest', label: 'Oldest first' },
                ] as { value: CompanySort; label: string }[]).map(opt => (
                  <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSettings(false); }}
                    className="w-full text-left px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                    {opt.label}
                    {sortBy === opt.value && <Check className="w-3 h-3 text-violet-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-md text-[12px] w-48 focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400" />
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-2 px-5 py-1.5 border-b border-gray-100 bg-white shrink-0 flex-wrap">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-md text-[12px] px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-400">
          <option value="all">All Statuses</option>
          {COMPANY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {activeFilters.length > 0 && (
          <>
            {activeFilters.map(f => (
              <span key={f.label} className="text-[11px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                {f.label}
                <button onClick={f.clear} className="ml-1 text-violet-400 hover:text-violet-700">&times;</button>
              </span>
            ))}
            <button onClick={() => setStatusFilter('all')}
              className="text-[11px] text-gray-400 hover:text-gray-600 px-1">Clear all</button>
          </>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="attio-table w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Law Firm</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Status</th>
              <th className="text-center font-medium text-gray-500 px-4 py-2 whitespace-nowrap"># Opps</th>
              <th className="text-center font-medium text-gray-500 px-4 py-2 whitespace-nowrap"># Contacts</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Last Activity</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Expected Close Date</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Industry</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Firm Size</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Website</th>
              {canSeeRepData && <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Created by</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(company => {
              const companyContacts = contacts.filter(c => c.company_id === company.id);
              const openDeals = opportunities.filter(o => o.company_id === company.id && !o.closed_at);
              const earliestClose = openDeals
                .filter(o => o.expected_close_date)
                .sort((a, b) => new Date(a.expected_close_date).getTime() - new Date(b.expected_close_date).getTime())[0];
              return (
                <tr key={company.id} className="border-b border-gray-100 group">
                  <td className="px-4 py-2.5">
                    <Link to={`/companies/${company.id}`} className="text-gray-900 hover:text-violet-600 font-medium">{company.name}</Link>
                  </td>
                  <td className="px-4 py-2.5"><StatusBadge status={company.status} /></td>
                  <td className="px-4 py-2.5 text-center text-gray-600">{openDeals.length || ''}</td>
                  <td className="px-4 py-2.5 text-center text-gray-600">{companyContacts.length || ''}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{timeAgo(company.last_activity_at)}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{earliestClose ? formatDate(earliestClose.expected_close_date) : <span className="text-gray-300">--</span>}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{company.industry || '--'}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={company.firm_size || '--'} variant="tag" /></td>
                  <td className="px-4 py-2.5">{company.website ? (
                    <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-800 hover:underline text-[12px]">{company.website}</a>
                  ) : <span className="text-gray-300 text-[12px]">--</span>}</td>
                  {canSeeRepData && <td className="px-4 py-2.5 text-gray-500 text-[12px]">{getUserName(company.owner_id)}</td>}
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={canSeeRepData ? 10 : 9} className="px-4 py-8 text-center text-[13px] text-gray-400">No law firms found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 px-5 py-2 bg-white text-[12px] text-gray-400 shrink-0">{filtered.length} count</div>
    </div>
  );
}

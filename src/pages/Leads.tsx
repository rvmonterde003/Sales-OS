import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { timeAgo, formatDate } from '../lib/helpers';
import { useData } from '../context/DataContext';
import { useRole } from '../hooks/useRole';
import StatusBadge from '../components/StatusBadge';
import AddLeadModal from '../components/AddLeadModal';
import { Search, Plus, SlidersHorizontal, Check } from 'lucide-react';

type LeadSort = 'name-az' | 'name-za' | 'newest' | 'oldest';

export default function Leads() {
  const { companies, contacts, activities } = useData();
  const { canCreate } = useRole();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<LeadSort>('newest');
  const [showSettings, setShowSettings] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Leads = MQL, SQL, Qualified (without opportunities), or Unqualified
  const leads = useMemo(() => {
    return companies.filter(c =>
      c.lead_status === 'MQL' || c.lead_status === 'SQL' || c.lead_status === 'Qualified' || c.lead_status === 'Unqualified'
    );
  }, [companies]);

  const sources = useMemo(() => [...new Set(leads.map(c => c.source).filter(Boolean))], [leads]);

  const getLeadContact = (companyId: number) => {
    return contacts.find(c => c.company_id === companyId);
  };

  const filtered = useMemo(() => {
    const result = leads.filter(c => {
      const contact = getLeadContact(c.id);
      const contactName = contact ? `${contact.first_name} ${contact.last_name}`.toLowerCase() : '';
      const matchesSearch = contactName.includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.lead_status === statusFilter;
      const matchesSource = sourceFilter === 'all' || c.source === sourceFilter;
      return matchesSearch && matchesStatus && matchesSource;
    });
    switch (sortBy) {
      case 'name-az': return result.sort((a, b) => {
        const ca = getLeadContact(a.id);
        const cb = getLeadContact(b.id);
        const na = ca ? `${ca.last_name} ${ca.first_name}` : a.name;
        const nb = cb ? `${cb.last_name} ${cb.first_name}` : b.name;
        return na.localeCompare(nb);
      });
      case 'name-za': return result.sort((a, b) => {
        const ca = getLeadContact(a.id);
        const cb = getLeadContact(b.id);
        const na = ca ? `${ca.last_name} ${ca.first_name}` : a.name;
        const nb = cb ? `${cb.last_name} ${cb.first_name}` : b.name;
        return nb.localeCompare(na);
      });
      case 'newest': return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest': return result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      default: return result;
    }
  }, [leads, contacts, search, statusFilter, sourceFilter, sortBy]);

  const getLatestActivity = (companyId: number) => {
    const act = activities.find(a => a.company_id === companyId);
    return act ? timeAgo(act.activity_timestamp) : '--';
  };

  const activeFilters = [
    statusFilter !== 'all' ? { label: `Stage: ${statusFilter}`, clear: () => setStatusFilter('all') } : null,
    sourceFilter !== 'all' ? { label: `Source: ${sourceFilter}`, clear: () => setSourceFilter('all') } : null,
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      <div className="flex items-center justify-between px-5 py-2 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
            <span className="w-3.5 h-3.5 rounded bg-cyan-500 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">L</span>
            </span>
            All Leads
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
                  { value: 'newest', label: 'Newest first' },
                  { value: 'oldest', label: 'Oldest first' },
                  { value: 'name-az', label: 'Name A → Z' },
                  { value: 'name-za', label: 'Name Z → A' },
                ] as { value: LeadSort; label: string }[]).map(opt => (
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
          {canCreate && (
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 bg-violet-600 text-white text-[12px] font-medium px-3 py-1.5 rounded-md hover:bg-violet-700 transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Lead
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-5 py-1.5 border-b border-gray-100 bg-white shrink-0 flex-wrap">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-md text-[12px] px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-400">
          <option value="all">All Stages</option>
          <option value="MQL">MQL</option>
          <option value="SQL">SQL</option>
          <option value="Qualified">Qualified</option>
          <option value="Unqualified">Unqualified</option>
        </select>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}
          className="border border-gray-200 rounded-md text-[12px] px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-400">
          <option value="all">All Sources</option>
          {sources.map(s => <option key={s!} value={s!}>{s}</option>)}
        </select>
        {activeFilters.length > 0 && (
          <>
            {activeFilters.map(f => (
              <span key={f.label} className="text-[11px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                {f.label}
                <button onClick={f.clear} className="ml-1 text-violet-400 hover:text-violet-700">&times;</button>
              </span>
            ))}
            <button onClick={() => { setStatusFilter('all'); setSourceFilter('all'); }}
              className="text-[11px] text-gray-400 hover:text-gray-600 px-1">Clear all</button>
          </>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="attio-table w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Contact</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Stage</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Source</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Date Added</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Email</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Phone</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">LinkedIn</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Latest Activity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(company => {
              const contact = getLeadContact(company.id);
              return (
                <tr key={company.id} className="border-b border-gray-100 group">
                  <td className="px-4 py-2.5">
                    <Link to={`/leads/${company.id}`} className="text-gray-900 hover:text-violet-600 font-medium">
                      {contact ? `${contact.first_name} ${contact.last_name}` : company.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5"><StatusBadge status={company.lead_status} variant="tag" /></td>
                  <td className="px-4 py-2.5">{company.source ? <StatusBadge status={company.source} variant="tag" /> : <span className="text-gray-300 text-[12px]">--</span>}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{formatDate(company.created_at)}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{contact?.email || '--'}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{contact?.phone || '--'}</td>
                  <td className="px-4 py-2.5">
                    {contact?.linkedin_url ? (
                      <a href={contact.linkedin_url.startsWith('http') ? contact.linkedin_url : `https://${contact.linkedin_url}`}
                        target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-[12px] hover:underline truncate block max-w-[140px]">
                        {contact.linkedin_url.replace(/^https?:\/\//, '')}
                      </a>
                    ) : <span className="text-gray-300 text-[12px]">--</span>}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{getLatestActivity(company.id)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-[13px] text-gray-400">No leads found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 px-5 py-2 bg-white text-[12px] text-gray-400 shrink-0">{filtered.length} count</div>
      <AddLeadModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

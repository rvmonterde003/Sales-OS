import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import { Search, SlidersHorizontal, Linkedin, Check } from 'lucide-react';

type ContactSort = 'name-az' | 'name-za' | 'newest' | 'oldest' | 'company-az';

export default function Contacts() {
  const { contacts, companies, opportunities, salesStages } = useData();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState<ContactSort>('name-az');
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(() => {
    const result = contacts.filter(c => {
      const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
      const company = companies.find(cm => cm.id === c.company_id);
      const matchesSearch = !search || fullName.includes(search.toLowerCase()) ||
        (company?.name.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || c.role === roleFilter;
      return matchesSearch && matchesRole;
    });
    switch (sortBy) {
      case 'name-az': return result.sort((a, b) => `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`));
      case 'name-za': return result.sort((a, b) => `${b.last_name} ${b.first_name}`.localeCompare(`${a.last_name} ${a.first_name}`));
      case 'newest': return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest': return result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'company-az': return result.sort((a, b) => (companies.find(c => c.id === a.company_id)?.name || '').localeCompare(companies.find(c => c.id === b.company_id)?.name || ''));
      default: return result;
    }
  }, [contacts, companies, search, roleFilter, sortBy]);

  const roles = useMemo(() => [...new Set(contacts.map(c => c.role).filter(Boolean))], [contacts]);

  const getContactStatus = (companyId: number): string => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return '--';
    if (company.lead_status === 'Unqualified') return 'Unqualified';
    const companyOpps = opportunities.filter(o => o.company_id === companyId);
    if (companyOpps.length === 0) return company.lead_status;
    // Prefer active (non-closed) opportunities, pick the most advanced stage
    const activeOpps = companyOpps.filter(o => !o.closed_at);
    if (activeOpps.length > 0) {
      const best = activeOpps.reduce((a, b) => {
        const aOrder = salesStages.find(s => s.id === a.stage_id)?.stage_order ?? 0;
        const bOrder = salesStages.find(s => s.id === b.stage_id)?.stage_order ?? 0;
        return bOrder > aOrder ? b : a;
      });
      const stageName = salesStages.find(s => s.id === best.stage_id)?.name ?? company.lead_status;
      return `Qualified - ${stageName}`;
    }
    // All closed — show Won if any won, otherwise Lost
    const hasWon = companyOpps.some(o => {
      const stage = salesStages.find(s => s.id === o.stage_id);
      return stage?.name === 'Won';
    });
    return hasWon ? 'Qualified - Won' : 'Qualified - Loss';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      <div className="flex items-center justify-between px-5 py-2 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
            <span className="w-3.5 h-3.5 rounded bg-green-500 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">P</span>
            </span>
            All People
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
                  { value: 'company-az', label: 'Company A → Z' },
                  { value: 'newest', label: 'Newest first' },
                  { value: 'oldest', label: 'Oldest first' },
                ] as { value: ContactSort; label: string }[]).map(opt => (
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
          {roles.length > 0 && (
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="border border-gray-200 rounded-md text-[12px] px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-400">
              <option value="">All roles</option>
              {roles.map(r => <option key={r!} value={r!}>{r}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="attio-table w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Name</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Company</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Title</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Role</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Status</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Email</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Phone</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">LinkedIn</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(contact => {
              const company = companies.find(c => c.id === contact.company_id);
              return (
                <tr key={contact.id} className="border-b border-gray-100 group">
                  <td className="px-4 py-2.5">
                    <Link to={`/contacts/${contact.id}`} className="text-gray-900 hover:text-violet-600 font-medium">
                      {contact.first_name} {contact.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    {company ? (
                      <Link to={company.lead_status === 'MQL' || company.lead_status === 'SQL' ? `/leads/${contact.company_id}` : `/companies/${contact.company_id}`}
                        className="text-violet-600 hover:underline text-[12px]">
                        {company.name || `${contact.first_name} ${contact.last_name}`}
                      </Link>
                    ) : <span className="text-gray-300 text-[12px]">--</span>}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{contact.title || '--'}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{contact.role || '--'}</td>
                  <td className="px-4 py-2.5">
                    {(() => {
                      const status = getContactStatus(contact.company_id);
                      return status !== '--' ? <StatusBadge status={status} variant="tag" /> : <span className="text-gray-300 text-[12px]">--</span>;
                    })()}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{contact.email || '--'}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{contact.phone || '--'}</td>
                  <td className="px-4 py-2.5">
                    {contact.linkedin_url ? (
                      <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800">
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    ) : <span className="text-gray-300 text-[12px]">--</span>}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-[13px] text-gray-400">No contacts found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 px-5 py-2 bg-white text-[12px] text-gray-400 shrink-0">{filtered.length} count</div>
    </div>
  );
}

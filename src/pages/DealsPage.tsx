import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../lib/helpers';
import { useData } from '../context/DataContext';
import { useRole } from '../hooks/useRole';
import StatusBadge from '../components/StatusBadge';
import { Search, SlidersHorizontal, Check, AlertTriangle } from 'lucide-react';

type DealSort = 'newest' | 'oldest' | 'value-high' | 'value-low' | 'close-soonest';

const RISK_DAYS = 14;
const STALE_DAYS = 7;

export default function DealsPage() {
  const { opportunities, companies, contacts, activities, salesStages, inactivityFlags, getUserName } = useData();
  const { canSeeRepData } = useRole();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<DealSort>('newest');
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) setShowSettings(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const getDealStatus = (opp: typeof opportunities[0]): { prefix: string; suffix: string } => {
    const stage = salesStages.find(s => s.id === opp.stage_id);
    const stageName = stage?.name || '--';
    if (stageName === 'Won' || stageName === 'Loss') {
      return { prefix: 'Qualified', suffix: stageName };
    }
    return { prefix: 'Qualified', suffix: stageName };
  };

  const getDealRisk = (opp: typeof opportunities[0]): 'risk' | 'stale' | 'active' => {
    if (opp.closed_at) return 'active';
    // Check if there's an unresolved inactivity flag
    const hasFlag = inactivityFlags.some(f => f.related_opportunity_id === opp.id && !f.resolved_at);
    if (hasFlag) return 'risk';
    // Calculate days since last activity on this opportunity
    const oppActivities = activities.filter(a => a.related_opportunity_id === opp.id);
    const companyActivities = activities.filter(a => a.company_id === opp.company_id);
    const relevantActivities = oppActivities.length > 0 ? oppActivities : companyActivities;
    if (relevantActivities.length === 0) {
      const daysSinceCreation = Math.floor((Date.now() - new Date(opp.created_at).getTime()) / 86400000);
      if (daysSinceCreation >= RISK_DAYS) return 'risk';
      if (daysSinceCreation >= STALE_DAYS) return 'stale';
      return 'active';
    }
    const latest = relevantActivities.reduce((a, b) =>
      new Date(a.activity_timestamp).getTime() > new Date(b.activity_timestamp).getTime() ? a : b
    );
    const daysSince = Math.floor((Date.now() - new Date(latest.activity_timestamp).getTime()) / 86400000);
    if (daysSince >= RISK_DAYS) return 'risk';
    if (daysSince >= STALE_DAYS) return 'stale';
    return 'active';
  };

  // Build unique status options from actual data
  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    opportunities.forEach(opp => {
      const stage = salesStages.find(s => s.id === opp.stage_id);
      if (stage) set.add(stage.name);
    });
    return [...set];
  }, [opportunities, salesStages]);

  const filtered = useMemo(() => {
    const result = opportunities.filter(opp => {
      const company = companies.find(c => c.id === opp.company_id);
      const contact = opp.primary_contact_id ? contacts.find(c => c.id === opp.primary_contact_id) : null;
      const contactName = contact ? `${contact.first_name} ${contact.last_name}`.toLowerCase() : '';
      const matchesSearch = !search ||
        opp.service_description.toLowerCase().includes(search.toLowerCase()) ||
        (company?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        contactName.includes(search.toLowerCase());
      const stage = salesStages.find(s => s.id === opp.stage_id);
      const matchesStatus = statusFilter === 'all' || stage?.name === statusFilter;
      return matchesSearch && matchesStatus;
    });
    switch (sortBy) {
      case 'newest': return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest': return result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'value-high': return result.sort((a, b) => b.deal_value - a.deal_value);
      case 'value-low': return result.sort((a, b) => a.deal_value - b.deal_value);
      case 'close-soonest': return result.sort((a, b) => new Date(a.expected_close_date).getTime() - new Date(b.expected_close_date).getTime());
      default: return result;
    }
  }, [opportunities, companies, contacts, salesStages, search, statusFilter, sortBy]);

  const activeFilters = [
    statusFilter !== 'all' ? { label: `Status: ${statusFilter}`, clear: () => setStatusFilter('all') } : null,
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      <div className="flex items-center justify-between px-5 py-2 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
            <span className="w-3.5 h-3.5 rounded bg-orange-400 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">D</span>
            </span>
            All Opportunities
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
                  { value: 'value-high', label: 'Value high → low' },
                  { value: 'value-low', label: 'Value low → high' },
                  { value: 'close-soonest', label: 'Close date soonest' },
                ] as { value: DealSort; label: string }[]).map(opt => (
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

      {/* Filters */}
      <div className="flex items-center gap-2 px-5 py-1.5 border-b border-gray-100 bg-white shrink-0 flex-wrap">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-md text-[12px] px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-400">
          <option value="all">All Statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
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
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Deal Name</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Contact</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Law Firm</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Status</th>
              <th className="text-right font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Value</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Est. Close Date</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Deal Created</th>
              <th className="text-center font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Risk</th>
              {canSeeRepData && <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Owner</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(opp => {
              const company = companies.find(c => c.id === opp.company_id);
              const contact = opp.primary_contact_id ? contacts.find(c => c.id === opp.primary_contact_id) : null;
              const { prefix, suffix } = getDealStatus(opp);
              const risk = getDealRisk(opp);
              return (
                <tr key={opp.id} className="border-b border-gray-100 group">
                  <td className="px-4 py-2.5 max-w-[200px]">
                    <Link to={`/opportunities/${opp.id}`} className="text-gray-900 hover:text-violet-600 font-medium truncate block">
                      {opp.service_description || '--'}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-[12px]">
                    {contact ? (
                      <Link to={`/contacts/${contact.id}`} className="text-violet-600 hover:underline">
                        {contact.first_name} {contact.last_name}
                      </Link>
                    ) : <span className="text-gray-300">--</span>}
                  </td>
                  <td className="px-4 py-2.5 text-[12px]">
                    {company ? (
                      <Link to={`/companies/${company.id}`} className="text-violet-600 hover:underline">
                        {company.name}
                      </Link>
                    ) : <span className="text-gray-300">--</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-0.5">
                      <StatusBadge status={prefix} variant="tag" />
                      <span className="text-[11px] text-gray-400 mx-0.5">-</span>
                      <StatusBadge status={suffix} variant="tag" />
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-gray-900 text-[12px] tabular-nums">{formatCurrency(opp.deal_value)}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{formatDate(opp.expected_close_date)}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{formatDate(opp.created_at)}</td>
                  <td className="px-4 py-2.5 text-center">
                    {risk === 'risk' ? (
                      <span title="At risk — no activity for 14+ days">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 inline-block" />
                      </span>
                    ) : risk === 'stale' ? (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" title="Stale — no activity for 7+ days" />
                    ) : (
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-400" title="Active" />
                    )}
                  </td>
                  {canSeeRepData && <td className="px-4 py-2.5 text-gray-500 text-[12px]">{getUserName(opp.owner_id)}</td>}
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={canSeeRepData ? 9 : 8} className="px-4 py-8 text-center text-[13px] text-gray-400">No deals found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 px-5 py-2 bg-white text-[12px] text-gray-400 shrink-0">{filtered.length} count</div>
    </div>
  );
}

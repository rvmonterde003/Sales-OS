import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { timeAgo } from '../lib/helpers';
import { useData } from '../context/DataContext';
import { useRole } from '../hooks/useRole';
import StatusBadge from '../components/StatusBadge';
import AddLeadModal from '../components/AddLeadModal';
import { Search, Plus } from 'lucide-react';

export default function Leads() {
  const { companies, contacts, activities } = useData();
  const { canCreate } = useRole();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAdd, setShowAdd] = useState(false);

  // Leads = MQL, SQL, or Qualified without any opportunities
  const leads = useMemo(() => {
    return companies.filter(c =>
      c.lead_status === 'MQL' || c.lead_status === 'SQL' || c.lead_status === 'Qualified'
    );
  }, [companies]);

  const getLeadContact = (companyId: number) => {
    return contacts.find(c => c.company_id === companyId);
  };

  const filtered = useMemo(() => {
    return leads.filter(c => {
      const contact = getLeadContact(c.id);
      const contactName = contact ? `${contact.first_name} ${contact.last_name}`.toLowerCase() : '';
      const matchesSearch = contactName.includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.lead_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, contacts, search, statusFilter]);

  const getLatestActivity = (companyId: number) => {
    const act = activities.find(a => a.company_id === companyId);
    return act ? timeAgo(act.activity_timestamp) : '--';
  };

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
      <div className="flex items-center gap-2 px-5 py-1.5 border-b border-gray-100 bg-white shrink-0">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-md text-[12px] px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-400">
          <option value="all">All Stages</option>
          <option value="MQL">MQL</option>
          <option value="SQL">SQL</option>
          <option value="Qualified">Qualified</option>
        </select>
        {statusFilter !== 'all' && (
          <button onClick={() => setStatusFilter('all')} className="text-[11px] text-gray-400 hover:text-gray-600 px-1">Clear</button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="attio-table w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Contact</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Stage</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Source</th>
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
              <tr><td colSpan={7} className="px-4 py-8 text-center text-[13px] text-gray-400">No leads found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 px-5 py-2 bg-white text-[12px] text-gray-400 shrink-0">{filtered.length} count</div>
      <AddLeadModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { timeAgo } from '../data/mockData';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import AddCompanyModal from '../components/AddCompanyModal';
import { Search, Plus, ArrowUpDown, Filter, SlidersHorizontal } from 'lucide-react';

export default function Companies() {
  const { companies, contacts, opportunities, activities } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = companies.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
            <span className="w-3.5 h-3.5 rounded bg-purple-500 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">C</span>
            </span>
            All Companies
          </button>
          <button className="flex items-center gap-1.5 text-[12px] text-gray-500 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
            <SlidersHorizontal className="w-3 h-3" />
            View settings
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-md text-[12px] w-48 focus:outline-none focus:ring-1 focus:ring-violet-400 focus:border-violet-400"
            />
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-violet-600 text-white text-[12px] font-medium px-3 py-1.5 rounded-md hover:bg-violet-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Company
          </button>
        </div>
      </div>

      {/* Sort / Filter bar */}
      <div className="flex items-center gap-2 px-5 py-1.5 border-b border-gray-100 bg-white shrink-0">
        <button className="flex items-center gap-1 text-[12px] text-gray-500 px-2 py-1 rounded hover:bg-gray-50">
          <ArrowUpDown className="w-3 h-3" /> Sort
        </button>
        <div className="relative group">
          <button className="flex items-center gap-1 text-[12px] text-gray-500 px-2 py-1 rounded hover:bg-gray-50">
            <Filter className="w-3 h-3" /> Filter
          </button>
          <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 hidden group-hover:block py-1 min-w-[140px]">
            {['all', 'Prospect', 'Customer', 'Former'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`block w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 ${statusFilter === s ? 'text-violet-600 font-medium' : 'text-gray-600'}`}
              >
                {s === 'all' ? 'All statuses' : s}
              </button>
            ))}
          </div>
        </div>
        {statusFilter !== 'all' && (
          <span className="text-[11px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
            Status: {statusFilter}
            <button
              onClick={() => setStatusFilter('all')}
              className="ml-1 text-violet-400 hover:text-violet-700"
            >
              &times;
            </button>
          </span>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="attio-table w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Company</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Categories</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Website</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Last interaction</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Connection</th>
              <th className="text-center font-medium text-gray-500 px-4 py-2 whitespace-nowrap"># Contacts</th>
              <th className="text-center font-medium text-gray-500 px-4 py-2 whitespace-nowrap"># Deals</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Owner</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(company => {
              const companyContacts = contacts.filter(c => c.companyId === company.id);
              const openDeals = opportunities.filter(
                o => o.companyId === company.id && !o.closedAt,
              );
              const contactIds = companyContacts.map(c => c.id);
              const companyActivities = activities
                .filter(
                  a =>
                    (a.relatedObjectType === 'Contact' && contactIds.includes(a.relatedObjectId)) ||
                    (a.relatedObjectType === 'Opportunity' &&
                      opportunities
                        .filter(o => o.companyId === company.id)
                        .map(o => o.id)
                        .includes(a.relatedObjectId)),
                )
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
              const lastActivity =
                companyActivities.length > 0 ? companyActivities[0].timestamp : null;
              const lastMs = lastActivity
                ? Date.now() - new Date(lastActivity).getTime()
                : Infinity;

              let connectionStr = 'Very weak';
              let connectionDot = 'bg-red-400';
              if (company.status === 'Customer') {
                connectionStr = 'Strong';
                connectionDot = 'bg-blue-500';
              } else if (openDeals.length > 0) {
                connectionStr = 'Moderate';
                connectionDot = 'bg-amber-400';
              }

              return (
                <tr key={company.id} className="border-b border-gray-100 group">
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/companies/${company.id}`}
                      className="text-gray-900 hover:text-violet-600 font-medium"
                    >
                      {company.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      <StatusBadge status={company.status} variant="tag" />
                      <StatusBadge status={company.industry} variant="tag" />
                      <StatusBadge status={company.firmSize} variant="tag" />
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-violet-600 text-[12px]">{company.website}</span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">
                    {timeAgo(lastActivity)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-[6px] h-[6px] rounded-full ${connectionDot}`} />
                      <span className="text-[12px] text-gray-600">{connectionStr}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center text-gray-600">
                    {companyContacts.length || ''}
                  </td>
                  <td className="px-4 py-2.5 text-center text-gray-600">
                    {openDeals.length || ''}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{company.owner}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-5 py-2 bg-white text-[12px] text-gray-400 shrink-0">
        {filtered.length} count
      </div>

      <AddCompanyModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

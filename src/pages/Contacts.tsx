import { useState } from 'react';
import { Link } from 'react-router-dom';
import { contacts, getCompanyById, timeAgo } from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import { Search, Plus, ArrowUpDown, Filter, SlidersHorizontal } from 'lucide-react';

export default function Contacts() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = contacts.filter(c => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const company = getCompanyById(c.companyId);
    const matchesSearch = fullName.includes(search.toLowerCase()) ||
      (company?.name.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || c.contactType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
            <span className="w-3.5 h-3.5 rounded bg-green-500 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">P</span>
            </span>
            All People
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
          <button className="flex items-center gap-1.5 bg-violet-600 text-white text-[12px] font-medium px-3 py-1.5 rounded-md hover:bg-violet-700 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            New Person
          </button>
        </div>
      </div>

      {/* Sort / Filter bar */}
      <div className="flex items-center gap-2 px-5 py-1.5 border-b border-gray-100 bg-white shrink-0">
        <button className="flex items-center gap-1 text-[12px] text-gray-500 px-2 py-1 rounded hover:bg-gray-50">
          <ArrowUpDown className="w-3 h-3" /> Sort
        </button>
        <button className="flex items-center gap-1 text-[12px] text-gray-500 px-2 py-1 rounded hover:bg-gray-50">
          <Filter className="w-3 h-3" /> Filter
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="attio-table w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Name</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Company</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Categories</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Email</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Title</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Last interaction</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Connection</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(contact => {
              const company = getCompanyById(contact.companyId);
              const lastActivityMs = contact.lastActivityAt ? Date.now() - new Date(contact.lastActivityAt).getTime() : Infinity;
              const isStale = lastActivityMs > 7 * 86400000;

              let connectionStr = 'Very weak';
              let connectionDot = 'bg-red-400';
              if (contact.contactType === 'Customer') { connectionStr = 'Strong'; connectionDot = 'bg-blue-500'; }
              else if (!isStale) { connectionStr = 'Moderate'; connectionDot = 'bg-amber-400'; }

              return (
                <tr key={contact.id} className="border-b border-gray-100 group">
                  <td className="px-4 py-2.5">
                    <Link to={`/contacts/${contact.id}`} className="text-gray-900 hover:text-violet-600 font-medium">
                      {contact.firstName} {contact.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <Link to={`/companies/${contact.companyId}`} className="text-violet-600 hover:underline text-[12px]">
                      {company?.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      <StatusBadge status={contact.contactType} variant="tag" />
                      <StatusBadge status={contact.source} variant="tag" />
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{contact.email}</td>
                  <td className="px-4 py-2.5 text-gray-600 text-[12px]">{contact.title}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{timeAgo(contact.lastActivityAt)}</td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-[6px] h-[6px] rounded-full ${connectionDot}`} />
                      <span className="text-[12px] text-gray-600">{connectionStr}</span>
                    </span>
                  </td>
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
    </div>
  );
}

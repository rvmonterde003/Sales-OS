import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import AddContactModal from '../components/AddContactModal';
import { Search, Plus, SlidersHorizontal } from 'lucide-react';

export default function Contacts() {
  const { contacts, companies } = useData();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
      const company = companies.find(cm => cm.id === c.company_id);
      const matchesSearch = !search || fullName.includes(search.toLowerCase()) ||
        (company?.name.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || c.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [contacts, companies, search, roleFilter]);

  const roles = useMemo(() => [...new Set(contacts.map(c => c.role).filter(Boolean))], [contacts]);

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
          <button className="flex items-center gap-1.5 text-[12px] text-gray-500 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
            <SlidersHorizontal className="w-3 h-3" /> View settings
          </button>
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
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 bg-violet-600 text-white text-[12px] font-medium px-3 py-1.5 rounded-md hover:bg-violet-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Person
          </button>
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
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Email</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2 whitespace-nowrap">Phone</th>
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
                    <Link to={`/companies/${contact.company_id}`} className="text-violet-600 hover:underline text-[12px]">
                      {company?.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 text-[12px]">{contact.title || '--'}</td>
                  <td className="px-4 py-2.5">
                    {contact.role ? <StatusBadge status={contact.role} variant="tag" /> : <span className="text-gray-300 text-[12px]">--</span>}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{contact.email || '--'}</td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{contact.phone || '--'}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[13px] text-gray-400">No contacts found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 px-5 py-2 bg-white text-[12px] text-gray-400 shrink-0">{filtered.length} count</div>
      <AddContactModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

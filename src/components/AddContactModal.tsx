import { useState } from 'react';
import { X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { CONTACT_ROLES } from '../lib/helpers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultCompanyId?: number;
}

export default function AddContactModal({ isOpen, onClose, defaultCompanyId }: Props) {
  const { companies, addContact } = useData();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [companyId, setCompanyId] = useState<number | ''>(defaultCompanyId || '');

  if (!isOpen) return null;

  const reset = () => { setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setTitle(''); setRole(''); setCompanyId(defaultCompanyId || ''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !companyId) return;
    await addContact({
      company_id: companyId as number,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      title: title.trim() || undefined,
      role: role || undefined,
    });
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[520px] max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-[15px] font-semibold text-gray-900">Add Contact</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">First Name *</label>
              <input value={firstName} onChange={e => setFirstName(e.target.value)} required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Last Name *</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Company *</label>
            <select value={companyId} onChange={e => setCompanyId(e.target.value ? Number(e.target.value) : '')} required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
              <option value="">Select company...</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Managing Partner"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                <option value="">Select...</option>
                {CONTACT_ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
            <button type="submit" disabled={!firstName.trim() || !lastName.trim() || !companyId}
              className="px-3 py-1.5 text-[13px] bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-40 transition-colors">
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

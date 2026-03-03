import { useState } from 'react';
import { X } from 'lucide-react';
import { useData } from '../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultCompanyId?: string;
}

export default function AddContactModal({ isOpen, onClose, defaultCompanyId }: Props) {
  const { companies, addContact } = useData();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [companyId, setCompanyId] = useState(defaultCompanyId || '');
  const [contactType, setContactType] = useState('Lead');
  const [source, setSource] = useState('Website');

  if (!isOpen) return null;

  const reset = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setTitle('');
    setCompanyId(defaultCompanyId || '');
    setContactType('Lead');
    setSource('Website');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !companyId) return;
    addContact({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      title: title.trim(),
      companyId,
      contactType,
      source,
      lastActivityAt: null as unknown as string,
    });
    reset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[520px] max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-[15px] font-semibold text-gray-900">Add Contact</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">
                First Name *
              </label>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">
                Last Name *
              </label>
              <input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">
              Company *
            </label>
            <select
              value={companyId}
              onChange={e => setCompanyId(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="">Select company...</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">
                Phone
              </label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">
                Title
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="e.g. Partner"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">
                Type
              </label>
              <select
                value={contactType}
                onChange={e => setContactType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                {['Lead', 'Customer', 'Other'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">
                Source
              </label>
              <select
                value={source}
                onChange={e => setSource(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                {['Website', 'Referral', 'Podcast', 'Beehive'].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!firstName.trim() || !lastName.trim() || !companyId}
              className="px-3 py-1.5 text-[13px] bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-40 transition-colors"
            >
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

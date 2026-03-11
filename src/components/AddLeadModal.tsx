import { useState } from 'react';
import { X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { DEAL_SOURCES } from '../lib/helpers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddLeadModal({ isOpen, onClose }: Props) {
  const { addCompany, addContact } = useData();
  const [source, setSource] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setSource(''); setFirstName(''); setLastName('');
    setEmail(''); setPhone(''); setLinkedinUrl('');
  };

  const canSubmit = firstName.trim() && lastName.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    // Create company with empty name placeholder (firm name added at SQL stage)
    const company = await addCompany({
      name: '',
      source: source || undefined,
    });

    if (company) {
      await addContact({
        company_id: company.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        linkedin_url: linkedinUrl.trim() || undefined,
      });
    }

    setSubmitting(false);
    reset();
    onClose();
  };

  const inputClass = "w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[520px] max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-[15px] font-semibold text-gray-900">New Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Contact info */}
          <div>
            <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">Contact</div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1">First Name *</label>
                <input value={firstName} onChange={e => setFirstName(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1">Last Name *</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} required className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1">Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1">LinkedIn</label>
                <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://..." className={inputClass} />
              </div>
            </div>
          </div>

          {/* Source */}
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Lead Source</label>
            <select value={source} onChange={e => setSource(e.target.value)} className={inputClass}>
              <option value="">Select source...</option>
              {DEAL_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
            <button type="submit" disabled={!canSubmit || submitting}
              className="px-3 py-1.5 text-[13px] bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-40 transition-colors font-medium">
              {submitting ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

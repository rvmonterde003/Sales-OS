import { useState } from 'react';
import { X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { FIRM_SIZES, DEAL_SOURCES } from '../lib/helpers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCompanyModal({ isOpen, onClose }: Props) {
  const { addCompany } = useData();
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [firmSize, setFirmSize] = useState('');
  const [website, setWebsite] = useState('');
  const [source, setSource] = useState('');

  if (!isOpen) return null;

  const reset = () => { setName(''); setIndustry(''); setFirmSize(''); setWebsite(''); setSource(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addCompany({
      name: name.trim(),
      industry: industry.trim() || undefined,
      firm_size: firmSize || undefined,
      website: website.trim() || undefined,
      source: source || undefined,
    });
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[520px] max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-[15px] font-semibold text-gray-900">Add Company</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Company Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="e.g. Acme Legal" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Industry</label>
              <input value={industry} onChange={e => setIndustry(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="e.g. Corporate Law" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Firm Size</label>
              <select value={firmSize} onChange={e => setFirmSize(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                <option value="">Select...</option>
                {FIRM_SIZES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Website</label>
              <input value={website} onChange={e => setWebsite(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="example.com" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Lead Source</label>
            <select value={source} onChange={e => setSource(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
              <option value="">Select source...</option>
              {DEAL_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
            <button type="submit" disabled={!name.trim()}
              className="px-3 py-1.5 text-[13px] bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-40 transition-colors">
              Add Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

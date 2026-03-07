import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { OPPORTUNITY_TYPES, DEAL_SOURCES } from '../lib/helpers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
}

export default function CreateOpportunityModal({ isOpen, onClose, companyId }: Props) {
  const { contacts, addOpportunity } = useData();
  const companyContacts = contacts.filter(c => c.company_id === companyId);

  const [opportunityType, setOpportunityType] = useState<string>('New');
  const [serviceDescription, setServiceDescription] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [source, setSource] = useState<string>('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [primaryContactId, setPrimaryContactId] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const canSubmit = opportunityType && serviceDescription.trim() && dealValue && source && expectedCloseDate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    await addOpportunity({
      company_id: companyId,
      opportunity_type: opportunityType,
      service_description: serviceDescription.trim(),
      deal_value: Number(dealValue),
      source,
      expected_close_date: expectedCloseDate,
      primary_contact_id: primaryContactId || null,
      notes: notes.trim() || undefined,
    });
    setSubmitting(false);
    setOpportunityType('New');
    setServiceDescription('');
    setDealValue('');
    setSource('');
    setExpectedCloseDate('');
    setPrimaryContactId('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[520px] max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-[15px] font-semibold text-gray-900">Create Opportunity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Opportunity Type *</label>
            <select value={opportunityType} onChange={e => setOpportunityType(e.target.value)} required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
              {OPPORTUNITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Service / Description *</label>
            <input value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder='e.g. "Maps SEO Retainer" or "AI Intake Add-On"' />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Deal Value *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-gray-400">$</span>
                <input type="number" min="0" step="0.01" value={dealValue} onChange={e => setDealValue(e.target.value)} required
                  className="w-full border border-gray-300 rounded-md pl-7 pr-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Source *</label>
              <select value={source} onChange={e => setSource(e.target.value)} required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                <option value="">Select source...</option>
                {DEAL_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Expected Close Date *</label>
              <input type="date" value={expectedCloseDate} onChange={e => setExpectedCloseDate(e.target.value)} required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Primary Contact</label>
              <select value={primaryContactId} onChange={e => setPrimaryContactId(e.target.value ? Number(e.target.value) : '')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                <option value="">None</option>
                {companyContacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Any context on the deal..." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
            <button type="submit" disabled={!canSubmit || submitting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-40 transition-colors font-medium">
              <Plus className="w-3.5 h-3.5" />{submitting ? 'Creating...' : 'Create Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

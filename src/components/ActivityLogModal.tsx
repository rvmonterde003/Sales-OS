import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { ACTIVITY_TYPES } from '../lib/helpers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultCompanyId?: number;
  defaultOpportunityId?: number | null;
}

export default function ActivityLogModal({ isOpen, onClose, defaultCompanyId, defaultOpportunityId }: Props) {
  const { companies, opportunities, addActivity } = useData();
  const [activityType, setActivityType] = useState<string>('Call');
  const [companyId, setCompanyId] = useState<number | ''>(defaultCompanyId || '');
  const [opportunityId, setOpportunityId] = useState<number | ''>(defaultOpportunityId || '');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCompanyId(defaultCompanyId || '');
      setOpportunityId(defaultOpportunityId || '');
      setActivityType('Call');
      setNotes('');
    }
  }, [isOpen, defaultCompanyId, defaultOpportunityId]);

  if (!isOpen) return null;

  const companyOpps = companyId ? opportunities.filter(o => o.company_id === companyId && !o.closed_at) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    await addActivity({
      company_id: companyId as number,
      related_opportunity_id: opportunityId || null,
      activity_type: activityType,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[480px] max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-[15px] font-semibold text-gray-900">Log Activity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Activity Type</label>
            <select value={activityType} onChange={e => setActivityType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
              {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Company *</label>
              <select value={companyId} onChange={e => { setCompanyId(e.target.value ? Number(e.target.value) : ''); setOpportunityId(''); }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                <option value="">Select...</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Opportunity (optional)</label>
              <select value={opportunityId} onChange={e => setOpportunityId(e.target.value ? Number(e.target.value) : '')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                <option value="">None</option>
                {companyOpps.map(o => <option key={o.id} value={o.id}>Opp #{o.id} - {o.opportunity_type}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Describe the activity..." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
            <button type="submit" disabled={!companyId}
              className="px-3 py-1.5 text-[13px] bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-40 transition-colors">
              Log Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

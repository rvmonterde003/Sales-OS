import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useData } from '../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultRelatedType?: 'Contact' | 'Opportunity';
  defaultRelatedId?: string;
}

export default function ActivityLogModal({
  isOpen,
  onClose,
  defaultRelatedType,
  defaultRelatedId,
}: Props) {
  const { contacts, opportunities, companies, addActivity } = useData();
  const [activityType, setActivityType] = useState('Call');
  const [relatedType, setRelatedType] = useState<'Contact' | 'Opportunity'>(
    defaultRelatedType || 'Contact',
  );
  const [relatedId, setRelatedId] = useState(defaultRelatedId || '');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRelatedType(defaultRelatedType || 'Contact');
      setRelatedId(defaultRelatedId || '');
      setActivityType('Call');
      setNotes('');
    }
  }, [isOpen, defaultRelatedType, defaultRelatedId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relatedId) return;
    addActivity({
      activityType,
      relatedObjectType: relatedType,
      relatedObjectId: relatedId,
      owner: 'Nick Kringas',
      notes,
      timestamp: new Date().toISOString(),
    });
    onClose();
  };

  const relatedOptions =
    relatedType === 'Contact'
      ? contacts.map(c => ({ id: c.id, label: `${c.firstName} ${c.lastName}` }))
      : opportunities.map(o => {
          const comp = companies.find(cm => cm.id === o.companyId);
          return { id: o.id, label: `${comp?.name || 'Unknown'} — ${o.id}` };
        });

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[480px] max-h-[90vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-[15px] font-semibold text-gray-900">Log Activity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">
              Activity Type
            </label>
            <select
              value={activityType}
              onChange={e => setActivityType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              {['Call', 'Email', 'Meeting', 'Note', 'Prospecting Touch'].map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">
                Related Type
              </label>
              <select
                value={relatedType}
                onChange={e => {
                  setRelatedType(e.target.value as 'Contact' | 'Opportunity');
                  setRelatedId('');
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="Contact">Contact</option>
                <option value="Opportunity">Opportunity</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">
                Related Record
              </label>
              <select
                value={relatedId}
                onChange={e => setRelatedId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                {relatedOptions.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Describe the activity..."
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">
              Owner
            </label>
            <input
              value="Nick Kringas"
              readOnly
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] bg-gray-50 text-gray-500"
            />
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
              disabled={!relatedId}
              className="px-3 py-1.5 text-[13px] bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-40 transition-colors"
            >
              Log Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

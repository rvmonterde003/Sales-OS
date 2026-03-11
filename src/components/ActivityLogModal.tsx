import { useState, useEffect, useRef } from 'react';
import { X, Paperclip, Link as LinkIcon, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { ACTIVITY_TYPES } from '../lib/helpers';
import { supabase } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
  defaultCompanyId?: number;
  defaultOpportunityId?: number | null;
  defaultContactId?: number | null;
}

interface Attachment {
  name: string;
  url: string;
  type: string; // 'pdf' | 'csv' | 'link' | etc.
}

export default function ActivityLogModal({ isOpen, onClose, onSubmitted, defaultCompanyId, defaultOpportunityId, defaultContactId }: Props) {
  const { companies, contacts, opportunities, addActivity } = useData();
  const [activityType, setActivityType] = useState<string>('Call');
  const [companyId, setCompanyId] = useState<number | ''>(defaultCompanyId || '');
  const [contactId, setContactId] = useState<number | ''>(defaultContactId || '');
  const [opportunityId, setOpportunityId] = useState<number | ''>(defaultOpportunityId || '');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCompanyId(defaultCompanyId || '');
      setContactId(defaultContactId || '');
      setOpportunityId(defaultOpportunityId || '');
      setActivityType('Call');
      setNotes('');
      setAttachments([]);
      setLinkUrl('');
      setShowLinkInput(false);
    }
  }, [isOpen, defaultCompanyId, defaultOpportunityId, defaultContactId]);

  if (!isOpen) return null;

  const companyContacts = companyId ? contacts.filter(c => c.company_id === companyId) : [];
  const companyOpps = companyId ? opportunities.filter(o => o.company_id === companyId && !o.closed_at) : [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'file';
      const path = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('activity-attachments').upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from('activity-attachments').getPublicUrl(path);
        setAttachments(prev => [...prev, { name: file.name, url: urlData.publicUrl, type: ext }]);
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleAddLink = () => {
    if (linkUrl.trim()) {
      setAttachments(prev => [...prev, { name: linkUrl.trim(), url: linkUrl.trim(), type: 'link' }]);
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || submitting) return;
    setSubmitting(true);
    await addActivity({
      company_id: companyId as number,
      contact_id: contactId || null,
      related_opportunity_id: opportunityId || null,
      activity_type: activityType,
      notes,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
    setSubmitting(false);
    onClose();
    onSubmitted?.();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[520px] max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
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
              <select value={companyId} onChange={e => { setCompanyId(e.target.value ? Number(e.target.value) : ''); setOpportunityId(''); setContactId(''); }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                <option value="">Select...</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Contact</label>
              <select value={contactId} onChange={e => setContactId(e.target.value ? Number(e.target.value) : '')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                <option value="">None</option>
                {companyContacts.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Opportunity (optional)</label>
            <select value={opportunityId} onChange={e => setOpportunityId(e.target.value ? Number(e.target.value) : '')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
              <option value="">None</option>
              {companyOpps.map(o => <option key={o.id} value={o.id}>Opp #{o.id} - {o.opportunity_type}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="Describe the activity..." />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Attachments</label>
            <div className="flex items-center gap-2 mb-2">
              <input ref={fileRef} type="file" accept=".pdf,.csv,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg" multiple
                onChange={handleFileUpload} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50 disabled:opacity-40">
                <Paperclip className="w-3 h-3" /> {uploading ? 'Uploading...' : 'Attach File'}
              </button>
              <button type="button" onClick={() => setShowLinkInput(!showLinkInput)}
                className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
                <LinkIcon className="w-3 h-3" /> Add Link
              </button>
            </div>
            {showLinkInput && (
              <div className="flex items-center gap-2 mb-2">
                <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-violet-400" />
                <button type="button" onClick={handleAddLink}
                  className="text-[12px] bg-violet-600 text-white px-2.5 py-1.5 rounded-md hover:bg-violet-700">Add</button>
              </div>
            )}
            {attachments.length > 0 && (
              <div className="space-y-1">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-md px-2.5 py-1.5">
                    <span className="text-[11px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono uppercase">{file.type}</span>
                    <span className="text-[12px] text-gray-700 truncate flex-1">{file.name}</span>
                    <button type="button" onClick={() => removeAttachment(i)} className="text-gray-400 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
            <button type="submit" disabled={!companyId || uploading || submitting}
              className="px-3 py-1.5 text-[13px] bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-40 transition-colors">
              {submitting ? 'Saving...' : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

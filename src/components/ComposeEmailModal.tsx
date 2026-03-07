import { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contactId: number;
  companyId: number;
}

export default function ComposeEmailModal({ isOpen, onClose, contactId, companyId }: Props) {
  const { contacts, addActivity } = useData();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const contact = contacts.find(c => c.id === contactId);
  if (!isOpen || !contact) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    setSending(true);
    await addActivity({
      company_id: companyId,
      activity_type: 'Email',
      notes: `To: ${contact.first_name} ${contact.last_name}\nSubject: ${subject.trim()}\n\n${message.trim()}`,
    });
    setSending(false);
    setSent(true);
    setTimeout(() => { setSent(false); setSubject(''); setMessage(''); onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-[520px] max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-[15px] font-semibold text-gray-900">Compose Email</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        {sent ? (
          <div className="p-8 flex flex-col items-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
            <p className="text-[14px] font-medium text-gray-900">Email activity logged!</p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-4 space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">To</label>
              <input value={`${contact.first_name} ${contact.last_name} <${contact.email || ''}>`} readOnly
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Subject *</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Enter subject..." />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-500 mb-1">Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                placeholder="Write your message..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose}
                className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
              <button type="submit" disabled={!subject.trim() || sending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-40 transition-colors">
                <Send className="w-3.5 h-3.5" />{sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

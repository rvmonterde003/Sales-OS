import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useRole } from '../hooks/useRole';
import { formatDateTime, CONTACT_ROLES } from '../lib/helpers';
import StatusBadge from '../components/StatusBadge';
import ActivityLogModal from '../components/ActivityLogModal';
import { ArrowLeft, Mail, Phone, Building2, Linkedin, Plus, Paperclip, Pencil, Trash2, X, Save } from 'lucide-react';

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contactId = Number(id);
  const { contacts, companies, opportunities, activities, salesStages, getUserName, updateContact, deleteContact } = useData();
  const { canEdit } = useRole();
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const contact = contacts.find(c => c.id === contactId);
  if (!contact) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-[13px]">Contact not found.</p>
        <Link to="/contacts" className="text-violet-600 text-[13px] mt-2 inline-block">Back to People</Link>
      </div>
    );
  }

  const company = companies.find(c => c.id === contact.company_id);
  const canEditThis = company ? canEdit(company.owner_id) : false;
  const linkedOpps = opportunities.filter(o => o.primary_contact_id === contact.id);
  const contactActivities = activities
    .filter(a => a.contact_id === contact.id)
    .sort((a, b) => new Date(b.activity_timestamp).getTime() - new Date(a.activity_timestamp).getTime());

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      <div className="px-5 py-2 border-b border-gray-200 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/contacts" className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-3 h-3" /> People
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-[12px] text-gray-900 font-medium">{contact.first_name} {contact.last_name}</span>
        </div>
        {canEditThis && !editing && (
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
              <Pencil className="w-3 h-3" /> Edit
            </button>
            <button onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-[12px] text-red-600 border border-red-200 rounded-md px-2.5 py-1.5 hover:bg-red-50">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {editing ? (
          <EditContactForm contact={contact} onSave={async (fields) => {
            await updateContact(contact.id, fields);
            setEditing(false);
          }} onCancel={() => setEditing(false)} />
        ) : (
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-[14px]">
                  {contact.first_name[0]}{contact.last_name[0]}
                </div>
                <div>
                  <h1 className="text-[18px] font-bold text-gray-900">
                    {contact.first_name} {contact.last_name}
                  </h1>
                  <div className="text-[12px] text-gray-500 mt-0.5">{contact.title || 'No title'}</div>
                  <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-500">
                    {company && (
                      <Link to={`/companies/${contact.company_id}`} className="flex items-center gap-1 text-violet-600 hover:underline">
                        <Building2 className="w-3 h-3" /> {company.name}
                      </Link>
                    )}
                    {contact.email && (
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.email}</span>
                    )}
                    {contact.phone && (
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {contact.phone}</span>
                    )}
                    {contact.linkedin_url && (
                      <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                        <Linkedin className="w-3 h-3" /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
              {contact.role && (
                <div className="text-right">
                  <StatusBadge status={contact.role} variant="tag" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Linked Opportunities */}
        {linkedOpps.length > 0 && (
          <div className="px-6 py-4">
            <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Linked Opportunities</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="attio-table w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/40">
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Company</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Stage</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Type</th>
                    <th className="text-right font-medium text-gray-500 px-5 py-1.5">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedOpps.map(opp => {
                    const oppCompany = companies.find(c => c.id === opp.company_id);
                    const stage = salesStages.find(s => s.id === opp.stage_id);
                    return (
                      <tr key={opp.id} className="border-b border-gray-50">
                        <td className="px-5 py-2">
                          <Link to={`/opportunities/${opp.id}`} className="text-gray-900 hover:text-violet-600 font-medium">{oppCompany?.name}</Link>
                        </td>
                        <td className="px-5 py-2"><StatusBadge status={stage?.name || ''} variant="tag" /></td>
                        <td className="px-5 py-2"><StatusBadge status={opp.opportunity_type} variant="tag" /></td>
                        <td className="px-5 py-2 text-right font-medium">
                          {opp.deal_value ? `$${opp.deal_value.toLocaleString()}` : '--'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity Log */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-gray-900">
              Activity Log
              <span className="ml-1.5 text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{contactActivities.length}</span>
            </h2>
            {company && canEdit(company.owner_id) && (
              <button onClick={() => setShowActivityModal(true)}
                className="flex items-center gap-1.5 bg-violet-600 text-white text-[12px] font-medium px-3 py-1.5 rounded-md hover:bg-violet-700 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Log Activity
              </button>
            )}
          </div>
          {contactActivities.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="attio-table w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/40">
                    <th className="text-left font-medium text-gray-500 px-4 py-1.5">Type</th>
                    <th className="text-left font-medium text-gray-500 px-4 py-1.5">Company</th>
                    <th className="text-left font-medium text-gray-500 px-4 py-1.5 w-[35%]">Notes</th>
                    <th className="text-left font-medium text-gray-500 px-4 py-1.5">Logged by</th>
                    <th className="text-left font-medium text-gray-500 px-4 py-1.5">When</th>
                    <th className="text-center font-medium text-gray-500 px-4 py-1.5 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {contactActivities.map(act => {
                    const actCompany = companies.find(c => c.id === act.company_id);
                    const attachments = (act.attachments || []) as { name: string; url: string; type: string }[];
                    return (
                      <tr key={act.id} className="border-b border-gray-50">
                        <td className="px-4 py-2.5"><StatusBadge status={act.activity_type} variant="tag" /></td>
                        <td className="px-4 py-2.5">
                          {actCompany ? (
                            <Link to={`/companies/${actCompany.id}`} className="text-gray-900 hover:text-violet-600 font-medium text-[12px]">{actCompany.name}</Link>
                          ) : '--'}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600 text-[12px] truncate max-w-0">{act.notes || '--'}</td>
                        <td className="px-4 py-2.5 text-gray-500 text-[12px]">{getUserName(act.logged_by)}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-[12px] whitespace-nowrap">{formatDateTime(act.activity_timestamp)}</td>
                        <td className="px-4 py-2.5 text-center">
                          {attachments.length > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-400" title={`${attachments.length} attachment(s)`}>
                              <Paperclip className="w-3 h-3" />{attachments.length}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg px-4 py-8 text-center text-[13px] text-gray-400">
              No activities logged for this contact yet.
            </div>
          )}
        </div>
      </div>

      <ActivityLogModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        defaultCompanyId={contact.company_id}
        defaultContactId={contact.id}
      />

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={() => setConfirmDelete(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[400px]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-[15px] font-semibold text-gray-900">Delete Contact</h2>
            </div>
            <div className="p-4">
              <p className="text-[13px] text-gray-600 mb-4">
                Are you sure you want to delete <strong>{contact.first_name} {contact.last_name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                <button onClick={async () => {
                  await deleteContact(contact.id);
                  navigate('/contacts');
                }}
                  className="px-3 py-1.5 text-[13px] bg-red-500 text-white rounded-md hover:bg-red-600 font-medium">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditContactForm({ contact, onSave, onCancel }: {
  contact: { first_name: string; last_name: string; email: string | null; phone: string | null; title: string | null; role: string | null; linkedin_url: string | null };
  onSave: (fields: Record<string, string | null>) => Promise<void>;
  onCancel: () => void;
}) {
  const [firstName, setFirstName] = useState(contact.first_name);
  const [lastName, setLastName] = useState(contact.last_name);
  const [email, setEmail] = useState(contact.email || '');
  const [phone, setPhone] = useState(contact.phone || '');
  const [title, setTitle] = useState(contact.title || '');
  const [role, setRole] = useState(contact.role || '');
  const [linkedinUrl, setLinkedinUrl] = useState(contact.linkedin_url || '');

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) return;
    await onSave({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      title: title.trim() || null,
      role: role || null,
      linkedin_url: linkedinUrl.trim() || null,
    });
  };

  const inputClass = "w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent";

  return (
    <div className="px-6 py-5 border-b border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-gray-900">Edit Contact</h2>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
            <X className="w-3 h-3" /> Cancel
          </button>
          <button onClick={handleSave} className="flex items-center gap-1.5 text-[12px] bg-violet-600 text-white rounded-md px-2.5 py-1.5 hover:bg-violet-700">
            <Save className="w-3 h-3" /> Save
          </button>
        </div>
      </div>
      <div className="space-y-3 max-w-lg">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">First Name *</label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Last Name *</label>
            <input value={lastName} onChange={e => setLastName(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Managing Partner" className={inputClass} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className={inputClass}>
              <option value="">Select...</option>
              {CONTACT_ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1">LinkedIn Profile</label>
          <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." className={inputClass} />
        </div>
      </div>
    </div>
  );
}

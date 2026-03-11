import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDateTime, timeAgo, FIRM_SIZES, UNQUALIFY_REASONS } from '../lib/helpers';
import { useData } from '../context/DataContext';
import { useRole } from '../hooks/useRole';
import StatusBadge from '../components/StatusBadge';
import ActivityLogModal from '../components/ActivityLogModal';
import CreateOpportunityModal from '../components/CreateOpportunityModal';
import {
  ArrowLeft, Globe, MessageSquarePlus, Save, Linkedin, Mail, Phone, Paperclip,
} from 'lucide-react';

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const companyId = Number(id);
  const {
    companies, contacts, activities, qualificationChecks, opportunities,
    getUserName, saveQualification, updateCompanyLeadStatus, updateCompany,
  } = useData();
  const { canEdit } = useRole();
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showCreateOpp, setShowCreateOpp] = useState(false);
  const [showUnqualifyModal, setShowUnqualifyModal] = useState(false);
  const [unqualifyReason, setUnqualifyReason] = useState('');
  const [unqualifyOther, setUnqualifyOther] = useState('');

  // Firm info form (SQL stage — includes firm name)
  const [firmForm, setFirmForm] = useState({ name: '', industry: '', firm_size: '', website: '' });

  // Qualification form
  const [qualForm, setQualForm] = useState({ pain_and_value: '', timeline: '', budget_pricing_fit: '', person_in_position: '' });
  const [qualDirty, setQualDirty] = useState(false);

  const company = companies.find(c => c.id === companyId);
  const canEditThis = company ? canEdit(company.owner_id) : false;
  const qualification = qualificationChecks.find(q => q.company_id === companyId);
  const contact = contacts.find(c => c.company_id === companyId);
  const companyActivities = activities
    .filter(a => a.company_id === companyId)
    .sort((a, b) => new Date(b.activity_timestamp).getTime() - new Date(a.activity_timestamp).getTime());
  const hasOpportunity = opportunities.some(o => o.company_id === companyId);

  // Sync forms when data loads
  useEffect(() => {
    if (company) {
      setFirmForm({
        name: company.name || '',
        industry: company.industry || '',
        firm_size: company.firm_size || '',
        website: company.website || '',
      });
    }
  }, [company]);

  useEffect(() => {
    if (qualification) {
      setQualForm({
        pain_and_value: qualification.pain_and_value || '',
        timeline: qualification.timeline || '',
        budget_pricing_fit: qualification.budget_pricing_fit || '',
        person_in_position: qualification.person_in_position || '',
      });
      setQualDirty(false);
    }
  }, [qualification]);

  // If lead now has an opportunity and is qualified, redirect to law firms
  useEffect(() => {
    if (company?.lead_status === 'Qualified' && hasOpportunity) {
      navigate(`/companies/${companyId}`, { replace: true });
    }
  }, [company?.lead_status, hasOpportunity, companyId, navigate]);

  if (!company) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-[13px]">Lead not found.</p>
        <Link to="/leads" className="text-violet-600 text-[13px] mt-2 inline-block">Back to Leads</Link>
      </div>
    );
  }

  const qualFields: Array<{ key: keyof typeof qualForm; label: string; placeholder: string }> = [
    { key: 'pain_and_value', label: 'Prospect Articulated Pain & Value', placeholder: 'Describe how the prospect sees value...' },
    { key: 'timeline', label: 'Timeline', placeholder: 'Expected timeline or trigger events...' },
    { key: 'budget_pricing_fit', label: 'Budget / Pricing Fit', placeholder: 'Budget availability and pricing alignment...' },
    { key: 'person_in_position', label: 'Person in Position', placeholder: 'Decision maker and their authority...' },
  ];
  const bantScore = qualFields.filter(f => qualForm[f.key].trim() !== '').length;

  const handleMoveToSql = async () => {
    await updateCompanyLeadStatus(company.id, 'SQL');
  };

  const handleSaveFirmInfo = async () => {
    await updateCompany(company.id, {
      name: firmForm.name.trim() || company.name,
      industry: firmForm.industry.trim() || null,
      firm_size: firmForm.firm_size || null,
      website: firmForm.website.trim() || null,
    });
  };

  const handleSaveQualification = async () => {
    await saveQualification(company.id, qualForm);
    setQualDirty(false);
    if (bantScore === 4) {
      await updateCompanyLeadStatus(company.id, 'Qualified');
      // Auto-open create opportunity modal
      setShowCreateOpp(true);
    }
  };

  const handleUnqualify = () => {
    const reason = unqualifyReason === 'Other' ? (unqualifyOther.trim() || 'Other') : unqualifyReason;
    if (reason) {
      updateCompanyLeadStatus(company.id, 'Unqualified', reason);
      setShowUnqualifyModal(false);
      setUnqualifyReason('');
      setUnqualifyOther('');
      navigate('/leads');
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-md px-3 py-2 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      {/* Top bar */}
      <div className="px-5 py-2 border-b border-gray-200 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/leads" className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-3 h-3" /> Leads
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-[12px] text-gray-900 font-medium">{contact ? `${contact.first_name} ${contact.last_name}` : company.name}</span>
        </div>
        {canEditThis && (
          <button onClick={() => setShowActivityModal(true)}
            className="flex items-center gap-1.5 bg-violet-600 text-white text-[12px] font-medium px-3 py-1.5 rounded-md hover:bg-violet-700 transition-colors">
            <MessageSquarePlus className="w-3.5 h-3.5" /> Log Activity
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header — contact-centric */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-[14px]">
                  {contact ? contact.first_name[0] : company.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-[18px] font-bold text-gray-900">
                      {contact ? `${contact.first_name} ${contact.last_name}` : company.name}
                    </h1>
                    <StatusBadge status={company.lead_status} variant="tag" />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[12px] text-gray-500">
                    {/* Show firm name badge if it's been set */}
                    {company.name && (
                      <StatusBadge status={company.name} variant="tag" />
                    )}
                    {company.industry && <StatusBadge status={company.industry} variant="tag" />}
                    {company.firm_size && <StatusBadge status={company.firm_size} variant="tag" />}
                    {company.website && (
                      <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-violet-600 hover:underline">
                        <Globe className="w-3 h-3" />{company.website}
                      </a>
                    )}
                    {company.source && <StatusBadge status={company.source} variant="tag" />}
                  </div>
                </div>
              </div>
              <div className="text-right text-[12px] text-gray-400">
                <div>Owner: <span className="text-gray-700 font-medium">{getUserName(company.owner_id)}</span></div>
                <div>Last activity: {timeAgo(company.last_activity_at)}</div>
              </div>
            </div>
          </div>

          {/* Contact details */}
          {contact && (
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-[13px] font-semibold text-gray-900 mb-2">Contact Details</h2>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-[11px]">
                  {contact.first_name[0]}{contact.last_name[0]}
                </div>
                <div className="flex items-center gap-4 text-[12px]">
                  <span className="font-medium text-gray-900">{contact.first_name} {contact.last_name}</span>
                  {contact.email && <span className="flex items-center gap-1 text-gray-500"><Mail className="w-3 h-3" />{contact.email}</span>}
                  {contact.phone && <span className="flex items-center gap-1 text-gray-500"><Phone className="w-3 h-3" />{contact.phone}</span>}
                  {contact.linkedin_url && (
                    <a href={contact.linkedin_url.startsWith('http') ? contact.linkedin_url : `https://${contact.linkedin_url}`}
                      target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                      <Linkedin className="w-3 h-3" /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className={`flex-1 h-2 rounded-full ${company.lead_status === 'MQL' ? 'bg-violet-500' : 'bg-emerald-400'}`} />
              <span className={`text-[11px] ${company.lead_status === 'MQL' ? 'text-violet-600 font-semibold' : 'text-gray-400'}`}>MQL</span>
              <span className="text-gray-300 text-[10px]">&rarr;</span>
              <div className={`flex-1 h-2 rounded-full ${company.lead_status === 'SQL' ? 'bg-violet-500' : company.lead_status === 'Qualified' ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              <span className={`text-[11px] ${company.lead_status === 'SQL' ? 'text-violet-600 font-semibold' : 'text-gray-400'}`}>SQL</span>
              <span className="text-gray-300 text-[10px]">&rarr;</span>
              <div className={`flex-1 h-2 rounded-full ${company.lead_status === 'Qualified' ? 'bg-violet-500' : 'bg-gray-200'}`} />
              <span className={`text-[11px] ${company.lead_status === 'Qualified' ? 'text-violet-600 font-semibold' : 'text-gray-400'}`}>Qualified</span>
            </div>
          </div>

          {/* MQL: Move to SQL */}
          {company.lead_status === 'MQL' && canEditThis && (
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-[13px] text-gray-600 mb-3">This lead is at MQL stage. Move to SQL to begin qualification.</p>
              <button onClick={handleMoveToSql}
                className="text-[12px] bg-violet-600 text-white px-4 py-2 rounded-md hover:bg-violet-700 font-medium">
                Move to SQL
              </button>
            </div>
          )}

          {/* SQL: Firm info + Qualification */}
          {company.lead_status === 'SQL' && (
            <div className="px-6 py-4 border-b border-gray-100">
              {/* Firm details */}
              <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Firm Information</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">Firm Name *</label>
                  <input value={firmForm.name} onChange={e => setFirmForm(p => ({ ...p, name: e.target.value }))}
                    disabled={!canEditThis} placeholder="e.g. Smith & Associates" className={inputClass} />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">Industry</label>
                  <input value={firmForm.industry} onChange={e => setFirmForm(p => ({ ...p, industry: e.target.value }))}
                    disabled={!canEditThis} placeholder="e.g. Personal Injury" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">Firm Size</label>
                  <select value={firmForm.firm_size} onChange={e => setFirmForm(p => ({ ...p, firm_size: e.target.value }))}
                    disabled={!canEditThis} className={inputClass}>
                    <option value="">Select...</option>
                    {FIRM_SIZES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">Website</label>
                  <input value={firmForm.website} onChange={e => setFirmForm(p => ({ ...p, website: e.target.value }))}
                    disabled={!canEditThis} placeholder="example.com" className={inputClass} />
                </div>
              </div>
              {canEditThis && (
                <button onClick={handleSaveFirmInfo}
                  className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 mb-6">
                  <Save className="w-3 h-3" /> Save Firm Info
                </button>
              )}

              {/* BANT Qualification */}
              <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Qualification</h2>
              <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(bantScore / 4) * 100}%` }} />
              </div>
              <div className="space-y-3">
                {qualFields.map(item => (
                  <div key={item.key}>
                    <label className="block text-[12px] font-medium text-gray-700 mb-1">{item.label}</label>
                    <textarea value={qualForm[item.key]}
                      onChange={e => { setQualForm(prev => ({ ...prev, [item.key]: e.target.value })); setQualDirty(true); }}
                      placeholder={item.placeholder} rows={2} disabled={!canEditThis} className={inputClass} />
                  </div>
                ))}
              </div>
              {canEditThis && (
                <div className="flex items-center gap-2 mt-4">
                  <button onClick={handleSaveQualification} disabled={bantScore < 4}
                    className="flex items-center gap-1.5 text-[12px] bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700 font-medium disabled:opacity-40 transition-colors">
                    <Save className="w-3 h-3" /> Save Qualification {bantScore < 4 ? `(${bantScore}/4)` : ''}
                  </button>
                  {qualDirty && bantScore < 4 && (
                    <button onClick={async () => { await saveQualification(company.id, qualForm); setQualDirty(false); }}
                      className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50">
                      <Save className="w-3 h-3" /> Save Draft
                    </button>
                  )}
                  <button onClick={() => setShowUnqualifyModal(true)}
                    className="text-[12px] bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 font-medium">
                    Unqualify
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Qualified: Create opportunity */}
          {company.lead_status === 'Qualified' && !hasOpportunity && (
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                <p className="text-[13px] text-emerald-800 font-medium mb-2">Lead is qualified!</p>
                <p className="text-[12px] text-emerald-600 mb-3">Create an opportunity to move this lead to Law Firms.</p>
                {canEditThis && (
                  <button onClick={() => setShowCreateOpp(true)}
                    className="text-[12px] bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 font-medium">
                    Create Opportunity
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Activity Timeline */}
        <div className="w-[320px] border-l border-gray-100 overflow-y-auto">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-900">Activity</h2>
          </div>
          <div className="p-4 space-y-3">
            {companyActivities.length === 0 ? (
              <p className="text-[12px] text-gray-400 text-center py-4">No activities</p>
            ) : (
              companyActivities.map(act => {
                const actContact = act.contact_id ? contacts.find(c => c.id === act.contact_id) : null;
                const attachments = (act.attachments || []) as { name: string; url: string; type: string }[];
                const isQualified = act.notes?.startsWith('[QUALIFIED]');
                const isStatusChange = act.notes?.startsWith('[MOVED TO SQL]') || act.notes?.startsWith('[UNQUALIFIED]');
                return (
                  <div key={act.id} className={`flex gap-2.5 rounded-md p-1.5 ${
                    isQualified ? 'bg-green-50 border border-green-200' :
                    isStatusChange ? 'bg-blue-50 border border-blue-200' : ''
                  }`}>
                    <StatusBadge status={act.activity_type} variant="tag" />
                    <div className="flex-1 min-w-0">
                      {actContact && (
                        <span className="text-[11px] text-violet-600 font-medium">
                          {actContact.first_name} {actContact.last_name}
                        </span>
                      )}
                      <p className="text-[12px] text-gray-700 leading-relaxed">{act.notes || '--'}</p>
                      {attachments.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {attachments.map((file, i) => (
                            <a key={i} href={file.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 hover:text-violet-600 px-1.5 py-0.5 rounded">
                              <Paperclip className="w-2.5 h-2.5" />{file.name}
                            </a>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-400">
                        <span>{getUserName(act.logged_by)}</span>
                        <span>&middot;</span>
                        <span>{formatDateTime(act.activity_timestamp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <ActivityLogModal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} defaultCompanyId={company.id} />
      <CreateOpportunityModal isOpen={showCreateOpp} onClose={() => setShowCreateOpp(false)} companyId={company.id} />

      {/* Unqualify Modal */}
      {showUnqualifyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={() => setShowUnqualifyModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[400px]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-[15px] font-semibold text-gray-900">Unqualify Lead</h2>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1">Reason *</label>
                <select value={unqualifyReason} onChange={e => setUnqualifyReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                  <option value="">Select reason...</option>
                  {UNQUALIFY_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {unqualifyReason === 'Other' && (
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">Specify</label>
                  <input value={unqualifyOther} onChange={e => setUnqualifyOther(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Enter reason..." />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowUnqualifyModal(false)}
                  className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                <button onClick={handleUnqualify} disabled={!unqualifyReason || (unqualifyReason === 'Other' && !unqualifyOther.trim())}
                  className="px-3 py-1.5 text-[13px] bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-40 font-medium">
                  Confirm Unqualify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

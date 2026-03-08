import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatCurrency, formatDate, formatDateTime, timeAgo, getDealAge, UNQUALIFY_REASONS } from '../lib/helpers';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import InlinePipelineControl from '../components/InlinePipelineControl';
import ActivityLogModal from '../components/ActivityLogModal';
import AddContactModal from '../components/AddContactModal';
import CreateOpportunityModal from '../components/CreateOpportunityModal';
import { ArrowLeft, Globe, Plus, MessageSquarePlus, Briefcase, FileText, Download, Paperclip } from 'lucide-react';

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const companyId = Number(id);
  const {
    companies, contacts, opportunities, activities,
    qualificationChecks, inactivityFlags, stageTransitions,
    salesStages, getUserName, updateQualification, updateCompanyLeadStatus,
  } = useData();
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showCreateOpp, setShowCreateOpp] = useState(false);
  const [showUnqualifyModal, setShowUnqualifyModal] = useState(false);
  const [unqualifyReason, setUnqualifyReason] = useState('');

  const company = companies.find(c => c.id === companyId);
  if (!company) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-[13px]">Company not found.</p>
        <Link to="/companies" className="text-violet-600 text-[13px] mt-2 inline-block">Back to Companies</Link>
      </div>
    );
  }

  const companyContacts = contacts.filter(c => c.company_id === company.id);
  const companyOpps = opportunities.filter(o => o.company_id === company.id);
  const openOpps = companyOpps.filter(o => !o.closed_at);
  const companyActivities = activities
    .filter(a => a.company_id === company.id)
    .sort((a, b) => new Date(b.activity_timestamp).getTime() - new Date(a.activity_timestamp).getTime());
  const qualification = qualificationChecks.find(q => q.company_id === company.id);
  const flags = inactivityFlags.filter(f => f.company_id === company.id && !f.resolved_at);

  const qualFields: Array<{ key: 'pain_and_value' | 'timeline' | 'budget_pricing_fit' | 'person_in_position'; label: string; placeholder: string }> = [
    { key: 'pain_and_value', label: 'Prospect Articulated Pain & Value', placeholder: 'Describe how the prospect sees value...' },
    { key: 'timeline', label: 'Timeline', placeholder: 'Expected timeline or trigger events...' },
    { key: 'budget_pricing_fit', label: 'Budget / Pricing Fit', placeholder: 'Budget availability and pricing alignment...' },
    { key: 'person_in_position', label: 'Person in Position', placeholder: 'Decision maker and their authority...' },
  ];
  const bantScore = qualification ? qualFields.filter(f => (qualification[f.key] || '').trim() !== '').length : 0;

  const getDaysInStage = (oppId: number, createdAt: string) => {
    const t = stageTransitions.find(t => t.opportunity_id === oppId);
    return Math.floor((Date.now() - new Date(t?.created_at || createdAt).getTime()) / 86400000);
  };

  const handleLeadStatusAdvance = () => {
    if (company.lead_status === 'MQL') {
      updateCompanyLeadStatus(company.id, 'SQL');
    } else if (company.lead_status === 'SQL' && bantScore === 4) {
      updateCompanyLeadStatus(company.id, 'Qualified');
    }
  };

  const handleUnqualify = () => {
    if (unqualifyReason) {
      updateCompanyLeadStatus(company.id, 'Unqualified', unqualifyReason);
      setShowUnqualifyModal(false);
      setUnqualifyReason('');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      {/* Back bar */}
      <div className="px-5 py-2 border-b border-gray-200 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/companies" className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-3 h-3" /> Companies
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-[12px] text-gray-900 font-medium">{company.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAddContact(true)}
            className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
            <Plus className="w-3 h-3" /> Add Contact
          </button>
          {bantScore === 4 && company.lead_status === 'Qualified' && (
            <button onClick={() => setShowCreateOpp(true)}
              className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
              <Briefcase className="w-3 h-3" /> Create Opportunity
            </button>
          )}
          <button onClick={() => setShowActivityModal(true)}
            className="flex items-center gap-1.5 bg-violet-600 text-white text-[12px] font-medium px-3 py-1.5 rounded-md hover:bg-violet-700 transition-colors">
            <MessageSquarePlus className="w-3.5 h-3.5" /> Log Activity
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-[14px]">
                  {company.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-[18px] font-bold text-gray-900">{company.name}</h1>
                    <StatusBadge status={company.status} />
                    <StatusBadge status={company.lead_status} variant="tag" />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[12px] text-gray-500">
                    {company.industry && <StatusBadge status={company.industry} variant="tag" />}
                    {company.firm_size && <StatusBadge status={company.firm_size} variant="tag" />}
                    {company.website && (
                      <span className="flex items-center gap-1 text-violet-600">
                        <Globe className="w-3 h-3" />{company.website}
                      </span>
                    )}
                  </div>
                  {company.lead_status === 'Unqualified' && company.unqualify_reason && (
                    <div className="mt-1 text-[11px] text-red-600">Reason: {company.unqualify_reason}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right text-[12px] text-gray-400">
              <div>Owner: <span className="text-gray-700 font-medium">{getUserName(company.owner_id)}</span></div>
              <div>Last activity: {timeAgo(company.last_activity_at)}</div>
            </div>
          </div>
        </div>

        {/* Stage 0 Pipeline: MQL → SQL → Qualify/Unqualify */}
        {company.lead_status !== 'Qualified' && company.lead_status !== 'Unqualified' && (
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Stage 0 Pipeline</h2>
            <div className="flex items-center gap-2 mb-3">
              {(['MQL', 'SQL', 'Qualified'] as const).map((step, i) => {
                const isActive = step === company.lead_status;
                const isPast = (step === 'MQL' && (company.lead_status === 'SQL' || company.lead_status === 'Qualified')) ||
                               (step === 'SQL' && company.lead_status === 'Qualified');
                return (
                  <div key={step} className="flex items-center gap-2 flex-1">
                    <div className={`flex-1 h-2 rounded-full ${isActive ? 'bg-violet-500' : isPast ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                    <span className={`text-[11px] ${isActive ? 'text-violet-600 font-semibold' : 'text-gray-400'}`}>{step}</span>
                    {i < 2 && <span className="text-gray-300 text-[10px]">&rarr;</span>}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              {company.lead_status === 'MQL' && (
                <button onClick={handleLeadStatusAdvance}
                  className="text-[12px] bg-violet-600 text-white px-3 py-1.5 rounded-md hover:bg-violet-700 font-medium">
                  Advance to SQL
                </button>
              )}
              {company.lead_status === 'SQL' && (
                <>
                  <button onClick={handleLeadStatusAdvance} disabled={bantScore < 4}
                    className="text-[12px] bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700 font-medium disabled:opacity-40">
                    Qualify {bantScore < 4 ? `(${bantScore}/4 BANT)` : ''}
                  </button>
                  <button onClick={() => setShowUnqualifyModal(true)}
                    className="text-[12px] bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 font-medium">
                    Unqualify
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Risk Flags */}
        {flags.length > 0 && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-center gap-2 flex-wrap">
            {flags.map(f => <StatusBadge key={f.id} status={f.flag_type} variant="tag" />)}
          </div>
        )}

        {/* Pipeline Status */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Pipeline Status</h2>
          {openOpps.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
              <p className="text-[13px] text-gray-400">No active opportunities</p>
              <p className="text-[11px] text-gray-300 mt-1">Create an opportunity to start tracking</p>
            </div>
          ) : (
            <div className="space-y-3">
              {openOpps.map(opp => {
                const stage = salesStages.find(s => s.id === opp.stage_id);
                const contact = opp.primary_contact_id ? contacts.find(c => c.id === opp.primary_contact_id) : null;
                return (
                  <Link key={opp.id} to={`/opportunities/${opp.id}`}
                    className="block border border-gray-200 rounded-lg p-3 hover:border-violet-300 hover:bg-violet-50/30 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-gray-900">{stage?.name}</span>
                        <StatusBadge status={opp.opportunity_type} variant="tag" />
                        {opp.forecast_category && <StatusBadge status={opp.forecast_category} variant="tag" />}
                      </div>
                      <span className="text-[14px] font-bold text-gray-900">{formatCurrency(opp.deal_value)}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-2 truncate">{opp.service_description}</p>
                    <InlinePipelineControl oppId={opp.id} currentStageId={opp.stage_id} compact />
                    <div className="flex items-center justify-between mt-2 text-[11px] text-gray-400">
                      <span>{contact ? `${contact.first_name} ${contact.last_name}` : '--'}</span>
                      <div className="flex items-center gap-3">
                        {opp.expected_close_date && <span>Close: {formatDate(opp.expected_close_date)}</span>}
                        <span>{getDealAge(opp.created_at, opp.closed_at)}d old</span>
                        <span className={getDaysInStage(opp.id, opp.created_at) > 14 ? 'text-red-500' : ''}>
                          {getDaysInStage(opp.id, opp.created_at)}d in stage
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Qualification (BANT) */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-gray-900">Qualification (BANT)</h2>
            <span className="text-[11px] text-gray-400">{bantScore}/4 completed</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(bantScore / 4) * 100}%` }} />
          </div>
          <div className="space-y-3">
            {qualFields.map(item => (
              <div key={item.key}>
                <label className="block text-[12px] font-medium text-gray-700 mb-1">{item.label}</label>
                <textarea
                  value={qualification?.[item.key] || ''}
                  onChange={e => updateQualification(company.id, item.key, e.target.value)}
                  placeholder={item.placeholder}
                  rows={2}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-gray-100 min-h-0">
          {/* Left: Contacts + Opportunities */}
          <div className="col-span-2">
            {/* Contacts */}
            <div className="border-b border-gray-100">
              <div className="px-5 py-3 flex items-center gap-2">
                <h2 className="text-[13px] font-semibold text-gray-900">Contacts</h2>
                <span className="text-[11px] text-gray-400">{companyContacts.length}</span>
              </div>
              <table className="attio-table w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/40">
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Name</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Title</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Role</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Email</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {companyContacts.map(contact => (
                    <tr key={contact.id} className="border-b border-gray-50">
                      <td className="px-5 py-2">
                        <Link to={`/contacts/${contact.id}`} className="text-gray-900 hover:text-violet-600 font-medium">
                          {contact.first_name} {contact.last_name}
                        </Link>
                      </td>
                      <td className="px-5 py-2 text-gray-500 text-[12px]">{contact.title || '--'}</td>
                      <td className="px-5 py-2">{contact.role ? <StatusBadge status={contact.role} variant="tag" /> : <span className="text-gray-300">--</span>}</td>
                      <td className="px-5 py-2 text-gray-400 text-[12px]">{contact.email || '--'}</td>
                      <td className="px-5 py-2 text-gray-400 text-[12px]">{contact.phone || '--'}</td>
                    </tr>
                  ))}
                  {companyContacts.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-4 text-center text-[12px] text-gray-400">No contacts yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Opportunities */}
            <div>
              <div className="px-5 py-3 flex items-center gap-2">
                <h2 className="text-[13px] font-semibold text-gray-900">Opportunities</h2>
                <span className="text-[11px] text-gray-400">{companyOpps.length}</span>
              </div>
              <table className="attio-table w-full text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/40">
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Stage</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Service</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Type</th>
                    <th className="text-right font-medium text-gray-500 px-5 py-1.5">Value</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Forecast</th>
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">Close date</th>
                    <th className="text-right font-medium text-gray-500 px-5 py-1.5">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {companyOpps.map(opp => {
                    const stage = salesStages.find(s => s.id === opp.stage_id);
                    return (
                      <tr key={opp.id} className="border-b border-gray-50">
                        <td className="px-5 py-2">
                          <Link to={`/opportunities/${opp.id}`} className="text-gray-900 hover:text-violet-600 font-medium">{stage?.name}</Link>
                        </td>
                        <td className="px-5 py-2 text-gray-600 text-[12px] truncate max-w-[200px]">{opp.service_description}</td>
                        <td className="px-5 py-2"><StatusBadge status={opp.opportunity_type} variant="tag" /></td>
                        <td className="px-5 py-2 text-right font-medium text-gray-900">{formatCurrency(opp.deal_value)}</td>
                        <td className="px-5 py-2">{opp.forecast_category ? <StatusBadge status={opp.forecast_category} variant="tag" /> : <span className="text-gray-300">--</span>}</td>
                        <td className="px-5 py-2 text-gray-500 text-[12px]">{formatDate(opp.expected_close_date)}</td>
                        <td className="px-5 py-2 text-right text-gray-400 text-[12px]">{getDealAge(opp.created_at, opp.closed_at)}d</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Activity Timeline */}
          <div className="overflow-y-auto max-h-[calc(100vh-250px)]">
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
                  return (
                    <div key={act.id} className="flex gap-2.5">
                      <StatusBadge status={act.activity_type} variant="tag" />
                      <div className="flex-1 min-w-0">
                        {actContact && (
                          <Link to={`/contacts/${actContact.id}`} className="text-[11px] text-violet-600 hover:underline font-medium">
                            {actContact.first_name} {actContact.last_name}
                          </Link>
                        )}
                        <p className="text-[12px] text-gray-700 leading-relaxed">{act.notes || '--'}</p>
                        {attachments.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {attachments.map((file, i) => (
                              <a key={i} href={file.url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 hover:text-violet-600 px-1.5 py-0.5 rounded">
                                {file.type === 'link' ? <FileText className="w-2.5 h-2.5" /> : <Download className="w-2.5 h-2.5" />}
                                {file.name}
                              </a>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-400">
                          <span>{getUserName(act.logged_by)}</span>
                          <span>&middot;</span>
                          <span>{formatDateTime(act.activity_timestamp)}</span>
                          {attachments.length > 0 && (
                            <>
                              <span>&middot;</span>
                              <span className="flex items-center gap-0.5"><Paperclip className="w-2.5 h-2.5" />{attachments.length}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      <ActivityLogModal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} defaultCompanyId={company.id} />
      <AddContactModal isOpen={showAddContact} onClose={() => setShowAddContact(false)} defaultCompanyId={company.id} />
      <CreateOpportunityModal isOpen={showCreateOpp} onClose={() => setShowCreateOpp(false)} companyId={company.id} />

      {/* Unqualify Modal */}
      {showUnqualifyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={() => setShowUnqualifyModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[400px]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-[15px] font-semibold text-gray-900">Unqualify Company</h2>
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
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowUnqualifyModal(false)}
                  className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                <button onClick={handleUnqualify} disabled={!unqualifyReason}
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

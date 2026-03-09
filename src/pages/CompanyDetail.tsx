import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate, formatDateTime, timeAgo, getDealAge, UNQUALIFY_REASONS, PUSHBACK_REASONS } from '../lib/helpers';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import ActivityLogModal from '../components/ActivityLogModal';
import AddContactModal from '../components/AddContactModal';
import CreateOpportunityModal from '../components/CreateOpportunityModal';
import {
  ArrowLeft, Globe, Plus, MessageSquarePlus, Briefcase,
  FileText, Download, Paperclip, Save, Linkedin,
} from 'lucide-react';

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const companyId = Number(id);
  const {
    companies, contacts, opportunities, activities,
    qualificationChecks, inactivityFlags, stageTransitions,
    salesStages, getUserName, saveQualification, updateCompanyLeadStatus,
    pushbackStage, reopenOpportunity,
  } = useData();
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showCreateOpp, setShowCreateOpp] = useState(false);
  const [showUnqualifyModal, setShowUnqualifyModal] = useState(false);
  const [unqualifyReason, setUnqualifyReason] = useState('');
  const [unqualifyOther, setUnqualifyOther] = useState('');
  const [showPushbackModal, setShowPushbackModal] = useState<number | null>(null);
  const [pushbackReason, setPushbackReason] = useState('');

  // Local qualification form state (saved on button click, not realtime)
  const [qualForm, setQualForm] = useState({ pain_and_value: '', timeline: '', budget_pricing_fit: '', person_in_position: '' });
  const [qualDirty, setQualDirty] = useState(false);

  const company = companies.find(c => c.id === companyId);
  const qualification = qualificationChecks.find(q => q.company_id === companyId);

  // Sync local form when qualification data loads/changes
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
  const flags = inactivityFlags.filter(f => f.company_id === company.id && !f.resolved_at);
  const nonTerminalStages = salesStages.filter(s => s.name !== 'Won' && s.name !== 'Loss');

  const qualFields: Array<{ key: keyof typeof qualForm; label: string; placeholder: string }> = [
    { key: 'pain_and_value', label: 'Prospect Articulated Pain & Value', placeholder: 'Describe how the prospect sees value...' },
    { key: 'timeline', label: 'Timeline', placeholder: 'Expected timeline or trigger events...' },
    { key: 'budget_pricing_fit', label: 'Budget / Pricing Fit', placeholder: 'Budget availability and pricing alignment...' },
    { key: 'person_in_position', label: 'Person in Position', placeholder: 'Decision maker and their authority...' },
  ];
  const bantScore = qualFields.filter(f => qualForm[f.key].trim() !== '').length;
  const isQualified = company.lead_status === 'Qualified';

  const getDaysInStage = (oppId: number, createdAt: string) => {
    const t = stageTransitions.find(t => t.opportunity_id === oppId);
    return Math.floor((Date.now() - new Date(t?.created_at || createdAt).getTime()) / 86400000);
  };

  const handleSaveQualification = async () => {
    await saveQualification(company.id, qualForm);
    setQualDirty(false);
    // If all 4 filled, auto-qualify the company
    if (bantScore === 4) {
      await updateCompanyLeadStatus(company.id, 'Qualified');
    }
  };

  const handleUnqualify = () => {
    const reason = unqualifyReason === 'Other' ? (unqualifyOther.trim() || 'Other') : unqualifyReason;
    if (reason) {
      updateCompanyLeadStatus(company.id, 'Unqualified', reason);
      setShowUnqualifyModal(false);
      setUnqualifyReason('');
      setUnqualifyOther('');
    }
  };

  const handlePushback = async () => {
    if (showPushbackModal && pushbackReason) {
      await pushbackStage(showPushbackModal, pushbackReason);
      setShowPushbackModal(null);
      setPushbackReason('');
    }
  };

  const isPushbackActivity = (notes: string | null) => notes?.startsWith('[PUSHBACK]');
  const isClosedWonActivity = (notes: string | null) => notes?.startsWith('[CLOSED WON]');
  const isClosedLostActivity = (notes: string | null) => notes?.startsWith('[CLOSED LOST]');
  const isReopenActivity = (notes: string | null) => notes?.startsWith('[REOPENED]');

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
          {isQualified && (
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

      <div className="flex-1 overflow-hidden flex flex-col">
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
                    {company.source && <StatusBadge status={company.source} variant="tag" />}
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

        {/* Risk Flags */}
        {flags.length > 0 && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-center gap-2 flex-wrap">
            {flags.map(f => <StatusBadge key={f.id} status={f.flag_type} variant="tag" />)}
          </div>
        )}

        {/* Stage 0: MQL → SQL button */}
        {company.lead_status === 'MQL' && (
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1 h-2 rounded-full bg-violet-500" />
                <span className="text-[11px] text-violet-600 font-semibold">MQL</span>
                <span className="text-gray-300 text-[10px]">&rarr;</span>
                <div className="flex-1 h-2 rounded-full bg-gray-200" />
                <span className="text-[11px] text-gray-400">SQL</span>
                <span className="text-gray-300 text-[10px]">&rarr;</span>
                <div className="flex-1 h-2 rounded-full bg-gray-200" />
                <span className="text-[11px] text-gray-400">Qualified</span>
              </div>
              <button onClick={() => updateCompanyLeadStatus(company.id, 'SQL')}
                className="text-[12px] bg-violet-600 text-white px-3 py-1.5 rounded-md hover:bg-violet-700 font-medium">
                Move to SQL
              </button>
            </div>
          </div>
        )}

        {/* Stage 0: SQL → Qualification form */}
        {company.lead_status === 'SQL' && (
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1 h-2 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-gray-400">MQL</span>
                <span className="text-gray-300 text-[10px]">&rarr;</span>
                <div className="flex-1 h-2 rounded-full bg-violet-500" />
                <span className="text-[11px] text-violet-600 font-semibold">SQL</span>
                <span className="text-gray-300 text-[10px]">&rarr;</span>
                <div className="flex-1 h-2 rounded-full bg-gray-200" />
                <span className="text-[11px] text-gray-400">Qualified</span>
              </div>
            </div>

            <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Qualification</h2>
            <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(bantScore / 4) * 100}%` }} />
            </div>
            <div className="space-y-3">
              {qualFields.map(item => (
                <div key={item.key}>
                  <label className="block text-[12px] font-medium text-gray-700 mb-1">{item.label}</label>
                  <textarea
                    value={qualForm[item.key]}
                    onChange={e => { setQualForm(prev => ({ ...prev, [item.key]: e.target.value })); setQualDirty(true); }}
                    placeholder={item.placeholder}
                    rows={2}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
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
          </div>
        )}

        {/* Pipeline Status — Only show when Qualified */}
        {isQualified && (
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Pipeline</h2>
            {openOpps.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center">
                <p className="text-[13px] text-gray-400">No active opportunities</p>
                <p className="text-[11px] text-gray-300 mt-1">Create an opportunity to start tracking deals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {openOpps.map(opp => {
                  const stage = salesStages.find(s => s.id === opp.stage_id);
                  const contact = opp.primary_contact_id ? contacts.find(c => c.id === opp.primary_contact_id) : null;

                  return (
                    <div key={opp.id}
                      onClick={() => navigate(`/opportunities/${opp.id}`)}
                      className="border border-gray-200 rounded-lg p-3 cursor-pointer transition-colors hover:bg-gray-900 hover:border-gray-900 group/card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-medium text-gray-900 group-hover/card:text-white">{stage?.name}</span>
                          <StatusBadge status={opp.opportunity_type} variant="tag" />
                          {opp.forecast_category && <StatusBadge status={opp.forecast_category} variant="tag" />}
                        </div>
                        <span className="text-[14px] font-bold text-gray-900 group-hover/card:text-white">{formatCurrency(opp.deal_value)}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-2 truncate group-hover/card:text-gray-400">{opp.service_description}</p>

                      {/* Stage progress bar */}
                      <div className="flex items-center gap-0.5 mb-2">
                        {nonTerminalStages.map(s => {
                          const isCurrent = s.id === opp.stage_id;
                          const isPast = s.stage_order < (stage?.stage_order || 0);
                          return (
                            <div key={s.id} className="flex-1">
                              <div className={`h-1.5 rounded-full ${
                                isCurrent ? 'bg-violet-500 group-hover/card:bg-violet-400' : isPast ? 'bg-emerald-400 group-hover/card:bg-emerald-300' : 'bg-gray-200 group-hover/card:bg-gray-600'
                              }`} />
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between mt-2 text-[11px] text-gray-400 group-hover/card:text-gray-500">
                        <span>{contact ? `${contact.first_name} ${contact.last_name}` : '--'}</span>
                        <div className="flex items-center gap-3">
                          {opp.expected_close_date && <span>Close: {formatDate(opp.expected_close_date)}</span>}
                          <span>{getDealAge(opp.created_at, opp.closed_at)}d old</span>
                          <span className={getDaysInStage(opp.id, opp.created_at) > 14 ? 'text-red-500 group-hover/card:text-red-400' : ''}>
                            {getDaysInStage(opp.id, opp.created_at)}d in stage
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 divide-x divide-gray-100 min-h-0 flex-1">
          {/* Left: Contacts + Opportunities */}
          <div className="col-span-2 overflow-y-auto">
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
                    <th className="text-left font-medium text-gray-500 px-5 py-1.5">LinkedIn</th>
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
                      <td className="px-5 py-2">
                        {contact.linkedin_url ? (
                          <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        ) : <span className="text-gray-300">--</span>}
                      </td>
                    </tr>
                  ))}
                  {companyContacts.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-4 text-center text-[12px] text-gray-400">No contacts yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Closed Opportunities table */}
            {companyOpps.filter(o => o.closed_at).length > 0 && (
              <div>
                <div className="px-5 py-3 flex items-center gap-2">
                  <h2 className="text-[13px] font-semibold text-gray-900">Closed Deals</h2>
                  <span className="text-[11px] text-gray-400">{companyOpps.filter(o => o.closed_at).length}</span>
                </div>
                <table className="attio-table w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/40">
                      <th className="text-left font-medium text-gray-500 px-5 py-1.5">Result</th>
                      <th className="text-left font-medium text-gray-500 px-5 py-1.5">Service</th>
                      <th className="text-right font-medium text-gray-500 px-5 py-1.5">Value</th>
                      <th className="text-left font-medium text-gray-500 px-5 py-1.5">Close date</th>
                      <th className="text-right font-medium text-gray-500 px-5 py-1.5">Age</th>
                      <th className="text-right font-medium text-gray-500 px-5 py-1.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyOpps.filter(o => o.closed_at).map(opp => {
                      const stage = salesStages.find(s => s.id === opp.stage_id);
                      const isLost = stage?.name === 'Loss';
                      return (
                        <tr key={opp.id} className="border-b border-gray-50">
                          <td className="px-5 py-2">
                            <Link to={`/opportunities/${opp.id}`} className="font-medium"><StatusBadge status={stage?.name || ''} variant="tag" /></Link>
                          </td>
                          <td className="px-5 py-2 text-gray-600 text-[12px] truncate max-w-[200px]">{opp.service_description}</td>
                          <td className="px-5 py-2 text-right font-medium text-gray-900">{formatCurrency(opp.deal_value)}</td>
                          <td className="px-5 py-2 text-gray-500 text-[12px]">{formatDate(opp.closed_at)}</td>
                          <td className="px-5 py-2 text-right text-gray-400 text-[12px]">{getDealAge(opp.created_at, opp.closed_at)}d</td>
                          <td className="px-5 py-2 text-right">
                            {isLost && (
                              <button onClick={() => reopenOpportunity(opp.id)}
                                className="text-[11px] text-violet-600 hover:text-violet-800 font-medium">
                                Reopen
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Activity Timeline */}
          <div className="overflow-y-auto">
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
                  const isPushback = isPushbackActivity(act.notes);
                  return (
                    <div key={act.id} className={`flex gap-2.5 rounded-md p-1.5 ${
                      isPushback ? 'bg-amber-50 border border-amber-200' :
                      isClosedWonActivity(act.notes) ? 'bg-emerald-50 border border-emerald-200' :
                      isClosedLostActivity(act.notes) ? 'bg-red-50 border border-red-200' :
                      isReopenActivity(act.notes) ? 'bg-emerald-50 border border-emerald-200' : ''
                    }`}>
                      <StatusBadge status={act.activity_type} variant="tag" />
                      <div className="flex-1 min-w-0">
                        {actContact && (
                          <Link to={`/contacts/${actContact.id}`} className="text-[11px] text-violet-600 hover:underline font-medium">
                            {actContact.first_name} {actContact.last_name}
                          </Link>
                        )}
                        <p className={`text-[12px] leading-relaxed ${isPushback ? 'text-amber-800 font-medium' : 'text-gray-700'}`}>
                          {act.notes || '--'}
                        </p>
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

      {/* Pushback Modal */}
      {showPushbackModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={() => setShowPushbackModal(null)}>
          <div className="bg-white rounded-lg shadow-xl w-[400px]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-[15px] font-semibold text-gray-900">Push Back Stage</h2>
              <p className="text-[12px] text-gray-500 mt-0.5">This will move the deal back one stage and log the reason.</p>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1">Reason *</label>
                <select value={pushbackReason} onChange={e => setPushbackReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                  <option value="">Select reason...</option>
                  {PUSHBACK_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowPushbackModal(null)}
                  className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                <button onClick={handlePushback} disabled={!pushbackReason}
                  className="px-3 py-1.5 text-[13px] bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:opacity-40 font-medium">
                  Confirm Push Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

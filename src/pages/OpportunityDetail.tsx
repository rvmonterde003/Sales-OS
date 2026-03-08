import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatCurrency, formatDate, formatDateTime, getDealAge, PUSHBACK_REASONS } from '../lib/helpers';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import ActivityLogModal from '../components/ActivityLogModal';
import {
  ArrowLeft, AlertTriangle, ArrowRight, CheckCircle2, Circle,
  MessageSquarePlus, ChevronRight, Trophy, XCircle, Undo2, RotateCcw,
} from 'lucide-react';

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const oppId = Number(id);
  const {
    opportunities, companies, contacts, activities,
    stageTransitions, qualificationChecks, inactivityFlags,
    salesStages, lossReasons, getUserName,
    moveToStage, closeOpportunity, reopenOpportunity, pushbackStage, hasActivitySinceLastTransition,
  } = useData();
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState<'won' | 'lost' | null>(null);
  const [closeReasonId, setCloseReasonId] = useState<number | ''>('');
  const [closeNotes, setCloseNotes] = useState('');
  const [pushbackOpen, setPushbackOpen] = useState(false);
  const [pushbackReason, setPushbackReason] = useState('');

  const opp = opportunities.find(o => o.id === oppId);
  if (!opp) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-[13px]">Opportunity not found.</p>
        <Link to="/pipeline" className="text-violet-600 text-[13px] mt-2 inline-block">Back to Pipeline</Link>
      </div>
    );
  }

  const company = companies.find(c => c.id === opp.company_id);
  const contact = opp.primary_contact_id ? contacts.find(c => c.id === opp.primary_contact_id) : null;
  const stage = salesStages.find(s => s.id === opp.stage_id);
  const nonTerminalStages = salesStages.filter(s => s.name !== 'Won' && s.name !== 'Loss');
  const oppActivities = activities.filter(a => a.company_id === opp.company_id && (a.related_opportunity_id === opp.id || a.related_opportunity_id === null));
  const transitions = stageTransitions.filter(t => t.opportunity_id === opp.id);
  const flags = inactivityFlags.filter(f => f.related_opportunity_id === opp.id && !f.resolved_at);
  const qualification = qualificationChecks.find(q => q.company_id === opp.company_id);
  const dealAge = getDealAge(opp.created_at, opp.closed_at);
  const lastTransition = transitions[0];
  const daysInStage = lastTransition
    ? Math.floor((Date.now() - new Date(lastTransition.created_at).getTime()) / 86400000)
    : Math.floor((Date.now() - new Date(opp.created_at).getTime()) / 86400000);
  const isClosed = !!opp.closed_at;
  const hasActivity = hasActivitySinceLastTransition(opp.id);
  const isAtVerbal = stage?.name === 'Verbal';
  const isAtFirst = opp.stage_id === nonTerminalStages[0]?.id;

  const handleAdvance = () => {
    if (!hasActivity) return;
    const currentOrder = stage?.stage_order || 0;
    const nextStage = nonTerminalStages.find(s => s.stage_order === currentOrder + 1);
    if (nextStage) moveToStage(opp.id, nextStage.id, 'Stage advanced manually.');
  };

  const handlePushback = async () => {
    if (!pushbackReason) return;
    await pushbackStage(opp.id, pushbackReason);
    setPushbackOpen(false);
    setPushbackReason('');
  };

  const handleClose = () => {
    if (!showCloseModal) return;
    closeOpportunity(
      opp.id,
      showCloseModal === 'won',
      showCloseModal === 'lost' && closeReasonId ? Number(closeReasonId) : undefined,
      closeNotes || undefined,
    );
    setShowCloseModal(null);
    setCloseReasonId('');
    setCloseNotes('');
  };

  const isPushbackActivity = (notes: string | null) => notes?.startsWith('[PUSHBACK]');
  const isCloseActivity = (notes: string | null) => notes?.startsWith('[CLOSED');
  const isReopenActivity = (notes: string | null) => notes?.startsWith('[REOPENED]');

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      <div className="px-5 py-2 border-b border-gray-200 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/pipeline" className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-3 h-3" /> Deals
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-[12px] text-gray-900 font-medium">{company?.name}</span>
        </div>
        {!isClosed ? (
          <div className="flex items-center gap-2">
            <button onClick={() => setShowActivityModal(true)}
              className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
              <MessageSquarePlus className="w-3 h-3" /> Log Activity
            </button>
            <button onClick={() => setPushbackOpen(true)} disabled={isAtFirst}
              className="flex items-center gap-1.5 text-[12px] text-amber-600 border border-amber-200 rounded-md px-2.5 py-1.5 hover:bg-amber-50 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed">
              <Undo2 className="w-3 h-3" /> Push Back
            </button>
            <button onClick={handleAdvance} disabled={!hasActivity || isAtVerbal}
              className="flex items-center gap-1.5 text-[12px] text-white bg-violet-600 rounded-md px-2.5 py-1.5 hover:bg-violet-700 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              title={!hasActivity ? 'Log activity before advancing' : ''}>
              <ChevronRight className="w-3 h-3" /> Advance Stage
              {hasActivity && <span className="w-2 h-2 rounded-full bg-green-400 ml-1" />}
            </button>
            <button onClick={() => setShowCloseModal('won')} disabled={!isAtVerbal}
              className="flex items-center gap-1.5 text-[12px] text-white bg-emerald-600 rounded-md px-2.5 py-1.5 hover:bg-emerald-700 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              title={!isAtVerbal ? 'Must be at Verbal to mark Won' : ''}>
              <Trophy className="w-3 h-3" /> Mark Won
            </button>
            <button onClick={() => setShowCloseModal('lost')}
              className="flex items-center gap-1.5 text-[12px] text-white bg-red-500 rounded-md px-2.5 py-1.5 hover:bg-red-600 transition-colors font-medium">
              <XCircle className="w-3 h-3" /> Mark Lost
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={`text-[12px] font-medium px-2.5 py-1.5 rounded-md ${
              stage?.name === 'Won' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              Opportunity Closed ({stage?.name})
            </span>
            <button onClick={() => reopenOpportunity(opp.id)}
              className="flex items-center gap-1.5 text-[12px] text-violet-600 border border-violet-200 rounded-md px-2.5 py-1.5 hover:bg-violet-50 transition-colors font-medium">
              <RotateCcw className="w-3 h-3" /> Reopen
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {flags.length > 0 && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            {flags.map(f => <StatusBadge key={f.id} status={f.flag_type} variant="tag" />)}
          </div>
        )}

        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link to={`/companies/${opp.company_id}`} className="text-[18px] font-bold text-gray-900 hover:text-violet-600">{company?.name}</Link>
                <StatusBadge status={stage?.name || ''} />
                <StatusBadge status={opp.opportunity_type} variant="tag" />
              </div>
              <p className="text-[13px] text-gray-600 mb-1">{opp.service_description}</p>
              <div className="flex items-center gap-3 text-[12px] text-gray-500">
                {contact && (
                  <Link to={`/contacts/${opp.primary_contact_id}`} className="text-violet-600 hover:underline">
                    {contact.first_name} {contact.last_name}
                  </Link>
                )}
                <span className="text-gray-300">|</span>
                <span>Owner: {getUserName(opp.owner_id)}</span>
                <span className="text-gray-300">|</span><span>Source: {company?.source || opp.source}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[22px] font-bold text-gray-900">{formatCurrency(opp.deal_value)}</div>
              {opp.forecast_category && <StatusBadge status={opp.forecast_category} />}
            </div>
          </div>

          {/* Stage progress bar with activity indicator */}
          <div className="mt-5">
            <div className="flex items-center gap-1">
              {nonTerminalStages.map(s => {
                const isCurrent = s.id === opp.stage_id;
                const isPast = s.stage_order < (stage?.stage_order || 0);
                return (
                  <div key={s.id} className="flex-1">
                    <div className={`h-1.5 rounded-full ${isCurrent ? 'bg-violet-500' : isPast ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                    <span className={`text-[10px] mt-1 block text-center ${isCurrent ? 'text-violet-600 font-semibold' : 'text-gray-400'}`}>
                      {s.name}
                    </span>
                  </div>
                );
              })}
            </div>
            {!isClosed && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px]">
                <div className={`w-2 h-2 rounded-full ${hasActivity ? 'bg-green-400' : 'bg-gray-300'}`} />
                <span className={hasActivity ? 'text-green-600' : 'text-gray-400'}>
                  {hasActivity ? 'Activity logged - ready to advance' : 'Log activity to advance stage'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-gray-100">
          <div className="col-span-2">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Deal Details</h2>
              <div className="grid grid-cols-3 gap-3">
                <DetailField label="Expected Close" value={formatDate(opp.expected_close_date)} />
                <DetailField label="Deal Age" value={`${dealAge} days`} />
                <DetailField label="Days in Stage" value={`${daysInStage} days`} warn={daysInStage > 14} />
                {opp.contract_start_date && <DetailField label="Contract Start" value={formatDate(opp.contract_start_date)} />}
                {opp.contract_end_date && <DetailField label="Contract End" value={formatDate(opp.contract_end_date)} />}
                {opp.closed_reason_id && (
                  <DetailField label="Closed Reason" value={lossReasons.find(r => r.id === opp.closed_reason_id)?.reason || '--'} warn />
                )}
              </div>
              {opp.closed_reason_notes && (
                <p className="mt-2 text-[12px] text-gray-600 bg-gray-50 rounded-md p-2 border border-gray-100">{opp.closed_reason_notes}</p>
              )}
            </div>

            {transitions.length > 0 && (
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Stage History</h2>
                <div className="space-y-2">
                  {transitions.map(t => {
                    const from = t.from_stage_id ? salesStages.find(s => s.id === t.from_stage_id) : null;
                    const to = salesStages.find(s => s.id === t.to_stage_id);
                    const isPushback = from && to && (from.stage_order || 0) > (to.stage_order || 0);
                    return (
                      <div key={t.id} className={`flex items-center gap-2 text-[12px] ${isPushback ? 'bg-amber-50 border border-amber-200 rounded-md px-2 py-1' : ''}`}>
                        {from && <span className="text-gray-500">{from.name}</span>}
                        <ArrowRight className={`w-3 h-3 ${isPushback ? 'text-amber-400' : 'text-gray-300'}`} />
                        <span className="font-medium text-gray-900">{to?.name}</span>
                        <span className="text-gray-300">&middot;</span>
                        <span className="text-gray-400">{getUserName(t.transitioned_by)}</span>
                        <span className="text-gray-300">&middot;</span>
                        <span className="text-gray-400 text-[11px]">{formatDateTime(t.created_at)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {qualification && (
              <div className="px-5 py-4">
                <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Qualification</h2>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: 'pain_and_value' as const, label: 'Pain & Value' },
                    { key: 'timeline' as const, label: 'Timeline' },
                    { key: 'budget_pricing_fit' as const, label: 'Budget/Pricing Fit' },
                    { key: 'person_in_position' as const, label: 'Person in Position' },
                  ]).map(item => {
                    const filled = (qualification[item.key] || '').trim() !== '';
                    return (
                      <div key={item.key} className={`p-2 rounded-md border ${filled ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          {filled ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Circle className="w-3.5 h-3.5 text-gray-300" />}
                          <span className={`text-[12px] font-medium ${filled ? 'text-emerald-700' : 'text-gray-400'}`}>{item.label}</span>
                        </div>
                        {filled && <p className="text-[11px] text-gray-600 ml-5">{qualification[item.key]}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-[13px] font-semibold text-gray-900">Activity</h2>
            </div>
            <div className="p-4 space-y-3">
              {oppActivities.length === 0 ? (
                <p className="text-[12px] text-gray-400 text-center py-4">No activities</p>
              ) : (
                oppActivities.map(act => {
                  const isPB = isPushbackActivity(act.notes);
                  const isClose = isCloseActivity(act.notes);
                  const isReopen = isReopenActivity(act.notes);
                  return (
                    <div key={act.id} className={`flex gap-2.5 ${
                      isPB ? 'bg-amber-50 border border-amber-200 rounded-md p-2' :
                      isClose ? 'bg-red-50 border border-red-200 rounded-md p-2' :
                      isReopen ? 'bg-emerald-50 border border-emerald-200 rounded-md p-2' : ''
                    }`}>
                      <StatusBadge status={act.activity_type} variant="tag" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-gray-700 leading-relaxed">
                          {isPB ? (act.notes || '').replace('[PUSHBACK] ', '') : (act.notes || '--')}
                        </p>
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
      </div>

      <ActivityLogModal isOpen={showActivityModal} onClose={() => setShowActivityModal(false)}
        defaultCompanyId={opp.company_id} defaultOpportunityId={opp.id} />

      {/* Pushback modal */}
      {pushbackOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={() => setPushbackOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[400px]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-[15px] font-semibold text-gray-900">Push Back Stage</h2>
              <p className="text-[12px] text-gray-500 mt-1">This will move the deal back one stage and log the reason.</p>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1">Reason</label>
                <select value={pushbackReason} onChange={e => setPushbackReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                  <option value="">Select reason...</option>
                  {PUSHBACK_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setPushbackOpen(false)}
                  className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
                <button onClick={handlePushback} disabled={!pushbackReason}
                  className="px-3 py-1.5 text-[13px] text-white bg-amber-500 rounded-md hover:bg-amber-600 transition-colors font-medium disabled:opacity-40">
                  Push Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close (Won/Lost) modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={() => setShowCloseModal(null)}>
          <div className="bg-white rounded-lg shadow-xl w-[420px]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-[15px] font-semibold text-gray-900">
                {showCloseModal === 'won' ? 'Mark as Won' : 'Mark as Lost'}
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {showCloseModal === 'lost' && (
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">Loss Reason</label>
                  <select value={closeReasonId} onChange={e => setCloseReasonId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                    <option value="">Select reason...</option>
                    {lossReasons.map(r => <option key={r.id} value={r.id}>{r.reason}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1">Notes</label>
                <textarea value={closeNotes} onChange={e => setCloseNotes(e.target.value)} rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder={showCloseModal === 'won' ? 'Celebration notes...' : 'What happened?'} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowCloseModal(null)}
                  className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md transition-colors">Cancel</button>
                <button onClick={handleClose} disabled={showCloseModal === 'lost' && !closeReasonId}
                  className={`px-3 py-1.5 text-[13px] text-white rounded-md transition-colors font-medium disabled:opacity-40 ${
                    showCloseModal === 'won' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600'
                  }`}>
                  {showCloseModal === 'won' ? 'Confirm Won' : 'Confirm Lost'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailField({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">{label}</div>
      <div className={`text-[13px] font-medium ${warn ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
    </div>
  );
}

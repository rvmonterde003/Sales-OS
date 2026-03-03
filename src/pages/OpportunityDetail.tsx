import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getStageById, salesStages,
  formatCurrency, formatDate, formatDateTime, getDealAge, getDaysInStage,
} from '../data/mockData';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import ActivityLogModal from '../components/ActivityLogModal';
import {
  ArrowLeft, AlertTriangle, ArrowRight, CheckCircle2, Circle,
  MessageSquarePlus, ChevronRight, Trophy, XCircle,
} from 'lucide-react';

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    opportunities, companies, contacts, activities,
    stageTransitions, qualificationChecks, inactivityFlags,
    advanceStage, closeOpportunity,
  } = useData();
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState<'won' | 'lost' | null>(null);
  const [closeReason, setCloseReason] = useState('');
  const [closeNotes, setCloseNotes] = useState('');

  const opp = opportunities.find(o => o.id === id);

  if (!opp) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-[13px]">Opportunity not found.</p>
        <Link to="/pipeline" className="text-violet-600 text-[13px] mt-2 inline-block">
          Back to Pipeline
        </Link>
      </div>
    );
  }

  const company = companies.find(c => c.id === opp.companyId);
  const contact = contacts.find(c => c.id === opp.primaryContactId);
  const stage = getStageById(opp.stageId);
  const oppActivities = activities
    .filter(a => a.relatedObjectType === 'Opportunity' && a.relatedObjectId === opp.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const transitions = stageTransitions
    .filter(t => t.opportunityId === opp.id)
    .sort((a, b) => new Date(b.transitionedAt).getTime() - new Date(a.transitionedAt).getTime());
  const flags = inactivityFlags.filter(
    f => f.relatedObjectType === 'Opportunity' && f.relatedObjectId === opp.id && !f.resolvedAt,
  );
  const qualification = qualificationChecks.find(q => q.contactId === opp.primaryContactId);
  const dealAge = getDealAge(opp.createdAt, opp.closedAt);
  const daysInStage = getDaysInStage(opp.stageEnteredAt);
  const isClosed = !!opp.closedAt;

  const handleAdvance = () => {
    advanceStage(opp.id, 'Stage advanced manually.');
  };

  const handleClose = () => {
    if (!showCloseModal) return;
    closeOpportunity(
      opp.id,
      showCloseModal === 'won',
      showCloseModal === 'lost' ? closeReason : undefined,
      closeNotes || undefined,
    );
    setShowCloseModal(null);
    setCloseReason('');
    setCloseNotes('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      {/* Back bar */}
      <div className="px-5 py-2 border-b border-gray-200 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/pipeline" className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-3 h-3" /> Deals
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-[12px] text-gray-900 font-medium">{company?.name}</span>
        </div>
        {!isClosed && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowActivityModal(true)}
              className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
            >
              <MessageSquarePlus className="w-3 h-3" /> Log Activity
            </button>
            <button
              onClick={handleAdvance}
              className="flex items-center gap-1.5 text-[12px] text-white bg-violet-600 rounded-md px-2.5 py-1.5 hover:bg-violet-700 transition-colors font-medium"
            >
              <ChevronRight className="w-3 h-3" /> Advance Stage
            </button>
            <button
              onClick={() => setShowCloseModal('won')}
              className="flex items-center gap-1.5 text-[12px] text-white bg-emerald-600 rounded-md px-2.5 py-1.5 hover:bg-emerald-700 transition-colors font-medium"
            >
              <Trophy className="w-3 h-3" /> Mark Won
            </button>
            <button
              onClick={() => setShowCloseModal('lost')}
              className="flex items-center gap-1.5 text-[12px] text-white bg-red-500 rounded-md px-2.5 py-1.5 hover:bg-red-600 transition-colors font-medium"
            >
              <XCircle className="w-3 h-3" /> Mark Lost
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Risk Flags */}
        {flags.length > 0 && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            {flags.map(f => (
              <StatusBadge key={f.id} status={f.flagType} variant="tag" />
            ))}
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  to={`/companies/${opp.companyId}`}
                  className="text-[18px] font-bold text-gray-900 hover:text-violet-600"
                >
                  {company?.name}
                </Link>
                <StatusBadge status={stage?.name || ''} />
                <StatusBadge status={opp.opportunityType} variant="tag" />
              </div>
              <div className="flex items-center gap-3 text-[12px] text-gray-500">
                <Link
                  to={`/contacts/${opp.primaryContactId}`}
                  className="text-violet-600 hover:underline"
                >
                  {contact ? `${contact.firstName} ${contact.lastName}` : '—'}
                </Link>
                <span className="text-gray-300">|</span>
                <span>Owner: {opp.owner}</span>
                <span className="text-gray-300">|</span>
                <span>Source: {opp.source}</span>
              </div>
            </div>
            <div className="text-right">
              {opp.dealValue && (
                <div className="text-[22px] font-bold text-gray-900">
                  {formatCurrency(opp.dealValue)}
                </div>
              )}
              {opp.forecastCategory && <StatusBadge status={opp.forecastCategory} />}
            </div>
          </div>

          {/* Stage bar */}
          <div className="mt-5 flex items-center gap-1">
            {salesStages
              .filter(s => !s.isTerminal)
              .map(s => {
                const isCurrent = s.id === opp.stageId;
                const isPast = s.stageOrder < (stage?.stageOrder || 0);
                return (
                  <div key={s.id} className="flex-1">
                    <div
                      className={`h-1.5 rounded-full ${
                        isCurrent
                          ? 'bg-violet-500'
                          : isPast
                            ? 'bg-emerald-400'
                            : 'bg-gray-200'
                      }`}
                    />
                    <span
                      className={`text-[10px] mt-1 block text-center ${
                        isCurrent ? 'text-violet-600 font-semibold' : 'text-gray-400'
                      }`}
                    >
                      {s.name}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {/* Left */}
          <div className="col-span-2">
            {/* Deal details */}
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Deal Details</h2>
              <div className="grid grid-cols-3 gap-3">
                <DetailField label="Expected Close" value={formatDate(opp.expectedCloseDate)} />
                <DetailField label="Deal Age" value={`${dealAge} days`} />
                <DetailField
                  label="Days in Stage"
                  value={`${daysInStage} days`}
                  warn={daysInStage > 14}
                />
                {opp.contractStartDate && (
                  <DetailField label="Contract Start" value={formatDate(opp.contractStartDate)} />
                )}
                {opp.contractEndDate && (
                  <DetailField label="Contract End" value={formatDate(opp.contractEndDate)} />
                )}
                {opp.closedReason && (
                  <DetailField label="Closed Reason" value={opp.closedReason} warn />
                )}
              </div>
              {opp.closedNotes && (
                <p className="mt-2 text-[12px] text-gray-600 bg-gray-50 rounded-md p-2 border border-gray-100">
                  {opp.closedNotes}
                </p>
              )}
            </div>

            {/* Stage history */}
            {transitions.length > 0 && (
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-[13px] font-semibold text-gray-900 mb-3">Stage History</h2>
                <div className="space-y-2">
                  {transitions.map(t => {
                    const from = t.fromStageId ? getStageById(t.fromStageId) : null;
                    const to = getStageById(t.toStageId);
                    return (
                      <div key={t.id} className="flex items-center gap-2 text-[12px]">
                        {from && <span className="text-gray-500">{from.name}</span>}
                        <ArrowRight className="w-3 h-3 text-gray-300" />
                        <span className="font-medium text-gray-900">{to?.name}</span>
                        <span className="text-gray-300">&middot;</span>
                        <span className="text-gray-400">{t.transitionedBy}</span>
                        <span className="text-gray-300">&middot;</span>
                        <span className="text-gray-400 text-[11px]">
                          {formatDateTime(t.transitionedAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BANT */}
            {qualification && (
              <div className="px-5 py-4">
                <h2 className="text-[13px] font-semibold text-gray-900 mb-3">
                  Qualification (BANT)
                </h2>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Budget', checked: qualification.budget },
                    { label: 'Authority', checked: qualification.authority },
                    { label: 'Need', checked: qualification.need },
                    { label: 'Timing', checked: qualification.timing },
                  ].map(item => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 p-2 rounded-md border ${
                        item.checked
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {item.checked ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-gray-300" />
                      )}
                      <span
                        className={`text-[12px] font-medium ${
                          item.checked ? 'text-emerald-700' : 'text-gray-400'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Timeline */}
          <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-[13px] font-semibold text-gray-900">Activity</h2>
            </div>
            <div className="p-4 space-y-3">
              {oppActivities.length === 0 ? (
                <p className="text-[12px] text-gray-400 text-center py-4">No activities</p>
              ) : (
                oppActivities.map(act => (
                  <div key={act.id} className="flex gap-2.5">
                    <StatusBadge status={act.activityType} variant="tag" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-gray-700 leading-relaxed">{act.notes}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-400">
                        <span>{act.owner}</span>
                        <span>&middot;</span>
                        <span>{formatDateTime(act.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Modal */}
      <ActivityLogModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        defaultRelatedType="Opportunity"
        defaultRelatedId={opp.id}
      />

      {/* Close Modal */}
      {showCloseModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]"
          onClick={() => setShowCloseModal(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-[420px]"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-[15px] font-semibold text-gray-900">
                {showCloseModal === 'won' ? 'Mark as Won' : 'Mark as Lost'}
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {showCloseModal === 'lost' && (
                <div>
                  <label className="block text-[12px] font-medium text-gray-500 mb-1">
                    Loss Reason
                  </label>
                  <select
                    value={closeReason}
                    onChange={e => setCloseReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="">Select reason...</option>
                    {[
                      'Budget constraints',
                      'Chose competitor',
                      'No decision made',
                      'Timeline mismatch',
                      'Product fit',
                      'Champion left',
                      'Internal reorganization',
                      'Other',
                    ].map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-[12px] font-medium text-gray-500 mb-1">
                  Notes
                </label>
                <textarea
                  value={closeNotes}
                  onChange={e => setCloseNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder={
                    showCloseModal === 'won'
                      ? 'Celebration notes...'
                      : 'What happened?'
                  }
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCloseModal(null)}
                  className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClose}
                  disabled={showCloseModal === 'lost' && !closeReason}
                  className={`px-3 py-1.5 text-[13px] text-white rounded-md transition-colors font-medium disabled:opacity-40 ${
                    showCloseModal === 'won'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
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

function DetailField({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">
        {label}
      </div>
      <div className={`text-[13px] font-medium ${warn ? 'text-red-600' : 'text-gray-900'}`}>
        {value}
      </div>
    </div>
  );
}

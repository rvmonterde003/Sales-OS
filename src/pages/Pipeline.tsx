import { useState } from 'react';
import { formatCurrency } from '../lib/helpers';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import InlinePipelineControl from '../components/InlinePipelineControl';
import ActivityLogModal from '../components/ActivityLogModal';
import { Link } from 'react-router-dom';
import { Clock, User, SlidersHorizontal, Filter, GripVertical } from 'lucide-react';

export default function Pipeline() {
  const { opportunities, companies, contacts, salesStages, stageTransitions, moveToStage } = useData();
  const [dragOppId, setDragOppId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [pendingMove, setPendingMove] = useState<{ oppId: number; targetStageId: number } | null>(null);
  const nonTerminalStages = salesStages.filter(s => s.name !== 'Won' && s.name !== 'Loss');

  const pendingOpp = pendingMove ? opportunities.find(o => o.id === pendingMove.oppId) : null;

  const handleDragStart = (oppId: number) => setDragOppId(oppId);
  const handleDragOver = (e: React.DragEvent, stageId: number) => { e.preventDefault(); setDropTarget(stageId); };
  const handleDragLeave = () => setDropTarget(null);
  const handleDrop = (targetStageId: number) => {
    if (dragOppId) {
      const opp = opportunities.find(o => o.id === dragOppId);
      // Only prompt if actually changing stage
      if (opp && opp.stage_id !== targetStageId) {
        setPendingMove({ oppId: dragOppId, targetStageId });
      }
    }
    setDragOppId(null);
    setDropTarget(null);
  };
  const handleDragEnd = () => { setDragOppId(null); setDropTarget(null); };

  const handleActivitySubmitted = async () => {
    if (pendingMove) {
      await moveToStage(pendingMove.oppId, pendingMove.targetStageId, 'Moved via pipeline board.');
    }
  };

  const handleModalClose = () => {
    setPendingMove(null);
  };

  const getDaysInStage = (oppId: number, createdAt: string) => {
    const t = stageTransitions.find(t => t.opportunity_id === oppId);
    const ref = t?.created_at || createdAt;
    return Math.floor((Date.now() - new Date(ref).getTime()) / 86400000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      <div className="flex items-center justify-between px-5 py-2 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
            <span className="w-3.5 h-3.5 rounded bg-orange-400 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">D</span>
            </span>
            Pipeline View
          </button>
          <button className="flex items-center gap-1.5 text-[12px] text-gray-500 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
            <SlidersHorizontal className="w-3 h-3" /> View settings
          </button>
          <button className="flex items-center gap-1.5 text-[12px] text-gray-500 px-2 py-1 rounded hover:bg-gray-50">
            <Filter className="w-3 h-3" /> Filter
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
        <div className="flex gap-3 min-h-full">
          {nonTerminalStages.map(stage => {
            const stageOpps = opportunities.filter(o => o.stage_id === stage.id && !o.closed_at);
            const stageTotal = stageOpps.reduce((sum, o) => sum + o.deal_value, 0);
            const isDropping = dropTarget === stage.id && dragOppId !== null;

            return (
              <div key={stage.id}
                className={`flex-shrink-0 w-[260px] flex flex-col rounded-lg transition-colors ${isDropping ? 'bg-violet-50 ring-2 ring-violet-300' : ''}`}
                onDragOver={e => handleDragOver(e, stage.id)} onDragLeave={handleDragLeave} onDrop={() => handleDrop(stage.id)}>
                <div className="px-3 py-2.5 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[12px] font-semibold text-gray-700">{stage.name}</h3>
                    <span className="text-[11px] text-gray-400 font-medium">{stageOpps.length}</span>
                  </div>
                  {stageTotal > 0 && <div className="text-[11px] text-gray-400 mt-0.5">{formatCurrency(stageTotal)}</div>}
                </div>

                <div className="flex-1 space-y-2 min-h-[100px]">
                  {stageOpps.map(opp => {
                    const company = companies.find(c => c.id === opp.company_id);
                    const contact = opp.primary_contact_id ? contacts.find(c => c.id === opp.primary_contact_id) : null;
                    const daysInStage = getDaysInStage(opp.id, opp.created_at);
                    const isAging = daysInStage > 14;
                    const isDragging = dragOppId === opp.id;

                    return (
                      <div key={opp.id} draggable onDragStart={() => handleDragStart(opp.id)} onDragEnd={handleDragEnd}
                        className={`kanban-card bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing transition-opacity ${isDragging ? 'opacity-40' : ''}`}>
                        <div className="flex items-start justify-between mb-1">
                          <Link to={`/opportunities/${opp.id}`} className="text-[12px] font-medium text-gray-900 hover:text-violet-600">
                            {company?.name}
                          </Link>
                          <GripVertical className="w-3 h-3 text-gray-300 shrink-0 mt-0.5" />
                        </div>
                        <p className="text-[11px] text-gray-500 mb-1.5 truncate">{opp.service_description}</p>
                        <div className="text-[16px] font-bold text-gray-900 mb-2">{formatCurrency(opp.deal_value)}</div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                          {opp.forecast_category && <StatusBadge status={opp.forecast_category} variant="tag" />}
                          <StatusBadge status={opp.opportunity_type} variant="tag" />
                        </div>
                        <div className="mb-2">
                          <InlinePipelineControl oppId={opp.id} currentStageId={opp.stage_id} compact />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {contact ? `${contact.first_name} ${contact.last_name[0]}.` : '--'}
                          </span>
                          <span className={`flex items-center gap-1 ${isAging ? 'text-red-500' : ''}`}>
                            <Clock className="w-3 h-3" />{daysInStage}d
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {stageOpps.length === 0 && <div className="text-center py-8 text-[11px] text-gray-300">No deals</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ActivityLogModal
        isOpen={!!pendingMove}
        onClose={handleModalClose}
        onSubmitted={handleActivitySubmitted}
        defaultCompanyId={pendingOpp?.company_id}
        defaultOpportunityId={pendingMove?.oppId}
      />
    </div>
  );
}

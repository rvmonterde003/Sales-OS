import { useState } from 'react';
import { useData } from '../context/DataContext';
import { PUSHBACK_REASONS } from '../lib/helpers';
import { ChevronRight, Trophy, X, Undo2 } from 'lucide-react';

interface Props {
  oppId: number;
  currentStageId: number;
  compact?: boolean;
}

export default function InlinePipelineControl({ oppId, currentStageId, compact }: Props) {
  const { salesStages, moveToStage, closeOpportunity, pushbackStage, hasActivitySinceLastTransition } = useData();
  const nonTerminalStages = salesStages.filter(s => s.name !== 'Won' && s.name !== 'Loss');
  const currentStage = salesStages.find(s => s.id === currentStageId);
  const isTerminal = currentStage?.name === 'Won' || currentStage?.name === 'Loss';

  const [pushbackOpen, setPushbackOpen] = useState(false);
  const [pushbackReason, setPushbackReason] = useState('');

  if (isTerminal) {
    return (
      <div className="flex items-center gap-1">
        <span className={`text-[11px] font-medium ${
          currentStage?.name === 'Won' ? 'text-green-600' : 'text-red-500'
        }`}>
          {currentStage?.name}
        </span>
      </div>
    );
  }

  const currentOrder = currentStage?.stage_order || 0;
  const isAtVerbal = currentStage?.name === 'Verbal';
  const isAtFirst = currentStageId === nonTerminalStages[0]?.id;
  const hasActivity = hasActivitySinceLastTransition(oppId);

  const handleAdvance = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!hasActivity) return;
    const nextStage = nonTerminalStages.find(s => s.stage_order === currentOrder + 1);
    if (nextStage) moveToStage(oppId, nextStage.id, 'Advanced via pipeline control.');
  };

  const handlePushback = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!pushbackReason) return;
    await pushbackStage(oppId, pushbackReason);
    setPushbackOpen(false);
    setPushbackReason('');
  };

  const handleWon = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    closeOpportunity(oppId, true, undefined, 'Closed won via pipeline control.');
  };

  const handleLost = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    closeOpportunity(oppId, false, undefined, 'Closed lost via pipeline control.');
  };

  return (
    <div className={`flex items-center gap-1.5 ${compact ? '' : 'py-1'}`} onClick={e => e.stopPropagation()}>
      {/* Push Back button */}
      <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); setPushbackOpen(true); }}
        disabled={isAtFirst}
        className="p-0.5 rounded hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-amber-500" title="Push Back">
        <Undo2 className="w-3.5 h-3.5" />
      </button>

      {/* Stage progress bar */}
      <div className="flex items-center gap-0.5 flex-1">
        {nonTerminalStages.map(stage => {
          const isCurrent = stage.id === currentStageId;
          const isPast = stage.stage_order < currentOrder;
          return (
            <div key={stage.id} className="flex-1 group relative">
              <div className={`${compact ? 'h-1.5' : 'h-2'} rounded-full transition-colors ${
                isCurrent ? 'bg-violet-500' : isPast ? 'bg-green-400' : 'bg-gray-200'
              }`} />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                {stage.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Advance button - requires activity */}
      <button onClick={handleAdvance}
        disabled={isAtVerbal || !hasActivity}
        className={`p-0.5 rounded transition-colors ${
          hasActivity && !isAtVerbal ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'
        }`}
        title={!hasActivity ? 'Log activity before advancing' : isAtVerbal ? 'At final stage' : 'Next stage'}>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* Activity indicator dot */}
      <div className={`w-2 h-2 rounded-full shrink-0 ${hasActivity ? 'bg-green-400' : 'bg-gray-300'}`}
        title={hasActivity ? 'Activity logged' : 'No activity since last transition'} />

      <button onClick={handleWon} disabled={!isAtVerbal}
        className={`p-0.5 rounded transition-colors ${isAtVerbal ? 'hover:bg-green-50 text-green-600' : 'text-gray-300 cursor-not-allowed grayscale'}`}
        title={isAtVerbal ? 'Mark as Won' : 'Must be at Verbal stage to win'}>
        <Trophy className="w-3.5 h-3.5" />
      </button>
      <button onClick={handleLost} className="p-0.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors" title="Mark as Lost">
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Pushback modal */}
      {pushbackOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]" onClick={(e) => { e.stopPropagation(); setPushbackOpen(false); }}>
          <div className="bg-white rounded-lg shadow-xl w-[360px]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-[14px] font-semibold text-gray-900">Push Back Stage</h2>
              <p className="text-[12px] text-gray-500 mt-1">Select a reason for pushing back to the previous stage.</p>
            </div>
            <div className="p-4 space-y-3">
              <select value={pushbackReason} onChange={e => setPushbackReason(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                <option value="">Select reason...</option>
                {PUSHBACK_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div className="flex justify-end gap-2 pt-1">
                <button onClick={(e) => { e.stopPropagation(); setPushbackOpen(false); }}
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
    </div>
  );
}

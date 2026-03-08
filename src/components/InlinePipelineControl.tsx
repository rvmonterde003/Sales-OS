import { useData } from '../context/DataContext';
import { ChevronLeft, ChevronRight, Trophy, X } from 'lucide-react';

interface Props {
  oppId: number;
  currentStageId: number;
  compact?: boolean;
}

export default function InlinePipelineControl({ oppId, currentStageId, compact }: Props) {
  const { salesStages, moveToStage, closeOpportunity } = useData();
  const nonTerminalStages = salesStages.filter(s => s.name !== 'Won' && s.name !== 'Loss');
  const currentStage = salesStages.find(s => s.id === currentStageId);
  const isTerminal = currentStage?.name === 'Won' || currentStage?.name === 'Loss';

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
  const isAtLast = currentStageId === nonTerminalStages[nonTerminalStages.length - 1]?.id;

  const handleAdvance = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const nextStage = nonTerminalStages.find(s => s.stage_order === currentOrder + 1);
    if (nextStage) moveToStage(oppId, nextStage.id, 'Advanced via pipeline control.');
  };

  const handleRollback = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const prevStage = nonTerminalStages.find(s => s.stage_order === currentOrder - 1);
    if (prevStage) moveToStage(oppId, prevStage.id, 'Rolled back via pipeline control.');
  };

  const handleStageClick = (e: React.MouseEvent, stageId: number) => {
    e.stopPropagation();
    e.preventDefault();
    if (stageId !== currentStageId) moveToStage(oppId, stageId, 'Moved via pipeline control.');
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
    <div className={`flex items-center gap-1.5 ${compact ? '' : 'py-1'}`}>
      <button onClick={handleRollback} disabled={isAtFirst}
        className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Previous stage">
        <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
      </button>
      <div className="flex items-center gap-0.5 flex-1">
        {nonTerminalStages.map(stage => {
          const isCurrent = stage.id === currentStageId;
          const isPast = stage.stage_order < currentOrder;
          return (
            <button key={stage.id} onClick={(e) => handleStageClick(e, stage.id)} className="flex-1 group relative" title={stage.name}>
              <div className={`${compact ? 'h-1.5' : 'h-2'} rounded-full transition-colors cursor-pointer hover:opacity-80 ${
                isCurrent ? 'bg-violet-500' : isPast ? 'bg-green-400' : 'bg-gray-200'
              }`} />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                {stage.name}
              </div>
            </button>
          );
        })}
      </div>
      <button onClick={handleAdvance} disabled={isAtLast}
        className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Next stage">
        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
      </button>
      <button onClick={handleWon} disabled={!isAtVerbal}
        className={`p-0.5 rounded transition-colors ${isAtVerbal ? 'hover:bg-green-50 text-green-600' : 'text-gray-300 cursor-not-allowed grayscale'}`}
        title={isAtVerbal ? 'Mark as Won' : 'Must be at Verbal stage to win'}>
        <Trophy className="w-3.5 h-3.5" />
      </button>
      <button onClick={handleLost} className="p-0.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors" title="Mark as Lost">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

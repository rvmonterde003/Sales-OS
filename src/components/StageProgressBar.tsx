import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

interface StageProgressBarProps {
  currentStageId: number;
  compact?: boolean;
  oppId?: number;
}

export default function StageProgressBar({ currentStageId, compact, oppId }: StageProgressBarProps) {
  const { salesStages } = useData();
  const currentStage = salesStages.find(s => s.id === currentStageId);
  const activeStages = salesStages.filter(s => s.name !== 'Closed Won' && s.name !== 'Closed Lost');
  const isTerminal = currentStage?.name === 'Closed Won' || currentStage?.name === 'Closed Lost';

  const bar = (
    <div className="flex items-center gap-1 w-full">
      {activeStages.map(stage => {
        const isCurrent = stage.id === currentStageId;
        const isPast = currentStage && !isTerminal && stage.stage_order < currentStage.stage_order;
        const isCompleted = currentStage?.name === 'Closed Won' || isPast;
        return (
          <div key={stage.id} className="flex-1 group relative">
            <div className={`${compact ? 'h-1.5' : 'h-2'} rounded-full transition-colors ${
              isCurrent ? 'bg-violet-500' : isCompleted ? 'bg-violet-300' : 'bg-gray-200'
            }`} />
            {!compact && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                {stage.name}
              </div>
            )}
          </div>
        );
      })}
      {isTerminal && (
        <span className={`text-[10px] font-medium ml-1 shrink-0 ${
          currentStage?.name === 'Closed Won' ? 'text-green-600' : 'text-red-500'
        }`}>
          {currentStage?.name}
        </span>
      )}
    </div>
  );

  if (oppId) {
    return (
      <Link to={`/opportunities/${oppId}`} className="block hover:opacity-80 transition-opacity">
        {bar}
      </Link>
    );
  }

  return bar;
}

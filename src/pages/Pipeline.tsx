import { useState, useRef } from 'react';
import { salesStages, formatCurrency, getDaysInStage, getStageById } from '../data/mockData';
import { useData } from '../context/DataContext';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import { Clock, User, SlidersHorizontal, Filter, GripVertical } from 'lucide-react';

export default function Pipeline() {
  const { opportunities, companies, contacts, moveToStage } = useData();
  const [dragOppId, setDragOppId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const nonTerminalStages = salesStages.filter(s => !s.isTerminal);

  const handleDragStart = (oppId: string) => {
    setDragOppId(oppId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: number) => {
    e.preventDefault();
    setDropTarget(stageId);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (targetStageId: number) => {
    if (dragOppId) {
      moveToStage(dragOppId, targetStageId, 'Moved via pipeline board.');
    }
    setDragOppId(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDragOppId(null);
    setDropTarget(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
            <span className="w-3.5 h-3.5 rounded bg-orange-400 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">D</span>
            </span>
            Pipeline View
          </button>
          <button className="flex items-center gap-1.5 text-[12px] text-gray-500 border border-gray-200 rounded-md px-2.5 py-1.5 hover:bg-gray-50">
            <SlidersHorizontal className="w-3 h-3" />
            View settings
          </button>
          <button className="flex items-center gap-1.5 text-[12px] text-gray-500 px-2 py-1 rounded hover:bg-gray-50">
            <Filter className="w-3 h-3" /> Filter
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
        <div className="flex gap-3 min-h-full">
          {nonTerminalStages.map(stage => {
            const stageOpps = opportunities.filter(
              o => o.stageId === stage.id && !o.closedAt,
            );
            const stageTotal = stageOpps.reduce((sum, o) => sum + (o.dealValue || 0), 0);
            const isDropping = dropTarget === stage.id && dragOppId !== null;

            return (
              <div
                key={stage.id}
                className={`flex-shrink-0 w-[260px] flex flex-col rounded-lg transition-colors ${
                  isDropping ? 'bg-violet-50 ring-2 ring-violet-300' : ''
                }`}
                onDragOver={e => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(stage.id)}
              >
                {/* Column Header */}
                <div className="px-3 py-2.5 mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[12px] font-semibold text-gray-700">{stage.name}</h3>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {stageOpps.length}
                    </span>
                  </div>
                  {stageTotal > 0 && (
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {formatCurrency(stageTotal)}
                    </div>
                  )}
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-2 min-h-[100px]">
                  {stageOpps.map(opp => {
                    const company = companies.find(c => c.id === opp.companyId);
                    const contact = contacts.find(c => c.id === opp.primaryContactId);
                    const daysInStage = getDaysInStage(opp.stageEnteredAt);
                    const isAging = daysInStage > 14;
                    const isDragging = dragOppId === opp.id;

                    return (
                      <div
                        key={opp.id}
                        draggable
                        onDragStart={() => handleDragStart(opp.id)}
                        onDragEnd={handleDragEnd}
                        className={`kanban-card bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing transition-opacity ${
                          isDragging ? 'opacity-40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <Link
                            to={`/opportunities/${opp.id}`}
                            className="text-[12px] font-medium text-gray-900 hover:text-violet-600"
                          >
                            {company?.name}
                          </Link>
                          <GripVertical className="w-3 h-3 text-gray-300 shrink-0 mt-0.5" />
                        </div>

                        {opp.dealValue && (
                          <div className="text-[16px] font-bold text-gray-900 mb-2">
                            {formatCurrency(opp.dealValue)}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                          {opp.forecastCategory && (
                            <StatusBadge status={opp.forecastCategory} variant="tag" />
                          )}
                          <StatusBadge status={opp.opportunityType} variant="tag" />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {contact
                              ? `${contact.firstName} ${contact.lastName[0]}.`
                              : '—'}
                          </span>
                          <span
                            className={`flex items-center gap-1 ${
                              isAging ? 'text-red-500' : ''
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {daysInStage}d
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {stageOpps.length === 0 && (
                    <div className="text-center py-8 text-[11px] text-gray-300">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

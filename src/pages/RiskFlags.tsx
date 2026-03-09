import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../lib/helpers';
import { useData } from '../context/DataContext';
import ActivityLogModal from '../components/ActivityLogModal';
import { ArrowUpDown, Filter, CheckCircle2 } from 'lucide-react';

export default function RiskFlags() {
  const { inactivityFlags, companies, opportunities, salesStages, getUserName, resolveFlag } = useData();
  const [resolvingFlag, setResolvingFlag] = useState<number | null>(null);

  const openFlags = inactivityFlags.filter(f => !f.resolved_at);
  const resolvedFlags = inactivityFlags.filter(f => f.resolved_at);

  // Get the flag being resolved to pass context to activity modal
  const flagBeingResolved = resolvingFlag ? inactivityFlags.find(f => f.id === resolvingFlag) : null;
  const flagCompanyId = flagBeingResolved?.company_id || undefined;
  const flagOppId = flagBeingResolved?.related_opportunity_id || undefined;

  function getRelatedName(f: (typeof inactivityFlags)[0]) {
    if (f.company_id) {
      const company = companies.find(c => c.id === f.company_id);
      return company?.name || 'Unknown';
    }
    return 'Unknown';
  }

  function getRelatedLink(f: (typeof inactivityFlags)[0]) {
    if (f.company_id) return `/companies/${f.company_id}`;
    return '#';
  }

  function getOppLabel(f: (typeof inactivityFlags)[0]) {
    if (!f.related_opportunity_id) return null;
    const opp = opportunities.find(o => o.id === f.related_opportunity_id);
    if (!opp) return null;
    const stage = salesStages.find(s => s.id === opp.stage_id);
    return { id: opp.id, label: `${stage?.name || 'Deal'} - ${opp.service_description?.slice(0, 40) || `Opp #${opp.id}`}` };
  }

  const handleActivitySubmitted = async () => {
    if (resolvingFlag) {
      await resolveFlag(resolvingFlag);
    }
  };

  const handleModalClose = () => {
    setResolvingFlag(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      <div className="flex items-center justify-between px-5 py-2 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-gray-900">Risk Flags</span>
          <span className="text-[11px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{openFlags.length} open</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-[12px] text-gray-500 px-2 py-1 rounded hover:bg-gray-50">
            <ArrowUpDown className="w-3 h-3" /> Sort
          </button>
          <button className="flex items-center gap-1 text-[12px] text-gray-500 px-2 py-1 rounded hover:bg-gray-50">
            <Filter className="w-3 h-3" /> Filter
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="attio-table w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              <th className="text-left font-medium text-gray-500 px-4 py-2">Record</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2">Opportunity</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2">Flag</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2">Flagged at</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2">Status</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2">Resolved by</th>
              <th className="text-center font-medium text-gray-500 px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {[...openFlags, ...resolvedFlags].map(flag => {
              const oppInfo = getOppLabel(flag);
              return (
                <tr key={flag.id} className={`border-b border-gray-100 ${!flag.resolved_at ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-2.5">
                    <Link to={getRelatedLink(flag)} className="text-gray-900 hover:text-violet-600 font-medium">{getRelatedName(flag)}</Link>
                  </td>
                  <td className="px-4 py-2.5 text-[12px]">
                    {oppInfo ? (
                      <Link to={`/opportunities/${oppInfo.id}`} className="text-violet-600 hover:underline truncate block max-w-[200px]">
                        {oppInfo.label}
                      </Link>
                    ) : <span className="text-gray-300">--</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[11px] font-medium px-1.5 py-[1px] rounded ${!flag.resolved_at ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                      {flag.flag_type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{formatDateTime(flag.flagged_at)}</td>
                  <td className="px-4 py-2.5">
                    {flag.resolved_at ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-[6px] h-[6px] rounded-full bg-emerald-500" />
                        <span className="text-[12px] text-gray-600">Resolved</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <span className="w-[6px] h-[6px] rounded-full bg-red-500" />
                        <span className="text-[12px] text-gray-600">Open</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-[12px]">{flag.resolved_by ? getUserName(flag.resolved_by) : '--'}</td>
                  <td className="px-4 py-2.5 text-center">
                    {!flag.resolved_at && (
                      <button onClick={() => setResolvingFlag(flag.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition-colors">
                        <CheckCircle2 className="w-3 h-3" /> Resolve
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {inactivityFlags.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-[13px] text-gray-400">No risk flags</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 px-5 py-2 bg-white text-[12px] text-gray-400 shrink-0">{inactivityFlags.length} count</div>

      <ActivityLogModal
        isOpen={!!resolvingFlag}
        onClose={handleModalClose}
        onSubmitted={handleActivitySubmitted}
        defaultCompanyId={flagCompanyId}
        defaultOpportunityId={flagOppId}
      />
    </div>
  );
}

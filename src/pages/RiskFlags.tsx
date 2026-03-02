import { Link } from 'react-router-dom';
import {
  inactivityFlags, getContactById, getCompanyById, getOpportunityById,
  formatDateTime, getStageById,
} from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import { Filter, ArrowUpDown } from 'lucide-react';

export default function RiskFlags() {
  const openFlags = inactivityFlags.filter(f => !f.resolvedAt);
  const resolvedFlags = inactivityFlags.filter(f => f.resolvedAt);

  function getRelatedName(f: typeof inactivityFlags[0]) {
    if (f.relatedObjectType === 'Contact') {
      const contact = getContactById(f.relatedObjectId);
      return contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown';
    } else {
      const opp = getOpportunityById(f.relatedObjectId);
      const company = opp ? getCompanyById(opp.companyId) : null;
      const stage = opp ? getStageById(opp.stageId) : null;
      return company ? `${company.name} — ${stage?.name}` : 'Unknown';
    }
  }

  function getRelatedLink(f: typeof inactivityFlags[0]) {
    return f.relatedObjectType === 'Contact' ? `/contacts/${f.relatedObjectId}` : `/opportunities/${f.relatedObjectId}`;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-46px)]">
      {/* Toolbar */}
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

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="attio-table w-full text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              <th className="text-left font-medium text-gray-500 px-4 py-2">Record</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2">Type</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2">Flag</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2">Flagged at</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2">Status</th>
              <th className="text-left font-medium text-gray-500 px-4 py-2">Resolved by</th>
            </tr>
          </thead>
          <tbody>
            {[...openFlags, ...resolvedFlags].map(flag => (
              <tr key={flag.id} className={`border-b border-gray-100 ${!flag.resolvedAt ? 'bg-red-50/30' : ''}`}>
                <td className="px-4 py-2.5">
                  <Link to={getRelatedLink(flag)} className="text-gray-900 hover:text-violet-600 font-medium">
                    {getRelatedName(flag)}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={flag.relatedObjectType} variant="tag" />
                </td>
                <td className="px-4 py-2.5">
                  <span className={`text-[11px] font-medium px-1.5 py-[1px] rounded ${!flag.resolvedAt ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                    {flag.flagType}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-gray-500 text-[12px]">{formatDateTime(flag.flaggedAt)}</td>
                <td className="px-4 py-2.5">
                  {flag.resolvedAt ? (
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
                <td className="px-4 py-2.5 text-gray-500 text-[12px]">{flag.resolvedBy || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 px-5 py-2 bg-white text-[12px] text-gray-400 shrink-0">
        {inactivityFlags.length} count
      </div>
    </div>
  );
}

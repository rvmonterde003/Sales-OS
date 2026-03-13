interface StatusBadgeProps {
  status: string;
  variant?: 'pill' | 'dot' | 'tag';
}

const colorMap: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  // Company status
  Prospect: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
  Customer: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  Former: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', border: 'border-gray-200' },
  // Lead statuses
  MQL: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
  SQL: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-200' },
  Qualified: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  Unqualified: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
  Other: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', border: 'border-gray-200' },
  // Opportunity type
  New: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
  Upsell: { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500', border: 'border-violet-200' },
  Renewal: { bg: 'bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500', border: 'border-cyan-200' },
  Pilot: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-200' },
  // Forecast
  Pipeline: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200' },
  'Best Case': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
  Commit: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  // Stages
  Discovery: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
  'Demonstration/Audit': { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500', border: 'border-indigo-200' },
  Evaluation: { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500', border: 'border-violet-200' },
  Proposal: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200' },
  Negotiation: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
  Contract: { bg: 'bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500', border: 'border-cyan-200' },
  Verbal: { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500', border: 'border-teal-200' },
  Won: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  Loss: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
  // Flags
  Open: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
  Resolved: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  // Activity types
  Call: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
  Email: { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500', border: 'border-violet-200' },
  Meeting: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  Note: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200' },
  'Prospecting Touch': { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-200' },
  // Industries
  'Corporate Law': { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500', border: 'border-indigo-200' },
  'Litigation': { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-200' },
  'IP Law': { bg: 'bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500', border: 'border-cyan-200' },
  'Family Law': { bg: 'bg-pink-100', text: 'text-pink-700', dot: 'bg-pink-500', border: 'border-pink-200' },
  'Real Estate Law': { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500', border: 'border-teal-200' },
  'Tax Law': { bg: 'bg-lime-100', text: 'text-lime-700', dot: 'bg-lime-500', border: 'border-lime-200' },
  'Immigration Law': { bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-500', border: 'border-sky-200' },
  'Criminal Law': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
};

const fallback = { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200' };

const displayLabel: Record<string, string> = { MQL: 'MWL', SQL: 'SWL' };

export default function StatusBadge({ status, variant = 'pill' }: StatusBadgeProps) {
  const colors = colorMap[status] || fallback;
  const label = displayLabel[status] || status;

  if (variant === 'dot') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className={`w-[6px] h-[6px] rounded-full ${colors.dot}`} />
        <span className="text-[12px] text-gray-600">{label}</span>
      </span>
    );
  }

  if (variant === 'tag') {
    return (
      <span className={`inline-flex items-center px-1.5 py-[1px] rounded text-[11px] font-medium ${colors.bg} ${colors.text}`}>
        {label}
      </span>
    );
  }

  // Default pill - Attio style
  return (
    <span className={`inline-flex items-center px-2 py-[2px] rounded-full text-[11px] font-medium ${colors.bg} ${colors.text}`}>
      {label}
    </span>
  );
}

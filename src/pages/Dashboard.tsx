import { formatCurrency } from '../lib/helpers';
import { useData } from '../context/DataContext';
import { useRole } from '../hooks/useRole';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const DONUT_COLORS = ['#ef4444', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'];

export default function Dashboard() {
  const { opportunities, companies, salesStages, allOpportunities, allCompanies } = useData();
  const { isExec } = useRole();

  const displayOpps = isExec ? allOpportunities : opportunities;
  const displayCompanies = isExec ? allCompanies : companies;

  const openOpps = displayOpps.filter(o => !o.closed_at);
  const wonStage = salesStages.find(s => s.name === 'Won');
  const wins = displayOpps.filter(o => o.stage_id === wonStage?.id);
  const totalPipelineValue = openOpps.reduce((sum, o) => sum + o.deal_value, 0);
  const wonValue = wins.reduce((sum, o) => sum + o.deal_value, 0);

  // Pipeline by stage
  const nonTerminalStages = salesStages.filter(s => s.name !== 'Won' && s.name !== 'Loss');
  const pipelineByStage = nonTerminalStages.map(stage => {
    const stageOpps = openOpps.filter(o => o.stage_id === stage.id);
    return {
      name: stage.name,
      value: stageOpps.reduce((sum, o) => sum + o.deal_value, 0),
      deals: stageOpps.length,
    };
  });

  // Deals by type
  const dealsByType = (['New', 'Upsell', 'Renewal', 'Pilot'] as const)
    .map(type => ({ name: type, value: displayOpps.filter(o => o.opportunity_type === type).length }))
    .filter(d => d.value > 0);

  // Funnel
  const totalCompanies = displayCompanies.length;
  const qualified = displayCompanies.filter(c => c.lead_status === 'Qualified').length;
  const withDeals = new Set(openOpps.map(o => o.company_id)).size;
  const funnelSteps = [
    { label: 'Companies', pct: '100%', count: totalCompanies },
    { label: 'Qualified', pct: `${totalCompanies ? ((qualified / totalCompanies) * 100).toFixed(0) : 0}%`, count: qualified },
    { label: 'In Pipeline', pct: `${totalCompanies ? ((withDeals / totalCompanies) * 100).toFixed(0) : 0}%`, count: withDeals },
    { label: 'Won', pct: `${totalCompanies ? ((wins.length / totalCompanies) * 100).toFixed(0) : 0}%`, count: wins.length },
  ];

  const noData = displayOpps.length === 0 && displayCompanies.length === 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900">Business Metrics</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Overview of your sales pipeline, deal demographics, and performance.
        </p>
      </div>

      {noData ? (
        <div className="border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-[14px] text-gray-500">No data yet. Add companies and opportunities to see metrics.</p>
        </div>
      ) : (
        <>
          {/* Row 1: Donut + Pipeline by stage */}
          <div className="grid grid-cols-5 gap-5 mb-5">
            <div className="col-span-2 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-[13px] font-semibold text-gray-900">Deals by type</h3>
              </div>
              {dealsByType.length > 0 ? (
                <>
                  <div className="flex items-center gap-4 mb-2 flex-wrap">
                    {dealsByType.map((d, i) => (
                      <LegendDot key={d.name} color={DONUT_COLORS[i]} label={d.name} />
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={dealsByType} cx="50%" cy="50%" outerRadius={80} innerRadius={50} dataKey="value" strokeWidth={2} stroke="#fff">
                        {dealsByType.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-[12px] text-gray-400">No deals yet</div>
              )}
            </div>

            <div className="col-span-3 border border-gray-200 rounded-lg p-4">
              <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Pipeline value by stage</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pipelineByStage} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 8 }} formatter={(v: number | undefined) => formatCurrency(v ?? 0)} />
                  <Bar dataKey="value" fill="#818cf8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2: Funnel */}
          <div className="border border-gray-200 rounded-lg p-4 mb-5">
            <h3 className="text-[13px] font-semibold text-gray-900 mb-5">Sales funnel</h3>
            <div className="flex items-end justify-between gap-2">
              {funnelSteps.map((step, i) => (
                <div key={step.label} className="flex flex-col items-center flex-1">
                  <div className="w-full rounded-t-sm" style={{
                    height: `${Math.max(20, (step.count / Math.max(totalCompanies, 1)) * 120)}px`,
                    background: `hsl(${220 + i * 25}, 70%, ${65 + i * 5}%)`,
                  }} />
                  <div className="text-[11px] font-semibold text-gray-900 mt-2">{step.pct}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{step.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            <KpiCard label="Total Pipeline" value={formatCurrency(totalPipelineValue)} />
            <KpiCard label="Won Revenue" value={formatCurrency(wonValue)} />
            <KpiCard label="Open Deals" value={openOpps.length.toString()} />
            <KpiCard label="Win Rate" value={`${opportunities.length > 0 ? ((wins.length / opportunities.length) * 100).toFixed(0) : 0}%`} />
          </div>

        </>
      )}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 rounded-lg px-4 py-3">
      <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{label}</div>
      <div className="text-[20px] font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

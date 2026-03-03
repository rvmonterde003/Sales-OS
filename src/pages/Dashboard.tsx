import {
  opportunities, contacts, companies, activities, salesStages,
  getStageById, getCompanyById, formatCurrency, getDealAge, getDaysInStage,
} from '../data/mockData';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const DONUT_COLORS = ['#ef4444', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'];
const BAR_COLORS = ['#e2e8f0', '#fcd34d', '#f472b6', '#818cf8'];

export default function Dashboard() {
  const openOpps = opportunities.filter(o => !o.closedAt);
  const wins = opportunities.filter(o => getStageById(o.stageId)?.name === 'Closed Won');
  const losses = opportunities.filter(o => getStageById(o.stageId)?.name === 'Closed Lost');
  const totalPipelineValue = openOpps.reduce((sum, o) => sum + (o.dealValue || 0), 0);
  const wonValue = wins.reduce((sum, o) => sum + (o.dealValue || 0), 0);

  // Pipeline by stage for bar chart
  const pipelineByStage = salesStages
    .filter(s => !s.isTerminal)
    .map(stage => {
      const stageOpps = opportunities.filter(o => o.stageId === stage.id && !o.closedAt);
      return {
        name: stage.name,
        value: stageOpps.reduce((sum, o) => sum + (o.dealValue || 0), 0),
        deals: stageOpps.length,
      };
    });

  // Deals by type for donut
  const dealsByType = ['New', 'Upsell', 'Renewal', 'Pilot']
    .map(type => ({
      name: type,
      value: opportunities.filter(o => o.opportunityType === type).length,
    }))
    .filter(d => d.value > 0);

  // Sales pipeline funnel
  const totalLeads = contacts.length;
  const qualified = opportunities.filter(o => (getStageById(o.stageId)?.stageOrder || 0) >= 3).length;
  const contacted = opportunities.filter(o => (getStageById(o.stageId)?.stageOrder || 0) >= 4).length;
  const negotiation = opportunities.filter(o => (getStageById(o.stageId)?.stageOrder || 0) >= 5).length;

  const funnelSteps = [
    { label: 'Leads', pct: '100%', count: totalLeads },
    { label: 'Qualification', pct: `${((qualified / Math.max(totalLeads, 1)) * 100).toFixed(1)}%`, count: qualified },
    { label: 'Contacted', pct: `${((contacted / Math.max(totalLeads, 1)) * 100).toFixed(1)}%`, count: contacted },
    { label: 'Negotiation', pct: `${((negotiation / Math.max(totalLeads, 1)) * 100).toFixed(1)}%`, count: negotiation },
    { label: 'Won', pct: `${((wins.length / Math.max(totalLeads, 1)) * 100).toFixed(1)}%`, count: wins.length },
  ];

  // Revenue by month
  const ownerData = [
    { month: 'Oct', Nick: 45000 },
    { month: 'Nov', Nick: 62000 },
    { month: 'Dec', Nick: 55000 },
    { month: 'Jan', Nick: 78000 },
    { month: 'Feb', Nick: 84000 },
  ];

  return (
    <div className="p-6 max-w-[1200px]">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900">Business Metrics</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Overview of your sales pipeline, revenue growth, deal demographics, and more.</p>
      </div>

      {/* Row 1: Revenue chart + Donut */}
      <div className="grid grid-cols-5 gap-5 mb-5">
        {/* Revenue growth */}
        <div className="col-span-3 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-semibold text-gray-900">Revenue</h3>
              <span className="text-[11px] bg-orange-100 text-orange-700 px-1.5 py-[1px] rounded-full font-medium">Deals</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <LegendDot color="#818cf8" label="Nick Kringas" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ownerData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$ ${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="Nick" fill="#818cf8" radius={[3, 3, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut: Deals by type */}
        <div className="col-span-2 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-[13px] font-semibold text-gray-900">Deals by type</h3>
            <span className="text-[11px] bg-orange-100 text-orange-700 px-1.5 py-[1px] rounded-full font-medium">Deals</span>
          </div>
          <div className="flex items-center gap-4 mb-2 flex-wrap">
            {dealsByType.map((d, i) => (
              <LegendDot key={d.name} color={DONUT_COLORS[i]} label={d.name} />
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={dealsByType} cx="50%" cy="50%" outerRadius={80} innerRadius={50} dataKey="value" strokeWidth={2} stroke="#fff">
                {dealsByType.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Sales pipeline funnel + Pipeline by stage */}
      <div className="grid grid-cols-5 gap-5 mb-5">
        {/* Sales Pipeline Funnel */}
        <div className="col-span-2 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-5">
            <h3 className="text-[13px] font-semibold text-gray-900">Sales pipeline</h3>
            <span className="text-[11px] bg-orange-100 text-orange-700 px-1.5 py-[1px] rounded-full font-medium">Deals</span>
          </div>
          <div className="flex items-end justify-between gap-2">
            {funnelSteps.map((step, i) => (
              <div key={step.label} className="flex flex-col items-center flex-1">
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${Math.max(20, (step.count / Math.max(totalLeads, 1)) * 120)}px`,
                    background: `hsl(${220 + i * 25}, 70%, ${65 + i * 5}%)`,
                  }}
                />
                <div className="text-[11px] font-semibold text-gray-900 mt-2">{step.pct}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{step.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline value by stage */}
        <div className="col-span-3 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-[13px] font-semibold text-gray-900">Pipeline value by stage</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={pipelineByStage} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 8 }} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" fill="#818cf8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: KPI summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Total Pipeline" value={formatCurrency(totalPipelineValue)} />
        <KpiCard label="Won Revenue" value={formatCurrency(wonValue)} />
        <KpiCard label="Open Deals" value={openOpps.length.toString()} />
        <KpiCard label="Win Rate" value={`${opportunities.length > 0 ? ((wins.length / opportunities.length) * 100).toFixed(0) : 0}%`} />
      </div>
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

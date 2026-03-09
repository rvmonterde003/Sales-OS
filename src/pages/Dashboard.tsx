import { useState } from 'react';
import { formatCurrency } from '../lib/helpers';
import { useData } from '../context/DataContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const DONUT_COLORS = ['#ef4444', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'];

export default function Dashboard() {
  const { opportunities, companies, activities, salesStages } = useData();
  const [trackerYear, setTrackerYear] = useState(new Date().getFullYear());

  const openOpps = opportunities.filter(o => !o.closed_at);
  const wonStage = salesStages.find(s => s.name === 'Won');
  const wins = opportunities.filter(o => o.stage_id === wonStage?.id);
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
    .map(type => ({ name: type, value: opportunities.filter(o => o.opportunity_type === type).length }))
    .filter(d => d.value > 0);

  // Funnel
  const totalCompanies = companies.length;
  const qualified = companies.filter(c => c.lead_status === 'Qualified').length;
  const withDeals = new Set(openOpps.map(o => o.company_id)).size;
  const funnelSteps = [
    { label: 'Companies', pct: '100%', count: totalCompanies },
    { label: 'Qualified', pct: `${totalCompanies ? ((qualified / totalCompanies) * 100).toFixed(0) : 0}%`, count: qualified },
    { label: 'In Pipeline', pct: `${totalCompanies ? ((withDeals / totalCompanies) * 100).toFixed(0) : 0}%`, count: withDeals },
    { label: 'Won', pct: `${totalCompanies ? ((wins.length / totalCompanies) * 100).toFixed(0) : 0}%`, count: wins.length },
  ];

  const noData = opportunities.length === 0 && companies.length === 0;

  return (
    <div className="p-6 max-w-[1200px]">
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

          {/* Row 4: Tracker */}
          <TrackerTable
            year={trackerYear}
            onYearChange={setTrackerYear}
            companies={companies}
            opportunities={opportunities}
            activities={activities}
            salesStages={salesStages}
          />
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface TrackerProps {
  year: number;
  onYearChange: (y: number) => void;
  companies: { lead_status: string; created_at: string }[];
  opportunities: { deal_value: number; stage_id: number; created_at: string; closed_at: string | null }[];
  activities: { activity_type: string; activity_timestamp: string }[];
  salesStages: { id: number; name: string }[];
}

function TrackerTable({ year, onYearChange, companies, opportunities, activities, salesStages }: TrackerProps) {
  const wonStageId = salesStages.find(s => s.name === 'Won')?.id;
  const lossStageId = salesStages.find(s => s.name === 'Loss')?.id;

  const inMonth = (dateStr: string, m: number) => {
    const d = new Date(dateStr);
    return d.getFullYear() === year && d.getMonth() === m;
  };

  const rows = MONTHS.map((_, m) => {
    const mqls = companies.filter(c => c.lead_status === 'MQL' && inMonth(c.created_at, m)).length;
    const sqlsMeetings = companies.filter(c => (c.lead_status === 'SQL' || c.lead_status === 'Qualified') && inMonth(c.created_at, m)).length
      + activities.filter(a => a.activity_type === 'Meeting' && inMonth(a.activity_timestamp, m)).length;

    const createdOpps = opportunities.filter(o => inMonth(o.created_at, m));
    const oppsCreatedNum = createdOpps.length;
    const oppsCreatedVal = createdOpps.reduce((s, o) => s + o.deal_value, 0);
    const oppsCreatedAov = oppsCreatedNum > 0 ? oppsCreatedVal / oppsCreatedNum : 0;

    const wonOpps = opportunities.filter(o => o.closed_at && inMonth(o.closed_at, m) && o.stage_id === wonStageId);
    const oppsWonNum = wonOpps.length;
    const oppsWonVal = wonOpps.reduce((s, o) => s + o.deal_value, 0);
    const oppsWonAov = oppsWonNum > 0 ? oppsWonVal / oppsWonNum : 0;

    const lostOpps = opportunities.filter(o => o.closed_at && inMonth(o.closed_at, m) && o.stage_id === lossStageId);
    const oppsLostNum = lostOpps.length;
    const oppsLostVal = lostOpps.reduce((s, o) => s + o.deal_value, 0);

    return { mqls, sqlsMeetings, oppsCreatedNum, oppsCreatedVal, oppsCreatedAov, oppsWonNum, oppsWonVal, oppsWonAov, oppsLostNum, oppsLostVal };
  });

  // Totals
  const totals = rows.reduce((t, r) => ({
    mqls: t.mqls + r.mqls,
    sqlsMeetings: t.sqlsMeetings + r.sqlsMeetings,
    oppsCreatedNum: t.oppsCreatedNum + r.oppsCreatedNum,
    oppsCreatedVal: t.oppsCreatedVal + r.oppsCreatedVal,
    oppsWonNum: t.oppsWonNum + r.oppsWonNum,
    oppsWonVal: t.oppsWonVal + r.oppsWonVal,
    oppsLostNum: t.oppsLostNum + r.oppsLostNum,
    oppsLostVal: t.oppsLostVal + r.oppsLostVal,
  }), { mqls: 0, sqlsMeetings: 0, oppsCreatedNum: 0, oppsCreatedVal: 0, oppsWonNum: 0, oppsWonVal: 0, oppsLostNum: 0, oppsLostVal: 0 });

  const metricLabels = [
    'MQLs',
    'SQLs / Meetings Booked',
    'Opps Created #',
    'Opps Created $',
    'Opps Created AOV',
    'Opps Won #',
    'Opps Won $',
    'Opps Won AOV',
    'Opps Lost #',
    'Opps Lost $',
  ];

  const getCell = (r: typeof rows[0], idx: number): string => {
    switch (idx) {
      case 0: return r.mqls.toString();
      case 1: return r.sqlsMeetings.toString();
      case 2: return r.oppsCreatedNum.toString();
      case 3: return formatCurrency(r.oppsCreatedVal);
      case 4: return formatCurrency(r.oppsCreatedAov);
      case 5: return r.oppsWonNum.toString();
      case 6: return formatCurrency(r.oppsWonVal);
      case 7: return formatCurrency(r.oppsWonAov);
      case 8: return r.oppsLostNum.toString();
      case 9: return formatCurrency(r.oppsLostVal);
      default: return '--';
    }
  };

  const getTotalCell = (idx: number): string => {
    switch (idx) {
      case 0: return totals.mqls.toString();
      case 1: return totals.sqlsMeetings.toString();
      case 2: return totals.oppsCreatedNum.toString();
      case 3: return formatCurrency(totals.oppsCreatedVal);
      case 4: return totals.oppsCreatedNum > 0 ? formatCurrency(totals.oppsCreatedVal / totals.oppsCreatedNum) : '--';
      case 5: return totals.oppsWonNum.toString();
      case 6: return formatCurrency(totals.oppsWonVal);
      case 7: return totals.oppsWonNum > 0 ? formatCurrency(totals.oppsWonVal / totals.oppsWonNum) : '--';
      case 8: return totals.oppsLostNum.toString();
      case 9: return formatCurrency(totals.oppsLostVal);
      default: return '--';
    }
  };

  const now = new Date().getFullYear();

  return (
    <div className="border border-gray-200 rounded-lg mt-5">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-[13px] font-semibold text-gray-900">Tracker</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => onYearChange(year - 1)} className="px-2 py-0.5 text-[12px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded">&lsaquo;</button>
          <span className="text-[12px] font-medium text-gray-700 w-10 text-center">{year}</span>
          <button onClick={() => onYearChange(year + 1)} disabled={year >= now}
            className="px-2 py-0.5 text-[12px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-30">&rsaquo;</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/60">
              <th className="text-left font-medium text-gray-500 px-3 py-2 sticky left-0 bg-gray-50/60 min-w-[170px]">Metric</th>
              {MONTHS.map(m => (
                <th key={m} className="text-right font-medium text-gray-500 px-3 py-2 min-w-[80px]">{m}</th>
              ))}
              <th className="text-right font-semibold text-gray-700 px-3 py-2 min-w-[90px] bg-gray-100/60">Total</th>
            </tr>
          </thead>
          <tbody>
            {metricLabels.map((label, idx) => (
              <tr key={label} className={`border-b border-gray-100 ${idx === 4 || idx === 7 ? 'bg-gray-50/30' : ''}`}>
                <td className="px-3 py-2 font-medium text-gray-700 sticky left-0 bg-white whitespace-nowrap">{label}</td>
                {rows.map((r, m) => (
                  <td key={m} className="px-3 py-2 text-right text-gray-600 tabular-nums">{getCell(r, idx)}</td>
                ))}
                <td className="px-3 py-2 text-right font-semibold text-gray-900 bg-gray-50/60 tabular-nums">{getTotalCell(idx)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

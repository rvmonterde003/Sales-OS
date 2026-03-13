import { useState, useMemo } from 'react';
import { formatCurrency } from '../lib/helpers';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../hooks/useRole';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type ViewMode = 'monthly' | 'yearly';

export default function DashboardTab() {
  const { opportunities, companies, activities, salesStages, allOpportunities, allCompanies, allActivities, getUserName } = useData();
  const { dbUser, allUsers } = useAuth();
  const { isExec } = useRole();

  const displayOpps = isExec ? allOpportunities : opportunities;
  const displayCompanies = isExec ? allCompanies : companies;
  const displayActivities = isExec ? allActivities : activities;
  const [trackerYear, setTrackerYear] = useState(new Date().getFullYear());

  // Revenue Timeline state
  const baseOpps = isExec ? allOpportunities : opportunities;
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [filterUser, setFilterUser] = useState<string>('all');
  const isAdmin = dbUser?.role === 'admin' || dbUser?.role === 'exec';

  const wonStage = salesStages.find(s => s.name === 'Won');
  const wonOpps = useMemo(() => {
    let opps = baseOpps.filter(o => o.stage_id === wonStage?.id && o.closed_at);
    if (filterUser !== 'all') {
      opps = opps.filter(o => o.owner_id === Number(filterUser));
    }
    return opps;
  }, [baseOpps, wonStage, filterUser]);

  const chartData = useMemo(() => {
    if (viewMode === 'monthly') {
      const days: Record<string, number> = {};
      wonOpps.forEach(o => {
        if (!o.closed_at) return;
        const d = new Date(o.closed_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        days[key] = (days[key] || 0) + o.deal_value;
      });
      const sorted = Object.entries(days).sort(([a], [b]) => a.localeCompare(b));
      let cumulative = 0;
      return sorted.map(([day, value]) => {
        cumulative += value;
        const d = new Date(day);
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return { name: label, revenue: value, cumulative };
      });
    } else {
      const months: Record<string, number> = {};
      wonOpps.forEach(o => {
        if (!o.closed_at) return;
        const d = new Date(o.closed_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        months[key] = (months[key] || 0) + o.deal_value;
      });
      return Object.entries(months)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, value]) => {
          const [y, m] = month.split('-');
          const label = new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          return { name: label, revenue: value };
        });
    }
  }, [wonOpps, viewMode]);

  const totalRevenue = wonOpps.reduce((sum, o) => sum + o.deal_value, 0);
  const avgDealSize = wonOpps.length > 0 ? totalRevenue / wonOpps.length : 0;

  const memberBreakdown = useMemo(() => {
    const map: Record<number, { name: string; revenue: number; deals: number }> = {};
    wonOpps.forEach(o => {
      if (!map[o.owner_id]) {
        map[o.owner_id] = { name: getUserName(o.owner_id), revenue: 0, deals: 0 };
      }
      map[o.owner_id].revenue += o.deal_value;
      map[o.owner_id].deals += 1;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [wonOpps, getUserName]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900">Dashboard</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Sales tracker and revenue timeline.</p>
      </div>

      {/* Tracker */}
      <TrackerTable
        year={trackerYear}
        onYearChange={setTrackerYear}
        companies={displayCompanies}
        opportunities={displayOpps}
        activities={displayActivities}
        salesStages={salesStages}
      />

      {/* Revenue Timeline */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-gray-900">Revenue Timeline</h2>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
                className="border border-gray-200 rounded-md text-[12px] px-2.5 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-400">
                <option value="all">All Members</option>
                {allUsers.filter(u => u.is_active).map(u => (
                  <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                ))}
              </select>
            )}
            <div className="flex items-center bg-gray-100 rounded-md p-0.5">
              <button onClick={() => setViewMode('monthly')}
                className={`px-3 py-1 text-[12px] rounded-md transition-colors ${
                  viewMode === 'monthly' ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
                }`}>
                Monthly
              </button>
              <button onClick={() => setViewMode('yearly')}
                className={`px-3 py-1 text-[12px] rounded-md transition-colors ${
                  viewMode === 'yearly' ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
                }`}>
                Yearly
              </button>
            </div>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <KpiCard label="Total Won Revenue" value={formatCurrency(totalRevenue)} />
          <KpiCard label="Won Deals" value={wonOpps.length.toString()} />
          <KpiCard label="Avg Deal Size" value={formatCurrency(avgDealSize)} />
        </div>

        {/* Chart */}
        <div className="border border-gray-200 rounded-lg p-4 mb-5">
          <h3 className="text-[13px] font-semibold text-gray-900 mb-4">
            {viewMode === 'monthly' ? 'Daily Revenue' : 'Monthly Revenue'}
            {filterUser !== 'all' && ` - ${getUserName(Number(filterUser))}`}
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                  tickFormatter={(v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`} />
                <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}
                  formatter={(v: number | undefined) => formatCurrency(v ?? 0)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="revenue" name={viewMode === 'monthly' ? 'Daily Revenue' : 'Monthly Revenue'}
                  stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                {viewMode === 'monthly' && (
                  <Line type="monotone" dataKey="cumulative" name="Cumulative"
                    stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5"
                    dot={{ r: 3, fill: '#8b5cf6' }} activeDot={{ r: 5 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-[13px] text-gray-400">
              No won deals to display
            </div>
          )}
        </div>

        {/* Member breakdown */}
        {isAdmin && filterUser === 'all' && memberBreakdown.length > 0 && (
          <div className="border border-gray-200 rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-[13px] font-semibold text-gray-900">Revenue by Team Member</h3>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/40">
                  <th className="text-left font-medium text-gray-500 px-4 py-2">Member</th>
                  <th className="text-right font-medium text-gray-500 px-4 py-2">Won Deals</th>
                  <th className="text-right font-medium text-gray-500 px-4 py-2">Revenue</th>
                  <th className="text-right font-medium text-gray-500 px-4 py-2">Avg Deal</th>
                </tr>
              </thead>
              <tbody>
                {memberBreakdown.map(m => (
                  <tr key={m.name} className="border-b border-gray-100">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{m.name}</td>
                    <td className="px-4 py-2.5 text-right text-gray-600">{m.deals}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-emerald-700">{formatCurrency(m.revenue)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-500">{formatCurrency(m.deals > 0 ? m.revenue / m.deals : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
    <div className="border border-gray-200 rounded-lg">
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

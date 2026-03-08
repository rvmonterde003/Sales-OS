import { useState, useMemo } from 'react';
import { formatCurrency } from '../lib/helpers';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

type ViewMode = 'monthly' | 'yearly';

export default function RevenueTimeline() {
  const { opportunities, salesStages, getUserName } = useData();
  const { dbUser, allUsers } = useAuth();

  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [filterUser, setFilterUser] = useState<string>('all');

  const isAdmin = dbUser?.role === 'admin' || dbUser?.role === 'executive' || dbUser?.role === 'manager';

  const wonStage = salesStages.find(s => s.name === 'Won');
  const wonOpps = useMemo(() => {
    let opps = opportunities.filter(o => o.stage_id === wonStage?.id && o.closed_at);
    if (filterUser !== 'all') {
      opps = opps.filter(o => o.owner_id === Number(filterUser));
    }
    return opps;
  }, [opportunities, wonStage, filterUser]);

  const chartData = useMemo(() => {
    if (viewMode === 'monthly') {
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
    } else {
      const years: Record<string, number> = {};
      wonOpps.forEach(o => {
        if (!o.closed_at) return;
        const key = String(new Date(o.closed_at).getFullYear());
        years[key] = (years[key] || 0) + o.deal_value;
      });
      return Object.entries(years)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([year, value]) => ({ name: year, revenue: value }));
    }
  }, [wonOpps, viewMode]);

  const totalRevenue = wonOpps.reduce((sum, o) => sum + o.deal_value, 0);
  const avgDealSize = wonOpps.length > 0 ? totalRevenue / wonOpps.length : 0;

  // Per-member breakdown
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
    <div className="p-6 max-w-[1200px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Revenue Timeline</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Won deal revenue over time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Admin user filter */}
          {isAdmin && (
            <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
              className="border border-gray-200 rounded-md text-[12px] px-2.5 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-violet-400">
              <option value="all">All Members</option>
              {allUsers.filter(u => u.is_active).map(u => (
                <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
              ))}
            </select>
          )}
          {/* View mode toggle */}
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
          Revenue by {viewMode === 'monthly' ? 'Month' : 'Year'}
          {filterUser !== 'all' && ` - ${getUserName(Number(filterUser))}`}
        </h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barSize={viewMode === 'yearly' ? 60 : 32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}
                formatter={(v: number | undefined) => formatCurrency(v ?? 0)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenue" name="Won Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-[13px] text-gray-400">
            No won deals to display
          </div>
        )}
      </div>

      {/* Member breakdown - only show for admin when viewing all */}
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

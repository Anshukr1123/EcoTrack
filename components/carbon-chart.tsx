'use client';
import { useState } from 'react';
import { ActivityLog, EMISSION_FACTORS } from '@/lib/ecotrack';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { BarChart, PieChart, Info } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  transport: '#3b82f6', // blue
  utilities: '#eab308', // yellow
  diet: '#f97316',      // orange
  waste: '#a855f7',     // purple
  shopping: '#ec4899',  // pink
};

const CATEGORY_LABELS: Record<string, string> = {
  transport: 'Transport',
  utilities: 'Utilities',
  diet: 'Food & Diet',
  waste: 'Waste & Plastics',
  shopping: 'Shopping',
};

export default function CarbonChart({ activities }: { activities: ActivityLog[] }) {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  // Filter out offsets (activities with negative co2) for accurate emission reporting in charts
  const emissionActivities = activities.filter(a => a.co2 > 0);

  // Group daily emissions beforehand using a Map lookup to lower complexity to linear time
  const dailyTotals: Record<number, number> = {};
  emissionActivities.forEach((a) => {
    const dayTime = startOfDay(new Date(a.date)).getTime();
    dailyTotals[dayTime] = (dailyTotals[dayTime] || 0) + a.co2;
  });

  // Group last 7 days for the Bar Chart
  const barData = [];
  for (let i = 6; i >= 0; i--) {
    const date = startOfDay(subDays(new Date(), i));
    const dayTime = date.getTime();
    const totalCo2 = dailyTotals[dayTime] || 0;
    barData.push({
      day: format(date, 'MMM dd'),
      co2: Number(totalCo2.toFixed(2)),
    });
  }

  // Group by category for the Pie Chart
  const categoryTotals: Record<string, number> = {};
  emissionActivities.forEach((a) => {
    const factor = EMISSION_FACTORS[a.type];
    if (factor) {
      categoryTotals[factor.category] = (categoryTotals[factor.category] || 0) + a.co2;
    }
  });

  const pieData = Object.entries(categoryTotals).map(([cat, total]) => ({
    name: CATEGORY_LABELS[cat] || cat,
    value: Number(total.toFixed(2)),
    color: CATEGORY_COLORS[cat] || '#94a3b8',
  }));

  if (emissionActivities.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <Info className="w-10 h-10 mb-3 opacity-30 text-emerald-600 animate-pulse" />
        <p className="font-semibold text-slate-700 mb-1">No footprint data logged yet</p>
        <p className="text-xs text-slate-400 max-w-[280px]">
          Add activities like driving, electricity, or meals to see your interactive charts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Toggle Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Emission Visualizations
        </h2>
        <div className="flex bg-slate-100 p-1 rounded-xl" role="tablist" aria-label="Emission visualization formats">
          <button
            onClick={() => setChartType('bar')}
            role="tab"
            aria-selected={chartType === 'bar'}
            aria-label="Display footprint as weekly bar chart"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartType === 'bar'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart className="w-3.5 h-3.5" aria-hidden="true" />
            Bar Chart
          </button>
          <button
            onClick={() => setChartType('pie')}
            role="tab"
            aria-selected={chartType === 'pie'}
            aria-label="Display footprint as category pie chart"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartType === 'pie'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" aria-hidden="true" />
            Pie Chart
          </button>
        </div>
      </div>

      <div className="h-[280px] w-full">
        {chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <RechartsTooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              />
              <Bar dataKey="co2" fill="#10b981" radius={[6, 6, 0, 0]} name="CO₂ (kg)" barSize={36} />
            </RechartsBarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
                formatter={(value) => [`${value} kg CO₂`, 'Emissions']}
              />
              <Legend
                iconType="circle"
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

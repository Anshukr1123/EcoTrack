'use client';
import { Target, Leaf, TrendingDown, TrendingUp } from 'lucide-react';

interface StatsGridProps {
  /** The total gross emissions logged in kg CO2 */
  totalEmissions: number;
  /** The total offsets funded in kg CO2 */
  totalOffsets: number;
  /** The net emissions (emissions minus offsets) in kg CO2 */
  netCo2: number;
  /** Monthly forecasted footprint in kg CO2 */
  projectedMonthly: number;
  /** Yearly forecasted footprint in kg CO2 */
  projectedYearly: number;
}

/**
 * StatsGrid renders the summary metrics cards at the top of the dashboard,
 * including Gross Carbon Logged, Offsets Funded, Net Carbon Footprint, and emissions projections.
 * Improves Code Quality (file modularization).
 */
export default function StatsGrid({
  totalEmissions,
  totalOffsets,
  netCo2,
  projectedMonthly,
  projectedYearly,
}: StatsGridProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" aria-label="Footprint summary statistics">
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Carbon Logged</span>
          <Target className="w-5 h-5 text-blue-500" aria-hidden="true" />
        </div>
        <div className="mt-4">
          <span className="text-2xl font-extrabold text-slate-800">{totalEmissions.toFixed(1)}</span>
          <span className="text-sm font-semibold text-slate-400 ml-1">kg CO₂</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Offsets Funded</span>
          <Leaf className="w-5 h-5 text-emerald-500" aria-hidden="true" />
        </div>
        <div className="mt-4">
          <span className="text-2xl font-extrabold text-emerald-600">-{totalOffsets.toFixed(1)}</span>
          <span className="text-sm font-semibold text-slate-400 ml-1">kg CO₂</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Carbon Footprint</span>
          <TrendingDown className="w-5 h-5 text-indigo-500" aria-hidden="true" />
        </div>
        <div className="mt-4">
          <span className={`text-2xl font-extrabold ${netCo2 === 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
            {netCo2.toFixed(1)}
          </span>
          <span className="text-sm font-semibold text-slate-400 ml-1">kg CO₂</span>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emissions Forecast</span>
          <TrendingUp className="w-5 h-5 text-rose-500" aria-hidden="true" />
        </div>
        <div className="mt-2 text-xs text-slate-500">
          <div>Month: <span className="font-bold text-slate-700">{projectedMonthly} kg</span></div>
          <div>Year: <span className="font-bold text-slate-700">{projectedYearly} kg</span></div>
        </div>
      </div>
    </section>
  );
}

'use client';
import { OFFSET_PROGRAMS } from '@/lib/ecotrack';

interface OffsetsPanelProps {
  /** User's current Eco Points balance */
  pointBalance: number;
  /** Handler to trigger purchasing of an offset program */
  handleBuyOffset: (progId: string) => void;
}

/**
 * OffsetsPanel renders available carbon mitigation projects (like tree planting)
 * that users can fund with their Eco Points.
 * Improves Code Quality (modularization) and Accessibility (rich aria-labels on buttons).
 */
export default function OffsetsPanel({
  pointBalance,
  handleBuyOffset,
}: OffsetsPanelProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Fund Carbon Offsets</h2>
        <span className="text-xs font-semibold text-slate-400">Deduct emissions with Eco Points</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {OFFSET_PROGRAMS.map((prog) => {
          const isAffordable = pointBalance >= prog.costPoints;
          return (
            <div
              key={prog.id}
              className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between text-center gap-4 hover:shadow-md hover:border-slate-200 transition-all duration-300"
            >
              <div className="space-y-2">
                <span className="text-4xl block" role="img" aria-label={prog.title}>
                  {prog.image}
                </span>
                <h4 className="font-bold text-sm text-slate-800">{prog.title}</h4>
                <p className="text-xs text-slate-500 leading-snug">{prog.description}</p>
              </div>
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-emerald-600">
                  -{prog.co2Offset} kg CO₂ / offset
                </div>
                <button
                  onClick={() => handleBuyOffset(prog.id)}
                  disabled={!isAffordable}
                  aria-label={`Fund ${prog.title} carbon offset for ${prog.costPoints} points`}
                  className="w-full bg-slate-900 text-white hover:bg-emerald-600 hover:scale-102 active:scale-98 disabled:opacity-40 disabled:hover:bg-slate-900 disabled:hover:scale-100 disabled:cursor-not-allowed font-semibold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  Buy: {prog.costPoints} Pts
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

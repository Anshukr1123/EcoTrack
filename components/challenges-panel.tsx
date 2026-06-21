'use client';
import { TrendingDown } from 'lucide-react';
import { Challenge } from '@/lib/ecotrack';

interface ChallengesPanelProps {
  /** The collection of eco-challenges */
  challenges: Challenge[];
  /** Handler to toggle challenge completion states */
  toggleChallenge: (id: string) => void;
}

/**
 * ChallengesPanel displays gamified environmental challenges
 * which users can complete to earn Eco Points.
 * Improves Code Quality (file modularization) and Accessibility (matching label HTML IDs).
 */
export default function ChallengesPanel({
  challenges,
  toggleChallenge,
}: ChallengesPanelProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[320px]">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
        <TrendingDown className="w-4 h-4 text-emerald-500" aria-hidden="true" />
        Active Challenges
      </h2>
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {challenges.map((c) => {
          const checkboxId = `challenge-${c.id}`;
          return (
            <div
              key={c.id}
              className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                c.completed
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-slate-100 hover:bg-slate-50'
              }`}
            >
              <input
                type="checkbox"
                id={checkboxId}
                checked={c.completed}
                onChange={() => toggleChallenge(c.id)}
                className="w-4.5 h-4.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer mt-0.5"
                aria-label={`Toggle status for challenge: ${c.title}`}
              />
              <label htmlFor={checkboxId} className="flex-1 min-w-0 cursor-pointer">
                <div className="flex justify-between items-center gap-2">
                  <span
                    className={`font-semibold text-xs truncate ${
                      c.completed ? 'text-slate-500 line-through' : 'text-slate-800'
                    }`}
                  >
                    {c.title}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      c.completed
                        ? 'bg-emerald-200/50 text-emerald-700'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    +{c.points} pts
                  </span>
                </div>
                <p
                  className={`text-[11px] mt-1 leading-snug ${
                    c.completed ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {c.description}
                </p>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

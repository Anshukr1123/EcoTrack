'use client';
import { Users } from 'lucide-react';
import { LeaderboardEntry } from '@/lib/ecotrack';

interface LeaderboardPanelProps {
  /** The calculated leaderboard listings */
  leaderboard: LeaderboardEntry[];
  /** The currently selected leaderboard filter tab */
  leaderboardTab: 'friends' | 'college' | 'city';
  /** State modifier to switch leaderboard filter tabs */
  setLeaderboardTab: (tab: 'friends' | 'college' | 'city') => void;
}

/**
 * LeaderboardPanel displays the comparative eco point rankings of users
 * across different social tiers: friends, college, or city.
 * Improves Code Quality (file modularization).
 */
export default function LeaderboardPanel({
  leaderboard,
  leaderboardTab,
  setLeaderboardTab,
}: LeaderboardPanelProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-indigo-500" />
          Leaderboards
        </h3>
        <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px]" role="tablist" aria-label="Leaderboard scope selection">
          {(['friends', 'college', 'city'] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={leaderboardTab === tab}
              aria-label={`Show ${tab} leaderboard`}
              onClick={() => setLeaderboardTab(tab)}
              className={`px-2 py-1 rounded font-semibold capitalize transition-all ${
                leaderboardTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2" aria-live="polite">
        {leaderboard.map((user, idx) => (
          <div
            key={idx}
            className={`flex justify-between items-center p-2.5 rounded-xl text-xs font-semibold ${
              user.isCurrentUser
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'text-slate-700 bg-slate-50/50 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-slate-400 w-4 font-bold" aria-hidden="true">
                {idx + 1}
              </span>
              <span className="truncate max-w-[140px]">{user.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold">{user.points}</span>
              <span className="text-[10px] text-slate-400 font-normal">pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

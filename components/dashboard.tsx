'use client';
import { useState, useEffect } from 'react';
import {
  ActivityLog,
  Challenge,
  INITIAL_CHALLENGES,
  OFFSET_PROGRAMS,
  INITIAL_BADGES,
  MOCK_LEADERBOARD,
  getProjections,
  EMISSION_FACTORS,
  generateId,
} from '@/lib/ecotrack';
import ActivityForm from './activity-form';
import AiCoach from './ai-coach';
import LeaderboardPanel from './leaderboard-panel';
import ChallengesPanel from './challenges-panel';
import OffsetsPanel from './offsets-panel';
import BadgesPanel from './badges-panel';
import dynamic from 'next/dynamic';
import {
  Leaf,
  Trophy,
  Target,
  TrendingDown,
  Award,
  Compass,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

const CarbonChart = dynamic(() => import('./carbon-chart'), { ssr: false });

/**
 * Main EcoTrack AI Dashboard orchestrating activities state, offsets purchase,
 * suggestions recommendations, dynamic charts rendering, and gamification panels.
 * Refactored to leverage modularized component panels to maximize codebase cleanliness.
 */
export function Dashboard() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [leaderboardTab, setLeaderboardTab] = useState<'friends' | 'college' | 'city'>('friends');
  const [userName, setUserName] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      const storedActs = localStorage.getItem('eco_activities');
      const storedChalls = localStorage.getItem('eco_challenges');
      const storedName = localStorage.getItem('eco_username');
      if (storedActs) setActivities(JSON.parse(storedActs));
      if (storedChalls) setChallenges(JSON.parse(storedChalls));
      if (storedName) setUserName(storedName);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save changes to local storage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('eco_activities', JSON.stringify(activities));
      localStorage.setItem('eco_challenges', JSON.stringify(challenges));
      localStorage.setItem('eco_username', userName);
    }
  }, [activities, challenges, userName, mounted]);

  const handleAddActivity = (act: ActivityLog) => {
    setActivities((prev) => [act, ...prev]);
  };

  const toggleChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  };

  // Computations
  const totalEmissions = activities
    .filter((a) => a.co2 > 0)
    .reduce((sum, a) => sum + a.co2, 0);

  const totalOffsets = activities
    .filter((a) => a.co2 < 0)
    .reduce((sum, a) => sum + Math.abs(a.co2), 0);

  const netCo2 = Math.max(0, totalEmissions - totalOffsets);

  const challengePoints = challenges
    .filter((c) => c.completed)
    .reduce((sum, c) => sum + c.points, 0);

  const activityPoints = activities.reduce((sum, a) => sum + a.pointsEarned, 0);

  const pointBalance = Math.max(0, challengePoints + activityPoints);

  const { monthly: projectedMonthly, yearly: projectedYearly } = getProjections(
    activities.filter((a) => a.co2 > 0)
  );

  // Badge unlocking logic mapping
  const badges = INITIAL_BADGES.map((badge) => {
    let unlocked = false;
    if (badge.id === 'b1') {
      unlocked = activities.some((a) => a.type === 'walking' || a.type === 'bus');
    } else if (badge.id === 'b2') {
      const veganMeals = activities
        .filter((a) => a.type === 'vegan_meal')
        .reduce((sum, a) => sum + a.amount, 0);
      unlocked = veganMeals >= 3;
    } else if (badge.id === 'b3') {
      const recycledWeight = activities
        .filter((a) => a.type === 'waste_recycled')
        .reduce((sum, a) => sum + a.amount, 0);
      unlocked = recycledWeight >= 5;
    } else if (badge.id === 'b4') {
      unlocked = totalOffsets > 0;
    } else if (badge.id === 'b5') {
      unlocked = pointBalance >= 300;
    }
    return { ...badge, unlocked };
  });

  const handleBuyOffset = (progId: string) => {
    const program = OFFSET_PROGRAMS.find((p) => p.id === progId);
    if (!program || pointBalance < program.costPoints) return;

    const offsetLog: ActivityLog = {
      id: generateId(),
      type: 'vegan_meal', // Generic placeholder type; negative co2 marks it as offset
      amount: program.co2Offset,
      co2: -program.co2Offset,
      date: new Date().toISOString(),
      pointsEarned: -program.costPoints,
    };

    setActivities((prev) => [offsetLog, ...prev]);
  };

  const getSuggestions = () => {
    const suggestions = [];
    const transportEmissions = activities
      .filter((a) => EMISSION_FACTORS[a.type]?.category === 'transport')
      .reduce((sum, a) => sum + a.co2, 0);
    const wasteEmissions = activities
      .filter((a) => EMISSION_FACTORS[a.type]?.category === 'waste')
      .reduce((sum, a) => sum + a.co2, 0);

    if (transportEmissions > 15) {
      suggestions.push({
        title: 'High travel emissions detected',
        text: 'Consider walking or cycling for distances under 5 km to save up to 4 kg of CO₂ and earn extra Eco Points.',
      });
    }
    if (wasteEmissions > 5) {
      suggestions.push({
        title: 'Waste impact is growing',
        text: 'Try starting a home composting bin and swap single-use plastic bottles with a reusable container.',
      });
    }
    if (activities.length === 0) {
      suggestions.push({
        title: 'Start your green journey',
        text: 'Log your first daily commute or meal. The AI sustainability coach can help you get started!',
      });
    } else {
      suggestions.push({
        title: 'Earn rewards',
        text: 'Redeem your Eco Points in the Offsets panel to plant real trees and lower your net footprint.',
      });
    }
    return suggestions;
  };

  const leaderboard = MOCK_LEADERBOARD.map((user) => {
    if (user.isCurrentUser) {
      return { ...user, points: pointBalance, name: userName || 'You (EcoTracker)' };
    }
    const offset = leaderboardTab === 'college' ? 30 : leaderboardTab === 'city' ? -50 : 0;
    return { ...user, points: user.points + offset };
  }).sort((a, b) => b.points - a.points);

  const downloadCertificate = () => {
    const svgElement = document.getElementById('eco-certificate-svg');
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const blobURL = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = blobURL;
    downloadLink.download = `${(userName || 'Eco_Warrior').replace(/\s+/g, '_')}_EcoTrack_Certificate.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-semibold text-slate-500">
        Loading EcoTrack...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 selection:bg-emerald-100">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:px-8 rounded-3xl shadow-lg border border-slate-700/30">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Leaf className="w-8 h-8" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">EcoTrack AI</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-0.5">Personal Carbon Footprint & Smart Offset Platform</p>
          </div>
        </div>

        {/* User Nickname Config */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Enter your name..."
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            aria-label="Your profile nickname"
            className="bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-4 py-2 rounded-xl text-emerald-400 font-bold text-sm shrink-0">
            <Trophy className="w-4 h-4" aria-hidden="true" />
            {pointBalance} Pts
          </div>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Hand: Calculator Form & Chart Visualization */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ActivityForm onAdd={handleAddActivity} />

            {/* Smart Suggestions & Personalized recommendations */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  Eco Recommendations
                </h3>
                <div className="space-y-4">
                  {getSuggestions().map((s, idx) => (
                    <div key={idx} className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
                      <h4 className="font-bold text-xs text-emerald-800">{s.title}</h4>
                      <p className="text-xs text-slate-600 leading-snug">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <CarbonChart activities={activities} />
          </div>

          {/* Carbon Offsets Panel */}
          <OffsetsPanel pointBalance={pointBalance} handleBuyOffset={handleBuyOffset} />
        </div>

        {/* Right Hand Sidebar (AI chat, challenges, leaderboard, badges) */}
        <div className="lg:col-span-1 space-y-8">
          {/* AI sustainability coach */}
          <AiCoach onAddActivity={handleAddActivity} />

          {/* Active Challenges */}
          <ChallengesPanel challenges={challenges} toggleChallenge={toggleChallenge} />

          {/* Leaderboard */}
          <LeaderboardPanel
            leaderboard={leaderboard}
            leaderboardTab={leaderboardTab}
            setLeaderboardTab={setLeaderboardTab}
          />

          {/* Badges Panel & Certificate Download */}
          <BadgesPanel
            pointBalance={pointBalance}
            badges={badges}
            userName={userName}
            showCertificate={showCertificate}
            setShowCertificate={setShowCertificate}
            downloadCertificate={downloadCertificate}
          />
        </div>
      </div>

      {/* Hidden Certificate Component for SVG download */}
      <div className="hidden" aria-hidden="true">
        <svg
          id="eco-certificate-svg"
          width="800"
          height="600"
          viewBox="0 0 800 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background */}
          <rect width="800" height="600" fill="#f8fafc" rx="16" />
          <rect x="20" y="20" width="760" height="560" fill="none" stroke="#10b981" strokeWidth="8" rx="8" />
          <rect x="30" y="30" width="740" height="540" fill="none" stroke="#047857" strokeWidth="2" rx="6" />

          {/* Patterns */}
          <circle cx="70" cy="70" r="100" fill="#10b981" fillOpacity="0.03" />
          <circle cx="730" cy="530" r="120" fill="#10b981" fillOpacity="0.03" />

          {/* Content */}
          <text x="400" y="120" fontFamily="sans-serif" fontSize="28" fontWeight="bold" fill="#065f46" textAnchor="middle">
            CERTIFICATE OF SUSTAINABILITY Achievement
          </text>
          <text x="400" y="160" fontFamily="sans-serif" fontSize="14" fill="#64748b" textAnchor="middle" letterSpacing="2">
            PROUDLY PRESENTED TO
          </text>
          
          {/* User Name */}
          <text x="400" y="250" fontFamily="sans-serif" fontSize="36" fontWeight="bold" fill="#0f172a" textAnchor="middle">
            {userName || 'Eco Warrior'}
          </text>
          <line x1="200" y1="270" x2="600" y2="270" stroke="#047857" strokeWidth="2" />

          <text x="400" y="320" fontFamily="sans-serif" fontSize="15" fill="#475569" textAnchor="middle" width="500">
            For outstanding commitment to tracking and mitigating carbon emissions,
          </text>
          <text x="400" y="345" fontFamily="sans-serif" fontSize="15" fill="#475569" textAnchor="middle">
            accumulating over {pointBalance} Eco Points, and funding carbon offset initiatives.
          </text>

          {/* Badges / Logos */}
          <g transform="translate(360, 390)">
            <circle cx="40" cy="40" r="40" fill="#10b981" fillOpacity="0.1" />
            <text x="40" y="52" fontFamily="sans-serif" fontSize="36" textAnchor="middle">🌱</text>
          </g>

          {/* Footers */}
          <text x="400" y="495" fontFamily="sans-serif" fontSize="13" fontWeight="bold" fill="#334155" textAnchor="middle">
            Verified by EcoTrack AI Platform
          </text>
          <text x="400" y="515" fontFamily="sans-serif" fontSize="11" fill="#94a3b8" textAnchor="middle">
            Issued on {new Date().toLocaleDateString()}
          </text>
        </svg>
      </div>
    </div>
  );
}

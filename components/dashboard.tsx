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
import dynamic from 'next/dynamic';
import {
  Leaf,
  Trophy,
  Target,
  TrendingDown,
  Award,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  Download,
  AlertCircle,
} from 'lucide-react';

const CarbonChart = dynamic(() => import('./carbon-chart'), { ssr: false });

export function Dashboard() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
  const [leaderboardTab, setLeaderboardTab] = useState<'friends' | 'college' | 'city'>('friends');
  const [userName, setUserName] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from local storage
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

  // Save to local storage
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

  // Calculations
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

  // Projections
  const { monthly: projectedMonthly, yearly: projectedYearly } = getProjections(
    activities.filter((a) => a.co2 > 0)
  );

  // Badges unlocking logic
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

  // Purchase offsets
  const handleBuyOffset = (progId: string) => {
    const program = OFFSET_PROGRAMS.find((p) => p.id === progId);
    if (!program || pointBalance < program.costPoints) return;

    const offsetLog: ActivityLog = {
      id: generateId(),
      type: 'vegan_meal', // Generic placeholder, co2 < 0 will classify it as offset
      amount: program.co2Offset,
      co2: -program.co2Offset,
      date: new Date().toISOString(),
      pointsEarned: -program.costPoints,
    };

    setActivities((prev) => [offsetLog, ...prev]);
  };

  // Recommendations / Suggestions Engine
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

  // Adjust mock leaderboard based on user points
  const leaderboard = MOCK_LEADERBOARD.map((user) => {
    if (user.isCurrentUser) {
      return { ...user, points: pointBalance, name: userName || 'You (EcoTracker)' };
    }
    // Add offset to mock data based on tab to simulate variety
    const offset = leaderboardTab === 'college' ? 30 : leaderboardTab === 'city' ? -50 : 0;
    return { ...user, points: user.points + offset };
  }).sort((a, b) => b.points - a.points);

  // Render Certificate SVG
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

  if (!mounted) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-semibold text-slate-500">Loading EcoTrack...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 selection:bg-emerald-100">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:px-8 rounded-3xl shadow-lg border border-slate-700/30">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Leaf className="w-8 h-8" />
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
            className="bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-4 py-2 rounded-xl text-emerald-400 font-bold text-sm shrink-0">
            <Trophy className="w-4 h-4" />
            {pointBalance} Pts
          </div>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Carbon Logged</span>
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-slate-800">{totalEmissions.toFixed(1)}</span>
            <span className="text-sm font-semibold text-slate-400 ml-1">kg CO₂</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Offsets Funded</span>
            <Leaf className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-extrabold text-emerald-600">-{totalOffsets.toFixed(1)}</span>
            <span className="text-sm font-semibold text-slate-400 ml-1">kg CO₂</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Carbon Footprint</span>
            <TrendingDown className="w-5 h-5 text-indigo-500" />
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
            <TrendingUp className="w-5 h-5 text-rose-500" />
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
                  <Compass className="w-4 h-4 text-emerald-600" />
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
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Fund Carbon Offsets</h3>
              <span className="text-xs font-semibold text-slate-400">Deduct emissions with Eco Points</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {OFFSET_PROGRAMS.map((prog) => (
                <div
                  key={prog.id}
                  className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between text-center gap-4 hover:shadow-md hover:border-slate-200 transition-all duration-300"
                >
                  <div className="space-y-2">
                    <span className="text-4xl block">{prog.image}</span>
                    <h4 className="font-bold text-sm text-slate-800">{prog.title}</h4>
                    <p className="text-xs text-slate-500 leading-snug">{prog.description}</p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold text-emerald-600">
                      -{prog.co2Offset} kg CO₂ / offset
                    </div>
                    <button
                      onClick={() => handleBuyOffset(prog.id)}
                      disabled={pointBalance < prog.costPoints}
                      className="w-full bg-slate-900 text-white hover:bg-emerald-600 hover:scale-102 active:scale-98 disabled:opacity-40 disabled:hover:bg-slate-900 disabled:hover:scale-100 disabled:cursor-not-allowed font-semibold py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      Buy: {prog.costPoints} Pts
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Hand Sidebar (AI chat, challenges, leaderboard, badges) */}
        <div className="lg:col-span-1 space-y-8">
          {/* AI sustainability coach */}
          <AiCoach onAddActivity={handleAddActivity} />

          {/* Active Challenges */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[320px]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-500" />
              Active Challenges
            </h2>
            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {challenges.map((c) => (
                <label
                  key={c.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    c.completed ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={c.completed}
                    onChange={() => toggleChallenge(c.id)}
                    className="w-4.5 h-4.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 cursor-pointer mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <span className={`font-semibold text-xs truncate ${c.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                        {c.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.completed ? 'bg-emerald-200/50 text-emerald-700' : 'bg-emerald-100 text-emerald-600'}`}>
                        +{c.points}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 leading-snug ${c.completed ? 'text-slate-400' : 'text-slate-500'}`}>
                      {c.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                Leaderboards
              </h3>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px]">
                {(['friends', 'college', 'city'] as const).map((tab) => (
                  <button
                    key={tab}
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

            <div className="space-y-2">
              {leaderboard.map((user, idx) => (
                <div
                  key={idx}
                  className={`flex justify-between items-center p-2.5 rounded-xl text-xs font-semibold ${
                    user.isCurrentUser ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'text-slate-700 bg-slate-50/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400 w-4 font-bold">{idx + 1}</span>
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

          {/* Badges Panel & Certificate Download */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              Achievements
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {badges.map((b) => (
                <div
                  key={b.id}
                  title={`${b.title}: ${b.description} (${b.unlocked ? 'Unlocked' : 'Locked'})`}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center relative group cursor-help transition-all duration-300 ${
                    b.unlocked ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' : 'bg-slate-50/50 border-slate-100 opacity-30 grayscale'
                  }`}
                >
                  <span className="text-2xl">{b.icon}</span>
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] rounded-lg p-2 w-[180px] z-20 text-center font-normal leading-relaxed shadow-lg">
                    <div className="font-bold text-emerald-400 mb-0.5">{b.title}</div>
                    {b.description}
                  </div>
                </div>
              ))}
            </div>

            {/* Certificate download */}
            <div className="pt-2 border-t border-slate-100">
              {pointBalance >= 500 ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500 leading-snug">
                    Congratulations! You have reached <span className="font-bold text-emerald-600">500+ Eco Points</span>. You are eligible to generate your carbon neutrality certificate!
                  </div>
                  <button
                    onClick={() => setShowCertificate(true)}
                    className="w-full bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-102 active:scale-98 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-700/25"
                  >
                    <Award className="w-4.5 h-4.5" />
                    Generate Certificate
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 p-3 rounded-xl text-xs text-slate-500 leading-snug">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  Reach <span className="font-bold text-slate-700">500 Eco Points</span> to unlock your printable EcoTrack Sustainability Certificate (currently: {pointBalance}/500).
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Certificate Component for SVG download */}
      <div className="hidden">
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

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-6 relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Your Sustainability Certificate</h3>
                <p className="text-xs text-slate-500 mt-1">Official printable certificate showing your carbon neutrality accomplishments.</p>
              </div>
              <button
                onClick={() => setShowCertificate(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-50 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-slate-50/50 p-4">
              {/* Scaled Preview of SVG */}
              <div className="aspect-[4/3] w-full border border-slate-100 rounded-xl overflow-hidden bg-white shadow-inner flex items-center justify-center">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 800 600"
                  className="w-full h-full object-contain"
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
                    CERTIFICATE OF SUSTAINABILITY ACHIEVEMENT
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

            <div className="flex gap-4">
              <button
                onClick={() => setShowCertificate(false)}
                className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-3 rounded-xl text-xs transition-all text-center"
              >
                Close
              </button>
              <button
                onClick={downloadCertificate}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-750/25"
              >
                <Download className="w-4 h-4" />
                Download (SVG)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

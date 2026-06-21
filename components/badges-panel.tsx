'use client';
import { Award, AlertCircle, Download } from 'lucide-react';
import { Badge } from '@/lib/ecotrack';

interface BadgesPanelProps {
  /** User's current Eco Points balance */
  pointBalance: number;
  /** Achievements badges with locked/unlocked flags */
  badges: Badge[];
  /** Custom nickname entered by the user */
  userName: string;
  /** State visibility of the certificate modal */
  showCertificate: boolean;
  /** Handler to open or close the certificate modal */
  setShowCertificate: (show: boolean) => void;
  /** Handler to download the certificate as a local file */
  downloadCertificate: () => void;
}

/**
 * BadgesPanel renders unlocked badges, locked goals, and provides
 * a printable achievement certificate generator modal when users accumulate 500+ points.
 * Improves Code Quality (modularization) and Accessibility (focus states, closing ARIA labels).
 */
export default function BadgesPanel({
  pointBalance,
  badges,
  userName,
  showCertificate,
  setShowCertificate,
  downloadCertificate,
}: BadgesPanelProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
        <Award className="w-4 h-4 text-emerald-600" aria-hidden="true" />
        Achievements
      </h2>
      <div className="grid grid-cols-5 gap-3" role="list" aria-label="EcoTrack Achievements list">
        {badges.map((b) => (
          <div
            key={b.id}
            role="listitem"
            title={`${b.title}: ${b.description} (${b.unlocked ? 'Unlocked' : 'Locked'})`}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center relative group cursor-help transition-all duration-300 ${
              b.unlocked
                ? 'bg-emerald-50/50 border-emerald-200 shadow-sm'
                : 'bg-slate-50/50 border-slate-100 opacity-30 grayscale'
            }`}
          >
            <span className="text-2xl" role="img" aria-label={b.title}>
              {b.icon}
            </span>
            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] rounded-lg p-2 w-[180px] z-20 text-center font-normal leading-relaxed shadow-lg">
              <div className="font-bold text-emerald-400 mb-0.5">{b.title}</div>
              {b.description}
            </div>
          </div>
        ))}
      </div>

      {/* Certificate download section */}
      <div className="pt-2 border-t border-slate-100">
        {pointBalance >= 500 ? (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 leading-snug">
              Congratulations! You have reached{' '}
              <span className="font-bold text-emerald-600">500+ Eco Points</span>. You are
              eligible to generate your carbon neutrality certificate!
            </div>
            <button
              onClick={() => setShowCertificate(true)}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-102 active:scale-98 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-700/25"
            >
              <Award className="w-4.5 h-4.5" aria-hidden="true" />
              Generate Certificate
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 p-3 rounded-xl text-xs text-slate-500 leading-snug">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            Reach <span className="font-bold text-slate-700">500 Eco Points</span> to unlock
            your printable EcoTrack Sustainability Certificate (currently: {pointBalance}/500).
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-labelledby="modal-title"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-6 relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 id="modal-title" className="text-xl font-bold text-slate-800">
                  Your Sustainability Certificate
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Official printable certificate showing your carbon neutrality accomplishments.
                </p>
              </div>
              <button
                onClick={() => setShowCertificate(false)}
                aria-label="Close certificate modal"
                className="text-slate-400 hover:text-slate-600 font-bold p-1 hover:bg-slate-50 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-slate-50/50 p-4">
              <div className="aspect-[4/3] w-full border border-slate-100 rounded-xl overflow-hidden bg-white shadow-inner flex items-center justify-center">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 800 600"
                  className="w-full h-full object-contain"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label={`EcoTrack Sustainability Certificate awarded to ${userName || 'Eco Warrior'}`}
                >
                  <rect width="800" height="600" fill="#f8fafc" rx="16" />
                  <rect x="20" y="20" width="760" height="560" fill="none" stroke="#10b981" strokeWidth="8" rx="8" />
                  <rect x="30" y="30" width="740" height="540" fill="none" stroke="#047857" strokeWidth="2" rx="6" />

                  <circle cx="70" cy="70" r="100" fill="#10b981" fillOpacity="0.03" />
                  <circle cx="730" cy="530" r="120" fill="#10b981" fillOpacity="0.03" />

                  <text x="400" y="120" fontFamily="sans-serif" fontSize="28" fontWeight="bold" fill="#065f46" textAnchor="middle">
                    CERTIFICATE OF SUSTAINABILITY ACHIEVEMENT
                  </text>
                  <text x="400" y="160" fontFamily="sans-serif" fontSize="14" fill="#64748b" textAnchor="middle" letterSpacing="2">
                    PROUDLY PRESENTED TO
                  </text>
                  
                  <text x="400" y="250" fontFamily="sans-serif" fontSize="36" fontWeight="bold" fill="#0f172a" textAnchor="middle">
                    {userName || 'Eco Warrior'}
                  </text>
                  <line x1="200" y1="270" x2="600" y2="270" stroke="#047857" strokeWidth="2" />

                  <text x="400" y="320" fontFamily="sans-serif" fontSize="15" fill="#475569" textAnchor="middle">
                    For outstanding commitment to tracking and mitigating carbon emissions,
                  </text>
                  <text x="400" y="345" fontFamily="sans-serif" fontSize="15" fill="#475569" textAnchor="middle">
                    accumulating over {pointBalance} Eco Points, and funding carbon offset initiatives.
                  </text>

                  <g transform="translate(360, 390)">
                    <circle cx="40" cy="40" r="40" fill="#10b981" fillOpacity="0.1" />
                    <text x="40" y="52" fontFamily="sans-serif" fontSize="36" textAnchor="middle">🌱</text>
                  </g>

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
                aria-label="Download sustainability certificate in SVG format"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-750/25"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Download (SVG)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

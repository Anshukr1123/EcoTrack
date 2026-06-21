'use client';
import { useState } from 'react';
import { EMISSION_FACTORS, ActivityType, ActivityLog, generateId } from '@/lib/ecotrack';
import { PlusCircle, Car, Lightbulb, Pizza, Trash2, ShoppingBag } from 'lucide-react';

const CATEGORIES = [
  { id: 'transport', label: 'Transport', icon: Car, color: 'text-blue-500 bg-blue-50 hover:bg-blue-100' },
  { id: 'utilities', label: 'Utilities', icon: Lightbulb, color: 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' },
  { id: 'diet', label: 'Food & Diet', icon: Pizza, color: 'text-orange-500 bg-orange-50 hover:bg-orange-100' },
  { id: 'waste', label: 'Waste', icon: Trash2, color: 'text-purple-500 bg-purple-50 hover:bg-purple-100' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'text-pink-500 bg-pink-50 hover:bg-pink-100' },
];

/**
 * ActivityForm handles logging carbon-impactful activities by category.
 * It provides category tab selections, input options, and dynamic impact estimations.
 */
export default function ActivityForm({ onAdd }: { onAdd: (activity: ActivityLog) => void }) {
  const [activeTab, setActiveTab] = useState('transport');
  const [type, setType] = useState<ActivityType>('car');
  const [amount, setAmount] = useState<string>('');

  const handleTabChange = (catId: string) => {
    setActiveTab(catId);
    // Auto-select first activity in category
    const firstOfCat = Object.entries(EMISSION_FACTORS).find(
      ([_, data]) => data.category === catId
    );
    if (firstOfCat) {
      setType(firstOfCat[0] as ActivityType);
    }
    setAmount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const factorDetails = EMISSION_FACTORS[type];
    const co2 = parsedAmount * factorDetails.factor;
    const pointsEarned = factorDetails.pointsMultiplier !== 0 ? Math.round(parsedAmount * factorDetails.pointsMultiplier) : 0;

    const activity: ActivityLog = {
      id: generateId(),
      type,
      amount: parsedAmount,
      co2,
      date: new Date().toISOString(),
      pointsEarned,
    };

    onAdd(activity);
    setAmount('');
  };

  const filteredActivities = Object.entries(EMISSION_FACTORS).filter(
    ([_, data]) => data.category === activeTab
  );

  const factorDetails = EMISSION_FACTORS[type];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-emerald-600" />
        Log New Activity
      </h2>

      {/* Category Tabs */}
      <div className="grid grid-cols-5 gap-1 mb-5" role="tablist" aria-label="Activity Categories">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleTabChange(cat.id)}
              role="tab"
              aria-selected={isActive}
              aria-label={`Switch to ${cat.label} category`}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-[10px] sm:text-xs font-semibold gap-1.5 ${
                isActive
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-500'
                  : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 h-5" aria-hidden="true" />
              <span className="hidden sm:inline">{cat.label}</span>
              <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <label htmlFor="activity-type-select" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Activity Type
            </label>
            <select
              id="activity-type-select"
              value={type}
              onChange={(e) => {
                setType(e.target.value as ActivityType);
                setAmount('');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            >
              {filteredActivities.map(([key, data]) => (
                <option key={key} value={key}>
                  {data.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="activity-amount-input" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Amount ({factorDetails?.unit})
            </label>
            <input
              type="number"
              id="activity-amount-input"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter amount in ${factorDetails?.unit}...`}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Add to Footprint
          </button>
          
          {amount && !isNaN(parseFloat(amount)) && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div>
                <span className="text-slate-500">Carbon Impact:</span>
                <div className="font-bold text-slate-800 text-sm">
                  {Math.abs(parseFloat(amount) * factorDetails.factor).toFixed(2)} kg CO₂
                </div>
              </div>
              {factorDetails.pointsMultiplier !== 0 && (
                <div className="text-right">
                  <span className="text-slate-500">Reward:</span>
                  <div className={`font-bold text-sm ${factorDetails.pointsMultiplier > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {factorDetails.pointsMultiplier > 0 ? '+' : ''}
                    {Math.round(parseFloat(amount) * factorDetails.pointsMultiplier)} pts
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

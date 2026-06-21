export type ActivityType =
  | 'car'
  | 'bus'
  | 'flight'
  | 'walking'
  | 'electricity'
  | 'lpg'
  | 'water'
  | 'beef_meal'
  | 'vegan_meal'
  | 'plastic'
  | 'waste_landfill'
  | 'waste_recycled'
  | 'clothing'
  | 'electronics';

export type ActivityLog = {
  id: string;
  type: ActivityType;
  amount: number;
  co2: number;
  date: string;
  pointsEarned: number;
};

export const EMISSION_FACTORS: Record<
  ActivityType,
  { factor: number; unit: string; label: string; pointsMultiplier: number; category: string }
> = {
  car: { factor: 0.192, unit: 'km', label: 'Car Travel', pointsMultiplier: 0, category: 'transport' },
  bus: { factor: 0.089, unit: 'km', label: 'Public Transport', pointsMultiplier: 2, category: 'transport' },
  flight: { factor: 0.150, unit: 'km', label: 'Flight', pointsMultiplier: 0, category: 'transport' },
  walking: { factor: 0.0, unit: 'km', label: 'Walking/Cycling', pointsMultiplier: 10, category: 'transport' },
  electricity: { factor: 0.385, unit: 'kWh', label: 'Electricity', pointsMultiplier: 0, category: 'utilities' },
  lpg: { factor: 2.983, unit: 'kg', label: 'LPG Cylinder', pointsMultiplier: 0, category: 'utilities' },
  water: { factor: 0.0003, unit: 'liters', label: 'Water Usage', pointsMultiplier: 0, category: 'utilities' },
  beef_meal: { factor: 3.0, unit: 'meals', label: 'Heavy Meat Meal', pointsMultiplier: 0, category: 'diet' },
  vegan_meal: { factor: 0.3, unit: 'meals', label: 'Plant-Based Meal', pointsMultiplier: 15, category: 'diet' },
  plastic: { factor: 0.12, unit: 'items', label: 'Single-Use Plastic', pointsMultiplier: -5, category: 'waste' },
  waste_landfill: { factor: 0.50, unit: 'kg', label: 'Landfill Waste', pointsMultiplier: 0, category: 'waste' },
  waste_recycled: { factor: 0.05, unit: 'kg', label: 'Recycled Waste', pointsMultiplier: 8, category: 'waste' },
  clothing: { factor: 6.0, unit: 'items', label: 'Clothing Purchase', pointsMultiplier: 0, category: 'shopping' },
  electronics: { factor: 45.0, unit: 'items', label: 'Electronics Purchase', pointsMultiplier: 0, category: 'shopping' },
};

export type Challenge = {
  id: string;
  title: string;
  points: number;
  description: string;
  completed: boolean;
};

export const INITIAL_CHALLENGES: Challenge[] = [
  { id: '1', title: 'Meat-Free Monday', points: 50, description: 'Enjoy purely plant-based meals for an entire day.', completed: false },
  { id: '2', title: 'No Plastic Day', points: 30, description: 'Refuse all single-use plastics today.', completed: false },
  { id: '3', title: 'Walk 5 km', points: 100, description: 'Walk or bike for your commute instead of driving.', completed: false },
  { id: '4', title: 'Energy Saver', points: 40, description: 'Unplug devices when not in use to save phantom energy.', completed: false },
  { id: '5', title: 'Zero Waste Weekend', points: 120, description: 'Separate and recycle all trash over the weekend.', completed: false },
  { id: '6', title: 'Car-Free Friday', points: 80, description: 'Use public transport, walk, or cycle to work.', completed: false },
];

export type OffsetProgram = {
  id: string;
  title: string;
  costPoints: number;
  co2Offset: number;
  description: string;
  image: string;
};

export const OFFSET_PROGRAMS: OffsetProgram[] = [
  {
    id: 'tree_plantation',
    title: 'Plant a Native Tree',
    costPoints: 150,
    co2Offset: 10, // kg CO2
    description: 'Support local reforestation efforts to restore habitats and absorb carbon.',
    image: '🌳',
  },
  {
    id: 'solar_energy',
    title: 'Rural Solar Initiative',
    costPoints: 250,
    co2Offset: 25, // kg CO2
    description: 'Fund solar panels for off-grid schools and medical clinics.',
    image: '☀️',
  },
  {
    id: 'cleanup_drive',
    title: 'Ocean Cleanup Drive',
    costPoints: 100,
    co2Offset: 5, // kg CO2
    description: 'Finance volunteer teams removing plastic and trash from coastal regions.',
    image: '🌊',
  },
];

export type Badge = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

export const INITIAL_BADGES: Badge[] = [
  { id: 'b1', title: 'Green Commuter', description: 'Log a walking, cycling, or public transport activity', icon: '🚲', unlocked: false },
  { id: 'b2', title: 'Plant Lover', description: 'Eat at least 3 plant-based vegan meals', icon: '🌱', unlocked: false },
  { id: 'b3', title: 'Recycling Master', description: 'Log at least 5 kg of recycled waste', icon: '♻️', unlocked: false },
  { id: 'b4', title: 'Carbon Neutralizer', description: 'Purchase your first carbon offset', icon: '🛡️', unlocked: false },
  { id: 'b5', title: 'Eco Warrior', description: 'Earn a total of 300 Eco Points', icon: '🥇', unlocked: false },
];

export type LeaderboardEntry = {
  name: string;
  points: number;
  rank: number;
  isCurrentUser?: boolean;
};

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'Sarah Jenkins', points: 620, rank: 1 },
  { name: 'Aarav Sharma', points: 450, rank: 2 },
  { name: 'Chloe Chen', points: 380, rank: 3 },
  { name: 'You (EcoTracker)', points: 0, rank: 4, isCurrentUser: true },
  { name: 'David Smith', points: 120, rank: 5 },
];

// Generates a unique ID
export function generateId(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `eco-${Date.now()}-${Math.floor(Math.random() * 10000000)}-${Math.random().toString(36).substring(2, 9)}`;
}

// Predictive emission calculations helper
export function getProjections(activities: ActivityLog[]) {
  if (activities.length === 0) return { monthly: 0, yearly: 0 };
  
  // Calculate average daily emissions
  const dates = activities.map(a => new Date(a.date).toDateString());
  const uniqueDays = new Set(dates).size || 1;
  const totalCo2 = activities.reduce((sum, a) => sum + a.co2, 0);
  const dailyAverage = totalCo2 / uniqueDays;

  return {
    monthly: Math.round(dailyAverage * 30),
    yearly: Math.round(dailyAverage * 365),
  };
}

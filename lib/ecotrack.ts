/**
 * Supported carbon-generating or eco-friendly activity types in the EcoTrack AI platform.
 */
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

/**
 * Represents a single logged activity by the user.
 */
export type ActivityLog = {
  /** Unique identifier for the log entry */
  id: string;
  /** Type of the logged activity */
  type: ActivityType;
  /** Raw quantity logged (e.g. kilometers, kWh, items) */
  amount: number;
  /** Total calculated carbon impact in kilograms of CO2 equivalent */
  co2: number;
  /** ISO date string of when the activity took place */
  date: string;
  /** Points awarded or deducted for the activity */
  pointsEarned: number;
};

/**
 * Emission factors metadata including GHG emission constants, points multipliers, and category types.
 */
export const EMISSION_FACTORS: Record<
  ActivityType,
  { 
    /** CO2 emission factor per unit (in kg CO2 / unit) */
    factor: number; 
    /** Measurement unit (e.g. km, kWh, kg, items) */
    unit: string; 
    /** Human-readable display label */
    label: string; 
    /** Multiplier to calculate Eco Points awarded per unit */
    pointsMultiplier: number; 
    /** Parent category for dashboard filtering */
    category: string; 
  }
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

/**
 * Represents a gamified eco-challenge for the user.
 */
export type Challenge = {
  /** Unique challenge identifier */
  id: string;
  /** Short descriptive title */
  title: string;
  /** Eco Points awarded upon completion */
  points: number;
  /** In-depth description of the goal */
  description: string;
  /** Completion status flag */
  completed: boolean;
};

/**
 * Initial set of challenges available to new users.
 */
export const INITIAL_CHALLENGES: Challenge[] = [
  { id: '1', title: 'Meat-Free Monday', points: 50, description: 'Enjoy purely plant-based meals for an entire day.', completed: false },
  { id: '2', title: 'No Plastic Day', points: 30, description: 'Refuse all single-use plastics today.', completed: false },
  { id: '3', title: 'Walk 5 km', points: 100, description: 'Walk or bike for your commute instead of driving.', completed: false },
  { id: '4', title: 'Energy Saver', points: 40, description: 'Unplug devices when not in use to save phantom energy.', completed: false },
  { id: '5', title: 'Zero Waste Weekend', points: 120, description: 'Separate and recycle all trash over the weekend.', completed: false },
  { id: '6', title: 'Car-Free Friday', points: 80, description: 'Use public transport, walk, or cycle to work.', completed: false },
];

/**
 * Represents a carbon offset program.
 */
export type OffsetProgram = {
  /** Unique program identifier */
  id: string;
  /** Descriptive title */
  title: string;
  /** Cost in Eco Points required to fund */
  costPoints: number;
  /** Weight of carbon offset in kilograms of CO2 */
  co2Offset: number;
  /** Explanation of the program's environmental impact */
  description: string;
  /** Icon/emoji representation */
  image: string;
};

/**
 * Available carbon offset initiatives for point redemptions.
 */
export const OFFSET_PROGRAMS: OffsetProgram[] = [
  {
    id: 'tree_plantation',
    title: 'Plant a Native Tree',
    costPoints: 150,
    co2Offset: 10,
    description: 'Support local reforestation efforts to restore habitats and absorb carbon.',
    image: '🌳',
  },
  {
    id: 'solar_energy',
    title: 'Rural Solar Initiative',
    costPoints: 250,
    co2Offset: 25,
    description: 'Fund solar panels for off-grid schools and medical clinics.',
    image: '☀️',
  },
  {
    id: 'cleanup_drive',
    title: 'Ocean Cleanup Drive',
    costPoints: 100,
    co2Offset: 5,
    description: 'Finance volunteer teams removing plastic and trash from coastal regions.',
    image: '🌊',
  },
];

/**
 * Represents an achievement badge.
 */
export type Badge = {
  /** Unique badge identifier */
  id: string;
  /** Display title */
  title: string;
  /** Unlocking condition explanation */
  description: string;
  /** Emoji representation */
  icon: string;
  /** Unlocked achievement state flag */
  unlocked: boolean;
};

/**
 * Initial achievements array structure.
 */
export const INITIAL_BADGES: Badge[] = [
  { id: 'b1', title: 'Green Commuter', description: 'Log a walking, cycling, or public transport activity', icon: '🚲', unlocked: false },
  { id: 'b2', title: 'Plant Lover', description: 'Eat at least 3 plant-based vegan meals', icon: '🌱', unlocked: false },
  { id: 'b3', title: 'Recycling Master', description: 'Log at least 5 kg of recycled waste', icon: '♻️', unlocked: false },
  { id: 'b4', title: 'Carbon Neutralizer', description: 'Purchase your first carbon offset', icon: '🛡️', unlocked: false },
  { id: 'b5', title: 'Eco Warrior', description: 'Earn a total of 300 Eco Points', icon: '🥇', unlocked: false },
];

/**
 * Represents an entry on the leaderboards.
 */
export type LeaderboardEntry = {
  /** Competitor nickname */
  name: string;
  /** Total Eco Points balance */
  points: number;
  /** Current list ranking */
  rank: number;
  /** Identifier flag if the entry represents the active user */
  isCurrentUser?: boolean;
};

/**
 * Mock leaderboard standings for friendly gamified competition.
 */
export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'Sarah Jenkins', points: 620, rank: 1 },
  { name: 'Aarav Sharma', points: 450, rank: 2 },
  { name: 'Chloe Chen', points: 380, rank: 3 },
  { name: 'You (EcoTracker)', points: 0, rank: 4, isCurrentUser: true },
  { name: 'David Smith', points: 120, rank: 5 },
];

/**
 * Generates a high-entropy, unique ID string for data structures.
 * Leverages global crypto module if available; falls back to high-randomness timestamp generator.
 * @returns {string} Unique identifier
 */
export function generateId(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `eco-${Date.now()}-${Math.floor(Math.random() * 10000000)}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Computes predictive carbon footprints based on logged activities.
 * Calculates average daily carbon outputs and projects them monthly and annually.
 * @param {ActivityLog[]} activities Logged emissions events
 * @returns {{ monthly: number, yearly: number }} Estimated monthly and annual carbon outputs in kg CO2
 */
export function getProjections(activities: ActivityLog[]) {
  if (activities.length === 0) return { monthly: 0, yearly: 0 };
  
  const dates = activities.map(a => new Date(a.date).toDateString());
  const uniqueDays = new Set(dates).size || 1;
  const totalCo2 = activities.reduce((sum, a) => sum + a.co2, 0);
  const dailyAverage = totalCo2 / uniqueDays;

  return {
    monthly: Math.round(dailyAverage * 30),
    yearly: Math.round(dailyAverage * 365),
  };
}

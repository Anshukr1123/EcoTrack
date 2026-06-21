import { EMISSION_FACTORS, getProjections, generateId, ActivityLog } from './lib/ecotrack';

console.log("==========================================");
console.log("      RUNNING ECOTRACK CORE ENGINE TESTS   ");
console.log("==========================================");

try {
  // Test 1: ID Generation Purity & Non-collision
  const ids = new Set<string>();
  for (let i = 0; i < 100; i++) {
    const id = generateId();
    if (!id || id.length < 5) {
      throw new Error(`FAIL: Generated ID "${id}" is invalid!`);
    }
    if (ids.has(id)) {
      throw new Error(`FAIL: ID collision detected for "${id}"!`);
    }
    ids.add(id);
  }
  console.log("✓ Test 1: ID generation verified (100 unique IDs, 0 collisions)");

  // Test 2: Standard carbon emission coefficients & points multipliers
  const checkCoeff = (type: keyof typeof EMISSION_FACTORS, amount: number, expectedCo2: number, expectedPoints: number) => {
    const factorDetails = EMISSION_FACTORS[type];
    const co2 = amount * factorDetails.factor;
    const points = factorDetails.pointsMultiplier !== 0 ? Math.round(amount * factorDetails.pointsMultiplier) : 0;
    
    if (Math.abs(co2 - expectedCo2) > 0.001) {
      throw new Error(`FAIL for ${type}: CO2 expected ${expectedCo2}, got ${co2}`);
    }
    if (points !== expectedPoints) {
      throw new Error(`FAIL for ${type}: Points expected ${expectedPoints}, got ${points}`);
    }
  };

  // Test various samples
  // Car: 50 km * 0.192 = 9.6 kg CO2, 0 pts
  checkCoeff('car', 50, 9.6, 0);
  
  // Bus: 15 km * 0.089 = 1.335 kg CO2, 15 * 2 = 30 pts
  checkCoeff('bus', 15, 1.335, 30);
  
  // Walking: 8 km * 0 = 0 kg CO2, 8 * 10 = 80 pts
  checkCoeff('walking', 8, 0, 80);

  // Electricity: 100 kWh * 0.385 = 38.5 kg CO2, 0 pts
  checkCoeff('electricity', 100, 38.5, 0);

  // Vegan meal: 3 meals * 0.3 = 0.9 kg CO2, 3 * 15 = 45 pts
  checkCoeff('vegan_meal', 3, 0.9, 45);

  // Beef meal: 2 meals * 3.0 = 6.0 kg CO2, 0 pts
  checkCoeff('beef_meal', 2, 6.0, 0);

  // Plastic: 5 items * 0.12 = 0.6 kg CO2, 5 * -5 = -25 pts
  checkCoeff('plastic', 5, 0.6, -25);

  // Recycled waste: 12 kg * 0.05 = 0.6 kg CO2, 12 * 8 = 96 pts
  checkCoeff('waste_recycled', 12, 0.6, 96);

  console.log("✓ Test 2: Standard calculations & points multipliers verified on diverse samples");

  // Test 3: Predictive Analytics Projections
  // Case A: Empty logs
  const projEmpty = getProjections([]);
  if (projEmpty.monthly !== 0 || projEmpty.yearly !== 0) {
    throw new Error(`FAIL: Projections for empty list must be 0! Got monthly: ${projEmpty.monthly}, yearly: ${projEmpty.yearly}`);
  }

  // Case B: Single log on 1 unique day
  const singleDayLogs: ActivityLog[] = [
    { id: 'a1', type: 'car', amount: 10, co2: 1.92, date: new Date().toISOString(), pointsEarned: 0 }
  ];
  const projSingle = getProjections(singleDayLogs);
  // dailyAverage = 1.92 / 1 = 1.92
  // monthly = Math.round(1.92 * 30) = 58
  // yearly = Math.round(1.92 * 365) = 701
  if (projSingle.monthly !== 58 || projSingle.yearly !== 701) {
    throw new Error(`FAIL: Single-day projection failed! Got monthly: ${projSingle.monthly}, yearly: ${projSingle.yearly}`);
  }

  // Case C: Multiple logs on multiple distinct days
  const date1 = new Date();
  const date2 = new Date();
  date2.setDate(date2.getDate() - 2); // 2 days ago
  
  const multiDayLogs: ActivityLog[] = [
    { id: 'b1', type: 'car', amount: 30, co2: 5.76, date: date1.toISOString(), pointsEarned: 0 },
    { id: 'b2', type: 'electricity', amount: 20, co2: 7.7, date: date1.toISOString(), pointsEarned: 0 },
    { id: 'b3', type: 'flight', amount: 200, co2: 30.0, date: date2.toISOString(), pointsEarned: 0 },
  ];
  
  const projMulti = getProjections(multiDayLogs);
  // uniqueDays = 2 (today and 2 days ago)
  // totalCo2 = 5.76 + 7.7 + 30.0 = 43.46
  // dailyAverage = 43.46 / 2 = 21.73
  // monthly = Math.round(21.73 * 30) = 652
  // yearly = Math.round(21.73 * 365) = 7931
  if (projMulti.monthly !== 652 || projMulti.yearly !== 7931) {
    throw new Error(`FAIL: Multi-day projection failed! Got monthly: ${projMulti.monthly}, yearly: ${projMulti.yearly}`);
  }

  console.log("✓ Test 3: Predictive projections verified for multiple timeline structures");

  console.log("==========================================");
  console.log("      ALL UNIT TESTS PASSED SUCCESSFULLY! ");
  console.log("==========================================");
} catch (error: any) {
  console.error("❌ TEST FAILURE:", error.message);
  process.exit(1);
}

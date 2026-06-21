import { EMISSION_FACTORS, getProjections, generateId, ActivityLog } from './lib/ecotrack';

console.log("==========================================");
console.log("      RUNNING ECOTRACK CORE ENGINE TESTS   ");
console.log("==========================================");

try {
  // Test 1: ID Generation Purity & Non-collision
  const id1 = generateId();
  const id2 = generateId();
  if (id1 === id2) {
    throw new Error("FAIL: ID generation returned duplicates!");
  }
  if (!id1 || id1.length < 5) {
    throw new Error("FAIL: Generated ID is invalid or empty!");
  }
  console.log("✓ Test 1: ID generation verified (Pure & Unique)");

  // Test 2: Emission Coefficient Calculations
  // Car travel emission verification: 20 km * 0.192 kg CO2/km = 3.84 kg CO2
  const carFactor = EMISSION_FACTORS.car.factor;
  const carDistance = 20;
  const computedCarCo2 = carDistance * carFactor;
  if (Math.abs(computedCarCo2 - 3.84) > 0.001) {
    throw new Error(`FAIL: Car calculations out of sync! Expected 3.84, got ${computedCarCo2}`);
  }

  // Electricity emission verification: 15 kWh * 0.385 kg CO2/kWh = 5.775 kg CO2
  const elecFactor = EMISSION_FACTORS.electricity.factor;
  const elecAmount = 15;
  const computedElecCo2 = elecAmount * elecFactor;
  if (Math.abs(computedElecCo2 - 5.775) > 0.001) {
    throw new Error(`FAIL: Electricity calculations out of sync! Expected 5.775, got ${computedElecCo2}`);
  }
  console.log("✓ Test 2: Standard carbon emission coefficients verified");

  // Test 3: Predictive Analytics Projections
  // Mocking 2 activities logged on the same calendar day
  const todayStr = new Date().toDateString();
  const mockLogs: ActivityLog[] = [
    { id: '1', type: 'car', amount: 20, co2: 3.84, date: new Date().toISOString(), pointsEarned: 0 },
    { id: '2', type: 'electricity', amount: 15, co2: 5.775, date: new Date().toISOString(), pointsEarned: 0 },
  ];
  
  const projections = getProjections(mockLogs);
  // Total emissions: 3.84 + 5.775 = 9.615 kg CO2 on 1 unique day
  // Expected daily average: 9.615 kg CO2
  // Monthly forecast: 9.615 * 30 = 288.45 -> rounded to 288
  // Yearly forecast: 9.615 * 365 = 3509.475 -> rounded to 3509
  if (projections.monthly !== 288 || projections.yearly !== 3509) {
    throw new Error(`FAIL: Predictive projections failed! Got monthly: ${projections.monthly}, yearly: ${projections.yearly}`);
  }
  console.log("✓ Test 3: Predictive monthly/yearly projections verified");

  console.log("==========================================");
  console.log("      ALL UNIT TESTS PASSED SUCCESSFULLY! ");
  console.log("==========================================");
} catch (error: any) {
  console.error("❌ TEST FAILURE:", error.message);
  process.exit(1);
}

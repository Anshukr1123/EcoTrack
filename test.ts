import { EMISSION_FACTORS, getProjections, generateId, ActivityLog } from './lib/ecotrack';
import { NextRequest } from 'next/server';
import { POST } from './app/api/chat/route';

console.log("==========================================");
console.log("      RUNNING ECOTRACK CORE ENGINE TESTS   ");
console.log("==========================================");

async function runTests() {
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
    checkCoeff('car', 50, 9.6, 0);
    checkCoeff('bus', 15, 1.335, 30);
    checkCoeff('walking', 8, 0, 80);
    checkCoeff('electricity', 100, 38.5, 0);
    checkCoeff('vegan_meal', 3, 0.9, 45);
    checkCoeff('beef_meal', 2, 6.0, 0);
    checkCoeff('plastic', 5, 0.6, -25);
    checkCoeff('waste_recycled', 12, 0.6, 96);

    console.log("✓ Test 2: Standard calculations & points multipliers verified on diverse samples");

    // Test 3: Predictive Analytics Projections
    const projEmpty = getProjections([]);
    if (projEmpty.monthly !== 0 || projEmpty.yearly !== 0) {
      throw new Error(`FAIL: Projections for empty list must be 0! Got monthly: ${projEmpty.monthly}, yearly: ${projEmpty.yearly}`);
    }

    const singleDayLogs: ActivityLog[] = [
      { id: 'a1', type: 'car', amount: 10, co2: 1.92, date: new Date().toISOString(), pointsEarned: 0 }
    ];
    const projSingle = getProjections(singleDayLogs);
    if (projSingle.monthly !== 58 || projSingle.yearly !== 701) {
      throw new Error(`FAIL: Single-day projection failed! Got monthly: ${projSingle.monthly}, yearly: ${projSingle.yearly}`);
    }

    const date1 = new Date();
    const date2 = new Date();
    date2.setDate(date2.getDate() - 2);
    
    const multiDayLogs: ActivityLog[] = [
      { id: 'b1', type: 'car', amount: 30, co2: 5.76, date: date1.toISOString(), pointsEarned: 0 },
      { id: 'b2', type: 'electricity', amount: 20, co2: 7.7, date: date1.toISOString(), pointsEarned: 0 },
      { id: 'b3', type: 'flight', amount: 200, co2: 30.0, date: date2.toISOString(), pointsEarned: 0 },
    ];
    
    const projMulti = getProjections(multiDayLogs);
    if (projMulti.monthly !== 652 || projMulti.yearly !== 7931) {
      throw new Error(`FAIL: Multi-day projection failed! Got monthly: ${projMulti.monthly}, yearly: ${projMulti.yearly}`);
    }

    console.log("✓ Test 3: Predictive projections verified for multiple timeline structures");

    // Test 4: API Request Handling & Validations
    // Case A: Missing prompt -> expect 400 status
    const reqEmpty = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const resEmpty = await POST(reqEmpty);
    if (resEmpty.status !== 400) {
      throw new Error(`FAIL: Missing prompt expected status 400, got ${resEmpty.status}`);
    }
    const jsonEmpty = await resEmpty.json();
    if (jsonEmpty.activity !== null || !jsonEmpty.text.includes("valid message")) {
      throw new Error(`FAIL: Missing prompt response text is invalid: ${jsonEmpty.text}`);
    }

    // Case B: Valid structure -> expect 200 status (and either mock response or connection fallback)
    const reqValid = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'I walked 10 km' }),
    });
    const resValid = await POST(reqValid);
    if (resValid.status !== 200) {
      throw new Error(`FAIL: Valid prompt expected status 200, got ${resValid.status}`);
    }
    const jsonValid = await resValid.json();
    if (!jsonValid.text) {
      throw new Error(`FAIL: Valid prompt response lacks text property`);
    }
    console.log("✓ Test 4: API route input validations & error boundaries verified");

    console.log("==========================================");
    console.log("      ALL UNIT & API TESTS PASSED!        ");
    console.log("==========================================");
  } catch (error: any) {
    console.error("❌ TEST FAILURE:", error.message);
    process.exit(1);
  }
}

runTests();

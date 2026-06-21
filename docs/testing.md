# Testing Strategy & Runner Guide

We verify both core engine calculation routines and API boundary request handling using automated tests.

---

## 1. Testing Setup

Tests are written in **`test.ts`** at the project root. We use **`tsx`** (TypeScript Execute) to run files directly in the Node.js runtime without requiring a separate build step.

### Running Tests Locally

Run the test suite using the custom npm script:
```bash
npm test
```

## 2. Test Coverage

The test runner evaluates the following categories:

### Test 1: ID Generation Purity
* Runs 100 rapid sequential calls to `generateId()` and asserts zero duplicates.
* Verifies that returned IDs are non-empty strings and conform to minimum length restrictions.

### Test 2: Standard Emission Coefficients
* Validates calculation logic for all 14 categories.
* Compares computed values against expected values to ensure no coefficient drift.
* Asserts points calculations (points multipliers) match specifications (including negative values for single-use plastics).

### Test 3: Predictive Analytics
* Validates average daily rate estimations and projections (monthly, yearly) on:
  * Empty activity lists (must return zero forecasts).
  * Single-day logs (ensures correct daily rate multiplication).
  * Multi-day logs (ensures days span counts are evaluated correctly).

### Test 4: API Route Validations
* Directly imports the serverless route handler (`POST` in `app/api/chat/route.ts`).
* Mocks `NextRequest` objects to verify boundary logic:
  * **Invalid request**: Asserts missing prompts return `400 Bad Request` and descriptive errors.
  * **Failsafe check**: Asserts connection timeouts or missing Gemini keys trigger graceful fallbacks without exposing Node.js stack traces.

---

## 3. CI/CD Integration

Tests are executed automatically on every commit push or pull request to the `main` branch via GitHub Actions:
- **Location**: `.github/workflows/test.yml`
- **Steps**:
  1. Checks out branch.
  2. Sets up Node.js environment.
  3. Audits formatting code quality via `npm run lint`.
  4. Runs all unit/API test assertions via `npm test`.
  5. Asserts static page generations build without compilation errors via `npm run build`.

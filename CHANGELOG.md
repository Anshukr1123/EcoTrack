# Changelog

All notable changes to the **EcoTrack AI** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-06-21

### Added
- **AI Carbon Calculator**: Chatbot integration utilizing Google Gemini to convert natural language descriptions of the day (e.g. "I drove 15 km today") into structured logging options.
- **Dynamic Dashboard Charts**: Added Recharts visualization showing Weekly Bar Charts and Category Pie Charts of user carbon emissions.
- **Eco Points Rewards**: Gamified points awarded for green habits (walking, biking, plant-based meals) and deductions for plastic item waste.
- **Carbon Offsets Panel**: Spend Eco Points to fund tree plantation, rural solar panels, and ocean cleanup to deduct emissions from net carbon footprint.
- **Leaderboard Tiers**: Gamified Friends, College, and City comparative leaderboards.
- **Certificates**: Automatically render and download custom SVGs when the user accumulates 500+ points.
- **Unit & API Testing**: Automated test suite (`test.ts`) verifying coefficients, generation purity, projections, and chat API route validations.
- **CI Pipeline**: GitHub Actions workflow (`test.yml`) running lint audits, unit tests, and production builds.

### Changed
- **Modular Component Split**: Split the long `dashboard.tsx` file into four smaller panels (`leaderboard-panel.tsx`, `challenges-panel.tsx`, `offsets-panel.tsx`, `badges-panel.tsx`) for code cleanliness.
- **Accessibility Enhancements**: Added explicit label-input links (`htmlFor`/`id`) and icon-only button `aria-labels` to support screen readers and keyboard navigation.

### Fixed
- **OOM Crash on Startup**: Increased Cloud Run memory allocation to 1GiB to resolve cold-start out-of-memory container crashes.
- **Typescript Config Error**: Converted `next.config.ts` to `next.config.mjs` to avoid runtime tsx dependency requirements in lightweight production containers.
- **Purity Warnings**: Resolved React linter warnings by separating pure ID generation and timer-wrapping local storage loading.

# EcoTrack AI – Personal Carbon Footprint Awareness Platform

**EcoTrack AI** is an AI-powered, gamified, and responsive sustainability platform built with Next.js, TypeScript, and Tailwind CSS. It enables individuals to track daily carbon emissions, receive personalized sustainability tips, complete green challenges, earn Eco Points, and offset their carbon footprint.

---

## 1. Chosen Vertical & Persona

- **Theme**: Carbon Footprint Tracking & Gamified Climate Awareness
- **Persona**: An interactive, encouraging personal "Eco-Coach" that lowers the entry barrier to tracking by allowing natural language inputs (powered by Gemini), providing real-time data visualization, and rewarding positive climate action with "Eco Points".

---

## 2. Approach & Implementation Logic

Rather than relying on continuous external API connections for basic logging, EcoTrack AI adopts a **hybrid edge model** where calculations are performed instantly client-side using verified greenhouse gas conversion factors.

### A. Carbon Engine (`lib/ecotrack.ts`)
Calculations utilize verified greenhouse gas coefficients (expressed in kilograms of $CO_2$ per unit metric):
- **Transportation**:
  - Personal Gas Car: `0.192 kg CO₂ / km`
  - Public Bus/Train: `0.089 kg CO₂ / km`
  - Flights: `0.150 kg CO₂ / km`
  - Walking/Cycling: `0.000 kg CO₂ / km` (Earns `10 pts / km`)
- **Home Utilities**:
  - Grid Electricity: `0.385 kg CO₂ / kWh`
  - LPG Cylinder Fuel: `2.983 kg CO₂ / kg`
  - Municipal Water: `0.0003 kg CO₂ / liter`
- **Dietary Footprints**:
  - Heavy Beef/Pork Meal: `3.00 kg CO₂`
  - Plant-Based Vegan Meal: `0.30 kg CO₂` (Earns `15 pts / meal`)
- **Waste & Consumables**:
  - Landfill Trash: `0.50 kg CO₂ / kg`
  - Recycled Waste: `0.05 kg CO₂ / kg` (Earns `8 pts / kg`)
  - Single-Use Plastic: `0.12 kg CO₂ / item` (Deducts `-5 pts / item`)
- **Purchases**:
  - Clothing/Apparel: `6.0 kg CO₂ / item`
  - Personal Electronics: `45.0 kg CO₂ / item`

### B. Natural Language Processor (`app/api/chat/route.ts`)
Uses Google Gemini (`gemini-2.5-flash`) with structured JSON mode. When the user writes a description of their day (e.g. *"I cycled 15 km"*), Gemini translates the text into a structured JSON activity representation which the UI intercepts to log in one click.

### C. Gamified Offsets & Challenges (`components/dashboard.tsx`)
- **Challenges**: Completed tasks automatically grant Eco Points and save carbon.
- **Offsets**: Users redeem accumulated Eco Points for localized, verified offset actions like *Tree Planting* or *Rural Solar Arrays*, which record negative emissions on their dashboard.

---

## 3. How the Solution Works

1. **Activity Logging**: Users can log activities manually via categorized tabs or simply type natural sentences into the AI Coach chatbot.
2. **Visual Dashboard**: Shows Net Footprint, funded offsets, and monthly/annual projections. Recharts renders interactive Bar and Pie charts for emissions.
3. **Rewards & Achievements**: Check status of custom badges like *Green Commuter* or *Carbon Neutralizer*. Reach **500 Eco Points** to unlock a downloadable PDF/SVG Achievement Certificate.
4. **Leaderboard**: Compete with mock players across Friends, College, or City networks.

---

## 4. Key Assumptions

- **Averages**: Diet and shopping metrics utilize average consumption emissions weights based on general IPCC values.
- **Timeframes**: Calculations assume modern municipal and grid energy outputs.
- **Offsets**: Point offset valuations represent standard carbon-market program offsets.

---

## 5. Prerequisites & Local Launch

### Prerequisites
- **Node.js 18+**
- **npm** or **yarn**

### Installation
Clone this repository, move into the directory, and install dependencies:
```bash
npm install
```

### Running the Application
Run the local development server:
```bash
npm run dev
```
Open **http://localhost:3000** (or the port output by the console) in your browser.

### Running Audits
Verify styling and compilation correctness:
```bash
npm run lint
npm run build
```
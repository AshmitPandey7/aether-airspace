# AETHER — Airspace Intelligence & Surveillance
### *Every aircraft. One live picture.*

**CodeChef-VIT Promotional Cycle 2026–27 | Frontend Development Task: Air Traffic Control**  
**Submission Codename:** `AETHER`  
**Live Development Target:** `http://localhost:5173`

---

## 1. Executive Summary & Overview

**AETHER** is a real-time, aerospace-grade air traffic surveillance and situational intelligence dashboard built for air traffic controllers, airspace analysts, and aviation enthusiasts. Powered by live ADS-B state vectors from the **OpenSky Network REST API**, AETHER brings together high-frequency geospatial tracking, deterministic safety boundary alert rules, dead reckoning position extrapolation, flight trail reconstruction, and comprehensive telemetry analysis in a single, map-first tactical console.

Designed around a dark navy aesthetic (`#080D16`), AETHER blends the functional clarity of actual military/civilian Air Traffic Control (ATC) radar consoles with the responsive fluidity of modern developer platforms.

---

## 2. Key Features

### A. Live Interactive Airspace Radar Map
- **Geographic Projection & Dark Basemap:** Integrated Leaflet engine with high-contrast CartoDB Dark Matter tiles, preserving true coordinate geometry across global Flight Information Regions (FIRs).
- **Heading-Oriented Custom SVG Aircraft Markers:** Dynamic aircraft icons rotated to true track angles ($0^\circ - 360^\circ$ clockwise from True North) with visual cues for airborne, ground, and stale statuses.
- **Dynamic Selection Reticle & Target Lock:** Electric cyan HUD targeting reticle with continuous radar sweep rings, flight trail polyline overlay, and instant coordinate telemetry.
- **Sector Query Bounding Box:** Visual dashed bounding-box polygon overlay depicting the precise latitude/longitude boundaries currently being queried from OpenSky.
- **Tactical Map Controls:** One-click sector re-center, zoom controls, range rings toggle, sector boundary toggle, and live cursor coordinate readout.

### B. Selected Aircraft Telemetry Inspector
- **Exhaustive OpenSky State Vector Fields:**
  - Callsign & ICAO24 24-bit transponder hexadecimal address
  - Origin country / registration state
  - Barometric altitude & geometric altitude (with dual meters, feet, and standard ICAO Flight Level readouts, e.g. `FL360`)
  - Ground speed (in dual km/h, knots, and m/s)
  - True track / heading with 16-point cardinal compass direction
  - Vertical rate (visual climb, descent, or level indicators)
  - On-ground transponder flag & Special Purpose Indicator (SPI) pulse
  - Transponder Squawk code (e.g. `7700`, `7600`, `7500`, or standard civil squawks)
  - Observation age and real-time freshness classification
- **Operational Actions:** Quick-copy ICAO address, copy latitude/longitude, center map on target, and launch historical flight replay.

### C. Surveillance Manifest & Multifaceted Filters
- **Real-Time Sector Manifest:** Dense, high-contrast tabular list of all active aircraft in the sector with real-time altitude, speed, heading, and status indicators.
- **Bi-Directional Synchronization:** Clicking an aircraft in the list focuses and selects it on the map; selecting a map marker automatically highlights the corresponding entry in the list.
- **Attribute Filters:**
  - Callsign or ICAO24 string search (with instant debounce)
  - Airborne vs. Ground status toggles
  - Data freshness filter (Fresh $<30$s, Aging $<75$s, Stale $>75$s, or All)
  - Bounding box coordinator editor for custom flight corridors.

### D. Dead Reckoning Intermediate Position Estimation (Bonus Target)
- Estimates aircraft positions between polling intervals using geodesic spherical trigonometry based on reported ground speed, true heading, and elapsed time ($\Delta t$).
- Bounded extrapolation: capped at 60 seconds and only active for airborne aircraft ($v \ge 15\text{ m/s}$) to guarantee spatial integrity without runaway errors.
- Visual badge indicating when an aircraft position is derived from dead reckoning.

### E. Flight History & Replay Controller (Bonus Target)
- Bounded circular buffer storing up to 40 chronological position samples per tracked aircraft.
- Full interactive replay controller featuring an interactive scrub bar, play/pause controls, single-step forward/backward stepping, and variable speed multipliers ($1\times, 2\times, 5\times$).

### F. Airspace Safety Rules & Alert Engine (Bonus Target)
- **Configurable Thresholds:**
  - High Altitude Ceiling (e.g., alert when exceeding $11,500\text{ m}$)
  - Low Altitude Warning for airborne craft ($< 1,200\text{ m}$)
  - High Ground Speed Limit ($> 250\text{ m/s}$ / $900\text{ km/h}$)
  - Stale Telemetry Signal ($> 90\text{ s}$ without ADS-B update)
- **Intelligent Deduplication & Cooldown:** Uses a 60-second cooldown per aircraft/rule combination to eliminate notification flood during periodic polling cycles.

### G. System Diagnostics & Audit Trail
- Live OpenSky API Round-Trip Time (RTT) latency counter in milliseconds.
- Total request metrics, error logs with HTTP status codes, and HTTP 429 rate limit counters.
- Comprehensive audit event timeline capturing sector ingress, egress, connection status, and alert activations.

### H. Multi-Tiered Data Modes & Offline Simulation
- **LIVE:** Real-time data pulled from OpenSky REST API.
- **DELAYED:** Cached fallback snapshot retained if a transient network error or rate limit occurs.
- **OFFLINE:** Clean UI state indicating lack of network access without application crash.
- **DEMO:** Bundled, realistic commercial airliner dataset (Air India, IndiGo, SpiceJet, Emirates, Vistara, etc.) with simulated forward dead-reckoning movement, enabling complete, offline presentations anywhere.

---

## 3. Technology Stack & Justification

| Technology | Role | Justification |
| :--- | :--- | :--- |
| **React 19** | UI Framework | Component-based view rendering with concurrent reactivity. |
| **TypeScript 5.8** | Type System | Strict typing for the 17-tuple OpenSky state vector array and domain models; eliminates undefined property crashes. |
| **Vite 6** | Build System | Instant Hot Module Replacement (HMR) and optimized rollup production bundles. |
| **Tailwind CSS v4** | Design System | High-performance atomic CSS engine with bespoke aerospace variables (`--bg-base`, `--cyan-accent`, `--border-subtle`). |
| **Leaflet 1.9** | Geospatial Engine | Direct imperative map control without heavy peer-dependency bloat; reliable custom SVG markers with zero React re-render lag. |
| **Zustand 5** | State Management | Decentralized, lightweight store decoupling API polling, history buffers, and UI state without rerender cascades. |
| **Anime.js v4** | Interaction Motion | Fluid entry transitions and tactile feedback respecting user `prefers-reduced-motion` settings. |
| **Lucide React** | Iconography | Crisp, consistent aerospace and telemetry icons. |

---

## 4. OpenSky Network API Integration

### Endpoint Specification
```http
GET https://opensky-network.org/api/states/all?lamin={lamin}&lamax={lamax}&lomin={lomin}&lomax={lomax}
```

### State-Vector Field Mapping Table
The OpenSky API returns an array of state vectors where each vector is a 17-element array:

| Index | Field | Type | Domain Property | Description |
| :---: | :--- | :--- | :--- | :--- |
| `0` | `icao24` | string | `icao24` | Unique 24-bit ICAO transponder address (hex) |
| `1` | `callsign` | string \| null | `callsign` | Radiotelephony callsign (trimmed, fallback to ICAO) |
| `2` | `origin_country` | string | `originCountry` | Country inferred from ICAO address allocation |
| `3` | `time_position` | number \| null | `lastPositionTime` | Unix timestamp (seconds) of last position fix |
| `4` | `last_contact` | number | `lastContact` | Unix timestamp (seconds) of last transponder signal |
| `5` | `longitude` | number \| null | `lon` | WGS-84 longitude in decimal degrees |
| `6` | `latitude` | number \| null | `lat` | WGS-84 latitude in decimal degrees |
| `7` | `baro_altitude` | number \| null | `baroAltitude` | Barometric altitude in metres |
| `8` | `on_ground` | boolean | `onGround` | Flag indicating aircraft is on airport surface |
| `9` | `velocity` | number \| null | `velocity` | Ground speed in metres/second |
| `10` | `true_track` | number \| null | `heading` | True track clockwise from North ($0^\circ-360^\circ$) |
| `11` | `vertical_rate` | number \| null | `verticalRate` | Climb/descent rate in metres/second |
| `12` | `sensors` | number[] \| null | `sensors` | Sensor IDs contributing to observation |
| `13` | `geo_altitude` | number \| null | `geoAltitude` | Geometric altitude in metres |
| `14` | `squawk` | string \| null | `squawk` | 4-digit transponder squawk code |
| `15` | `spi` | boolean | `spi` | Special Purpose Indicator (Ident) pulse |
| `16` | `position_source`| number | `positionSource` | 0=ADS-B, 1=ASTERIX, 2=MLAT, 3=FLARM |

### Polling & Rate-Limit Strategy
1. **Conservative Default Polling Interval:** Set to 10 seconds (configurable to 5s, 10s, 15s, or 30s), respecting OpenSky's anonymous client guidelines.
2. **HTTP 429 Handling:** When a `429 Too Many Requests` is encountered, the service reads the `Retry-After` header (or defaults to a 30s backoff) and switches the UI mode to `DELAYED` without dropping active aircraft.
3. **Request Abortion:** Every new fetch triggers an `AbortController.abort()` on any in-flight request to eliminate race conditions when rapidly changing sectors.
4. **Out-of-Order Rejection:** An incrementing request ID verifies that older delayed responses cannot overwrite newer state snapshots.

---

## 5. Architectural Directory Layout

```
CodeChef/
├── public/
│   └── favicon.svg              # Custom AETHER radar vector favicon
├── src/
│   ├── components/
│   │   ├── aircraft/
│   │   │   ├── AircraftInspector.tsx   # Detailed telemetry drawer & actions
│   │   │   └── AircraftList.tsx        # Synchronized manifest list
│   │   ├── alerts/
│   │   │   └── AlertsPanel.tsx         # Safety rules & alert audit view
│   │   ├── diagnostics/
│   │   │   └── DiagnosticsPanel.tsx    # RTT latency, request counters, error logs
│   │   ├── filters/
│   │   │   └── FilterPanel.tsx         # Search, flight status & freshness filters
│   │   ├── history/
│   │   │   └── ReplayController.tsx    # Scrub bar, step controls, variable speeds
│   │   ├── layout/
│   │   │   ├── Header.tsx              # Brand, sector picker, live status, settings
│   │   │   └── LeftPanel.tsx           # Sector metrics, bbox editor, list
│   │   └── map/
│   │       └── AirspaceMap.tsx         # Leaflet container, custom SVG markers
│   ├── constants/
│   │   └── regions.ts           # FIR definitions (India, Europe, US, East Asia, Gulf)
│   ├── services/
│   │   ├── demoData.ts          # Bundled realistic fallback & offline simulation
│   │   └── opensky.ts           # OpenSky REST API client with abort & caching
│   ├── store/
│   │   └── useAirspaceStore.ts  # Zustand store: lifecycle, trails, alerts, timers
│   ├── types/
│   │   └── index.ts             # Domain & OpenSky TypeScript contracts
│   ├── utils/
│   │   ├── deadReckoning.ts     # Geodesic intermediate position estimation
│   │   ├── formatters.ts        # Telemetry conversion (m, ft, FL, knots, km/h)
│   │   └── motion.ts            # Anime.js animations with reduced motion guards
│   ├── App.tsx                  # Root layout & keyboard shortcut handling
│   ├── index.css                # Tailwind v4 theme & Leaflet dark overrides
│   └── main.tsx                 # React DOM mount point
├── DECISIONS.md                 # Official recruitment architectural responses
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 6. Installation & Local Setup

### Prerequisites
- Node.js `v18.0.0` or newer (Tested on Node `v24.13.0`)
- npm `v9.0.0` or newer

### Setup Steps
```bash
# 1. Clone repository & enter workspace
git clone <repo-url>
cd CodeChef

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173
```

### Production Build & Linting Verification
```bash
# Production bundle compilation
npm run build

# Static analysis & lint validation
npm run lint
```

---

## 7. Recommended Demonstration Script

For recruitment evaluators reviewing this submission:

1. **Sector Ingress & Radar Sweep:**
   - On load, observe the **Indian Subcontinent** sector load live flights across Mumbai, Delhi, and Bengaluru FIRs.
   - Note the electric cyan **LIVE ADSB** badge with pulsating indicator.
2. **Target Inspection:**
   - Click any aircraft marker on the map (or row in the left manifest).
   - The camera pans smoothly to target, rendering the **Aircraft Inspector** on the right with dual altitude (`m` / `FL`), ground speed (`km/h` / `kts`), heading compass, and transponder squawk.
3. **Flight Movement Trail:**
   - Observe the dashed cyan flight trail polyline connecting previous position fixes.
4. **Custom Sector Filtering:**
   - Type `IGO` or `AIC` in the search box to isolate IndiGo or Air India fleets.
   - Toggle **AIRBORNE** vs. **GROUND** to observe dynamic marker filtering.
5. **Sector Alerts Engine:**
   - Click **Sector Alerts** in the top navigation.
   - Inspect active alerts triggered for high speeds or ceiling deviations. Adjust a threshold slider to test real-time re-evaluation.
6. **Replay Controller:**
   - Click **Flight History & Replay** in navigation (or **REPLAY** in the inspector).
   - Use the scrub slider and $2\times / 5\times$ play buttons to step through historical observations.
7. **Offline Simulation / Demo Mode:**
   - Click the **Settings** gear icon in the top header.
   - Switch data mode to **DEMO SIM**. Notice the live simulated progressive movement, ensuring complete functionality regardless of external network conditions.
8. **System Diagnostics:**
   - Navigate to **Diagnostics** to view live latency RTT, error logs, and the chronological sector event audit timeline.

---

## 8. Author & Submission Information

- **Candidate:** Ashmit
- **Organization:** CodeChef-VIT Chapter
- **Cycle:** Promotional Cycle 2026–27
- **Domain:** Technical Challenges — Frontend Development (Air Traffic Control)
- **Status:** Complete, Tested, Runnable Submission

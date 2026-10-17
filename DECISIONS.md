# Engineering Decisions & Architecture Log
**Candidate:** Ashmit  
**Task:** Air Traffic Control | CodeChef-VIT Promotional Cycle 2026–27  
**Project:** AETHER — Real-Time Global Airspace Intelligence  

---

### 01. What was the most technically challenging part of your implementation, and how did you approach it?

The most demanding technical challenge was **managing high-frequency state synchronization across the geospatial Leaflet map, tabular DOM manifest, and historical flight trails without inducing React re-render cascades or marker thrashing.**

In a typical naive React implementation of a live map (such as wrapping Leaflet in `react-leaflet`), every polling tick updates dozens of aircraft positions simultaneously. If markers are rendered as standard React component trees, React tears down and reconstructs DOM nodes on every tick, causing marker flickering, loss of CSS rotation transitions, and severe CPU spikes.

**How I approached it:**
1. **Decoupled Imperative Marker Pool:** Instead of declarative React component markers, I established an imperative `Map<string, L.Marker>` managed inside a `useRef`. On every state update, the store passes the normalized array of aircraft. The effect iterates through incoming aircraft:
   - If a marker for that `icao24` already exists, it calls `marker.setLatLng([ac.lat, ac.lon])` and updates its rotated SVG icon via `marker.setIcon()`, preserving DOM identity and allowing smooth CSS rotation transitions.
   - If it is newly observed, it instantiates an `L.Marker` and adds it to the feature group.
   - Stale markers no longer present in the sector are pruned cleanly without touching the rest of the map.
2. **Atomic State Granularity via Zustand:** By structuring the store so that UI components subscribe only to their specific slices (e.g. `selectedIcao24`, `filters`, or `diagnostics`), map interactions and clicks do not cause the entire application shell or header to re-render.
3. **Dead Reckoning Stability:** Extrapolating positions between polling updates required spherical trigonometry (geodesic forward projection). I introduced strict safety bounds: dead reckoning only runs on airborne aircraft ($v \ge 15\text{ m/s}$), never extrapolates beyond 60 seconds, and never overrides raw reported positions in the persistent historical trail buffer.

---

### 02. Describe one important design decision you made, and why did you choose that approach over alternatives?

**Design Decision: Using direct Leaflet with custom rotated SVG `divIcon` elements and CartoDB Dark Matter basemaps instead of Mapbox GL / MapLibre or standard `react-leaflet`.**

**Alternatives Considered:**
- *Alternative A: Mapbox GL JS / MapLibre GL:* Offers GPU-accelerated vector tiles and smooth 3D globe transitions, but introduces heavy bundle size ($>800\text{ KB}$), requires external API access tokens that can fail or get rate-limited during recruitment evaluations, and has a complex canvas layer abstraction for custom clickable HTML/SVG markers.
- *Alternative B: `react-leaflet` component wrappers:* Causes peer-dependency conflicts with modern React 19, suffers from re-render lifecycle synchronization issues, and restricts fine-grained imperative control over `L.Polyline` and custom marker rotation.

**Why direct Leaflet was chosen:**
Direct Leaflet gave us total architectural control over the map lifecycle without third-party API key dependencies or React 19 incompatibilities. By using custom-designed SVG `L.divIcon` markers with hardware-accelerated CSS `transform: rotate(...)`, aircraft headings smoothly orient in real-time. CartoDB's Dark Matter tiles provided the exact high-contrast, military-aerospace HUD look required for AETHER with zero authentication keys required.

---

### 03. What is one limitation or failure case your current implementation does not handle well?

**Limitation: Global Anonymous OpenSky API Rate-Limiting and IP-level Quotas.**

Because OpenSky Network is a shared public research service, anonymous requests from university dorms, shared Wi-Fi networks, or NAT IP addresses frequently return `HTTP 429 Too Many Requests` or delayed `504 Gateway Timeout` responses when multiple students query the endpoint concurrently.

While AETHER handles this gracefully by switching to `DELAYED` mode, applying exponential backoff, retaining previous cache observations, and offering a 1-click **DEMO SIM** mode with realistic simulated flights, a pure client-side browser application cannot bypass OpenSky's upstream IP throttling. 

Furthermore, when an aircraft flies behind terrain or enters oceanic airspace outside ADS-B ground receiver coverage, OpenSky stops reporting position fixes while retaining transponder pings (resulting in `null` latitude/longitude). While AETHER renders this state cleanly as "Position Unavailable / Stale", dead reckoning cannot extrapolate without a known starting coordinate.

---

### 04. If you had another week to work on the project, what would you improve first and why?

With an additional week, I would prioritize the following architectural enhancements:

1. **Lightweight Edge Proxy with Redis Spatial Caching:**
   - Implement a lightweight Go or Node.js edge proxy that maintains a single authenticated connection to OpenSky's Impala/API backend, aggregating queries across users and streaming diffs to clients via **WebSockets / Server-Sent Events (SSE)** rather than client-driven HTTP polling.
2. **WebGL / Canvas Marker Rendering Layer for 10,000+ Aircraft:**
   - While Leaflet's DOM-based `divIcon` markers easily handle 200–500 aircraft in regional FIRs, monitoring the entire continental US or Western Europe involves $>4,000$ simultaneous targets. Moving marker rendering to a Leaflet Canvas layer or Deck.gl would allow fluid 60 FPS rendering of tens of thousands of global flights without DOM strain.
3. **Flight Plan & Route Prediction Integration:**
   - Integrate IATA/ICAO airport databases (e.g. BOM, DEL, BLR, LHR, JFK) and Great Circle route lines connecting origin and destination airports, displaying expected arrival times (ETA) and flight path deviations.
4. **Custom Polygon Geofencing Editor:**
   - Allow users to interactively draw arbitrary polygonal military/restricted airspace zones on the map and trigger visual and audible warning alarms whenever an aircraft's trajectory intersects the polygon.

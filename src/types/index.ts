/**
 * OpenSky Network API raw state vector format
 * Ref: https://openskynetwork.github.io/opensky-api/rest.html
 */
export type OpenSkyRawState = [
  string,          // 0: icao24
  string | null,   // 1: callsign
  string,          // 2: origin_country
  number | null,   // 3: time_position (unix timestamp in seconds)
  number,          // 4: last_contact (unix timestamp in seconds)
  number | null,   // 5: longitude
  number | null,   // 6: latitude
  number | null,   // 7: baro_altitude (metres)
  boolean,         // 8: on_ground
  number | null,   // 9: velocity (m/s)
  number | null,   // 10: true_track (degrees clockwise from north)
  number | null,   // 11: vertical_rate (m/s)
  number[] | null, // 12: sensors (array of IDs)
  number | null,   // 13: geo_altitude (metres)
  string | null,   // 14: squawk
  boolean,         // 15: spi
  number           // 16: position_source (0=ADS-B, 1=ASTERIX, 2=MLAT, 3=FLARM)
];

export interface OpenSkyResponse {
  time: number;
  states: OpenSkyRawState[] | null;
}

export type FreshnessCategory = 'fresh' | 'aging' | 'stale' | 'unknown';

export type PositionSource = 'ADS-B' | 'ASTERIX' | 'MLAT' | 'FLARM' | 'UNKNOWN';

export type DataMode = 'LIVE' | 'DELAYED' | 'OFFLINE' | 'DEMO';

export type NavSection = 'airspace' | 'history' | 'alerts' | 'diagnostics';

/**
 * Clean, strongly-typed domain model for tracked aircraft
 */
export interface Aircraft {
  icao24: string;
  callsign: string;
  originCountry: string;
  lat: number;
  lon: number;
  baroAltitude: number | null; // metres
  geoAltitude: number | null;  // metres
  velocity: number | null;      // m/s
  velocityKmh: number | null;   // km/h
  velocityKnots: number | null; // knots
  heading: number | null;       // degrees 0..360
  verticalRate: number | null;  // m/s
  onGround: boolean;
  squawk: string | null;
  positionSource: PositionSource;
  spi: boolean;
  lastContact: number;          // unix timestamp (seconds)
  lastPositionTime: number | null; // unix timestamp (seconds)
  observationAgeSec: number;
  freshness: FreshnessCategory;
  isEstimated?: boolean;        // true if position was extrapolated via dead reckoning
  firstSeenAt: number;          // local ms
  lastSeenAt: number;           // local ms
}

/**
 * A historical snapshot of an aircraft's position and telemetry
 */
export interface PositionSample {
  lat: number;
  lon: number;
  altitude: number | null;
  velocity: number | null;
  heading: number | null;
  timestamp: number; // unix timestamp in seconds
  isEstimated?: boolean;
}

export interface Region {
  id: string;
  name: string;
  lamin: number;
  lamax: number;
  lomin: number;
  lomax: number;
  center: [number, number];
  zoom: number;
  description: string;
}

export interface FilterState {
  query: string;               // callsign or icao24
  minAltitude: number | null;  // metres
  maxAltitude: number | null;  // metres
  minSpeed: number | null;     // m/s
  maxSpeed: number | null;     // m/s
  onGroundStatus: 'all' | 'airborne' | 'ground';
  freshness: 'all' | 'fresh' | 'aging' | 'stale';
}

export type AlertRuleType = 
  | 'altitude_ceiling' 
  | 'altitude_floor' 
  | 'speed_limit' 
  | 'boundary_entry' 
  | 'stale_tracking';

export interface AlertRule {
  id: string;
  type: AlertRuleType;
  threshold: number;
  enabled: boolean;
  label: string;
  unit: string;
}

export interface AirspaceAlert {
  id: string;
  ruleId: string;
  ruleType: AlertRuleType;
  icao24: string;
  callsign: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number; // local ms
  acknowledged?: boolean;
}

export interface SystemEvent {
  id: string;
  type: 'connection' | 'aircraft_entry' | 'aircraft_exit' | 'alert' | 'error' | 'cache';
  title: string;
  details?: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error' | 'success';
}

export interface SystemDiagnostics {
  lastFetchDurationMs: number;
  lastFetchTime: number | null;
  totalRequests: number;
  failedRequests: number;
  rateLimitedRequests: number;
  currentPollingIntervalSec: number;
  aircraftReceivedCount: number;
  aircraftActiveCount: number;
  aircraftFilteredCount: number;
  cacheHitCount: number;
  errorLog: Array<{
    id: string;
    time: number;
    message: string;
    status?: number;
  }>;
}

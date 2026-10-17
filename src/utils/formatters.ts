import type { FreshnessCategory, PositionSource } from '../types';

/**
 * Convert meters to feet
 */
export function metersToFeet(meters: number | null): number | null {
  if (meters === null || isNaN(meters)) return null;
  return Math.round(meters * 3.28084);
}

/**
 * Convert meters/sec to km/h
 */
export function msToKmh(ms: number | null): number | null {
  if (ms === null || isNaN(ms)) return null;
  return Math.round(ms * 3.6);
}

/**
 * Convert meters/sec to knots
 */
export function msToKnots(ms: number | null): number | null {
  if (ms === null || isNaN(ms)) return null;
  return Math.round(ms * 1.94384);
}

/**
 * Format altitude display with dual units
 */
export function formatAltitude(meters: number | null, unit: 'dual' | 'meters' | 'feet' = 'dual'): string {
  if (meters === null || isNaN(meters)) return 'N/A';
  const feet = Math.round(meters * 3.28084);
  const mStr = `${Math.round(meters).toLocaleString()} m`;
  const ftStr = `${feet.toLocaleString()} ft`;

  if (unit === 'meters') return mStr;
  if (unit === 'feet') return ftStr;

  // Dual readout
  if (feet >= 18000) {
    const fl = Math.round(feet / 100);
    return `${mStr} (FL${fl})`;
  }
  return `${mStr} (${ftStr})`;
}

/**
 * Format velocity display
 */
export function formatVelocity(ms: number | null): string {
  if (ms === null || isNaN(ms)) return 'N/A';
  const kmh = Math.round(ms * 3.6);
  const kts = Math.round(ms * 1.94384);
  return `${kmh} km/h (${kts} kts)`;
}

/**
 * Convert heading degrees into compass direction string
 */
export function getHeadingCompass(heading: number | null): string {
  if (heading === null || isNaN(heading)) return 'N/A';
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((heading % 360) / 22.5)) % 16;
  return `${Math.round(heading)}° ${dirs[index]}`;
}

/**
 * Format coordinates to clean aerospace coordinate string
 */
export function formatCoordinates(lat: number | null, lon: number | null): string {
  if (lat === null || lon === null || isNaN(lat) || isNaN(lon)) return 'N/A';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
}

/**
 * Relative age calculation based on current wall clock
 */
export function calculateObservationAge(lastPositionTime: number | null, fallbackContactTime: number): number {
  const nowSec = Math.floor(Date.now() / 1000);
  const timeRef = lastPositionTime || fallbackContactTime;
  return Math.max(0, nowSec - timeRef);
}

/**
 * Determine freshness category based on age
 */
export function getFreshnessCategory(ageSec: number | null): FreshnessCategory {
  if (ageSec === null || isNaN(ageSec)) return 'unknown';
  if (ageSec < 30) return 'fresh';
  if (ageSec < 75) return 'aging';
  return 'stale';
}

/**
 * Format seconds into human readable short string (e.g. 14s, 2m 10s)
 */
export function formatAgeString(ageSec: number): string {
  if (ageSec < 60) return `${ageSec}s ago`;
  const mins = Math.floor(ageSec / 60);
  const secs = ageSec % 60;
  return `${mins}m ${secs}s ago`;
}

/**
 * Decode position source enum
 */
export function decodePositionSource(src: number): PositionSource {
  switch (src) {
    case 0: return 'ADS-B';
    case 1: return 'ASTERIX';
    case 2: return 'MLAT';
    case 3: return 'FLARM';
    default: return 'UNKNOWN';
  }
}

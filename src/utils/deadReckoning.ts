import type { Aircraft } from '../types';

const EARTH_RADIUS_METERS = 6371000;

/**
 * Dead reckoning calculation: estimates an aircraft's current position based on
 * reported velocity, heading, and elapsed time since last observation.
 * Uses geodesic projection (spherical trigonometry).
 * 
 * Safety bounds:
 * - Does not extrapolate beyond 60 seconds.
 * - Does not extrapolate aircraft on ground or taxiing (< 15 m/s).
 * - Caps maximum distance to prevent unrealistic jumps.
 */
export function estimateIntermediatePosition(
  lat: number,
  lon: number,
  velocityMs: number | null,
  headingDeg: number | null,
  elapsedSec: number
): { lat: number; lon: number; isEstimated: boolean } {
  // If velocity, heading or elapsed time are invalid or out of bounds, return reported coords
  if (
    velocityMs === null ||
    headingDeg === null ||
    velocityMs < 15 || // Taxiing or stationary
    elapsedSec <= 0 ||
    elapsedSec > 60   // Beyond 60s, error cone is too large
  ) {
    return { lat, lon, isEstimated: false };
  }

  // Calculate distance traveled
  const distance = velocityMs * elapsedSec;

  // Maximum realistic distance in 60s (approx 600 m/s * 60s = 36 km)
  if (distance > 36000) {
    return { lat, lon, isEstimated: false };
  }

  const angularDistance = distance / EARTH_RADIUS_METERS;
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  const bearingRad = (headingDeg * Math.PI) / 180;

  const lat2Rad = Math.asin(
    Math.sin(latRad) * Math.cos(angularDistance) +
    Math.cos(latRad) * Math.sin(angularDistance) * Math.cos(bearingRad)
  );

  const lon2Rad = lonRad + Math.atan2(
    Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(latRad),
    Math.cos(angularDistance) - Math.sin(latRad) * Math.sin(lat2Rad)
  );

  let lat2 = (lat2Rad * 180) / Math.PI;
  let lon2 = (lon2Rad * 180) / Math.PI;

  // Normalize longitude to [-180, 180]
  lon2 = ((lon2 + 540) % 360) - 180;

  // Clamp latitude to [-85, 85]
  lat2 = Math.max(-85, Math.min(85, lat2));

  return {
    lat: Number(lat2.toFixed(5)),
    lon: Number(lon2.toFixed(5)),
    isEstimated: true
  };
}

/**
 * Applies dead reckoning to an aircraft object if applicable
 */
export function applyDeadReckoning(aircraft: Aircraft): Aircraft {
  if (aircraft.onGround || !aircraft.lastPositionTime) {
    return aircraft;
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const elapsedSec = nowSec - aircraft.lastPositionTime;

  if (elapsedSec >= 3 && elapsedSec <= 60) {
    const est = estimateIntermediatePosition(
      aircraft.lat,
      aircraft.lon,
      aircraft.velocity,
      aircraft.heading,
      elapsedSec
    );

    if (est.isEstimated) {
      return {
        ...aircraft,
        lat: est.lat,
        lon: est.lon,
        isEstimated: true
      };
    }
  }

  return {
    ...aircraft,
    isEstimated: false
  };
}

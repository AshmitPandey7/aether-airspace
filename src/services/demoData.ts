import type { Aircraft, OpenSkyRawState } from '../types';
import { calculateObservationAge, decodePositionSource, getFreshnessCategory, msToKmh, msToKnots } from '../utils/formatters';

const BASE_TIME = Math.floor(Date.now() / 1000);

/**
 * Realistic snapshot of active aircraft over the Indian Subcontinent
 * Raw OpenSky 17-element format
 */
export const DEMO_RAW_STATES_INDIA: OpenSkyRawState[] = [
  // icao24, callsign, country, time_pos, last_contact, lon, lat, baro_alt, on_ground, velocity, true_track, vert_rate, sensors, geo_alt, squawk, spi, pos_src
  ["8005bf", "IGO6128 ", "India", BASE_TIME - 4, BASE_TIME - 3, 72.8777, 19.0896, 4200, false, 185.2, 45.0, 8.5, null, 4350, "3412", false, 0],
  ["800a41", "AIC302  ", "India", BASE_TIME - 12, BASE_TIME - 10, 77.1000, 28.5562, 10668, false, 240.5, 125.0, 0.0, null, 11020, "2104", false, 0],
  ["800dc3", "VTI981  ", "India", BASE_TIME - 18, BASE_TIME - 15, 77.7064, 13.1986, 9144, false, 222.0, 310.0, -4.2, null, 9400, "1520", false, 0],
  ["80112a", "SEJ411  ", "India", BASE_TIME - 8, BASE_TIME - 6, 88.4467, 22.6547, 8534, false, 210.0, 260.0, 1.2, null, 8780, "4501", false, 0],
  ["8964d8", "UAE504  ", "United Arab Emirates", BASE_TIME - 25, BASE_TIME - 20, 71.5000, 20.2000, 11582, false, 252.0, 102.0, 0.0, null, 11950, "6432", false, 0],
  ["76cd02", "SIA403  ", "Singapore", BASE_TIME - 32, BASE_TIME - 30, 80.1700, 13.0827, 9753, false, 235.0, 115.0, -3.1, null, 10050, "4211", false, 0],
  ["800f14", "AXB142  ", "India", BASE_TIME - 5, BASE_TIME - 2, 75.8000, 26.8500, 7924, false, 215.0, 180.0, 2.0, null, 8150, "7012", false, 0],
  ["8008c2", "IGO449  ", "India", BASE_TIME - 45, BASE_TIME - 42, 78.4300, 17.2400, 6705, false, 195.0, 210.0, -5.5, null, 6920, "3305", false, 0],
  ["4077bf", "BAW138  ", "United Kingdom", BASE_TIME - 15, BASE_TIME - 11, 74.5000, 24.1000, 10972, false, 248.0, 305.0, 0.0, null, 11300, "5214", false, 0],
  ["8012bb", "IGO2092 ", "India", BASE_TIME - 65, BASE_TIME - 60, 76.2673, 9.9312, 1200, false, 120.0, 60.0, -3.8, null, 1280, "1123", false, 0],
  ["8001a4", "AIC804  ", "India", BASE_TIME - 2, BASE_TIME - 1, 72.8656, 19.0910, 12, true, 0.0, 90.0, 0.0, null, 15, "0000", false, 0],
  ["8019fe", "VTI712  ", "India", BASE_TIME - 110, BASE_TIME - 105, 85.8000, 20.3000, 10363, false, 230.0, 220.0, 0.0, null, 10650, "4102", false, 0],
  ["4b1802", "SWR198  ", "Switzerland", BASE_TIME - 14, BASE_TIME - 12, 73.2000, 21.8000, 11887, false, 260.0, 115.0, 0.0, null, 12250, "7641", false, 0],
  ["71029a", "QFA001  ", "Australia", BASE_TIME - 8, BASE_TIME - 5, 82.5000, 15.4000, 11277, false, 255.0, 290.0, 0.0, null, 11620, "2330", false, 0],
  ["800e88", "IGO954  ", "India", BASE_TIME - 3, BASE_TIME - 2, 73.8567, 18.5204, 3800, false, 175.0, 15.0, 6.2, null, 3950, "3216", false, 0]
];

/**
 * Raw OpenSky 17-element format for Europe (fallback if selected in demo mode)
 */
export const DEMO_RAW_STATES_EUROPE: OpenSkyRawState[] = [
  ["4ca218", "RYR412  ", "Ireland", BASE_TIME - 6, BASE_TIME - 4, 0.12, 51.50, 9144, false, 215.0, 195.0, 0.0, null, 9400, "4122", false, 0],
  ["3c6445", "DLH992  ", "Germany", BASE_TIME - 10, BASE_TIME - 8, 8.68, 50.11, 10058, false, 235.0, 85.0, 0.0, null, 10300, "1002", false, 0],
  ["3949e2", "AFR320  ", "France", BASE_TIME - 14, BASE_TIME - 11, 2.35, 48.85, 8534, false, 220.0, 340.0, -2.5, null, 8750, "5431", false, 0],
  ["4841dc", "KLM1104 ", "Netherlands", BASE_TIME - 4, BASE_TIME - 2, 4.90, 52.37, 7315, false, 205.0, 220.0, 3.2, null, 7550, "3210", false, 0],
  ["4009fe", "BAW456  ", "United Kingdom", BASE_TIME - 22, BASE_TIME - 18, -1.25, 51.75, 10668, false, 245.0, 120.0, 0.0, null, 11000, "7011", false, 0]
];

/**
 * Converts raw OpenSky array into typed Aircraft object
 */
export function normalizeRawState(raw: OpenSkyRawState, nowMs = Date.now()): Aircraft | null {
  const [
    icao24,
    rawCallsign,
    originCountry,
    timePosition,
    lastContact,
    lon,
    lat,
    baroAltitude,
    onGround,
    velocity,
    trueTrack,
    verticalRate,
    ,
    geoAltitude,
    squawk,
    spi,
    positionSource
  ] = raw;

  // Need at least valid icao24 and coordinates (unless on ground with last known coordinates)
  if (!icao24 || lat === null || lon === null || isNaN(lat) || isNaN(lon)) {
    return null;
  }

  const callsign = (rawCallsign || '').trim() || icao24.toUpperCase();
  const ageSec = calculateObservationAge(timePosition, lastContact);
  const freshness = getFreshnessCategory(ageSec);

  return {
    icao24: icao24.toLowerCase(),
    callsign,
    originCountry: originCountry || 'Unknown',
    lat: Number(lat.toFixed(5)),
    lon: Number(lon.toFixed(5)),
    baroAltitude: baroAltitude !== null ? Math.round(baroAltitude) : null,
    geoAltitude: geoAltitude !== null ? Math.round(geoAltitude) : null,
    velocity: velocity !== null ? Number(velocity.toFixed(1)) : null,
    velocityKmh: msToKmh(velocity),
    velocityKnots: msToKnots(velocity),
    heading: trueTrack !== null ? Math.round(trueTrack) : null,
    verticalRate: verticalRate !== null ? Number(verticalRate.toFixed(1)) : null,
    onGround: Boolean(onGround),
    squawk: squawk ? squawk.trim() : null,
    positionSource: decodePositionSource(positionSource),
    spi: Boolean(spi),
    lastContact,
    lastPositionTime: timePosition,
    observationAgeSec: ageSec,
    freshness,
    firstSeenAt: nowMs,
    lastSeenAt: nowMs
  };
}

/**
 * Get demo aircraft list for a given region
 */
export function getDemoAircraft(regionId: string): Aircraft[] {
  const rawList = regionId === 'europe' ? DEMO_RAW_STATES_EUROPE : DEMO_RAW_STATES_INDIA;
  const nowMs = Date.now();
  const list: Aircraft[] = [];

  for (const raw of rawList) {
    const normalized = normalizeRawState(raw, nowMs);
    if (normalized) list.push(normalized);
  }

  return list;
}

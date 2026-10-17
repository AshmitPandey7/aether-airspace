import { create } from 'zustand';
import { DEFAULT_REGION } from '../constants/regions';
import { getDemoAircraft } from '../services/demoData';
import { openskyService } from '../services/opensky';
import type {
  AirspaceAlert,
  AlertRule,
  Aircraft,
  DataMode,
  FilterState,
  NavSection,
  PositionSample,
  Region,
  SystemDiagnostics,
  SystemEvent
} from '../types';
import { applyDeadReckoning } from '../utils/deadReckoning';

interface AirspaceState {
  // Navigation & View
  currentSection: NavSection;
  setCurrentSection: (section: NavSection) => void;

  // Region & Mode
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
  isPollingActive: boolean;
  setIsPollingActive: (active: boolean) => void;
  pollingIntervalSec: number;
  setPollingIntervalSec: (interval: number) => void;
  secondsUntilNextPoll: number;

  // Aircraft Data
  aircraftMap: Record<string, Aircraft>;
  selectedIcao24: string | null;
  setSelectedIcao24: (icao24: string | null) => void;
  flightTrails: Record<string, PositionSample[]>;

  // Filters
  filters: FilterState;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Alerts & Events
  alertRules: AlertRule[];
  toggleAlertRule: (ruleId: string) => void;
  updateAlertRuleThreshold: (ruleId: string, threshold: number) => void;
  activeAlerts: AirspaceAlert[];
  dismissAlert: (alertId: string) => void;
  clearAllAlerts: () => void;
  systemEvents: SystemEvent[];

  // Replay
  isReplayActive: boolean;
  replayTimeIndex: number;
  isReplayPlaying: boolean;
  setIsReplayActive: (active: boolean) => void;
  setReplayTimeIndex: (idx: number) => void;
  setIsReplayPlaying: (playing: boolean) => void;

  // Diagnostics & Status
  diagnostics: SystemDiagnostics;
  isLoading: boolean;
  lastErrorMessage: string | null;

  // Actions
  fetchAirspaceData: () => Promise<void>;
  tickTimer: () => void;
  runDeadReckoningTick: () => void;
}

const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'ceiling',
    type: 'altitude_ceiling',
    threshold: 11500, // 11,500m (~37,700 ft)
    enabled: true,
    label: 'High Altitude Ceiling Exceeded',
    unit: 'm'
  },
  {
    id: 'floor',
    type: 'altitude_floor',
    threshold: 1200, // 1,200m
    enabled: true,
    label: 'Low Altitude Alert (Airborne)',
    unit: 'm'
  },
  {
    id: 'speed',
    type: 'speed_limit',
    threshold: 250, // 250 m/s (~900 km/h)
    enabled: true,
    label: 'High Ground Speed Warning',
    unit: 'm/s'
  },
  {
    id: 'stale',
    type: 'stale_tracking',
    threshold: 90, // 90 seconds
    enabled: false,
    label: 'Stale Observation Signal',
    unit: 's'
  }
];

const INITIAL_FILTERS: FilterState = {
  query: '',
  minAltitude: null,
  maxAltitude: null,
  minSpeed: null,
  maxSpeed: null,
  onGroundStatus: 'all',
  freshness: 'all'
};

// Cooldown map to avoid spamming the exact same alert repeatedly
const alertCooldowns = new Map<string, number>();

export const useAirspaceStore = create<AirspaceState>((set, get) => ({
  currentSection: 'home',
  setCurrentSection: (section) => set({ currentSection: section }),

  selectedRegion: DEFAULT_REGION,
  setSelectedRegion: (region) => {
    // Abort pending request and trigger fetch immediately
    openskyService.abortCurrent();
    set({
      selectedRegion: region,
      selectedIcao24: null,
      secondsUntilNextPoll: 1
    });
    get().fetchAirspaceData();
  },

  dataMode: 'LIVE',
  setDataMode: (mode) => {
    set({ dataMode: mode });
    if (mode === 'DEMO') {
      const demoList = getDemoAircraft(get().selectedRegion.id);
      const newMap: Record<string, Aircraft> = {};
      const newTrails: Record<string, PositionSample[]> = { ...get().flightTrails };

      for (const ac of demoList) {
        newMap[ac.icao24] = ac;
        if (!newTrails[ac.icao24]) {
          newTrails[ac.icao24] = [{
            lat: ac.lat,
            lon: ac.lon,
            altitude: ac.baroAltitude,
            velocity: ac.velocity,
            heading: ac.heading,
            timestamp: ac.lastPositionTime || Math.floor(Date.now() / 1000)
          }];
        }
      }

      set({
        aircraftMap: newMap,
        flightTrails: newTrails,
        lastErrorMessage: null
      });
    } else {
      get().fetchAirspaceData();
    }
  },

  isPollingActive: true,
  setIsPollingActive: (active) => set({ isPollingActive: active }),
  pollingIntervalSec: 10,
  setPollingIntervalSec: (interval) => set({ pollingIntervalSec: interval, secondsUntilNextPoll: interval }),
  secondsUntilNextPoll: 10,

  aircraftMap: {},
  selectedIcao24: null,
  setSelectedIcao24: (icao24) => {
    set({ selectedIcao24: icao24 });
    if (icao24) {
      const ac = get().aircraftMap[icao24];
      if (ac) {
        // Record event
        const newEvent: SystemEvent = {
          id: `sel_${Date.now()}_${Math.random()}`,
          type: 'connection',
          title: `Selected ${ac.callsign} (${ac.icao24.toUpperCase()})`,
          details: `Tracking at ${ac.lat.toFixed(4)}, ${ac.lon.toFixed(4)}`,
          timestamp: Date.now(),
          level: 'info'
        };
        set((state) => ({
          systemEvents: [newEvent, ...state.systemEvents.slice(0, 99)]
        }));
      }
    }
  },

  flightTrails: {},

  filters: INITIAL_FILTERS,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),
  resetFilters: () => set({ filters: INITIAL_FILTERS }),

  alertRules: DEFAULT_ALERT_RULES,
  toggleAlertRule: (ruleId) =>
    set((state) => ({
      alertRules: state.alertRules.map((r) =>
        r.id === ruleId ? { ...r, enabled: !r.enabled } : r
      )
    })),
  updateAlertRuleThreshold: (ruleId, threshold) =>
    set((state) => ({
      alertRules: state.alertRules.map((r) =>
        r.id === ruleId ? { ...r, threshold } : r
      )
    })),

  activeAlerts: [],
  dismissAlert: (alertId) =>
    set((state) => ({
      activeAlerts: state.activeAlerts.filter((a) => a.id !== alertId)
    })),
  clearAllAlerts: () => set({ activeAlerts: [] }),

  systemEvents: [
    {
      id: 'init_sys',
      type: 'connection',
      title: 'AETHER Radar Core Initialized',
      details: 'Ready to receive ADS-B / OpenSky state vectors',
      timestamp: Date.now(),
      level: 'success'
    }
  ],

  isReplayActive: false,
  replayTimeIndex: 0,
  isReplayPlaying: false,
  setIsReplayActive: (active) => set({ isReplayActive: active, isReplayPlaying: false }),
  setReplayTimeIndex: (idx) => set({ replayTimeIndex: idx }),
  setIsReplayPlaying: (playing) => set({ isReplayPlaying: playing }),

  diagnostics: {
    lastFetchDurationMs: 0,
    lastFetchTime: null,
    totalRequests: 0,
    failedRequests: 0,
    rateLimitedRequests: 0,
    currentPollingIntervalSec: 10,
    aircraftReceivedCount: 0,
    aircraftActiveCount: 0,
    aircraftFilteredCount: 0,
    cacheHitCount: 0,
    errorLog: []
  },

  isLoading: false,
  lastErrorMessage: null,

  fetchAirspaceData: async () => {
    const { dataMode, selectedRegion, aircraftMap, flightTrails, alertRules } = get();

    // If currently in DEMO mode, simulate realistic incremental movement
    if (dataMode === 'DEMO') {
      const updatedMap: Record<string, Aircraft> = {};
      const updatedTrails: Record<string, PositionSample[]> = { ...flightTrails };
      const nowSec = Math.floor(Date.now() / 1000);

      Object.values(aircraftMap).forEach((ac) => {
        // Move plane slightly forward in heading direction if moving
        let newLat = ac.lat;
        let newLon = ac.lon;

        if (ac.velocity && ac.heading && !ac.onGround) {
          const stepDist = ac.velocity * 5; // 5s step
          const rad = (ac.heading * Math.PI) / 180;
          const dLat = (stepDist * Math.cos(rad)) / 111320;
          const dLon = (stepDist * Math.sin(rad)) / (111320 * Math.cos((ac.lat * Math.PI) / 180));
          newLat = Number((ac.lat + dLat).toFixed(5));
          newLon = Number((ac.lon + dLon).toFixed(5));
        }

        const updatedAc: Aircraft = {
          ...ac,
          lat: newLat,
          lon: newLon,
          lastPositionTime: nowSec,
          lastContact: nowSec,
          observationAgeSec: 2,
          freshness: 'fresh',
          lastSeenAt: Date.now()
        };

        updatedMap[ac.icao24] = updatedAc;

        // Append to trail
        const currentTrail = updatedTrails[ac.icao24] || [];
        const newPoint: PositionSample = {
          lat: newLat,
          lon: newLon,
          altitude: ac.baroAltitude,
          velocity: ac.velocity,
          heading: ac.heading,
          timestamp: nowSec
        };

        updatedTrails[ac.icao24] = [...currentTrail.slice(-39), newPoint];
      });

      set({
        aircraftMap: updatedMap,
        flightTrails: updatedTrails,
        secondsUntilNextPoll: get().pollingIntervalSec,
        diagnostics: {
          ...get().diagnostics,
          aircraftReceivedCount: Object.keys(updatedMap).length,
          aircraftActiveCount: Object.keys(updatedMap).length,
          lastFetchTime: Date.now()
        }
      });
      return;
    }

    // LIVE Mode Fetch
    set({ isLoading: true });
    try {
      const result = await openskyService.fetchRegionStates(selectedRegion, {
        timeoutMs: 12000
      });

      const nowMs = Date.now();
      const updatedMap: Record<string, Aircraft> = {};
      const updatedTrails: Record<string, PositionSample[]> = { ...flightTrails };
      const newAlerts: AirspaceAlert[] = [];
      const newEvents: SystemEvent[] = [];

      const currentIcaoSet = new Set(Object.keys(aircraftMap));
      const incomingIcaoSet = new Set<string>();

      // Process received aircraft
      for (const ac of result.aircraft) {
        incomingIcaoSet.add(ac.icao24);

        // Check if aircraft newly entered monitored region
        if (!currentIcaoSet.has(ac.icao24)) {
          newEvents.push({
            id: `entry_${ac.icao24}_${nowMs}`,
            type: 'aircraft_entry',
            title: `Sector Ingress: ${ac.callsign}`,
            details: `Entered ${selectedRegion.name} at FL${Math.round((ac.baroAltitude || 0) * 0.0328)}`,
            timestamp: nowMs,
            level: 'info'
          });
        }

        const prevAc = aircraftMap[ac.icao24];
        updatedMap[ac.icao24] = {
          ...ac,
          firstSeenAt: prevAc ? prevAc.firstSeenAt : nowMs,
          lastSeenAt: nowMs
        };

        // Maintain historical position trail (deduplicated)
        const currentTrail = updatedTrails[ac.icao24] || [];
        const lastPoint = currentTrail[currentTrail.length - 1];

        const hasMoved =
          !lastPoint ||
          Math.abs(lastPoint.lat - ac.lat) > 0.0005 ||
          Math.abs(lastPoint.lon - ac.lon) > 0.0005 ||
          (ac.lastPositionTime && ac.lastPositionTime !== lastPoint.timestamp);

        if (hasMoved) {
          const newSample: PositionSample = {
            lat: ac.lat,
            lon: ac.lon,
            altitude: ac.baroAltitude,
            velocity: ac.velocity,
            heading: ac.heading,
            timestamp: ac.lastPositionTime || Math.floor(nowMs / 1000)
          };
          // Bounded trail per aircraft (max 40 points)
          updatedTrails[ac.icao24] = [...currentTrail.slice(-39), newSample];
        }

        // Evaluate Alert Rules with cooldown
        for (const rule of alertRules) {
          if (!rule.enabled) continue;

          let alertTriggered = false;
          let alertMsg = '';
          let severity: 'info' | 'warning' | 'critical' = 'warning';

          if (rule.type === 'altitude_ceiling' && ac.baroAltitude !== null && ac.baroAltitude > rule.threshold) {
            alertTriggered = true;
            alertMsg = `${ac.callsign} exceeded ceiling: ${ac.baroAltitude}m (Limit: ${rule.threshold}m)`;
            severity = 'critical';
          } else if (rule.type === 'altitude_floor' && !ac.onGround && ac.baroAltitude !== null && ac.baroAltitude < rule.threshold && ac.baroAltitude > 100) {
            alertTriggered = true;
            alertMsg = `${ac.callsign} low altitude alert: ${ac.baroAltitude}m (Floor: ${rule.threshold}m)`;
            severity = 'critical';
          } else if (rule.type === 'speed_limit' && ac.velocity !== null && ac.velocity > rule.threshold) {
            alertTriggered = true;
            alertMsg = `${ac.callsign} ground speed high: ${Math.round(ac.velocity)} m/s (${Math.round(ac.velocity * 3.6)} km/h)`;
            severity = 'warning';
          } else if (rule.type === 'stale_tracking' && ac.observationAgeSec > rule.threshold) {
            alertTriggered = true;
            alertMsg = `${ac.callsign} stale telemetry (${ac.observationAgeSec}s without update)`;
            severity = 'info';
          }

          if (alertTriggered) {
            const cooldownKey = `${rule.id}_${ac.icao24}`;
            const lastAlertTime = alertCooldowns.get(cooldownKey) || 0;

            // 60-second cooldown per aircraft per rule to prevent spamming
            if (nowMs - lastAlertTime > 60000) {
              alertCooldowns.set(cooldownKey, nowMs);
              newAlerts.push({
                id: `alt_${rule.id}_${ac.icao24}_${nowMs}`,
                ruleId: rule.id,
                ruleType: rule.type,
                icao24: ac.icao24,
                callsign: ac.callsign,
                message: alertMsg,
                severity,
                timestamp: nowMs
              });

              newEvents.push({
                id: `evt_alt_${rule.id}_${ac.icao24}_${nowMs}`,
                type: 'alert',
                title: `Alert: ${rule.label}`,
                details: alertMsg,
                timestamp: nowMs,
                level: severity === 'critical' ? 'error' : 'warning'
              });
            }
          }
        }
      }

      // Check for aircraft that left the monitored region
      currentIcaoSet.forEach((oldIcao) => {
        if (!incomingIcaoSet.has(oldIcao)) {
          const oldAc = aircraftMap[oldIcao];
          // Keep recently missing aircraft for up to 90 seconds as 'stale' before fully removing
          if (oldAc && nowMs - oldAc.lastSeenAt < 90000) {
            updatedMap[oldIcao] = {
              ...oldAc,
              freshness: 'stale',
              observationAgeSec: Math.floor((nowMs - oldAc.lastSeenAt) / 1000)
            };
          } else if (oldAc) {
            newEvents.push({
              id: `exit_${oldIcao}_${nowMs}`,
              type: 'aircraft_exit',
              title: `Sector Egress: ${oldAc.callsign}`,
              details: `Aircraft left monitored airspace ${selectedRegion.name}`,
              timestamp: nowMs,
              level: 'info'
            });
          }
        }
      });

      // Update state
      set((state) => ({
        aircraftMap: updatedMap,
        flightTrails: updatedTrails,
        dataMode: 'LIVE',
        isLoading: false,
        lastErrorMessage: null,
        secondsUntilNextPoll: state.pollingIntervalSec,
        activeAlerts: [...newAlerts, ...state.activeAlerts].slice(0, 50),
        systemEvents: [...newEvents, ...state.systemEvents].slice(0, 100),
        diagnostics: {
          ...state.diagnostics,
          lastFetchDurationMs: result.fetchDurationMs,
          lastFetchTime: nowMs,
          totalRequests: state.diagnostics.totalRequests + 1,
          aircraftReceivedCount: result.aircraft.length,
          aircraftActiveCount: Object.keys(updatedMap).length
        }
      }));
    } catch (err: any) {
      // If request was aborted or superseded by a newer one, ignore it cleanly
      if (err?.message === 'Request aborted' || err?.message === 'Superseded by newer request') {
        set({ isLoading: false });
        return;
      }

      const nowMs = Date.now();
      const isRateLimit = err?.status === 429;
      const errorMsg = err?.message || 'Network request failed';

      // Fallback: check cache for recovery
      const cached = openskyService.getCachedSnapshot(selectedRegion.id);

      // Baseline traffic fallback if the store has no aircraft yet
      let fallbackMap: Record<string, Aircraft> = {};
      if (Object.keys(get().aircraftMap).length === 0) {
        const demoList = getDemoAircraft(selectedRegion.id);
        demoList.forEach((ac) => {
          fallbackMap[ac.icao24] = ac;
        });
      }

      set((state) => ({
        isLoading: false,
        dataMode: cached ? 'DELAYED' : (Object.keys(state.aircraftMap).length > 0 ? 'OFFLINE' : 'DEMO'),
        aircraftMap: Object.keys(state.aircraftMap).length > 0 ? state.aircraftMap : fallbackMap,
        lastErrorMessage: errorMsg,
        secondsUntilNextPoll: isRateLimit ? 30 : 15,
        diagnostics: {
          ...state.diagnostics,
          totalRequests: state.diagnostics.totalRequests + 1,
          failedRequests: state.diagnostics.failedRequests + 1,
          rateLimitedRequests: isRateLimit
            ? state.diagnostics.rateLimitedRequests + 1
            : state.diagnostics.rateLimitedRequests,
          cacheHitCount: cached ? state.diagnostics.cacheHitCount + 1 : state.diagnostics.cacheHitCount,
          errorLog: [
            {
              id: `err_${nowMs}`,
              time: nowMs,
              message: errorMsg,
              status: err?.status
            },
            ...state.diagnostics.errorLog.slice(0, 19)
          ]
        },
        systemEvents: [
          {
            id: `evt_err_${nowMs}`,
            type: 'error',
            title: isRateLimit ? 'API Rate Limit Encountered' : 'Data Fetch Failed',
            details: errorMsg,
            timestamp: nowMs,
            level: 'error'
          },
          ...state.systemEvents.slice(0, 99)
        ]
      }));
    }
  },

  tickTimer: () => {
    const { secondsUntilNextPoll, isPollingActive, fetchAirspaceData } = get();
    if (!isPollingActive) return;

    if (secondsUntilNextPoll <= 1) {
      fetchAirspaceData();
    } else {
      set({ secondsUntilNextPoll: secondsUntilNextPoll - 1 });
    }
  },

  runDeadReckoningTick: () => {
    // Only apply dead reckoning to airborne aircraft that have recent positions
    const { aircraftMap } = get();
    let hasChanges = false;
    const updated: Record<string, Aircraft> = {};

    for (const [icao, ac] of Object.entries(aircraftMap)) {
      const nextAc = applyDeadReckoning(ac);
      if (nextAc !== ac) {
        hasChanges = true;
      }
      updated[icao] = nextAc;
    }

    if (hasChanges) {
      set({ aircraftMap: updated });
    }
  }
}));

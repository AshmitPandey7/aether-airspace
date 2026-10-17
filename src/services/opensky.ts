import type { Aircraft, OpenSkyResponse, Region } from '../types';
import { normalizeRawState } from './demoData';

export interface FetchResult {
  aircraft: Aircraft[];
  serverTime: number;
  fetchDurationMs: number;
  fromCache?: boolean;
}

export interface OpenSkyServiceOptions {
  authHeader?: string; // Optional Basic Auth "Basic <base64>"
  timeoutMs?: number;
}

class OpenSkyService {
  private activeAbortController: AbortController | null = null;
  private currentRequestId = 0;
  private lastSuccessfulFetchTimestamp = 0;
  private cachedSnapshots: Map<string, { time: number; aircraft: Aircraft[] }> = new Map();

  /**
   * Fetches live states within the specified regional bounding box.
   * Cancels any ongoing pending request automatically.
   */
  public async fetchRegionStates(
    region: Region,
    options: OpenSkyServiceOptions = {}
  ): Promise<FetchResult> {
    // 1. Cancel previous pending request to avoid stale overwriting
    if (this.activeAbortController) {
      this.activeAbortController.abort();
    }

    const abortController = new AbortController();
    this.activeAbortController = abortController;
    const thisRequestId = ++this.currentRequestId;

    const timeout = options.timeoutMs ?? 10000;
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeout);

    const startTime = performance.now();

    // Construct URL with bounding box
    const url = new URL('https://opensky-network.org/api/states/all');
    url.searchParams.set('lamin', region.lamin.toFixed(4));
    url.searchParams.set('lamax', region.lamax.toFixed(4));
    url.searchParams.set('lomin', region.lomin.toFixed(4));
    url.searchParams.set('lomax', region.lomax.toFixed(4));

    const headers: HeadersInit = {
      'Accept': 'application/json'
    };

    if (options.authHeader) {
      headers['Authorization'] = options.authHeader;
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        signal: abortController.signal
      });

      clearTimeout(timeoutId);

      // Check for request race condition
      if (thisRequestId !== this.currentRequestId) {
        throw new Error('Superseded by newer request');
      }

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delaySec = retryAfter ? parseInt(retryAfter, 10) : 30;
          const err = new Error(`OpenSky rate limit reached (HTTP 429). Retry in ${delaySec}s.`);
          (err as any).status = 429;
          (err as any).retryAfter = delaySec;
          throw err;
        }

        const err = new Error(`OpenSky API HTTP ${response.status}: ${response.statusText}`);
        (err as any).status = response.status;
        throw err;
      }

      const json: OpenSkyResponse = await response.json();
      const endTime = performance.now();
      const fetchDurationMs = Math.round(endTime - startTime);

      const nowMs = Date.now();
      const normalizedAircraft: Aircraft[] = [];

      if (json && Array.isArray(json.states)) {
        for (const rawState of json.states) {
          const aircraft = normalizeRawState(rawState, nowMs);
          if (aircraft) {
            normalizedAircraft.push(aircraft);
          }
        }
      }

      // Save to memory cache for fallback / offline mode
      this.cachedSnapshots.set(region.id, {
        time: nowMs,
        aircraft: normalizedAircraft
      });

      this.lastSuccessfulFetchTimestamp = nowMs;

      return {
        aircraft: normalizedAircraft,
        serverTime: json.time || Math.floor(nowMs / 1000),
        fetchDurationMs
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request aborted');
      }

      throw error;
    } finally {
      if (this.activeAbortController === abortController) {
        this.activeAbortController = null;
      }
    }
  }

  /**
   * Retrieves the most recently cached snapshot for a region
   */
  public getCachedSnapshot(regionId: string): { time: number; aircraft: Aircraft[] } | null {
    return this.cachedSnapshots.get(regionId) || null;
  }

  /**
   * Get timestamp of last successful live fetch
   */
  public getLastSuccessfulFetch(): number {
    return this.lastSuccessfulFetchTimestamp;
  }

  /**
   * Abort any ongoing request
   */
  public abortCurrent(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort();
      this.activeAbortController = null;
    }
  }
}

export const openskyService = new OpenSkyService();

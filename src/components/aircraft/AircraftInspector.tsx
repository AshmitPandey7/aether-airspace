import React, { useState } from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Check, 
  Compass, 
  Copy, 
  Gauge, 
  History, 
  Minus, 
  Navigation, 
  Plane, 
  Radio, 
  Sparkles, 
  Waypoints, 
  X 
} from 'lucide-react';
import { useAirspaceStore } from '../../store/useAirspaceStore';
import { 
  formatAgeString, 
  formatCoordinates, 
  getHeadingCompass, 
  metersToFeet 
} from '../../utils/formatters';

export const AircraftInspector: React.FC = () => {
  const {
    selectedIcao24,
    setSelectedIcao24,
    aircraftMap,
    flightTrails,
    setIsReplayActive,
    setCurrentSection
  } = useAirspaceStore();

  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!selectedIcao24) return null;

  const aircraft = aircraftMap[selectedIcao24];
  if (!aircraft) {
    return (
      <div className="w-80 bg-black border-l border-[#222222] p-4 text-xs font-mono text-neutral-400">
        <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
          <span className="text-white font-bold">TARGET LOST</span>
          <button
            onClick={() => setSelectedIcao24(null)}
            className="p-1 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-4 text-neutral-500">
          The previously selected aircraft ({selectedIcao24.toUpperCase()}) is no longer in the active sector response.
        </p>
      </div>
    );
  }

  const trails = flightTrails[selectedIcao24] || [];

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getVerticalRateIndicator = (rate: number | null) => {
    if (rate === null || isNaN(rate)) return <span className="text-neutral-500">N/A</span>;
    if (Math.abs(rate) < 0.5) {
      return (
        <span className="flex items-center gap-1 text-neutral-400">
          <Minus className="w-3.5 h-3.5" /> LEVEL (0 m/s)
        </span>
      );
    }
    if (rate > 0) {
      return (
        <span className="flex items-center gap-1 text-white font-semibold">
          <ArrowUpRight className="w-3.5 h-3.5" /> CLIMB (+{rate.toFixed(1)} m/s)
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-neutral-300 font-semibold">
        <ArrowDownRight className="w-3.5 h-3.5" /> DESCEND ({rate.toFixed(1)} m/s)
      </span>
    );
  };

  const getFreshnessBadge = () => {
    switch (aircraft.freshness) {
      case 'fresh':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white text-black font-semibold">
            FRESH (&lt;30s)
          </span>
        );
      case 'aging':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
            AGING (&lt;75s)
          </span>
        );
      case 'stale':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-900 text-neutral-500 border border-neutral-800">
            STALE (&gt;75s)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300">
            UNKNOWN
          </span>
        );
    }
  };

  return (
    <aside className="w-88 md:w-96 bg-black border-l border-[#222222] flex flex-col h-full z-20 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="p-4 border-b border-[#222222] bg-[#0A0A0A] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-black border border-[#222222] text-white">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-white tracking-wide">
                {aircraft.callsign}
              </h2>
              {aircraft.onGround ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-neutral-900 text-neutral-400 border border-neutral-700">
                  GROUND
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/10 text-white border border-white/20">
                  AIRBORNE
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-neutral-400">
              ICAO: <span className="text-white font-semibold">{aircraft.icao24.toUpperCase()}</span> • {aircraft.originCountry}
            </p>
          </div>
        </div>

        <button
          onClick={() => setSelectedIcao24(null)}
          className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          title="Close Inspector (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Action Toolbar */}
      <div className="grid grid-cols-3 gap-1 p-2 bg-black border-b border-[#222222] text-[10px] font-mono">
        <button
          onClick={() => handleCopy(aircraft.icao24.toUpperCase(), 'icao')}
          className="flex items-center justify-center gap-1.5 py-1.5 rounded bg-[#0A0A0A] hover:bg-[#1A1A1A] text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          {copiedField === 'icao' ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
          <span>{copiedField === 'icao' ? 'COPIED' : 'COPY ICAO'}</span>
        </button>

        <button
          onClick={() => handleCopy(`${aircraft.lat}, ${aircraft.lon}`, 'coords')}
          className="flex items-center justify-center gap-1.5 py-1.5 rounded bg-[#0A0A0A] hover:bg-[#1A1A1A] text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          {copiedField === 'coords' ? <Check className="w-3 h-3 text-white" /> : <Waypoints className="w-3 h-3" />}
          <span>{copiedField === 'coords' ? 'COPIED' : 'COPY COORD'}</span>
        </button>

        <button
          onClick={() => {
            setIsReplayActive(true);
            setCurrentSection('history');
          }}
          className="flex items-center justify-center gap-1.5 py-1.5 rounded bg-[#0A0A0A] hover:bg-[#1A1A1A] text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <History className="w-3 h-3" />
          <span>REPLAY</span>
        </button>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Estimated Dead Reckoning Banner */}
        {aircraft.isEstimated && (
          <div className="p-2.5 rounded bg-[#0A0A0A] border border-neutral-700 text-xs font-mono text-neutral-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-white" />
            <span>Dead reckoning active: intermediate position estimated between updates.</span>
          </div>
        )}

        {/* Primary Telemetry Cards */}
        <div className="grid grid-cols-2 gap-2">
          {/* Altitude */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded p-2.5">
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Baro Altitude</span>
              <Gauge className="w-3 h-3 text-neutral-400" />
            </div>
            <div className="font-mono text-base font-bold text-white">
              {aircraft.baroAltitude !== null ? `${aircraft.baroAltitude.toLocaleString()} m` : 'N/A'}
            </div>
            <div className="text-[10px] font-mono text-neutral-500">
              {aircraft.baroAltitude !== null ? `${metersToFeet(aircraft.baroAltitude)?.toLocaleString()} ft` : 'Ground level / unavail'}
            </div>
          </div>

          {/* Speed */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded p-2.5">
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Ground Speed</span>
              <Navigation className="w-3 h-3 text-neutral-400" />
            </div>
            <div className="font-mono text-base font-bold text-white">
              {aircraft.velocityKmh !== null ? `${aircraft.velocityKmh} km/h` : 'N/A'}
            </div>
            <div className="text-[10px] font-mono text-neutral-500">
              {aircraft.velocityKnots !== null ? `${aircraft.velocityKnots} kts (${aircraft.velocity} m/s)` : 'Stationary / N/A'}
            </div>
          </div>

          {/* Heading */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded p-2.5">
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Track / Heading</span>
              <Compass className="w-3 h-3 text-neutral-400" />
            </div>
            <div className="font-mono text-base font-bold text-white">
              {getHeadingCompass(aircraft.heading)}
            </div>
            <div className="text-[10px] font-mono text-neutral-500">
              Clockwise from True North
            </div>
          </div>

          {/* Vertical Rate */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded p-2.5">
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Vertical Rate</span>
              <Radio className="w-3 h-3 text-neutral-400" />
            </div>
            <div className="font-mono text-xs mt-1">
              {getVerticalRateIndicator(aircraft.verticalRate)}
            </div>
          </div>
        </div>

        {/* Detailed Surveillance Specifications Table */}
        <div className="bg-[#0A0A0A] border border-[#222222] rounded p-3 text-xs font-mono space-y-2">
          <div className="text-[11px] font-bold text-white uppercase tracking-wider pb-1.5 border-b border-[#222222] flex items-center justify-between">
            <span>Surveillance Vector</span>
            {getFreshnessBadge()}
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-neutral-400">Geographic Position:</span>
            <span className="text-white font-medium text-right">
              {formatCoordinates(aircraft.lat, aircraft.lon)}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-neutral-400">Geometric Altitude:</span>
            <span className="text-white">
              {aircraft.geoAltitude !== null ? `${aircraft.geoAltitude.toLocaleString()} m (${metersToFeet(aircraft.geoAltitude)?.toLocaleString()} ft)` : <span className="text-neutral-500">Unavailable</span>}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-neutral-400">Transponder Squawk:</span>
            <span className="text-white font-mono font-bold tracking-widest">
              {aircraft.squawk || <span className="text-neutral-500">None reported</span>}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-neutral-400">Position Source:</span>
            <span className="text-white font-semibold">
              {aircraft.positionSource}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-neutral-400">SPI (Ident Pulse):</span>
            <span className={aircraft.spi ? 'text-white font-bold' : 'text-neutral-400'}>
              {aircraft.spi ? 'ACTIVE (PULSE)' : 'Inactive'}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-neutral-400">Observation Age:</span>
            <span className="text-white">
              {formatAgeString(aircraft.observationAgeSec)}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-neutral-400">Last Position Fix:</span>
            <span className="text-neutral-400">
              {aircraft.lastPositionTime ? new Date(aircraft.lastPositionTime * 1000).toLocaleTimeString() : 'N/A'}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-neutral-400">Recorded Trail Samples:</span>
            <span className="text-white font-semibold">
              {trails.length} samples collected
            </span>
          </div>
        </div>

        {/* Trail History Preview */}
        {trails.length > 0 && (
          <div className="bg-[#0A0A0A] border border-[#222222] rounded p-3 text-xs font-mono">
            <div className="text-[11px] font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Recent Observations</span>
              <span className="text-[10px] text-neutral-400">{trails.length} fixes</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
              {trails.slice(-5).reverse().map((sample, idx) => (
                <div key={idx} className="flex justify-between text-[10px] text-neutral-400 py-1 border-b border-[#222222] last:border-none">
                  <span>{new Date(sample.timestamp * 1000).toLocaleTimeString()}</span>
                  <span className="text-white">{sample.lat.toFixed(3)}°, {sample.lon.toFixed(3)}°</span>
                  <span className="text-neutral-300">{sample.altitude ? `${Math.round(sample.altitude)}m` : '0m'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

import React from 'react';
import { ChevronRight, Plane } from 'lucide-react';
import { useAirspaceStore } from '../../store/useAirspaceStore';

export const AircraftList: React.FC = () => {
  const {
    aircraftMap,
    selectedIcao24,
    setSelectedIcao24,
    filters
  } = useAirspaceStore();

  const allAircraft = Object.values(aircraftMap);

  // Apply filters
  const filteredList = allAircraft.filter((ac) => {
    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      const matchesCallsign = ac.callsign.toLowerCase().includes(q);
      const matchesIcao = ac.icao24.toLowerCase().includes(q);
      if (!matchesCallsign && !matchesIcao) return false;
    }
    if (filters.minAltitude !== null && (ac.baroAltitude === null || ac.baroAltitude < filters.minAltitude)) {
      return false;
    }
    if (filters.maxAltitude !== null && (ac.baroAltitude === null || ac.baroAltitude > filters.maxAltitude)) {
      return false;
    }
    if (filters.minSpeed !== null && (ac.velocity === null || ac.velocity < filters.minSpeed)) {
      return false;
    }
    if (filters.maxSpeed !== null && (ac.velocity === null || ac.velocity > filters.maxSpeed)) {
      return false;
    }
    if (filters.onGroundStatus === 'ground' && !ac.onGround) return false;
    if (filters.onGroundStatus === 'airborne' && ac.onGround) return false;
    if (filters.freshness !== 'all' && ac.freshness !== filters.freshness) return false;

    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0E1624]">
      {/* List Header Count */}
      <div className="px-3 py-2 bg-[#131F30]/40 border-b border-[#1C2A3E] flex items-center justify-between text-[11px] font-mono text-[#8293AA]">
        <span>SURVEILLANCE MANIFEST</span>
        <span className="text-[#55DDF5] font-semibold">
          {filteredList.length} / {allAircraft.length}
        </span>
      </div>

      {/* Aircraft Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1C2A3E]/60">
        {filteredList.length === 0 ? (
          <div className="p-6 text-center text-xs font-mono text-[#53647B]">
            <Plane className="w-6 h-6 mx-auto mb-2 opacity-30" />
            <p>No aircraft matching current filter criteria.</p>
          </div>
        ) : (
          filteredList.map((ac) => {
            const isSelected = ac.icao24 === selectedIcao24;
            const heading = ac.heading ?? 0;

            return (
              <div
                key={ac.icao24}
                onClick={() => setSelectedIcao24(ac.icao24)}
                className={`p-2.5 transition-all cursor-pointer select-none font-mono text-xs ${
                  isSelected
                    ? 'bg-[#131F30] border-l-2 border-[#55DDF5] shadow-[inset_0_0_12px_rgba(85,221,245,0.1)]'
                    : 'hover:bg-[#131F30]/50 border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Callsign & Flag */}
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 flex items-center justify-center"
                      style={{ transform: `rotate(${heading}deg)` }}
                    >
                      <Plane 
                        className={`w-3.5 h-3.5 ${
                          isSelected 
                            ? 'text-[#55DDF5]' 
                            : ac.onGround 
                            ? 'text-[#FFB454]' 
                            : 'text-[#8293AA]'
                        }`} 
                      />
                    </div>
                    <div>
                      <span className={`font-bold ${isSelected ? 'text-[#55DDF5]' : 'text-white'}`}>
                        {ac.callsign}
                      </span>
                      <span className="text-[10px] text-[#53647B] ml-1.5">
                        {ac.icao24.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Freshness dot */}
                  <div className="flex items-center gap-1.5">
                    <span 
                      className={`w-1.5 h-1.5 rounded-full ${
                        ac.freshness === 'fresh' 
                          ? 'bg-emerald-400 shadow-[0_0_4px_#34D399]' 
                          : ac.freshness === 'aging' 
                          ? 'bg-amber-400' 
                          : 'bg-rose-400'
                      }`} 
                    />
                    <ChevronRight className="w-3.5 h-3.5 text-[#53647B]" />
                  </div>
                </div>

                {/* Telemetry Row */}
                <div className="mt-1 flex items-center justify-between text-[11px] text-[#8293AA]">
                  <span>
                    {ac.onGround ? (
                      <span className="text-[#FFB454]">ON GROUND</span>
                    ) : ac.baroAltitude !== null ? (
                      `FL${Math.round(ac.baroAltitude * 0.0328)} (${Math.round(ac.baroAltitude)}m)`
                    ) : (
                      'ALT N/A'
                    )}
                  </span>
                  <span>
                    {ac.velocityKmh !== null ? `${ac.velocityKmh} km/h` : '0 km/h'}
                  </span>
                  <span className="text-[#53647B] text-[10px]">
                    {ac.heading !== null ? `${ac.heading}°` : '--°'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

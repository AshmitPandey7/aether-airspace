import React from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { useAirspaceStore } from '../../store/useAirspaceStore';

export const FilterPanel: React.FC = () => {
  const { filters, setFilters, resetFilters } = useAirspaceStore();

  const isFiltered =
    filters.query !== '' ||
    filters.minAltitude !== null ||
    filters.maxAltitude !== null ||
    filters.minSpeed !== null ||
    filters.maxSpeed !== null ||
    filters.onGroundStatus !== 'all' ||
    filters.freshness !== 'all';

  return (
    <div className="bg-[#0E1624] border-b border-[#1C2A3E] p-3 text-xs font-mono space-y-2.5">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8293AA]" />
        <input
          type="text"
          value={filters.query}
          onChange={(e) => setFilters({ query: e.target.value })}
          placeholder="Filter callsign or ICAO24..."
          className="w-full bg-[#080D16] border border-[#1C2A3E] focus:border-[#55DDF5] rounded pl-8 pr-3 py-1.5 text-xs text-[#EAF1FA] placeholder-[#53647B] outline-none transition-colors"
        />
        {filters.query && (
          <button
            onClick={() => setFilters({ query: '' })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8293AA] hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {/* Flight Status Toggles */}
      <div className="grid grid-cols-3 gap-1 bg-[#080D16] p-1 rounded border border-[#1C2A3E]">
        <button
          onClick={() => setFilters({ onGroundStatus: 'all' })}
          className={`py-1 text-center rounded transition-colors cursor-pointer text-[11px] ${
            filters.onGroundStatus === 'all'
              ? 'bg-[#131F30] text-[#55DDF5] font-semibold border border-[#55DDF5]/30'
              : 'text-[#8293AA] hover:text-white'
          }`}
        >
          ALL
        </button>
        <button
          onClick={() => setFilters({ onGroundStatus: 'airborne' })}
          className={`py-1 text-center rounded transition-colors cursor-pointer text-[11px] ${
            filters.onGroundStatus === 'airborne'
              ? 'bg-[#131F30] text-[#55DDF5] font-semibold border border-[#55DDF5]/30'
              : 'text-[#8293AA] hover:text-white'
          }`}
        >
          AIRBORNE
        </button>
        <button
          onClick={() => setFilters({ onGroundStatus: 'ground' })}
          className={`py-1 text-center rounded transition-colors cursor-pointer text-[11px] ${
            filters.onGroundStatus === 'ground'
              ? 'bg-[#131F30] text-[#FFB454] font-semibold border border-[#FFB454]/30'
              : 'text-[#8293AA] hover:text-white'
          }`}
        >
          GROUND
        </button>
      </div>

      {/* Freshness Filter & Clear All */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#8293AA]">DATA:</span>
          <select
            value={filters.freshness}
            onChange={(e) => setFilters({ freshness: e.target.value as any })}
            className="bg-[#080D16] border border-[#1C2A3E] text-[#55DDF5] text-[11px] rounded px-1.5 py-0.5 outline-none cursor-pointer"
          >
            <option value="all">All Ages</option>
            <option value="fresh">Fresh (&lt;30s)</option>
            <option value="aging">Aging (&lt;75s)</option>
            <option value="stale">Stale (&gt;75s)</option>
          </select>
        </div>

        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>RESET</span>
          </button>
        )}
      </div>
    </div>
  );
};

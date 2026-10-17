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
    <div className="bg-black border-b border-[#222222] p-3 text-xs font-mono space-y-2.5">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={filters.query}
          onChange={(e) => setFilters({ query: e.target.value })}
          placeholder="Filter callsign or ICAO24..."
          className="w-full bg-[#0A0A0A] border border-[#222222] focus:border-white rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
        />
        {filters.query && (
          <button
            onClick={() => setFilters({ query: '' })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {/* Flight Status Toggles */}
      <div className="grid grid-cols-3 gap-1 bg-[#0A0A0A] p-1 rounded border border-[#222222]">
        <button
          onClick={() => setFilters({ onGroundStatus: 'all' })}
          className={`py-1 text-center rounded transition-colors cursor-pointer text-[11px] ${
            filters.onGroundStatus === 'all'
              ? 'bg-white text-black font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          ALL
        </button>
        <button
          onClick={() => setFilters({ onGroundStatus: 'airborne' })}
          className={`py-1 text-center rounded transition-colors cursor-pointer text-[11px] ${
            filters.onGroundStatus === 'airborne'
              ? 'bg-white text-black font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          AIRBORNE
        </button>
        <button
          onClick={() => setFilters({ onGroundStatus: 'ground' })}
          className={`py-1 text-center rounded transition-colors cursor-pointer text-[11px] ${
            filters.onGroundStatus === 'ground'
              ? 'bg-white text-black font-semibold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          GROUND
        </button>
      </div>

      {/* Freshness Filter & Clear All */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-neutral-400">DATA:</span>
          <select
            value={filters.freshness}
            onChange={(e) => setFilters({ freshness: e.target.value as any })}
            className="bg-[#0A0A0A] border border-[#222222] text-white text-[11px] rounded px-1.5 py-0.5 outline-none cursor-pointer"
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
            className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>RESET</span>
          </button>
        )}
      </div>
    </div>
  );
};

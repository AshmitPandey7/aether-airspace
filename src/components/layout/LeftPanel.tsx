import React, { useState } from 'react';
import { 
  AlertCircle, 
  Compass, 
  Edit3 
} from 'lucide-react';
import { useAirspaceStore } from '../../store/useAirspaceStore';
import type { Region } from '../../types';
import { AircraftList } from '../aircraft/AircraftList';
import { FilterPanel } from '../filters/FilterPanel';

export const LeftPanel: React.FC = () => {
  const {
    aircraftMap,
    selectedRegion,
    setSelectedRegion,
    lastErrorMessage,
    setDataMode
  } = useAirspaceStore();

  const [isBboxEditorOpen, setIsBboxEditorOpen] = useState(false);
  const [bboxValues, setBboxValues] = useState({
    lamin: selectedRegion.lamin.toString(),
    lamax: selectedRegion.lamax.toString(),
    lomin: selectedRegion.lomin.toString(),
    lomax: selectedRegion.lomax.toString()
  });

  const aircraftList = Object.values(aircraftMap);
  const totalCount = aircraftList.length;
  const airborneCount = aircraftList.filter((a) => !a.onGround).length;
  const groundCount = aircraftList.filter((a) => a.onGround).length;
  const staleCount = aircraftList.filter((a) => a.freshness === 'stale').length;

  const handleApplyCustomBbox = (e: React.FormEvent) => {
    e.preventDefault();
    const lamin = parseFloat(bboxValues.lamin);
    const lamax = parseFloat(bboxValues.lamax);
    const lomin = parseFloat(bboxValues.lomin);
    const lomax = parseFloat(bboxValues.lomax);

    if (isNaN(lamin) || isNaN(lamax) || isNaN(lomin) || isNaN(lomax)) return;
    if (lamin >= lamax || lomin >= lomax) return;

    const customRegion: Region = {
      id: 'custom',
      name: 'Custom Bounding Sector',
      lamin,
      lamax,
      lomin,
      lomax,
      center: [(lamin + lamax) / 2, (lomin + lomax) / 2],
      zoom: 6,
      description: `Custom bounding area [${lamin}°, ${lomin}° to ${lamax}°, ${lomax}°]`
    };

    setSelectedRegion(customRegion);
    setIsBboxEditorOpen(false);
  };

  return (
    <aside className="w-80 md:w-84 bg-black border-r border-[#222222] flex flex-col h-full z-20 overflow-hidden font-mono text-xs">
      {/* Sector Operational Metrics Bar */}
      <div className="p-3 bg-[#0A0A0A] border-b border-[#222222]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-white" />
            <span>SECTOR TELEMETRY</span>
          </div>
          <button
            onClick={() => setIsBboxEditorOpen(!isBboxEditorOpen)}
            className="flex items-center gap-1 text-[10px] text-[#888888] hover:text-white cursor-pointer"
            title="Edit Bounding Box Coordinates"
          >
            <Edit3 className="w-3 h-3" />
            <span>BOUNDS</span>
          </button>
        </div>

        {/* 4 Metric Tiles */}
        <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
          <div className="bg-[#111111] border border-[#222222] rounded p-1.5">
            <div className="text-[14px] font-bold text-white">{totalCount}</div>
            <div className="text-[8px] text-[#666666] uppercase">Total</div>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded p-1.5">
            <div className="text-[14px] font-bold text-white">{airborneCount}</div>
            <div className="text-[8px] text-[#666666] uppercase">Airborne</div>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded p-1.5">
            <div className="text-[14px] font-bold text-[#888888]">{groundCount}</div>
            <div className="text-[8px] text-[#666666] uppercase">Ground</div>
          </div>
          <div className="bg-[#111111] border border-[#222222] rounded p-1.5">
            <div className="text-[14px] font-bold text-[#666666]">{staleCount}</div>
            <div className="text-[8px] text-[#666666] uppercase">Stale</div>
          </div>
        </div>

        {/* Custom Bounding Box Modal / Accordion */}
        {isBboxEditorOpen && (
          <form onSubmit={handleApplyCustomBbox} className="mt-3 p-2 bg-[#111111] border border-[#333333] rounded text-xs space-y-2">
            <div className="text-[10px] text-[#888888] uppercase font-bold">Bounding Box Coordinates (° Lat / Lon)</div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <label className="text-[#666666] block">Min Lat (lamin)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bboxValues.lamin}
                  onChange={(e) => setBboxValues({ ...bboxValues, lamin: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded p-1 text-white"
                />
              </div>
              <div>
                <label className="text-[#666666] block">Max Lat (lamax)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bboxValues.lamax}
                  onChange={(e) => setBboxValues({ ...bboxValues, lamax: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded p-1 text-white"
                />
              </div>
              <div>
                <label className="text-[#666666] block">Min Lon (lomin)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bboxValues.lomin}
                  onChange={(e) => setBboxValues({ ...bboxValues, lomin: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded p-1 text-white"
                />
              </div>
              <div>
                <label className="text-[#666666] block">Max Lon (lomax)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bboxValues.lomax}
                  onChange={(e) => setBboxValues({ ...bboxValues, lomax: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-[#333333] rounded p-1 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsBboxEditorOpen(false)}
                className="px-2 py-1 rounded bg-[#1A1A1A] text-[#888888] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 rounded bg-white text-black font-bold hover:bg-[#E5E5E5]"
              >
                Apply Bounds
              </button>
            </div>
          </form>
        )}

        {/* Error Notice if any */}
        {lastErrorMessage && (
          <div className="mt-2 p-2 rounded bg-[#161616] border border-[#333333] text-[10px] text-[#CCCCCC] space-y-1.5">
            <div className="flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#888888]" />
              <span className="leading-tight">{lastErrorMessage}</span>
            </div>
            <button
              onClick={() => setDataMode('DEMO')}
              className="w-full py-1 rounded bg-[#222222] hover:bg-[#2A2A2A] border border-[#444444] text-white font-medium text-center cursor-pointer transition-colors"
            >
              SWITCH TO DEMO SIMULATION
            </button>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <FilterPanel />

      {/* Synchronized Aircraft Manifest */}
      <AircraftList />
    </aside>
  );
};

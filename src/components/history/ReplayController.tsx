import React, { useEffect, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Pause, 
  Play, 
  X 
} from 'lucide-react';
import { useAirspaceStore } from '../../store/useAirspaceStore';

export const ReplayController: React.FC = () => {
  const {
    selectedIcao24,
    aircraftMap,
    flightTrails,
    isReplayActive,
    setIsReplayActive,
    replayTimeIndex,
    setReplayTimeIndex,
    isReplayPlaying,
    setIsReplayPlaying
  } = useAirspaceStore();

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const selectedAc = selectedIcao24 ? aircraftMap[selectedIcao24] : null;
  const trail = selectedIcao24 ? flightTrails[selectedIcao24] || [] : [];
  const maxIndex = Math.max(0, trail.length - 1);

  // Playback loop
  useEffect(() => {
    if (!isReplayPlaying || trail.length <= 1) return;

    const intervalTime = Math.max(200, 1000 / playbackSpeed);
    const interval = setInterval(() => {
      setReplayTimeIndex(
        replayTimeIndex >= maxIndex ? 0 : replayTimeIndex + 1
      );
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isReplayPlaying, replayTimeIndex, maxIndex, playbackSpeed, setReplayTimeIndex, trail.length]);

  if (!isReplayActive) return null;

  const currentSample = trail[replayTimeIndex] || trail[trail.length - 1];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-2xl bg-black/95 border border-[#222222] rounded-lg shadow-2xl backdrop-blur-md p-4 text-xs font-mono">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#222222] mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-white" />
          <span className="font-bold text-white uppercase tracking-wider">
            FLIGHT REPLAY: {selectedAc ? `${selectedAc.callsign} (${selectedAc.icao24.toUpperCase()})` : 'ALL TRACKED TARGETS'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#141414] text-white border border-[#222222]">
            {trail.length} SAMPLES
          </span>
        </div>
        <button
          onClick={() => {
            setIsReplayActive(false);
            setIsReplayPlaying(false);
          }}
          className="p-1 text-neutral-400 hover:text-white rounded cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {trail.length === 0 ? (
        <div className="py-4 text-center text-neutral-500">
          No recorded movement history for this target yet. Keep surveillance active to collect observations.
        </div>
      ) : (
        <>
          {/* Scrub Bar Slider */}
          <div className="space-y-1 mb-3">
            <input
              type="range"
              min={0}
              max={maxIndex}
              value={replayTimeIndex}
              onChange={(e) => setReplayTimeIndex(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>T0: {new Date(trail[0].timestamp * 1000).toLocaleTimeString()}</span>
              <span className="text-white font-semibold">
                Fix {replayTimeIndex + 1} of {trail.length} ({currentSample ? new Date(currentSample.timestamp * 1000).toLocaleTimeString() : ''})
              </span>
              <span>NOW: {new Date(trail[maxIndex].timestamp * 1000).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReplayTimeIndex(Math.max(0, replayTimeIndex - 1))}
                className="p-1.5 rounded bg-[#0A0A0A] hover:bg-[#1A1A1A] border border-[#222222] text-neutral-400 hover:text-white"
                title="Step Back"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsReplayPlaying(!isReplayPlaying)}
                className="px-3 py-1.5 rounded bg-white text-black font-bold hover:bg-neutral-200 flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {isReplayPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isReplayPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              <button
                onClick={() => setReplayTimeIndex(Math.min(maxIndex, replayTimeIndex + 1))}
                className="p-1.5 rounded bg-[#0A0A0A] hover:bg-[#1A1A1A] border border-[#222222] text-neutral-400 hover:text-white"
                title="Step Forward"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 ml-2 bg-[#0A0A0A] p-0.5 rounded border border-[#222222]">
                {[1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded text-[10px] cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-white text-black font-bold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Current sample details */}
            {currentSample && (
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-neutral-400">
                <span>POS: <strong className="text-white">{currentSample.lat.toFixed(4)}°, {currentSample.lon.toFixed(4)}°</strong></span>
                <span>ALT: <strong className="text-white">{currentSample.altitude ? `${Math.round(currentSample.altitude)}m` : '0m'}</strong></span>
                <span>SPD: <strong className="text-white">{currentSample.velocity ? `${Math.round(currentSample.velocity * 3.6)}km/h` : '0'}</strong></span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

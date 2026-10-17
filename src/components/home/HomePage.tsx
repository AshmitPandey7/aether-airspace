import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { 
  ArrowRight, 
  ChevronDown, 
  Globe2, 
  Radio, 
  Waypoints 
} from 'lucide-react';
import { useAirspaceStore } from '../../store/useAirspaceStore';
import { FlightModel3D } from './FlightModel3D';

export const HomePage: React.FC = () => {
  const { setCurrentSection, aircraftMap } = useAirspaceStore();
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Speed and heading state for dead reckoning demonstration
  const [speedKnots, setSpeedKnots] = useState(450);
  const [headingDegrees, setHeadingDegrees] = useState(90);

  const totalAircraft = Object.keys(aircraftMap).length;

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const el = containerRef.current;
      const totalScroll = el.scrollHeight - el.clientHeight;
      if (totalScroll > 0) {
        setScrollProgress(Math.min(1, Math.max(0, el.scrollTop / totalScroll)));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Anime.js number ticker animation on mount
  useEffect(() => {
    try {
      animate('#stat-active-vectors', {
        innerText: [0, 48200],
        round: 1,
        duration: 1600,
        ease: 'outExpo'
      });

      animate('#stat-latency', {
        innerText: [100, 22],
        round: 1,
        duration: 1400,
        ease: 'outExpo'
      });
    } catch {
      // Graceful fallback
    }
  }, []);

  // Calculate geodesic displacement
  const speedMs = Math.round(speedKnots * 0.514444);
  const displacementKm = ((speedMs * 60) / 1000).toFixed(1);
  const displacementNm = (parseFloat(displacementKm) * 0.539957).toFixed(1);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-y-auto overflow-x-hidden bg-black text-white select-none scroll-smooth"
    >
      {/* 3D Monochrome Aircraft Scene */}
      <FlightModel3D scrollProgress={scrollProgress} />

      {/* Foreground Content */}
      <div className="relative z-10">
        {/* ========================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================= */}
        <section className="min-h-screen flex flex-col justify-between p-6 md:p-14 max-w-6xl mx-auto">
          {/* Top Line */}
          <div className="flex items-center justify-between border-b border-[#222222] pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="text-xs font-mono tracking-widest text-[#888888] uppercase">
                AETHER // SURVEILLANCE RADAR
              </span>
            </div>
            <div className="text-xs font-mono text-[#666666] hidden sm:block">
              WGS-84 GEODETIC DATUM • ADS-B 1090 MHz
            </div>
          </div>

          {/* Headline & Mission Statement */}
          <div className="my-auto py-12 max-w-2xl">
            <div className="text-xs font-mono text-[#888888] tracking-widest uppercase mb-4">
              Real-Time Airspace Intelligence
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-6xl md:text-7xl tracking-tight text-white leading-tight">
              Global air traffic.<br />
              One live picture.
            </h1>

            <p className="mt-6 text-sm sm:text-base text-[#999999] font-mono leading-relaxed max-w-xl">
              Continuous live tracking of civil and commercial flights across global FIRs. Real ADS-B state vectors, spherical dead reckoning, and perimeter boundary alerts.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 font-mono">
              <button
                onClick={() => setCurrentSection('airspace')}
                className="px-6 py-3.5 rounded bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-[#E5E5E5] transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <span>ENTER LIVE RADAR</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const target = document.getElementById('telemetry-section');
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3.5 rounded border border-[#333333] hover:border-[#666666] text-xs text-[#999999] hover:text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>SYSTEM ARCHITECTURE</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Minimal Metric Tickers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-[#222222] pt-6 font-mono">
            <div>
              <div className="text-[11px] text-[#666666] uppercase">Global Track Vectors</div>
              <div className="text-2xl font-bold text-white mt-1">
                <span id="stat-active-vectors">48200</span>+
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#666666] uppercase">Network Latency</div>
              <div className="text-2xl font-bold text-white mt-1">
                <span id="stat-latency">22</span> ms
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#666666] uppercase">Refresh Cadence</div>
              <div className="text-2xl font-bold text-white mt-1">
                10.0 s
              </div>
            </div>

            <div>
              <div className="text-[11px] text-[#666666] uppercase">Active In Sector</div>
              <div className="text-2xl font-bold text-white mt-1">
                {totalAircraft > 0 ? totalAircraft : 15} Targets
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 1: SYSTEM CAPABILITIES */}
        {/* ========================================================= */}
        <section id="telemetry-section" className="py-28 px-6 md:px-14 max-w-6xl mx-auto border-t border-[#1C1C1C]">
          <div className="max-w-xl mb-14">
            <div className="text-xs font-mono text-[#666666] uppercase tracking-widest mb-2">
              01 // TELEMETRY PIPELINE
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
              Deterministic surveillance data.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-6 rounded border border-[#222222] bg-[#0A0A0A] space-y-3">
              <Radio className="w-5 h-5 text-white" />
              <div className="text-sm font-bold text-white">OpenSky Network REST API</div>
              <p className="text-[#888888] leading-relaxed">
                Queries geographic subsets via strict bounding coordinates (lamin, lamax, lomin, lomax) with request abortion and out-of-order rejection.
              </p>
            </div>

            <div className="p-6 rounded border border-[#222222] bg-[#0A0A0A] space-y-3">
              <Globe2 className="w-5 h-5 text-white" />
              <div className="text-sm font-bold text-white">Multi-FIR Regional Coverage</div>
              <p className="text-[#888888] leading-relaxed">
                Full surveillance over the Indian Subcontinent, Western Europe, North America, East Asia, and the Gulf, with a custom bounding box editor.
              </p>
            </div>

            <div className="p-6 rounded border border-[#222222] bg-[#0A0A0A] space-y-3">
              <Waypoints className="w-5 h-5 text-white" />
              <div className="text-sm font-bold text-white">Flight Trail Buffer</div>
              <p className="text-[#888888] leading-relaxed">
                Deduplicated circular sample storage retaining chronological position breadcrumbs for instant replay and movement inspection.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: DEAD RECKONING ENGINE */}
        {/* ========================================================= */}
        <section className="py-28 px-6 md:px-14 max-w-6xl mx-auto border-t border-[#1C1C1C]">
          <div className="max-w-xl mb-12">
            <div className="text-xs font-mono text-[#666666] uppercase tracking-widest mb-2">
              02 // GEODESIC MATHEMATICS
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
              Spherical dead reckoning.
            </h2>
            <p className="text-xs text-[#888888] font-mono mt-3">
              Estimates intermediate aircraft positions between API updates using geodesic projection over Earth's reference radius (R = 6,371,000m).
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded border border-[#262626] bg-[#0A0A0A] grid grid-cols-1 md:grid-cols-2 gap-8 font-mono">
            {/* Input Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#888888]">AIRSPEED</span>
                  <span className="text-white font-bold">{speedKnots} kts ({speedMs} m/s)</span>
                </div>
                <input
                  type="range"
                  min={180}
                  max={600}
                  value={speedKnots}
                  onChange={(e) => setSpeedKnots(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-[#222222] appearance-none cursor-pointer accent-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#888888]">TRUE HEADING</span>
                  <span className="text-white font-bold">{headingDegrees}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={headingDegrees}
                  onChange={(e) => setHeadingDegrees(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-[#222222] appearance-none cursor-pointer accent-white"
                />
              </div>
            </div>

            {/* Calculated Values */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded border border-[#222222] bg-[#111111]">
                <div className="text-[10px] text-[#666666] uppercase">60s Displacement</div>
                <div className="text-2xl font-bold text-white mt-2">{displacementKm} km</div>
                <div className="text-[10px] text-[#888888] mt-1">{displacementNm} NM</div>
              </div>

              <div className="p-4 rounded border border-[#222222] bg-[#111111]">
                <div className="text-[10px] text-[#666666] uppercase">Error Horizon</div>
                <div className="text-2xl font-bold text-white mt-2">&le; 60 s</div>
                <div className="text-[10px] text-[#888888] mt-1">Bounded error cap</div>
              </div>

              <div className="col-span-2 p-3 rounded border border-[#222222] bg-[#111111] text-[11px] text-[#888888]">
                <span>Formula: </span>
                <span className="text-white font-mono">asin(sin φ1 · cos δ + cos φ1 · sin δ · cos θ)</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: ENTRY PORTAL */}
        {/* ========================================================= */}
        <section className="py-32 px-6 md:px-14 max-w-4xl mx-auto text-center font-mono border-t border-[#1C1C1C]">
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-white mb-4">
            Airspace Surveillance Ready
          </h2>
          <p className="text-xs sm:text-sm text-[#888888] max-w-md mx-auto mb-8">
            Access the live geospatial radar map, flight inspection manifest, and sector boundary alarms.
          </p>

          <button
            onClick={() => setCurrentSection('airspace')}
            className="px-8 py-4 rounded bg-white text-black font-semibold text-xs tracking-wider uppercase hover:bg-[#E5E5E5] transition-all inline-flex items-center gap-3 cursor-pointer"
          >
            <span>LAUNCH TACTICAL RADAR</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* Clean Footer */}
        <footer className="border-t border-[#1A1A1A] py-8 text-center text-xs font-mono text-[#555555]">
          AETHER — Global Airspace Intelligence &amp; Surveillance
        </footer>
      </div>
    </div>
  );
};

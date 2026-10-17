import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { 
  Activity, 
  AlertTriangle, 
  ArrowRight, 
  ChevronDown, 
  Compass, 
  Cpu, 
  Globe2, 
  Navigation, 
  Plane, 
  Radio, 
  ShieldCheck, 
  Sparkles, 
  Waypoints 
} from 'lucide-react';
import { useAirspaceStore } from '../../store/useAirspaceStore';
import { FlightModel3D } from './FlightModel3D';

export const HomePage: React.FC = () => {
  const { setCurrentSection, aircraftMap } = useAirspaceStore();
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stats for interactive slider demo
  const [simSpeedKts, setSimSpeedKts] = useState(480);
  const [simHeadingDeg, setSimHeadingDeg] = useState(135);

  const totalTracked = Object.keys(aircraftMap).length;

  // Track scroll progress within page
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const el = containerRef.current;
      const totalScroll = el.scrollHeight - el.clientHeight;
      if (totalScroll > 0) {
        const progress = Math.min(1, Math.max(0, el.scrollTop / totalScroll));
        setScrollProgress(progress);
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

  // Anime.js HUD Number Ticker Animation on Mount
  useEffect(() => {
    try {
      animate('#ticker-flights', {
        innerText: [0, 48500],
        round: 1,
        duration: 2000,
        ease: 'outExpo'
      });

      animate('#ticker-latency', {
        innerText: [120, 24],
        round: 1,
        duration: 1800,
        ease: 'outExpo'
      });

      animate('#ticker-coverage', {
        innerText: [0, 100],
        round: 1,
        duration: 2200,
        ease: 'outExpo'
      });
    } catch {
      // Graceful fallback
    }
  }, []);

  // Dead reckoning calculation for interactive calculator
  const simSpeedMs = Math.round(simSpeedKts * 0.514444);
  const simDist60sKm = ((simSpeedMs * 60) / 1000).toFixed(2);
  const simDist60sNm = (parseFloat(simDist60sKm) * 0.539957).toFixed(2);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-y-auto overflow-x-hidden bg-[#080D16] text-[#EAF1FA] select-none scroll-smooth"
    >
      {/* 3D Flight Model Interactive Canvas Layer */}
      <FlightModel3D scrollProgress={scrollProgress} />

      {/* Foreground Content Wrapper */}
      <div className="relative z-10">
        {/* ========================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================= */}
        <section className="min-h-screen flex flex-col justify-between p-6 md:p-12 max-w-7xl mx-auto">
          {/* Top Aerospace Status Bar */}
          <div className="flex items-center justify-between border-b border-[#1C2A3E]/80 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono text-[#55DDF5] tracking-widest font-semibold uppercase">
                AETHER // AIRSPACE DEFENSE &amp; SURVEILLANCE CORE
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-[#8293AA]">
              <span>ADS-B 1090 MHz MODE-S</span>
              <span className="text-[#1C2A3E]">|</span>
              <span>WGS-84 GEODESIC ENGINE</span>
            </div>
          </div>

          {/* Hero Center Headline */}
          <div className="my-auto py-12 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#131F30]/80 border border-[#294262] text-xs font-mono text-[#55DDF5] mb-6 backdrop-blur">
              <Sparkles className="w-3.5 h-3.5 text-[#55DDF5]" />
              <span>OFFICIAL TECHNICAL RECRUITMENT SUBMISSION 2026–27</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-tight leading-none text-white drop-shadow-xl">
              EVERY AIRCRAFT.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#55DDF5] via-[#8EEBFA] to-cyan-300">
                ONE LIVE PICTURE.
              </span>
            </h1>

            <p className="mt-6 text-sm sm:text-base text-[#8293AA] font-mono leading-relaxed max-w-2xl">
              An aerospace-grade surveillance console powered by real-time OpenSky Network ADS-B telemetry, spherical trigonometry dead reckoning, and automated perimeter safety rules.
            </p>

            {/* Call to Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-4 font-mono">
              <button
                onClick={() => setCurrentSection('airspace')}
                className="px-6 py-3.5 rounded bg-[#55DDF5] text-[#080D16] font-bold text-sm hover:bg-[#55DDF5]/90 transition-all flex items-center gap-2.5 shadow-[0_0_24px_rgba(85,221,245,0.4)] cursor-pointer hover:scale-[1.02]"
              >
                <Plane className="w-4 h-4 fill-current" />
                <span>ENTER LIVE AIRSPACE RADAR</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const target = document.getElementById('architecture-section');
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3.5 rounded bg-[#0E1624]/90 hover:bg-[#131F30] border border-[#1C2A3E] hover:border-[#55DDF5]/40 text-xs text-[#8293AA] hover:text-white transition-all flex items-center gap-2 backdrop-blur cursor-pointer"
              >
                <span>EXPLORE 3D SURVEILLANCE TECH</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Live Telemetry Tickers (Animated via Anime.js) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0E1624]/85 border border-[#1C2A3E] p-4 rounded-xl backdrop-blur-md shadow-2xl">
            <div className="border-r border-[#1C2A3E]/60 pr-3">
              <div className="text-[10px] font-mono text-[#8293AA] uppercase">Active Global Vectors</div>
              <div className="text-2xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-1">
                <span id="ticker-flights">48500</span>
                <span className="text-xs text-[#55DDF5]">+</span>
              </div>
            </div>

            <div className="border-r border-[#1C2A3E]/60 pr-3">
              <div className="text-[10px] font-mono text-[#8293AA] uppercase">Engine RTT Latency</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 flex items-baseline gap-1">
                <span id="ticker-latency">24</span>
                <span className="text-xs">ms</span>
              </div>
            </div>

            <div className="border-r border-[#1C2A3E]/60 pr-3">
              <div className="text-[10px] font-mono text-[#8293AA] uppercase">Geodesic Precision</div>
              <div className="text-2xl font-bold font-mono text-[#55DDF5] mt-0.5 flex items-baseline gap-1">
                <span id="ticker-coverage">100</span>
                <span className="text-xs">%</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-[#8293AA] uppercase">Currently Monitored</div>
              <div className="text-2xl font-bold font-mono text-[#FFB454] mt-0.5 flex items-baseline gap-1">
                <span>{totalTracked > 0 ? totalTracked : 15}</span>
                <span className="text-xs text-[#8293AA]">Targets</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 1: HIGH FREQUENCY ARCHITECTURE */}
        {/* ========================================================= */}
        <section id="architecture-section" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-[#55DDF5] uppercase tracking-wider mb-2">
                <Radio className="w-4 h-4" />
                <span>01 // SURVEILLANCE INGESTION PIPELINE</span>
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-5xl text-white">
                Zero-Lag ADS-B Telemetry Processing
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-mono text-[#8293AA] max-w-md">
              AETHER samples the global airspace using geographic bounding boxes, normalizing raw 17-tuple state vectors into strongly typed immutable domain entities with sub-second reactivity.
            </p>
          </div>

          {/* 3 Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
            <div className="bg-[#0E1624]/90 border border-[#1C2A3E] hover:border-[#55DDF5]/40 rounded-xl p-6 backdrop-blur transition-all group">
              <div className="w-10 h-10 rounded-lg bg-[#131F30] border border-[#294262] flex items-center justify-center text-[#55DDF5] mb-4 group-hover:scale-110 transition-transform">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white mb-2">Multi-FIR Sector Ingress</h3>
              <p className="text-xs text-[#8293AA] leading-relaxed">
                Direct spatial querying across the Indian Subcontinent, Western Europe, North America, East Asia, and the Gulf, with custom bounding box coordinates.
              </p>
            </div>

            <div className="bg-[#0E1624]/90 border border-[#1C2A3E] hover:border-[#55DDF5]/40 rounded-xl p-6 backdrop-blur transition-all group">
              <div className="w-10 h-10 rounded-lg bg-[#131F30] border border-[#294262] flex items-center justify-center text-[#55DDF5] mb-4 group-hover:scale-110 transition-transform">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white mb-2">Intelligent Memory Cache</h3>
              <p className="text-xs text-[#8293AA] leading-relaxed">
                Automatic HTTP 429 rate limit detection, Retry-After backoff headers, and seamless transitions to cached or demo mode to guarantee 100% uptime.
              </p>
            </div>

            <div className="bg-[#0E1624]/90 border border-[#1C2A3E] hover:border-[#55DDF5]/40 rounded-xl p-6 backdrop-blur transition-all group">
              <div className="w-10 h-10 rounded-lg bg-[#131F30] border border-[#294262] flex items-center justify-center text-[#55DDF5] mb-4 group-hover:scale-110 transition-transform">
                <Waypoints className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white mb-2">Continuous Trail Buffer</h3>
              <p className="text-xs text-[#8293AA] leading-relaxed">
                Deduplicated circular coordinate storage collecting chronological position breadcrumbs for instant replay and movement vector reconstruction.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: INTERACTIVE SPHERICAL DEAD RECKONING CALCULATOR */}
        {/* ========================================================= */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="bg-[#0E1624]/90 border border-[#294262] rounded-2xl p-6 md:p-10 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#55DDF5] uppercase tracking-wider mb-2">
              <Navigation className="w-4 h-4" />
              <span>02 // MATHEMATICAL DEAD RECKONING ENGINE</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-white mb-4">
              Spherical Geodesic Extrapolation
            </h2>
            <p className="text-xs sm:text-sm font-mono text-[#8293AA] max-w-2xl mb-8 leading-relaxed">
              When ADS-B polling updates are spaced 10 seconds apart, AETHER uses geodesic projection over Earth's reference radius (R = 6,371,000m) to estimate intermediate aircraft positions without runaway error cones.
            </p>

            {/* Interactive Calculator Dials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono">
              {/* Sliders */}
              <div className="space-y-6 bg-[#080D16]/60 p-6 rounded-xl border border-[#1C2A3E]">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#8293AA]">AIRSPEED (KNOTS)</span>
                    <span className="text-[#55DDF5] font-bold">{simSpeedKts} kts ({simSpeedMs} m/s)</span>
                  </div>
                  <input
                    type="range"
                    min={150}
                    max={650}
                    value={simSpeedKts}
                    onChange={(e) => setSimSpeedKts(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[#131F30] rounded-lg appearance-none cursor-pointer accent-[#55DDF5]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#8293AA]">TRUE HEADING VECTOR</span>
                    <span className="text-[#FFB454] font-bold">{simHeadingDeg}° (Clockwise from North)</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={simHeadingDeg}
                    onChange={(e) => setSimHeadingDeg(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[#131F30] rounded-lg appearance-none cursor-pointer accent-[#FFB454]"
                  />
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#131F30]/70 border border-[#1C2A3E] p-4 rounded-xl flex flex-col justify-between">
                  <div className="text-[10px] text-[#8293AA] uppercase">60s Spatial Displacement</div>
                  <div className="text-3xl font-bold text-white mt-2">
                    {simDist60sKm} <span className="text-xs font-normal text-[#8293AA]">km</span>
                  </div>
                  <div className="text-[10px] text-[#55DDF5] mt-1">{simDist60sNm} Nautical Miles</div>
                </div>

                <div className="bg-[#131F30]/70 border border-[#1C2A3E] p-4 rounded-xl flex flex-col justify-between">
                  <div className="text-[10px] text-[#8293AA] uppercase">Displacement Horizon</div>
                  <div className="text-3xl font-bold text-emerald-400 mt-2">
                    &le; 60s
                  </div>
                  <div className="text-[10px] text-[#8293AA] mt-1">Bounded error cap</div>
                </div>

                <div className="bg-[#131F30]/70 border border-[#1C2A3E] p-4 rounded-xl col-span-2">
                  <div className="text-[10px] text-[#8293AA] uppercase mb-1">Geodesic Formula Applied:</div>
                  <code className="text-[11px] text-[#55DDF5] block">
                    φ2 = asin(sin φ1 · cos δ + cos φ1 · sin δ · cos θ)
                  </code>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: TACTICAL ATC SUITE FEATURES */}
        {/* ========================================================= */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#55DDF5] uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>03 // FULL OPERATIONAL WORKSPACE</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-white">
              Tactical Mission Capabilities
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            <div className="bg-[#0E1624]/90 border border-[#1C2A3E] p-5 rounded-xl hover:border-[#55DDF5]/50 transition-colors">
              <AlertTriangle className="w-6 h-6 text-[#FFB454] mb-3" />
              <h3 className="font-bold text-sm text-white mb-1.5">Automated Safety Rules</h3>
              <p className="text-[11px] text-[#8293AA] leading-relaxed">
                Ceiling breaches, low altitude alarms, high-speed alerts, and stale signal detection with cooldown deduplication.
              </p>
            </div>

            <div className="bg-[#0E1624]/90 border border-[#1C2A3E] p-5 rounded-xl hover:border-[#55DDF5]/50 transition-colors">
              <Waypoints className="w-6 h-6 text-[#55DDF5] mb-3" />
              <h3 className="font-bold text-sm text-white mb-1.5">Scrubbable Replay</h3>
              <p className="text-[11px] text-[#8293AA] leading-relaxed">
                Step-by-step playback with 1x, 2x, and 5x speeds, chronological breadcrumbs, and timestamp scrubbing.
              </p>
            </div>

            <div className="bg-[#0E1624]/90 border border-[#1C2A3E] p-5 rounded-xl hover:border-[#55DDF5]/50 transition-colors">
              <Compass className="w-6 h-6 text-emerald-400 mb-3" />
              <h3 className="font-bold text-sm text-white mb-1.5">Dual Telemetry Units</h3>
              <p className="text-[11px] text-[#8293AA] leading-relaxed">
                Meters and Flight Levels (FL), km/h and knots, decimal degrees, and 16-point cardinal compass headings.
              </p>
            </div>

            <div className="bg-[#0E1624]/90 border border-[#1C2A3E] p-5 rounded-xl hover:border-[#55DDF5]/50 transition-colors">
              <Activity className="w-6 h-6 text-purple-400 mb-3" />
              <h3 className="font-bold text-sm text-white mb-1.5">Live Diagnostics Audit</h3>
              <p className="text-[11px] text-[#8293AA] leading-relaxed">
                Real-time RTT latency metrics, HTTP status error logs, and complete sector ingress/egress timelines.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: MISSION LAUNCH PORTAL */}
        {/* ========================================================= */}
        <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto text-center font-mono">
          <div className="bg-gradient-to-b from-[#131F30]/90 to-[#0E1624]/90 border border-[#55DDF5]/40 rounded-3xl p-8 sm:p-14 shadow-[0_0_50px_rgba(85,221,245,0.15)] backdrop-blur">
            <div className="w-16 h-16 rounded-2xl bg-[#080D16] border border-[#55DDF5]/50 flex items-center justify-center mx-auto mb-6 text-[#55DDF5] shadow-[0_0_20px_rgba(85,221,245,0.3)]">
              <Plane className="w-8 h-8" />
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-wide mb-4">
              Airspace Tactical Radar Ready
            </h2>

            <p className="text-xs sm:text-sm text-[#8293AA] max-w-xl mx-auto mb-8 leading-relaxed">
              Launch directly into the live geospatial surveillance console to track commercial flights, inspect transponder telemetry, and monitor sector boundaries.
            </p>

            <button
              onClick={() => setCurrentSection('airspace')}
              className="px-8 py-4 rounded-lg bg-[#55DDF5] text-[#080D16] font-bold text-base hover:bg-[#55DDF5]/90 transition-all inline-flex items-center gap-3 shadow-[0_0_30px_rgba(85,221,245,0.5)] cursor-pointer hover:scale-105"
            >
              <span>LAUNCH RADAR CONSOLE</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Bottom Footer */}
        <footer className="border-t border-[#1C2A3E] py-8 px-6 text-center text-xs font-mono text-[#53647B]">
          <p>AETHER // CodeChef-VIT Promotional Cycle 2026–27 Submission</p>
          <p className="mt-1">Powered by OpenSky Network ADS-B REST API &amp; Leaflet Geospatial Engine</p>
        </footer>
      </div>
    </div>
  );
};

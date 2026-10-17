import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronDown, 
  Clock, 
  Globe, 
  Layers, 
  Plane, 
  Radio, 
  RefreshCw, 
  Settings, 
  SlidersHorizontal,
  Sparkles,
  WifiOff 
} from 'lucide-react';
import { PRESET_REGIONS } from '../../constants/regions';
import { useAirspaceStore } from '../../store/useAirspaceStore';
import type { NavSection } from '../../types';

export const Header: React.FC = () => {
  const {
    currentSection,
    setCurrentSection,
    selectedRegion,
    setSelectedRegion,
    dataMode,
    setDataMode,
    aircraftMap,
    isLoading,
    secondsUntilNextPoll,
    pollingIntervalSec,
    setPollingIntervalSec,
    fetchAirspaceData,
    activeAlerts
  } = useAirspaceStore();

  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const totalAircraft = Object.keys(aircraftMap).length;
  const unackAlertsCount = activeAlerts.filter(a => !a.acknowledged).length;

  const getStatusBadge = () => {
    switch (dataMode) {
      case 'LIVE':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-medium shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE ADSB</span>
          </div>
        );
      case 'DELAYED':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/70 border border-amber-500/40 text-amber-400 text-xs font-mono font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>DELAYED</span>
          </div>
        );
      case 'DEMO':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/70 border border-[#55DDF5]/40 text-[#55DDF5] text-xs font-mono font-medium shadow-[0_0_10px_rgba(85,221,245,0.2)]">
            <Layers className="w-3.5 h-3.5" />
            <span>DEMO REPLAY</span>
          </div>
        );
      case 'OFFLINE':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/70 border border-rose-500/40 text-rose-400 text-xs font-mono font-medium">
            <WifiOff className="w-3.5 h-3.5" />
            <span>OFFLINE</span>
          </div>
        );
    }
  };

  const navItems: { id: NavSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: '3D Overview', icon: <Sparkles className="w-4 h-4 text-[#55DDF5]" /> },
    { id: 'airspace', label: 'Live Airspace', icon: <Plane className="w-4 h-4" /> },
    { id: 'history', label: 'Flight History & Replay', icon: <Clock className="w-4 h-4" /> },
    { id: 'alerts', label: 'Sector Alerts', icon: <AlertTriangle className="w-4 h-4" />, badge: unackAlertsCount },
    { id: 'diagnostics', label: 'Diagnostics', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <header className="h-14 bg-[#0E1624] border-b border-[#1C2A3E] px-4 flex items-center justify-between z-30 select-none relative">
      {/* Brand & Wordmark */}
      <div className="flex items-center gap-6">
        <button 
          onClick={() => setCurrentSection('home')}
          className="flex items-center gap-3 cursor-pointer text-left focus:outline-none"
          title="Return to 3D Overview"
        >
          <div className="relative w-8 h-8 rounded bg-[#131F30] border border-[#294262] flex items-center justify-center shadow-inner overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(85,221,245,0.2)_0%,transparent_70%)]" />
            <div className="w-4 h-4 rounded-full border border-[#55DDF5]/40 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#55DDF5] shadow-[0_0_6px_#55DDF5]" />
            </div>
            <div className="absolute w-full h-[1px] bg-[#55DDF5]/20 radar-sweep-beam" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-display tracking-widest font-bold text-lg text-white">AETHER</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#131F30] text-[#55DDF5] border border-[#1C2A3E]">
                v2.6
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#8293AA] tracking-wider hidden sm:block">
              AIRSPACE INTELLIGENCE &amp; SURVEILLANCE
            </p>
          </div>
        </button>

        {/* Region Selector */}
        <div className="relative">
          <button
            onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#131F30] hover:bg-[#1C2A3E] border border-[#1C2A3E] hover:border-[#294262] text-xs font-mono text-[#EAF1FA] transition-all cursor-pointer"
            title="Change monitored geographic sector"
          >
            <Globe className="w-3.5 h-3.5 text-[#55DDF5]" />
            <span className="font-semibold">{selectedRegion.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8293AA]" />
          </button>

          {isRegionDropdownOpen && (
            <div className="absolute left-0 mt-1 w-64 bg-[#0E1624] border border-[#294262] rounded-md shadow-2xl py-1 z-50 backdrop-blur-md">
              <div className="px-3 py-1.5 border-b border-[#1C2A3E] text-[10px] font-mono text-[#8293AA] uppercase tracking-wider">
                Select Monitored Sector
              </div>
              {PRESET_REGIONS.map((region) => (
                <button
                  key={region.id}
                  onClick={() => {
                    setSelectedRegion(region);
                    setIsRegionDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-mono flex flex-col transition-colors cursor-pointer ${
                    region.id === selectedRegion.id
                      ? 'bg-[#131F30] text-[#55DDF5] font-semibold border-l-2 border-[#55DDF5]'
                      : 'text-[#8293AA] hover:bg-[#131F30]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{region.name}</span>
                    {region.id === selectedRegion.id && <CheckCircle2 className="w-3 h-3 text-[#55DDF5]" />}
                  </div>
                  <span className="text-[10px] text-[#53647B] truncate">{region.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle Navigation Tabs */}
      <nav className="hidden lg:flex items-center gap-1 bg-[#080D16]/80 p-1 rounded-lg border border-[#1C2A3E]">
        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentSection(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-[#131F30] text-[#55DDF5] shadow-[0_0_12px_rgba(85,221,245,0.15)] border border-[#55DDF5]/30'
                  : 'text-[#8293AA] hover:text-[#EAF1FA] hover:bg-[#131F30]/40'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Controls & Telemetry */}
      <div className="flex items-center gap-3">
        {/* Tracked Count */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#131F30]/80 border border-[#1C2A3E] text-xs font-mono">
          <Plane className="w-3.5 h-3.5 text-[#55DDF5]" />
          <span className="text-[#8293AA]">TRACKED:</span>
          <span className="text-white font-bold">{totalAircraft}</span>
        </div>

        {/* Status Badge */}
        {getStatusBadge()}

        {/* Polling countdown & refresh button */}
        <div className="flex items-center gap-1 bg-[#131F30] border border-[#1C2A3E] rounded p-0.5">
          <button
            onClick={() => fetchAirspaceData()}
            disabled={isLoading}
            className="p-1.5 hover:bg-[#1C2A3E] text-[#8293AA] hover:text-[#55DDF5] rounded transition-all cursor-pointer disabled:opacity-50"
            title="Force immediate airspace scan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#55DDF5]' : ''}`} />
          </button>
          <span 
            className="text-[10px] font-mono text-[#8293AA] px-1.5 cursor-pointer hover:text-white"
            title={`Auto-refreshes every ${pollingIntervalSec}s. Next in ${secondsUntilNextPoll}s.`}
          >
            {secondsUntilNextPoll}s
          </span>
        </div>

        {/* Mode / Quick Settings Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-1.5 rounded bg-[#131F30] hover:bg-[#1C2A3E] border border-[#1C2A3E] text-[#8293AA] hover:text-white transition-colors cursor-pointer"
            title="Airspace configuration"
          >
            <Settings className="w-4 h-4" />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0E1624] border border-[#294262] rounded-md shadow-2xl p-3 z-50 text-xs font-mono">
              <div className="font-semibold text-white border-b border-[#1C2A3E] pb-2 mb-3 flex items-center justify-between">
                <span>SYSTEM PREFERENCES</span>
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#55DDF5]" />
              </div>

              {/* Data Mode Switch */}
              <div className="mb-3">
                <label className="text-[11px] text-[#8293AA] block mb-1">DATA FEED MODE</label>
                <div className="grid grid-cols-2 gap-1.5 bg-[#080D16] p-1 rounded border border-[#1C2A3E]">
                  <button
                    onClick={() => {
                      setDataMode('LIVE');
                      setIsSettingsOpen(false);
                    }}
                    className={`py-1 text-center rounded transition-colors cursor-pointer ${
                      dataMode === 'LIVE'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-semibold'
                        : 'text-[#8293AA] hover:text-white'
                    }`}
                  >
                    LIVE OPENSKY
                  </button>
                  <button
                    onClick={() => {
                      setDataMode('DEMO');
                      setIsSettingsOpen(false);
                    }}
                    className={`py-1 text-center rounded transition-colors cursor-pointer ${
                      dataMode === 'DEMO'
                        ? 'bg-cyan-950 text-[#55DDF5] border border-[#55DDF5]/40 font-semibold'
                        : 'text-[#8293AA] hover:text-white'
                    }`}
                  >
                    DEMO SIM
                  </button>
                </div>
              </div>

              {/* Polling Interval */}
              <div>
                <label className="text-[11px] text-[#8293AA] block mb-1">POLL FREQUENCY</label>
                <div className="grid grid-cols-4 gap-1">
                  {[5, 10, 15, 30].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => {
                        setPollingIntervalSec(sec);
                        setIsSettingsOpen(false);
                      }}
                      className={`py-1 rounded text-center transition-colors cursor-pointer ${
                        pollingIntervalSec === sec
                          ? 'bg-[#131F30] text-[#55DDF5] border border-[#55DDF5]/40 font-bold'
                          : 'bg-[#080D16] text-[#8293AA] hover:text-white border border-[#1C2A3E]'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-[#53647B] mt-1.5">
                  OpenSky limits anonymous IP requests to ~10s minimum.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

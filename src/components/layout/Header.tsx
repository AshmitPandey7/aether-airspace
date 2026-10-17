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
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111111] border border-[#333333] text-white text-xs font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>LIVE ADSB</span>
          </div>
        );
      case 'DELAYED':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111111] border border-[#333333] text-[#AAAAAA] text-xs font-mono font-medium">
            <Radio className="w-3.5 h-3.5" />
            <span>DELAYED</span>
          </div>
        );
      case 'DEMO':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111111] border border-[#444444] text-white text-xs font-mono font-medium">
            <Layers className="w-3.5 h-3.5" />
            <span>DEMO SIM</span>
          </div>
        );
      case 'OFFLINE':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111111] border border-[#333333] text-[#777777] text-xs font-mono font-medium">
            <WifiOff className="w-3.5 h-3.5" />
            <span>OFFLINE</span>
          </div>
        );
    }
  };

  const navItems: { id: NavSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Overview', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'airspace', label: 'Airspace Radar', icon: <Plane className="w-3.5 h-3.5" /> },
    { id: 'history', label: 'History & Replay', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="w-3.5 h-3.5" />, badge: unackAlertsCount },
    { id: 'diagnostics', label: 'Diagnostics', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="h-14 bg-black border-b border-[#222222] px-4 flex items-center justify-between z-30 select-none relative font-mono">
      {/* Brand & Wordmark */}
      <div className="flex items-center gap-6">
        <button 
          onClick={() => setCurrentSection('home')}
          className="flex items-center gap-3 cursor-pointer text-left focus:outline-none"
          title="Return to Overview"
        >
          <div className="w-8 h-8 rounded bg-[#111111] border border-[#333333] flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full border border-white/60 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wider text-white">AETHER</span>
              <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-[#1A1A1A] text-[#888888] border border-[#2E2E2E]">
                v2.6
              </span>
            </div>
            <p className="text-[10px] text-[#666666] tracking-wider hidden sm:block">
              AIRSPACE INTELLIGENCE
            </p>
          </div>
        </button>

        {/* Region Selector */}
        <div className="relative">
          <button
            onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#0E0E0E] hover:bg-[#161616] border border-[#262626] hover:border-[#444444] text-xs text-white transition-all cursor-pointer"
            title="Change monitored geographic sector"
          >
            <Globe className="w-3.5 h-3.5 text-white" />
            <span className="font-medium">{selectedRegion.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#666666]" />
          </button>

          {isRegionDropdownOpen && (
            <div className="absolute left-0 mt-1 w-64 bg-[#0A0A0A] border border-[#333333] rounded-md shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 border-b border-[#222222] text-[10px] text-[#666666] uppercase tracking-wider">
                Select Monitored Sector
              </div>
              {PRESET_REGIONS.map((region) => (
                <button
                  key={region.id}
                  onClick={() => {
                    setSelectedRegion(region);
                    setIsRegionDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex flex-col transition-colors cursor-pointer ${
                    region.id === selectedRegion.id
                      ? 'bg-[#1A1A1A] text-white font-semibold border-l-2 border-white'
                      : 'text-[#888888] hover:bg-[#141414] hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{region.name}</span>
                    {region.id === selectedRegion.id && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-[10px] text-[#555555] truncate">{region.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle Navigation Tabs */}
      <nav className="hidden lg:flex items-center gap-1 bg-[#0A0A0A] p-1 rounded-md border border-[#222222]">
        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentSection(item.id)}
              className={`flex items-center gap-2 px-3 py-1 rounded text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1E1E1E] text-white font-semibold border border-[#333333]'
                  : 'text-[#888888] hover:text-white hover:bg-[#141414]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white text-black font-bold">
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
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#0E0E0E] border border-[#222222] text-xs">
          <Plane className="w-3.5 h-3.5 text-white" />
          <span className="text-[#666666]">TRACKED:</span>
          <span className="text-white font-bold">{totalAircraft}</span>
        </div>

        {/* Status Badge */}
        {getStatusBadge()}

        {/* Polling countdown & refresh button */}
        <div className="flex items-center gap-1 bg-[#0E0E0E] border border-[#222222] rounded p-0.5">
          <button
            onClick={() => fetchAirspaceData()}
            disabled={isLoading}
            className="p-1 hover:bg-[#1A1A1A] text-[#888888] hover:text-white rounded transition-all cursor-pointer disabled:opacity-50"
            title="Scan sector"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-white' : ''}`} />
          </button>
          <span 
            className="text-[10px] text-[#666666] px-1.5"
            title={`Auto-refreshes every ${pollingIntervalSec}s. Next in ${secondsUntilNextPoll}s.`}
          >
            {secondsUntilNextPoll}s
          </span>
        </div>

        {/* Settings Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-1.5 rounded bg-[#0E0E0E] hover:bg-[#1A1A1A] border border-[#222222] text-[#888888] hover:text-white transition-colors cursor-pointer"
            title="Preferences"
          >
            <Settings className="w-4 h-4" />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0A0A0A] border border-[#333333] rounded-md shadow-2xl p-3 z-50 text-xs">
              <div className="font-semibold text-white border-b border-[#222222] pb-2 mb-3 flex items-center justify-between">
                <span>SYSTEM PREFERENCES</span>
                <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
              </div>

              {/* Data Mode Switch */}
              <div className="mb-3">
                <label className="text-[11px] text-[#888888] block mb-1">DATA FEED MODE</label>
                <div className="grid grid-cols-2 gap-1.5 bg-[#000000] p-1 rounded border border-[#222222]">
                  <button
                    onClick={() => {
                      setDataMode('LIVE');
                      setIsSettingsOpen(false);
                    }}
                    className={`py-1 text-center rounded transition-colors cursor-pointer ${
                      dataMode === 'LIVE'
                        ? 'bg-[#222222] text-white border border-[#444444] font-semibold'
                        : 'text-[#888888] hover:text-white'
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
                        ? 'bg-[#222222] text-white border border-[#444444] font-semibold'
                        : 'text-[#888888] hover:text-white'
                    }`}
                  >
                    DEMO SIM
                  </button>
                </div>
              </div>

              {/* Polling Interval */}
              <div>
                <label className="text-[11px] text-[#888888] block mb-1">POLL FREQUENCY</label>
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
                          ? 'bg-[#222222] text-white border border-[#444444] font-bold'
                          : 'bg-[#000000] text-[#888888] hover:text-white border border-[#222222]'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

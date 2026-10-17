import React, { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AircraftInspector } from './components/aircraft/AircraftInspector';
import { AlertsPanel } from './components/alerts/AlertsPanel';
import { DiagnosticsPanel } from './components/diagnostics/DiagnosticsPanel';
import { ReplayController } from './components/history/ReplayController';
import { Header } from './components/layout/Header';
import { LeftPanel } from './components/layout/LeftPanel';
import { AirspaceMap } from './components/map/AirspaceMap';
import { useAirspaceStore } from './store/useAirspaceStore';
import { animatePanelEntrance } from './utils/motion';

export const App: React.FC = () => {
  const {
    currentSection,
    fetchAirspaceData,
    tickTimer,
    runDeadReckoningTick,
    selectedIcao24,
    setSelectedIcao24,
    isReplayActive,
    setIsReplayActive
  } = useAirspaceStore();

  const [isMobileLeftPanelOpen, setIsMobileLeftPanelOpen] = useState(false);
  const appContainerRef = useRef<HTMLDivElement>(null);

  // Initial fetch and lifecycle tickers
  useEffect(() => {
    // Initial fetch
    fetchAirspaceData();

    // 1-second countdown and polling trigger
    const pollInterval = setInterval(() => {
      tickTimer();
    }, 1000);

    // 1-second dead reckoning estimation tick
    const deadReckoningInterval = setInterval(() => {
      runDeadReckoningTick();
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(deadReckoningInterval);
    };
  }, [fetchAirspaceData, tickTimer, runDeadReckoningTick]);

  // Entrance animation on mount
  useEffect(() => {
    if (appContainerRef.current) {
      animatePanelEntrance(appContainerRef.current);
    }
  }, []);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes inspector or replay
      if (e.key === 'Escape') {
        if (isReplayActive) {
          setIsReplayActive(false);
        } else if (selectedIcao24) {
          setSelectedIcao24(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIcao24, isReplayActive, setIsReplayActive, setSelectedIcao24]);

  return (
    <div ref={appContainerRef} className="h-screen w-screen flex flex-col overflow-hidden bg-[#080D16] text-[#EAF1FA]">
      {/* Persistent Aerospace Operational Header */}
      <Header />

      {/* Main Workspace Body */}
      <main className="flex-1 flex overflow-hidden relative">
        {currentSection === 'alerts' && <AlertsPanel />}
        {currentSection === 'diagnostics' && <DiagnosticsPanel />}

        {(currentSection === 'airspace' || currentSection === 'history') && (
          <>
            {/* Desktop Left Operational Panel */}
            <div className="hidden lg:block h-full">
              <LeftPanel />
            </div>

            {/* Mobile Drawer Toggle Button */}
            <button
              onClick={() => setIsMobileLeftPanelOpen(!isMobileLeftPanelOpen)}
              className="lg:hidden absolute top-3 left-16 z-30 p-2 rounded bg-[#0E1624]/90 border border-[#1C2A3E] text-[#55DDF5] shadow-lg backdrop-blur cursor-pointer"
              title="Toggle Aircraft Manifest & Filters"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Mobile / Tablet Collapsible Left Drawer */}
            {isMobileLeftPanelOpen && (
              <div className="lg:hidden fixed inset-y-14 left-0 w-80 z-40 bg-[#0E1624] border-r border-[#1C2A3E] shadow-2xl flex flex-col">
                <div className="p-2 border-b border-[#1C2A3E] flex justify-end">
                  <button
                    onClick={() => setIsMobileLeftPanelOpen(false)}
                    className="p-1 text-[#8293AA] hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <LeftPanel />
                </div>
              </div>
            )}

            {/* Center Geographic Airspace Map */}
            <div className="flex-1 h-full relative">
              <AirspaceMap />
              <ReplayController />
            </div>

            {/* Right Selected Aircraft Inspector */}
            <AircraftInspector />
          </>
        )}
      </main>
    </div>
  );
};

export default App;

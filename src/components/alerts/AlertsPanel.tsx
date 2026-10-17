import React from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Bell, 
  CheckCircle2, 
  Clock, 
  Info, 
  ShieldAlert, 
  Sliders, 
  Trash2, 
  X 
} from 'lucide-react';
import { useAirspaceStore } from '../../store/useAirspaceStore';

export const AlertsPanel: React.FC = () => {
  const {
    alertRules,
    toggleAlertRule,
    updateAlertRuleThreshold,
    activeAlerts,
    dismissAlert,
    clearAllAlerts,
    setSelectedIcao24,
    setCurrentSection
  } = useAirspaceStore();

  const getSeverityBadge = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/80 text-rose-400 border border-rose-500/40 font-semibold flex items-center gap-1">
            <AlertOctagon className="w-3 h-3" /> CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/80 text-amber-400 border border-amber-500/40 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> WARNING
          </span>
        );
      case 'info':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-[#55DDF5] border border-[#55DDF5]/40 font-semibold flex items-center gap-1">
            <Info className="w-3 h-3" /> NOTICE
          </span>
        );
    }
  };

  return (
    <div className="flex-1 bg-[#080D16] p-6 overflow-y-auto font-mono text-xs">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1C2A3E]">
          <div>
            <h1 className="font-display font-bold text-xl text-white tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[#55DDF5]" />
              <span>AIRSPACE SAFETY RULES &amp; ALERT ENGINE</span>
            </h1>
            <p className="text-xs text-[#8293AA] mt-1">
              Deterministic surveillance boundary rules with automated deduplication and cooldown logic.
            </p>
          </div>

          {activeAlerts.length > 0 && (
            <button
              onClick={clearAllAlerts}
              className="px-3 py-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR ALL ALERTS</span>
            </button>
          )}
        </div>

        {/* 2-Column Grid: Configurable Rules & Triggered Alerts Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rules Configuration Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#0E1624] border border-[#1C2A3E] rounded-lg p-4">
              <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider pb-3 border-b border-[#1C2A3E] mb-3">
                <Sliders className="w-4 h-4 text-[#55DDF5]" />
                <span>SURVEILLANCE CRITERIA</span>
              </div>

              <div className="space-y-4">
                {alertRules.map((rule) => (
                  <div key={rule.id} className="p-3 bg-[#131F30]/50 border border-[#1C2A3E] rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{rule.label}</span>
                      <button
                        onClick={() => toggleAlertRule(rule.id)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          rule.enabled ? 'bg-[#55DDF5]' : 'bg-[#1C2A3E]'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black transition-transform ${
                            rule.enabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#8293AA]">Threshold:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={rule.threshold}
                          onChange={(e) => updateAlertRuleThreshold(rule.id, parseFloat(e.target.value) || 0)}
                          className="w-20 bg-[#080D16] border border-[#1C2A3E] rounded px-2 py-0.5 text-right text-white text-xs outline-none focus:border-[#55DDF5]"
                        />
                        <span className="text-[10px] text-[#8293AA]">{rule.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Triggered Alerts Log Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0E1624] border border-[#1C2A3E] rounded-lg p-4 flex flex-col min-h-[450px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#1C2A3E] mb-3">
                <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider">
                  <Bell className="w-4 h-4 text-[#55DDF5]" />
                  <span>ACTIVE SECTOR ALERTS</span>
                </div>
                <span className="text-xs text-[#55DDF5] font-bold">
                  {activeAlerts.length} TRIGGERED
                </span>
              </div>

              {activeAlerts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#53647B]">
                  <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-500/40" />
                  <p className="text-sm font-semibold text-[#8293AA]">Airspace Perimeter Nominal</p>
                  <p className="text-xs mt-1">No anomalous altitudes, velocities, or stale signatures detected in the monitored sector.</p>
                </div>
              ) : (
                <div className="space-y-2.5 overflow-y-auto max-h-[600px] pr-1">
                  {activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 bg-[#131F30]/60 border border-[#1C2A3E] hover:border-[#294262] rounded-md transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(alert.severity)}
                          <button
                            onClick={() => {
                              setSelectedIcao24(alert.icao24);
                              setCurrentSection('airspace');
                            }}
                            className="text-white hover:text-[#55DDF5] font-bold underline cursor-pointer"
                          >
                            {alert.callsign} ({alert.icao24.toUpperCase()})
                          </button>
                        </div>
                        <p className="text-xs text-[#EAF1FA] leading-relaxed">
                          {alert.message}
                        </p>
                        <div className="text-[10px] text-[#53647B] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="p-1 text-[#8293AA] hover:text-white rounded hover:bg-[#1C2A3E] cursor-pointer"
                        title="Dismiss alert"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

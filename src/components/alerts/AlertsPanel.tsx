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
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white text-black font-semibold flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-black" /> CRITICAL
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-white border border-neutral-700 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> WARNING
          </span>
        );
      case 'info':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-900 text-neutral-300 border border-neutral-800 font-semibold flex items-center gap-1">
            <Info className="w-3 h-3" /> NOTICE
          </span>
        );
    }
  };

  return (
    <div className="flex-1 bg-black p-6 overflow-y-auto font-mono text-xs">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
          <div>
            <h1 className="font-display font-bold text-xl text-white tracking-wide flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-white" />
              <span>AIRSPACE SAFETY RULES &amp; ALERT ENGINE</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Deterministic surveillance boundary rules with automated deduplication and cooldown logic.
            </p>
          </div>

          {activeAlerts.length > 0 && (
            <button
              onClick={clearAllAlerts}
              className="px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
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
            <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-4">
              <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider pb-3 border-b border-[#222222] mb-3">
                <Sliders className="w-4 h-4 text-white" />
                <span>SURVEILLANCE CRITERIA</span>
              </div>

              <div className="space-y-4">
                {alertRules.map((rule) => (
                  <div key={rule.id} className="p-3 bg-black border border-[#222222] rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{rule.label}</span>
                      <button
                        onClick={() => toggleAlertRule(rule.id)}
                        className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                          rule.enabled ? 'bg-white' : 'bg-neutral-800'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${
                            rule.enabled ? 'translate-x-4 bg-black' : 'translate-x-0 bg-neutral-400'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-neutral-400">Threshold:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={rule.threshold}
                          onChange={(e) => updateAlertRuleThreshold(rule.id, parseFloat(e.target.value) || 0)}
                          className="w-20 bg-[#0A0A0A] border border-[#222222] rounded px-2 py-0.5 text-right text-white text-xs outline-none focus:border-white"
                        />
                        <span className="text-[10px] text-neutral-400">{rule.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Triggered Alerts Log Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-4 flex flex-col min-h-[450px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#222222] mb-3">
                <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider">
                  <Bell className="w-4 h-4 text-white" />
                  <span>ACTIVE SECTOR ALERTS</span>
                </div>
                <span className="text-xs text-white font-bold">
                  {activeAlerts.length} TRIGGERED
                </span>
              </div>

              {activeAlerts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-500">
                  <CheckCircle2 className="w-12 h-12 mb-3 text-neutral-600" />
                  <p className="text-sm font-semibold text-neutral-300">Airspace Perimeter Nominal</p>
                  <p className="text-xs mt-1">No anomalous altitudes, velocities, or stale signatures detected in the monitored sector.</p>
                </div>
              ) : (
                <div className="space-y-2.5 overflow-y-auto max-h-[600px] pr-1">
                  {activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 bg-black border border-[#222222] hover:border-neutral-600 rounded-md transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(alert.severity)}
                          <button
                            onClick={() => {
                              setSelectedIcao24(alert.icao24);
                              setCurrentSection('airspace');
                            }}
                            className="text-white hover:underline font-bold cursor-pointer"
                          >
                            {alert.callsign} ({alert.icao24.toUpperCase()})
                          </button>
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          {alert.message}
                        </p>
                        <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
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

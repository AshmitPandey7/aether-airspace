import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Network, 
  Radio, 
  RefreshCw, 
  Server 
} from 'lucide-react';
import { useAirspaceStore } from '../../store/useAirspaceStore';

export const DiagnosticsPanel: React.FC = () => {
  const {
    diagnostics,
    dataMode,
    selectedRegion,
    systemEvents,
    aircraftMap,
    fetchAirspaceData,
    isLoading
  } = useAirspaceStore();

  const totalAircraft = Object.keys(aircraftMap).length;
  const failureRate = diagnostics.totalRequests > 0
    ? ((diagnostics.failedRequests / diagnostics.totalRequests) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="flex-1 bg-black p-6 overflow-y-auto font-mono text-xs">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
          <div>
            <h1 className="font-display font-bold text-xl text-white tracking-wide flex items-center gap-2">
              <Activity className="w-6 h-6 text-white" />
              <span>SYSTEM DIAGNOSTICS &amp; API TELEMETRY</span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Real-time surveillance pipeline health, OpenSky rate limits, network latency, and audit event logs.
            </p>
          </div>

          <button
            onClick={() => fetchAirspaceData()}
            disabled={isLoading}
            className="px-3 py-1.5 rounded bg-[#0A0A0A] hover:bg-[#1A1A1A] border border-[#222222] text-white flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-white' : ''}`} />
            <span>PING OPENSKY ENDPOINT</span>
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span>LATENCY (RTT)</span>
              <Network className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">
              {diagnostics.lastFetchDurationMs} <span className="text-xs font-normal text-neutral-400">ms</span>
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">
              Last probe: {diagnostics.lastFetchTime ? new Date(diagnostics.lastFetchTime).toLocaleTimeString() : 'N/A'}
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span>TOTAL REQUESTS</span>
              <Server className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">
              {diagnostics.totalRequests}
            </div>
            <div className="text-[10px] text-neutral-400 mt-1">
              Fail rate: {failureRate}% ({diagnostics.failedRequests} failed)
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span>429 RATE LIMITS</span>
              <AlertTriangle className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {diagnostics.rateLimitedRequests}
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">
              Anonymous limit: ~1 req / 10s
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span>ACTIVE PIPELINE</span>
              <Radio className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">
              {dataMode}
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">
              {totalAircraft} tracked in {selectedRegion.name}
            </div>
          </div>
        </div>

        {/* 2-Column Section: Error Log & Event Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Error & Exception Log */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-4 flex flex-col min-h-[350px]">
            <div className="font-bold text-white uppercase tracking-wider pb-3 border-b border-[#222222] mb-3 flex items-center justify-between">
              <span>API ERROR AUDIT TRAIL</span>
              <span className="text-[10px] text-neutral-400">{diagnostics.errorLog.length} INCIDENTS</span>
            </div>

            {diagnostics.errorLog.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-neutral-500">
                <CheckCircle2 className="w-8 h-8 mb-2 text-neutral-600" />
                <p>Zero HTTP or transport errors recorded.</p>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
                {diagnostics.errorLog.map((err) => (
                  <div key={err.id} className="p-2.5 rounded bg-black border border-neutral-800 text-neutral-300 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-white">
                        {err.status ? `HTTP ${err.status}` : 'TRANSPORT ERROR'}
                      </span>
                      <span className="text-neutral-500">
                        {new Date(err.time).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] leading-tight text-neutral-300">
                      {err.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-time System Event Audit Timeline */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-4 flex flex-col min-h-[350px]">
            <div className="font-bold text-white uppercase tracking-wider pb-3 border-b border-[#222222] mb-3 flex items-center justify-between">
              <span>SECTOR EVENT TIMELINE</span>
              <span className="text-[10px] text-white font-semibold">{systemEvents.length} EVENTS</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[320px] pr-1">
              {systemEvents.slice(0, 30).map((evt) => (
                <div key={evt.id} className="p-2.5 rounded bg-black border border-[#222222] flex items-start gap-2.5">
                  <span 
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      evt.level === 'error'
                        ? 'bg-neutral-600'
                        : evt.level === 'warning'
                        ? 'bg-neutral-400'
                        : evt.level === 'success'
                        ? 'bg-white'
                        : 'bg-neutral-300'
                    }`} 
                  />
                  <div className="flex-1 space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white text-[11px]">{evt.title}</span>
                      <span className="text-[10px] text-neutral-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                    {evt.details && (
                      <p className="text-[10px] text-neutral-400 leading-normal">{evt.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

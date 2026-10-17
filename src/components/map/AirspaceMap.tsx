import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Crosshair, 
  Layers, 
  Radio, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut 
} from 'lucide-react';
import { useAirspaceStore } from '../../store/useAirspaceStore';
import type { Aircraft } from '../../types';
import { formatAltitude, formatVelocity } from '../../utils/formatters';

// ESRI World Dark Gray Canvas (high contrast, tactical dark aerospace basemap, no API key required)
const TILE_BASE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const TILE_REF_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}';
const ATTRIBUTION = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ';

/**
 * Generates the HTML string for an aircraft marker DivIcon
 */
function createAircraftIconHtml(aircraft: Aircraft, isSelected: boolean): string {
  const heading = aircraft.heading ?? 0;
  const isGround = aircraft.onGround;
  const isEstimated = aircraft.isEstimated;

  // Color coding:
  // Selected -> Electric Cyan #55DDF5 with glow
  // On ground -> Restrained Amber #FFB454
  // Aging/Stale -> Muted Slate #8293AA
  // Airborne Fresh -> Electric Cyan #55DDF5 or Crisp White
  let color = '#55DDF5';
  if (isGround) {
    color = '#FFB454';
  } else if (aircraft.freshness === 'stale') {
    color = '#64748B';
  } else if (aircraft.freshness === 'aging') {
    color = '#94A3B8';
  }

  const selectionReticle = isSelected ? `
    <div class="aircraft-selection-ring"></div>
    <div class="aircraft-target-reticle">
      <svg viewBox="0 0 40 40" fill="none" class="w-full h-full">
        <path d="M4 12V4H12M28 4H36V12M36 28V36H28M12 36H4V28" stroke="#55DDF5" stroke-width="1.5" />
      </svg>
    </div>
  ` : '';

  const estimatedIndicator = isEstimated ? `
    <div class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 border border-black animate-ping"></div>
  ` : '';

  return `
    <div class="aircraft-marker-container ${isSelected ? 'aircraft-marker-selected' : ''}" style="width: 32px; height: 32px;">
      ${selectionReticle}
      ${estimatedIndicator}
      <div style="transform: rotate(${heading}deg); transition: transform 0.3s ease;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="${color}" class="aircraft-icon-svg" style="opacity: ${aircraft.freshness === 'stale' ? '0.6' : '1'};">
          <!-- Sleek Top-down Jet Silhouette -->
          <path d="M12 2L13.8 8.5L21.5 13.5V15.5L13.5 13L13.2 19L16 21.2V22.5L12 21.5L8 22.5V21.2L10.8 19L10.5 13L2.5 15.5V13.5L10.2 8.5L12 2Z" />
        </svg>
      </div>
    </div>
  `;
}

export const AirspaceMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const trailPolylineRef = useRef<L.Polyline | null>(null);
  const regionBoundsRectRef = useRef<L.Rectangle | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [showRadarSweep, setShowRadarSweep] = useState(true);
  const [showSectorBounds, setShowSectorBounds] = useState(true);

  const {
    aircraftMap,
    selectedIcao24,
    setSelectedIcao24,
    selectedRegion,
    flightTrails,
    filters
  } = useAirspaceStore();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialRegion = useAirspaceStore.getState().selectedRegion;

    const map = L.map(mapContainerRef.current, {
      center: initialRegion.center,
      zoom: initialRegion.zoom,
      minZoom: 3,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: true
    });

    // ESRI Dark Gray Base & Reference layers
    L.tileLayer(TILE_BASE_URL, {
      maxZoom: 16,
      attribution: ATTRIBUTION
    }).addTo(map);

    L.tileLayer(TILE_REF_URL, {
      maxZoom: 16,
      opacity: 0.65
    }).addTo(map);

    const markersGroup = L.featureGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lon: Number(e.latlng.lng.toFixed(4))
      });
    });

    map.on('click', () => {
      useAirspaceStore.getState().setSelectedIcao24(null);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync region center and bounds overlay
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo(selectedRegion.center, selectedRegion.zoom, {
      duration: 1.2,
      easeLinearity: 0.25
    });

    // Draw / update region boundary rectangle
    if (regionBoundsRectRef.current) {
      regionBoundsRectRef.current.remove();
    }

    if (showSectorBounds) {
      const bounds: L.LatLngBoundsExpression = [
        [selectedRegion.lamin, selectedRegion.lomin],
        [selectedRegion.lamax, selectedRegion.lomax]
      ];

      const rect = L.rectangle(bounds, {
        color: '#55DDF5',
        weight: 1,
        dashArray: '4, 6',
        fillOpacity: 0.03,
        fillColor: '#55DDF5'
      }).addTo(map);

      regionBoundsRectRef.current = rect;
    }
  }, [selectedRegion, showSectorBounds]);

  // Update Aircraft Markers & Selection
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    const existingMarkers = markersMapRef.current;
    const currentIcaoSet = new Set<string>();

    // Apply active filters to decide which aircraft to display
    const filteredAircraft = Object.values(aircraftMap).filter((ac) => {
      // Callsign / ICAO filter
      if (filters.query) {
        const q = filters.query.toLowerCase().trim();
        const matchesCallsign = ac.callsign.toLowerCase().includes(q);
        const matchesIcao = ac.icao24.toLowerCase().includes(q);
        if (!matchesCallsign && !matchesIcao) return false;
      }
      // Altitude filter
      if (filters.minAltitude !== null && (ac.baroAltitude === null || ac.baroAltitude < filters.minAltitude)) {
        return false;
      }
      if (filters.maxAltitude !== null && (ac.baroAltitude === null || ac.baroAltitude > filters.maxAltitude)) {
        return false;
      }
      // Speed filter
      if (filters.minSpeed !== null && (ac.velocity === null || ac.velocity < filters.minSpeed)) {
        return false;
      }
      if (filters.maxSpeed !== null && (ac.velocity === null || ac.velocity > filters.maxSpeed)) {
        return false;
      }
      // Ground status
      if (filters.onGroundStatus === 'ground' && !ac.onGround) return false;
      if (filters.onGroundStatus === 'airborne' && ac.onGround) return false;
      // Freshness
      if (filters.freshness !== 'all' && ac.freshness !== filters.freshness) return false;

      return true;
    });

    // Render / update markers
    filteredAircraft.forEach((ac) => {
      currentIcaoSet.add(ac.icao24);
      const isSelected = ac.icao24 === selectedIcao24;
      const html = createAircraftIconHtml(ac, isSelected);

      const customIcon = L.divIcon({
        className: 'aircraft-div-icon',
        html,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      let marker = existingMarkers.get(ac.icao24);

      if (marker) {
        // Update existing marker position & icon
        marker.setLatLng([ac.lat, ac.lon]);
        marker.setIcon(customIcon);
        marker.setZIndexOffset(isSelected ? 1000 : (ac.onGround ? 10 : 100));
      } else {
        // Create new marker
        marker = L.marker([ac.lat, ac.lon], {
          icon: customIcon,
          zIndexOffset: isSelected ? 1000 : (ac.onGround ? 10 : 100)
        });

        // Hover tooltip
        marker.bindTooltip(`
          <div class="text-[11px] font-mono leading-tight">
            <div class="font-bold text-[#55DDF5]">${ac.callsign} <span class="text-white/60 font-normal">(${ac.icao24.toUpperCase()})</span></div>
            <div class="text-[#8293AA] text-[10px] mt-0.5">${ac.originCountry}</div>
            <div class="text-white/90 text-[10px] mt-1">${formatAltitude(ac.baroAltitude, 'dual')}</div>
            <div class="text-white/80 text-[10px]">${formatVelocity(ac.velocity)}</div>
          </div>
        `, {
          className: 'leaflet-tooltip-aircraft',
          direction: 'top',
          offset: [0, -12],
          opacity: 0.95
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedIcao24(ac.icao24);
        });

        marker.addTo(markersGroup);
        existingMarkers.set(ac.icao24, marker);
      }
    });

    // Remove markers that are no longer in the active filtered set
    existingMarkers.forEach((marker, icao) => {
      if (!currentIcaoSet.has(icao)) {
        marker.remove();
        existingMarkers.delete(icao);
      }
    });
  }, [aircraftMap, selectedIcao24, filters, setSelectedIcao24]);

  // Center on Selected Aircraft and Render Flight Trail
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove previous trail polyline
    if (trailPolylineRef.current) {
      trailPolylineRef.current.remove();
      trailPolylineRef.current = null;
    }

    if (!selectedIcao24) return;

    const selectedAc = aircraftMap[selectedIcao24];
    if (selectedAc) {
      // Pan to selected aircraft smoothly
      map.panTo([selectedAc.lat, selectedAc.lon], { animate: true, duration: 0.8 });

      // Draw flight movement trail if points exist
      const trail = flightTrails[selectedIcao24];
      if (trail && trail.length > 1) {
        const latLngs = trail.map((p) => [p.lat, p.lon] as [number, number]);

        const polyline = L.polyline(latLngs, {
          color: '#55DDF5',
          weight: 2.5,
          opacity: 0.75,
          dashArray: '2, 4',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        trailPolylineRef.current = polyline;
      }
    }
  }, [selectedIcao24, aircraftMap, flightTrails]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(selectedRegion.center, selectedRegion.zoom, {
        duration: 0.8
      });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#060910]">
      {/* Leaflet DOM container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Subtle Radar Screen Rings Overlay */}
      {showRadarSweep && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-[#55DDF5]/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-[#55DDF5]/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-[#55DDF5]/30" />
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#55DDF5]/10" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#55DDF5]/10" />
        </div>
      )}

      {/* Floating Map Controls & Overlays */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {/* Reset View Button */}
        <button
          onClick={handleResetView}
          className="p-2 rounded bg-[#0E1624]/90 hover:bg-[#131F30] border border-[#1C2A3E] hover:border-[#55DDF5]/40 text-[#8293AA] hover:text-[#55DDF5] shadow-lg backdrop-blur transition-all cursor-pointer"
          title="Reset View to Sector Center"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col rounded bg-[#0E1624]/90 border border-[#1C2A3E] shadow-lg backdrop-blur overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-[#131F30] text-[#8293AA] hover:text-[#55DDF5] transition-colors border-b border-[#1C2A3E] cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-[#131F30] text-[#8293AA] hover:text-[#55DDF5] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle Overlays (Radar grid / bounds) */}
        <div className="flex flex-col rounded bg-[#0E1624]/90 border border-[#1C2A3E] shadow-lg backdrop-blur overflow-hidden">
          <button
            onClick={() => setShowRadarSweep(!showRadarSweep)}
            className={`p-2 transition-colors cursor-pointer border-b border-[#1C2A3E] ${
              showRadarSweep ? 'text-[#55DDF5] bg-[#131F30]' : 'text-[#8293AA] hover:text-white'
            }`}
            title="Toggle Range Rings"
          >
            <Radio className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSectorBounds(!showSectorBounds)}
            className={`p-2 transition-colors cursor-pointer ${
              showSectorBounds ? 'text-[#55DDF5] bg-[#131F30]' : 'text-[#8293AA] hover:text-white'
            }`}
            title="Toggle Sector Query Bounds"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-3 px-3 py-1.5 rounded bg-[#0E1624]/90 border border-[#1C2A3E] shadow-lg backdrop-blur text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#55DDF5]" />
          <span className="text-[#8293AA]">Airborne</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#FFB454]" />
          <span className="text-[#8293AA]">On Ground</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#64748B]" />
          <span className="text-[#8293AA]">Stale (&gt;60s)</span>
        </div>
      </div>

      {/* Live Coordinate Display at Bottom Left */}
      <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2 px-3 py-1 rounded bg-[#0E1624]/90 border border-[#1C2A3E] text-[11px] font-mono text-[#8293AA] backdrop-blur shadow">
        <Crosshair className="w-3.5 h-3.5 text-[#55DDF5]" />
        <span>
          {cursorCoords ? `${cursorCoords.lat.toFixed(4)}°, ${cursorCoords.lon.toFixed(4)}°` : '0.0000°, 0.0000°'}
        </span>
        <span className="text-[#53647B] border-l border-[#1C2A3E] pl-2">
          {selectedRegion.name}
        </span>
      </div>
    </div>
  );
};

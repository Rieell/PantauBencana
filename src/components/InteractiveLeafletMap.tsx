import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { DisasterRecord } from '../types';
import { Layers, RotateCcw, ZoomIn, ZoomOut, Compass, MapPin } from 'lucide-react';

interface InteractiveLeafletMapProps {
  disasters: DisasterRecord[];
  selectedDisaster: DisasterRecord | null;
  onSelectDisaster: (disaster: DisasterRecord) => void;
  mapHeightClass?: string;
}

type BaseLayerType = 'osm' | 'topo' | 'satellite';

export const InteractiveLeafletMap: React.FC<InteractiveLeafletMapProps> = ({
  disasters,
  selectedDisaster,
  onSelectDisaster,
  mapHeightClass = 'min-h-[600px] h-[640px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [currentLayer, setCurrentLayer] = useState<BaseLayerType>('osm');

  // Indonesia initial bounds & center
  // Center approx [-2.5489, 118.0149], zoom 5
  const INDONESIA_CENTER: L.LatLngTuple = [-2.5489, 118.0149];
  const INDONESIA_DEFAULT_ZOOM = 5;

  const tileLayerUrls: Record<BaseLayerType, { url: string; attribution: string; maxZoom: number }> = {
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; OSM contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
      maxZoom: 17,
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18,
    },
  };

  // Helper to create high-visibility styled marker icons
  const createMarkerIcon = (record: DisasterRecord, isSelected: boolean) => {
    const isTinggi = record.tingkatRisiko === 'Tinggi';
    const isSedang = record.tingkatRisiko === 'Sedang';

    // Distinctive risk-based color palette
    const colorBg = isTinggi ? '#dc2626' : isSedang ? '#d97706' : '#0284c7';
    const pulseBg = isTinggi ? 'rgba(220, 38, 38, 0.45)' : 'rgba(217, 119, 6, 0.4)';
    const size = isSelected ? 34 : 26;
    const innerSize = isSelected ? 24 : 18;

    return L.divIcon({
      className: 'disaster-leaflet-marker-wrapper',
      html: `
        <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${
            isTinggi || isSelected
              ? `<div style="position: absolute; width: ${size + 14}px; height: ${size + 14}px; border-radius: 9999px; background: ${pulseBg}; animation: leafletPulse 2s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></div>`
              : ''
          }
          <div style="
            width: ${innerSize}px;
            height: ${innerSize}px;
            background-color: ${colorBg};
            border: 2.5px solid #ffffff;
            border-radius: 9999px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.45), 0 0 0 ${isSelected ? '3px #1e40af' : '1px rgba(0,0,0,0.1)'};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease;
          ">
            <span style="width: 5px; height: 5px; background: #ffffff; border-radius: 9999px;"></span>
          </div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2 - 4],
    });
  };

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: INDONESIA_CENTER,
        zoom: INDONESIA_DEFAULT_ZOOM,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false, // We render custom smooth zoom controls
        attributionControl: true,
      });

      // Fit Indonesia bounding box if view is wide
      const indonesiaBounds: L.LatLngBoundsLiteral = [
        [-11.2, 95.0],
        [6.2, 141.0],
      ];
      map.fitBounds(indonesiaBounds, { padding: [20, 20] });

      // Add base tile layer
      const baseCfg = tileLayerUrls.osm;
      const initialTiles = L.tileLayer(baseCfg.url, {
        attribution: baseCfg.attribution,
        maxZoom: baseCfg.maxZoom,
      }).addTo(map);

      tileLayerRef.current = initialTiles;

      // Layer group for markers
      const markerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markerGroup;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Handle Base Layer Switching (OSM / Topo / Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const cfg = tileLayerUrls[currentLayer];
    const newTiles = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
    }).addTo(map);

    tileLayerRef.current = newTiles;
  }, [currentLayer]);

  // 3. Render and Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markerGroup = markersLayerRef.current;
    if (!map || !markerGroup) return;

    markerGroup.clearLayers();

    disasters.forEach((record) => {
      if (typeof record.latitude !== 'number' || typeof record.longitude !== 'number') return;

      const isSelected = selectedDisaster?.id === record.id;
      const icon = createMarkerIcon(record, isSelected);

      const marker = L.marker([record.latitude, record.longitude], {
        icon,
        title: `${record.jenis} - ${record.kabupatenKota}`,
      });

      // Custom styled HTML popup
      const isLongsor = record.jenis.toLowerCase().includes('longsor');
      const badgeBg = isLongsor ? '#ffdbca' : '#cce5ff';
      const badgeText = isLongsor ? '#763300' : '#00476e';
      const riskColor = record.tingkatRisiko === 'Tinggi' ? '#dc2626' : record.tingkatRisiko === 'Sedang' ? '#d97706' : '#0284c7';

      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px; min-width: 220px; max-width: 280px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; background-color: ${badgeBg}; color: ${badgeText}; padding: 2px 6px; border-radius: 4px;">
              ${record.jenis}
            </span>
            <span style="font-size: 10px; font-weight: 700; color: ${riskColor};">
              ● Risiko ${record.tingkatRisiko || 'Sedang'}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: 700; color: #1e293b; margin: 0 0 2px 0; line-height: 1.3;">
            ${record.kabupatenKota}, ${record.provinsi}
          </h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">
            ${record.tanggal} • ${record.waktu || 'WIB'}
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; font-size: 11px; color: #334155; margin-bottom: 8px;">
            <strong>Dampak:</strong> ${record.ringkasanDampak}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #94a3b8;">
            <span>Lat: ${record.latitude}</span>
            <span>Lon: ${record.longitude}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        className: 'disaster-leaflet-popup',
      });

      marker.on('click', () => {
        onSelectDisaster(record);
      });

      markerGroup.addLayer(marker);
    });
  }, [disasters, selectedDisaster, onSelectDisaster]);

  // 4. Smooth Pan/Fly when selected disaster changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedDisaster) return;

    if (
      typeof selectedDisaster.latitude === 'number' &&
      typeof selectedDisaster.longitude === 'number'
    ) {
      const currentZoom = map.getZoom();
      const targetZoom = Math.max(currentZoom, 7);
      map.flyTo([selectedDisaster.latitude, selectedDisaster.longitude], targetZoom, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [selectedDisaster]);

  // Map Controls Helpers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const indonesiaBounds: L.LatLngBoundsLiteral = [
      [-11.2, 95.0],
      [6.2, 141.0],
    ];
    map.fitBounds(indonesiaBounds, { padding: [20, 20], maxZoom: 5 });
  };

  return (
    <div className={`relative w-full ${mapHeightClass} rounded-2xl overflow-hidden border border-surface-container shadow-sm bg-slate-100 flex flex-col`}>
      {/* Inline style for pulsing marker animation */}
      <style>{`
        @keyframes leafletPulse {
          0% { transform: scale(0.85); opacity: 0.8; }
          50% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .disaster-leaflet-marker-wrapper {
          background: transparent !important;
          border: none !important;
        }
        .disaster-leaflet-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }
        .disaster-leaflet-popup .leaflet-popup-tip {
          background: #ffffff;
        }
      `}</style>

      {/* Leaflet DOM Node Target */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* Layer Switcher (OSM, Topo, Satelit) */}
        <div className="flex items-center bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setCurrentLayer('osm')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              currentLayer === 'osm'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Peta OSM
          </button>
          <button
            type="button"
            onClick={() => setCurrentLayer('topo')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              currentLayer === 'topo'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Topografi
          </button>
          <button
            type="button"
            onClick={() => setCurrentLayer('satellite')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              currentLayer === 'satellite'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Satelit
          </button>
        </div>

        {/* Counter Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-xs font-semibold text-slate-800 shadow-md">
          <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
          <span>{disasters.length} Titik Sebaran Aktif</span>
        </div>
      </div>

      {/* Right Floating Zoom & Center Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-primary hover:bg-slate-50 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
          title="Perbesar Peta (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-primary hover:bg-slate-50 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
          title="Perkecil Peta (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-primary hover:bg-slate-50 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
          title="Pusatkan Seluruh Wilayah Indonesia"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-lg text-xs space-y-1.5 pointer-events-auto max-w-[280px]">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
          <span>Legenda Titik Bencana</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600 border-2 border-white shadow-xs inline-block shrink-0"></span>
          <span className="text-slate-700 text-[11px]">Risiko Tinggi / Kritis</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-xs inline-block shrink-0"></span>
          <span className="text-slate-700 text-[11px]">Risiko Sedang / Waspada</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-sky-600 border-2 border-white shadow-xs inline-block shrink-0"></span>
          <span className="text-slate-700 text-[11px]">Risiko Rendah / Terkendali</span>
        </div>
      </div>
    </div>
  );
};

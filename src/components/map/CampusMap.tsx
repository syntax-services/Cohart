'use client';

import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/lib/types';
import { LocationSheet } from './LocationSheet';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';

const CARTO_API_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY || 'cb1_3rjp_1_f8a6fb6d946dbbfeac97230a';

interface CampusMapProps {
  locations: Location[];
  selectedLocationId?: string | null;
  onSelectLocation?: (location: Location) => void;
  className?: string;
}

// Controller component to smoothly fly/pan to selected location
function MapFocusController({ target }: { target: [number, number] | null }) {
  const map = useMap();
  React.useEffect(() => {
    if (target) {
      map.flyTo(target, 17, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [target, map]);
  return null;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  locations,
  selectedLocationId,
  onSelectLocation,
  className = '',
}) => {
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Ago-Iwoye Main Campus default center
  const defaultCenter: [number, number] = [6.9225, 3.8714];
  const defaultZoom = 16;

  // Filter locations
  const filteredLocations = useMemo(() => {
    if (activeCategory === 'all') return locations;
    if (activeCategory === 'economics') {
      return locations.filter((l) => l.department === 'Economics' || l.faculty.includes('Social'));
    }
    return locations.filter((l) => l.category === activeCategory);
  }, [locations, activeCategory]);

  // Handle external selection
  React.useEffect(() => {
    if (selectedLocationId) {
      const found = locations.find(
        (l) => l.id === selectedLocationId || l.code === selectedLocationId
      );
      if (found) setActiveLocation(found);
    }
  }, [selectedLocationId, locations]);

  // Create custom Gemini Blue markers using Leaflet divIcon
  const createCustomMarker = (location: Location, isSelected: boolean) => {
    const isEco = location.department === 'Economics';
    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full cursor-pointer group">
          <!-- Outer Pulsing Glow -->
          <span class="absolute -bottom-1 h-3 w-3 rounded-full bg-[#387BFF]/40 animate-ping"></span>
          
          <!-- Anchor Pin Body -->
          <div class="relative flex flex-col items-center">
            <div class="relative flex items-center justify-center h-8 px-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
              isSelected
                ? 'bg-gradient-to-r from-[#1A73E8] to-[#387BFF] text-white font-bold shadow-[0_0_20px_#387BFF] scale-110'
                : isEco
                ? 'bg-[#080C14]/95 border border-[#387BFF]/80 text-[#60A5FA] shadow-[0_0_12px_rgba(56,123,255,0.4)] hover:scale-105'
                : 'bg-[#080C14]/90 border border-white/20 text-slate-200 hover:border-[#387BFF]/50'
            }">
              <span class="text-[11px] font-mono tracking-tight whitespace-nowrap">
                ${location.code || location.name.slice(0, 8)}
              </span>
            </div>
            <!-- Pin Pointer Triangle -->
            <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${
              isSelected ? 'border-t-[#387BFF]' : isEco ? 'border-t-[#387BFF]' : 'border-t-white/30'
            }"></div>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 36],
    });
  };

  const handleMarkerClick = (loc: Location) => {
    setActiveLocation(loc);
    if (onSelectLocation) onSelectLocation(loc);
  };

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#06080D] ${className}`}
    >
      {/* Category Pills Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#080C14]/90 p-1 rounded-xl backdrop-blur-xl border border-white/[0.08] shadow-lg">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-[#1A73E8] to-[#387BFF] text-white font-semibold shadow-[0_0_12px_rgba(56,123,255,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            All Venues
          </button>
          <button
            onClick={() => setActiveCategory('economics')}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all ${
              activeCategory === 'economics'
                ? 'bg-gradient-to-r from-[#1A73E8] to-[#387BFF] text-white font-semibold shadow-[0_0_12px_rgba(56,123,255,0.3)]'
                : 'text-[#60A5FA] hover:bg-[#387BFF]/10'
            }`}
          >
            <GeminiIcon name="sparkle" size={12} />
            <span>Economics (SMS)</span>
          </button>
          <button
            onClick={() => setActiveCategory('lecture_hall')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all ${
              activeCategory === 'lecture_hall'
                ? 'bg-gradient-to-r from-[#1A73E8] to-[#387BFF] text-white font-semibold shadow-[0_0_12px_rgba(56,123,255,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Halls
          </button>
          <button
            onClick={() => setActiveCategory('library')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all ${
              activeCategory === 'library'
                ? 'bg-gradient-to-r from-[#1A73E8] to-[#387BFF] text-white font-semibold shadow-[0_0_12px_rgba(56,123,255,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Library
          </button>
        </div>

        {/* Quick Focus SMS Complex */}
        <button
          onClick={() => {
            const sms = locations.find((l) => l.code === 'SMS-LT1');
            if (sms) setActiveLocation(sms);
          }}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-xl bg-[#080C14]/90 text-white border border-white/[0.1] backdrop-blur-xl hover:border-[#387BFF]/50 transition-colors shadow-lg"
        >
          <GeminiIcon name="compass" size={14} className="text-[#387BFF]" />
          <span className="hidden sm:inline">Focus SMS</span>
        </button>
      </div>

      {/* Map Container without attribution watermark */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        attributionControl={false}
        className="h-full w-full z-10"
      >
        {/* CartoDB Dark Matter with user API Key to prevent watermarks */}
        <TileLayer
          url={`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}`}
          maxZoom={19}
        />

        {/* Dynamic Focus Controller */}
        <MapFocusController
          target={activeLocation ? [activeLocation.latitude, activeLocation.longitude] : null}
        />

        {/* Render Location Markers */}
        {filteredLocations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={createCustomMarker(loc, activeLocation?.id === loc.id)}
            eventHandlers={{
              click: () => handleMarkerClick(loc),
            }}
          />
        ))}
      </MapContainer>

      {/* Campus Map Bottom Sheet */}
      <LocationSheet location={activeLocation} onClose={() => setActiveLocation(null)} />
    </div>
  );
};

export default CampusMap;

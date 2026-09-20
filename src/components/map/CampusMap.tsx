'use client';

import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/lib/types';
import { LocationSheet } from './LocationSheet';
import { Compass, Layers, Sparkles } from 'lucide-react';

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
      return locations.filter(l => l.department === 'Economics' || l.faculty.includes('Social'));
    }
    return locations.filter(l => l.category === activeCategory);
  }, [locations, activeCategory]);

  // Handle external selection
  React.useEffect(() => {
    if (selectedLocationId) {
      const found = locations.find(l => l.id === selectedLocationId);
      if (found) setActiveLocation(found);
    }
  }, [selectedLocationId, locations]);

  // Create custom Electric Cyan/Azure markers using Leaflet divIcon
  const createCustomMarker = (location: Location, isSelected: boolean) => {
    const isEco = location.department === 'Economics';
    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full cursor-pointer group">
          <!-- Outer Pulsing Glow -->
          <span class="absolute -bottom-1 h-3 w-3 rounded-full bg-[#00F0FF]/40 animate-ping"></span>
          
          <!-- Anchor Pin Body -->
          <div class="relative flex flex-col items-center">
            <div class="relative flex items-center justify-center h-8 px-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
              isSelected 
                ? 'bg-gradient-to-r from-[#00F0FF] to-[#0066FF] text-black font-bold shadow-[0_0_20px_#00F0FF] scale-110' 
                : isEco
                ? 'bg-[#0B0F17]/90 border border-[#00F0FF]/70 text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.4)] hover:scale-105'
                : 'bg-[#0B0F17]/85 border border-white/20 text-white hover:border-[#00F0FF]/50'
            }">
              <span class="text-[11px] font-mono tracking-tight whitespace-nowrap">
                ${location.code || location.name.slice(0, 8)}
              </span>
            </div>
            <!-- Pin Pointer Triangle -->
            <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] ${
              isSelected ? 'border-t-[#0066FF]' : isEco ? 'border-t-[#00F0FF]' : 'border-t-white/30'
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
    <div className={`relative h-full w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07090E] ${className}`}>
      {/* Category Pills Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#07090E]/85 p-1 rounded-xl backdrop-blur-xl border border-white/[0.08] shadow-lg">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-[#00F0FF] to-[#0066FF] text-black font-semibold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            All Venues
          </button>
          <button
            onClick={() => setActiveCategory('economics')}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all ${
              activeCategory === 'economics'
                ? 'bg-gradient-to-r from-[#00F0FF] to-[#0066FF] text-black font-semibold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-[#00F0FF] hover:bg-[#00F0FF]/10'
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>Economics (SMS)</span>
          </button>
          <button
            onClick={() => setActiveCategory('lecture_hall')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all ${
              activeCategory === 'lecture_hall'
                ? 'bg-gradient-to-r from-[#00F0FF] to-[#0066FF] text-black font-semibold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Halls
          </button>
          <button
            onClick={() => setActiveCategory('library')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all ${
              activeCategory === 'library'
                ? 'bg-gradient-to-r from-[#00F0FF] to-[#0066FF] text-black font-semibold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Library
          </button>
        </div>

        {/* Quick Reset to SMS Complex */}
        <button
          onClick={() => {
            const sms = locations.find(l => l.code === 'SMS-LT1');
            if (sms) setActiveLocation(sms);
          }}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-xl bg-[#0B0F17]/90 text-white border border-white/[0.1] backdrop-blur-xl hover:border-[#00F0FF]/50 transition-colors shadow-lg"
        >
          <Compass className="h-3.5 w-3.5 text-[#00F0FF]" />
          <span className="hidden sm:inline">Focus SMS</span>
        </button>
      </div>

      {/* Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="h-full w-full z-10 dark-tiles"
      >
        {/* CartoDB Dark Matter Tiles for distraction-free minimalist dark aesthetic */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
      <LocationSheet
        location={activeLocation}
        onClose={() => setActiveLocation(null)}
      />
    </div>
  );
};

export default CampusMap;

'use client';

import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/lib/types';
import { LocationSheet } from './LocationSheet';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { useTheme } from '@/components/ThemeProvider';

interface CampusMapProps {
  locations: Location[];
  selectedLocationId?: string | null;
  onSelectLocation?: (location: Location) => void;
  className?: string;
}

// Ago-Iwoye Main Campus default center (calibrated to Central Academic Quad)
const DEFAULT_CENTER: [number, number] = [6.9205, 3.8714];
const DEFAULT_ZOOM = 17;

// Controller component to smoothly fly/pan to selected location or user position
function MapFocusController({
  target,
  zoom = 17,
}: {
  target: [number, number] | null;
  zoom?: number;
}) {
  const map = useMap();
  React.useEffect(() => {
    if (target) {
      map.flyTo(target, zoom, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [target, zoom, map]);
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
  // Default to sharp satellite view as requested by the user
  const [mapLayer, setMapLayer] = useState<'satellite' | 'street'>('satellite');
  const { resolvedTheme } = useTheme();

  // Live Geolocation State
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<[number, number] | null>(null);

  // Filter locations
  const filteredLocations = useMemo(() => {
    if (activeCategory === 'all') return locations;
    if (activeCategory === 'library_lab') {
      return locations.filter((l) => l.category === 'library' || l.category === 'lab');
    }
    return locations.filter((l) => l.category === activeCategory);
  }, [locations, activeCategory]);

  // Handle external selection
  React.useEffect(() => {
    if (selectedLocationId) {
      const found = locations.find(
        (l) => l.id === selectedLocationId || l.code === selectedLocationId
      );
      if (found) {
        setActiveLocation(found);
        setFocusTarget([found.latitude, found.longitude]);
      }
    }
  }, [selectedLocationId, locations]);

  // Handle Locate Me (Live HTML5 GPS Geolocation)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser/device.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation([latitude, longitude]);
        setLocationAccuracy(accuracy);
        setFocusTarget([latitude, longitude]);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission was denied. Please allow location access to find your position on campus.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError('GPS signal unavailable. Please ensure your device location is enabled.');
        } else {
          setLocationError('Unable to retrieve your current location. Please retry.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
  };

  // Custom User Location Blue Dot Marker (Google Maps style pulsating dot)
  const createUserMarker = () => {
    return L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2" style="width: 24px; height: 24px;">
          <div class="absolute inset-0 rounded-full bg-[#0B57D0]/20 dark:bg-[#A8C7FA]/25 animate-ping"></div>
          <div class="relative h-4 w-4 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] border-2 border-white shadow-lg flex items-center justify-center">
            <div class="h-1.5 w-1.5 rounded-full bg-white dark:bg-neutral-950"></div>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Create clean, high-contrast Gemini-style pins calibrated precisely to satellite coordinates
  const createCustomMarker = (location: Location, isSelected: boolean) => {
    const isEco = location.department === 'Economics';
    const isSatellite = mapLayer === 'satellite';
    const code = location.code || location.name.slice(0, 4);

    // Exact Leaflet anchor: icon is 30px wide, 38px tall; anchor is bottom center [15, 38]
    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="relative flex flex-col items-center cursor-pointer group" style="width: 30px; height: 38px;">
          <!-- Floating Label Badge on hover or when selected -->
          <div class="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-150 z-20 ${
            isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
          }">
            <div class="px-2 py-0.5 rounded-md bg-neutral-950/90 text-white text-[10px] font-mono tracking-tight whitespace-nowrap shadow-md border border-white/10 backdrop-blur-sm">
              ${location.name}
            </div>
          </div>

          <!-- Precision Teardrop / Circular Pin -->
          <div class="relative flex items-center justify-center w-[30px] h-[30px] rounded-full shadow-lg transition-transform duration-150 ${
            isSelected
              ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 scale-110 ring-2 ring-white'
              : isEco
              ? isSatellite
                ? 'bg-[#0B57D0] text-white border border-[#A8C7FA]'
                : 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] border border-[#0B57D0]'
              : isSatellite
              ? 'bg-neutral-900/90 text-white border border-white/70'
              : 'bg-white dark:bg-[#1E1F20] text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700'
          }">
            <span class="text-[10px] font-mono font-bold tracking-tighter uppercase leading-none">
              ${code.slice(0, 3)}
            </span>
          </div>

          <!-- Pin Stem pointing directly to coordinate -->
          <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] -mt-[1px] ${
            isSelected
              ? 'border-t-[#0B57D0] dark:border-t-[#A8C7FA]'
              : isEco
              ? isSatellite
                ? 'border-t-[#0B57D0]'
                : 'border-t-[#0B57D0] dark:border-t-[#A8C7FA]'
              : isSatellite
              ? 'border-t-neutral-900'
              : 'border-t-white dark:border-t-[#1E1F20]'
          }"></div>
        </div>
      `,
      iconSize: [30, 38],
      iconAnchor: [15, 38],
    });
  };

  const handleMarkerClick = (loc: Location) => {
    setActiveLocation(loc);
    if (onSelectLocation) onSelectLocation(loc);
  };

  // Satellite tile: Google Hybrid Satellite (crisp aerial imagery with road and building labels, zero watermark)
  // Street tile: Vector map depending on dark/light
  const activeTileUrl = useMemo(() => {
    if (mapLayer === 'satellite') {
      return 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    }
    return resolvedTheme === 'dark'
      ? 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
      : 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
  }, [mapLayer, resolvedTheme]);

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-neutral-950 ${className}`}
    >
      {/* Top Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar pointer-events-none">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 pointer-events-auto bg-white/95 dark:bg-[#1E1F20]/95 p-1 rounded-full backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-full transition-colors ${
              activeCategory === 'all'
                ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-medium'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveCategory('lecture_hall')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-full transition-colors ${
              activeCategory === 'lecture_hall'
                ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-medium'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Halls
          </button>
          <button
            onClick={() => setActiveCategory('faculty')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-full transition-colors ${
              activeCategory === 'faculty'
                ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-medium'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Faculties
          </button>
          <button
            onClick={() => setActiveCategory('library_lab')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-full transition-colors ${
              activeCategory === 'library_lab'
                ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-medium'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Libraries & Labs
          </button>
          <button
            onClick={() => setActiveCategory('amenity')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-full transition-colors ${
              activeCategory === 'amenity'
                ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-medium'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Services
          </button>
        </div>

        {/* Right Action Switchers: Locate Me, Satellite toggle, and Quick Focus SMS */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Locate Me GPS Button */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            title="Locate me on campus"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-full bg-white/95 dark:bg-[#1E1F20]/95 text-neutral-800 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-md hover:border-[#0B57D0] dark:hover:border-[#A8C7FA] transition-all shadow-sm active:scale-95"
          >
            {isLocating ? (
              <div className="h-3 w-3 rounded-full border-2 border-[#0B57D0] dark:border-[#A8C7FA] border-t-transparent animate-spin" />
            ) : (
              <GeminiIcon name="compass" size={13} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
            )}
            <span className="hidden sm:inline font-sans">Locate Me</span>
          </button>

          {/* Satellite / Street Switcher */}
          <button
            onClick={() => setMapLayer(mapLayer === 'satellite' ? 'street' : 'satellite')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-full bg-white/95 dark:bg-[#1E1F20]/95 text-neutral-800 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-md hover:border-[#0B57D0] dark:hover:border-[#A8C7FA] transition-colors shadow-sm"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="capitalize">{mapLayer}</span>
          </button>

          {/* Quick Focus SMS Complex */}
          <button
            onClick={() => {
              const sms = locations.find((l) => l.code === 'SMS-LT1');
              if (sms) {
                setActiveLocation(sms);
                setFocusTarget([sms.latitude, sms.longitude]);
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono rounded-full bg-white/95 dark:bg-[#1E1F20]/95 text-neutral-800 dark:text-neutral-200 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-md hover:border-[#0B57D0] dark:hover:border-[#A8C7FA] transition-colors shadow-sm"
          >
            <span className="hidden sm:inline">SMS</span>
          </button>
        </div>
      </div>

      {/* Geolocation Alert Toast */}
      {locationError && (
        <div className="absolute top-16 left-3 right-3 z-30 mx-auto max-w-md p-2.5 rounded-xl bg-neutral-900/90 text-white text-xs backdrop-blur-md border border-white/10 shadow-lg flex items-center justify-between gap-2 animate-in fade-in">
          <span>{locationError}</span>
          <button
            onClick={() => setLocationError(null)}
            className="text-neutral-400 hover:text-white"
          >
            <GeminiIcon name="close" size={14} />
          </button>
        </div>
      )}

      {/* Map Container - guaranteed watermark-free with attributionControl={false} */}
      <MapContainer
        key={`${mapLayer}-${resolvedTheme}`}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        attributionControl={false}
        className="h-full w-full z-10"
      >
        <TileLayer
          url={activeTileUrl}
          maxZoom={20}
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
        />

        {/* Dynamic Focus Controller */}
        <MapFocusController
          target={focusTarget || (activeLocation ? [activeLocation.latitude, activeLocation.longitude] : null)}
        />

        {/* Render Live User Location Marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={createUserMarker()}
          />
        )}

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

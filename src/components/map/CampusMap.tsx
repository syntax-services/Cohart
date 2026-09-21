'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/lib/types';
import { LocationSheet } from './LocationSheet';
import { CampusRouteNavigator } from './CampusRouteNavigator';
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

// Controller to smoothly fly/pan to selected location or user position
function MapFocusController({
  target,
  zoom = 17,
}: {
  target: [number, number] | null;
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, zoom, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [target, zoom, map]);
  return null;
}

// Controller to automatically frame the journey between user and destination
function RouteBoundsController({
  userLocation,
  destination,
}: {
  userLocation: [number, number] | null;
  destination: Location | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (userLocation && destination) {
      const bounds = L.latLngBounds(
        [userLocation[0], userLocation[1]],
        [destination.latitude, destination.longitude]
      );
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 18 });
    }
  }, [userLocation, destination, map]);
  return null;
}

// Map initialization controller to invalidate size and eliminate any aspect ratio distortion
function MapAntiDistortionController() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);
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
  const [mapLayer, setMapLayer] = useState<'satellite' | 'street'>('satellite');
  const { resolvedTheme } = useTheme();

  // Two-Finger Map Rotation State (Google Maps Style)
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const touchStartAngleRef = useRef<number | null>(null);

  // Live Geolocation State
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [focusTarget, setFocusTarget] = useState<[number, number] | null>(null);

  // Pedestrian Route State
  const [navigatingTo, setNavigatingTo] = useState<Location | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][] | null>(null);

  // Touch gesture listeners for 2-finger twist rotation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setIsRotating(true);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const angle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
      touchStartAngleRef.current = angle;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartAngleRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentAngle = Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
      const delta = currentAngle - touchStartAngleRef.current;
      setRotationAngle((prev) => (prev + delta) % 360);
      touchStartAngleRef.current = currentAngle;
    }
  };

  const handleTouchEnd = () => {
    touchStartAngleRef.current = null;
    setIsRotating(false);
  };

  const handleResetNorth = () => {
    setRotationAngle(0);
  };

  // Filter locations
  const filteredLocations = useMemo(() => {
    if (activeCategory === 'all') return locations;
    if (activeCategory === 'library_lab') {
      return locations.filter((l) => l.category === 'library' || l.category === 'lab');
    }
    return locations.filter((l) => l.category === activeCategory);
  }, [locations, activeCategory]);

  // Handle external selection
  useEffect(() => {
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

  // Fetch walking route when navigating
  useEffect(() => {
    if (!navigatingTo || !userLocation) {
      setRouteCoordinates(null);
      return;
    }

    const startLng = userLocation[1];
    const startLat = userLocation[0];
    const endLng = navigatingTo.longitude;
    const endLat = navigatingTo.latitude;

    const directPath: [number, number][] = [
      [startLat, startLng],
      [endLat, endLng],
    ];

    // Query pedestrian routing engine for actual campus pathways
    fetch(
      `https://router.project-osrm.org/route/v1/foot/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
          const coords = data.routes[0].geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] as [number, number]
          );
          setRouteCoordinates(coords);
        } else {
          setRouteCoordinates(directPath);
        }
      })
      .catch(() => {
        setRouteCoordinates(directPath);
      });
  }, [navigatingTo, userLocation]);

  const handleStartNavigation = (loc: Location) => {
    setActiveLocation(null);
    setNavigatingTo(loc);
    if (!userLocation) {
      handleLocateMe();
    }
  };

  const handleCloseNavigation = () => {
    setNavigatingTo(null);
    setRouteCoordinates(null);
  };

  // Custom User Location Blue Dot Marker (Google Maps style pulsating dot)
  const createUserMarker = () => {
    return L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2" style="width: 24px; height: 24px; transform: rotate(${-rotationAngle}deg);">
          <div class="absolute inset-0 rounded-full bg-[#0B57D0]/25 dark:bg-[#A8C7FA]/30 animate-ping"></div>
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

    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="relative flex flex-col items-center cursor-pointer group" style="width: 30px; height: 38px; transform: rotate(${-rotationAngle}deg); transform-origin: 15px 38px;">
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
        {/* Left: Sleek Filter Icon Selector for Building Types */}
        <div
          className="relative pointer-events-auto flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/95 dark:bg-[#1E1F20]/95 border border-black/[0.08] dark:border-white/[0.08] shadow-sm backdrop-blur-md text-neutral-800 dark:text-neutral-200 hover:border-[#0B57D0] dark:hover:border-[#A8C7FA] transition-all"
          title={activeCategory === 'all' ? 'Filter by building type' : `Filter: ${activeCategory}`}
        >
          <GeminiIcon
            name="filter"
            size={13}
            className={activeCategory !== 'all' ? 'text-[#0B57D0] dark:text-[#A8C7FA]' : 'text-neutral-700 dark:text-neutral-300'}
          />
          {activeCategory !== 'all' && (
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA]" />
          )}
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            aria-label="Filter locations by building type"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full rounded-full"
          >
            <option value="all" className="dark:bg-[#1E1F20]">All Buildings ({locations.length})</option>
            <option value="lecture_hall" className="dark:bg-[#1E1F20]">Lecture Halls & Complexes</option>
            <option value="faculty" className="dark:bg-[#1E1F20]">Faculties & Departments</option>
            <option value="library_lab" className="dark:bg-[#1E1F20]">Libraries & CBT Labs</option>
            <option value="amenity" className="dark:bg-[#1E1F20]">Commercial, Hubs & Transit</option>
            <option value="admin" className="dark:bg-[#1E1F20]">Administrative Buildings</option>
          </select>
        </div>

        {/* Right: Map Layer Dropdown, Compass North Reset, and Locate Me */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Compass Bearing Indicator & Reset North Button (active when rotated) */}
          {Math.abs(rotationAngle) > 1 && (
            <button
              onClick={handleResetNorth}
              title="Reset to North"
              className="flex items-center justify-center h-7 w-7 rounded-full bg-white/95 dark:bg-[#1E1F20]/95 border border-black/[0.08] dark:border-white/[0.08] shadow-sm transition-transform active:scale-95"
            >
              <div
                style={{ transform: `rotate(${-rotationAngle}deg)` }}
                className="transition-transform duration-100 flex flex-col items-center"
              >
                <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-rose-500" />
                <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[5px] border-t-neutral-400" />
              </div>
            </button>
          )}

          {/* Compact Map Layer Dropdown (Satellite / Street) */}
          <div className="flex items-center gap-1 bg-white/95 dark:bg-[#1E1F20]/95 px-2.5 py-1.5 rounded-full backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <select
              value={mapLayer}
              onChange={(e) => setMapLayer(e.target.value as 'satellite' | 'street')}
              aria-label="Select Map Layer"
              className="bg-transparent text-[11px] font-mono text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer capitalize"
            >
              <option value="satellite" className="dark:bg-[#1E1F20]">Satellite (Sharp)</option>
              <option value="street" className="dark:bg-[#1E1F20]">Street Vector</option>
            </select>
          </div>

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
            <span className="hidden sm:inline font-sans">Locate</span>
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

      {/* Rotatable Map Container - Oversized to guarantee full coverage during rotation without distortion */}
      <div
        style={{
          transform: `rotate(${rotationAngle}deg)`,
          transformOrigin: 'center center',
          transition: isRotating ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)',
        }}
        className="absolute inset-[-35%] w-[170%] h-[170%]"
      >
        <MapContainer
          key={`${mapLayer}-${resolvedTheme}`}
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          attributionControl={false}
          className="h-full w-full"
        >
          <TileLayer
            url={activeTileUrl}
            maxZoom={20}
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          />

          {/* Anti-distortion size calibration controller */}
          <MapAntiDistortionController />

          {/* Dynamic Focus Controller */}
          <MapFocusController
            target={focusTarget || (activeLocation ? [activeLocation.latitude, activeLocation.longitude] : null)}
          />

          {/* Route Bounds Controller */}
          <RouteBoundsController
            userLocation={userLocation}
            destination={navigatingTo}
          />

          {/* Render Walking Route Polylines */}
          {routeCoordinates && (
            <>
              {/* Outer white casing for high contrast against satellite and dark terrain */}
              <Polyline
                positions={routeCoordinates}
                pathOptions={{
                  color: '#ffffff',
                  weight: 7,
                  opacity: 0.7,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              {/* Core active walking route line */}
              <Polyline
                positions={routeCoordinates}
                pathOptions={{
                  color: '#0B57D0',
                  weight: 4,
                  opacity: 0.95,
                  dashArray: '8, 8',
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </>
          )}

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
              icon={createCustomMarker(loc, activeLocation?.id === loc.id || navigatingTo?.id === loc.id)}
              eventHandlers={{
                click: () => handleMarkerClick(loc),
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Campus Map Bottom Sheet Details */}
      <LocationSheet
        location={activeLocation}
        onClose={() => setActiveLocation(null)}
        onNavigate={handleStartNavigation}
      />

      {/* Pedestrian Route Navigation HUD */}
      <CampusRouteNavigator
        userLocation={userLocation}
        destination={navigatingTo}
        onClose={handleCloseNavigation}
      />
    </div>
  );
};

export default CampusMap;

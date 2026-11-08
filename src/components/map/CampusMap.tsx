'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location, StudentProfile } from '@/lib/types';
import { LocationSheet } from './LocationSheet';
import { CampusRouteNavigator } from './CampusRouteNavigator';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { useTheme } from '@/components/ThemeProvider';
import {
  OGUN_INSTITUTIONS,
  getOgunInstitution,
  OgunCampus,
} from '@/lib/ogunInstitutionsCatalog';

interface CampusMapProps {
  locations: Location[];
  profile?: StudentProfile;
  selectedLocationId?: string | null;
  onSelectLocation?: (location: Location) => void;
  onOpenAiChat?: (initialPrompt?: string) => void;
  className?: string;
}

// Default to OOU Ago-Iwoye Main Campus (PS) Central Academic Quad
const DEFAULT_OOU_CENTER: [number, number] = [6.9185, 3.8728];
const DEFAULT_ZOOM = 17;

// Controller to smoothly fly/pan to selected location or campus center
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
  profile,
  selectedLocationId,
  onSelectLocation,
  onOpenAiChat,
  className = '',
}) => {
  const { resolvedTheme } = useTheme();

  // Match institution from user profile or default to OOU
  const initialInst = useMemo(() => {
    if (profile?.institution) {
      const found = getOgunInstitution(profile.institution);
      if (found) return found;
    }
    return OGUN_INSTITUTIONS[0]; // OOU
  }, [profile?.institution]);

  const [selectedInstId, setSelectedInstId] = useState<string>(initialInst.id || 'oou');
  const currentInstitution = useMemo(() => {
    return OGUN_INSTITUTIONS.find((i) => i.id === selectedInstId) || OGUN_INSTITUTIONS[0];
  }, [selectedInstId]);

  // Selected campus inside the chosen institution
  const [selectedCampusId, setSelectedCampusId] = useState<string>(
    currentInstitution.campuses[0]?.id || 'oou-ago-iwoye'
  );

  const currentCampus: OgunCampus = useMemo(() => {
    return (
      currentInstitution.campuses.find((c) => c.id === selectedCampusId) ||
      currentInstitution.campuses[0]
    );
  }, [currentInstitution, selectedCampusId]);

  // Synchronize campus when institution changes
  const handleInstitutionChange = (instId: string) => {
    setSelectedInstId(instId);
    const inst = OGUN_INSTITUTIONS.find((i) => i.id === instId);
    if (inst && inst.campuses.length > 0) {
      const defaultCampus = inst.campuses[0];
      setSelectedCampusId(defaultCampus.id);
      setFocusTarget([defaultCampus.latitude, defaultCampus.longitude]);
      setFocusZoom(inst.id === 'oou' ? 17 : 16);
    }
  };

  const handleCampusChange = (campusId: string) => {
    setSelectedCampusId(campusId);
    const campus = currentInstitution.campuses.find((c) => c.id === campusId);
    if (campus) {
      setFocusTarget([campus.latitude, campus.longitude]);
      setFocusZoom(17);
    }
  };

  const isOOU = currentInstitution.id === 'oou';
  const isOOUMain = isOOU && currentCampus.id === 'oou-ago-iwoye';

  // Map state
  const [activeLocation, setActiveLocation] = useState<Location | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  // Roadmap style: Google Roadmap vector by default, OpenStreetMap Roadmap as alternate
  const [mapEngine, setMapEngine] = useState<'google_roadmap' | 'osm_roadmap'>('google_roadmap');

  // Focus & Zoom Target
  const [focusTarget, setFocusTarget] = useState<[number, number] | null>(() => [
    currentCampus.latitude,
    currentCampus.longitude,
  ]);
  const [focusZoom, setFocusZoom] = useState<number>(isOOU ? DEFAULT_ZOOM : 16);

  // Two-Finger Map Rotation State (Google Maps Style)
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const touchStartAngleRef = useRef<number | null>(null);

  // Live Geolocation State
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Pedestrian Route State (for OOU)
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

  // Filter locations only when on OOU Main Campus
  const filteredLocations = useMemo(() => {
    if (!isOOUMain) return [];
    if (activeCategory === 'all') return locations;
    if (activeCategory === 'library_lab') {
      return locations.filter((l) => l.category === 'library' || l.category === 'lab');
    }
    return locations.filter((l) => l.category === activeCategory);
  }, [locations, activeCategory, isOOUMain]);

  // Handle external selection
  useEffect(() => {
    if (selectedLocationId && isOOUMain) {
      const found = locations.find(
        (l) => l.id === selectedLocationId || l.code === selectedLocationId
      );
      if (found) {
        setActiveLocation(found);
        setFocusTarget([found.latitude, found.longitude]);
        setFocusZoom(18);
      }
    }
  }, [selectedLocationId, locations, isOOUMain]);

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
        setFocusZoom(18);
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

  // Custom User Location Platinum Marker
  const createUserMarker = () => {
    return L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2" style="width: 24px; height: 24px; transform: rotate(${-rotationAngle}deg);">
          <div class="absolute inset-0 rounded-full bg-white/30 animate-ping"></div>
          <div class="relative h-4 w-4 rounded-full bg-white border-2 border-neutral-950 shadow-lg flex items-center justify-center">
            <div class="h-1.5 w-1.5 rounded-full bg-neutral-950"></div>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Clean, high-contrast pins for verified OOU Ago-Iwoye landmarks
  const createCustomMarker = (location: Location, isSelected: boolean) => {
    const code = location.code || location.name.slice(0, 4);

    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="relative flex flex-col items-center cursor-pointer group" style="width: 30px; height: 38px; transform: rotate(${-rotationAngle}deg); transform-origin: 15px 38px;">
          <!-- Floating Label Badge -->
          <div class="absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-150 z-20 ${
            isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
          }">
            <div class="px-2 py-0.5 rounded-md bg-[#0c0d10]/95 text-white text-[10px] font-mono tracking-tight whitespace-nowrap shadow-md border border-white/10 backdrop-blur-sm">
              ${location.name}
            </div>
          </div>

          <!-- Circular Pin Badge -->
          <div class="relative flex items-center justify-center w-[30px] h-[30px] rounded-full shadow-md transition-transform duration-150 ${
            isSelected
              ? 'bg-white text-neutral-950 scale-110 ring-2 ring-white/50'
              : 'bg-[#121316] text-white border-2 border-white/40'
          }">
            <span class="text-[9.5px] font-mono font-bold tracking-tighter uppercase leading-none">
              ${code.slice(0, 3)}
            </span>
          </div>

          <!-- Pin Stem -->
          <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] -mt-[1px] ${
            isSelected
              ? 'border-t-white'
              : 'border-t-white/40'
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

  // Google Roadmap vs OpenStreetMap Roadmap vector tiles
  const activeTileUrl = useMemo(() => {
    if (mapEngine === 'osm_roadmap') {
      return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
    // Google Maps Roadmap: crisp roads, street names, campus boundaries
    return 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
  }, [mapEngine]);

  const handleAskAuroraForRoom = () => {
    const prompt = `I'm at ${currentInstitution.name} (${currentCampus.name}). Can you guide me to my lecture room, faculty building, and give me the best walking route and tips from the school gate?`;
    if (onOpenAiChat) {
      onOpenAiChat(prompt);
    } else {
      window.location.search = `?tab=ai&prompt=${encodeURIComponent(prompt)}`;
    }
  };

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-[#0c0d10] font-sans ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 
        ========================================================================
        TOP FLOATING NAV CONTROLS
        Campus selector, layer switch, rotation reset, and GPS locate
        ========================================================================
      */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Ogun Institution & Campus Selectors */}
        <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap">
          {/* Institution Dropdown */}
          <div className="flex items-center bg-[#121316]/95 px-2.5 py-1.5 rounded-xl backdrop-blur-md border border-white/[0.1] shadow-md">
            <GeminiIcon name="compass" size={13} className="text-white mr-1.5 shrink-0" />
            <select
              value={selectedInstId}
              onChange={(e) => handleInstitutionChange(e.target.value)}
              aria-label="Select Ogun State Institution"
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[180px] truncate"
            >
              {OGUN_INSTITUTIONS.map((inst) => (
                <option key={inst.id} value={inst.id} className="bg-[#121316] text-white">
                  {inst.shortName} - {inst.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campus Switcher (if institution has multiple campuses, e.g. OOU, Fed Poly Ilaro, TASUED) */}
          {currentInstitution.campuses.length > 1 && (
            <div className="flex items-center bg-[#121316]/95 px-2 py-1.5 rounded-xl backdrop-blur-md border border-white/[0.1] shadow-md">
              <select
                value={selectedCampusId}
                onChange={(e) => handleCampusChange(e.target.value)}
                aria-label="Select Campus Branch"
                className="bg-transparent text-[11px] font-mono text-neutral-300 focus:outline-none cursor-pointer max-w-[120px] sm:max-w-[150px] truncate"
              >
                {currentInstitution.campuses.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#121316] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category Filter for OOU Main Campus */}
          {isOOUMain && (
            <div
              className="relative flex items-center justify-center h-8 w-8 rounded-xl bg-[#121316]/95 border border-white/[0.1] shadow-md backdrop-blur-md text-neutral-200"
              title={activeCategory === 'all' ? 'Filter building types' : `Filter: ${activeCategory}`}
            >
              <GeminiIcon
                name="filter"
                size={13}
                className={activeCategory !== 'all' ? 'text-white' : 'text-neutral-400'}
              />
              {activeCategory !== 'all' && (
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-white" />
              )}
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                aria-label="Filter locations by building type"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full rounded-xl"
              >
                <option value="all" className="bg-[#121316] text-white">All Buildings ({locations.length})</option>
                <option value="lecture_hall" className="bg-[#121316] text-white">Lecture Halls & Complexes</option>
                <option value="faculty" className="bg-[#121316] text-white">Faculties & Departments</option>
                <option value="library_lab" className="bg-[#121316] text-white">Libraries & CBT Labs</option>
                <option value="amenity" className="bg-[#121316] text-white">Commercial, Hubs & Transit</option>
                <option value="admin" className="bg-[#121316] text-white">Administrative Buildings</option>
              </select>
            </div>
          )}
        </div>

        {/* Right: Map Provider (Google Roadmap vs OSM Roadmap), Reset North, and Locate GPS */}
        <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
          {/* Compass Bearing Reset */}
          {Math.abs(rotationAngle) > 1 && (
            <button
              onClick={handleResetNorth}
              title="Reset to North"
              className="flex items-center justify-center h-8 w-8 rounded-xl bg-[#121316]/95 border border-white/[0.1] shadow-md transition-transform active:scale-95 cursor-pointer text-white"
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

          {/* Roadmap Provider Toggle (Google Roadmap / OSM Roadmap) */}
          <div className="flex items-center bg-[#121316]/95 px-2 py-1 rounded-xl backdrop-blur-md border border-white/[0.1] shadow-md">
            <select
              value={mapEngine}
              onChange={(e) => setMapEngine(e.target.value as 'google_roadmap' | 'osm_roadmap')}
              aria-label="Select Roadmap Provider"
              className="bg-transparent text-[11px] font-mono text-neutral-200 focus:outline-none cursor-pointer"
            >
              <option value="google_roadmap" className="bg-[#121316] text-white">Google Roadmap</option>
              <option value="osm_roadmap" className="bg-[#121316] text-white">OpenStreetMap</option>
            </select>
          </div>

          {/* Locate Me GPS Button */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            title="Locate me on campus"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-xl bg-[#121316]/95 text-neutral-200 border border-white/[0.1] backdrop-blur-md hover:border-white/40 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {isLocating ? (
              <div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <GeminiIcon name="compass" size={13} className="text-white" />
            )}
            <span className="hidden sm:inline font-sans font-semibold">GPS</span>
          </button>
        </div>
      </div>

      {/* Geolocation Alert Toast */}
      {locationError && (
        <div className="absolute top-16 left-3 right-3 z-30 mx-auto max-w-md p-2.5 rounded-xl bg-[#121316]/95 text-white text-xs backdrop-blur-md border border-white/10 shadow-lg flex items-center justify-between gap-2 animate-in fade-in">
          <span>{locationError}</span>
          <button
            onClick={() => setLocationError(null)}
            className="text-neutral-400 hover:text-white"
          >
            <GeminiIcon name="close" size={14} />
          </button>
        </div>
      )}

      {/* 
        ========================================================================
        ROTATABLE MAP CONTAINER (Roadmap Vector Tile Layer)
        ========================================================================
      */}
      <div
        style={{
          transform: `rotate(${rotationAngle}deg)`,
          transformOrigin: 'center center',
          transition: isRotating ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)',
        }}
        className="absolute inset-[-35%] w-[170%] h-[170%]"
      >
        <MapContainer
          key={`${mapEngine}-${selectedCampusId}`}
          center={[currentCampus.latitude, currentCampus.longitude]}
          zoom={focusZoom}
          scrollWheelZoom={true}
          attributionControl={false}
          className="h-full w-full"
        >
          <TileLayer
            url={activeTileUrl}
            maxZoom={20}
            subdomains={mapEngine === 'google_roadmap' ? ['mt0', 'mt1', 'mt2', 'mt3'] : ['a', 'b', 'c']}
          />

          <MapAntiDistortionController />

          <MapFocusController
            target={focusTarget || [currentCampus.latitude, currentCampus.longitude]}
            zoom={focusZoom}
          />

          <RouteBoundsController
            userLocation={userLocation}
            destination={navigatingTo}
          />

          {/* Walking Route Polylines (for OOU) */}
          {routeCoordinates && (
            <>
              <Polyline
                positions={routeCoordinates}
                pathOptions={{
                  color: '#000000',
                  weight: 7,
                  opacity: 0.8,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              <Polyline
                positions={routeCoordinates}
                pathOptions={{
                  color: '#FFFFFF',
                  weight: 4,
                  opacity: 0.95,
                  dashArray: '8, 8',
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </>
          )}

          {/* Render User GPS Platinum Marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={createUserMarker()}
            />
          )}

          {/* 
            Render Location Markers: ONLY for OOU Main Campus (Ago-Iwoye PS).
            For other institutions in Ogun State, we do NOT clutter or fabricate names,
            showing their pristine roadmap cartography and providing the AI guide card instead.
          */}
          {isOOUMain &&
            filteredLocations.map((loc) => (
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

      {/* 
        ========================================================================
        NON-OOU INSTITUTIONS: FLOATING AI CAMPUS NAVIGATOR CARD
        Clean, uncluttered roadmap view with instant AI lecture room assistance
        ========================================================================
      */}
      {!isOOUMain && (
        <div className="absolute bottom-4 left-3 right-3 z-30 mx-auto max-w-lg">
          <div className="rounded-2xl bg-[#121316]/95 backdrop-blur-xl border border-white/[0.1] p-4 shadow-2xl flex flex-col gap-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-bold uppercase">
                    {currentInstitution.shortName}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {currentCampus.name}
                  </span>
                </div>
                <p className="text-[11.5px] text-neutral-300 leading-snug">
                  {currentCampus.transitTips || currentInstitution.aiCampusKnowledge.overview}
                </p>
              </div>

              <div className="h-9 w-9 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
                <GeminiIcon name="sparkle" size={17} />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
              <button
                onClick={handleAskAuroraForRoom}
                className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold shadow-md shadow-white/10 transition-all active:scale-95 cursor-pointer"
              >
                <GeminiIcon name="chat" size={14} />
                <span>Ask Aurora: Find My Lecture Room</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OOU Details Bottom Sheet */}
      {isOOUMain && (
        <LocationSheet
          location={activeLocation}
          onClose={() => setActiveLocation(null)}
          onNavigate={handleStartNavigation}
        />
      )}

      {/* Pedestrian Route Navigation HUD (for OOU) */}
      {isOOUMain && (
        <CampusRouteNavigator
          userLocation={userLocation}
          destination={navigatingTo}
          onClose={handleCloseNavigation}
        />
      )}
    </div>
  );
};

export default CampusMap;

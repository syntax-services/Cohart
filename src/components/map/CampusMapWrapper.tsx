'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Location } from '@/lib/types';
import { MapPin, Loader2 } from 'lucide-react';

interface CampusMapWrapperProps {
  locations: Location[];
  selectedLocationId?: string | null;
  onSelectLocation?: (location: Location) => void;
  className?: string;
}

// Industrial Bento Skeleton Loader while Leaflet loads client-side
const MapSkeleton = () => (
  <div className="relative flex h-full w-full flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0A0E17] p-6 overflow-hidden">
    {/* Ambient radial glow */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,240,255,0.06)_0%,_transparent_70%)]" />

    {/* Subtle grid pattern */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]" />

    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] border border-[#00F0FF]/30 text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.2)] mb-3 animate-pulse">
        <MapPin className="h-6 w-6" />
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-white">
        <Loader2 className="h-4 w-4 animate-spin text-[#00F0FF]" />
        <span>Initializing OOU Campus Navigator...</span>
      </div>
      <p className="mt-1 font-mono text-[11px] text-slate-500">
        Calibrating Ago-Iwoye Main Campus Coordinates (6.9225° N, 3.8714° E)
      </p>
    </div>
  </div>
);

// Dynamic import with SSR disabled to prevent window is not defined server errors
const DynamicCampusMap = dynamic(
  () => import('./CampusMap').then((mod) => mod.CampusMap),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

export const CampusMapWrapper: React.FC<CampusMapWrapperProps> = (props) => {
  return <DynamicCampusMap {...props} />;
};

export default CampusMapWrapper;

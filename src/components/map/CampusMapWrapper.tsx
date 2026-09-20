'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Location } from '@/lib/types';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';

interface CampusMapWrapperProps {
  locations: Location[];
  selectedLocationId?: string | null;
  onSelectLocation?: (location: Location) => void;
  className?: string;
}

// Minimalist Gemini Skeleton Loader while Leaflet loads client-side
const MapSkeleton = () => (
  <div className="relative flex h-full w-full flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#06080D] p-6 overflow-hidden">
    {/* Ambient blue glow */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(56,123,255,0.08)_0%,_transparent_70%)]" />

    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-[#387BFF]/30 text-[#387BFF] shadow-[0_0_20px_rgba(56,123,255,0.2)] mb-3 animate-pulse">
        <GeminiIcon name="compass" size={24} />
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-white font-sans">
        <div className="h-3.5 w-3.5 rounded-full border-2 border-[#387BFF] border-t-transparent animate-spin" />
        <span>Initializing OOU Campus Navigator...</span>
      </div>
      <p className="mt-1 font-mono text-[11px] text-slate-500">
        Ago-Iwoye Main Campus Coordinates (6.9225° N, 3.8714° E)
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

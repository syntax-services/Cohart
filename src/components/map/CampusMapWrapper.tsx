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
  <div className="relative flex h-full w-full flex-col items-center justify-center rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#1E1F20] p-6 overflow-hidden">
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA] mb-3">
        <GeminiIcon name="compass" size={22} />
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-neutral-800 dark:text-neutral-200 font-sans">
        <div className="h-3.5 w-3.5 rounded-full border-2 border-[#0B57D0] dark:border-[#A8C7FA] border-t-transparent animate-spin" />
        <span>Loading Campus Navigator...</span>
      </div>
      <p className="mt-1 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
        Ago-Iwoye Main Campus (6.9225° N, 3.8714° E)
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

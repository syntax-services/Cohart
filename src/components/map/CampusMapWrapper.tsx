'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Location, StudentProfile } from '@/lib/types';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { CampusIsometricMap } from './CampusIsometricMap';

interface CampusMapWrapperProps {
  locations: Location[];
  profile?: StudentProfile;
  selectedLocationId?: string | null;
  onSelectLocation?: (location: Location) => void;
  className?: string;
}

const MapSkeleton = () => (
  <div className="relative flex h-full w-full flex-col items-center justify-center rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#1E1F20] p-6 overflow-hidden">
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 text-[#0B57D0] dark:text-[#1A73E8] mb-3">
        <GeminiIcon name="compass" size={22} />
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-neutral-800 dark:text-neutral-200 font-sans">
        <div className="h-3.5 w-3.5 rounded-full border-2 border-[#0B57D0] dark:border-[#1A73E8] border-t-transparent animate-spin" />
        <span>Loading Campus Navigator...</span>
      </div>
      <p className="mt-1 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
        Ago-Iwoye Main Campus (6.9225° N, 3.8714° E)
      </p>
    </div>
  </div>
);

const DynamicCampusMap = dynamic(
  () => import('./CampusMap').then((mod) => mod.CampusMap),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

export const CampusMapWrapper: React.FC<CampusMapWrapperProps> = (props) => {
  // Default to 3D Isometric Map for native performance & offline speed
  const [mapEngine, setMapEngine] = useState<'3d_isometric' | 'satellite'>('3d_isometric');

  return (
    <div className="relative h-full w-full">
      {/* Map Engine Mode Switcher Pill */}
      <div className="absolute top-3.5 right-16 z-30 flex items-center p-0.5 rounded-xl bg-white/95 dark:bg-[#1A1D27]/95 border border-black/[0.08] dark:border-white/[0.1] shadow-md backdrop-blur-md">
        <button
          type="button"
          onClick={() => setMapEngine('3d_isometric')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
            mapEngine === '3d_isometric'
              ? 'bg-[#0B57D0] dark:bg-[#1A73E8] text-white font-bold shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <span>3D Isometric</span>
        </button>

        <button
          type="button"
          onClick={() => setMapEngine('satellite')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
            mapEngine === 'satellite'
              ? 'bg-[#0B57D0] dark:bg-[#1A73E8] text-white font-bold shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <span>Satellite</span>
        </button>
      </div>

      {mapEngine === '3d_isometric' ? (
        <CampusIsometricMap {...props} />
      ) : (
        <DynamicCampusMap {...props} />
      )}
    </div>
  );
};

export default CampusMapWrapper;

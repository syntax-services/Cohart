'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Location, StudentProfile } from '@/lib/types';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';

interface CampusMapWrapperProps {
  locations: Location[];
  profile?: StudentProfile;
  selectedLocationId?: string | null;
  onSelectLocation?: (location: Location) => void;
  onOpenAiChat?: (initialPrompt?: string) => void;
  className?: string;
}

const MapSkeleton = () => (
  <div className="relative flex h-full w-full flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#121316] p-6 overflow-hidden">
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white border border-white/20 mb-3">
        <GeminiIcon name="compass" size={22} />
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-neutral-200 font-sans">
        <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        <span>Loading Ogun Campus Cartography...</span>
      </div>
      <p className="mt-1 font-mono text-[11px] text-neutral-400">
        Roadmap Vector View • Ogun State Summit Edition
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
  return (
    <div className="relative h-full w-full">
      <DynamicCampusMap {...props} />
    </div>
  );
};

export default CampusMapWrapper;

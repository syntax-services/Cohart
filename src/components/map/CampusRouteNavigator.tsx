'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Location } from '@/lib/types';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';

interface CampusRouteNavigatorProps {
  userLocation: [number, number] | null;
  destination: Location | null;
  onClose: () => void;
}

// Calculate distance in meters using the Haversine formula
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const CampusRouteNavigator: React.FC<CampusRouteNavigatorProps> = ({
  userLocation,
  destination,
  onClose,
}) => {
  if (!destination) return null;

  const distanceMeters = userLocation
    ? calculateDistanceMeters(
        userLocation[0],
        userLocation[1],
        destination.latitude,
        destination.longitude
      )
    : null;

  // Average walking speed ~ 75 meters / minute on campus footpaths
  const walkingTimeMinutes = distanceMeters
    ? Math.max(1, Math.round(distanceMeters / 75))
    : null;

  const formattedDistance =
    distanceMeters !== null
      ? distanceMeters >= 1000
        ? `${(distanceMeters / 1000).toFixed(1)} km`
        : `${distanceMeters} m`
      : 'Calculating...';

  const openGoogleMaps = () => {
    const originParam = userLocation
      ? `&origin=${userLocation[0]},${userLocation[1]}`
      : '';
    window.open(
      `https://www.google.com/maps/dir/?api=1${originParam}&destination=${destination.latitude},${destination.longitude}&travelmode=walking`,
      '_blank'
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute bottom-5 left-3 right-3 sm:left-4 sm:right-auto sm:w-[380px] z-40"
      >
        <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.12] bg-white/95 dark:bg-[#1E1F20]/95 p-4 backdrop-blur-xl shadow-2xl text-neutral-900 dark:text-neutral-100">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0B57D0] dark:text-[#A8C7FA]">
                Walking Route
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              title="Close navigation route"
            >
              <GeminiIcon name="close" size={14} />
            </button>
          </div>

          {/* Time & Distance Highlight */}
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white">
                {walkingTimeMinutes ? `${walkingTimeMinutes} min` : 'Direct Path'}
              </span>
              <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                ({formattedDistance})
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA] font-medium">
              On Foot
            </span>
          </div>

          {/* Destination Details */}
          <div className="mt-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] p-2.5 border border-black/[0.04] dark:border-white/[0.04]">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#0B57D0] text-white text-[10px] font-mono font-bold">
                {destination.code?.slice(0, 3) || 'GO'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                  {destination.name}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  {destination.faculty} {destination.department ? `• ${destination.department}` : ''}
                </p>
              </div>
            </div>

            {destination.orientation_tips && (
              <p className="mt-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.04] text-[11px] text-neutral-600 dark:text-neutral-300 leading-snug">
                <span className="font-medium text-[#0B57D0] dark:text-[#A8C7FA]">Directions: </span>
                {destination.orientation_tips}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors text-center"
            >
              Close
            </button>
            <button
              onClick={openGoogleMaps}
              className="flex-1 py-2 px-3 rounded-xl bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-mono font-semibold hover:opacity-90 transition-opacity text-center flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Open in Maps</span>
              <GeminiIcon name="sparkle" size={12} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

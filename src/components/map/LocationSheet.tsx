'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Location } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';

interface LocationSheetProps {
  location: Location | null;
  onClose: () => void;
}

export const LocationSheet: React.FC<LocationSheetProps> = ({ location, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleShare = () => {
    if (!location) return;
    const text = `${location.name} (${location.code}) - OOU Ago-Iwoye\nCoords: ${location.latitude}, ${location.longitude}\nTips: ${location.orientation_tips}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openGoogleMaps = () => {
    if (!location) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`,
      '_blank'
    );
  };

  return (
    <AnimatePresence>
      {location && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-xs"
          />

          {/* Sliding Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-black/[0.08] dark:border-white/[0.12] bg-white/95 dark:bg-[#1E1F20]/95 p-5 sm:p-6 backdrop-blur-xl shadow-xl text-neutral-900 dark:text-neutral-100"
          >
            {/* Grab handle indicator */}
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-300 dark:bg-neutral-600" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0B57D0] dark:text-[#A8C7FA]">
                    {location.code || 'VENUE'}
                  </span>
                  <Badge variant="blue" size="sm">
                    {location.category.replace('_', ' ')}
                  </Badge>
                  {location.capacity && (
                    <Badge variant="slate" size="sm">
                      <span>{location.capacity} seats</span>
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold tracking-tight font-sans">
                  {location.name}
                </h3>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  {location.faculty} {location.department ? `• Dept. of ${location.department}` : ''}
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-full bg-black/[0.04] dark:bg-white/[0.06] p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                aria-label="Close details"
              >
                <GeminiIcon name="close" size={16} />
              </button>
            </div>

            {/* Description & Orientation Tips */}
            <div className="mt-4 space-y-3">
              <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                {location.description}
              </p>

              {/* Orientation Guide Box */}
              <div className="rounded-xl border border-[#0B57D0]/20 dark:border-[#A8C7FA]/20 bg-[#0B57D0]/[0.03] dark:bg-[#A8C7FA]/[0.04] p-3.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0B57D0] dark:text-[#A8C7FA]">
                  <GeminiIcon name="compass" size={15} />
                  <span>Resumption Orientation Tip</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {location.orientation_tips}
                </p>
              </div>

              {/* Coordinates line */}
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <GeminiIcon name="pin" size={13} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
                  {location.latitude.toFixed(5)}° N, {location.longitude.toFixed(5)}° E
                </span>
                <span>OOU Ago-Iwoye Main Site</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={openGoogleMaps}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0B57D0] dark:bg-[#A8C7FA] px-4 py-2.5 text-xs font-semibold text-white dark:text-neutral-950 transition-transform duration-150 hover:opacity-95 active:scale-[0.98]"
              >
                <GeminiIcon name="compass" size={15} />
                <span>Start Direction</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 rounded-xl border border-black/[0.1] dark:border-white/[0.12] bg-black/[0.02] dark:bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-neutral-800 dark:text-white transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-[0.98]"
              >
                <GeminiIcon name={copied ? 'check' : 'share'} size={15} />
                <span>{copied ? 'Copied Link' : 'Share Details'}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

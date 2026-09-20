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
            className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Sliding Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/[0.12] bg-[#0A0E18]/95 p-5 sm:p-6 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
          >
            {/* Grab handle indicator */}
            <div className="mx-auto mb-3.5 h-1.5 w-12 rounded-full bg-slate-700/60" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#60A5FA]">
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
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
                  {location.name}
                </h3>
                <p className="mt-0.5 text-xs text-slate-400 font-medium">
                  {location.faculty} {location.department ? `• Dept. of ${location.department}` : ''}
                </p>
              </div>

              <button
                onClick={onClose}
                className="rounded-full bg-white/[0.06] p-2 text-slate-400 hover:bg-white/[0.12] hover:text-white transition-colors"
                aria-label="Close details"
              >
                <GeminiIcon name="close" size={16} />
              </button>
            </div>

            {/* Description & Orientation Tips */}
            <div className="mt-4 space-y-3">
              <p className="text-xs leading-relaxed text-slate-300">
                {location.description}
              </p>

              {/* Orientation Guide Box */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-3.5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#60A5FA]">
                  <GeminiIcon name="compass" size={15} />
                  <span>Resumption Orientation Tip</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                  {location.orientation_tips}
                </p>
              </div>

              {/* Coordinates line */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <GeminiIcon name="pin" size={13} className="text-[#387BFF]" />
                  {location.latitude.toFixed(5)}° N, {location.longitude.toFixed(5)}° E
                </span>
                <span className="text-slate-400">OOU Ago-Iwoye Main Site</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={openGoogleMaps}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1A73E8] to-[#387BFF] px-4 py-2.5 text-xs font-semibold text-white transition-transform duration-200 hover:opacity-95 active:scale-[0.98] shadow-[0_0_20px_rgba(56,123,255,0.3)]"
              >
                <GeminiIcon name="compass" size={15} />
                <span>Start Direction</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.05] px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-white/[0.1] active:scale-[0.98]"
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

'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Location } from '@/lib/types';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';

interface LocationSheetProps {
  location: Location | null;
  onClose: () => void;
  onNavigate?: (location: Location) => void;
}

export const LocationSheet: React.FC<LocationSheetProps> = ({
  location,
  onClose,
  onNavigate,
}) => {
  const [copied, setCopied] = React.useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef<number | null>(null);

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
      `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}&travelmode=walking`,
      '_blank'
    );
  };

  // Scroll to terminate / pull down to dismiss handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartYRef.current;
    // If the user pulls down when the scroll container is at the top, dismiss the sheet!
    if (deltaY > 90 && scrollRef.current && scrollRef.current.scrollTop <= 0) {
      touchStartYRef.current = null;
      onClose();
    }
  };

  const handleTouchEnd = () => {
    touchStartYRef.current = null;
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 80 || info.velocity.y > 350) {
      onClose();
    }
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

          {/* Sliding & Draggable Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.45 }}
            onDragEnd={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="absolute inset-x-0 bottom-0 z-50 max-h-[85vh] flex flex-col rounded-t-3xl border-t border-black/[0.08] dark:border-white/[0.12] bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-xl shadow-2xl text-neutral-900 dark:text-neutral-100 overflow-hidden"
          >
            {/* Sticky Header - Grab Handle, Title & Always Visible Exit Button */}
            <div className="sticky top-0 z-20 shrink-0 bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-xl pt-3 px-5 pb-3 border-b border-black/[0.05] dark:border-white/[0.05]">
              {/* Grab handle indicator */}
              <div className="mx-auto mb-2.5 h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-600 cursor-grab active:cursor-grabbing" />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0B57D0] dark:text-[#A8C7FA]">
                      {location.code || 'VENUE'}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500 capitalize">
                      {location.category.replace('_', ' ')}
                    </span>
                    {location.capacity && (
                      <span className="text-[11px] font-mono text-neutral-400">
                        • {location.capacity} seats
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold tracking-tight font-sans truncate">
                    {location.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium truncate">
                    {location.faculty} {location.department ? `• ${location.department}` : ''}
                  </p>
                </div>

                {/* Always-Visible Exit / Terminate Button */}
                <button
                  onClick={onClose}
                  className="shrink-0 rounded-full bg-black/[0.05] dark:bg-white/[0.08] p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.1] dark:hover:bg-white/[0.15] transition-all active:scale-95"
                  aria-label="Close details"
                  title="Close details (or scroll/drag down)"
                >
                  <GeminiIcon name="close" size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Body Content */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 pb-6 pt-2 space-y-3 overscroll-contain"
            >
              {/* Chronological Photo Gallery (Newest till Oldest) - Compact & Elegant */}
              {location.images && location.images.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                      Photos ({location.images.length})
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1 snap-x">
                    {location.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative shrink-0 w-44 sm:w-52 h-24 sm:h-28 rounded-lg overflow-hidden border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.04] snap-start group"
                      >
                        <img
                          src={img.url}
                          alt={img.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2 text-white">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            {img.year && (
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/20 backdrop-blur-xs font-semibold">
                                {img.year} {idx === 0 ? '• Recent' : '• Archive'}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-sans font-medium line-clamp-1 leading-tight">
                            {img.caption}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description & Orientation Tips */}
              <div className="space-y-2.5">
                <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {location.description}
                </p>

                {/* Orientation Guide Box */}
                <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    <GeminiIcon name="compass" size={14} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
                    <span>How to Get Here</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {location.orientation_tips}
                  </p>
                </div>

                {/* Coordinates line */}
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <GeminiIcon name="pin" size={13} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
                    {location.latitude.toFixed(5)}° N, {location.longitude.toFixed(5)}° E
                  </span>
                  <span>OOU Main Site</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-3 gap-2">
                {onNavigate && (
                  <button
                    onClick={() => onNavigate(location)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#0B57D0] dark:bg-[#A8C7FA] px-3 py-2.5 text-xs font-semibold text-white dark:text-neutral-950 transition-transform duration-150 hover:opacity-95 active:scale-[0.98]"
                  >
                    <GeminiIcon name="compass" size={14} />
                    <span>Show Route</span>
                  </button>
                )}

                <button
                  onClick={openGoogleMaps}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border border-black/[0.1] dark:border-white/[0.12] bg-black/[0.02] dark:bg-white/[0.04] px-3 py-2.5 text-xs font-medium text-neutral-800 dark:text-white transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-[0.98] ${
                    !onNavigate ? 'col-span-2' : ''
                  }`}
                >
                  <GeminiIcon name="sparkle" size={14} />
                  <span>Google Maps</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-black/[0.1] dark:border-white/[0.12] bg-black/[0.02] dark:bg-white/[0.04] px-3 py-2.5 text-xs font-medium text-neutral-800 dark:text-white transition-colors hover:bg-black/[0.05] dark:hover:bg-white/[0.08] active:scale-[0.98]"
                >
                  <GeminiIcon name={copied ? 'check' : 'share'} size={14} />
                  <span>{copied ? 'Copied' : 'Share'}</span>
                </button>
              </div>

              {/* Scroll down to close hint */}
              <div className="pt-1 text-center">
                <button
                  onClick={onClose}
                  className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                >
                  Drag down or tap X to close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

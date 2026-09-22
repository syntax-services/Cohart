'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { SUPPORTED_INSTITUTIONS, Institution } from '@/lib/types';

interface UniversityComboboxProps {
  value: string;
  onChange: (institutionCode: string, institutionName?: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const UniversityCombobox: React.FC<UniversityComboboxProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Search Nigerian public university...',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Federal' | 'State'>('All');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Find currently selected institution
  const selectedInstitution = useMemo(() => {
    return (
      SUPPORTED_INSTITUTIONS.find(
        (inst) => inst.id.toLowerCase() === (value || '').toLowerCase()
      ) ||
      SUPPORTED_INSTITUTIONS.find((inst) => inst.id === 'OOU') ||
      SUPPORTED_INSTITUTIONS[0]
    );
  }, [value]);

  // Filter institutions by search query and category
  const filteredInstitutions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SUPPORTED_INSTITUTIONS.filter((inst) => {
      // Category filter
      if (categoryFilter !== 'All' && inst.category !== categoryFilter) {
        return false;
      }
      // Search query filter
      if (!q) return true;
      return (
        inst.shortName.toLowerCase().includes(q) ||
        inst.name.toLowerCase().includes(q) ||
        inst.locationState.toLowerCase().includes(q) ||
        (inst.city && inst.city.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, categoryFilter]);

  // Counts for tabs
  const federalCount = useMemo(
    () => SUPPORTED_INSTITUTIONS.filter((i) => i.category === 'Federal').length,
    []
  );
  const stateCount = useMemo(
    () => SUPPORTED_INSTITUTIONS.filter((i) => i.category === 'State').length,
    []
  );

  // Click outside to dismiss
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredInstitutions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredInstitutions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredInstitutions[highlightedIndex]) {
          const item = filteredInstitutions[highlightedIndex];
          onChange(item.id, item.name);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Scroll active item into view when navigating via keyboard
  useEffect(() => {
    if (listRef.current && isOpen) {
      const activeEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (inst: Institution) => {
    onChange(inst.id, inst.name);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-[11px] font-mono text-neutral-500 uppercase mb-1">
          {label}
        </label>
      )}

      {/* Custom Trigger Button (No device picker) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-between gap-2.5 ${
          isOpen
            ? 'bg-neutral-100 dark:bg-[#1E1F20] border-[#0B57D0] dark:border-[#A8C7FA] ring-2 ring-[#0B57D0]/20'
            : 'bg-neutral-50 dark:bg-[#1E1F20] hover:bg-neutral-100/80 dark:hover:bg-[#252729] border-black/[0.08] dark:border-white/[0.08]'
        } border ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Acronym Badge */}
          <span
            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 border ${
              selectedInstitution.category === 'Federal'
                ? 'bg-[#0B57D0]/10 border-[#0B57D0]/25 text-[#0B57D0] dark:text-[#A8C7FA]'
                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {selectedInstitution.shortName}
          </span>

          {/* Institution Info */}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium text-neutral-900 dark:text-white truncate">
              {selectedInstitution.name}
            </div>
            <div className="text-[10px] font-mono text-neutral-500 truncate flex items-center gap-1.5 mt-0.5">
              <span>{selectedInstitution.locationState}</span>
              <span>•</span>
              <span>{selectedInstitution.category}</span>
              {selectedInstitution.hasMap && (
                <>
                  <span>•</span>
                  <span className="text-[#0B57D0] dark:text-[#A8C7FA] font-semibold">
                    Live Map
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chevron Indicator */}
        <div
          className={`shrink-0 text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-neutral-900 dark:text-white' : ''
          }`}
        >
          <GeminiIcon name="chevron-down" size={16} />
        </div>
      </button>

      {/* Dropdown Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-0 right-0 z-50 mt-1.5 rounded-2xl bg-white/95 dark:bg-[#18191A]/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] shadow-2xl shadow-black/25 overflow-hidden"
            role="listbox"
          >
            {/* Search Bar Input */}
            <div className="p-2.5 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div className="relative flex items-center">
                <div className="absolute left-3 text-neutral-400 pointer-events-none">
                  <GeminiIcon name="search" size={14} />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="w-full pl-8 pr-8 py-2 text-xs bg-neutral-100 dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
                  >
                    <GeminiIcon name="close" size={12} />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('All')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium transition-colors ${
                    categoryFilter === 'All'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 dark:bg-white/[0.05] dark:text-neutral-400 dark:hover:bg-white/[0.1]'
                  }`}
                >
                  All ({SUPPORTED_INSTITUTIONS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('Federal')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium transition-colors ${
                    categoryFilter === 'Federal'
                      ? 'bg-[#0B57D0] text-white dark:bg-[#A8C7FA] dark:text-neutral-950'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 dark:bg-white/[0.05] dark:text-neutral-400 dark:hover:bg-white/[0.1]'
                  }`}
                >
                  Federal ({federalCount})
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('State')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium transition-colors ${
                    categoryFilter === 'State'
                      ? 'bg-emerald-600 text-white dark:bg-emerald-400 dark:text-neutral-950'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80 dark:bg-white/[0.05] dark:text-neutral-400 dark:hover:bg-white/[0.1]'
                  }`}
                >
                  State ({stateCount})
                </button>
              </div>
            </div>

            {/* University List */}
            <div
              ref={listRef}
              className="max-h-64 overflow-y-auto p-1.5 space-y-1 overscroll-contain"
            >
              {filteredInstitutions.length === 0 ? (
                <div className="py-6 px-4 text-center">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    No public universities match &quot;{searchQuery}&quot;
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('All');
                      searchInputRef.current?.focus();
                    }}
                    className="mt-2 text-[11px] font-mono text-[#0B57D0] dark:text-[#A8C7FA] hover:underline"
                  >
                    Clear search filter
                  </button>
                </div>
              ) : (
                filteredInstitutions.map((inst, index) => {
                  const isSelected = inst.id === selectedInstitution.id;
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <button
                      key={inst.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(inst)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 border border-[#0B57D0]/20 dark:border-[#A8C7FA]/20'
                          : isHighlighted
                          ? 'bg-neutral-100 dark:bg-white/[0.06] border border-transparent'
                          : 'hover:bg-neutral-50 dark:hover:bg-white/[0.03] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {/* Short code chip */}
                        <span
                          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 border ${
                            inst.category === 'Federal'
                              ? 'bg-[#0B57D0]/10 border-[#0B57D0]/20 text-[#0B57D0] dark:text-[#A8C7FA]'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          {inst.shortName}
                        </span>

                        {/* Name and State */}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-neutral-900 dark:text-white truncate">
                            {inst.name}
                          </div>
                          <div className="text-[10px] font-mono text-neutral-500 truncate flex items-center gap-1.5 mt-0.5">
                            <span>{inst.locationState}</span>
                            <span>•</span>
                            <span>{inst.category}</span>
                            {inst.hasMap && (
                              <>
                                <span>•</span>
                                <span className="text-[#0B57D0] dark:text-[#A8C7FA] font-semibold">
                                  Live Map
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Selected Checkmark */}
                      {isSelected && (
                        <div className="shrink-0 text-[#0B57D0] dark:text-[#A8C7FA]">
                          <GeminiIcon name="check" size={14} />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Micro Footer Notice */}
            <div className="px-3 py-1.5 bg-neutral-50/50 dark:bg-white/[0.02] border-t border-black/[0.04] dark:border-white/[0.04] text-[10px] font-mono text-neutral-400 text-center">
              Accredited Federal & State Public Universities
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

'use client';

import React from 'react';

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  subtitle?: string;
}

/**
 * Aurora Extraterrestrial Liquid Glass Glyph & Uncrossed Wordmark
 * 
 * - Glyph: An uncrossed, curved parabolic arch 'Λ' without any middle horizontal crossbar.
 *   Crafted with extraterrestrial contours, liquid glass refractions, specular highlights,
 *   and an inner photonic singularity core.
 * - Wordmark: "ΛURORΛ" where both 'A's have NO horizontal crossbars, giving it an undeniable
 *   extraterrestrial civilization aesthetic, accompanied by the liquid glass "OS" badge.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 32,
  showText = true,
  className = '',
  subtitle = 'Intelligence',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Extraterrestrial Liquid Glass Glyph */}
      <div 
        className="relative flex items-center justify-center transition-transform duration-300 hover:scale-105 shrink-0"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 200 200" 
          width={size} 
          height={size} 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            {/* Extraterrestrial Liquid Glass Body */}
            <linearGradient id="auroraExtraterrestrialBody" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A8C7FA" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#8AB4F8" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#1A73E8" stopOpacity="0.85" />
              <stop offset="85%" stopColor="#0B57D0" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0842A0" stopOpacity="1" />
            </linearGradient>

            {/* Specular Refractive Surface Sheen (Liquid Glass) */}
            <linearGradient id="auroraGlassSheen" x1="50" y1="25" x2="100" y2="130" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <stop offset="80%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Inner Bioluminescent Caustic Glow */}
            <radialGradient id="auroraCoreHalo" cx="100" cy="65" r="85" fx="100" fy="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D2E3FC" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#1A73E8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0B57D0" stopOpacity="0" />
            </radialGradient>

            {/* Extraterrestrial Halo Diffuser */}
            <filter id="alienGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Sub-surface Caustic Orbit */}
          <ellipse cx="100" cy="100" rx="60" ry="65" fill="url(#auroraCoreHalo)" opacity="0.4" />

          {/* Primary Monolithic Uncrossed 'Λ' Extraterrestrial Arch */}
          <path
            d="M 44 168 
               C 38 168, 34 161, 37 153 
               C 44 128, 60 76, 84 42 
               C 91 32, 95 28, 100 28 
               C 105 28, 109 32, 116 42 
               C 140 76, 156 128, 163 153 
               C 166 161, 162 168, 156 168 
               C 148 168, 138 168, 132 168 
               C 126 168, 122 163, 120 155 
               C 114 133, 106 96, 100 74 
               C 94 96, 86 133, 80 155 
               C 78 163, 74 168, 68 168 
               Z"
            fill="url(#auroraExtraterrestrialBody)"
            filter="url(#alienGlowFilter)"
          />

          {/* Liquid Glass Internal Specular Refraction */}
          <path
            d="M 50 162 
               C 56 138, 70 88, 88 54 
               C 93 45, 96 42, 100 42 
               C 104 42, 107 45, 112 54 
               C 130 88, 144 138, 150 162 
               C 145 162, 139 162, 134 162 
               C 127 137, 116 98, 100 70 
               C 84 98, 73 137, 66 162 
               Z"
            fill="url(#auroraGlassSheen)"
            opacity="0.55"
          />

          {/* Left Arch Specular Light Ribbon */}
          <path
            d="M 82 44 
               C 88 33, 93 30, 100 30 
               C 105 30, 110 33, 115 42"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.95"
          />

          {/* Extraterrestrial Apex Singularity Orb */}
          <circle cx="100" cy="52" r="4" fill="#FFFFFF" opacity="0.95" />
          <circle cx="100" cy="52" r="9" fill="#A8C7FA" opacity="0.4" />
        </svg>
      </div>

      {/* Extraterrestrial Wordmark: Uncrossed A's (ΛURORΛ) */}
      {showText && (
        <div className="flex flex-col shrink-0">
          <div className="flex items-center gap-1.5">
            {/* Custom SVG Uncrossed Typographic Wordmark for AURORA */}
            <svg 
              viewBox="0 0 110 22" 
              className="h-4 sm:h-[18px] w-auto overflow-visible fill-neutral-900 dark:fill-white transition-colors"
              aria-label="AURORA"
            >
              {/* Glyph 1: Uncrossed Λ */}
              <path d="M 2 20 L 9 3 C 9.5 2 10.5 2 11 3 L 18 20 L 14.5 20 L 10 7.5 L 5.5 20 Z" />

              {/* Glyph 2: U */}
              <path d="M 23 3 L 26.5 3 L 26.5 13.5 C 26.5 16.5 28 18 31 18 C 34 18 35.5 16.5 35.5 13.5 L 35.5 3 L 39 3 L 39 13.5 C 39 18.5 36 21 31 21 C 26 21 23 18.5 23 13.5 Z" />

              {/* Glyph 3: R */}
              <path d="M 44 3 L 52 3 C 55.5 3 57.5 4.8 57.5 8 C 57.5 10.5 56 12 53.5 12.6 L 58 20 L 54 20 L 50 13.5 L 47.5 13.5 L 47.5 20 L 44 20 Z M 47.5 10.5 L 51.5 10.5 C 53.5 10.5 54.2 9.5 54.2 8 C 54.2 6.5 53.5 5.8 51.5 5.8 L 47.5 5.8 Z" />

              {/* Glyph 4: O */}
              <path d="M 69 2.5 C 74.5 2.5 78.5 6.5 78.5 12 C 78.5 17.5 74.5 21.5 69 21.5 C 63.5 21.5 59.5 17.5 59.5 12 C 59.5 6.5 63.5 2.5 69 2.5 Z M 69 5.5 C 65.5 5.5 63 8.2 63 12 C 63 15.8 65.5 18.5 69 18.5 C 72.5 18.5 75 15.8 75 12 C 75 8.2 72.5 5.5 69 5.5 Z" />

              {/* Glyph 5: R */}
              <path d="M 83 3 L 91 3 C 94.5 3 96.5 4.8 96.5 8 C 96.5 10.5 95 12 92.5 12.6 L 97 20 L 93 20 L 89 13.5 L 86.5 13.5 L 86.5 20 L 83 20 Z M 86.5 10.5 L 90.5 10.5 C 92.5 10.5 93.2 9.5 93.2 8 C 93.2 6.5 92.5 5.8 90.5 5.8 L 86.5 5.8 Z" />

              {/* Glyph 6: Uncrossed Λ */}
              <path d="M 100 20 L 107 3 C 107.5 2 108.5 2 109 3 L 116 20 L 112.5 20 L 108 7.5 L 103.5 20 Z" />
            </svg>

            {/* Liquid Glass OS Badge */}
            <span className="px-1.5 py-0.2 text-[8.5px] font-mono tracking-wider text-[#0B57D0] dark:text-[#8AB4F8] bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 rounded-full border border-[#0B57D0]/20 dark:border-[#1A73E8]/25 font-bold shadow-xs">
              OS
            </span>
          </div>

          {/* Subtitle */}
          <span className="text-[9px] text-neutral-400 dark:text-neutral-500 tracking-[0.2em] uppercase font-mono mt-0.5">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};

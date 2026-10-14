'use client';

import React from 'react';

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  subtitle?: string;
}

/**
 * Aurora Extraterrestrial Liquid Glass Glyph
 * An uncrossed arch 'A' without the middle horizontal hyphen/crossbar.
 * Sculpted with curved parabolic contours, liquid specular refractions,
 * and deep space photon luminesce inspired by DeepMind and Google Flow.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 32,
  showText = true,
  className = '',
  subtitle = 'Academic Intelligence',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div 
        className="relative flex items-center justify-center transition-transform duration-300 hover:scale-105"
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
            {/* Extraterrestrial Liquid Glass Body Gradient */}
            <linearGradient id="auroraGlassBody" x1="40" y1="35" x2="160" y2="175" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8AB4F8" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#1A73E8" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#0B57D0" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#174EA6" stopOpacity="0.95" />
            </linearGradient>

            {/* Specular Edge Highlight (Liquid Glass Reflection) */}
            <linearGradient id="auroraSpecular" x1="60" y1="30" x2="100" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Ambient Caustic Glow */}
            <radialGradient id="auroraCaustic" cx="100" cy="50" r="90" fx="100" fy="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D2E3FC" stopOpacity="0.8" />
              <stop offset="45%" stopColor="#1A73E8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0B57D0" stopOpacity="0" />
            </radialGradient>

            {/* Dark Mode Refraction Shield */}
            <filter id="auroraGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ambient Sub-surface Caustic Halo */}
          <ellipse cx="100" cy="95" rx="55" ry="60" fill="url(#auroraCaustic)" opacity="0.3" />

          {/* Primary Monolithic Curved Uncrossed 'A' Arch (No Middle Crossbar) */}
          <path
            d="M 46 166 
               C 42 166, 38 161, 40 154 
               C 46 132, 60 84, 82 50 
               C 89 39, 94 34, 100 34 
               C 106 34, 111 39, 118 50 
               C 140 84, 154 132, 160 154 
               C 162 161, 158 166, 154 166 
               C 146 166, 137 166, 131 166 
               C 126 166, 123 162, 121 155 
               C 116 137, 107 105, 100 82 
               C 93 105, 84 137, 79 155 
               C 77 162, 74 166, 69 166 
               Z"
            fill="url(#auroraGlassBody)"
            filter="url(#auroraGlow)"
          />

          {/* Liquid Glass Inner Refraction Core */}
          <path
            d="M 52 161 
               C 56 142, 68 96, 86 62 
               C 91 52, 95 48, 100 48 
               C 105 48, 109 52, 114 62 
               C 132 96, 144 142, 148 161 
               C 144 161, 138 161, 133 161 
               C 126 140, 115 106, 100 78 
               C 85 106, 74 140, 67 161 
               Z"
            fill="url(#auroraSpecular)"
            opacity="0.45"
          />

          {/* Left Crest Specular Rim (Liquid Glass Surface Sheen) */}
          <path
            d="M 84 48 
               C 89 39, 94 36, 100 36 
               C 104 36, 108 38, 113 45"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Alien Photon Singularity Point at Apex Focus */}
          <circle cx="100" cy="54" r="3.5" fill="#FFFFFF" opacity="0.9" />
          <circle cx="100" cy="54" r="7" fill="#8AB4F8" opacity="0.4" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white font-sans lowercase">
              aurora
            </span>
            <span className="px-1.5 py-0.2 text-[8.5px] font-mono tracking-wider text-[#0B57D0] dark:text-[#8AB4F8] bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 rounded-full border border-[#0B57D0]/20 dark:border-[#1A73E8]/25 font-semibold">
              OS
            </span>
          </div>
          <span className="text-[9.5px] text-neutral-500 dark:text-neutral-400 tracking-wider uppercase font-mono -mt-0.5">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};

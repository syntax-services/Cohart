'use client';

import React from 'react';

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 32,
  showText = true,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div 
        className="relative flex items-center justify-center transition-transform duration-200 hover:scale-105"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 200 200" 
          width={size} 
          height={size} 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Arch (C) with dark/light adaptation */}
          <path
            d="M 134 48 A 64 64 0 1 0 134 152"
            stroke="currentColor"
            className="text-neutral-800 dark:text-neutral-200"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Gemini Blue Core Spark / Heart without neon glow */}
          <path
            d="M 85 118 
               L 100 100 
               C 107 92, 117 92, 124 99 
               C 131 106, 131 116, 123 123 
               L 100 146 
               L 77 123 
               C 69 116, 69 106, 76 99 
               C 83 92, 93 92, 100 100"
            className="stroke-[#0B57D0] dark:stroke-[#A8C7FA]"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white font-sans">
              cohart
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-wider text-[#0B57D0] dark:text-[#A8C7FA] bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 rounded border border-[#0B57D0]/20 dark:border-[#A8C7FA]/20 font-semibold">
              OOU
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 tracking-wider uppercase font-mono -mt-0.5">
            Academic Engine
          </span>
        </div>
      )}
    </div>
  );
};

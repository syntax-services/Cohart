'use client';

import React from 'react';

interface BrandLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 34,
  showText = true,
  className = '',
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
          className="filter drop-shadow-[0_0_12px_rgba(56,123,255,0.4)]"
        >
          <defs>
            <linearGradient id="geminiBlueBrandGrad" x1="10%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#1A73E8" />
            </linearGradient>
          </defs>

          {/* Clean White Outer Arch (C) */}
          <path
            d="M 134 48 A 64 64 0 1 0 134 152"
            stroke="#FFFFFF"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Gemini Blue Core Spark / Heart */}
          <path
            d="M 85 118 
               L 100 100 
               C 107 92, 117 92, 124 99 
               C 131 106, 131 116, 123 123 
               L 100 146 
               L 77 123 
               C 69 116, 69 106, 76 99 
               C 83 92, 93 92, 100 100"
            stroke="url(#geminiBlueBrandGrad)"
            strokeWidth="15"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-semibold tracking-tight text-white font-sans">
              cohart
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-wider text-[#60A5FA] bg-[#387BFF]/10 rounded border border-[#387BFF]/25 font-semibold">
              OOU
            </span>
          </div>
          <span className="text-[10px] text-slate-400 tracking-wider uppercase font-mono -mt-0.5">
            Academic Engine
          </span>
        </div>
      )}
    </div>
  );
};

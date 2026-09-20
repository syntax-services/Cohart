import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glow = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-[#0A0E18]/80 backdrop-blur-xl border border-white/[0.07] p-5 transition-all duration-300 ${
        glow 
          ? 'hover:border-[#387BFF]/40 hover:shadow-[0_0_25px_rgba(56,123,255,0.15)]' 
          : 'hover:border-white/[0.14]'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Top subtle highlight shimmer */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
      {children}
    </div>
  );
};

'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'slate' | 'emerald' | 'amber';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  className = '',
  size = 'md',
}) => {
  const variantStyles = {
    blue: 'bg-[#387BFF]/10 text-[#60A5FA] border-[#387BFF]/25 shadow-[0_0_12px_rgba(56,123,255,0.15)]',
    slate: 'bg-white/[0.04] text-slate-300 border-white/[0.08]',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium tracking-tight ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

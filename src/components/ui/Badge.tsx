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
    blue: 'bg-white/[0.06] text-neutral-200 border-white/[0.1]',
    slate: 'bg-white/[0.04] text-neutral-300 border-white/[0.08]',
    emerald: 'bg-white/[0.08] text-white border-white/[0.15]',
    amber: 'bg-white/[0.06] text-neutral-300 border-white/[0.1]',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium tracking-tight transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

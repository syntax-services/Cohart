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
    blue: 'bg-[#0B57D0]/10 text-[#0B57D0] border-[#0B57D0]/20 dark:bg-[#A8C7FA]/10 dark:text-[#A8C7FA] dark:border-[#A8C7FA]/20',
    slate: 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-white/[0.06] dark:text-neutral-300 dark:border-white/[0.08]',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
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

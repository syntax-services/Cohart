'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GeminiCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  interactive?: boolean;
}

export const GeminiCard: React.FC<GeminiCardProps> = ({
  children,
  className = '',
  glow = false,
  interactive = false,
  ...props
}) => {
  return (
    <motion.div
      whileHover={interactive ? { y: -1.5, transition: { duration: 0.15 } } : undefined}
      whileTap={interactive ? { scale: 0.99 } : undefined}
      className={`relative rounded-2xl p-4 sm:p-5 transition-all duration-200 ${
        // Light mode: crisp white container with subtle border
        'bg-white border border-black/[0.08] text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
      } ${
        // Dark mode: Gemini's official #1E1F20 container
        'dark:bg-[#1E1F20] dark:border-white/[0.08] dark:text-[#E3E3E3] dark:shadow-none'
      } ${
        glow
          ? 'border-[#0B57D0]/40 dark:border-[#A8C7FA]/30 bg-[#0B57D0]/[0.02] dark:bg-[#A8C7FA]/[0.02]'
          : 'hover:border-black/[0.15] dark:hover:border-white/[0.16]'
      } ${interactive ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};

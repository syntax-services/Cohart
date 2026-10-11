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
      whileHover={interactive ? { y: -2, transition: { duration: 0.15, ease: "easeOut" } } : undefined}
      whileTap={interactive ? { scale: 0.98, transition: { duration: 0.1 } } : undefined}
      className={`relative rounded-[2rem] p-6 transition-colors duration-150 ${
        // Light mode: solid white container with ring
        'bg-white ring-1 ring-black/[0.06] text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
      } ${
        // Dark mode: #1E1F20 matte surface with top inset highlight
        'dark:bg-[#1E1F20] dark:ring-1 dark:ring-white/[0.06] dark:text-[#E3E3E3] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
      } ${
        interactive ? 'cursor-pointer hover:ring-black/[0.16] dark:hover:ring-white/[0.18]' : ''
      } ${className}`}
      {...props}
    >
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};

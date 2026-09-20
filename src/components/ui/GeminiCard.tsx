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
      whileHover={interactive ? { y: -2, transition: { duration: 0.2 } } : undefined}
      whileTap={interactive ? { scale: 0.99 } : undefined}
      className={`relative rounded-2xl border border-white/[0.07] bg-[#0A0E17]/80 backdrop-blur-xl p-4 sm:p-5 transition-all duration-300 ${
        glow
          ? 'shadow-[0_0_24px_-4px_rgba(56,123,255,0.22)] border-blue-500/25'
          : 'hover:border-white/[0.14] shadow-[0_4px_24px_rgba(0,0,0,0.45)]'
      } ${interactive ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {glow && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-500/[0.04] to-transparent" />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};

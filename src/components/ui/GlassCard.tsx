import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
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
      className={`relative overflow-hidden rounded-[2rem] bg-[#121316] p-6 transition-all duration-300 text-white ${
        glow 
          ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_24px_rgba(255,255,255,0.06)] ring-1 ring-white/20' 
          : 'shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_2px_rgba(0,0,0,0.3)] ring-1 ring-white/[0.08]'
      } ${interactive ? 'cursor-pointer hover:ring-white/[0.16]' : ''} ${className}`}
      {...props}
    >
      {/* Top subtle highlight shimmer (liquid glass effect) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

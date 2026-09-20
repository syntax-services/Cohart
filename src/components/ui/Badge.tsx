import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'slate' | 'azure' | 'emerald';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cyan',
  className = '',
}) => {
  const styles = {
    cyan: 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30',
    azure: 'bg-[#0066FF]/15 text-[#38bdf8] border-[#0066FF]/35',
    slate: 'bg-white/[0.05] text-slate-300 border-white/[0.1]',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium font-mono border backdrop-blur-md transition-colors ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

'use client';

import React, { useEffect, useState } from 'react';

interface AnimatedRectangularClockProps {
  initialTime?: string;
  timezone?: string;
}

export const AnimatedRectangularClock: React.FC<AnimatedRectangularClockProps> = ({
  timezone = 'WAT',
}) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const isPm = hours >= 12;
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const paddedHours = displayHours < 10 ? `0${displayHours}` : `${displayHours}`;
  const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  const formattedDate = time.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="my-2.5 inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] shadow-xs backdrop-blur-md">
      {/* Time Display */}
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
          {paddedHours}
        </span>
        <span className="font-mono text-base sm:text-lg font-bold text-[#0B57D0] dark:text-[#1A73E8] animate-pulse">
          :
        </span>
        <span className="font-mono text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
          {paddedMinutes}
        </span>
        <span className="text-[10px] font-mono font-bold text-neutral-500 ml-0.5">
          {isPm ? 'PM' : 'AM'}
        </span>
      </div>

      <div className="h-4 w-[1px] bg-black/[0.1] dark:bg-white/[0.1]" />

      {/* Timezone & Date Badge */}
      <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
        <span className="font-semibold text-neutral-700 dark:text-neutral-300">{formattedDate}</span>
        <span className="px-1.5 py-0.2 rounded bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 text-[#0B57D0] dark:text-[#1A73E8] text-[9px] font-bold">
          {timezone}
        </span>
      </div>
    </div>
  );
};

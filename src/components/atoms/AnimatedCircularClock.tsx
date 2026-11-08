'use client';

import React, { useEffect, useState } from 'react';

interface AnimatedCircularClockProps {
  initialTime?: string;
  timezone?: string;
}

export const AnimatedCircularClock: React.FC<AnimatedCircularClockProps> = ({
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
  const seconds = time.getSeconds();

  // Angle calculations (360 degrees)
  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = (hours % 12) * 30 + minutes * 0.5;

  const formattedDigital = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = time.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="my-4 p-5 rounded-[2rem] bg-[#121316]/95 border border-white/[0.1] shadow-xl backdrop-blur-2xl flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 max-w-xs mx-auto">
      {/* Outer Glow Ring */}
      <div className="relative w-44 h-44 rounded-full p-2 bg-gradient-to-br from-white/[0.04] to-white/[0.08] border border-white/[0.1] flex items-center justify-center shadow-inner">
        {/* Clock Face */}
        <div className="relative w-full h-full rounded-full bg-[#16181D] border border-white/[0.06] flex items-center justify-center overflow-hidden">
          {/* Hour markers */}
          {[...Array(12)].map((_, i) => {
            const rot = i * 30;
            return (
              <div
                key={i}
                className="absolute inset-2 flex justify-center"
                style={{ transform: `rotate(${rot}deg)` }}
              >
                <div
                  className={`w-0.5 rounded-full ${
                    i % 3 === 0
                      ? 'h-3 bg-white'
                      : 'h-1.5 bg-neutral-700'
                  }`}
                />
              </div>
            );
          })}

          {/* Hour Hand */}
          <div
            className="absolute w-1 rounded-full bg-white origin-bottom transition-transform duration-200"
            style={{
              height: '32px',
              bottom: '50%',
              transform: `rotate(${hourDeg}deg)`,
              transformOrigin: '50% 100%',
            }}
          />

          {/* Minute Hand */}
          <div
            className="absolute w-0.5 rounded-full bg-neutral-300 origin-bottom transition-transform duration-200"
            style={{
              height: '46px',
              bottom: '50%',
              transform: `rotate(${minuteDeg}deg)`,
              transformOrigin: '50% 100%',
            }}
          />

          {/* Second Hand (White Platinum Sweep) */}
          <div
            className="absolute w-[1.5px] rounded-full bg-neutral-400 origin-bottom shadow-sm"
            style={{
              height: '54px',
              bottom: '50%',
              transform: `rotate(${secondDeg}deg)`,
              transformOrigin: '50% 100%',
            }}
          />

          {/* Centre Pin */}
          <div className="absolute w-2.5 h-2.5 rounded-full bg-white border-2 border-[#16181D] shadow-xs z-10" />
        </div>
      </div>

      {/* Digital Time & Date */}
      <div className="mt-3.5 space-y-0.5">
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-mono text-lg font-bold tracking-tight text-white">
            {formattedDigital}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/20 font-bold">
            {timezone}
          </span>
        </div>
        <p className="text-[11px] font-mono text-neutral-400">
          {formattedDate} • Campus Realtime
        </p>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile } from '@/lib/types';

interface PeerScholar {
  id: string;
  name: string;
  initials: string;
  focusMinutes: number;
  readingTopic: string;
  haloColor: string;
}

const PEER_STUDENTS: PeerScholar[] = [
  {
    id: 'p1',
    name: 'Femi O.',
    initials: 'FO',
    focusMinutes: 48,
    readingTopic: 'ECO 201 • Indifference Curves',
    haloColor: 'ring-emerald-400',
  },
  {
    id: 'p2',
    name: 'Keji A.',
    initials: 'KA',
    focusMinutes: 32,
    readingTopic: 'GNS 201 • African Historiography',
    haloColor: 'ring-sky-400',
  },
  {
    id: 'p3',
    name: 'Amina B.',
    initials: 'AB',
    focusMinutes: 65,
    readingTopic: 'ECO 202 • Multiplier Effect',
    haloColor: 'ring-purple-400',
  },
  {
    id: 'p4',
    name: 'Tobi D.',
    initials: 'TD',
    focusMinutes: 19,
    readingTopic: 'MAT 101 • Linear Algebra',
    haloColor: 'ring-emerald-400',
  },
];

interface SilentStudyFloorProps {
  profile: StudentProfile;
}

export const SilentStudyFloor: React.FC<SilentStudyFloorProps> = ({ profile }) => {
  const [isSeated, setIsSeated] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSeated) {
      timer = setInterval(() => {
        setSessionSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSeated]);

  const department = profile.department || 'Economics';
  const level = profile.level || '200L';

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="rounded-[2rem] bg-[#121316] border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <GeminiIcon name="users" size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Silent Study Floor
              </span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {department} ({level}) Focus Table
            </h3>
          </div>
        </div>

        <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.05] border border-white/[0.08] px-2.5 py-1 rounded-full">
          {PEER_STUDENTS.length + (isSeated ? 1 : 0)} Scholars Active
        </span>
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed">
        Pure silent accountability. Study alongside departmental peers in real time without chat interruptions.
      </p>

      {/* Virtual Floor Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {PEER_STUDENTS.map((peer) => (
          <div
            key={peer.id}
            className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center text-center space-y-2 hover:bg-white/[0.04] transition-all"
          >
            <div className="relative">
              <div
                className={`h-11 w-11 rounded-full bg-black/40 border border-white/20 flex items-center justify-center font-mono font-bold text-xs text-white ring-2 ${peer.haloColor}`}
              >
                {peer.initials}
              </div>
              <span className="absolute -bottom-1 -right-1 h-3.5 px-1 rounded-full bg-white text-[8px] font-bold text-neutral-950 font-mono flex items-center justify-center shadow-xs">
                {peer.focusMinutes}m
              </span>
            </div>
            <div className="w-full">
              <span className="text-xs font-bold text-white block truncate">{peer.name}</span>
              <span className="text-[9.5px] text-neutral-500 font-mono block truncate mt-0.5">
                {peer.readingTopic}
              </span>
            </div>
          </div>
        ))}

        {isSeated && (
          <div className="p-3 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/30 flex flex-col items-center text-center space-y-2 animate-in fade-in">
            <div className="relative">
              <div className="h-11 w-11 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-mono font-bold text-xs text-emerald-300 ring-2 ring-emerald-400">
                YOU
              </div>
              <span className="absolute -bottom-1 -right-1 h-3.5 px-1 rounded-full bg-emerald-400 text-[8px] font-bold text-black font-mono flex items-center justify-center shadow-xs">
                {formatTimer(sessionSeconds)}
              </span>
            </div>
            <div className="w-full">
              <span className="text-xs font-bold text-emerald-300 block truncate">Your Desk</span>
              <span className="text-[9.5px] text-emerald-400 font-mono block truncate mt-0.5">
                Focusing Live
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Desk Control Button */}
      <div className="pt-1">
        {isSeated ? (
          <button
            onClick={() => {
              setIsSeated(false);
              setSessionSeconds(0);
            }}
            className="w-full py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] text-neutral-200 text-xs font-semibold cursor-pointer transition-colors"
          >
            Leave Study Table (Stop Timer)
          </button>
        ) : (
          <button
            onClick={() => setIsSeated(true)}
            className="w-full py-2.5 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold shadow-md active:scale-98 transition-all cursor-pointer"
          >
            Take a Silent Seat (Join Peers) →
          </button>
        )}
      </div>
    </div>
  );
};

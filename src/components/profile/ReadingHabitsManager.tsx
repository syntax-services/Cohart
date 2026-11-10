'use client';

import React, { useState } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile, LearningStyle } from '@/lib/types';

interface ReadingHabitsManagerProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => Promise<void>;
  onBack: () => void;
}

export type ReadingZone = 'deep_focus' | 'active_revision' | 'needs_warmup';

export const ReadingHabitsManager: React.FC<ReadingHabitsManagerProps> = ({
  profile,
  onUpdateProfile,
  onBack,
}) => {
  const [currentZone, setCurrentZone] = useState<ReadingZone>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('cohart_reading_zone') as ReadingZone) || 'active_revision';
    }
    return 'active_revision';
  });

  const [learningStyle, setLearningStyle] = useState<LearningStyle>(
    profile.learning_style || 'visual_analogies'
  );
  const [readingWpm, setReadingWpm] = useState<number>(profile.reading_speed_wpm || 240);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const zones: {
    id: ReadingZone;
    label: string;
    tagline: string;
    description: string;
    badgeColor: string;
    glowBorder: string;
    icon: string;
  }[] = [
    {
      id: 'deep_focus',
      label: 'Deep Focus Flow',
      tagline: 'In the Zone',
      description:
        'You are dialed in. Long uninterrupted reading blocks (45-60 min), high synthesis, and minimal distraction.',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glowBorder: 'border-emerald-500/30 ring-1 ring-emerald-500/20',
      icon: 'sparkle',
    },
    {
      id: 'active_revision',
      label: 'Active Revision Rhythm',
      tagline: 'Steady & Methodical',
      description:
        'Regular textbook review, tackling chapter checkpoints, and building steady exam momentum.',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      glowBorder: 'border-sky-500/30 ring-1 ring-sky-500/20',
      icon: 'brain',
    },
    {
      id: 'needs_warmup',
      label: 'Needs Warmup / Catch-up',
      tagline: 'Getting Into the Zone',
      description:
        'Feeling stuck or out of rhythm? No stress — we activate 5-minute micro-starts, audio read-alouds, and low-pressure summaries.',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      glowBorder: 'border-amber-500/30 ring-1 ring-amber-500/20',
      icon: 'flame',
    },
  ];

  const handleSelectZone = (zone: ReadingZone) => {
    setCurrentZone(zone);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cohart_reading_zone', zone);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateProfile({
        learning_style: learningStyle,
        reading_speed_wpm: readingWpm,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onBack();
      }, 700);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Sub-Page Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer group"
        >
          <GeminiIcon
            name="arrow-left"
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Profile</span>
        </button>
        <h2 className="text-sm font-bold text-white tracking-tight">Reading Habits & Community</h2>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Adaptive
        </span>
      </div>

      {/* 
        ========================================================================
        1. CURRENT READING ZONE TRACKER (Addresses core user requirement)
        ========================================================================
      */}
      <div className="rounded-3xl bg-[#121316] border border-white/[0.08] p-5 space-y-4 shadow-xl">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Your Current Reading Zone
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Cohart adapts reader difficulty and pace to match where your head is at right now.
          </p>
        </div>

        <div className="space-y-3">
          {zones.map((z) => {
            const isSelected = currentZone === z.id;
            return (
              <button
                key={z.id}
                onClick={() => handleSelectZone(z.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                  isSelected
                    ? `${z.glowBorder} bg-white/[0.06] shadow-lg`
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border ${z.badgeColor}`}
                    >
                      {z.tagline}
                    </span>
                    <span className="text-xs font-bold text-white">{z.label}</span>
                  </div>
                  {isSelected && (
                    <div className="h-4 w-4 rounded-full bg-white flex items-center justify-center">
                      <GeminiIcon name="check" size={10} className="text-black" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed pr-2">
                  {z.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 
        ========================================================================
        2. COGNITIVE LEARNING STYLE
        ========================================================================
      */}
      <div className="rounded-3xl bg-[#121316] border border-white/[0.08] p-5 space-y-4 shadow-xl">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Cognitive Comprehension Style
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            How Aurora AI frames textbook definitions and exam breakdowns for you.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {[
            {
              id: 'visual_analogies',
              label: 'Visual Analogies',
              desc: 'Relatable everyday metaphors and diagrams.',
            },
            {
              id: 'socratic_inquiry',
              label: 'Socratic Inquiry',
              desc: 'Guided question prompts that test retention.',
            },
            {
              id: 'concise_bullet',
              label: 'High-Yield Bullets',
              desc: 'Crisp exam key-points for fast revision.',
            },
            {
              id: 'deep_first_principles',
              label: 'First Principles',
              desc: 'Fundamental equations and logical proofs.',
            },
          ].map((style) => {
            const isSelected = learningStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => setLearningStyle(style.id as LearningStyle)}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-white/40 bg-white/10 text-white shadow-md'
                    : 'border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-white">{style.label}</span>
                  {isSelected && <GeminiIcon name="check" size={12} className="text-white" />}
                </div>
                <span className="text-[10px] text-neutral-400 leading-snug">
                  {style.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 
        ========================================================================
        3. READING SPEED (WPM) CALIBRATION
        ========================================================================
      */}
      <div className="rounded-3xl bg-[#121316] border border-white/[0.08] p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Reading Speed Pace
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Used to calculate chapter reading times and audio playback speed.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-white bg-white/10 px-2.5 py-1 rounded-xl border border-white/20">
            {readingWpm} WPM
          </span>
        </div>

        <input
          type="range"
          min={140}
          max={450}
          step={10}
          value={readingWpm}
          onChange={(e) => setReadingWpm(Number(e.target.value))}
          className="w-full accent-white h-1.5 bg-white/10 rounded-lg cursor-pointer"
        />

        <div className="flex justify-between text-[9px] font-mono text-neutral-500">
          <span>140 WPM (Careful Analysis)</span>
          <span>250 WPM (Standard)</span>
          <span>450 WPM (Speed Scanning)</span>
        </div>
      </div>

      {/* 
        ========================================================================
        4. PEER COMMUNITY READING INSIGHTS (Campus Habits)
        ========================================================================
      */}
      <div className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-3">
        <div className="flex items-center gap-2 text-white">
          <GeminiIcon name="users" size={14} />
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
            {profile.institution || 'OOU'} Community Reading Pulse
          </h3>
        </div>

        <div className="space-y-2 text-xs text-neutral-300 leading-relaxed">
          <div className="p-3 rounded-2xl bg-black/30 border border-white/[0.06] flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">Peak Campus Focus Hours:</span>
            <span className="text-[11px] font-mono font-bold text-sky-400">8:30 PM – 11:45 PM</span>
          </div>
          <div className="p-3 rounded-2xl bg-black/30 border border-white/[0.06] flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">Department Avg Pace:</span>
            <span className="text-[11px] font-mono font-bold text-white">215 WPM</span>
          </div>
          <div className="p-3 rounded-2xl bg-black/30 border border-white/[0.06] flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">Your Reading Percentile:</span>
            <span className="text-[11px] font-mono font-bold text-emerald-400">Top 15% Steady</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold shadow-lg active:scale-98 transition-all cursor-pointer disabled:opacity-50"
      >
        {saving ? 'Saving...' : savedSuccess ? '✓ Reading Habits Saved!' : 'Save Habit Preferences'}
      </button>
    </div>
  );
};

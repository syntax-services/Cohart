'use client';

import React, { useState, useEffect } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile } from '@/lib/types';
import { ReadingZone } from '@/components/profile/ReadingHabitsManager';

interface Question {
  id: string;
  course: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'q1',
    course: 'ECO 201',
    prompt: 'In consumer theory, an indifference curve is strictly convex to the origin due to which principle?',
    options: [
      'Diminishing marginal rate of substitution (MRS)',
      'Increasing returns to scale',
      'The law of equi-marginal utility',
      'Positive income elasticity of demand',
    ],
    correctIndex: 0,
    explanation:
      'As consumption of Good X increases, the consumer is willing to give up less of Good Y to obtain an additional unit of X (Diminishing MRS).',
  },
  {
    id: 'q2',
    course: 'GNS 201',
    prompt: 'Which ancient pre-colonial civilization in Nigeria is renowned for pioneering terracotta sculptures dating to 500 BC?',
    options: ['Benin Kingdom', 'Nok Culture', 'Igbo-Ukwu Bronze', 'Oyo Empire'],
    correctIndex: 1,
    explanation: 'The Nok culture of Kaduna/Plateau region produced the earliest terracotta figures in Sub-Saharan Africa.',
  },
  {
    id: 'q3',
    course: 'ECO 202',
    prompt: 'According to Keynesian national income determination, what happens when Aggregate Expenditure exceeds Total Output?',
    options: [
      'Firms face unintended inventory accumulation and cut production',
      'Unplanned inventory disinvestment occurs and output expands',
      'The economy immediately experiences structural deflation',
      'Interest rates decline to zero bound',
    ],
    correctIndex: 1,
    explanation:
      'When expenditure exceeds output, firms draw down existing inventories below desired levels, prompting them to hire and ramp up production.',
  },
];

interface DailyMicroDrillProps {
  profile: StudentProfile;
  onDrillComplete?: () => void;
}

export const DailyMicroDrill: React.FC<DailyMicroDrillProps> = ({ profile, onDrillComplete }) => {
  const [streakCount, setStreakCount] = useState<number>(3);
  const [selectedZone, setSelectedZone] = useState<ReadingZone>('active_revision');
  const [isDrillActive, setIsDrillActive] = useState(false);
  const [isDrillCompleted, setIsDrillCompleted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [chosenOption, setChosenOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const today = new Date().toDateString();
    const completedDate = localStorage.getItem('cohart_drill_completed_date');
    const savedStreak = Number(localStorage.getItem('cohart_daily_streak')) || 3;
    setStreakCount(savedStreak);

    if (completedDate === today) {
      setIsDrillCompleted(true);
    }

    const savedZone = (localStorage.getItem('cohart_reading_zone') as ReadingZone) || 'active_revision';
    setSelectedZone(savedZone);
  }, []);

  const handleStartDrill = (zone: ReadingZone) => {
    setSelectedZone(zone);
    localStorage.setItem('cohart_reading_zone', zone);
    setIsDrillActive(true);
    setCurrentIdx(0);
    setChosenOption(null);
    setShowExplanation(false);
    setScore(0);
  };

  const handleSelectOption = (idx: number) => {
    if (chosenOption !== null) return;
    setChosenOption(idx);
    setShowExplanation(true);
    if (idx === SAMPLE_QUESTIONS[currentIdx].correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < SAMPLE_QUESTIONS.length - 1) {
      setCurrentIdx((c) => c + 1);
      setChosenOption(null);
      setShowExplanation(false);
    } else {
      // Completed drill
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      localStorage.setItem('cohart_daily_streak', String(newStreak));
      localStorage.setItem('cohart_drill_completed_date', new Date().toDateString());
      setIsDrillActive(false);
      setIsDrillCompleted(true);
      if (onDrillComplete) onDrillComplete();
    }
  };

  const q = SAMPLE_QUESTIONS[currentIdx];

  return (
    <div className="rounded-[2rem] bg-[#121316] border border-white/[0.08] p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <GeminiIcon name="flame" size={16} />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
              Daily 5-Min Micro-Drill
            </span>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Keep Your Reading Streak Alive
            </h3>
          </div>
        </div>

        {/* Streak Flame Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 font-mono text-xs font-bold shadow-xs">
          <GeminiIcon name="flame" size={14} className="text-amber-400 animate-pulse" />
          <span>{streakCount} Days Streak</span>
        </div>
      </div>

      {!isDrillActive && !isDrillCompleted && (
        <div className="space-y-4">
          <p className="text-xs text-neutral-400 leading-relaxed">
            Check in your reading head-space and solve 3 quick syllabus questions to cement daily memory.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'deep_focus', label: 'Deep Focus', desc: 'Dialed In' },
              { id: 'active_revision', label: 'Revision', desc: 'Steady Pace' },
              { id: 'needs_warmup', label: 'Warmup', desc: 'Getting In Zone' },
            ].map((z) => {
              const isCurrent = selectedZone === z.id;
              return (
                <button
                  key={z.id}
                  onClick={() => handleStartDrill(z.id as ReadingZone)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer group ${
                    isCurrent
                      ? 'border-white/40 bg-white/10 text-white shadow-md'
                      : 'border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="text-xs font-bold block group-hover:text-white transition-colors">
                    {z.label}
                  </span>
                  <span className="text-[9.5px] font-mono text-neutral-500 block mt-0.5">
                    {z.desc}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleStartDrill(selectedZone)}
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', boxShadow: '0 0 20px var(--primary-glow)' }}
            className="w-full py-2.5 rounded-2xl text-xs font-bold shadow-md active:scale-98 transition-all cursor-pointer hover:opacity-90"
          >
            Start 3-Minute Micro-Drill →
          </button>
        </div>
      )}

      {isDrillActive && (
        <div className="space-y-4 animate-in fade-in">
          {/* Question Status */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-sky-400 font-bold">{q.course} Question</span>
            <span className="text-neutral-400">
              {currentIdx + 1} of {SAMPLE_QUESTIONS.length}
            </span>
          </div>

          <p className="text-xs font-semibold text-white leading-relaxed">{q.prompt}</p>

          <div className="space-y-2">
            {q.options.map((opt, oIdx) => {
              const isSelected = chosenOption === oIdx;
              const isCorrect = oIdx === q.correctIndex;

              let style = 'border-white/[0.08] bg-white/[0.02] text-neutral-300 hover:bg-white/[0.05]';
              if (chosenOption !== null) {
                if (isCorrect) {
                  style = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold';
                } else if (isSelected) {
                  style = 'border-rose-500/40 bg-rose-500/10 text-rose-300';
                }
              }

              return (
                <button
                  key={oIdx}
                  disabled={chosenOption !== null}
                  onClick={() => handleSelectOption(oIdx)}
                  className={`w-full text-left p-3 rounded-2xl border text-xs transition-all cursor-pointer ${style}`}
                >
                  <span className="font-mono text-[10px] text-neutral-500 mr-2">
                    {String.fromCharCode(65 + oIdx)}.
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2 animate-in fade-in">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                Concept Insight
              </span>
              <p className="text-[11px] text-neutral-300 leading-relaxed">{q.explanation}</p>
              <button
                onClick={handleNext}
                className="w-full py-2 rounded-xl bg-white text-neutral-950 text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer mt-1"
              >
                {currentIdx < SAMPLE_QUESTIONS.length - 1 ? 'Next Question →' : 'Complete Drill & Save Streak'}
              </button>
            </div>
          )}
        </div>
      )}

      {isDrillCompleted && !isDrillActive && (
        <div className="py-4 text-center space-y-2 animate-in fade-in">
          <div className="h-10 w-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <GeminiIcon name="check" size={20} />
          </div>
          <p className="text-xs font-bold text-white">Daily Streak Secured!</p>
          <p className="text-[11px] text-neutral-400">
            You completed today&apos;s check-in. Next drill drops tomorrow morning.
          </p>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile } from '@/lib/types';
import { saveExplanation } from '@/lib/supabase';

interface NightPastQuestionDropProps {
  profile: StudentProfile;
  onOpenVault?: () => void;
}

export const NightPastQuestionDrop: React.FC<NightPastQuestionDropProps> = ({
  profile,
  onOpenVault,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const sampleQuestion = {
    course: 'ECO 201',
    session: '2022/2023 Senate Examination',
    topic: 'Marginal Rate of Technical Substitution (MRTS)',
    question:
      'Given the Cobb-Douglas production function Q = 4L^(0.5) K^(0.5), calculate the MRTS of Labor for Capital when L = 16 and K = 9. State its economic interpretation for cost minimization.',
    solution:
      '1. MRTS_LK = MP_L / MP_K\n2. MP_L = ∂Q/∂L = 2 L^(-0.5) K^(0.5) = 2 * (K/L)^0.5\n3. MP_K = ∂Q/∂K = 2 L^(0.5) K^(-0.5) = 2 * (L/K)^0.5\n4. Dividing: MRTS_LK = (2*(K/L)^0.5) / (2*(L/K)^0.5) = K / L\n5. Substitute values: MRTS_LK = 9 / 16 = 0.5625.\nInterpretation: The firm can substitute 0.5625 units of capital for 1 unit of labor while keeping total output constant.',
    examTip:
      'For any homogeneous Cobb-Douglas function Q = A L^a K^b, MRTS_LK simplifies directly to (a/b) * (K/L). Memorize this shortcut for CBT speed!',
  };

  const handleSaveToVault = async () => {
    setIsSaved(true);
    if (profile.id) {
      await saveExplanation({
        user_id: profile.id,
        course_code: sampleQuestion.course,
        context_topic: sampleQuestion.topic,
        selected_text: `[Past Question] ${sampleQuestion.question}`,
        ai_explanation: `${sampleQuestion.solution}\n\nExam Tip: ${sampleQuestion.examTip}`,
      });
    }
  };

  const handlePlayVoice = () => {
    if (typeof window === 'undefined') return;
    if ('speechSynthesis' in window) {
      if (isAudioPlaying) {
        window.speechSynthesis.cancel();
        setIsAudioPlaying(false);
      } else {
        const text = `Senate past question breakdown. ${sampleQuestion.question}. The key step is calculating marginal products. ${sampleQuestion.examTip}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.onend = () => setIsAudioPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsAudioPlaying(true);
      }
    }
  };

  return (
    <div className="rounded-[2rem] bg-[#121316] border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <GeminiIcon name="bookmark" size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                08:00 PM Past-Paper Drop
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">• Night Routine</span>
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              {sampleQuestion.course} Verified Exam Question
            </h3>
          </div>
        </div>

        <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full">
          {sampleQuestion.session}
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
          Topic: {sampleQuestion.topic}
        </span>
        <p className="text-xs text-white font-medium leading-relaxed">
          {sampleQuestion.question}
        </p>
      </div>

      {!isRevealed ? (
        <button
          onClick={() => setIsRevealed(true)}
          className="w-full py-2.5 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold shadow-md active:scale-98 transition-all cursor-pointer"
        >
          Reveal Verified Solution & Proof →
        </button>
      ) : (
        <div className="space-y-3 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Step-by-Step Senate Solution
              </span>
              <button
                onClick={handlePlayVoice}
                className="flex items-center gap-1 text-[11px] font-mono text-neutral-300 hover:text-white cursor-pointer"
              >
                <GeminiIcon name={isAudioPlaying ? 'volume-x' : 'volume'} size={13} />
                <span>{isAudioPlaying ? 'Pause Voice' : 'Listen'}</span>
              </button>
            </div>
            <pre className="text-[11px] text-neutral-300 font-sans whitespace-pre-line leading-relaxed">
              {sampleQuestion.solution}
            </pre>
            <div className="mt-2 pt-2 border-t border-white/[0.06] text-[10.5px] text-amber-300 font-mono">
              💡 {sampleQuestion.examTip}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveToVault}
              disabled={isSaved}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-bold cursor-pointer transition-all ${
                isSaved
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-white hover:bg-neutral-200 text-neutral-950 shadow-md'
              }`}
            >
              {isSaved ? '✓ Saved to Personal Vault' : 'Bookmark to Personal Vault'}
            </button>
            {onOpenVault && (
              <button
                onClick={onOpenVault}
                className="px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-neutral-300 cursor-pointer"
              >
                Vault →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile } from '@/lib/types';

interface FeedbackSupportViewProps {
  profile: StudentProfile;
  onBack: () => void;
}

export const FeedbackSupportView: React.FC<FeedbackSupportViewProps> = ({
  profile,
  onBack,
}) => {
  const [category, setCategory] = useState<'feedback' | 'missing_course' | 'bug'>('feedback');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      // Record feedback via localStorage or api
      const payload = {
        student_id: profile.id,
        student_name: profile.full_name,
        institution: profile.institution,
        category,
        message: content.trim(),
        timestamp: new Date().toISOString(),
      };

      const existing = JSON.parse(localStorage.getItem('cohart_feedback_queue') || '[]');
      existing.push(payload);
      localStorage.setItem('cohart_feedback_queue', JSON.stringify(existing));

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setContent('');
        onBack();
      }, 1600);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header */}
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
        <h2 className="text-sm font-bold text-white tracking-tight">Support & Student Feedback</h2>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Direct Devs
        </span>
      </div>

      <div className="rounded-3xl bg-[#121316] border border-white/[0.08] p-5 shadow-xl space-y-4">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Direct Student Voice
          </h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Report missing departmental course textbooks, suggest reading features, or flag software issues.
          </p>
        </div>

        {/* Category Selector */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'feedback', label: 'Suggestion' },
            { id: 'missing_course', label: 'Missing Book' },
            { id: 'bug', label: 'Bug Report' },
          ].map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id as any)}
                className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-neutral-950 font-bold shadow-sm'
                    : 'bg-white/[0.04] text-neutral-400 border border-white/[0.06] hover:bg-white/[0.08]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-2">
            <div className="h-10 w-10 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <GeminiIcon name="check" size={20} />
            </div>
            <p className="text-xs font-bold text-white">Feedback Dispatched</p>
            <p className="text-[11px] text-neutral-400">
              Thank you for building our campus community with us.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                category === 'missing_course'
                  ? 'Specify course code, textbook title, or lecturer syllabus (e.g. ECO 201 Microeconomics by OOU Press)...'
                  : 'Tell us how we can make your reading habit smoother...'
              }
              rows={5}
              required
              className="w-full p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="w-full py-3 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold cursor-pointer shadow-lg active:scale-98 transition-all disabled:opacity-50"
            >
              {submitting ? 'Transmitting...' : 'Send Message to Engineering Team'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

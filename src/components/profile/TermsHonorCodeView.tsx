'use client';

import React from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';

interface TermsHonorCodeViewProps {
  onBack: () => void;
}

export const TermsHonorCodeView: React.FC<TermsHonorCodeViewProps> = ({ onBack }) => {
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
        <h2 className="text-sm font-bold text-white tracking-tight">Terms & Campus Honor Code</h2>
        <span className="text-[10px] font-mono text-neutral-400 bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
          NUC Statutory
        </span>
      </div>

      <div className="rounded-3xl bg-[#121316] border border-white/[0.08] p-5 shadow-xl space-y-4 text-xs text-neutral-300 leading-relaxed">
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
          <h3 className="font-bold text-white text-xs">1. Academic Integrity & Ethics</h3>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Cohart / Aurora OS is engineered solely as an academic learning accelerator, digital library, and interactive textbook companion. It is strictly not designed to facilitate exam malpractice or unfair advantage during proctored examinations.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
          <h3 className="font-bold text-white text-xs">2. Curriculum Rights & Intellectual Property</h3>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            All course outlines, departmental curricula, and faculty lecture schedules are indexed under statutory Nigerian educational frameworks. Repackaging or unauthorized commercial mirroring is strictly prohibited.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-1">
          <h3 className="font-bold text-white text-xs">3. Data Privacy & Zero Ad-Tracking</h3>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Your reading metrics, saved vault explanations, and checkpoint scores remain private to your account. We never sell student learning profiles to advertisers or third-party marketing brokers.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onBack}
            className="w-full py-3 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold cursor-pointer shadow-lg active:scale-98 transition-all"
          >
            Understood & Agree
          </button>
        </div>
      </div>
    </div>
  );
};

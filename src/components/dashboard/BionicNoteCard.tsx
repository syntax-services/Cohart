'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, Zap, Sparkles, Check, Copy } from 'lucide-react';
import { formatBionicText } from '@/lib/bionic';

const SAMPLE_NOTE_TEXT = `Microeconomic equilibrium occurs when aggregate market demand perfectly matches aggregate supply at a clearing price. In developing macroeconomic contexts like Nigeria, price elasticities for essential commodities frequently exhibit inelastic behavior due to structural supply chain bottlenecks. 

For the upcoming resumption assessment in SMS Hall 1, pay particular attention to Consumer Surplus calculations and the Cournot Oligopoly reaction functions.`;

export const BionicNoteCard: React.FC = () => {
  const [isBionicEnabled, setIsBionicEnabled] = useState(true);
  const [copied, setCopied] = useState(false);

  const bionicTokens = React.useMemo(() => {
    return formatBionicText(SAMPLE_NOTE_TEXT);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(SAMPLE_NOTE_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard className="flex flex-col justify-between h-full">
      <div>
        {/* Header with Bionic Switch */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0066FF]/15 text-[#38bdf8]">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Study Notes & Syntheses</h3>
              <p className="text-[11px] font-mono text-slate-400">ECO 201 • Key Review Summary</p>
            </div>
          </div>

          {/* Bionic Mode Toggle Button */}
          <button
            onClick={() => setIsBionicEnabled(!isBionicEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
              isBionicEnabled
                ? 'bg-gradient-to-r from-[#00F0FF] to-[#0066FF] text-black font-semibold shadow-[0_0_15px_rgba(0,240,255,0.35)]'
                : 'bg-white/[0.05] text-slate-400 border border-white/[0.08] hover:text-white'
            }`}
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>Bionic {isBionicEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Note Content Display Area */}
        <div className="rounded-xl border border-white/[0.07] bg-[#07090E]/60 p-4 font-sans text-xs leading-relaxed text-slate-200 min-h-[140px] max-h-[180px] overflow-y-auto">
          {isBionicEnabled ? (
            <div>
              {bionicTokens.map((token) => {
                if (token.newline) {
                  return <br key={token.id} />;
                }
                if (token.space) {
                  return <span key={token.id}>{token.regular}</span>;
                }
                return (
                  <span key={token.id} className="inline">
                    <strong className="font-bold text-white tracking-normal font-sans">
                      {token.bold}
                    </strong>
                    <span className="text-slate-300 font-normal">
                      {token.regular}
                    </span>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="whitespace-pre-line text-slate-300">
              {SAMPLE_NOTE_TEXT}
            </p>
          )}
        </div>
      </div>

      {/* Footer info bar */}
      <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Sparkles className="h-3 w-3 text-[#00F0FF]" />
          <span>Fixation guided reading active</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy Note</span>
            </>
          )}
        </button>
      </div>
    </GlassCard>
  );
};

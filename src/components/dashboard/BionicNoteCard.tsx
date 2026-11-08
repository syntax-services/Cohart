'use client';

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
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
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white border border-white/15">
              <GeminiIcon name="reader" size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Study Notes & Syntheses</h3>
              <p className="text-[11px] font-mono text-neutral-400">ECO 201 • Key Review Summary</p>
            </div>
          </div>

          {/* Bionic Mode Toggle Button */}
          <button
            onClick={() => setIsBionicEnabled(!isBionicEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
              isBionicEnabled
                ? 'bg-white text-neutral-950 font-bold shadow-sm'
                : 'bg-white/[0.05] text-neutral-400 border border-white/[0.08] hover:text-white'
            }`}
          >
            <GeminiIcon name="zap" size={14} />
            <span>Bionic {isBionicEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Note Content Display Area */}
        <div className="rounded-xl border border-white/[0.08] bg-[#0c0d12]/90 p-4 font-sans text-xs leading-relaxed text-neutral-200 min-h-[140px] max-h-[180px] overflow-y-auto">
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
                    <span className="text-neutral-300 font-normal">
                      {token.regular}
                    </span>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="whitespace-pre-line text-neutral-300">
              {SAMPLE_NOTE_TEXT}
            </p>
          )}
        </div>
      </div>

      {/* Footer info bar */}
      <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-400">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <GeminiIcon name="zap" size={14} className="text-white" />
          <span>Fixation guided reading active</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          <GeminiIcon name={copied ? 'check' : 'copy'} size={14} className={copied ? 'text-white' : ''} />
          <span className={copied ? 'text-white font-bold' : ''}>{copied ? 'Copied' : 'Copy Note'}</span>
        </button>
      </div>
    </GlassCard>
  );
};

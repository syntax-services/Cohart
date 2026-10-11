'use client';

import React, { useState, useEffect } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import {
  TOURNAMENT_STAGES,
  SPECIALIZED_SCHOOL_LEAGUES,
  SAMPLE_LIVE_MATCHES,
  LiveArenaMatch,
} from '@/lib/arenaTournament';

interface CampusArenaViewerProps {
  onClose: () => void;
  userInstitution?: string;
  userDepartment?: string;
  onJoinCompetition?: (matchId: string) => void;
}

export const CampusArenaViewer: React.FC<CampusArenaViewerProps> = ({
  onClose,
  userInstitution = 'OOU',
  userDepartment = 'Economics',
  onJoinCompetition,
}) => {
  const [activeMatch, setActiveMatch] = useState<LiveArenaMatch>(SAMPLE_LIVE_MATCHES[0]);
  const [secondsLeft, setSecondsLeft] = useState(activeMatch.secondsRemaining);
  const [teamACheers, setTeamACheers] = useState(342);
  const [teamBCheers, setTeamBCheers] = useState(289);
  const [hasCheered, setHasCheered] = useState<string | null>(null);
  const [spectatorRewardClaimed, setSpectatorRewardClaimed] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('tech_consortium');
  const [activeTab, setActiveTab] = useState<'stream' | 'payouts' | 'leagues'>('stream');

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeMatch]);

  const handleCheer = (team: 'A' | 'B') => {
    if (hasCheered) return;
    if (team === 'A') {
      setTeamACheers((c) => c + 1);
      setHasCheered('A');
    } else {
      setTeamBCheers((c) => c + 1);
      setHasCheered('B');
    }
  };

  const handleClaimSpectatorReward = () => {
    setSpectatorRewardClaimed(true);
    alert('Spectator cheer bonus! +25 Study Tones added to your balance for watching live varsity competition.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-3 sm:p-5 animate-in fade-in select-none">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[2rem] bg-[#0D1017] border border-white/10 shadow-2xl flex flex-col text-neutral-100 font-sans">
        {/* Top Header */}
        <header className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white font-bold shadow-lg shadow-rose-500/20">
              <GeminiIcon name="zap" size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-white">Cohart Arena Live</h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  Live Stream
                </span>
              </div>
              <p className="text-[11px] font-mono text-neutral-400">
                Stage-by-Stage Cash Payouts • Compete, Stream & Win
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-mono text-neutral-300">
              <span className="text-rose-400">●</span>
              <span>{activeMatch.liveViewersCount + (hasCheered ? 1 : 0)} Spectators</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <GeminiIcon name="close" size={18} />
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 pb-1 border-b border-white/[0.06] flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('stream')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'stream'
                ? 'bg-[#0B57D0] text-white font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Live Match Stream
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'payouts'
                ? 'bg-[#0B57D0] text-white font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Stage Payout Ladder
          </button>
          <button
            onClick={() => setActiveTab('leagues')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'leagues'
                ? 'bg-[#0B57D0] text-white font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Specialized School Leagues
          </button>
        </div>

        {/* Tab 1: Live Stream Workstation */}
        {activeTab === 'stream' && (
          <div className="p-4 sm:p-6 space-y-5 flex-1">
            {/* Match Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase">
                  {activeMatch.stageTitle}
                </span>
                <span className="text-neutral-400 font-mono text-[11px]">{activeMatch.schoolLeague}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold">
                <GeminiIcon name="sparkle" size={14} />
                <span>Prize Pool: ₦{activeMatch.prizePoolNgn.toLocaleString()} Cash</span>
              </div>
            </div>

            {/* Live Head-to-Head Scoreboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Team A */}
              <div className={`p-4 rounded-2xl border transition-all ${
                activeMatch.teamA.score > activeMatch.teamB.score
                  ? 'bg-gradient-to-br from-[#0B57D0]/20 to-transparent border-[#0B57D0]/50 shadow-lg shadow-[#0B57D0]/10'
                  : 'bg-white/[0.02] border-white/10'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#0B57D0]/20 text-[#0B57D0] dark:text-[#1A73E8] font-mono text-[10px] font-bold">
                    {activeMatch.teamA.institution}
                  </span>
                  <span className="text-3xl font-extrabold font-mono text-white">
                    {activeMatch.teamA.score}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{activeMatch.teamA.name}</h3>
                <p className="text-xs text-neutral-400">{activeMatch.teamA.department}</p>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-400">{teamACheers} Cheers</span>
                  <button
                    onClick={() => handleCheer('A')}
                    disabled={Boolean(hasCheered)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold font-mono transition-all active:scale-95 cursor-pointer ${
                      hasCheered === 'A'
                        ? 'bg-[#0B57D0] text-white'
                        : 'bg-white/10 hover:bg-white/15 text-neutral-200'
                    }`}
                  >
                    {hasCheered === 'A' ? 'Cheered!' : 'Cheer Team A'}
                  </button>
                </div>
              </div>

              {/* Team B */}
              <div className={`p-4 rounded-2xl border transition-all ${
                activeMatch.teamB.score > activeMatch.teamA.score
                  ? 'bg-gradient-to-br from-purple-500/20 to-transparent border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : 'bg-white/[0.02] border-white/10'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-mono text-[10px] font-bold">
                    {activeMatch.teamB.institution}
                  </span>
                  <span className="text-3xl font-extrabold font-mono text-white">
                    {activeMatch.teamB.score}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{activeMatch.teamB.name}</h3>
                <p className="text-xs text-neutral-400">{activeMatch.teamB.department}</p>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-400">{teamBCheers} Cheers</span>
                  <button
                    onClick={() => handleCheer('B')}
                    disabled={Boolean(hasCheered)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold font-mono transition-all active:scale-95 cursor-pointer ${
                      hasCheered === 'B'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 hover:bg-white/15 text-neutral-200'
                    }`}
                  >
                    {hasCheered === 'B' ? 'Cheered!' : 'Cheer Team B'}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Question Display & Buzzer Countdown */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 text-xs font-mono">
                <span className="text-neutral-400 uppercase tracking-wider text-[10px]">Active Academic Challenge</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold">
                  Buzzer: {secondsLeft}s
                </span>
              </div>
              <p className="text-sm sm:text-base font-medium text-white leading-relaxed font-sans">
                "{activeMatch.currentQuestion}"
              </p>

              {/* Progress bar */}
              <div className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0B57D0] via-purple-500 to-rose-500 transition-all duration-1000"
                  style={{ width: `${(secondsLeft / 30) * 100}%` }}
                />
              </div>
            </div>

            {/* Spectator Reward Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/[0.08] to-teal-500/[0.08] border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-emerald-400 font-mono text-[11px]">Audience Cheer & Prediction Bonus</span>
                <p className="text-neutral-400 text-[11px] mt-0.5">
                  Watch live varsity battles, cheer your school, and claim free bonus Study Tones every 10 minutes!
                </p>
              </div>
              <button
                onClick={handleClaimSpectatorReward}
                disabled={spectatorRewardClaimed}
                className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold font-mono text-xs transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
              >
                {spectatorRewardClaimed ? 'Claimed (+25 Tones)' : 'Claim +25 Free Tones'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Stage-by-Stage Payout Ladder */}
        {activeTab === 'payouts' && (
          <div className="p-4 sm:p-6 space-y-4 flex-1">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-neutral-300">
              <span className="font-bold text-amber-400 font-mono uppercase text-[10px]">
                Earn Cash at Every Stage
              </span>
              <p className="leading-relaxed mt-1">
                You do not have to wait until national finals! Cohart pays cash rewards directly to students at every tier of victory—from beating your classroom coursemates, to faculty derbies, to university championships.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.values(TOURNAMENT_STAGES)).map((stg) => (
                <div key={stg.stage} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{stg.title}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                        ₦{stg.cashPrizeNgn.toLocaleString()} Cash
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-neutral-400 mt-1">Scope: {stg.scope}</p>
                    <p className="text-xs text-neutral-300 mt-1.5">{stg.format}</p>
                  </div>
                  <div className="pt-2 border-t border-white/[0.06] text-[11px] text-neutral-400 font-mono flex items-center justify-between">
                    <span>Reward: {stg.payoutDescription}</span>
                    <span className="text-amber-400 font-bold">+{stg.bonusTones} Tones</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Specialized School Leagues */}
        {activeTab === 'leagues' && (
          <div className="p-4 sm:p-6 space-y-4 flex-1">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-neutral-300">
              <span className="font-bold text-blue-400 font-mono uppercase text-[10px]">
                Categorized Collegiate Consortiums
              </span>
              <p className="leading-relaxed mt-1">
                Institutions with specialized curricula are grouped together for fair, discipline-accurate academic competition:
              </p>
            </div>

            <div className="space-y-3">
              {SPECIALIZED_SCHOOL_LEAGUES.map((league) => (
                <div key={league.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-xs font-bold text-white">{league.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">
                      {league.schools.length} Universities
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">{league.description}</p>
                  
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {league.schools.map((s) => (
                      <span key={s.code} className="px-2 py-0.5 rounded-lg bg-[#0B57D0]/15 text-[#0B57D0] dark:text-[#1A73E8] font-mono text-[10px] font-bold" title={s.name}>
                        {s.code}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

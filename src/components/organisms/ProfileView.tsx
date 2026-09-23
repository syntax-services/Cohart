'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile, LearningStyle, COHART_VOICES, DEFAULT_COHART_VOICE } from '@/lib/types';
import { UniversityCombobox } from '@/components/ui/UniversityCombobox';
import { useTheme } from '@/components/ThemeProvider';
import { useAttendanceTracker } from '@/hooks/useAttendanceTracker';
import { fetchSavedExplanations } from '@/lib/supabase';
import { ALL_OOU_DEPARTMENTS } from '@/lib/oouCourses';
import {
  NIGERIAN_UNIVERSITIES,
  getRandomCampusQuestion,
  evaluateCampusAnswer,
  CampusInsiderQuestion,
} from '@/lib/campusVerification';

interface ProfileViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => Promise<void>;
  onOpenSchedule: () => void;
  onOpenReader?: () => void;
  onOpenAiChat?: (initialPrompt?: string) => void;
  onSignOut?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onOpenSchedule,
  onOpenReader,
  onOpenAiChat,
  onSignOut,
}) => {
  const { theme, setTheme } = useTheme();
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Campus Verification State
  const [showCampusModal, setShowCampusModal] = useState(false);
  const [selectedTargetUniv, setSelectedTargetUniv] = useState<string>('OOU');
  const [currentInsiderQuestion, setCurrentInsiderQuestion] = useState<CampusInsiderQuestion | null>(null);
  const [campusUserAnswer, setCampusUserAnswer] = useState('');
  const [campusVerificationStep, setCampusVerificationStep] = useState<
    'question' | 'near_miss' | 'bluff' | 'verified' | 'failed'
  >('question');
  const [campusNudgeMessage, setCampusNudgeMessage] = useState('');
  const [campusBluffMessage, setCampusBluffMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Voice Preview State
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cohart_selected_voice') || DEFAULT_COHART_VOICE;
    }
    return DEFAULT_COHART_VOICE;
  });
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // Form states for basic info
  const [name, setName] = useState(profile.full_name || '');
  const [matric, setMatric] = useState(profile.matric_number || '');
  const [dept, setDept] = useState(profile.department || '');
  const [level, setLevel] = useState(profile.level || '100L');

  // Attendance & Notes
  const { logs, getAttendanceAdvice } = useAttendanceTracker(profile.id);
  const advice = getAttendanceAdvice();
  const [savedVaultCount, setSavedVaultCount] = useState<number>(0);

  // Bank Withdrawal form states
  const [bankName, setBankName] = useState('Opay');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('1000');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    setName(profile.full_name || '');
    setMatric(profile.matric_number || '');
    setDept(profile.department || '');
    setLevel(profile.level || '100L');
  }, [profile]);

  useEffect(() => {
    let mounted = true;
    async function loadVault() {
      try {
        const data = await fetchSavedExplanations();
        if (mounted) setSavedVaultCount(data.length);
      } catch {
        // Fallback gracefully
      }
    }
    loadVault();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveBasic = async () => {
    await onUpdateProfile({
      full_name: name.trim(),
      matric_number: matric.trim(),
      department: dept.trim(),
      level: level.trim(),
    });
    setIsEditingBasic(false);
  };

  const handleSelectVoice = (vId: string) => {
    setSelectedVoice(vId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cohart_selected_voice', vId);
    }

    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current = null;
    }

    const voiceObj = COHART_VOICES.find((v) => v.id === vId);
    if (voiceObj && voiceObj.audioUrl) {
      try {
        const audio = new Audio(voiceObj.audioUrl);
        voiceAudioRef.current = audio;
        setPlayingVoiceId(vId);
        audio.onended = () => setPlayingVoiceId(null);
        audio.onerror = () => setPlayingVoiceId(null);
        audio.play().catch((err) => {
          console.warn('Preview play prevented:', err);
          setPlayingVoiceId(null);
        });
      } catch (err) {
        console.warn('Error playing preview:', err);
        setPlayingVoiceId(null);
      }
    }
  };

  const handleStartCampusChange = (targetCode?: string) => {
    const defaultCode = targetCode || (profile.institution?.includes('OOU') ? 'UNILAG' : 'OOU');
    setSelectedTargetUniv(defaultCode);
    const q = getRandomCampusQuestion(defaultCode);
    setCurrentInsiderQuestion(q);
    setCampusUserAnswer('');
    setCampusVerificationStep('question');
    setCampusNudgeMessage('');
    setCampusBluffMessage('');
    setShowCampusModal(true);
  };

  const handleSelectTargetUniv = (code: string) => {
    setSelectedTargetUniv(code);
    const q = getRandomCampusQuestion(code);
    setCurrentInsiderQuestion(q);
    setCampusUserAnswer('');
    setCampusVerificationStep('question');
    setCampusNudgeMessage('');
    setCampusBluffMessage('');
  };

  const handleSubmitCampusAnswer = () => {
    if (!currentInsiderQuestion || !campusUserAnswer.trim()) return;

    const evalResult = evaluateCampusAnswer(currentInsiderQuestion, campusUserAnswer, false);
    if (evalResult.status === 'correct') {
      setCampusBluffMessage(evalResult.bluffPrompt || currentInsiderQuestion.bluffChallenge);
      setCampusVerificationStep('bluff');
    } else if (evalResult.status === 'near_miss') {
      setCampusNudgeMessage(evalResult.nudgePrompt || currentInsiderQuestion.nearMissNudge);
      setCampusVerificationStep('near_miss');
    } else {
      setCampusNudgeMessage(evalResult.feedbackText);
      setCampusVerificationStep('failed');
    }
  };

  const handleAnswerBluff = async (rejectsBluff: boolean) => {
    if (!currentInsiderQuestion) return;

    if (rejectsBluff) {
      setCampusVerificationStep('verified');
      const univ = NIGERIAN_UNIVERSITIES.find((u) => u.code === selectedTargetUniv);
      const univName = univ ? `${univ.name} (${univ.shortName})` : selectedTargetUniv;
      await onUpdateProfile({ institution: univName });
      setTimeout(() => {
        setShowCampusModal(false);
      }, 1600);
      return;
    }

    setCampusVerificationStep('failed');
    setCampusNudgeMessage('Verification failed. Try the simpler backup question or verify with Cohart AI in chat.');
  };

  const handleVerifyWithAi = (targetCode: string) => {
    setShowCampusModal(false);
    const univ = NIGERIAN_UNIVERSITIES.find((u) => u.code === targetCode);
    const targetName = univ ? `${univ.name} (${univ.shortName})` : targetCode;
    onOpenAiChat?.(`I want to set my institution to ${targetName}. Please test me with the campus question so I can verify my school.`);
  };

  const handleCopyReferral = () => {
    if (typeof window !== 'undefined' && profile.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      setTimeout(() => {
        setWithdrawSuccess(false);
        setShowWithdrawModal(false);
      }, 2000);
    }, 1200);
  };

  const isProfileIncomplete =
    !profile.full_name?.trim() ||
    !profile.department?.trim() ||
    !profile.matric_number?.trim();

  const initials = profile.full_name?.trim()
    ? profile.full_name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CP';

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Student Profile Card */}
      <GeminiCard className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 border border-[#0B57D0]/20 text-[#0B57D0] dark:text-[#A8C7FA] font-mono text-base font-bold shrink-0">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white font-sans tracking-tight">
                  {profile.full_name?.trim() || 'Student Profile'}
                </h1>
                <Badge variant={isProfileIncomplete ? 'amber' : 'emerald'} size="sm">
                  {isProfileIncomplete ? 'Setup Needed' : 'Active'}
                </Badge>
              </div>

              <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-1">
                {profile.department
                  ? `${profile.matric_number || 'Matric Pending'} • ${profile.department} • ${profile.level || '100L'}`
                  : 'Tap Edit to set your Department & Level'}
              </p>

              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-sans mt-0.5">
                {profile.institution || 'Olabisi Onabanjo University (OOU)'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingBasic(!isEditingBasic)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-xs font-mono text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            <span>{isEditingBasic ? 'Close' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Quick Details Inline Editor */}
        {isEditingBasic && (
          <div className="mt-5 pt-5 border-t border-black/[0.06] dark:border-white/[0.07] space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Folashade Adeyemi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Matric Number</label>
                <input
                  type="text"
                  placeholder="e.g. 21/09/52012"
                  value={matric}
                  onChange={(e) => setMatric(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Department</label>
                <input
                  list="oou-depts-list"
                  type="text"
                  placeholder="Select or type department"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
                />
                <datalist id="oou-depts-list">
                  {ALL_OOU_DEPARTMENTS.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
                >
                  <option value="100L">100 Level</option>
                  <option value="200L">200 Level</option>
                  <option value="300L">300 Level</option>
                  <option value="400L">400 Level</option>
                  <option value="500L">500 Level</option>
                  <option value="600L">600 Level</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingBasic(false)}
                className="px-3.5 py-1.5 rounded-full text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBasic}
                className="px-5 py-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </GeminiCard>

      {/* Two-Column Grid: Attendance & Study Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Attendance Summary */}
        <GeminiCard className="p-5 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <GeminiIcon name="check-circle" size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Class Attendance</h2>
                <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Exam Eligibility</p>
              </div>
            </div>
            <Badge variant={advice.rate >= 75 ? 'emerald' : 'amber'} size="sm">
              {advice.rate >= 75 ? 'Qualified' : 'Below 75%'}
            </Badge>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07] space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-neutral-600 dark:text-neutral-300">Semester Average</span>
              <span className="text-xl font-bold font-mono text-[#0B57D0] dark:text-[#A8C7FA]">
                {advice.rate}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/[0.05] dark:bg-white/[0.1] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  advice.rate >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, advice.rate)}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
              {advice.text}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-[11px] font-mono text-neutral-500">{logs.length} lectures logged</span>
            <button
              onClick={onOpenSchedule}
              className="text-[#0B57D0] dark:text-[#A8C7FA] font-medium hover:underline cursor-pointer"
            >
              Timetable &rarr;
            </button>
          </div>
        </GeminiCard>

        {/* Study Style & Notes */}
        <GeminiCard className="p-5 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                <GeminiIcon name="brain" size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Explanation Style</h2>
                <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                  How AI Explains Concepts
                </p>
              </div>
            </div>

            {onOpenReader && (
              <button
                onClick={onOpenReader}
                className="text-xs font-mono text-[#0B57D0] dark:text-[#A8C7FA] hover:underline cursor-pointer"
              >
                {savedVaultCount} Saved Notes
              </button>
            )}
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
            Select your preferred teaching style for course notes and questions:
          </p>

          {/* Clean 3-Pill Style Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'visual_analogies', label: 'Analogies', desc: 'Everyday examples' },
              { id: 'concise_bullet', label: 'Concise', desc: 'Direct bullet points' },
              { id: 'deep_first_principles', label: 'Deep Dive', desc: 'First principles' },
            ].map((style) => {
              const isSelected = profile.learning_style === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => onUpdateProfile({ learning_style: style.id as LearningStyle })}
                  className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/15 border-[#0B57D0]/30 dark:border-[#A8C7FA]/30'
                      : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isSelected ? 'text-[#0B57D0] dark:text-[#A8C7FA]' : 'text-neutral-800 dark:text-neutral-200'}`}>
                      {style.label}
                    </span>
                    {isSelected && <GeminiIcon name="check" size={12} className="text-[#0B57D0] dark:text-[#A8C7FA]" />}
                  </div>
                  <span className="text-[10px] text-neutral-500 block mt-0.5">{style.desc}</span>
                </button>
              );
            })}
          </div>
        </GeminiCard>
      </div>

      {/* University & Campus Preferences Card */}
      <GeminiCard className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
              <GeminiIcon name="compass" size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">University & Campus</h2>
              <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                Tertiary Institution Preference
              </p>
            </div>
          </div>
          <button
            onClick={() => handleStartCampusChange()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/15 border border-[#0B57D0]/30 dark:border-[#A8C7FA]/30 text-xs font-mono text-[#0B57D0] dark:text-[#A8C7FA] hover:bg-[#0B57D0]/20 transition-all active:scale-95 cursor-pointer font-medium"
          >
            <span>Change University</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07] gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                {profile.institution || 'Olabisi Onabanjo University (OOU)'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                Active
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              {profile.institution?.includes('OOU')
                ? 'Ago-Iwoye Main Campus • Live Interactive Campus Map Active'
                : 'Cohart Academic Study Assistant Active'}
            </p>
          </div>

          <button
            onClick={() => handleStartCampusChange()}
            className="px-3.5 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-xs text-neutral-800 dark:text-neutral-200 font-mono transition-colors cursor-pointer"
          >
            Switch School
          </button>
        </div>
      </GeminiCard>

      {/* Reading Voice Card */}
      <GeminiCard className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
              <GeminiIcon name="volume" size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Reading Voice</h2>
              <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                Voice Used to Read Course Notes & Explanations
              </p>
            </div>
          </div>
        </div>

        {/* Compact Voice Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {COHART_VOICES.map((v) => {
            const isSelected = v.id === selectedVoice;
            const isPlaying = playingVoiceId === v.id;
            return (
              <div
                key={v.id}
                onClick={() => handleSelectVoice(v.id)}
                className={`p-3 rounded-2xl transition-all border cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/15 border-[#0B57D0]/40 dark:border-[#A8C7FA]/40'
                    : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] hover:border-black/[0.12]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold truncate ${isSelected ? 'text-[#0B57D0] dark:text-[#A8C7FA]' : 'text-neutral-800 dark:text-neutral-200'}`}>
                      {v.label.split(' ')[1] || v.label}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400">
                      {v.gender}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                    {v.persona.split(',')[0]}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  {isPlaying ? (
                    <span className="h-2 w-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-ping" />
                  ) : isSelected ? (
                    <GeminiIcon name="check" size={14} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </GeminiCard>

      {/* Referral & Wallet Card */}
      <GeminiCard className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
              <GeminiIcon name="wallet" size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Invite Course Mates</h2>
              <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">₦500 reward for every course mate who registers</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Balance Widget */}
          <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06]">
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Available Balance</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">
                ₦{(profile.wallet_balance || 0).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="mt-3 w-full py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              Withdraw to Bank
            </button>
          </div>

          {/* Referral Code Box */}
          <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">Your Referral Code</span>
              <div className="flex items-center justify-between mt-1 p-2 rounded-xl bg-white dark:bg-[#1E1F20] border border-black/[0.06] dark:border-white/[0.06]">
                <span className="text-sm font-mono font-bold text-[#0B57D0] dark:text-[#A8C7FA]">
                  {profile.referral_code}
                </span>
                <button
                  onClick={handleCopyReferral}
                  className="flex items-center gap-1 text-[11px] font-mono text-neutral-700 dark:text-neutral-300 hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] cursor-pointer"
                >
                  <GeminiIcon name={copiedCode ? 'check' : 'copy'} size={13} />
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 font-sans">
              Share your code with course mates to earn rewards.
            </p>
          </div>
        </div>
      </GeminiCard>

      {/* App Appearance & Sign Out Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-xs font-mono text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.05] transition-all cursor-pointer"
          >
            <GeminiIcon name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        {onSignOut && (
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-xs font-mono text-rose-600 dark:text-rose-400 transition-all cursor-pointer"
          >
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {/* Bank Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.08] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Withdraw to Bank</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white text-xs cursor-pointer"
              >
                <GeminiIcon name="close" size={16} />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="flex justify-center text-emerald-500">
                  <GeminiIcon name="check-circle" size={36} />
                </div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Withdrawal Submitted</h4>
                <p className="text-xs text-neutral-500">Your payout is being processed to your account.</p>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase">Bank</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white"
                  >
                    <option value="Opay">OPay Digital Services</option>
                    <option value="Palmpay">PalmPay</option>
                    <option value="Kuda">Kuda Bank</option>
                    <option value="Moniepoint">Moniepoint MFB</option>
                    <option value="GTBank">Guaranty Trust Bank (GTBank)</option>
                    <option value="Access">Access Bank</option>
                    <option value="FirstBank">First Bank of Nigeria</option>
                    <option value="UBA">United Bank for Africa (UBA)</option>
                    <option value="Zenith">Zenith Bank</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase">Account Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="10-digit NUBAN"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full mt-1 p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase">Account Name</label>
                  <input
                    type="text"
                    placeholder="Account Name"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase">Amount (₦)</label>
                  <input
                    type="number"
                    min={500}
                    max={profile.wallet_balance || 0}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isWithdrawing || (profile.wallet_balance || 0) < 500}
                  className="w-full mt-2 py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  {isWithdrawing ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Campus Verification Modal */}
      {showCampusModal && currentInsiderQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#161822] border border-black/[0.08] dark:border-white/[0.1] p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/15 text-[#0B57D0] dark:text-[#A8C7FA]">
                  <GeminiIcon name="shield-check" size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Verify Campus</h3>
                  <p className="text-[10px] font-mono text-neutral-500">Campus Question</p>
                </div>
              </div>
              <button
                onClick={() => setShowCampusModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
              >
                <GeminiIcon name="close" size={16} />
              </button>
            </div>

            {/* Target University Selector */}
            <div className="mb-4">
              <UniversityCombobox
                label="Select New University"
                value={selectedTargetUniv}
                onChange={(code) => handleSelectTargetUniv(code)}
                placeholder="Search university to switch..."
              />
            </div>

            {/* Question Card */}
            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07] mb-4">
              <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                {currentInsiderQuestion.question}
              </p>
            </div>

            {/* Step: Answering Question */}
            {campusVerificationStep === 'question' && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={campusUserAnswer}
                  onChange={(e) => setCampusUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmitCampusAnswer();
                  }}
                  className="w-full p-3 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#0B57D0]"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSubmitCampusAnswer}
                    disabled={!campusUserAnswer.trim()}
                    className="flex-1 py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-semibold text-xs hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer shadow-xs"
                  >
                    Verify Answer
                  </button>
                  <button
                    onClick={() => handleVerifyWithAi(selectedTargetUniv)}
                    className="py-2.5 px-3.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-xs font-mono text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.08] transition-colors cursor-pointer"
                  >
                    Ask AI &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Step: Near Miss Nudge */}
            {campusVerificationStep === 'near_miss' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  {campusNudgeMessage}
                </div>
                <input
                  type="text"
                  placeholder="Clarify your answer..."
                  value={campusUserAnswer}
                  onChange={(e) => setCampusUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmitCampusAnswer();
                  }}
                  className="w-full p-3 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#0B57D0]"
                />
                <button
                  onClick={handleSubmitCampusAnswer}
                  className="w-full py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Submit Clarification
                </button>
              </div>
            )}

            {/* Step: The Bluff Challenge */}
            {campusVerificationStep === 'bluff' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                  {campusBluffMessage}
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleAnswerBluff(true)}
                    className="w-full text-left p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-200 font-medium transition-colors cursor-pointer"
                  >
                    No, that is incorrect. My answer is accurate.
                  </button>
                  <button
                    onClick={() => handleAnswerBluff(false)}
                    className="w-full text-left p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] border border-black/[0.06] text-xs text-neutral-600 dark:text-neutral-400 transition-colors cursor-pointer"
                  >
                    Wait, let me check again.
                  </button>
                </div>
              </div>
            )}

            {/* Step: Verified */}
            {campusVerificationStep === 'verified' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                <div className="flex justify-center text-emerald-600 dark:text-emerald-400">
                  <GeminiIcon name="check-circle" size={32} />
                </div>
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                  Verified!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Your university preference has been updated.
                </p>
              </div>
            )}

            {/* Step: Failed */}
            {campusVerificationStep === 'failed' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                  {campusNudgeMessage || 'Verification failed. Try again or verify with Cohart AI in chat.'}
                </div>
                <button
                  onClick={() => {
                    setCampusVerificationStep('question');
                    setCampusUserAnswer('');
                  }}
                  className="w-full py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-xs text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.08] cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

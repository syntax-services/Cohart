'use client';

import React, { useState, useEffect } from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile, LearningStyle, COHART_VOICES, DEFAULT_COHART_VOICE } from '@/lib/types';
import { useTheme, Theme } from '@/components/ThemeProvider';
import { useAttendanceTracker } from '@/hooks/useAttendanceTracker';
import { fetchSavedExplanations } from '@/lib/supabase';
import { ALL_OOU_DEPARTMENTS } from '@/lib/oouCourses';

interface ProfileViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => Promise<void>;
  onOpenSchedule: () => void;
  onOpenReader?: () => void;
  onSignOut?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onOpenSchedule,
  onOpenReader,
  onSignOut,
}) => {
  const { theme, setTheme } = useTheme();
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cohart_selected_voice') || DEFAULT_COHART_VOICE;
    }
    return DEFAULT_COHART_VOICE;
  });

  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const voiceAudioRef = React.useRef<HTMLAudioElement | null>(null);

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

  // Form states for basic info
  const [name, setName] = useState(profile.full_name || '');
  const [matric, setMatric] = useState(profile.matric_number || '');
  const [dept, setDept] = useState(profile.department || '');
  const [level, setLevel] = useState(profile.level || '100L');

  // Questionnaire answers
  const [qStep, setQStep] = useState(0);

  // Paystack mock state
  const [withdrawAmount, setWithdrawAmount] = useState('5000');
  const [bankName, setBankName] = useState('Access Bank');
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Attendance & Vault live metrics
  const { getAttendanceAdvice } = useAttendanceTracker(profile.id);
  const advice = getAttendanceAdvice();
  const [savedVaultCount, setSavedVaultCount] = useState(0);

  useEffect(() => {
    setName(profile.full_name || '');
    setMatric(profile.matric_number || '');
    setDept(profile.department || '');
    setLevel(profile.level || '100L');
  }, [profile.full_name, profile.matric_number, profile.department, profile.level]);

  useEffect(() => {
    async function loadVaultCount() {
      const data = await fetchSavedExplanations(profile.id);
      setSavedVaultCount(data.length);
    }
    loadVaultCount();
  }, [profile.id]);

  const cognitiveTraitOptions = [
    'Short attention span / Fast pace',
    'Exam tension / Calm explanations',
    'Everyday Nigerian examples',
    'Clear text spacing',
    'Step-by-step from scratch',
    'Late night study focus',
    'Visual & summary style',
    'Short 20-minute sessions',
  ];

  const handleToggleTrait = async (trait: string) => {
    const current = profile.cognitive_traits || [];
    const exists = current.includes(trait);
    const updated = exists ? current.filter((t) => t !== trait) : [...current, trait];
    await onUpdateProfile({ cognitive_traits: updated });
  };

  const handleSaveBasic = async () => {
    await onUpdateProfile({
      full_name: name.trim(),
      matric_number: matric.trim(),
      department: dept.trim(),
      level,
    });
    setIsEditingBasic(false);
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(
      `https://cohart.app/join?ref=${profile.referral_code}`
    );
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExecuteWithdrawal = () => {
    setIsWithdrawing(true);
    setTimeout(async () => {
      const amt = parseFloat(withdrawAmount) || 0;
      const newBal = Math.max(0, (profile.wallet_balance || 0) - amt);
      await onUpdateProfile({ wallet_balance: newBal });
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      setTimeout(() => {
        setWithdrawSuccess(false);
        setShowWithdrawModal(false);
      }, 2000);
    }, 1200);
  };

  const questionnaireQuestions = [
    {
      q: 'When a lecturer teaches a tough topic in class, what helps you understand it best?',
      options: [
        'A simple Nigerian real-life example (like market prices in Ago-Iwoye)',
        'A step-by-step mathematical breakdown from scratch',
        'A short summary with bullet points highlighting key formulas',
        'A simple question-and-answer discussion on why it works',
      ],
      styleMapping: [
        'visual_analogies',
        'deep_first_principles',
        'concise_bullet',
        'socratic_inquiry',
      ] as LearningStyle[],
    },
    {
      q: 'How do you like to study best during long hours?',
      options: [
        'In quick, short bursts because my mind moves fast',
        'By reading quietly at my own pace',
        'With calm, patient explanations because exams make me anxious',
        'By testing myself with practice questions',
      ],
      traitAdd: 'Short attention span / Fast pace',
    },
  ];

  const handleSelectQuestionnaireOption = async (optionIdx: number) => {
    const currentQ = questionnaireQuestions[qStep];
    if (qStep === 0 && currentQ.styleMapping) {
      const selectedStyle = currentQ.styleMapping[optionIdx];
      await onUpdateProfile({ learning_style: selectedStyle });
    }

    if (qStep < questionnaireQuestions.length - 1) {
      setQStep(qStep + 1);
    } else {
      setShowQuestionnaire(false);
      setQStep(0);
    }
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
      {/* Incomplete Profile Callout Banner */}
      {isProfileIncomplete && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <GeminiIcon name="user" size={19} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                Complete Your Student Profile
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                Add your name, OOU department, level, and matric number so Cohart can give you simple notes, class alerts, and directions.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditingBasic(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shrink-0 transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            Complete Profile
          </button>
        </div>
      )}

      {/* Lit Student Identity Card with Ambient Gradient & Liquid Glass */}
      <GeminiCard className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-white/90 via-white/80 to-blue-50/40 dark:from-[#131620]/90 dark:via-[#11131A]/85 dark:to-[#0B1528]/50 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.08] shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0B57D0] to-[#6894ea] dark:from-[#0B57D0] dark:to-[#A8C7FA] font-mono text-base font-bold text-white dark:text-neutral-950 shrink-0 shadow-[0_0_20px_rgba(11,87,208,0.3)] ring-2 ring-white dark:ring-[#1E2230]">
              {initials}
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1E2230]" title="Active student session">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white font-sans tracking-tight">
                  {profile.full_name?.trim() || 'Student Profile'}
                </h1>
                {isProfileIncomplete ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
                    Setup Needed
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                    Verified
                  </span>
                )}
              </div>

              <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-1">
                {profile.department
                  ? `${profile.matric_number || 'Matric Pending'} • ${profile.department} • ${profile.level || '100L'}`
                  : 'Tap Edit to set your Department & Level • OOU PS'}
              </p>

              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-sans mt-0.5">
                {profile.institution} • Ago-Iwoye Main PS
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

        {/* Compact Quick Details Inline Editor */}
        {isEditingBasic && (
          <div className="mt-5 pt-5 border-t border-black/[0.06] dark:border-white/[0.07] space-y-3.5 animate-in fade-in">
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
                <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">OOU Department</label>
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
                <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Academic Level</label>
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
                  <option value="600L">600 Level (MBBS)</option>
                  <option value="PG">Postgraduate</option>
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
                Save Profile
              </button>
            </div>
          </div>
        )}
      </GeminiCard>

      {/* Two-Column Grid: CA Attendance & Cognitive AI Conditioning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Continuous Assessment Attendance Metric */}
        <GeminiCard className="p-5 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <GeminiIcon name="check-circle" size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Class Attendance for Exams</h2>
                <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">75% Minimum Required</p>
              </div>
            </div>
            <Badge variant={advice.rate >= 75 ? 'emerald' : 'amber'} size="sm">
              {advice.rate >= 75 ? 'Qualified for Exams' : 'Below 75% Target'}
            </Badge>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07] space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-neutral-600 dark:text-neutral-300">Class Attendance</span>
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
            <span className="text-[11px] font-mono text-neutral-500">{savedVaultCount} Saved AI Notes</span>
            <button
              onClick={onOpenSchedule}
              className="text-[#0B57D0] dark:text-[#A8C7FA] font-medium hover:underline cursor-pointer"
            >
              Class Timetable &rarr;
            </button>
          </div>
        </GeminiCard>

        {/* Cognitive Traits & AI Adaptation Matrix */}
        <GeminiCard className="p-5 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                <GeminiIcon name="brain" size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">How You Want AI to Teach You</h2>
                <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                  Style: {profile.learning_style.replace('_', ' ')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowQuestionnaire(true)}
              className="text-xs font-mono text-[#0B57D0] dark:text-[#A8C7FA] hover:underline cursor-pointer"
            >
              Change Style
            </button>
          </div>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-2.5 leading-relaxed">
            Choose how you want Cohart AI to explain things to you:
          </p>

          {/* Cognitive Traits Selector Chips */}
          <div className="flex flex-wrap gap-1.5">
            {cognitiveTraitOptions.map((trait) => {
              const isSelected = profile.cognitive_traits.includes(trait);
              return (
                <button
                  key={trait}
                  onClick={() => handleToggleTrait(trait)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans transition-all active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/15 border border-[#0B57D0]/30 dark:border-[#A8C7FA]/30 text-[#0B57D0] dark:text-[#A8C7FA] font-medium'
                      : 'bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {isSelected && <GeminiIcon name="check" size={12} className="text-[#0B57D0] dark:text-[#A8C7FA]" />}
                  <span>{trait}</span>
                </button>
              );
            })}
          </div>
        </GeminiCard>
      </div>

      {/* Deepgram AI Voice Preference Card */}
      <GeminiCard className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
              <GeminiIcon name="volume" size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">AI Voice & Audio Model</h2>
              <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                Deepgram Aura-2 Conversational Models • Premium Reading Pacing
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
          Select the voice model Cohart AI uses to read lectures and explain topics to you:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {COHART_VOICES.map((v) => {
            const isSelected = v.id === selectedVoice;
            return (
              <button
                key={v.id}
                onClick={() => handleSelectVoice(v.id)}
                className={`text-left p-3 rounded-2xl transition-all border cursor-pointer active:scale-98 ${
                  isSelected
                    ? 'bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/15 border-[#0B57D0]/40 dark:border-[#A8C7FA]/40 shadow-xs'
                    : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] hover:border-black/[0.12] dark:hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-[#0B57D0] dark:text-[#A8C7FA]' : 'text-neutral-800 dark:text-neutral-200'}`}>
                    {v.label}
                  </span>
                  {isSelected && <GeminiIcon name="check" size={13} className="text-[#0B57D0] dark:text-[#A8C7FA]" />}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/[0.05] dark:bg-white/[0.08] text-neutral-500">
                    {v.gender}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/[0.05] dark:bg-white/[0.08] text-neutral-500">
                    {v.generation.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                  {v.persona}
                </p>
              </button>
            );
          })}
        </div>
      </GeminiCard>

      {/* Referral Program & Paystack Wallet Card */}
      <GeminiCard className="p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
              <GeminiIcon name="wallet" size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Invite Course Mates</h2>
              <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Get ₦500 for every course mate who joins</p>
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
              You get ₦500 each time a friend signs up with your code.
            </p>
          </div>
        </div>
      </GeminiCard>

      {/* App Appearance & Sign Out Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-white/70 dark:bg-[#12151E]/70 border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <GeminiIcon name="sun" size={16} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">Theme</span>
          <div className="flex items-center gap-1 ml-2 bg-black/[0.03] dark:bg-white/[0.04] p-0.5 rounded-full">
            {(['system', 'light', 'dark'] as Theme[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={`px-3 py-1 rounded-full text-xs font-mono capitalize transition-all cursor-pointer ${
                  theme === mode
                    ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-semibold shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {onSignOut && (
          <button
            onClick={onSignOut}
            className="self-start sm:self-auto px-4 py-1.5 rounded-full border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-mono transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        )}
      </div>

      {/* Cognitive Questionnaire Modal */}
      {showQuestionnaire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#161822] border border-black/[0.08] dark:border-white/[0.1] p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GeminiIcon name="brain" size={17} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Learning Style Quiz ({qStep + 1}/2)
                </h3>
              </div>
              <button
                onClick={() => setShowQuestionnaire(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <GeminiIcon name="close" size={16} />
              </button>
            </div>

            <p className="text-xs font-semibold text-neutral-900 dark:text-white mb-3">
              {questionnaireQuestions[qStep].q}
            </p>

            <div className="space-y-2">
              {questionnaireQuestions[qStep].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectQuestionnaireOption(i)}
                  className="w-full text-left p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] hover:border-[#0B57D0] dark:hover:border-[#A8C7FA] text-xs text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Paystack Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#161822] border border-black/[0.08] dark:border-white/[0.1] p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Withdraw Money to Bank</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <GeminiIcon name="close" size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase">Amount (₦)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase">Bank Name</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white"
                >
                  <option value="Access Bank">Access Bank (Ago-Iwoye PS)</option>
                  <option value="Wema Bank">Wema Bank (OOU PS Branch)</option>
                  <option value="GTBank">Guaranty Trust Bank</option>
                  <option value="First Bank">First Bank of Nigeria</option>
                  <option value="Opay">OPay Digital Services</option>
                  <option value="Palmpay">PalmPay</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <button
                onClick={handleExecuteWithdrawal}
                disabled={isWithdrawing || withdrawSuccess}
                className="mt-2 w-full py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-semibold text-xs hover:opacity-90 transition-opacity flex items-center justify-center cursor-pointer shadow-xs"
              >
                {isWithdrawing ? (
                  <span className="flex items-center gap-1.5 font-mono">Processing Transfer...</span>
                ) : withdrawSuccess ? (
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <GeminiIcon name="check" size={13} />
                    <span>Transferred via Paystack</span>
                  </span>
                ) : (
                  'Confirm Withdrawal'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

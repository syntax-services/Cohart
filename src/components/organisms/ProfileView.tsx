'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile, LearningStyle, COHART_VOICES, DEFAULT_COHART_VOICE } from '@/lib/types';
import { UniversityCombobox } from '@/components/ui/UniversityCombobox';
import { useTheme } from '@/components/ThemeProvider';
import { useAttendanceTracker } from '@/hooks/useAttendanceTracker';
import { fetchSavedExplanations, clearAllAiConversations } from '@/lib/supabase';
import { ALL_OOU_DEPARTMENTS } from '@/lib/oouCourses';
import {
  NIGERIAN_UNIVERSITIES,
  getRandomCampusQuestion,
  evaluateCampusAnswer,
  CampusInsiderQuestion,
} from '@/lib/campusVerification';

export type SettingsGroup = 'account' | 'voice' | 'study' | 'wallet' | 'privacy';

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
  const [activeGroup, setActiveGroup] = useState<SettingsGroup>('account');
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

  // Bionic Reading Mode State (Default: ON)
  const [isBionicEnabled, setIsBionicEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cohart_bionic_mode');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  // Cloud AI Conversation clearing state
  const [isClearingChats, setIsClearingChats] = useState(false);
  const [clearChatSuccess, setClearChatSuccess] = useState(false);

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

  const handleToggleBionic = () => {
    const next = !isBionicEnabled;
    setIsBionicEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cohart_bionic_mode', String(next));
    }
  };

  const handleClearCloudChats = async () => {
    if (!confirm('Clear all AI conversation history from your account? This action cannot be undone.')) return;
    setIsClearingChats(true);
    try {
      await clearAllAiConversations(profile.id);
      setClearChatSuccess(true);
      setTimeout(() => setClearChatSuccess(false), 2500);
    } catch {
      alert('Unable to clear conversations. Please check your connection.');
    } finally {
      setIsClearingChats(false);
    }
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
    <div className="space-y-6 sm:space-y-8 pb-32 max-w-4xl mx-auto">
      {/* 1. Student Profile Header Card (Inspired by String & Compound) */}
      <GeminiCard className="p-6 sm:p-8 rounded-[2rem] bg-white/80 dark:bg-[#12151E]/80 backdrop-blur-3xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 border border-[#0B57D0]/20 text-[#0B57D0] dark:text-[#A8C7FA] font-mono text-xl font-bold shrink-0 shadow-sm">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-sans tracking-tight">
                  {profile.full_name?.trim() || 'Student Profile'}
                </h1>
                <Badge variant={isProfileIncomplete ? 'amber' : 'emerald'} size="md">
                  {isProfileIncomplete ? 'Setup Needed' : 'Active'}
                </Badge>
              </div>

              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-2">
                {profile.department
                  ? `${profile.matric_number || 'Matric Pending'} • ${profile.department} • ${profile.level || '100L'}`
                  : 'Tap Account to set your Department & Level'}
              </p>

              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-sans mt-1">
                {profile.institution || 'Olabisi Onabanjo University (OOU)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveGroup('account');
                setIsEditingBasic(true);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-sm font-bold text-neutral-800 dark:text-neutral-200 hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </GeminiCard>

      {/* 2. Segmented Navigation Bar (String & Compound Design Aesthetic) */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] overflow-x-auto no-scrollbar">
        {[
          { id: 'account', label: 'Account & Uni', icon: 'shield-check' },
          { id: 'voice', label: 'Voice & Audio', icon: 'volume' },
          { id: 'study', label: 'Study & Bionic', icon: 'reader' },
          { id: 'wallet', label: 'Wallet & Referrals', icon: 'wallet' },
          { id: 'privacy', label: 'Privacy & Data', icon: 'settings' },
        ].map((tab) => {
          const isActive = activeGroup === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveGroup(tab.id as SettingsGroup)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-[#1E1F20] text-neutral-900 dark:text-white shadow-sm border border-black/[0.06] dark:border-white/[0.08]'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
              }`}
            >
              <GeminiIcon
                name={tab.icon as any}
                size={18}
                className={isActive ? 'text-[#0B57D0] dark:text-[#A8C7FA]' : 'text-neutral-400'}
              />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Grouped Settings Views */}
      <div className="space-y-6">
        {/* GROUP A: Account & University */}
        {activeGroup === 'account' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Personal & Academic Details */}
            <GeminiCard className="p-6 sm:p-8 rounded-[2rem] bg-white/80 dark:bg-[#12151E]/80 backdrop-blur-3xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                    <GeminiIcon name="shield-check" size={20} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                      Academic Credentials
                    </h2>
                    <p className="text-xs text-neutral-500">Matriculation and Department</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditingBasic(!isEditingBasic)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#0B57D0] dark:text-[#A8C7FA] bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 hover:bg-[#0B57D0]/20 transition-colors cursor-pointer"
                >
                  {isEditingBasic ? 'Cancel' : 'Edit Info'}
                </button>
              </div>

              {isEditingBasic ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-neutral-500 uppercase font-bold block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Folashade Adeyemi"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-neutral-500 uppercase font-bold block mb-1">
                        Matric Number
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 21/09/52012"
                        value={matric}
                        onChange={(e) => setMatric(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono text-neutral-500 uppercase font-bold block mb-1">
                        Department
                      </label>
                      <input
                        list="oou-depts-list-account"
                        type="text"
                        placeholder="Select or type department"
                        value={dept}
                        onChange={(e) => setDept(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
                      />
                      <datalist id="oou-depts-list-account">
                        {ALL_OOU_DEPARTMENTS.map((d) => (
                          <option key={d} value={d} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="text-xs font-mono text-neutral-500 uppercase font-bold block mb-1">
                        Level
                      </label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.1] text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
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

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingBasic(false)}
                      className="px-5 py-2.5 rounded-full text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveBasic}
                      className="px-6 py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
                    <span className="text-xs font-mono text-neutral-400 uppercase font-bold block">Full Name</span>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white mt-1 block">
                      {profile.full_name || 'Not set'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
                    <span className="text-xs font-mono text-neutral-400 uppercase font-bold block">Matric Number</span>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white mt-1 block">
                      {profile.matric_number || 'Pending'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
                    <span className="text-xs font-mono text-neutral-400 uppercase font-bold block">Department</span>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white mt-1 block truncate">
                      {profile.department || 'Not set'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
                    <span className="text-xs font-mono text-neutral-400 uppercase font-bold block">Academic Level</span>
                    <span className="text-sm font-bold text-[#0B57D0] dark:text-[#A8C7FA] mt-1 block">
                      {profile.level || '100L'}
                    </span>
                  </div>
                </div>
              )}
            </GeminiCard>

            {/* University Preference & Anti-Cheat Switcher */}
            <GeminiCard className="p-6 sm:p-8 rounded-[2rem] bg-white/80 dark:bg-[#12151E]/80 backdrop-blur-3xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                    <GeminiIcon name="compass" size={20} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                      University Preference
                    </h2>
                    <p className="text-xs text-neutral-500">Tertiary Institution & Campus Navigation</p>
                  </div>
                </div>

                <button
                  onClick={() => handleStartCampusChange()}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#0B57D0] dark:text-[#A8C7FA] bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 hover:bg-[#0B57D0]/20 transition-colors cursor-pointer"
                >
                  Change University
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-neutral-900 dark:text-white">
                      {profile.institution || 'Olabisi Onabanjo University (OOU)'}
                    </span>
                    <Badge variant="emerald" size="sm">Active Campus</Badge>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {profile.institution?.includes('OOU')
                      ? 'Ago-Iwoye Main Campus • Interactive Live Campus Map Active'
                      : 'Academic Study & Exam Drills Active'}
                  </p>
                </div>

                <button
                  onClick={() => handleStartCampusChange()}
                  className="px-4 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-xs font-bold text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer shrink-0"
                >
                  Verify New School
                </button>
              </div>
            </GeminiCard>
          </div>
        )}

        {/* GROUP B: Voice & Audio */}
        {activeGroup === 'voice' && (
          <GeminiCard className="p-6 sm:p-8 rounded-[2rem] bg-white/80 dark:bg-[#12151E]/80 backdrop-blur-3xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                  <GeminiIcon name="volume" size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                    Reading Voice & Audio Model
                  </h2>
                  <p className="text-xs text-neutral-500">Deepgram Aura-2 Academic Voice Models</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Select your favorite voice model. Each voice plays a unique pre-recorded academic sample when clicked:
            </p>

            {/* Grid of Voices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {COHART_VOICES.map((v) => {
                const isSelected = v.id === selectedVoice;
                const isPlaying = playingVoiceId === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => handleSelectVoice(v.id)}
                    className={`p-4 rounded-2xl transition-all border cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/15 border-[#0B57D0]/40 dark:border-[#A8C7FA]/40 shadow-sm'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] hover:border-black/[0.12] dark:hover:border-white/[0.12]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isSelected ? 'text-[#0B57D0] dark:text-[#A8C7FA]' : 'text-neutral-900 dark:text-white'}`}>
                          {v.label}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-neutral-400">
                          {v.gender}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                        {v.persona}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <span className="text-[10px] font-mono text-neutral-400">
                        {isPlaying ? 'Playing sample...' : isSelected ? 'Active Voice' : 'Tap to test'}
                      </span>
                      {isPlaying ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-ping" />
                      ) : isSelected ? (
                        <GeminiIcon name="check" size={16} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </GeminiCard>
        )}

        {/* GROUP C: Study & Bionic */}
        {activeGroup === 'study' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Bionic Reading Card */}
            <GeminiCard className="p-6 sm:p-8 rounded-[2rem] bg-white/80 dark:bg-[#12151E]/80 backdrop-blur-3xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                    <GeminiIcon name="reader" size={20} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                      Bionic Reading Mode
                    </h2>
                    <p className="text-xs text-neutral-500">Fixation-guided rapid reading engine</p>
                  </div>
                </div>

                <button
                  onClick={handleToggleBionic}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm ${
                    isBionicEnabled
                      ? 'bg-emerald-500 text-white'
                      : 'bg-black/[0.06] dark:bg-white/[0.08] text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {isBionicEnabled ? 'Enabled (Default)' : 'Disabled'}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                  <strong>How it works:</strong> Bionic reading guides your eyes through course text using artificial fixation points. The first few letters of words are highlighted, allowing your brain to complete words faster and absorb lecture notes in half the time.
                </p>
              </div>
            </GeminiCard>

            {/* Explanation Style Card */}
            <GeminiCard className="p-6 sm:p-8 rounded-[2rem] bg-white/80 dark:bg-[#12151E]/80 backdrop-blur-3xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                    <GeminiIcon name="brain" size={20} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                      AI Explanation Style
                    </h2>
                    <p className="text-xs text-neutral-500">Socratic, Visual Analogies, or Concise</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'visual_analogies', label: 'Everyday Analogies', desc: 'Nigerian market dynamics & relatable examples' },
                  { id: 'concise_bullet', label: 'Concise Bullet', desc: 'Direct, high-yield bulleted points' },
                  { id: 'deep_first_principles', label: 'First Principles', desc: 'Fundamental academic axioms and logic' },
                ].map((style) => {
                  const isSelected = profile.learning_style === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => onUpdateProfile({ learning_style: style.id as LearningStyle })}
                      className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/15 border-[#0B57D0]/30 dark:border-[#A8C7FA]/30 shadow-xs'
                          : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${isSelected ? 'text-[#0B57D0] dark:text-[#A8C7FA]' : 'text-neutral-800 dark:text-neutral-200'}`}>
                          {style.label}
                        </span>
                        {isSelected && <GeminiIcon name="check" size={16} className="text-[#0B57D0] dark:text-[#A8C7FA]" />}
                      </div>
                      <span className="text-xs text-neutral-500 block mt-1">{style.desc}</span>
                    </button>
                  );
                })}
              </div>
            </GeminiCard>
          </div>
        )}

        {/* GROUP D: Wallet & Referrals */}
        {activeGroup === 'wallet' && (
          <GeminiCard className="p-6 sm:p-8 rounded-[2rem] bg-white/80 dark:bg-[#12151E]/80 backdrop-blur-3xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                  <GeminiIcon name="wallet" size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                    Referral Earnings & Wallet
                  </h2>
                  <p className="text-xs text-neutral-500">₦500 reward for every course mate who registers</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Balance Widget */}
              <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-neutral-500 uppercase font-bold">Available Balance</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-neutral-900 dark:text-white font-mono">
                      ₦{(profile.wallet_balance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="w-full py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-xs"
                  >
                    Withdraw to Bank &rarr;
                  </button>
                </div>
              </div>

              {/* Referral Code Box */}
              <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-neutral-500 uppercase font-bold">Your Referral Code</span>
                  <div className="flex items-center justify-between mt-2 p-3 rounded-xl bg-white dark:bg-[#1E1F20] border border-black/[0.06] dark:border-white/[0.06]">
                    <span className="text-base font-mono font-bold text-[#0B57D0] dark:text-[#A8C7FA]">
                      {profile.referral_code}
                    </span>
                    <button
                      onClick={handleCopyReferral}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] cursor-pointer"
                    >
                      <GeminiIcon name={copiedCode ? 'check' : 'copy'} size={15} />
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 font-sans">
                  Share your referral link with faculty group chats. Rewards credit instantly upon registration.
                </p>
              </div>
            </div>
          </GeminiCard>
        )}

        {/* GROUP E: Privacy & Security */}
        {activeGroup === 'privacy' && (
          <GeminiCard className="p-6 sm:p-8 rounded-[2rem] bg-white/80 dark:bg-[#12151E]/80 backdrop-blur-3xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                  <GeminiIcon name="settings" size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                    Privacy, Cloud Data & Session
                  </h2>
                  <p className="text-xs text-neutral-500">Manage your cloud AI history and account session</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Clear Cloud AI Chats */}
              <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Clear Cloud AI Conversation History
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Delete past sessions and chat logs stored under your account in the cloud.
                  </p>
                </div>

                <button
                  onClick={handleClearCloudChats}
                  disabled={isClearingChats}
                  className="px-5 py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {clearChatSuccess ? 'History Cleared' : isClearingChats ? 'Clearing...' : 'Clear Cloud Chats'}
                </button>
              </div>

              {/* Theme Selector */}
              <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Appearance Mode
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Currently in {theme === 'dark' ? 'Ultra-Dark Bento' : 'Light'} theme
                  </p>
                </div>

                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="px-4 py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] text-xs font-bold text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                >
                  Toggle Theme
                </button>
              </div>

              {/* Sign Out Action */}
              {onSignOut && (
                <div className="pt-2">
                  <button
                    onClick={onSignOut}
                    className="w-full py-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-rose-500/10 hover:text-rose-500 text-neutral-600 dark:text-neutral-400 text-xs font-bold border border-black/[0.06] dark:border-white/[0.06] transition-colors cursor-pointer text-center"
                  >
                    Sign Out of Cohart
                  </button>
                </div>
              )}
            </div>
          </GeminiCard>
        )}
      </div>

      {/* Campus Switch Verification Modal */}
      {showCampusModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#12151E] rounded-3xl border border-black/[0.08] dark:border-white/[0.1] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                  <GeminiIcon name="shield-check" size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Verify Campus</h3>
                  <p className="text-xs font-mono text-neutral-500">Anti-Cheat Question</p>
                </div>
              </div>
              <button
                onClick={() => setShowCampusModal(false)}
                className="p-1 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              >
                <GeminiIcon name="close" size={16} />
              </button>
            </div>

            {/* University Combobox */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-neutral-500 uppercase">Target University</label>
              <UniversityCombobox
                universities={NIGERIAN_UNIVERSITIES}
                selectedCode={selectedTargetUniv}
                onSelect={(code) => handleSelectTargetUniv(code)}
              />
            </div>

            {/* Question Display */}
            {currentInsiderQuestion && (
              <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
                <span className="text-xs font-mono text-[#0B57D0] dark:text-[#A8C7FA] font-bold block">
                  Campus Trivia Question
                </span>
                <p className="text-xs text-neutral-900 dark:text-white leading-relaxed font-medium">
                  {currentInsiderQuestion.question}
                </p>
              </div>
            )}

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

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#12151E] rounded-3xl border border-black/[0.08] dark:border-white/[0.1] p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                  <GeminiIcon name="wallet" size={16} />
                </div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Withdraw Funds</h3>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              >
                <GeminiIcon name="close" size={16} />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Withdrawal Initiated!
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  Funds will be credited to {bankName} shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-3">
                <div>
                  <label className="text-xs font-mono text-neutral-500 uppercase">Bank</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white focus:outline-none"
                  >
                    <option value="Opay">Opay</option>
                    <option value="Palmpay">Palmpay</option>
                    <option value="Kuda Bank">Kuda Bank</option>
                    <option value="Access Bank">Access Bank</option>
                    <option value="GTBank">GTBank</option>
                    <option value="First Bank">First Bank</option>
                    <option value="UBA">UBA</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-500 uppercase">Account Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="10-digit NUBAN"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full mt-1 p-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-500 uppercase">Account Name</label>
                  <input
                    type="text"
                    placeholder="Account Name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-500 uppercase">Amount (₦)</label>
                  <input
                    type="number"
                    min={500}
                    placeholder="Min ₦500"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isWithdrawing || !accountNumber || accountNumber.length < 10}
                  className="w-full py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  {isWithdrawing ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

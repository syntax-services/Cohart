'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile, COHART_VOICES, DEFAULT_COHART_VOICE, SavedExplanation } from '@/lib/types';
import { UniversityCombobox } from '@/components/ui/UniversityCombobox';
import { useTheme } from '@/components/ThemeProvider';
import { clearAllAiConversations, uploadAvatar, fetchSavedExplanations } from '@/lib/supabase';
import { PaymentModal } from '@/components/payment/PaymentModal';
import {
  NIGERIAN_UNIVERSITIES,
  getRandomCampusQuestion,
  evaluateCampusAnswer,
  CampusInsiderQuestion,
} from '@/lib/campusVerification';
import { ScholarModeIcon, ArenaModeIcon } from '@/components/molecules/WorkspaceModeDropdown';
import { setWorkspaceModeCookie, getWorkspaceModeCookie } from '@/lib/telemetry';
import { MobileCodePlayground } from '@/components/ide/MobileCodePlayground';

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
  const { theme, setTheme, fontSize, setFontSize } = useTheme();

  // Dialog & Modal States
  const [activeModal, setActiveModal] = useState<
    'edit_profile' | 'university' | 'appearance' | 'help' | null
  >(null);

  // Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Payment Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<'monthly' | 'semester' | 'wallet'>('monthly');
  const [isIdeOpen, setIsIdeOpen] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState(profile.full_name || '');
  const [editMatric, setEditMatric] = useState(profile.matric_number || '');
  const [editDepartment, setEditDepartment] = useState(profile.department || '');
  const [editLevel, setEditLevel] = useState(profile.level || '100L');
  const [editEmail, setEditEmail] = useState(profile.email || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // University Selection & Campus Verification State
  const [selectedUniv, setSelectedUniv] = useState<string>(profile.institution || 'OOU');
  const [currentInsiderQuestion, setCurrentInsiderQuestion] = useState<CampusInsiderQuestion | null>(null);
  const [campusUserAnswer, setCampusUserAnswer] = useState('');
  const [campusStep, setCampusStep] = useState<'question' | 'near_miss' | 'bluff' | 'verified' | 'failed'>('question');
  const [campusNudge, setCampusNudge] = useState('');
  const [campusBluff, setCampusBluff] = useState('');

  // Voice Preview State
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aurora_selected_voice') || DEFAULT_COHART_VOICE;
    }
    return DEFAULT_COHART_VOICE;
  });

  // Help & Feedback State
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Saved Vault Count for Bento Tile
  const [savedVaultNotes, setSavedVaultNotes] = useState<SavedExplanation[]>([]);
  useEffect(() => {
    async function loadNotes() {
      if (profile.id) {
        const notes = await fetchSavedExplanations(profile.id);
        setSavedVaultNotes(notes);
      }
    }
    loadNotes();
  }, [profile.id]);

  // Safety Banner Reset & Terms State
  const [isBannerReset, setIsBannerReset] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [showPartnerInfo, setShowPartnerInfo] = useState(false);

  const handleResetSafetyBanner = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aurora_safety_banner_dismissed');
      setIsBannerReset(true);
      setTimeout(() => setIsBannerReset(false), 2500);
    }
  };

  const initials = profile.full_name?.trim()
    ? profile.full_name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : profile.matric_number?.slice(0, 2).toUpperCase() || 'AR';

  // Handle saving profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await onUpdateProfile({
        full_name: editName.trim(),
        matric_number: editMatric.trim(),
        department: editDepartment.trim(),
        level: editLevel.trim(),
        email: editEmail.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveModal(null);
      }, 1000);
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle university question submission
  const handleOpenUnivModal = () => {
    const q = getRandomCampusQuestion(selectedUniv || 'OOU');
    setCurrentInsiderQuestion(q);
    setCampusUserAnswer('');
    setCampusStep('question');
    setCampusNudge('');
    setCampusBluff('');
    setActiveModal('university');
  };

  const handleSelectTargetUniv = (code: string) => {
    setSelectedUniv(code);
    const q = getRandomCampusQuestion(code);
    setCurrentInsiderQuestion(q);
    setCampusUserAnswer('');
    setCampusStep('question');
    setCampusNudge('');
    setCampusBluff('');
  };

  const handleSubmitCampusAnswer = () => {
    if (!currentInsiderQuestion || !campusUserAnswer.trim()) return;

    const evalResult = evaluateCampusAnswer(currentInsiderQuestion, campusUserAnswer, false);
    if (evalResult.status === 'correct') {
      setCampusBluff(evalResult.bluffPrompt || currentInsiderQuestion.bluffChallenge);
      setCampusStep('bluff');
    } else if (evalResult.status === 'near_miss') {
      setCampusNudge(evalResult.nudgePrompt || currentInsiderQuestion.nearMissNudge);
      setCampusStep('near_miss');
    } else {
      setCampusNudge(evalResult.feedbackText);
      setCampusStep('failed');
    }
  };

  const handleAnswerBluff = async (rejectsBluff: boolean) => {
    if (!currentInsiderQuestion) return;

    if (rejectsBluff) {
      setCampusStep('verified');
      const univ = NIGERIAN_UNIVERSITIES.find((u) => u.code === selectedUniv);
      const univName = univ ? `${univ.name} (${univ.shortName})` : selectedUniv;
      await onUpdateProfile({ institution: univName });
      setTimeout(() => {
        setActiveModal(null);
      }, 1400);
      return;
    }

    setCampusStep('failed');
    setCampusNudge('Verification challenge failed. Try again with the alternate question or verify via Aurora AI.');
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (JPG, PNG, WebP).');
      setTimeout(() => setAvatarError(null), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image size should be less than 5MB.');
      setTimeout(() => setAvatarError(null), 3000);
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarError(null);
    try {
      const publicUrl = await uploadAvatar(profile.id, file);
      if (publicUrl) {
        await onUpdateProfile({ avatar_url: publicUrl });
      } else {
        setAvatarError('Could not upload avatar. Please try again.');
        setTimeout(() => setAvatarError(null), 3500);
      }
    } catch {
      setAvatarError('Network error uploading avatar.');
      setTimeout(() => setAvatarError(null), 3500);
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const currentMode = getWorkspaceModeCookie();

  return (
    <div className="max-w-md mx-auto space-y-5 pb-16 pt-3 animate-in fade-in duration-300 font-sans">
      {/* 
        ========================================================================
        1. STRING-STYLE PROFILE HERO BLOCK
        Centered large glowing avatar, halo ring, verified pill, and institution tag.
        ========================================================================
      */}
      <div className="flex flex-col items-center text-center mt-3 space-y-3">
        <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarFileChange}
            accept="image/*"
            className="hidden"
          />
          {/* Glowing Ambient Gradient Ring from String */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#0B57D0] via-[#1A73E8] to-[#8AB4F8] opacity-35 group-hover:opacity-75 transition duration-500 blur-xs" />

          <div className="relative h-28 w-28 rounded-full border-4 border-white dark:border-[#131314] bg-neutral-100 dark:bg-[#1E1F20] flex items-center justify-center overflow-hidden shadow-2xl">
            {isUploadingAvatar ? (
              <div className="flex flex-col items-center justify-center gap-1">
                <GeminiIcon name="loader" size={20} className="text-[#0B57D0] dark:text-[#8AB4F8]" />
                <span className="text-[9px] font-bold text-neutral-400">Uploading...</span>
              </div>
            ) : profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'Profile'}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <span className="text-2xl font-bold font-mono text-[#0B57D0] dark:text-[#8AB4F8]">
                {initials}
              </span>
            )}
            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white flex-col gap-1">
              <GeminiIcon name="user" size={15} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
            </div>
          </div>
        </div>

        {avatarError && (
          <p className="text-[11px] font-medium text-rose-500 text-center animate-in fade-in">
            {avatarError}
          </p>
        )}

        {/* Student Name & Verified Pill */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center justify-center gap-1.5">
            {profile.full_name || profile.matric_number || 'Scholar Profile'}
            <span className="inline-flex items-center gap-1 bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 text-[#0B57D0] dark:text-[#8AB4F8] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#0B57D0]/20">
              <GeminiIcon name="shield-check" size={10} />
              Verified
            </span>
          </h2>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono">
            {profile.department || 'GENERAL STUDIES'} • {profile.level || '100L'}
          </p>
          <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1 shadow-xs">
            <GeminiIcon name="compass" size={10} />
            <span>{profile.institution || 'Olabisi Onabanjo University'}</span>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        2. STRING-STYLE CAMPUS TOURNAMENT / ARENA CARD
        Directly modelled on String's IDIC Tournament Card with watermark icon.
        ========================================================================
      */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B57D0]/12 via-purple-500/8 to-transparent border border-[#0B57D0]/25 p-5 shadow-xl shadow-black/5">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <GeminiIcon name="trophy" size={96} className="text-[#0B57D0] dark:text-[#8AB4F8]" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-[#0B57D0] dark:text-[#8AB4F8]">
            <GeminiIcon name="zap" size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider">Campus Competition</span>
          </div>
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Aurora Arena Inter-Faculty Battle
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-[270px] leading-relaxed">
              Compete with students in live academic speed battles, climb faculty leaderboards, and win Tonnes cash prizes!
            </p>
          </div>
          <button
            onClick={() => {
              setWorkspaceModeCookie('arena');
              window.location.search = '?tab=arena';
            }}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#0B57D0] hover:bg-[#0B57D0]/90 dark:bg-[#1A73E8] dark:hover:bg-[#1A73E8]/90 text-white px-4 text-xs font-bold shadow-md shadow-[#0B57D0]/20 active:scale-95 transition-all w-full max-w-[200px] cursor-pointer"
          >
            <GeminiIcon name="trophy" size={13} />
            <span>Enter Arena Now</span>
          </button>
        </div>
      </div>

      {/* 
        ========================================================================
        3. STRING-STYLE BENTO MENU GRID & ACTION LIST
        2x2 grid with divide-x and border-b, followed by clean vertical rows.
        ========================================================================
      */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden shadow-xl shadow-black/5">
        {/* 2x2 Bento Action Tiles */}
        <div className="grid grid-cols-2 divide-x divide-black/[0.06] dark:divide-white/[0.08] border-b border-black/[0.06] dark:border-white/[0.08]">
          {/* Tile 1: Course Textbooks */}
          <button
            onClick={onOpenReader}
            className="flex flex-col items-center justify-center p-5 gap-2 hover:bg-[#0B57D0]/[0.02] active:bg-[#0B57D0]/[0.04] transition-all duration-200 group cursor-pointer"
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-neutral-100 dark:bg-white/[0.06] flex items-center justify-center group-hover:bg-[#0B57D0]/10 dark:group-hover:bg-[#1A73E8]/15 group-hover:scale-105 transition-all duration-300">
                <GeminiIcon name="book-open" size={18} className="text-neutral-500 dark:text-neutral-400 group-hover:text-[#0B57D0] dark:group-hover:text-[#8AB4F8] transition-colors" />
              </div>
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] flex items-center justify-center px-1 text-[9px] font-bold text-white shadow-xs ring-2 ring-white dark:ring-[#1E1F20]">
                4
              </span>
            </div>
            <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors tracking-wide">
              Course Books
            </span>
          </button>

          {/* Tile 2: Senate Timetable */}
          <button
            onClick={onOpenSchedule}
            className="flex flex-col items-center justify-center p-5 gap-2 hover:bg-[#0B57D0]/[0.02] active:bg-[#0B57D0]/[0.04] transition-all duration-200 group cursor-pointer"
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-neutral-100 dark:bg-white/[0.06] flex items-center justify-center group-hover:bg-[#0B57D0]/10 dark:group-hover:bg-[#1A73E8]/15 group-hover:scale-105 transition-all duration-300">
                <GeminiIcon name="calendar" size={18} className="text-neutral-500 dark:text-neutral-400 group-hover:text-[#0B57D0] dark:group-hover:text-[#8AB4F8] transition-colors" />
              </div>
            </div>
            <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors tracking-wide">
              Exams & Schedule
            </span>
          </button>

          {/* Tile 3: Personal Vault Notes */}
          <button
            onClick={onOpenReader}
            className="flex flex-col items-center justify-center p-5 gap-2 hover:bg-[#0B57D0]/[0.02] active:bg-[#0B57D0]/[0.04] transition-all duration-200 group cursor-pointer"
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-neutral-100 dark:bg-white/[0.06] flex items-center justify-center group-hover:bg-[#0B57D0]/10 dark:group-hover:bg-[#1A73E8]/15 group-hover:scale-105 transition-all duration-300">
                <GeminiIcon name="bookmark" size={18} className="text-neutral-500 dark:text-neutral-400 group-hover:text-[#0B57D0] dark:group-hover:text-[#8AB4F8] transition-colors" />
              </div>
              {savedVaultNotes.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-purple-600 flex items-center justify-center px-1 text-[9px] font-bold text-white shadow-xs ring-2 ring-white dark:ring-[#1E1F20]">
                  {savedVaultNotes.length}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors tracking-wide">
              Personal Vault
            </span>
          </button>

          {/* Tile 4: Student Wallet */}
          <button
            onClick={() => {
              setPaymentPlan('wallet');
              setIsPaymentOpen(true);
            }}
            className="flex flex-col items-center justify-center p-5 gap-2 hover:bg-[#0B57D0]/[0.02] active:bg-[#0B57D0]/[0.04] transition-all duration-200 group cursor-pointer"
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-neutral-100 dark:bg-white/[0.06] flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:scale-105 transition-all duration-300">
                <GeminiIcon name="wallet" size={18} className="text-emerald-600 dark:text-emerald-400 transition-colors" />
              </div>
            </div>
            <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors tracking-wide font-mono">
              ₦{(profile.wallet_balance || 0).toLocaleString()}
            </span>
          </button>
        </div>

        {/* Vertical Action List below (String-style divide-y) */}
        <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
          {/* Mode Switcher Row */}
          <button
            onClick={() => {
              const next = currentMode === 'academic' ? 'arena' : 'academic';
              setWorkspaceModeCookie(next);
              window.location.search = `?tab=${next === 'arena' ? 'arena' : 'hub'}`;
            }}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[#0B57D0]/[0.02] active:bg-[#0B57D0]/[0.04] transition-all duration-200 group text-left bg-gradient-to-r from-[#0B57D0]/[0.04] to-transparent cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 text-[#0B57D0] dark:text-[#8AB4F8] flex items-center justify-center group-hover:scale-105 transition-transform">
                {currentMode === 'arena' ? <ArenaModeIcon bold active /> : <ScholarModeIcon bold active />}
              </div>
              <div>
                <span className="font-semibold text-neutral-900 dark:text-white text-[13px] block leading-tight">
                  Switch to {currentMode === 'arena' ? 'Scholar OS' : 'Campus Arena'}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {currentMode === 'arena' ? 'Deep textbooks & lectures' : 'Live quiz battles & rewards'}
                </span>
              </div>
            </div>
            <GeminiIcon name="chevron-right" size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Campus Insider Status */}
          <button
            onClick={handleOpenUnivModal}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-neutral-100 dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-400 flex items-center justify-center group-hover:text-[#0B57D0] dark:group-hover:text-[#8AB4F8] transition-colors">
                <GeminiIcon name="compass" size={15} />
              </div>
              <span className="font-medium text-neutral-800 dark:text-neutral-200 text-[13px]">
                Campus Verification & University
              </span>
            </div>
            <GeminiIcon name="chevron-right" size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Account Profile Edit */}
          <button
            onClick={() => {
              setEditName(profile.full_name || '');
              setEditMatric(profile.matric_number || '');
              setEditDepartment(profile.department || '');
              setEditLevel(profile.level || '100L');
              setEditEmail(profile.email || '');
              setActiveModal('edit_profile');
            }}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-neutral-100 dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-400 flex items-center justify-center group-hover:text-[#0B57D0] dark:group-hover:text-[#8AB4F8] transition-colors">
                <GeminiIcon name="settings" size={15} />
              </div>
              <span className="font-medium text-neutral-800 dark:text-neutral-200 text-[13px]">
                Student Identity & Matric Settings
              </span>
            </div>
            <GeminiIcon name="chevron-right" size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Appearance & AI Voice */}
          <button
            onClick={() => setActiveModal('appearance')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-neutral-100 dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-400 flex items-center justify-center group-hover:text-[#0B57D0] dark:group-hover:text-[#8AB4F8] transition-colors">
                <GeminiIcon name="sun" size={15} />
              </div>
              <span className="font-medium text-neutral-800 dark:text-neutral-200 text-[13px]">
                Display & AI Voice Reader
              </span>
            </div>
            <GeminiIcon name="chevron-right" size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Safety & Rules Modal Trigger */}
          <button
            onClick={() => setIsTermsModalOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-neutral-100 dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-400 flex items-center justify-center group-hover:text-[#0B57D0] dark:group-hover:text-[#8AB4F8] transition-colors">
                <GeminiIcon name="shield" size={15} />
              </div>
              <span className="font-medium text-neutral-800 dark:text-neutral-200 text-[13px]">
                Terms, Privacy & Campus Rules
              </span>
            </div>
            <GeminiIcon name="chevron-right" size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Mobile Code Playground / IDE */}
          <button
            onClick={() => setIsIdeOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-mono font-bold text-xs group-hover:scale-105 transition-transform">
                {'</>'}
              </div>
              <div>
                <span className="font-medium text-neutral-800 dark:text-neutral-200 text-[13px] block leading-tight">
                  Mobile Code Playground / IDE
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Python, JS, TS, HTML sandboxed runner
                </span>
              </div>
            </div>
            <GeminiIcon name="chevron-right" size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Submit Feedback */}
          <button
            onClick={() => setActiveModal('help')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-neutral-100 dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-400 flex items-center justify-center group-hover:text-[#0B57D0] dark:group-hover:text-[#8AB4F8] transition-colors">
                <GeminiIcon name="chat" size={15} />
              </div>
              <span className="font-medium text-neutral-800 dark:text-neutral-200 text-[13px]">
                Submit Platform Feedback
              </span>
            </div>
            <GeminiIcon name="chevron-right" size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Log Out */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-rose-500/[0.03] active:bg-rose-500/[0.06] transition-all duration-200 group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-neutral-100 dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-400 flex items-center justify-center group-hover:text-rose-500 transition-colors">
                  <GeminiIcon name="close" size={14} />
                </div>
                <span className="font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-rose-500 text-[13px]">
                  Log Out
                </span>
              </div>
              <GeminiIcon name="chevron-right" size={14} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* 
        ========================================================================
        4. STRING PARTNERSHIP & AMBASSADOR ACCORDION
        ========================================================================
      */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden shadow-xl shadow-black/5">
        <button
          onClick={() => setShowPartnerInfo(!showPartnerInfo)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-all duration-200 text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <GeminiIcon name="sparkle" size={15} className="text-[#0B57D0] dark:text-[#8AB4F8]" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-[11px] uppercase tracking-wider">
              String & Aurora Ecosystem Synergy
            </span>
          </div>
          <GeminiIcon
            name="chevron-right"
            size={14}
            className={`text-neutral-400 transition-transform duration-200 ${showPartnerInfo ? 'rotate-90' : ''}`}
          />
        </button>

        {showPartnerInfo && (
          <div className="p-4 bg-black/[0.01] dark:bg-white/[0.02] border-t border-black/[0.05] dark:border-white/[0.06] space-y-2 text-left animate-in fade-in">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Aurora OS and String are unified student ecosystems across Nigerian universities. String empowers campus commerce and verified transactions, while Aurora OS delivers Senate exam intelligence and textbook study flows.
            </p>
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                OOU Campus Launch Active
              </span>
              <button
                onClick={handleResetSafetyBanner}
                className="text-[10px] font-mono text-[#0B57D0] dark:text-[#8AB4F8] hover:underline cursor-pointer"
              >
                {isBannerReset ? 'Banner Restored!' : 'Reset Chat Banner'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 
        ========================================================================
        MODALS & DIALOGS (Preserved & Enhanced)
        ========================================================================
      */}

      {/* Edit Profile Modal */}
      {activeModal === 'edit_profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.1] p-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Edit Student Profile</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer">
                <GeminiIcon name="close" size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-left">
              <div>
                <label className="text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0]"
                  placeholder="e.g. Morenikeji Adetunji"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">Matric Number</label>
                <input
                  type="text"
                  value={editMatric}
                  onChange={(e) => setEditMatric(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0]"
                  placeholder="e.g. SMS/2021/0045"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">Department</label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0]"
                  placeholder="e.g. Economics"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">Level</label>
                <select
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0]"
                >
                  <option value="100L">100L</option>
                  <option value="200L">200L</option>
                  <option value="300L">300L</option>
                  <option value="400L">400L</option>
                  <option value="500L">500L</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-4 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* University Modal */}
      {activeModal === 'university' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.1] p-5 shadow-2xl animate-in fade-in text-left">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Campus Verification</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer">
                <GeminiIcon name="close" size={14} />
              </button>
            </div>

            <div className="mb-3">
              <UniversityCombobox value={selectedUniv} onChange={(code) => handleSelectTargetUniv(code)} />
            </div>

            {currentInsiderQuestion && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#0B57D0] dark:text-[#8AB4F8] font-bold block mb-1">
                    Campus Insider Check
                  </span>
                  <p className="text-neutral-800 dark:text-neutral-200 font-medium">
                    {currentInsiderQuestion.question}
                  </p>
                </div>

                {campusStep === 'question' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={campusUserAnswer}
                      onChange={(e) => setCampusUserAnswer(e.target.value)}
                      placeholder="Type your campus answer..."
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0]"
                    />
                    <button
                      onClick={handleSubmitCampusAnswer}
                      className="w-full py-2 rounded-xl bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      Verify Campus Identity
                    </button>
                  </div>
                )}

                {campusStep === 'bluff' && (
                  <div className="space-y-2">
                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      {campusBluff}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAnswerBluff(true)}
                        className="flex-1 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                      >
                        Correct (Confirm)
                      </button>
                      <button
                        onClick={() => handleAnswerBluff(false)}
                        className="flex-1 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 text-xs font-semibold cursor-pointer"
                      >
                        False
                      </button>
                    </div>
                  </div>
                )}

                {campusStep === 'verified' && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs text-center font-bold">
                    ✓ Verified as Campus Insider!
                  </div>
                )}

                {campusStep === 'failed' && (
                  <div className="space-y-2 text-center">
                    <p className="text-xs text-rose-500 font-medium">{campusNudge}</p>
                    <button
                      onClick={handleOpenUnivModal}
                      className="text-xs font-semibold text-[#0B57D0] dark:text-[#8AB4F8] underline cursor-pointer"
                    >
                      Try another question
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appearance & AI Voice Modal */}
      {activeModal === 'appearance' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.1] p-5 shadow-2xl animate-in fade-in text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Display & Voice</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer">
                <GeminiIcon name="close" size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Theme Selector */}
              <div>
                <label className="text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5">Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      theme === 'dark'
                        ? 'border-[#0B57D0] bg-[#0B57D0]/10 text-[#0B57D0] dark:text-[#8AB4F8]'
                        : 'border-black/[0.06] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Dark Obsidian
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      theme === 'light'
                        ? 'border-[#0B57D0] bg-[#0B57D0]/10 text-[#0B57D0]'
                        : 'border-black/[0.06] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Light Minimal
                  </button>
                </div>
              </div>

              {/* Font Size Scale Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider block">Dashboard Font Scale</label>
                  <span className="text-[10px] font-mono text-[#0B57D0] dark:text-[#8AB4F8] font-bold capitalize">
                    {fontSize}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['compact', 'normal', 'comfortable'] as const).map((scale) => {
                    const isCurrent = fontSize === scale;
                    const labels = {
                      compact: 'Compact',
                      normal: 'Standard',
                      comfortable: 'Large',
                    };
                    const sampleTexts = {
                      compact: '13.5px',
                      normal: '15.5px',
                      comfortable: '17.5px',
                    };
                    return (
                      <button
                        key={scale}
                        type="button"
                        onClick={() => setFontSize(scale)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-[#0B57D0] bg-[#0B57D0]/10 text-[#0B57D0] dark:text-[#8AB4F8] font-bold shadow-2xs'
                            : 'border-black/[0.06] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        <span className="text-xs block font-semibold">{labels[scale]}</span>
                        <span className="text-[9.5px] font-mono text-neutral-400 block mt-0.5">{sampleTexts[scale]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reader Voice */}
              <div>
                <label className="text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5">AI Reader Voice</label>
                <div className="space-y-1">
                  {COHART_VOICES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setSelectedVoice(v.id);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('aurora_selected_voice', v.id);
                        }
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                        selectedVoice === v.id
                          ? 'bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 text-[#0B57D0] dark:text-[#8AB4F8] font-bold'
                          : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <span>{v.label}</span>
                      {selectedVoice === v.id && (
                        <GeminiIcon name="check" size={12} className="text-[#0B57D0] dark:text-[#8AB4F8]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform Feedback Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.1] p-5 shadow-2xl animate-in fade-in text-left">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Submit Feedback</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer">
                <GeminiIcon name="close" size={14} />
              </button>
            </div>

            {feedbackSent ? (
              <div className="py-6 text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <GeminiIcon name="check" size={20} />
                </div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white">Feedback Received</p>
                <p className="text-[11px] text-neutral-500">Thank you for shaping Aurora OS with us.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share ideas, course requests, or bug reports..."
                  rows={4}
                  className="w-full p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0]"
                />
                <button
                  onClick={() => {
                    if (feedbackText.trim()) {
                      setFeedbackSent(true);
                      setTimeout(() => {
                        setFeedbackSent(false);
                        setFeedbackText('');
                        setActiveModal(null);
                      }, 1800);
                    }
                  }}
                  className="w-full py-2 rounded-xl bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  Send Feedback
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Terms & Privacy Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.1] p-5 shadow-2xl animate-in fade-in text-left">
            <div className="flex items-center justify-between mb-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Campus Terms & Privacy</h3>
                <p className="text-[10px] font-mono text-neutral-400">Aurora OS Academic Framework</p>
              </div>
              <button onClick={() => setIsTermsModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer">
                <GeminiIcon name="close" size={15} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              <p>
                <strong>1. Academic Integrity:</strong> Aurora OS is an interactive learning companion built to elevate study productivity and Senate exam readiness. It does not facilitate cheating or exam malpractice.
              </p>
              <p>
                <strong>2. Copyright & Intellectual Property:</strong> Course curricula, solved checkpoints, and textbook materials are curated under statutory NUC guidelines. Commercial re-distribution without license is strictly prohibited.
              </p>
              <p>
                <strong>3. Data Protection:</strong> Personal student metrics, note highlights, and chat sessions are encrypted and protected.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
              <button
                onClick={handleResetSafetyBanner}
                className="text-xs font-mono text-[#0B57D0] dark:text-[#8AB4F8] hover:underline cursor-pointer"
              >
                {isBannerReset ? 'Banner Restored to Messages!' : 'Show Banner in Messages Again'}
              </button>
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="px-4 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentOpen && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          profile={profile}
          onPaymentSuccess={() => {
            setIsPaymentOpen(false);
          }}
        />
      )}
      {/* Mobile Code Playground / IDE */}
      {isIdeOpen && (
        <MobileCodePlayground
          isOpen={isIdeOpen}
          onClose={() => setIsIdeOpen(false)}
        />
      )}
    </div>
  );
};

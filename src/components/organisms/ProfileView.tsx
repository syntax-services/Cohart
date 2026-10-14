'use client';

import React, { useState } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { Badge } from '@/components/ui/Badge';
import { StudentProfile, COHART_VOICES, DEFAULT_COHART_VOICE } from '@/lib/types';
import { UniversityCombobox } from '@/components/ui/UniversityCombobox';
import { useTheme } from '@/components/ThemeProvider';
import { clearAllAiConversations, uploadAvatar } from '@/lib/supabase';
import { PaymentModal } from '@/components/payment/PaymentModal';
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
  const { theme, resolvedTheme, setTheme, toggleTheme, fontSize, setFontSize } = useTheme();

  // Dialog & Drawer States
  const [activeModal, setActiveModal] = useState<
    'edit_profile' | 'university' | 'appearance' | 'help' | null
  >(null);

  // Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);

  // Payment Modal State
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<'monthly' | 'semester' | 'wallet'>('monthly');

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
      return localStorage.getItem('cohart_selected_voice') || DEFAULT_COHART_VOICE;
    }
    return DEFAULT_COHART_VOICE;
  });

  // Help & Feedback State
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Safety Banner Reset & Terms State
  const [isBannerReset, setIsBannerReset] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const isSafetyDismissed = typeof window !== 'undefined' ? localStorage.getItem('aurora_safety_banner_dismissed') === 'true' : false;

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
    : (profile.matric_number?.slice(0, 2).toUpperCase() || 'CH');

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
    const q = getRandomCampusQuestion(selectedUniv || 'UNILAG');
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
    setCampusNudge('Verification challenge failed. Try again with the alternate question or verify with Cohart AI.');
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

  return (
    <div className="max-w-md mx-auto space-y-3.5 pb-16 pt-2 animate-in fade-in duration-300">
      {/* 1. Ultra-Slim Profile Header Card */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.06] dark:border-white/[0.08] shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar with click-to-upload */}
          <div className="relative group shrink-0">
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarFileChange}
              accept="image/*"
              className="hidden"
            />
            <div
              onClick={() => avatarInputRef.current?.click()}
              className="relative h-12 w-12 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-neutral-100 dark:bg-white/[0.06] flex items-center justify-center overflow-hidden shadow-xs cursor-pointer group-hover:scale-105 transition-transform"
              title="Change profile picture"
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || 'Profile'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-mono text-sm font-bold text-[#0B57D0] dark:text-[#8AB4F8]">
                  {initials}
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                {isUploadingAvatar ? (
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <GeminiIcon name="user" size={13} />
                )}
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                {profile.full_name || profile.matric_number || 'Scholar'}
              </h2>
              {profile.subscription_tier && profile.subscription_tier !== 'free' && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[9px] font-mono font-bold uppercase">
                  Pro
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
              {profile.department ? `${profile.department} • ` : ''}{profile.level || '100L'}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-[#0B57D0] dark:text-[#8AB4F8] font-medium truncate mt-0.5">
              <GeminiIcon name="compass" size={10} />
              <span className="truncate">{profile.institution || 'Select University'}</span>
            </div>
          </div>
        </div>

        {/* Quick Edit Pencil Button */}
        <button
          onClick={() => {
            setEditName(profile.full_name || '');
            setEditMatric(profile.matric_number || '');
            setEditDepartment(profile.department || '');
            setEditLevel(profile.level || '100L');
            setEditEmail(profile.email || '');
            setActiveModal('edit_profile');
          }}
          className="h-8 w-8 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          title="Edit profile info"
        >
          <GeminiIcon name="settings" size={13} />
        </button>
      </div>

      {avatarError && (
        <p className="text-[11px] font-medium text-rose-500 text-center animate-in fade-in">
          {avatarError}
        </p>
      )}

      {/* 2. Ultra-Slim 4-Pill Bento Action Strip */}
      <div className="grid grid-cols-4 gap-1.5 bg-white dark:bg-[#1E1F20] p-1.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
        {/* Reader */}
        <button
          onClick={onOpenReader}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors cursor-pointer group"
        >
          <div className="h-7 w-7 rounded-full bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 text-[#0B57D0] dark:text-[#8AB4F8] flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <GeminiIcon name="reader" size={14} />
          </div>
          <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">Reader</span>
        </button>

        {/* Schedule */}
        <button
          onClick={onOpenSchedule}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors cursor-pointer group"
        >
          <div className="h-7 w-7 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <GeminiIcon name="calendar" size={14} />
          </div>
          <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">Exams</span>
        </button>

        {/* Chat / Messages */}
        <button
          onClick={() => onOpenAiChat?.()}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors cursor-pointer group"
        >
          <div className="h-7 w-7 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <GeminiIcon name="sparkle" size={14} />
          </div>
          <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300">Messages</span>
        </button>

        {/* Wallet */}
        <button
          onClick={() => {
            setPaymentPlan('wallet');
            setIsPaymentOpen(true);
          }}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors cursor-pointer group"
        >
          <div className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <GeminiIcon name="wallet" size={14} />
          </div>
          <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 font-mono">
            ₦{(profile.wallet_balance || 0).toLocaleString()}
          </span>
        </button>
      </div>

      {/* 3. Sleek Single-Line Action Rows */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] divide-y divide-black/[0.05] dark:divide-white/[0.06] shadow-xs overflow-hidden">
        {/* Account Details & Level */}
        <button
          onClick={() => {
            setEditName(profile.full_name || '');
            setEditMatric(profile.matric_number || '');
            setEditDepartment(profile.department || '');
            setEditLevel(profile.level || '100L');
            setEditEmail(profile.email || '');
            setActiveModal('edit_profile');
          }}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-white/[0.06] flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:text-[#0B57D0] dark:group-hover:text-[#1A73E8] transition-colors">
              <GeminiIcon name="user" size={16} />
            </div>
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Account & Academic Info
            </span>
          </div>
          <GeminiIcon name="chevron-right" size={16} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Change University */}
        <button
          onClick={handleOpenUnivModal}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-white/[0.06] flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:text-[#0B57D0] dark:group-hover:text-[#1A73E8] transition-colors">
              <GeminiIcon name="compass" size={16} />
            </div>
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              University & Campus Switch
            </span>
          </div>
          <GeminiIcon name="chevron-right" size={16} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Appearance & Font Scaling */}
        <button
          onClick={() => setActiveModal('appearance')}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-white/[0.06] flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:text-[#0B57D0] dark:group-hover:text-[#1A73E8] transition-colors">
              <GeminiIcon name="settings" size={16} />
            </div>
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Appearance & Text Size
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400 capitalize">{fontSize}</span>
            <GeminiIcon name="chevron-right" size={16} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Subscription & Pro Billing */}
        <button
          onClick={() => {
            setPaymentPlan('monthly');
            setIsPaymentOpen(true);
          }}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GeminiIcon name="zap" size={16} />
            </div>
            <div>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
                Subscription & Pro Access
              </span>
              <span className="text-[10px] text-neutral-400">
                {profile.subscription_tier && profile.subscription_tier !== 'free'
                  ? 'Cohart Pro Active'
                  : 'Upgrade to Unlimited AI & Offline Pass'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold">
              {profile.subscription_tier && profile.subscription_tier !== 'free' ? 'PRO' : 'UPGRADE'}
            </span>
            <GeminiIcon name="chevron-right" size={16} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Wallet Top-up */}
        <button
          onClick={() => {
            setPaymentPlan('wallet');
            setIsPaymentOpen(true);
          }}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GeminiIcon name="wallet" size={16} />
            </div>
            <div>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
                Campus Wallet
              </span>
              <span className="text-[10px] text-neutral-400">
                Balance: ₦{(profile.wallet_balance || 0).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              + Top-up
            </span>
            <GeminiIcon name="chevron-right" size={16} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Help & Support */}
        <button
          onClick={() => setActiveModal('help')}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-white/[0.06] flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:text-[#0B57D0] dark:group-hover:text-[#1A73E8] transition-colors">
              <GeminiIcon name="book-open" size={16} />
            </div>
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Help, Feedback & FAQs
            </span>
          </div>
          <GeminiIcon name="chevron-right" size={16} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Sign Out */}
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-rose-500/[0.04] transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GeminiIcon name="close" size={14} />
              </div>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Sign Out
              </span>
            </div>
            <GeminiIcon name="chevron-right" size={14} className="text-rose-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* 4. Campus Safety & Terms Card (Persistent access to dismissed banner rules) */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] p-3.5 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <GeminiIcon name="shield-check" size={13} />
            </div>
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
              Campus Interaction & Safety Rules
            </h4>
          </div>
          <button
            onClick={() => setIsTermsModalOpen(true)}
            className="text-[10px] font-mono text-[#0B57D0] dark:text-[#8AB4F8] hover:underline cursor-pointer"
          >
            Terms & Privacy
          </button>
        </div>

        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Aurora is built strictly for verified peer learning and past questions. Off-platform financial exchanges are prohibited to safeguard scholars from scams.
        </p>

        {isSafetyDismissed && (
          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
            <span className="text-[10px] text-neutral-400">
              Safety banner hidden in Messages
            </span>
            <button
              onClick={handleResetSafetyBanner}
              className="text-[10px] font-mono font-semibold text-[#0B57D0] dark:text-[#8AB4F8] px-2.5 py-1 rounded-full bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 border border-[#0B57D0]/20 hover:opacity-80 transition-all cursor-pointer"
            >
              {isBannerReset ? 'Banner Restored to Messages!' : 'Show Banner in Chat Again'}
            </button>
          </div>
        )}
      </div>

      {/* 5. MODALS & DRAWERS */}

      {/* MODAL: Terms of Service & Privacy Guidelines */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1E1F20] rounded-2xl border border-black/[0.08] dark:border-white/[0.1] p-5 shadow-2xl space-y-3.5 max-h-[85vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-2.5">
              <div className="flex items-center gap-2">
                <GeminiIcon name="shield-check" size={16} className="text-[#0B57D0] dark:text-[#8AB4F8]" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Terms & Campus Safety Policy</h3>
              </div>
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
              >
                <GeminiIcon name="close" size={14} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
              <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-amber-900 dark:text-amber-200">
                <strong className="block font-semibold mb-0.5">Mandatory Campus Anti-Scam Notice:</strong>
                Aurora is exclusively for peer study exchanges, lecture summaries, and past questions. Any user attempting off-platform payment solicitation, impersonation, or academic blackmail will be immediately barred and their student matric flagged.
              </div>

              <div>
                <h5 className="font-bold text-neutral-900 dark:text-white mb-1">1. Academic Integrity & Publishing Rights</h5>
                <p>Course notes, lecture summaries, and past questions uploaded to Aurora remain the property of respective departments. Copying is limited to personal study revision.</p>
              </div>

              <div>
                <h5 className="font-bold text-neutral-900 dark:text-white mb-1">2. Privacy & Data Handling</h5>
                <p>Your academic profile, matriculation data, and study progress are secured in accordance with NDPR guidelines. We never share student phone numbers or personal records with third parties.</p>
              </div>

              <div>
                <h5 className="font-bold text-neutral-900 dark:text-white mb-1">3. Cookie & Telemetry Tracking</h5>
                <p>We utilize session cookies to record study streaks, maintain offline PWA state, and analyze client errors to deliver instant app resilience.</p>
              </div>
            </div>

            <button
              onClick={() => setIsTermsModalOpen(false)}
              className="w-full py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}

      {/* MODAL A: Edit Academic Info */}
      {activeModal === 'edit_profile' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#1E1F20] rounded-[2rem] border border-black/[0.08] dark:border-white/[0.1] p-6 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Account Details</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <GeminiIcon name="close" size={16} />
              </button>
            </div>

            {saveSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Academic profile updated!
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono text-neutral-500 uppercase">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Adewale Johnson"
                    className="w-full mt-1 p-2.5 rounded-xl bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-500 uppercase">Department</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full mt-1 p-2.5 rounded-xl bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-mono text-neutral-500 uppercase">Level</label>
                    <select
                      value={editLevel}
                      onChange={(e) => setEditLevel(e.target.value)}
                      className="w-full mt-1 p-2.5 rounded-xl bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white focus:outline-none"
                    >
                      <option value="100L">100L</option>
                      <option value="200L">200L</option>
                      <option value="300L">300L</option>
                      <option value="400L">400L</option>
                      <option value="500L">500L</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-neutral-500 uppercase">Matric / ID</label>
                    <input
                      type="text"
                      value={editMatric}
                      onChange={(e) => setEditMatric(e.target.value)}
                      placeholder="e.g. CSC/2021/042"
                      className="w-full mt-1 p-2.5 rounded-xl bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-500 uppercase">Email (For Billing & Subscriptions)</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full mt-1 p-2.5 rounded-xl bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white focus:outline-none"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Required when upgrading to Pro or purchasing notes.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL B: University Selection */}
      {activeModal === 'university' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#1E1F20] rounded-[2rem] border border-black/[0.08] dark:border-white/[0.1] p-6 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Switch University</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <GeminiIcon name="close" size={16} />
              </button>
            </div>

            <UniversityCombobox
              label="Selected Nigerian University"
              value={selectedUniv}
              onChange={(code) => handleSelectTargetUniv(code)}
              placeholder="Search public or private institution..."
            />

            {/* Verification Step: Question */}
            {campusStep === 'question' && currentInsiderQuestion && (
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase text-[#0B57D0] dark:text-[#1A73E8] font-bold block mb-1">
                    Campus Insider Check
                  </span>
                  <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                    {currentInsiderQuestion.question}
                  </p>
                </div>

                <input
                  type="text"
                  value={campusUserAnswer}
                  onChange={(e) => setCampusUserAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitCampusAnswer()}
                  className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white focus:outline-none"
                />

                <button
                  onClick={handleSubmitCampusAnswer}
                  disabled={!campusUserAnswer.trim()}
                  className="w-full py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40"
                >
                  Verify Campus
                </button>
              </div>
            )}

            {/* Verification Step: Bluff Challenge */}
            {campusStep === 'bluff' && (
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
                  <p className="font-semibold mb-1">One last check:</p>
                  <p>{campusBluff || 'Is this landmark located inside the main campus gate?'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAnswerBluff(true)}
                    className="py-2.5 rounded-xl bg-[#0B57D0] text-white text-xs font-semibold"
                  >
                    Yes, absolutely
                  </button>
                  <button
                    onClick={() => handleAnswerBluff(false)}
                    className="py-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] text-xs font-semibold"
                  >
                    No, that is incorrect
                  </button>
                </div>
              </div>
            )}

            {campusStep === 'verified' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Campus verified and updated!
              </div>
            )}

            {campusStep === 'failed' && (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                  {campusNudge || 'Verification unsuccessful. Please try again.'}
                </div>
                <button
                  onClick={() => setCampusStep('question')}
                  className="w-full py-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] text-xs font-semibold"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL C: Appearance & Font Scaling */}
      {activeModal === 'appearance' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#1E1F20] rounded-[2rem] border border-black/[0.08] dark:border-white/[0.1] p-6 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Appearance & Typography</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <GeminiIcon name="close" size={16} />
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-neutral-500 uppercase">Theme Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dark', label: 'Dark' },
                  { id: 'light', label: 'Light' },
                  { id: 'system', label: 'Auto' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      theme === t.id
                        ? 'bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 border-[#0B57D0] dark:border-[#1A73E8] text-[#0B57D0] dark:text-[#1A73E8]'
                        : 'border-black/[0.08] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Scaling */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono text-neutral-500 uppercase">Text Size Scale</label>
                <span className="text-xs font-mono text-[#0B57D0] dark:text-[#1A73E8] font-bold capitalize">{fontSize}</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Calibrated for study speed, reader clarity & sleek mobile viewing.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'compact', label: 'Compact', size: '14px' },
                  { id: 'normal', label: 'Standard', size: '15.5px' },
                  { id: 'comfortable', label: 'Large', size: '17px' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setFontSize(s.id as any)}
                    className={`py-2.5 rounded-xl flex flex-col items-center gap-0.5 border transition-all ${
                      fontSize === s.id
                        ? 'bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 border-[#0B57D0] dark:border-[#1A73E8] text-[#0B57D0] dark:text-[#1A73E8] shadow-xs'
                        : 'border-black/[0.08] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400 hover:border-black/[0.15]'
                    }`}
                  >
                    <span className="text-xs font-semibold">{s.label}</span>
                    <span className="text-[10px] opacity-70 font-mono">{s.size}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-2 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Payment and Billing Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        profile={profile}
        defaultPlan={paymentPlan}
        onPaymentSuccess={async (updated) => {
          await onUpdateProfile(updated);
        }}
      />

      {/* MODAL E: Help & Feedback */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#1E1F20] rounded-[2rem] border border-black/[0.08] dark:border-white/[0.1] p-6 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Help & Feedback</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <GeminiIcon name="close" size={16} />
              </button>
            </div>

            {feedbackSent ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Thank you! Your feedback has been received.
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-neutral-500">
                  Have a suggestion or encounter a bug with course outlines or timetable? Let the team know:
                </p>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what you'd like improved..."
                  className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white focus:outline-none resize-none"
                />
                <button
                  onClick={() => {
                    if (!feedbackText.trim()) return;
                    setFeedbackSent(true);
                    setTimeout(() => {
                      setFeedbackSent(false);
                      setActiveModal(null);
                    }, 1500);
                  }}
                  disabled={!feedbackText.trim()}
                  className="w-full py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold disabled:opacity-40"
                >
                  Submit Feedback
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <p className="text-[10px] text-center text-neutral-400 dark:text-neutral-500 uppercase tracking-widest pt-2">
        Cohart Academic Platform • v2.6
      </p>
    </div>
  );
};

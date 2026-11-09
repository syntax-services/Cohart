'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile, SavedExplanation } from '@/lib/types';
import { uploadAvatar, fetchSavedExplanations } from '@/lib/supabase';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { AppearanceCustomizer } from '@/components/profile/AppearanceCustomizer';
import { ReadingHabitsManager, ReadingZone } from '@/components/profile/ReadingHabitsManager';
import { StudentIdentityView } from '@/components/profile/StudentIdentityView';
import { CampusProgramView } from '@/components/profile/CampusProgramView';
import { FeedbackSupportView } from '@/components/profile/FeedbackSupportView';
import { TermsHonorCodeView } from '@/components/profile/TermsHonorCodeView';

interface ProfileViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => Promise<void>;
  onOpenSchedule: () => void;
  onOpenReader?: () => void;
  onOpenAiChat?: (initialPrompt?: string) => void;
  onSignOut?: () => void;
}

export type ProfileSubView =
  | 'hub'
  | 'identity'
  | 'campus_program'
  | 'appearance'
  | 'reading_habits'
  | 'feedback'
  | 'terms';

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onOpenSchedule,
  onOpenReader,
  onOpenAiChat,
  onSignOut,
}) => {
  // Navigation Router: Dedicated Sub-Pages instead of cramped floating modals
  const [currentSubView, setCurrentSubView] = useState<ProfileSubView>('hub');

  // Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Payment Modal State (for subscription checkout if needed)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

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

  // Reading Zone status from localStorage
  const [readingZone, setReadingZone] = useState<ReadingZone>('active_revision');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedZone = (localStorage.getItem('cohart_reading_zone') as ReadingZone) || 'active_revision';
      setReadingZone(savedZone);
    }
  }, [currentSubView]);

  // String Ecosystem Synergy Accordion
  const [showPartnerInfo, setShowPartnerInfo] = useState(false);

  const initials = profile.full_name?.trim()
    ? profile.full_name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : profile.matric_number?.slice(0, 2).toUpperCase() || 'AR';

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

  // ── Render Dedicated Sub-Views When Active (Zero Cramped Popups) ──
  if (currentSubView === 'identity') {
    return (
      <StudentIdentityView
        profile={profile}
        onUpdateProfile={onUpdateProfile}
        onBack={() => setCurrentSubView('hub')}
        onNavigateToCatalog={() => setCurrentSubView('campus_program')}
      />
    );
  }

  if (currentSubView === 'campus_program') {
    return (
      <CampusProgramView
        profile={profile}
        onUpdateProfile={onUpdateProfile}
        onBack={() => setCurrentSubView('hub')}
      />
    );
  }

  if (currentSubView === 'appearance') {
    return (
      <AppearanceCustomizer
        onBack={() => setCurrentSubView('hub')}
        onSaveToProfile={async (settings) => {
          await onUpdateProfile(settings as Partial<StudentProfile>);
        }}
      />
    );
  }

  if (currentSubView === 'reading_habits') {
    return (
      <ReadingHabitsManager
        profile={profile}
        onUpdateProfile={onUpdateProfile}
        onBack={() => {
          if (typeof window !== 'undefined') {
            const z = (localStorage.getItem('cohart_reading_zone') as ReadingZone) || 'active_revision';
            setReadingZone(z);
          }
          setCurrentSubView('hub');
        }}
      />
    );
  }

  if (currentSubView === 'feedback') {
    return (
      <FeedbackSupportView
        profile={profile}
        onBack={() => setCurrentSubView('hub')}
      />
    );
  }

  if (currentSubView === 'terms') {
    return (
      <TermsHonorCodeView
        onBack={() => setCurrentSubView('hub')}
      />
    );
  }

  // ── Main Mobile-First Profile Hub ──
  return (
    <div className="max-w-md mx-auto space-y-5 pb-20 pt-3 animate-in fade-in duration-300 font-sans">
      {/* 
        ========================================================================
        1. STRING-STYLE SLEEK AVATAR & STUDENT HERO BLOCK
        Centered glowing avatar, verified pill, and institution tag.
        ========================================================================
      */}
      <div className="flex flex-col items-center text-center mt-2 space-y-3">
        <div
          className="relative group cursor-pointer"
          onClick={() => avatarInputRef.current?.click()}
        >
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarFileChange}
            accept="image/*"
            className="hidden"
          />
          {/* Subtle Ambient Glow Ring */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-white/20 via-white/40 to-white/10 opacity-30 group-hover:opacity-60 transition duration-500 blur-xs" />

          <div className="relative h-28 w-28 rounded-full border-2 border-white/20 bg-[#121316] flex items-center justify-center overflow-hidden shadow-2xl">
            {isUploadingAvatar ? (
              <div className="flex flex-col items-center justify-center gap-1">
                <GeminiIcon name="loader" size={20} className="text-white animate-spin" />
                <span className="text-[9px] font-bold text-neutral-400">Uploading...</span>
              </div>
            ) : profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'Profile'}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <span className="text-2xl font-bold font-mono text-white tracking-wider">
                {initials}
              </span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white flex-col gap-1">
              <GeminiIcon name="user" size={16} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
            </div>
          </div>
        </div>

        {avatarError && (
          <p className="text-[11px] font-medium text-rose-400 text-center animate-in fade-in">
            {avatarError}
          </p>
        )}

        {/* Student Name & Verified Pill */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
            {profile.full_name || profile.matric_number || 'Student Scholar'}
            <span className="inline-flex items-center gap-1 bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
              <GeminiIcon name="shield-check" size={10} />
              Verified
            </span>
          </h2>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest font-mono">
            {profile.department || 'GENERAL STUDIES'} • {profile.level || '100L'}
          </p>
          <div className="inline-flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] text-white text-[10.5px] font-medium px-3 py-1 rounded-full mt-1">
            <GeminiIcon name="compass" size={11} className="text-neutral-400" />
            <span>{profile.institution || 'Olabisi Onabanjo University'}</span>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        2. STUDENT READING HABIT & COMMUNITY ZONE CARD
        Replaces the removed competition banner with authentic reading empathy.
        ========================================================================
      */}
      <div className="rounded-3xl bg-[#121316] border border-white/[0.08] p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                readingZone === 'deep_focus'
                  ? 'bg-emerald-400 animate-pulse'
                  : readingZone === 'needs_warmup'
                  ? 'bg-amber-400'
                  : 'bg-sky-400'
              }`}
            />
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
              Current Reading Habit Zone
            </span>
          </div>
          <button
            onClick={() => setCurrentSubView('reading_habits')}
            className="text-[10px] font-mono text-white/80 hover:text-white font-bold hover:underline cursor-pointer"
          >
            Adjust Zone →
          </button>
        </div>

        <div>
          <h3 className="font-bold text-base text-white">
            {readingZone === 'deep_focus' && 'Deep Focus Flow'}
            {readingZone === 'active_revision' && 'Active Revision Rhythm'}
            {readingZone === 'needs_warmup' && 'Getting Into the Zone (Micro-Start)'}
          </h3>
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            {readingZone === 'deep_focus' &&
              'You are locked in. High-density textbook chapters, formula synthesis, and zero-distraction shielding.'}
            {readingZone === 'active_revision' &&
              'Steady textbook progress, past question checkpoints, and consistent daily comprehension.'}
            {readingZone === 'needs_warmup' &&
              'Out of the rhythm or struggling to read today? Start with a quick 5-min audio breakdown or bionic text summary.'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
          <span className="text-neutral-500">Reading Stamina:</span>
          <span className="text-white font-semibold">
            {profile.reading_speed_wpm || 240} WPM • Daily Active
          </span>
        </div>
      </div>

      {/* 
        ========================================================================
        3. AURORA BENTO MENU GRID
        2x2 grid with divide-x and border-b. Green summit button replaced with Reading Stats.
        ========================================================================
      */}
      <div className="bg-[#121316] rounded-3xl border border-white/[0.08] overflow-hidden shadow-xl">
        <div className="grid grid-cols-2 divide-x divide-white/[0.08] border-b border-white/[0.08]">
          {/* Tile 1: Course Textbooks */}
          <button
            onClick={onOpenReader}
            className="flex flex-col items-center justify-center p-5 gap-2 hover:bg-white/[0.04] transition-all duration-200 group cursor-pointer"
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-white/[0.06] flex items-center justify-center group-hover:bg-white/10 group-hover:scale-105 transition-all duration-300">
                <GeminiIcon
                  name="book-open"
                  size={18}
                  className="text-neutral-400 group-hover:text-white transition-colors"
                />
              </div>
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-white flex items-center justify-center px-1 text-[9px] font-bold text-neutral-950 shadow-xs ring-2 ring-[#121316]">
                4
              </span>
            </div>
            <span className="text-[11px] font-bold text-neutral-400 group-hover:text-white transition-colors tracking-wide">
              Course Books
            </span>
          </button>

          {/* Tile 2: Timetable & Schedule */}
          <button
            onClick={onOpenSchedule}
            className="flex flex-col items-center justify-center p-5 gap-2 hover:bg-white/[0.04] active:bg-white/[0.08] transition-all duration-200 group cursor-pointer"
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-white/[0.06] flex items-center justify-center group-hover:bg-white/10 group-hover:scale-105 transition-all duration-300">
                <GeminiIcon
                  name="calendar"
                  size={18}
                  className="text-neutral-400 group-hover:text-white transition-colors"
                />
              </div>
            </div>
            <span className="text-[11px] font-bold text-neutral-400 group-hover:text-white transition-colors tracking-wide">
              Exams & Schedule
            </span>
          </button>

          {/* Tile 3: Personal Notes Vault */}
          <button
            onClick={onOpenReader}
            className="flex flex-col items-center justify-center p-5 gap-2 hover:bg-white/[0.04] active:bg-white/[0.08] transition-all duration-200 group cursor-pointer"
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-white/[0.06] flex items-center justify-center group-hover:bg-white/10 group-hover:scale-105 transition-all duration-300">
                <GeminiIcon
                  name="bookmark"
                  size={18}
                  className="text-neutral-400 group-hover:text-white transition-colors"
                />
              </div>
              {savedVaultNotes.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-white flex items-center justify-center px-1 text-[9px] font-bold text-neutral-950 shadow-xs ring-2 ring-[#121316]">
                  {savedVaultNotes.length}
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-neutral-400 group-hover:text-white transition-colors tracking-wide">
              Personal Vault
            </span>
          </button>

          {/* Tile 4: Reading Habits & Flow Stats (Clean Monochrome - Removed Odd Green Button) */}
          <button
            onClick={() => setCurrentSubView('reading_habits')}
            className="flex flex-col items-center justify-center p-5 gap-2 hover:bg-white/[0.04] active:bg-white/[0.08] transition-all duration-200 group cursor-pointer"
          >
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-white/[0.06] flex items-center justify-center group-hover:bg-white/10 group-hover:scale-105 transition-all duration-300">
                <GeminiIcon
                  name="brain"
                  size={18}
                  className="text-neutral-400 group-hover:text-white transition-colors"
                />
              </div>
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-white flex items-center justify-center px-1 text-[9px] font-bold text-neutral-950 shadow-xs ring-2 ring-[#121316]">
                {profile.reading_speed_wpm || 240}
              </span>
            </div>
            <span className="text-[11px] font-bold text-neutral-400 group-hover:text-white transition-colors tracking-wide">
              Reading Flow
            </span>
          </button>
        </div>

        {/* 
          ========================================================================
          4. BIG-TECH STYLE SETTINGS NAVIGATION (Opens Dedicated Sub-Pages)
          ========================================================================
        */}
        <div className="divide-y divide-white/[0.08]">
          {/* Row 1: Student Identity & Matriculation */}
          <button
            onClick={() => setCurrentSubView('identity')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.04] transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/[0.06] text-neutral-400 flex items-center justify-center group-hover:text-white transition-colors">
                <GeminiIcon name="settings" size={15} />
              </div>
              <div>
                <span className="font-medium text-neutral-200 text-[13px] block leading-tight">
                  Student Identity & Matriculation
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {profile.full_name || 'Set official name'} • {profile.matric_number || 'Matric'}
                </span>
              </div>
            </div>
            <GeminiIcon
              name="chevron-right"
              size={14}
              className="text-neutral-400 group-hover:translate-x-0.5 transition-transform"
            />
          </button>

          {/* Row 2: Campus Program & Timetables */}
          <button
            onClick={() => setCurrentSubView('campus_program')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.04] transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/[0.06] text-neutral-400 flex items-center justify-center group-hover:text-white transition-colors">
                <GeminiIcon name="book-open" size={15} />
              </div>
              <div>
                <span className="font-medium text-neutral-200 text-[13px] block leading-tight">
                  Campus Program & Academic Catalog
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {profile.institution || 'OOU'} • {profile.department || 'Department'} • {profile.level || '100L'}
                </span>
              </div>
            </div>
            <GeminiIcon
              name="chevron-right"
              size={14}
              className="text-neutral-400 group-hover:translate-x-0.5 transition-transform"
            />
          </button>

          {/* Row 3: Appearance & Cosmic Space Lab */}
          <button
            onClick={() => setCurrentSubView('appearance')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.04] transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/[0.06] text-neutral-400 flex items-center justify-center group-hover:text-white transition-colors">
                <GeminiIcon name="sparkle" size={15} />
              </div>
              <div>
                <span className="font-medium text-neutral-200 text-[13px] block leading-tight">
                  Appearance & Cosmic Space Lab
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Realtime palettes, liquid glass, icon packs & Grok craft
                </span>
              </div>
            </div>
            <GeminiIcon
              name="chevron-right"
              size={14}
              className="text-neutral-400 group-hover:translate-x-0.5 transition-transform"
            />
          </button>

          {/* Row 4: Reading Habits & Community Zone */}
          <button
            onClick={() => setCurrentSubView('reading_habits')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.04] transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/[0.06] text-neutral-400 flex items-center justify-center group-hover:text-white transition-colors">
                <GeminiIcon name="brain" size={15} />
              </div>
              <div>
                <span className="font-medium text-neutral-200 text-[13px] block leading-tight">
                  Reading Habits & Community Zone
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  Deep focus, revision pace & micro-start assistance
                </span>
              </div>
            </div>
            <GeminiIcon
              name="chevron-right"
              size={14}
              className="text-neutral-400 group-hover:translate-x-0.5 transition-transform"
            />
          </button>

          {/* Row 5: Support & Student Feedback */}
          <button
            onClick={() => setCurrentSubView('feedback')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.04] transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/[0.06] text-neutral-400 flex items-center justify-center group-hover:text-white transition-colors">
                <GeminiIcon name="chat" size={15} />
              </div>
              <span className="font-medium text-neutral-200 text-[13px]">
                Support & Student Feedback
              </span>
            </div>
            <GeminiIcon
              name="chevron-right"
              size={14}
              className="text-neutral-400 group-hover:translate-x-0.5 transition-transform"
            />
          </button>

          {/* Row 6: Terms & Campus Honor Code */}
          <button
            onClick={() => setCurrentSubView('terms')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.04] transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/[0.06] text-neutral-400 flex items-center justify-center group-hover:text-white transition-colors">
                <GeminiIcon name="shield" size={15} />
              </div>
              <span className="font-medium text-neutral-200 text-[13px]">
                Terms & Academic Honor Code
              </span>
            </div>
            <GeminiIcon
              name="chevron-right"
              size={14}
              className="text-neutral-400 group-hover:translate-x-0.5 transition-transform"
            />
          </button>

          {/* Row 7: Log Out */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-rose-500/[0.04] active:bg-rose-500/[0.08] transition-all duration-200 group text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white/[0.06] text-neutral-400 flex items-center justify-center group-hover:text-rose-500 transition-colors">
                  <GeminiIcon name="close" size={14} />
                </div>
                <span className="font-medium text-neutral-200 group-hover:text-rose-400 text-[13px]">
                  Log Out
                </span>
              </div>
              <GeminiIcon
                name="chevron-right"
                size={14}
                className="text-neutral-400 group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          )}
        </div>
      </div>

      {/* 
        ========================================================================
        5. STRING ECOSYSTEM SYNERGY ACCORDION
        ========================================================================
      */}
      <div className="bg-[#121316] rounded-2xl border border-white/[0.08] overflow-hidden shadow-xl">
        <button
          onClick={() => setShowPartnerInfo(!showPartnerInfo)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.04] transition-all duration-200 text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <GeminiIcon name="sparkle" size={14} className="text-white" />
            <span className="font-semibold text-neutral-300 text-[11px] uppercase tracking-wider font-mono">
              String & Cohart Ecosystem Synergy
            </span>
          </div>
          <GeminiIcon
            name="chevron-right"
            size={14}
            className={`text-neutral-400 transition-transform duration-200 ${
              showPartnerInfo ? 'rotate-90' : ''
            }`}
          />
        </button>

        {showPartnerInfo && (
          <div className="p-4 bg-white/[0.02] border-t border-white/[0.06] space-y-2 text-left animate-in fade-in">
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Cohart and String form a unified student ecosystem across Nigerian higher institutions. String handles campus peer commerce and verified merchant payments, while Cohart delivers Senate academic intelligence, textbook reading flow, and exam checkpoints.
            </p>
            <div className="pt-2 flex items-center justify-between text-[10px] font-mono">
              <span className="text-emerald-400 font-semibold">
                OOU Campus Launch Active
              </span>
              <span className="text-neutral-500">Singularity Architecture</span>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal (if triggered) */}
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
    </div>
  );
};

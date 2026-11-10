'use client';

import { useState, useEffect, useCallback } from 'react';
import { StudentProfile } from '@/lib/types';
import { DEFAULT_STUDENT_PROFILE, fetchProfile, updateProfile, supabase } from '@/lib/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cohart_saved_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object') {
            return { ...DEFAULT_STUDENT_PROFILE, ...parsed };
          }
        }
      } catch {}
    }
    return DEFAULT_STUDENT_PROFILE;
  });

  const [userId, setUserId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cohart_saved_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.id && parsed.id !== 'usr_guest_scholar') {
            return parsed.id;
          }
        }
      } catch {}
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize and listen to live Supabase Auth session
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          if (isMounted) setUserId(session.user.id);
          const userProfile = await fetchProfile(session.user.id);
          if (isMounted) {
            const resolvedProfile: StudentProfile = {
              ...userProfile,
              email: session.user.email?.endsWith('@student.cohart.ng') ? (userProfile.email || '') : (session.user.email || userProfile.email),
              full_name: session.user.user_metadata?.full_name || userProfile.full_name,
              institution: session.user.user_metadata?.institution || userProfile.institution || '',
            };
            setProfile(resolvedProfile);
            try {
              localStorage.setItem('cohart_saved_profile', JSON.stringify(resolvedProfile));
            } catch {}
          }
        } else {
          // If no session, preserve any user-customized profile saved in localStorage
          if (typeof window !== 'undefined') {
            try {
              const cached = localStorage.getItem('cohart_saved_profile');
              if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && typeof parsed === 'object') {
                  if (isMounted) setProfile((prev) => ({ ...prev, ...parsed }));
                  return;
                }
              }
            } catch {}
          }
          if (isMounted && !userId) {
            setProfile(DEFAULT_STUDENT_PROFILE);
          }
        }
      } catch (e) {
        console.warn('Auth session check failed', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth state changes (login, logout, switch)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          setUserId(session.user.id);
          const userProfile = await fetchProfile(session.user.id);
          const resolvedProfile: StudentProfile = {
            ...userProfile,
            email: session.user.email?.endsWith('@student.cohart.ng') ? (userProfile.email || '') : (session.user.email || userProfile.email),
            full_name: session.user.user_metadata?.full_name || userProfile.full_name,
            institution: session.user.user_metadata?.institution || userProfile.institution || '',
          };
          setProfile(resolvedProfile);
          try {
            localStorage.setItem('cohart_saved_profile', JSON.stringify(resolvedProfile));
          } catch {}
        } else if (event === 'SIGNED_OUT') {
          setUserId(null);
          setProfile(DEFAULT_STUDENT_PROFILE);
          try {
            localStorage.removeItem('cohart_saved_profile');
          } catch {}
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const saveProfile = useCallback(async (updated: Partial<StudentProfile>) => {
    setIsSaving(true);
    try {
      const targetId = userId || profile.id || 'usr_guest_scholar';
      const merged = { ...profile, ...updated, id: targetId };
      setProfile(merged);
      try {
        localStorage.setItem('cohart_saved_profile', JSON.stringify(merged));
        localStorage.setItem(`cohart_profile_${targetId}`, JSON.stringify(merged));
      } catch {}
      const saved = await updateProfile(merged);
      setProfile(saved);
      try {
        localStorage.setItem('cohart_saved_profile', JSON.stringify(saved));
        localStorage.setItem(`cohart_profile_${targetId}`, JSON.stringify(saved));
      } catch {}
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setIsSaving(false);
    }
  }, [profile, userId]);

  const updateCognitiveTraits = useCallback(async (traits: string[]) => {
    await saveProfile({ cognitive_traits: traits });
  }, [saveProfile]);

  const recordReferralEarnings = useCallback(async (amount: number) => {
    const current = profile.wallet_balance || 0;
    await saveProfile({ wallet_balance: current + amount });
  }, [profile.wallet_balance, saveProfile]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUserId(null);
      setProfile(DEFAULT_STUDENT_PROFILE);
      try {
        localStorage.removeItem('cohart_saved_profile');
      } catch {}
    } catch (e) {
      console.error('Failed to sign out', e);
    }
  }, []);

  return {
    profile,
    userId,
    isLoading,
    isSaving,
    saveProfile,
    signOut,
    updateCognitiveTraits,
    recordReferralEarnings,
  };
}

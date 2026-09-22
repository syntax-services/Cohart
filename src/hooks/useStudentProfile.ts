'use client';

import { useState, useEffect, useCallback } from 'react';
import { StudentProfile } from '@/lib/types';
import { DEFAULT_STUDENT_PROFILE, fetchProfile, updateProfile, supabase } from '@/lib/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE);
  const [userId, setUserId] = useState<string | null>(null);
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
          // Strictly require verified email
          const isVerified = Boolean(
            session.user.email_confirmed_at ||
            session.user.confirmed_at ||
            session.user.app_metadata?.provider !== 'email'
          );

          if (isVerified) {
            if (isMounted) setUserId(session.user.id);
            const userProfile = await fetchProfile(session.user.id);
            if (isMounted) {
              setProfile({
                ...userProfile,
                email: session.user.email || userProfile.email,
                full_name: session.user.user_metadata?.full_name || userProfile.full_name,
                institution: session.user.user_metadata?.institution || userProfile.institution || 'OOU',
              });
            }
          } else {
            // Unverified user - reject and sign out
            await supabase.auth.signOut();
            if (isMounted) {
              setUserId(null);
              setProfile(DEFAULT_STUDENT_PROFILE);
            }
          }
        }
      } catch (e) {
        console.warn('Auth session check failed', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth state changes (login, logout, email confirmation)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          const isVerified = Boolean(
            session.user.email_confirmed_at ||
            session.user.confirmed_at ||
            session.user.app_metadata?.provider !== 'email'
          );

          if (isVerified) {
            setUserId(session.user.id);
            const userProfile = await fetchProfile(session.user.id);
            setProfile({
              ...userProfile,
              email: session.user.email || userProfile.email,
              full_name: session.user.user_metadata?.full_name || userProfile.full_name,
              institution: session.user.user_metadata?.institution || userProfile.institution || 'OOU',
            });
          } else {
            setUserId(null);
            setProfile(DEFAULT_STUDENT_PROFILE);
          }
        } else if (event === 'SIGNED_OUT') {
          setUserId(null);
          setProfile(DEFAULT_STUDENT_PROFILE);
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
      const targetId = userId || profile.id || 'usr_demo_student_01';
      const merged = { ...profile, ...updated, id: targetId };
      setProfile(merged);
      const saved = await updateProfile(merged);
      setProfile(saved);
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import { StudentProfile } from '@/lib/types';
import { DEFAULT_STUDENT_PROFILE, fetchProfile, updateProfile } from '@/lib/supabase';

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_STUDENT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await fetchProfile('usr_demo_student_01');
      setProfile(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const saveProfile = useCallback(async (updated: Partial<StudentProfile>) => {
    setIsSaving(true);
    try {
      const merged = { ...profile, ...updated };
      setProfile(merged);
      const saved = await updateProfile(merged);
      setProfile(saved);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setIsSaving(false);
    }
  }, [profile]);

  const updateCognitiveTraits = useCallback(async (traits: string[]) => {
    await saveProfile({ cognitive_traits: traits });
  }, [saveProfile]);

  const recordReferralEarnings = useCallback(async (amount: number) => {
    const current = profile.wallet_balance || 0;
    await saveProfile({ wallet_balance: current + amount });
  }, [profile.wallet_balance, saveProfile]);

  return {
    profile,
    isLoading,
    isSaving,
    saveProfile,
    updateCognitiveTraits,
    recordReferralEarnings,
  };
}

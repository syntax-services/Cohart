'use client';

import React, { useState, useEffect } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { supabase } from '@/lib/supabase';
import { SUPPORTED_INSTITUTIONS } from '@/lib/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fullName: string, email: string, userId?: string, institution?: string) => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'verify_email'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('OOU');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg(null);
    setInfoMsg(null);
  }, [initialMode, isOpen]);

  // Handle resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (mode === 'signup' && !fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Please provide your email and password.');
      return;
    }
    if (cleanPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: fullName.trim(),
              institution: institution,
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
          return;
        }

        // STRICT EMAIL VERIFICATION CHECK:
        // If email confirmation is required, user is not verified yet.
        const isVerified = Boolean(data.user?.email_confirmed_at || data.user?.confirmed_at);
        if (!isVerified) {
          // Never log in an unverified user!
          await supabase.auth.signOut();
          setMode('verify_email');
          setResendCooldown(60);
          setInfoMsg(`Verification email sent to ${cleanEmail}.`);
          return;
        }

        // If email is pre-confirmed (rare dev environment setup)
        const studentName = fullName.trim() || cleanEmail.split('@')[0];
        onSuccess(studentName, cleanEmail, data.user?.id, institution);
        onClose();
      } else if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (error) {
          const lowerMsg = error.message.toLowerCase();
          if (lowerMsg.includes('email not confirmed')) {
            // User entered correct credentials but hasn't verified email!
            setMode('verify_email');
            setErrorMsg('Your email is not verified yet. Please click the link sent to your inbox.');
            return;
          }
          if (lowerMsg.includes('invalid login credentials')) {
            setErrorMsg('Invalid email or password. Please check your credentials.');
          } else {
            setErrorMsg(error.message);
          }
          return;
        }

        // Validate confirmed status
        const isVerified = Boolean(
          data.user?.email_confirmed_at ||
          data.user?.confirmed_at ||
          data.user?.app_metadata?.provider !== 'email'
        );

        if (!isVerified) {
          // Force sign out unverified account
          await supabase.auth.signOut();
          setMode('verify_email');
          setErrorMsg('You must verify your email address before accessing Cohart.');
          return;
        }

        const studentName =
          data.user?.user_metadata?.full_name ||
          cleanEmail.split('@')[0] ||
          'Student';

        onSuccess(studentName, cleanEmail, data.user?.id);
        onClose();
      }
    } catch {
      setErrorMsg('Network connectivity issue. Please check your connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  // Check if email has been verified
  const handleCheckVerification = async () => {
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      if (!cleanPassword) {
        setMode('signin');
        setInfoMsg('Please sign in to confirm your verified account.');
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrorMsg("We haven't received your confirmation yet. Please click the link in your email.");
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      const isVerified = Boolean(data.user?.email_confirmed_at || data.user?.confirmed_at);
      if (!isVerified) {
        await supabase.auth.signOut();
        setErrorMsg("Email is not verified yet. Please check your inbox and click the verification link.");
        return;
      }

      const studentName =
        data.user?.user_metadata?.full_name ||
        fullName.trim() ||
        cleanEmail.split('@')[0];

      onSuccess(studentName, cleanEmail, data.user?.id);
      onClose();
    } catch {
      setErrorMsg('Unable to check verification status. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setInfoMsg(`A fresh verification link has been sent to ${cleanEmail}.`);
        setResendCooldown(60);
      }
    } catch {
      setErrorMsg('Failed to resend email. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.1] p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <GeminiIcon name="close" size={16} />
        </button>

        {/* MODE: VERIFY EMAIL SCREEN (Google / Linear / Stripe Grade) */}
        {mode === 'verify_email' ? (
          <div className="text-center py-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA] mb-4">
              <GeminiIcon name="shield-check" size={24} />
            </div>

            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white font-sans">
              Verify your student email
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
              We sent a verification link to:
            </p>

            <div className="my-2.5 inline-block max-w-full px-3 py-1.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08]">
              <span className="font-mono text-xs font-semibold text-[#0B57D0] dark:text-[#A8C7FA] truncate block">
                {email || 'your email'}
              </span>
            </div>

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal px-2">
              Click the link in your inbox to verify your account. You cannot sign in until your email is confirmed.
            </p>

            {errorMsg && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-sans text-left">
                {errorMsg}
              </div>
            )}

            {infoMsg && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-sans text-left">
                {infoMsg}
              </div>
            )}

            <div className="mt-5 space-y-2.5">
              <button
                onClick={handleCheckVerification}
                disabled={loading}
                className="w-full py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-white dark:border-neutral-950 border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span>I&apos;ve Verified My Email</span>
                    <GeminiIcon name="check" size={14} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading || resendCooldown > 0}
                className="w-full py-2 rounded-full border border-black/[0.08] dark:border-white/[0.08] text-xs font-mono text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors disabled:opacity-50"
              >
                {resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : 'Resend Verification Link'}
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.07] flex items-center justify-between text-xs font-sans text-neutral-500">
              <button
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className="hover:text-neutral-900 dark:hover:text-white"
              >
                Change email
              </button>
              <button
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className="text-[#0B57D0] dark:text-[#A8C7FA] font-medium"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : (
          /* MODE: SIGN IN / SIGN UP */
          <>
            <div className="mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA] mb-3">
                <GeminiIcon name="user" size={18} />
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white font-sans">
                {mode === 'signin' ? 'Sign in to Cohart' : 'Create student account'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {mode === 'signin'
                  ? 'Sign in to access your personalized reader, schedule & campus guidance.'
                  : 'Requires email verification before first sign-in.'}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-sans">
                {errorMsg}
              </div>
            )}

            {infoMsg && (
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-sans">
                {infoMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="text-[11px] font-mono text-neutral-500 uppercase">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Adewale Johnson"
                      required
                      className="w-full mt-1 px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-neutral-500 uppercase">Institution</label>
                    <select
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full mt-1 px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
                    >
                      {SUPPORTED_INSTITUTIONS.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.shortName}) {inst.hasMap ? '• Active Map' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-mono text-neutral-500 uppercase">Student Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@oouagoiwoye.edu.ng"
                  required
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-neutral-500 uppercase">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full mt-1 px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-white dark:border-neutral-950 border-t-transparent animate-spin" />
                ) : (
                  <span>{mode === 'signin' ? 'Sign In' : 'Sign Up with Email'}</span>
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.07] text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] font-sans"
              >
                {mode === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

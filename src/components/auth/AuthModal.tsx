'use client';

import React, { useState } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fullName: string, email: string) => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === 'signup' && !fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please provide your email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const nameToStore = mode === 'signup' ? fullName.trim() : (email.split('@')[0] || 'Student');
      onSuccess(nameToStore, email.trim());
      onClose();
    } catch {
      setErrorMsg('Unable to authenticate. Please check your network and retry.');
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

        <div className="mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA] mb-3">
            <GeminiIcon name="user" size={18} />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white font-sans">
            {mode === 'signin' ? 'Sign in to Cohart' : 'Create your student account'}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {mode === 'signin'
              ? 'Sign in to access personalized reader, schedule & campus guidance.'
              : 'Sign up in seconds to unlock personalized academic AI.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-sans">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
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
            className="w-full mt-2 py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="h-3.5 w-3.5 rounded-full border-2 border-white dark:border-neutral-950 border-t-transparent animate-spin" />
            ) : (
              <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.07] text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setErrorMsg(null);
            }}
            className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-[#0B57D0] dark:hover:text-[#A8C7FA] font-sans"
          >
            {mode === 'signin'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

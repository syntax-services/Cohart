'use client';

import React, { useState } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile } from '@/lib/types';

interface StudentIdentityViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => Promise<void>;
  onBack: () => void;
  onNavigateToCatalog?: () => void;
}

export const StudentIdentityView: React.FC<StudentIdentityViewProps> = ({
  profile,
  onUpdateProfile,
  onBack,
  onNavigateToCatalog,
}) => {
  const [name, setName] = useState(profile.full_name || '');
  const [matric, setMatric] = useState(profile.matric_number || '');
  const [department, setDepartment] = useState(profile.department || '');
  const [level, setLevel] = useState(profile.level || '100L');
  const [email, setEmail] = useState(profile.email || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateProfile({
        full_name: name.trim(),
        matric_number: matric.trim(),
        department: department.trim(),
        level: level.trim(),
        email: email.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onBack();
      }, 700);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer group"
        >
          <GeminiIcon
            name="arrow-left"
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Profile</span>
        </button>
        <h2 className="text-sm font-bold text-white tracking-tight">Student Identity & Matric</h2>
        <span className="text-[10px] font-mono text-white/70 bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
          Official
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-3xl bg-[#121316] border border-white/[0.08] p-5 space-y-4 shadow-xl">
          <div>
            <label className="text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5">
              Full Official Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-colors"
              placeholder="e.g. Morenikeji Adetunji"
              required
            />
          </div>

          <div>
            <label className="text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5">
              University Matric Number
            </label>
            <input
              type="text"
              value={matric}
              onChange={(e) => setMatric(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-colors font-mono"
              placeholder="e.g. SMS/2021/0045"
            />
            <p className="text-[10px] text-neutral-500 mt-1">
              Used to match faculty exam rosters and Senate timetable allocations.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider block">
                Department
              </label>
              {onNavigateToCatalog && (
                <button
                  type="button"
                  onClick={onNavigateToCatalog}
                  className="text-[10px] font-mono text-sky-400 hover:underline font-bold cursor-pointer"
                >
                  Browse Catalog →
                </button>
              )}
            </div>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-colors"
              placeholder="e.g. Economics"
              required
            />
          </div>

          <div>
            <label className="text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5">
              Current Academic Level
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {['100L', '200L', '300L', '400L', '500L'].map((lvl) => {
                const isSelected = level === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-neutral-950 shadow-sm'
                        : 'bg-white/[0.04] text-neutral-400 border border-white/[0.06] hover:bg-white/[0.08]'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider block mb-1.5">
              Student Email (Campus or Personal)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 transition-colors"
              placeholder="scholar@oouagoiwoye.edu.ng"
            />
          </div>
        </div>

        {/* Verification Status Pill */}
        <div className="p-4 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <GeminiIcon name="shield-check" size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Campus Insider Status</span>
              <span className="text-[10px] text-neutral-400">{profile.institution || 'OOU Verified'}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Active
          </span>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold shadow-lg active:scale-98 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? 'Saving...' : saveSuccess ? '✓ Identity Updated!' : 'Save Student Identity'}
        </button>
      </form>
    </div>
  );
};

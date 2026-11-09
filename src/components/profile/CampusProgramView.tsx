'use client';

import React, { useState } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile } from '@/lib/types';
import { UniversityCombobox } from '@/components/ui/UniversityCombobox';
import { OgunAcademicSelector, OgunAcademicSelection } from '@/components/ui/OgunAcademicSelector';
import {
  NIGERIAN_UNIVERSITIES,
  getRandomCampusQuestion,
  evaluateCampusAnswer,
  CampusInsiderQuestion,
} from '@/lib/campusVerification';

interface CampusProgramViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => Promise<void>;
  onBack: () => void;
}

export const CampusProgramView: React.FC<CampusProgramViewProps> = ({
  profile,
  onUpdateProfile,
  onBack,
}) => {
  const [selectedUniv, setSelectedUniv] = useState<string>(profile.institution || 'OOU');
  const [currentInsiderQuestion, setCurrentInsiderQuestion] = useState<CampusInsiderQuestion | null>(() =>
    getRandomCampusQuestion(profile.institution || 'OOU')
  );
  const [campusUserAnswer, setCampusUserAnswer] = useState('');
  const [campusStep, setCampusStep] = useState<'question' | 'near_miss' | 'bluff' | 'verified' | 'failed'>(
    'question'
  );
  const [campusNudge, setCampusNudge] = useState('');
  const [campusBluff, setCampusBluff] = useState('');
  const [activeTab, setActiveTab] = useState<'catalog' | 'verification'>('catalog');

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
      return;
    }

    setCampusStep('failed');
    setCampusNudge('Verification challenge failed. Try again with an alternate campus question.');
  };

  const handleApplyAcademicSelection = async (selection: OgunAcademicSelection) => {
    await onUpdateProfile({
      institution: selection.institution,
      department: selection.department,
      level: selection.level,
    });
    setSelectedUniv(selection.institutionCode.toUpperCase());
    onBack();
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
        <h2 className="text-sm font-bold text-white tracking-tight">Campus & Academic Catalog</h2>
        <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
          Ogun OS
        </span>
      </div>

      {/* Mode Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-white text-neutral-950 font-bold shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Official Courses & Level
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'verification'
              ? 'bg-white text-neutral-950 font-bold shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Campus Verification
        </button>
      </div>

      {activeTab === 'catalog' ? (
        /* Ogun Academic Selector Container */
        <div className="rounded-3xl bg-[#121316] border border-white/[0.08] p-5 shadow-xl space-y-4">
          <div className="border-b border-white/[0.06] pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Academic Program & Department
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Select your institution, campus branch, and registered faculty curriculum.
            </p>
          </div>

          <OgunAcademicSelector
            initialInstitution={profile.institution}
            initialDepartment={profile.department}
            initialLevel={profile.level}
            onApply={handleApplyAcademicSelection}
            onCancel={onBack}
          />
        </div>
      ) : (
        /* Campus Insider Verification */
        <div className="rounded-3xl bg-[#121316] border border-white/[0.08] p-5 shadow-xl space-y-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Campus Insider Verification
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Answer authentic campus lore, faculty nicknames, or hall locations to unlock coordinator rights.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
              Target Institution
            </label>
            <UniversityCombobox value={selectedUniv} onChange={handleSelectTargetUniv} />
          </div>

          {currentInsiderQuestion && (
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold block mb-1">
                  Insider Challenge Question
                </span>
                <p className="text-white font-medium leading-relaxed">
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
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/40"
                  />
                  <button
                    onClick={handleSubmitCampusAnswer}
                    className="w-full py-2.5 rounded-2xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold cursor-pointer shadow-md active:scale-98 transition-all"
                  >
                    Verify Campus Identity
                  </button>
                </div>
              )}

              {campusStep === 'bluff' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-sky-500/[0.06] border border-sky-500/20">
                  <p className="text-xs text-white font-medium leading-relaxed">
                    {campusBluff}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAnswerBluff(true)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      Correct (Confirm)
                    </button>
                    <button
                      onClick={() => handleAnswerBluff(false)}
                      className="flex-1 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-neutral-300 text-xs font-semibold cursor-pointer"
                    >
                      False
                    </button>
                  </div>
                </div>
              )}

              {campusStep === 'verified' && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center font-bold">
                  ✓ Verified as Campus Insider!
                </div>
              )}

              {campusStep === 'failed' && (
                <div className="space-y-2 text-center p-3 rounded-2xl bg-rose-500/[0.06] border border-rose-500/20">
                  <p className="text-xs text-rose-400 font-medium">{campusNudge}</p>
                  <button
                    onClick={() => {
                      const q = getRandomCampusQuestion(selectedUniv);
                      setCurrentInsiderQuestion(q);
                      setCampusStep('question');
                      setCampusUserAnswer('');
                    }}
                    className="text-xs font-semibold text-white underline cursor-pointer"
                  >
                    Try another question
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile, LearningStyle } from '@/lib/types';

interface ProfileViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: Partial<StudentProfile>) => Promise<void>;
  onOpenSchedule: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onOpenSchedule,
}) => {
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form states for basic info
  const [name, setName] = useState(profile.full_name);
  const [matric, setMatric] = useState(profile.matric_number);
  const [dept, setDept] = useState(profile.department);
  const [level, setLevel] = useState(profile.level);

  // Questionnaire answers
  const [qStep, setQStep] = useState(0);
  const [qAnswers, setQAnswers] = useState<Record<number, string>>({});

  // Paystack mock state
  const [withdrawAmount, setWithdrawAmount] = useState('5000');
  const [bankName, setBankName] = useState('Access Bank');
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const cognitiveTraitOptions = [
    'ADHD / Fast Context Switches',
    'Analogies & Real-World Models',
    'Night Owl Deep Focus',
    'Audio-Visual Learner',
    'Exam Anxiety Sensitivity',
    'Dyslexia-Friendly Spacing',
    'Short Micro-Sessions (20m)',
  ];

  const handleToggleTrait = async (trait: string) => {
    const current = profile.cognitive_traits || [];
    const exists = current.includes(trait);
    const updated = exists ? current.filter((t) => t !== trait) : [...current, trait];
    await onUpdateProfile({ cognitive_traits: updated });
  };

  const handleSaveBasic = async () => {
    await onUpdateProfile({
      full_name: name,
      matric_number: matric,
      department: dept,
      level,
    });
    setIsEditingBasic(false);
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(
      `https://cohart.app/join?ref=${profile.referral_code}`
    );
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExecuteWithdrawal = () => {
    setIsWithdrawing(true);
    setTimeout(async () => {
      const amt = parseFloat(withdrawAmount) || 0;
      const newBal = Math.max(0, (profile.wallet_balance || 0) - amt);
      await onUpdateProfile({ wallet_balance: newBal });
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      setTimeout(() => {
        setWithdrawSuccess(false);
        setShowWithdrawModal(false);
      }, 2000);
    }, 1200);
  };

  const questionnaireQuestions = [
    {
      q: 'When an economics lecturer explains a difficult theorem, what makes it click first?',
      options: [
        'A real-world marketplace analogy (e.g. Ago-Iwoye market prices)',
        'The step-by-step mathematical derivation on the board',
        'A concise summary of the bottom-line formula',
        'A question-and-answer dialogue exploring why it works',
      ],
      styleMapping: [
        'visual_analogies',
        'deep_first_principles',
        'concise_bullet',
        'socratic_inquiry',
      ] as LearningStyle[],
    },
    {
      q: 'How does your attention span behave when reading dense textbooks?',
      options: [
        'I get restless quickly unless the text has interactive checkpoints',
        'I absorb best when guided by bolded bionic anchor fixations',
        'I prefer reading complete paragraphs before testing myself',
        'I listen to audio while scanning text',
      ],
      traitAdd: 'ADHD / Fast Context Switches',
    },
  ];

  const handleSelectQuestionnaireOption = async (optionIdx: number) => {
    const currentQ = questionnaireQuestions[qStep];
    if (qStep === 0 && currentQ.styleMapping) {
      const selectedStyle = currentQ.styleMapping[optionIdx];
      await onUpdateProfile({ learning_style: selectedStyle });
    }

    if (qStep < questionnaireQuestions.length - 1) {
      setQStep(qStep + 1);
    } else {
      setShowQuestionnaire(false);
      setQStep(0);
    }
  };

  const initials = profile.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AJ';

  return (
    <div className="space-y-5">
      {/* Student Profile Identity Card */}
      <GeminiCard glow>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#1A73E8] to-[#387BFF] font-mono text-lg font-bold text-white shadow-[0_0_20px_rgba(56,123,255,0.35)]">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-white font-sans">
                  {profile.full_name}
                </h1>
                {profile.is_verified_coordinator && (
                  <Badge variant="blue" size="sm">
                    <GeminiIcon name="shield-check" size={13} className="text-[#387BFF]" />
                    <span>Verified Dept Coordinator</span>
                  </Badge>
                )}
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {profile.matric_number} • {profile.department} • {profile.level}
              </p>
              <p className="text-[11px] text-slate-500 font-sans">
                {profile.institution}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingBasic(!isEditingBasic)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white hover:border-white/[0.16] transition-all"
          >
            <GeminiIcon name="user" size={14} />
            <span>{isEditingBasic ? 'Close' : 'Quick Details'}</span>
          </button>
        </div>

        {/* Quick Details Inline Editor */}
        {isEditingBasic && (
          <div className="mt-4 pt-4 border-t border-white/[0.07] grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#387BFF]"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase">Matric Number</label>
              <input
                type="text"
                value={matric}
                onChange={(e) => setMatric(e.target.value)}
                className="w-full mt-1 p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#387BFF]"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase">Department</label>
              <input
                type="text"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full mt-1 p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#387BFF]"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase">Academic Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full mt-1 p-2 rounded-xl bg-[#0A0E18] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#387BFF]"
              >
                <option value="100L">100 Level</option>
                <option value="200L">200 Level</option>
                <option value="300L">300 Level</option>
                <option value="400L">400 Level</option>
                <option value="500L">500 Level</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                onClick={handleSaveBasic}
                className="px-4 py-1.5 rounded-xl bg-[#387BFF] text-white text-xs font-semibold hover:bg-[#2563EB]"
              >
                Save Updates
              </button>
            </div>
          </div>
        )}
      </GeminiCard>

      {/* Cognitive Profile & Learning Style Section */}
      <GeminiCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#387BFF]/15 text-[#387BFF]">
              <GeminiIcon name="brain" size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Cognitive Traits & AI Adaptation</h2>
              <p className="text-[10px] font-mono text-slate-400">
                How Cohart AI tunes explanations for your neuro-profile
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowQuestionnaire(true)}
            className="flex items-center gap-1 text-xs font-mono text-[#60A5FA] hover:underline"
          >
            <GeminiIcon name="sparkle" size={13} />
            <span>Retake AI Quiz</span>
          </button>
        </div>

        {/* Learning Style Status */}
        <div className="p-3 rounded-xl bg-[#080C14] border border-blue-500/20 mb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Active AI Explanation Mode</span>
            <p className="text-xs font-semibold text-white mt-0.5 capitalize">
              {profile.learning_style.replace('_', ' ')}
            </p>
          </div>
          <Badge variant="blue" size="sm">Tuned to You</Badge>
        </div>

        {/* Cognitive Traits Selector Chips */}
        <div>
          <span className="text-[11px] font-mono text-slate-400 block mb-2">
            Select your cognitive traits to personalize lecture summaries:
          </span>
          <div className="flex flex-wrap gap-2">
            {cognitiveTraitOptions.map((trait) => {
              const isSelected = profile.cognitive_traits.includes(trait);
              return (
                <button
                  key={trait}
                  onClick={() => handleToggleTrait(trait)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-[#387BFF]/20 border border-[#387BFF]/60 text-white shadow-[0_0_12px_rgba(56,123,255,0.25)]'
                      : 'bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white'
                  }`}
                >
                  <GeminiIcon
                    name={isSelected ? 'check' : 'sparkle'}
                    size={13}
                    className={isSelected ? 'text-[#387BFF]' : 'text-slate-500'}
                  />
                  <span>{trait}</span>
                </button>
              );
            })}
          </div>
        </div>
      </GeminiCard>

      {/* Referral Program & Paystack Wallet Card */}
      <GeminiCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#387BFF]/15 text-[#387BFF]">
              <GeminiIcon name="wallet" size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Student Referral & Paystack Wallet</h2>
              <p className="text-[10px] font-mono text-slate-400">Earn per invited course mate</p>
            </div>
          </div>
          <Badge variant="emerald" size="sm">Paystack Verified</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Balance Widget */}
          <div className="p-3.5 rounded-xl bg-[#080C14] border border-white/[0.08]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Available Withdrawable Balance</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-white font-mono">
                ₦{(profile.wallet_balance || 0).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-[#1A73E8] to-[#387BFF] text-white text-xs font-semibold hover:opacity-95 transition-all active:scale-95 shadow-[0_0_14px_rgba(56,123,255,0.3)]"
            >
              Withdraw via Paystack
            </button>
          </div>

          {/* Referral Code Box */}
          <div className="p-3.5 rounded-xl bg-[#080C14] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Your Referral Code</span>
              <div className="flex items-center justify-between mt-1 p-2 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <span className="text-sm font-mono font-bold text-[#60A5FA]">
                  {profile.referral_code}
                </span>
                <button
                  onClick={handleCopyReferral}
                  className="flex items-center gap-1 text-[11px] font-mono text-white hover:text-[#60A5FA]"
                >
                  <GeminiIcon name={copiedCode ? 'check' : 'copy'} size={14} />
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-sans">
              Earn ₦500 instantly into your balance for each verified departmental student who activates Cohart Pro.
            </p>
          </div>
        </div>
      </GeminiCard>

      {/* Pinned Timetables & Test Reminders in Profile */}
      <GeminiCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#387BFF]/15 text-[#387BFF]">
              <GeminiIcon name="calendar" size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Pinned Semester Schedule & Test Reminders</h2>
              <p className="text-[10px] font-mono text-slate-400">Continuous Assessment Hub</p>
            </div>
          </div>
          <button
            onClick={onOpenSchedule}
            className="text-xs font-mono text-[#60A5FA] hover:underline"
          >
            Full Timetable &rarr;
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div>
              <span className="font-semibold text-white font-mono">ECO 201 • SLR 1</span>
              <p className="text-[11px] text-slate-400">Mon 08:00 - 10:00 • Principles of Microeconomics II</p>
            </div>
            <Badge variant="blue" size="sm">Core</Badge>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div>
              <span className="font-semibold text-white font-mono">ECO 203 • ETF Hall A</span>
              <p className="text-[11px] text-slate-400">Mon 11:00 - 13:00 • Applied Statistics for Economists</p>
            </div>
            <Badge variant="slate" size="sm">Elective</Badge>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-500/[0.05] border border-blue-500/25 text-[#93C5FD]">
            <div className="flex items-center gap-2">
              <GeminiIcon name="clock" size={15} className="text-[#387BFF]" />
              <div>
                <span className="font-semibold text-white">First In-Class Test: ECO 201</span>
                <p className="text-[11px] text-slate-400">Scheduled for October 18 at SMS Lecture Theatre 1</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#60A5FA]">In 14 days</span>
          </div>
        </div>
      </GeminiCard>

      {/* AI Diagnostic Questionnaire Modal */}
      {showQuestionnaire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0A0E1A] border border-blue-500/30 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.8)] animate-in fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GeminiIcon name="sparkle" size={16} className="text-[#387BFF]" />
                <h3 className="text-sm font-bold text-white">
                  Cognitive Tuning (Question {qStep + 1} of {questionnaireQuestions.length})
                </h3>
              </div>
              <button
                onClick={() => setShowQuestionnaire(false)}
                className="text-slate-400 hover:text-white"
              >
                <GeminiIcon name="close" size={16} />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 mb-4 leading-relaxed font-sans">
              {questionnaireQuestions[qStep].q}
            </p>

            <div className="space-y-2">
              {questionnaireQuestions[qStep].options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => handleSelectQuestionnaireOption(oIdx)}
                  className="w-full text-left p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-blue-500/50 hover:bg-blue-500/10 text-xs text-slate-200 transition-all font-sans"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Paystack Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0A0E1A] border border-blue-500/30 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.8)] animate-in fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GeminiIcon name="wallet" size={16} className="text-[#387BFF]" />
                <h3 className="text-sm font-bold text-white">Paystack Bank Withdrawal</h3>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <GeminiIcon name="close" size={16} />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="h-10 w-10 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <GeminiIcon name="check" size={20} />
                </div>
                <h4 className="text-sm font-bold text-white">Transfer Initiated</h4>
                <p className="text-xs text-slate-300 font-mono">
                  ₦{withdrawAmount} sent via Paystack to {accountNumber} ({bankName}).
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Amount (NGN)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={profile.wallet_balance}
                    className="w-full mt-1 p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#387BFF]"
                  />
                  <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                    Available: ₦{(profile.wallet_balance || 0).toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Select Bank</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-[#080C14] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#387BFF]"
                  >
                    <option value="Access Bank">Access Bank</option>
                    <option value="GTBank">GTBank (Guaranty Trust)</option>
                    <option value="Zenith Bank">Zenith Bank</option>
                    <option value="Kuda Bank">Kuda Microfinance Bank</option>
                    <option value="OPay">OPay Digital Services</option>
                    <option value="Moniepoint">Moniepoint MFB</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Account Number (10 digits)</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    maxLength={10}
                    className="w-full mt-1 p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#387BFF] font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    disabled={isWithdrawing}
                    onClick={handleExecuteWithdrawal}
                    className="w-full py-2.5 rounded-xl bg-[#387BFF] text-white text-xs font-semibold hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-2"
                  >
                    {isWithdrawing && (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    )}
                    <span>{isWithdrawing ? 'Processing Paystack Payout...' : 'Confirm Transfer'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

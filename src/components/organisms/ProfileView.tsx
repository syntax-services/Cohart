'use client';

import React, { useState } from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile, LearningStyle } from '@/lib/types';
import { useTheme, Theme } from '@/components/ThemeProvider';

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
  const { theme, setTheme } = useTheme();
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
    <div className="space-y-4 sm:space-y-5">
      {/* Student Profile Identity Card */}
      <GeminiCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] font-mono text-sm font-bold text-white dark:text-neutral-950">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold text-neutral-900 dark:text-white font-sans">
                  {profile.full_name}
                </h1>
                {profile.is_verified_coordinator && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-300">
                    Dept Rep
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-0.5">
                {profile.matric_number} • {profile.department} • {profile.level}
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-sans">
                {profile.institution}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingBasic(!isEditingBasic)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <span>{isEditingBasic ? 'Done' : 'Edit'}</span>
          </button>
        </div>

        {/* Quick Details Inline Editor */}
        {isEditingBasic && (
          <div className="mt-4 pt-4 border-t border-black/[0.06] dark:border-white/[0.07] grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
            <div>
              <label className="text-[10px] font-mono text-neutral-500 uppercase">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-neutral-500 uppercase">Matric Number</label>
              <input
                type="text"
                value={matric}
                onChange={(e) => setMatric(e.target.value)}
                className="w-full mt-1 p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-neutral-500 uppercase">Department</label>
              <input
                type="text"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full mt-1 p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-neutral-500 uppercase">Academic Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full mt-1 p-2 rounded-xl bg-neutral-50 dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
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
                className="px-4 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-medium hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </GeminiCard>

      {/* App Appearance & Theme Selection Card */}
      <GeminiCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
              <GeminiIcon name="sun" size={15} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Theme & Appearance</h2>
              <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                Choose theme or sync with system
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['system', 'light', 'dark'] as Theme[]).map((mode) => {
            const isSelected = theme === mode;
            return (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={`py-2 px-3 rounded-xl border text-xs font-sans capitalize transition-all text-center ${
                  isSelected
                    ? 'bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/15 border-[#0B57D0] dark:border-[#A8C7FA] text-[#0B57D0] dark:text-[#A8C7FA] font-medium'
                    : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {mode === 'system' ? 'System' : mode}
              </button>
            );
          })}
        </div>
      </GeminiCard>

      {/* Cognitive Profile & Learning Style Section */}
      <GeminiCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
              <GeminiIcon name="brain" size={15} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Cognitive Traits</h2>
              <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                Tuned: {profile.learning_style.replace('_', ' ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowQuestionnaire(true)}
            className="text-xs font-mono text-[#0B57D0] dark:text-[#A8C7FA] hover:underline"
          >
            Retake Quiz
          </button>
        </div>

        {/* Cognitive Traits Selector Chips */}
        <div className="flex flex-wrap gap-1.5">
          {cognitiveTraitOptions.map((trait) => {
            const isSelected = profile.cognitive_traits.includes(trait);
            return (
              <button
                key={trait}
                onClick={() => handleToggleTrait(trait)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/15 border border-[#0B57D0]/30 dark:border-[#A8C7FA]/30 text-[#0B57D0] dark:text-[#A8C7FA] font-medium'
                    : 'bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {isSelected && <GeminiIcon name="check" size={12} className="text-[#0B57D0] dark:text-[#A8C7FA]" />}
                <span>{trait}</span>
              </button>
            );
          })}
        </div>
      </GeminiCard>

      {/* Referral Program & Paystack Wallet Card */}
      <GeminiCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
              <GeminiIcon name="wallet" size={15} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Referral Balance</h2>
              <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Earn per invited student</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Balance Widget */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06]">
            <span className="text-[10px] font-mono text-neutral-500 uppercase">Balance</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">
                ₦{(profile.wallet_balance || 0).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="mt-3 w-full py-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Withdraw
            </button>
          </div>

          {/* Referral Code Box */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">Referral Code</span>
              <div className="flex items-center justify-between mt-1 p-2 rounded-xl bg-white dark:bg-[#1E1F20] border border-black/[0.06] dark:border-white/[0.06]">
                <span className="text-sm font-mono font-bold text-[#0B57D0] dark:text-[#A8C7FA]">
                  {profile.referral_code}
                </span>
                <button
                  onClick={handleCopyReferral}
                  className="flex items-center gap-1 text-[11px] font-mono text-neutral-700 dark:text-neutral-300 hover:text-[#0B57D0] dark:hover:text-[#A8C7FA]"
                >
                  <GeminiIcon name={copiedCode ? 'check' : 'copy'} size={13} />
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 font-sans">
              ₦500 bonus credited for each course mate who signs up with your code.
            </p>
          </div>
        </div>
      </GeminiCard>

      {/* Pinned Timetables & Test Reminders in Profile */}
      <GeminiCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
              <GeminiIcon name="calendar" size={15} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Pinned Schedule & Test Reminders</h2>
              <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Continuous Assessment Hub</p>
            </div>
          </div>
          <button
            onClick={onOpenSchedule}
            className="text-xs font-mono text-[#0B57D0] dark:text-[#A8C7FA] hover:underline"
          >
            Full Timetable &rarr;
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
            <div>
              <span className="font-medium text-neutral-900 dark:text-neutral-100 font-mono">ECO 201 • SLR 1</span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Mon 08:00 - 10:00 • Principles of Microeconomics II</p>
            </div>
            <Badge variant="blue" size="sm">Core</Badge>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05]">
            <div>
              <span className="font-medium text-neutral-900 dark:text-neutral-100 font-mono">ECO 203 • ETF Hall A</span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Mon 11:00 - 13:00 • Applied Statistics for Economists</p>
            </div>
            <Badge variant="slate" size="sm">Elective</Badge>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B57D0]/[0.04] dark:bg-[#A8C7FA]/[0.06] border border-[#0B57D0]/20 dark:border-[#A8C7FA]/20 text-[#0B57D0] dark:text-[#A8C7FA]">
            <div className="flex items-center gap-2">
              <GeminiIcon name="clock" size={14} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
              <div>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">First In-Class Test: ECO 201</span>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Scheduled for October 18 at SMS Lecture Theatre 1</p>
              </div>
            </div>
            <span className="text-[11px] font-mono">In 14 days</span>
          </div>
        </div>
      </GeminiCard>

      {/* AI Diagnostic Questionnaire Modal */}
      {showQuestionnaire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.1] p-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GeminiIcon name="sparkle" size={15} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Cognitive Tuning (Question {qStep + 1} of {questionnaireQuestions.length})
                </h3>
              </div>
              <button
                onClick={() => setShowQuestionnaire(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <GeminiIcon name="close" size={15} />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 mb-4 leading-relaxed font-sans">
              {questionnaireQuestions[qStep].q}
            </p>

            <div className="space-y-2">
              {questionnaireQuestions[qStep].options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => handleSelectQuestionnaireOption(oIdx)}
                  className="w-full text-left p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] hover:border-[#0B57D0] dark:hover:border-[#A8C7FA] hover:bg-[#0B57D0]/5 dark:hover:bg-[#A8C7FA]/10 text-xs text-neutral-800 dark:text-neutral-200 transition-all font-sans"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.1] p-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GeminiIcon name="wallet" size={15} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Paystack Bank Withdrawal</h3>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <GeminiIcon name="close" size={15} />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="h-10 w-10 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <GeminiIcon name="check" size={18} />
                </div>
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Transfer Initiated</h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-mono">
                  ₦{withdrawAmount} sent via Paystack to {accountNumber} ({bankName}).
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase">Amount (NGN)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={profile.wallet_balance}
                    className="w-full mt-1 p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
                  />
                  <span className="text-[10px] font-mono text-neutral-500 mt-0.5 block">
                    Available: ₦{(profile.wallet_balance || 0).toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase">Select Bank</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-neutral-50 dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
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
                  <label className="text-[10px] font-mono text-neutral-500 uppercase">Account Number (10 digits)</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    maxLength={10}
                    className="w-full mt-1 p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    disabled={isWithdrawing}
                    onClick={handleExecuteWithdrawal}
                    className="w-full py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    {isWithdrawing && (
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-white dark:border-neutral-950 border-t-transparent animate-spin" />
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

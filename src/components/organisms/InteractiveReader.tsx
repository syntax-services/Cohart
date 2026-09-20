'use client';

import React, { useState, useMemo } from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { formatBionicText } from '@/lib/bionic';
import { StudentProfile, ReaderChapter, ActiveRecallPrompt } from '@/lib/types';
import { saveExplanation } from '@/lib/supabase';

const SAMPLE_CHAPTER: ReaderChapter = {
  id: 'chap_eco_201_oligopoly',
  courseCode: 'ECO 201',
  title: 'Cournot Equilibrium & Strategic Interdependence',
  subtitle: 'Microeconomic Theory of Imperfect Competition in Emerging Markets',
  readTimeMinutes: 5,
  paragraphs: [
    'In neoclassical microeconomic theory, oligopoly represents a market structure dominated by a small number of strategic firms. Unlike pure monopoly where a single firm dictates output, or perfect competition where firms act as passive price-takers, oligopolistic actors must anticipate their rivals’ operational decisions.',
    'Augustin Cournot formalized this strategic interdependence by modeling firms that simultaneously choose quantities rather than prices. Each firm assumes that its competitor’s chosen quantity remains constant when determining its own profit-maximizing output schedule.',
    'In developing economies such as Nigeria, the cement and telecommunications sectors offer tangible empirical manifestations of Cournot dynamics. When a dominant producer evaluates expanding milling capacity in Ogun State, its marginal revenue curve shifts based on the expected supply volume of competing conglomerates.',
    'The mathematical intersection of these individual reaction curves yields the Cournot-Nash Equilibrium. At this point, no single enterprise possesses an economic incentive to unilaterally alter its production quota, establishing a stable yet sub-optimal collective output compared to competitive efficiency.',
    'A central policy implication is the deadweight welfare loss imposed on consumers. Price remains systematically elevated above marginal cost, leading regulatory bodies like the Federal Competition and Consumer Protection Commission (FCCPC) to monitor collusive tendencies and price-fixing syndicates.',
  ],
  checkpoints: [
    {
      id: 'chk_1',
      paragraphIndex: 2,
      prompt: 'Quick Recall: Under the Cournot model, what is the primary decision variable firms choose simultaneously?',
      options: [
        'Retail selling prices',
        'Output production quantities',
        'Advertising budgets',
        'Dividend payouts',
      ],
      correctIndex: 1,
      explanation:
        'Correct. In Cournot competition, firms simultaneously select output quantities, whereas in Bertrand competition they compete on price.',
    },
    {
      id: 'chk_2',
      paragraphIndex: 4,
      prompt: 'Recall Check: What occurs at the mathematical intersection of the reaction curves?',
      options: [
        'Pure monopoly pricing',
        'Cournot-Nash Equilibrium',
        'Zero-profit exit',
        'Perfect market clearing',
      ],
      correctIndex: 1,
      explanation:
        'Exactly. The intersection represents the Cournot-Nash equilibrium where mutual best responses intersect and neither firm has incentive to deviate.',
    },
  ],
};

interface InteractiveReaderProps {
  profile: StudentProfile;
}

export const InteractiveReader: React.FC<InteractiveReaderProps> = ({ profile }) => {
  const [isBionic, setIsBionic] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [selectedText, setSelectedText] = useState<string>('');
  const [showAiSheet, setShowAiSheet] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Active recall state
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  // Context chat
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([
    {
      role: 'assistant',
      text: `Hello ${profile.full_name.split(' ')[0]}. I have loaded your personal reading profile with '${profile.learning_style.replace('_', ' ')}' mode. Highlight any sentence to receive an analogy-driven breakdown.`,
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');

  // Handle native text selection
  const handleMouseUp = () => {
    if (typeof window !== 'undefined') {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text && text.length > 5) {
        setSelectedText(text);
      }
    }
  };

  // AI highlight-to-explain trigger tailored to student cognitive style
  const handleExplainSelection = async (textToExplain?: string) => {
    const text = textToExplain || selectedText;
    if (!text) return;

    setShowAiSheet(true);
    setIsExplaining(true);
    setAiExplanation(null);
    setIsSaved(false);

    // Context-aware explanation simulation tuned to student traits
    setTimeout(() => {
      let customExplanation = '';
      if (profile.learning_style === 'visual_analogies') {
        customExplanation = `Analogy for "${text.slice(0, 45)}...": Think of two competing bus drivers at OOU Ago-Iwoye Main Gate. If driver A knows driver B is loading 30 passengers, driver A calculates how many empty seats remain on the route. Both drivers adjust their vehicle schedules based on what the other does until both routes are filled. In economics, that balance point is the Cournot equilibrium.`;
      } else {
        customExplanation = `Core concept breakdown: In Cournot competition, market price is not fixed by one entity. Instead, firm A and firm B determine their capacity independently. Because each firm accounts for the rival's output, equilibrium price sits between monopoly and competitive levels.`;
      }
      setAiExplanation(customExplanation);
      setIsExplaining(false);
    }, 600);
  };

  const handleSaveToVault = async () => {
    if (!aiExplanation || !selectedText) return;
    await saveExplanation({
      course_code: SAMPLE_CHAPTER.courseCode,
      selected_text: selectedText,
      ai_explanation: aiExplanation,
      context_topic: SAMPLE_CHAPTER.title,
    });
    setIsSaved(true);
  };

  const handleSendChat = () => {
    if (!inputQuestion.trim()) return;
    const query = inputQuestion;
    setInputQuestion('');
    setChatMessages((prev) => [...prev, { role: 'user', text: query }]);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `In relation to ${SAMPLE_CHAPTER.courseCode}: When analyzing '${query}', remember that firm output decisions depend directly on rival assumptions. At Cournot equilibrium, the reaction curves r₁(q₂) and r₂(q₁) cross, so both firms are optimizing simultaneously.`,
        },
      ]);
    }, 500);
  };

  const fontSizeClasses = {
    sm: 'text-xs leading-relaxed',
    md: 'text-sm leading-relaxed',
    lg: 'text-base leading-loose',
  };

  return (
    <div className="space-y-5">
      {/* Reader Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-[#080C14] border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-[#60A5FA]">
              {SAMPLE_CHAPTER.courseCode}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] font-mono text-slate-400">
              {SAMPLE_CHAPTER.readTimeMinutes} min read
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] font-mono text-slate-400">
              {profile.reading_speed_wpm} WPM Paced
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans">
            {SAMPLE_CHAPTER.title}
          </h1>
          <p className="text-xs text-slate-400">{SAMPLE_CHAPTER.subtitle}</p>
        </div>

        {/* Reader Customizer Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Bionic Toggle */}
          <button
            onClick={() => setIsBionic(!isBionic)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all ${
              isBionic
                ? 'bg-gradient-to-r from-[#1A73E8] to-[#387BFF] text-white shadow-[0_0_14px_rgba(56,123,255,0.3)]'
                : 'bg-white/[0.04] text-slate-300 border border-white/[0.08] hover:border-white/[0.15]'
            }`}
          >
            <GeminiIcon name="zap" size={14} />
            <span>Bionic {isBionic ? 'Active' : 'Off'}</span>
          </button>

          {/* Font Sizing */}
          <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-0.5 text-xs font-mono">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-1 rounded-lg ${
                fontSize === 'sm' ? 'bg-[#387BFF]/20 text-[#60A5FA]' : 'text-slate-400'
              }`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('md')}
              className={`px-2 py-1 rounded-lg ${
                fontSize === 'md' ? 'bg-[#387BFF]/20 text-[#60A5FA]' : 'text-slate-400'
              }`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-1 rounded-lg ${
                fontSize === 'lg' ? 'bg-[#387BFF]/20 text-[#60A5FA]' : 'text-slate-400'
              }`}
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Floating Highlight Action Capsule when text is selected */}
      {selectedText && (
        <div className="sticky top-20 z-30 flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0C1424]/95 border border-[#387BFF]/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(56,123,255,0.25)] animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 overflow-hidden text-xs">
            <GeminiIcon name="sparkle" size={16} className="text-[#387BFF] shrink-0" />
            <span className="text-slate-300 font-sans truncate">
              "{selectedText.slice(0, 45)}..."
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleExplainSelection()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#387BFF] text-white text-xs font-semibold hover:bg-[#2563EB] transition-colors"
            >
              <span>Explain with AI</span>
            </button>
            <button
              onClick={() => setSelectedText('')}
              className="p-1.5 text-slate-400 hover:text-white"
            >
              <GeminiIcon name="close" size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Main Chapter Text Layout */}
      <GeminiCard className="p-5 sm:p-7">
        <div
          onMouseUp={handleMouseUp}
          className={`space-y-5 text-slate-300 font-sans ${fontSizeClasses[fontSize]}`}
        >
          {SAMPLE_CHAPTER.paragraphs.map((para, index) => {
            const checkpoint = SAMPLE_CHAPTER.checkpoints.find(
              (c) => c.paragraphIndex === index
            );

            return (
              <React.Fragment key={index}>
                <p className="tracking-normal select-text">
                  {isBionic ? (
                    <span>
                      {formatBionicText(para).map((token) => (
                        <span key={token.id} className="inline">
                          <strong className="font-bold text-white font-sans">
                            {token.bold}
                          </strong>
                          <span className="text-slate-300 font-normal">
                            {token.regular}
                          </span>
                        </span>
                      ))}
                    </span>
                  ) : (
                    para
                  )}
                </p>

                {/* Non-intrusive Active Recall Checkpoint */}
                {checkpoint && (
                  <div className="my-6 p-4 rounded-xl bg-[#080E1A] border border-[#387BFF]/30 shadow-[0_0_20px_rgba(56,123,255,0.08)]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#387BFF]/15 text-[#387BFF]">
                        <GeminiIcon name="brain" size={12} />
                      </div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#60A5FA]">
                        Active Recall Checkpoint
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-white mb-3">
                      {checkpoint.prompt}
                    </p>

                    <div className="space-y-2">
                      {checkpoint.options.map((opt, oIdx) => {
                        const isSelected = answers[checkpoint.id] === oIdx;
                        const isCorrect = oIdx === checkpoint.correctIndex;
                        const isRev = revealed[checkpoint.id];

                        let btnStyle = 'bg-white/[0.03] border-white/[0.08] text-slate-300';
                        if (isRev) {
                          if (isCorrect) {
                            btnStyle = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300';
                          } else if (isSelected) {
                            btnStyle = 'bg-rose-500/15 border-rose-500/40 text-rose-300';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-blue-500/20 border-blue-500/50 text-white';
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={isRev}
                            onClick={() => {
                              setAnswers((prev) => ({ ...prev, [checkpoint.id]: oIdx }));
                              setRevealed((prev) => ({ ...prev, [checkpoint.id]: true }));
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border text-xs font-sans transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {isRev && isCorrect && (
                              <GeminiIcon name="check" size={14} className="text-emerald-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {revealed[checkpoint.id] && (
                      <p className="mt-2.5 text-[11px] text-[#93C5FD] font-mono leading-relaxed">
                        {checkpoint.explanation}
                      </p>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Highlight Helper Tip */}
        <div className="mt-8 pt-4 border-t border-white/[0.07] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <GeminiIcon name="highlight" size={14} className="text-[#387BFF]" />
            <span>Select any sentence to explain with your cognitive AI style</span>
          </div>
          <span className="text-[#60A5FA]">Chapter 4 Completed</span>
        </div>
      </GeminiCard>

      {/* AI Explanation Bottom Drawer / Modal */}
      {showAiSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3">
          <div className="w-full max-w-lg rounded-2xl bg-[#0A0F1D] border border-blue-500/30 p-5 shadow-[0_16px_50px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#387BFF]/20 text-[#387BFF]">
                  <GeminiIcon name="sparkle" size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cohart Personalized Insight</h3>
                  <p className="text-[10px] font-mono text-slate-400">
                    Adapted to: {profile.learning_style.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiSheet(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
              >
                <GeminiIcon name="close" size={16} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-300 mb-3 italic">
              "{selectedText}"
            </div>

            <div className="min-h-[100px] text-xs sm:text-sm text-slate-200 leading-relaxed font-sans mb-4">
              {isExplaining ? (
                <div className="flex items-center gap-2 text-slate-400 py-6 justify-center">
                  <div className="h-4 w-4 rounded-full border-2 border-[#387BFF] border-t-transparent animate-spin" />
                  <span className="font-mono text-xs">Synthesizing personalized analogy...</span>
                </div>
              ) : (
                aiExplanation
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.07]">
              <button
                onClick={handleSaveToVault}
                disabled={isSaved || isExplaining}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
                  isSaved
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/[0.05] border border-white/[0.1] text-slate-300 hover:text-white'
                }`}
              >
                <GeminiIcon name={isSaved ? 'check' : 'copy'} size={14} />
                <span>{isSaved ? 'Saved to Vault' : 'Save to Study Vault'}</span>
              </button>

              <button
                onClick={() => setShowAiSheet(false)}
                className="px-4 py-2 rounded-xl bg-[#387BFF] text-white text-xs font-semibold hover:bg-[#2563EB] transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Socratic Dialogue Section */}
      <GeminiCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#387BFF]/15 text-[#387BFF]">
              <GeminiIcon name="chat" size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Context Discussion with Cohart AI</h3>
              <p className="text-[10px] font-mono text-slate-400">Contextual to {SAMPLE_CHAPTER.courseCode}</p>
            </div>
          </div>
          <Badge variant="blue" size="sm">Course Aware</Badge>
        </div>

        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 mb-3">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl text-xs font-sans leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-500/15 border border-blue-500/30 text-white ml-6'
                  : 'bg-white/[0.02] border border-white/[0.06] text-slate-300 mr-6'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-500 mb-0.5">
                {msg.role === 'user' ? 'You' : 'Cohart Tutor'}
              </div>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
            placeholder="Ask about Cournot reaction curves, Nash points..."
            className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#387BFF]/50"
          />
          <button
            onClick={handleSendChat}
            className="p-2 rounded-xl bg-[#387BFF] text-white hover:bg-[#2563EB] transition-colors"
          >
            <GeminiIcon name="arrow-right" size={16} />
          </button>
        </div>
      </GeminiCard>
    </div>
  );
};

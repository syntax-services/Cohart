'use client';

import React, { useState } from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { formatBionicText } from '@/lib/bionic';
import { StudentProfile, ReaderChapter } from '@/lib/types';
import { saveExplanation } from '@/lib/supabase';

import { CampusAiAssistant } from './CampusAiAssistant';

const TOPIC_1: ReaderChapter = {
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

const TOPIC_2: ReaderChapter = {
  id: 'chap_eco_201_bertrand',
  courseCode: 'ECO 201',
  title: 'Bertrand Price Competition & The Bertrand Paradox',
  subtitle: 'Price War Dynamics, Homogeneous Products & Marginal Cost Equilibrium',
  readTimeMinutes: 4,
  paragraphs: [
    'Joseph Bertrand presented a critical alternative to Cournot by stipulating that firms in an oligopoly compete on price rather than output quantities. When consumers view products as identical and have zero switching costs, they purchase exclusively from the firm offering the lower price.',
    'This pricing dynamic triggers a fierce downward price-cutting spiral. If Firm A charges even slightly higher than Firm B, Firm A faces zero consumer demand, creating continuous incentives for each firm to undercut its competitor.',
    'The theoretical equilibrium terminates when both firms set price equal to marginal cost (P = MC). This conclusion is famously termed the "Bertrand Paradox": even with as few as two firms in the industry, the market replicates the perfectly competitive pricing outcome with zero economic profit.',
    'In real-world Nigerian markets, this paradox is resolved by capacity constraints, brand differentiation, consumer loyalty, and geographic transportation frictions, enabling firms to sustain positive profit margins.',
  ],
  checkpoints: [
    {
      id: 'chk_b1',
      paragraphIndex: 2,
      prompt: 'Quick Recall: What is the outcome of the Bertrand Paradox with homogeneous goods?',
      options: [
        'Both firms charge monopoly prices',
        'Price equals marginal cost (P = MC) with zero economic profit',
        'Firms divide the market into geographical cartels',
        'Both firms merge into a conglomerate',
      ],
      correctIndex: 1,
      explanation:
        'Correct. The Bertrand Paradox demonstrates that price drops down to marginal cost, yielding zero economic profit even with only two firms.',
    },
  ],
};

interface InteractiveReaderProps {
  profile: StudentProfile;
  onLocateVenue?: (code: string) => void;
}

export const InteractiveReader: React.FC<InteractiveReaderProps> = ({ profile, onLocateVenue }) => {
  const [activeView, setActiveView] = useState<'reader' | 'ai'>('reader');
  const [activeTopicIndex, setActiveTopicIndex] = useState<0 | 1>(0);
  const currentChapter = activeTopicIndex === 0 ? TOPIC_1 : TOPIC_2;

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
      text: `Hello ${profile.full_name.split(' ')[0]}. Loaded your personal reading profile with '${profile.learning_style.replace('_', ' ')}' mode. Highlight any sentence to receive a personalized breakdown.`,
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

  const handleExplainSelection = async (textToExplain?: string) => {
    const text = textToExplain || selectedText;
    if (!text) return;

    setShowAiSheet(true);
    setIsExplaining(true);
    setAiExplanation(null);
    setIsSaved(false);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: 'reader_explanation',
          highlightedText: text,
          prompt: `Break this down with a real-world Nigerian/OOU analogy for a ${profile.department} student.`,
          studentProfile: profile,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiExplanation(data.reply);
      } else {
        const err = await res.json().catch(() => ({}));
        setAiExplanation(err.error || 'Temporarily unable to generate AI breakdown. Please retry.');
      }
    } catch {
      setAiExplanation('Network error connecting to AI engine. Please verify your internet connection.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSaveToVault = async () => {
    if (!aiExplanation || !selectedText) return;
    await saveExplanation({
      course_code: currentChapter.courseCode,
      selected_text: selectedText,
      ai_explanation: aiExplanation,
      context_topic: currentChapter.title,
    });
    setIsSaved(true);
  };

  const handleSendChat = async () => {
    if (!inputQuestion.trim()) return;

    const q = inputQuestion;
    setInputQuestion('');
    setChatMessages((prev) => [...prev, { role: 'user', text: q }]);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: 'reader_explanation',
          highlightedText: selectedText || currentChapter.title,
          prompt: q,
          studentProfile: profile,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        const err = await res.json().catch(() => ({}));
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', text: err.error || 'AI response failed. Please retry.' },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Network connection issue. Please retry.' },
      ]);
    }
  };

  const fontSizeClasses = {
    sm: 'text-xs leading-relaxed',
    md: 'text-sm leading-relaxed',
    lg: 'text-base leading-loose',
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Segmented Mode Selector: Course Reader vs Campus AI */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.08]">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveView('reader')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeView === 'reader'
                ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <GeminiIcon name="reader" size={14} />
            <span>Course Reader (Early Prep)</span>
          </button>

          <button
            onClick={() => setActiveView('ai')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeView === 'ai'
                ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <GeminiIcon name="sparkle" size={14} />
            <span>Campus AI Assistant</span>
          </button>
        </div>
      </div>

      {activeView === 'ai' ? (
        <CampusAiAssistant profile={profile} onSelectVenue={onLocateVenue} />
      ) : (
        <>
          {/* 2-Topic Prep Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setActiveTopicIndex(0)}
              className={`px-3.5 py-1.5 rounded-full font-mono transition-all shrink-0 ${
                activeTopicIndex === 0
                  ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-semibold'
                  : 'bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Topic 1: Cournot Oligopoly
            </button>
            <button
              onClick={() => setActiveTopicIndex(1)}
              className={`px-3.5 py-1.5 rounded-full font-mono transition-all shrink-0 ${
                activeTopicIndex === 1
                  ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-semibold'
                  : 'bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Topic 2: Bertrand Price War
            </button>
          </div>

          {/* Reader Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.08] transition-colors">
            <div>
              <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                {currentChapter.courseCode} • {currentChapter.readTimeMinutes} min read
              </span>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-900 dark:text-white font-sans mt-0.5">
                {currentChapter.title}
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{currentChapter.subtitle}</p>
            </div>

            {/* Reader Customizer Actions */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* Bionic Toggle */}
              <button
                onClick={() => setIsBionic(!isBionic)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-colors ${
                  isBionic
                    ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-medium'
                    : 'bg-black/[0.03] dark:bg-white/[0.04] text-neutral-700 dark:text-neutral-300 border border-black/[0.06] dark:border-white/[0.08]'
                }`}
              >
                <span>Bionic: {isBionic ? 'On' : 'Off'}</span>
              </button>

              {/* Font Sizing */}
              <div className="flex items-center bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] rounded-full p-0.5 text-xs font-mono">
                <button
                  onClick={() => setFontSize('sm')}
                  className={`px-2.5 py-0.5 rounded-full transition-colors ${
                    fontSize === 'sm' ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-xs font-medium' : 'text-neutral-500'
                  }`}
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize('md')}
                  className={`px-2.5 py-0.5 rounded-full transition-colors ${
                    fontSize === 'md' ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-xs font-medium' : 'text-neutral-500'
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize('lg')}
                  className={`px-2.5 py-0.5 rounded-full transition-colors ${
                    fontSize === 'lg' ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#A8C7FA] shadow-xs font-medium' : 'text-neutral-500'
                  }`}
                >
                  A+
                </button>
              </div>
            </div>
          </div>

          {/* Floating Highlight Action Capsule when text is selected */}
          {selectedText && (
            <div className="sticky top-16 z-30 flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-[#1E1F20]/95 border border-black/[0.1] dark:border-white/[0.1] backdrop-blur-md shadow-md animate-in fade-in">
              <div className="flex items-center gap-2 overflow-hidden text-xs">
                <span className="text-neutral-800 dark:text-neutral-200 font-sans truncate">
                  "{selectedText.slice(0, 40)}..."
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleExplainSelection()}
                  className="px-3.5 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  Explain
                </button>
                <button
                  onClick={() => setSelectedText('')}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                >
                  <GeminiIcon name="close" size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Main Chapter Text Layout */}
          <GeminiCard className="p-5 sm:p-7">
            <div
              onMouseUp={handleMouseUp}
              className={`space-y-5 text-neutral-800 dark:text-neutral-200 font-sans ${fontSizeClasses[fontSize]}`}
            >
              {currentChapter.paragraphs.map((para, index) => {
                const checkpoint = currentChapter.checkpoints.find(
                  (c) => c.paragraphIndex === index
                );

                return (
                  <React.Fragment key={index}>
                    <p className="tracking-normal select-text">
                      {isBionic ? (
                        <span>
                          {formatBionicText(para).map((token) => (
                            <span key={token.id} className="inline">
                              <strong className="font-semibold text-neutral-950 dark:text-white">
                                {token.bold}
                              </strong>
                              {token.regular}{token.space ? ' ' : ''}
                            </span>
                          ))}
                        </span>
                      ) : (
                        para
                      )}
                    </p>

                    {/* Checkpoint recall quiz */}
                    {checkpoint && (
                      <div className="my-5 p-4 rounded-2xl bg-[#0B57D0]/[0.03] dark:bg-[#A8C7FA]/[0.05] border border-[#0B57D0]/20 dark:border-[#A8C7FA]/20 text-xs">
                        <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-[#0B57D0] dark:text-[#A8C7FA]">
                          <GeminiIcon name="sparkle" size={14} />
                          <span>Active Recall Checkpoint</span>
                        </div>
                        <p className="font-medium text-neutral-900 dark:text-white mb-3">
                          {checkpoint.prompt}
                        </p>

                        <div className="space-y-2">
                          {checkpoint.options.map((opt, oIdx) => {
                            const isAnswered = answers[checkpoint.id] === oIdx;
                            const isCorrect = checkpoint.correctIndex === oIdx;
                            const showResult = revealed[checkpoint.id];

                            let btnStyle = 'bg-white dark:bg-white/[0.04] border-black/[0.08] dark:border-white/[0.08]';
                            if (showResult && isCorrect) {
                              btnStyle = 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-400 text-emerald-900 dark:text-emerald-300';
                            } else if (showResult && isAnswered && !isCorrect) {
                              btnStyle = 'bg-rose-50 dark:bg-rose-500/20 border-rose-400 text-rose-900 dark:text-rose-300';
                            }

                            return (
                              <button
                                key={oIdx}
                                onClick={() => {
                                  setAnswers((prev) => ({ ...prev, [checkpoint.id]: oIdx }));
                                  setRevealed((prev) => ({ ...prev, [checkpoint.id]: true }));
                                }}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {revealed[checkpoint.id] && (
                          <p className="mt-2.5 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                            {checkpoint.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </GeminiCard>

          {/* AI Explanation Modal */}
          {showAiSheet && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-3">
              <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.1] p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                      <GeminiIcon name="sparkle" size={15} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Cohart Personalized Insight</h3>
                      <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                        Adapted to: {profile.learning_style.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAiSheet(false)}
                    className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    <GeminiIcon name="close" size={15} />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-black/[0.2] border border-black/[0.06] dark:border-white/[0.06] text-xs text-neutral-600 dark:text-neutral-300 mb-3 italic">
                  "{selectedText}"
                </div>

                <div className="min-h-[90px] text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans mb-4">
                  {isExplaining ? (
                    <div className="flex items-center gap-2 text-neutral-500 py-6 justify-center">
                      <div className="h-4 w-4 rounded-full border-2 border-[#0B57D0] dark:border-[#A8C7FA] border-t-transparent animate-spin" />
                      <span className="font-mono text-xs">Synthesizing personalized analogy...</span>
                    </div>
                  ) : (
                    aiExplanation
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-black/[0.06] dark:border-white/[0.07]">
                  <button
                    onClick={handleSaveToVault}
                    disabled={isSaved || isExplaining}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                      isSaved
                        ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                        : 'bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08] text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
                    }`}
                  >
                    <GeminiIcon name={isSaved ? 'check' : 'copy'} size={13} />
                    <span>{isSaved ? 'Saved to Vault' : 'Save to Study Vault'}</span>
                  </button>

                  <button
                    onClick={() => setShowAiSheet(false)}
                    className="px-4 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    Got It
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Socratic Dialogue Section */}
          <GeminiCard>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                  <GeminiIcon name="chat" size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Ask Course AI</h3>
                  <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">{currentChapter.courseCode} Q&A</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-3">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl text-xs font-sans leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/15 text-neutral-900 dark:text-white ml-6'
                      : 'bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] text-neutral-700 dark:text-neutral-300 mr-6'
                  }`}
                >
                  <div className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mb-0.5">
                    {msg.role === 'user' ? 'You' : 'Cohart'}
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
                placeholder="Ask about reactions, Cournot vs Bertrand..."
                className="flex-1 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] px-3.5 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
              />
              <button
                onClick={handleSendChat}
                className="p-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 hover:opacity-90 transition-opacity"
              >
                <GeminiIcon name="arrow-right" size={15} />
              </button>
            </div>
          </GeminiCard>
        </>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { formatBionicText } from '@/lib/bionic';
import { StudentProfile, ReaderChapter, SavedExplanation, COHART_VOICES, DEFAULT_COHART_VOICE } from '@/lib/types';
import { saveExplanation, fetchSavedExplanations, deleteSavedExplanation } from '@/lib/supabase';

import { CampusAiAssistant } from './CampusAiAssistant';

const TOPIC_1: ReaderChapter = {
  id: 'chap_eco_201_oligopoly',
  courseCode: 'ECO 201',
  title: 'Cournot Competition: How a Few Big Companies Compete',
  subtitle: 'How rival companies choose how much to produce by watching each other',
  readTimeMinutes: 4,
  paragraphs: [
    'In business and economics, an oligopoly simply means a market where only a few big companies control everything. Unlike a monopoly where one single company is in charge, or a regular market where hundreds of small traders sell, here the few big companies must carefully watch what each other is doing before making any move.',
    'An economist named Augustin Cournot explained this simply: instead of fighting only on prices, companies choose how much goods (quantity) to produce at the same time. Each company looks at how much its rival is likely to produce, and then decides its own best production amount to make maximum profit.',
    'We see this in Nigeria every day with cement and telecom companies. Think of MTN and Airtel, or Dangote Cement and BUA. If Dangote decides to produce 10,000 bags of cement in Ogun State, BUA looks at that amount and decides how many bags they should supply so the market is not overflooded and prices do not crash.',
    'When each company\'s decision balances out and neither of them wants to change how much they are producing, economists call this the Cournot Equilibrium. At this point, the market stays stable, but consumers usually pay higher prices than if there were many small competitors.',
    'Because there are only a few big players, they often keep prices higher than what it actually costs to make the product. That is why government consumer protection agencies watch these big companies closely to make sure they do not secretly agree to cheat buyers or fix high prices.',
  ],
  checkpoints: [
    {
      id: 'chk_1',
      paragraphIndex: 2,
      prompt: 'Quick Check: In Cournot competition, what do the companies choose at the same time?',
      options: [
        'The retail selling price',
        'How much goods (quantity) to produce',
        'Their advertising budget',
        'Their office address',
      ],
      correctIndex: 1,
      explanation:
        'Correct! In Cournot competition, companies choose their production quantities at the same time, while in Bertrand competition they compete directly on prices.',
    },
    {
      id: 'chk_2',
      paragraphIndex: 4,
      prompt: 'Quick Check: What happens when the companies reach the Cournot Equilibrium?',
      options: [
        'Both companies secretly merge',
        'They reach a balance where neither company wants to change its production amount',
        'Prices drop to zero naira',
        'Both companies close down',
      ],
      correctIndex: 1,
      explanation:
        'Correct! At the Cournot Equilibrium, each company is producing its best amount given what the rival produces, so neither has any reason to change.',
    },
  ],
};

const TOPIC_2: ReaderChapter = {
  id: 'chap_eco_201_bertrand',
  courseCode: 'ECO 201',
  title: 'Bertrand Competition: Direct Price Wars Between Rivals',
  subtitle: 'What happens when companies fight by cutting prices to win customers',
  readTimeMinutes: 4,
  paragraphs: [
    'Another economist named Joseph Bertrand had a different idea from Cournot. He said that in many markets, companies do not fight over how much to produce—they fight directly over prices. When two companies sell the exact same product and it costs buyers nothing to switch, buyers will always rush to whoever sells cheaper.',
    'This leads to a direct price war. If Company A sells pure water or data subscriptions slightly cheaper than Company B, almost all customers will leave Company B and buy from Company A. So Company B is forced to drop its price even lower to survive.',
    'If this price war continues, both companies will keep cutting prices until the price drops all the way down to what it actually costs them to make the product (Marginal Cost). At this point, profit becomes zero. Economists call this the "Bertrand Paradox" because even though there are only two companies, the price ends up as low as in a market with a thousand sellers.',
    'In real Nigerian markets, companies usually avoid this zero-profit trap by making their products a bit different, building brand trust, offering better customer service, or because people live closer to one shop than another.',
  ],
  checkpoints: [
    {
      id: 'chk_b1',
      paragraphIndex: 2,
      prompt: 'Quick Check: What happens in a pure Bertrand price war if both companies sell the exact same product?',
      options: [
        'Both companies charge monopoly prices',
        'Prices drop down to the actual cost of production, leaving zero profit',
        'One company buys the whole state',
        'Customers stop buying completely',
      ],
      correctIndex: 1,
      explanation:
        'Correct! In a pure Bertrand price war, intense price cuts push the selling price all the way down to the cost of production (P = MC).',
    },
  ],
};

interface InteractiveReaderProps {
  profile: StudentProfile;
  onLocateVenue?: (code: string) => void;
  onAiModeChange?: (isAi: boolean) => void;
  onMilestoneAction?: (actionId: string) => void;
  onUpdateProfile?: (updated: Partial<StudentProfile>) => void;
}

export const InteractiveReader: React.FC<InteractiveReaderProps> = ({
  profile,
  onLocateVenue,
  onAiModeChange,
  onMilestoneAction,
  onUpdateProfile,
}) => {
  const [activeView, setActiveView] = useState<'reader' | 'ai' | 'vault'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cohart_reader_view');
      if (saved === 'ai' || saved === 'vault') return saved;
    }
    return 'reader';
  });

  const [activeAiMode, setActiveAiMode] = useState<'general' | 'grill_mode'>('general');
  const [activeAiPrompt, setActiveAiPrompt] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cohart_reader_view', activeView);
    }
    onAiModeChange?.(activeView === 'ai');
  }, [activeView, onAiModeChange]);

  const [activeTopicIndex, setActiveTopicIndex] = useState<0 | 1>(0);
  const currentChapter = activeTopicIndex === 0 ? TOPIC_1 : TOPIC_2;

  const [isBionic, setIsBionic] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [showAiSheet, setShowAiSheet] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Deepgram Audio Reader State
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cohart_selected_voice') || DEFAULT_COHART_VOICE;
    }
    return DEFAULT_COHART_VOICE;
  });
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState(false);
  const readerAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleToggleReadAloud = async () => {
    if (isPlayingAudio) {
      if (readerAudioRef.current) {
        readerAudioRef.current.pause();
        readerAudioRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    if (readerAudioRef.current) {
      readerAudioRef.current.pause();
      readerAudioRef.current = null;
    }

    setIsSynthesizingAudio(true);
    try {
      const fullText = `${currentChapter.title}. ${currentChapter.paragraphs.join(' ')}`;
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText, voiceId: selectedVoice }),
      });

      if (!res.ok) throw new Error('Audio synthesis failed');

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      readerAudioRef.current = audio;

      audio.onplay = () => {
        setIsSynthesizingAudio(false);
        setIsPlayingAudio(true);
      };

      audio.onended = () => {
        setIsPlayingAudio(false);
        readerAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSynthesizingAudio(false);
        setIsPlayingAudio(false);
        readerAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      console.error('Audio playback failed:', err);
      setIsSynthesizingAudio(false);
      setIsPlayingAudio(false);
    }
  };

  const handleSelectVoice = (voiceId: string) => {
    setSelectedVoice(voiceId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cohart_selected_voice', voiceId);
    }
    setIsVoiceDropdownOpen(false);

    if (readerAudioRef.current) {
      readerAudioRef.current.pause();
      readerAudioRef.current = null;
      setIsPlayingAudio(false);
      setIsSynthesizingAudio(false);
    }

    const voiceObj = COHART_VOICES.find((v) => v.id === voiceId);
    if (voiceObj && voiceObj.audioUrl) {
      try {
        const previewAudio = new Audio(voiceObj.audioUrl);
        readerAudioRef.current = previewAudio;
        previewAudio.play().catch((err) => {
          console.warn('Audio preview autoplay prevented:', err);
        });
        previewAudio.onended = () => {
          readerAudioRef.current = null;
        };
      } catch (err) {
        console.warn('Failed to play local voice preview:', err);
      }
    }
  };

  // Saved explanations vault state
  const [savedExplanations, setSavedExplanations] = useState<SavedExplanation[]>([]);
  const [vaultSearch, setVaultSearch] = useState('');
  const [vaultCourseFilter, setVaultCourseFilter] = useState('ALL');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadVault() {
      const data = await fetchSavedExplanations(profile.id);
      setSavedExplanations(data);
    }
    loadVault();
  }, [profile.id]);

  // Active recall state
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const studentFirstName = profile.full_name?.trim()
    ? profile.full_name.trim().split(' ')[0]
    : 'Scholar';

  // Context chat
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([
    {
      role: 'assistant',
      text: `Hello ${studentFirstName}! Highlight any sentence in the notes above and I will break it down for you in simple English with a practical Nigerian example.`,
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
      let explanation = '';

      // Primary: Call /api/ai
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
          explanation = data.reply;
        }
      } catch {
        // Fallback to Supabase Edge Function
      }

      // Secondary fallback: Direct Supabase AI Edge Function
      if (!explanation) {
        try {
          const edgeRes = await fetch(
            'https://fnqnxdmdyevzavsbfelv.supabase.co/functions/v1/ai',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucW54ZG1keWV2emF2c2JmZWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MTI3NDUsImV4cCI6MjEwNTQ4ODc0NX0.BdJAhqwdSiPbGHCb5d3KbwNHalTlbO1jaqWTgXvVz6A',
              },
              body: JSON.stringify({
                context: 'reader_explanation',
                highlightedText: text,
                prompt: `Break this down with a real-world Nigerian/OOU analogy for a ${profile.department} student.`,
                studentProfile: profile,
              }),
            }
          );
          if (edgeRes.ok) {
            const data = await edgeRes.json();
            explanation = data.reply;
          }
        } catch {
          // Both failed
        }
      }

      setAiExplanation(explanation || 'Unable to generate explanation right now. Please retry in a moment.');
    } catch {
      setAiExplanation('Network error connecting to AI engine. Please verify your connection.');
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSaveToVault = async () => {
    if (!aiExplanation || !selectedText) return;
    const res = await saveExplanation({
      user_id: profile.id,
      course_code: currentChapter.courseCode,
      selected_text: selectedText,
      ai_explanation: aiExplanation,
      context_topic: currentChapter.title,
    });
    if (res) {
      setSavedExplanations((prev) => [res, ...prev.filter((item) => item.id !== res.id)]);
    }
    setIsSaved(true);
  };

  const handleDeleteSavedNote = async (id: string) => {
    await deleteSavedExplanation(id);
    setSavedExplanations((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCopyNote = (note: SavedExplanation) => {
    const textToCopy = `Course: ${note.course_code} - ${note.context_topic || ''}\n\nKey Excerpt:\n"${note.selected_text}"\n\nAI Breakdown:\n${note.ai_explanation}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  const handleSendChat = async () => {
    if (!inputQuestion.trim()) return;

    const q = inputQuestion;
    setInputQuestion('');
    setChatMessages((prev) => [...prev, { role: 'user', text: q }]);

    try {
      let replyText = '';

      // Primary: Call /api/ai
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
          replyText = data.reply;
        }
      } catch {
        // Fallback to Supabase Edge Function
      }

      // Secondary fallback: Direct Supabase AI Edge Function
      if (!replyText) {
        try {
          const edgeRes = await fetch(
            'https://fnqnxdmdyevzavsbfelv.supabase.co/functions/v1/ai',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucW54ZG1keWV2emF2c2JmZWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MTI3NDUsImV4cCI6MjEwNTQ4ODc0NX0.BdJAhqwdSiPbGHCb5d3KbwNHalTlbO1jaqWTgXvVz6A',
              },
              body: JSON.stringify({
                context: 'reader_explanation',
                highlightedText: selectedText || currentChapter.title,
                prompt: q,
                studentProfile: profile,
              }),
            }
          );
          if (edgeRes.ok) {
            const data = await edgeRes.json();
            replyText = data.reply;
          }
        } catch {
          // Both failed
        }
      }

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: replyText || 'Temporarily unable to process response. Please retry.',
        },
      ]);
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

  const availableCourses = React.useMemo(() => {
    const set = new Set<string>();
    savedExplanations.forEach((s) => {
      if (s.course_code) set.add(s.course_code);
    });
    return ['ALL', ...Array.from(set)];
  }, [savedExplanations]);

  const filteredVault = React.useMemo(() => {
    return savedExplanations.filter((item) => {
      const matchesCourse =
        vaultCourseFilter === 'ALL' || item.course_code === vaultCourseFilter;
      const q = vaultSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.selected_text.toLowerCase().includes(q) ||
        item.ai_explanation.toLowerCase().includes(q) ||
        (item.context_topic && item.context_topic.toLowerCase().includes(q));
      return matchesCourse && matchesSearch;
    });
  }, [savedExplanations, vaultCourseFilter, vaultSearch]);

  if (activeView === 'ai') {
    return (
      <div className="h-full w-full">
        <CampusAiAssistant
          profile={profile}
          onSelectVenue={onLocateVenue}
          onMilestoneAction={onMilestoneAction}
          onUpdateProfile={onUpdateProfile}
          initialMode={activeAiMode}
          initialPrompt={activeAiPrompt}
          onExitFullscreen={() => {
            setActiveView('reader');
            setActiveAiMode('general');
            setActiveAiPrompt(undefined);
            onAiModeChange?.(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Compact In-App Style Mode Switcher with Dropdown */}
      <div className="flex items-center justify-between gap-2">
        {/* View Mode Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#1E1F20] text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="Switch View"
          >
            <GeminiIcon
              name={activeView === 'vault' ? 'bookmark' : 'reader'}
              size={14}
              className="text-[#0B57D0] dark:text-[#A8C7FA]"
            />
            <span className="font-semibold capitalize">
              {activeView === 'vault' ? 'Vault' : 'Course Reader'}
            </span>
            <GeminiIcon name="chevron-down" size={12} className="text-neutral-400" />
          </button>

          {isModeDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsModeDropdownOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1.5 w-48 rounded-2xl bg-white/95 dark:bg-[#1E1F20]/95 border border-black/[0.08] dark:border-white/[0.08] shadow-lg backdrop-blur-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1.5 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                  Select Workspace
                </div>
                <button
                  onClick={() => {
                    setActiveView('reader');
                    setIsModeDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeView === 'reader'
                      ? 'bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA] font-semibold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GeminiIcon name="reader" size={13} />
                    <span>Course Reader</span>
                  </div>
                  {activeView === 'reader' && <GeminiIcon name="check" size={12} />}
                </button>

                <button
                  onClick={() => {
                    setActiveView('ai');
                    setIsModeDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <GeminiIcon name="sparkle" size={13} />
                    <span>AI Copilot</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveView('vault');
                    setIsModeDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeView === 'vault'
                      ? 'bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA] font-semibold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <GeminiIcon name="bookmark" size={13} />
                    <span>Saved Notes Vault</span>
                  </div>
                  {savedExplanations.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/[0.06] dark:bg-white/[0.08] text-neutral-600 dark:text-neutral-300">
                      {savedExplanations.length}
                    </span>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Reader Customizer Actions */}
        {activeView === 'reader' && (
          <div className="flex items-center gap-2">
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
        )}
      </div>

      {activeView === 'vault' ? (
        <div className="space-y-4 sm:space-y-5">
          {/* Vault Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.08] transition-colors">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  {profile.institution} • {profile.department}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-900 dark:text-white font-sans">
                Saved Study Notes & Explanations
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Simple explanations and practical examples you saved while reading
              </p>
            </div>

            <Badge variant="blue" size="sm" className="self-start sm:self-auto">
              {filteredVault.length} {filteredVault.length === 1 ? 'Saved Note' : 'Saved Notes'}
            </Badge>
          </div>

          {/* Filter Bar: Course Pills & Search */}
          <GeminiCard className="p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Course Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {availableCourses.map((c) => (
                  <button
                    key={c}
                    onClick={() => setVaultCourseFilter(c)}
                    className={`px-3 py-1 rounded-full font-mono text-xs transition-all cursor-pointer shrink-0 ${
                      vaultCourseFilter === c
                        ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-semibold'
                        : 'bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {c === 'ALL' ? 'All Courses' : c}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64 shrink-0">
                <input
                  type="text"
                  value={vaultSearch}
                  onChange={(e) => setVaultSearch(e.target.value)}
                  placeholder="Filter saved notes..."
                  className="w-full rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <GeminiIcon name="search" size={13} />
                </div>
              </div>
            </div>
          </GeminiCard>

          {/* Vault Cards Stream */}
          {filteredVault.length === 0 ? (
            <GeminiCard className="p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                <GeminiIcon name="bookmark" size={22} />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white font-sans">
                {savedExplanations.length === 0 ? 'Your AI Vault is Empty' : 'No Matching Notes'}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                {savedExplanations.length === 0
                  ? 'While reading chapters in the Course Reader, highlight any complex paragraph and tap "Save to Vault". Your personalized real-world breakdowns will be permanently stored here for quick exam revision.'
                  : `No notes found matching "${vaultSearch}". Try a different keyword or switch to All Courses.`}
              </p>
              {savedExplanations.length === 0 && (
                <div className="pt-2">
                  <button
                    onClick={() => setActiveView('reader')}
                    className="px-4 py-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-medium hover:opacity-90 transition-all active:scale-95 cursor-pointer"
                  >
                    Open Course Reader &rarr;
                  </button>
                </div>
              )}
            </GeminiCard>
          ) : (
            <div className="space-y-3.5">
              {filteredVault.map((item) => (
                <GeminiCard key={item.id} className="p-4 sm:p-5 space-y-3">
                  {/* Note Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                        {item.course_code}
                      </span>
                      {item.context_topic && (
                        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                          {item.context_topic}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 shrink-0">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  {/* Quoted Selection */}
                  <div className="pl-3 py-1 border-l-2 border-[#0B57D0] dark:border-[#A8C7FA] bg-black/[0.015] dark:bg-white/[0.02] rounded-r-lg">
                    <p className="text-xs italic text-neutral-600 dark:text-neutral-300 font-serif leading-relaxed">
                      &ldquo;{item.selected_text}&rdquo;
                    </p>
                  </div>

                  {/* AI Explanation Content */}
                  <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-3 border border-black/[0.05] dark:border-white/[0.05]">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#0B57D0] dark:text-[#A8C7FA] mb-1.5">
                      <GeminiIcon name="sparkle" size={13} />
                      <span>AI Concept Breakdown</span>
                    </div>
                    <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line font-sans">
                      {item.ai_explanation}
                    </p>
                  </div>

                  {/* Note Action Toolbar */}
                  <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleCopyNote(item)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        copiedNoteId === item.id
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      <GeminiIcon name={copiedNoteId === item.id ? 'check' : 'copy'} size={13} />
                      <span>{copiedNoteId === item.id ? 'Copied to Clipboard' : 'Copy Note'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteSavedNote(item.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remove note from vault"
                    >
                      <GeminiIcon name="trash" size={14} />
                    </button>
                  </div>
                </GeminiCard>
              ))}
            </div>
          )}
        </div>
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
              Topic 1: Cournot (Output)
            </button>
            <button
              onClick={() => setActiveTopicIndex(1)}
              className={`px-3.5 py-1.5 rounded-full font-mono transition-all shrink-0 ${
                activeTopicIndex === 1
                  ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-semibold'
                  : 'bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Topic 2: Bertrand (Price War)
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
              {/* Listen to Chapter Audio (Deepgram Aura-2) */}
              <div className="relative flex items-center gap-1">
                <button
                  onClick={handleToggleReadAloud}
                  disabled={isSynthesizingAudio}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all active:scale-95 cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-rose-500 text-white font-medium shadow-sm'
                      : isSynthesizingAudio
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      : 'bg-black/[0.03] dark:bg-white/[0.04] text-neutral-700 dark:text-neutral-300 border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
                  }`}
                  title={isPlayingAudio ? 'Stop reading' : 'Read chapter aloud with Cohart AI Voice'}
                >
                  {isSynthesizingAudio ? (
                    <GeminiIcon name="loader" size={13} />
                  ) : isPlayingAudio ? (
                    <GeminiIcon name="volume-x" size={13} />
                  ) : (
                    <GeminiIcon name="volume" size={13} />
                  )}
                  <span>{isPlayingAudio ? 'Stop' : isSynthesizingAudio ? 'Synthesizing...' : 'Listen'}</span>
                </button>

                {/* Voice Selection Pill */}
                <button
                  onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                  className="p-1.5 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                  title="Choose reading voice"
                >
                  <GeminiIcon name="chevron-down" size={12} />
                </button>

                {isVoiceDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[99]"
                      onClick={() => setIsVoiceDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 w-64 max-h-72 overflow-y-auto rounded-2xl bg-white/95 dark:bg-[#1E1F20]/95 border border-black/[0.08] dark:border-white/[0.08] shadow-xl backdrop-blur-xl p-1.5 z-[100] animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-2.5 py-1 text-[10px] font-mono text-neutral-400 uppercase tracking-wider border-b border-black/[0.06] dark:border-white/[0.08] mb-1">
                        Reader Voice (Aura-2)
                      </div>
                      <div className="space-y-0.5">
                        {COHART_VOICES.map((v) => (
                          <button
                            key={v.id}
                            onClick={() => handleSelectVoice(v.id)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                              selectedVoice === v.id
                                ? 'bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/15 text-[#0B57D0] dark:text-[#A8C7FA] font-medium'
                                : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                            }`}
                          >
                            <span className="truncate">{v.label}</span>
                            {selectedVoice === v.id && (
                              <GeminiIcon name="check" size={12} className="text-[#0B57D0] dark:text-[#A8C7FA] shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

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
                          <span>Quick Practice Question</span>
                        </div>
                        <p className="font-medium text-neutral-900 dark:text-white mb-3">
                          {checkpoint.prompt}
                        </p>

                        <div className="space-y-2">
                          {checkpoint.options.map((opt, oIdx) => {
                            const isAnswered = answers[checkpoint.id] === oIdx;
                            const isCorrect = checkpoint.correctIndex === oIdx;
                            const isLocked = revealed[checkpoint.id] === true;

                            let btnStyle = 'bg-white dark:bg-white/[0.04] border-black/[0.08] dark:border-white/[0.08] hover:border-[#0B57D0]/50';
                            if (isLocked) {
                              if (isCorrect) {
                                btnStyle = 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-semibold cursor-default';
                              } else if (isAnswered) {
                                btnStyle = 'bg-rose-50 dark:bg-rose-500/20 border-rose-500 text-rose-900 dark:text-rose-300 line-through cursor-default';
                              } else {
                                btnStyle = 'opacity-40 border-black/[0.04] dark:border-white/[0.04] text-neutral-400 cursor-default';
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={isLocked}
                                onClick={() => {
                                  if (isLocked) return;
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
                          <div className="mt-2.5 pt-2 border-t border-black/[0.05] dark:border-white/[0.05] text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                            {checkpoint.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Chapter Mastery & Exam Readiness Assessment Score Banner */}
              {(() => {
                const totalCheckpoints = currentChapter.checkpoints.length;
                const answeredCheckpoints = currentChapter.checkpoints.filter((c) => revealed[c.id]);
                const correctCheckpoints = currentChapter.checkpoints.filter((c) => answers[c.id] === c.correctIndex);
                const isChapterCompleted = answeredCheckpoints.length === totalCheckpoints;

                if (!isChapterCompleted) return null;

                return (
                  <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.08] animate-in fade-in">
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0B57D0]/[0.08] via-purple-500/[0.04] to-emerald-500/[0.08] border border-[#0B57D0]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0B57D0]/15 text-[#0B57D0] dark:text-[#A8C7FA] font-bold">
                            Chapter Completed
                          </span>
                          <span className="text-xs font-mono font-semibold text-neutral-900 dark:text-white">
                            Score: {correctCheckpoints.length} / {totalCheckpoints} ({Math.round((correctCheckpoints.length / totalCheckpoints) * 100)}%)
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                          {correctCheckpoints.length === totalCheckpoints ? 'Great job! You mastered this topic.' : 'Chapter Finished'}
                        </h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                          {correctCheckpoints.length === totalCheckpoints
                            ? 'You got all questions right. You are ready to practice real exam questions.'
                            : 'Check through the answers above to understand where you missed marks, or test yourself with AI.'}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveAiMode('grill_mode');
                          setActiveAiPrompt(`I completed the chapter "${currentChapter.title}" with a score of ${correctCheckpoints.length}/${totalCheckpoints}. Test me with OOU exam questions on this topic!`);
                          setActiveView('ai');
                          onMilestoneAction?.('reader_quiz');
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        <GeminiIcon name="zap" size={14} />
                        <span>Practice Exam Questions with AI</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
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
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Simple Explanation</h3>
                      <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                        Teaching style: {profile.learning_style.replace('_', ' ')}
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
                      <span className="font-mono text-xs">Breaking this down in simple words...</span>
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
                    <span>{isSaved ? 'Saved to Vault' : 'Save This Note'}</span>
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
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Ask About This Chapter</h3>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                placeholder="Ask any question about this topic in simple English..."
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

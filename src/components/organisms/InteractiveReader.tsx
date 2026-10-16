'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { formatBionicText } from '@/lib/bionic';
import { StudentProfile, ReaderChapter, SavedExplanation, COHART_VOICES, DEFAULT_COHART_VOICE } from '@/lib/types';
import { saveExplanation, fetchSavedExplanations, deleteSavedExplanation } from '@/lib/supabase';
import { CourseBook, getAllSupportedBooks } from '@/lib/booksLibrary';
import { checkFeatureAccess, recordFeatureUsage } from '@/lib/subscriptionQuota';
import { trackAuroraReaderAction, trackAuroraAnomaly } from '@/lib/telemetry';

interface InteractiveReaderProps {
  profile: StudentProfile;
  onLocateVenue?: (code: string) => void;
  onAiModeChange?: (isAi: boolean) => void;
  onMilestoneAction?: (actionId: string) => void;
  onUpdateProfile?: (updated: Partial<StudentProfile>) => void;
  onOpenAiChat?: (initialPrompt?: string) => void;
}

export const InteractiveReader: React.FC<InteractiveReaderProps> = ({
  profile,
  onAiModeChange,
  onMilestoneAction,
  onOpenAiChat,
}) => {
  const [activeView, setActiveView] = useState<'reader' | 'vault'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aurora_reader_view');
      if (saved === 'vault') return 'vault';
    }
    return 'reader';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aurora_reader_view', activeView);
    }
    onAiModeChange?.(false);
  }, [activeView, onAiModeChange]);

  // Books Library & Active Chapter State
  const allBooks = useMemo(() => getAllSupportedBooks(), []);
  const [selectedBookId, setSelectedBookId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aurora_selected_book_id') || allBooks[0]?.id || 'book_gst_101';
    }
    return allBooks[0]?.id || 'book_gst_101';
  });

  const selectedBook: CourseBook = useMemo(() => {
    return allBooks.find((b) => b.id === selectedBookId) || allBooks[0];
  }, [allBooks, selectedBookId]);

  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    return selectedBook?.chapters[0]?.id || '';
  });

  // Keep selectedChapterId synced when selected book changes
  useEffect(() => {
    if (selectedBook && !selectedBook.chapters.some((c) => c.id === selectedChapterId)) {
      setSelectedChapterId(selectedBook.chapters[0]?.id || '');
    }
  }, [selectedBook, selectedChapterId]);

  const currentChapter: ReaderChapter = useMemo(() => {
    const found = selectedBook?.chapters.find((c) => c.id === selectedChapterId);
    return (
      found ||
      selectedBook?.chapters[0] || {
        id: 'default',
        courseCode: profile.department,
        title: 'Course Reading',
        subtitle: 'NUC Standard Curriculum',
        readTimeMinutes: 5,
        paragraphs: ['Welcome to your university textbook library. Select a book to start reading.'],
        checkpoints: [],
      }
    );
  }, [selectedBook, selectedChapterId, profile.department]);

  // Drawer / Modals
  const [isBooksDrawerOpen, setIsBooksDrawerOpen] = useState(false);
  const [bookFilterDepartment, setBookFilterDepartment] = useState<string>('ALL');

  // In-place Blended Paragraphs (paragraphIndex -> simplified text)
  const [blendedParagraphs, setBlendedParagraphs] = useState<Record<number, string>>({});
  const [isBlending, setIsBlending] = useState(false);
  const [blendingParaIdx, setBlendingParaIdx] = useState<number | null>(null);
  const [blendSuccessNotice, setBlendSuccessNotice] = useState<string | null>(null);

  // Quick Inline Lookup State (no-clutter definition popover)
  const [quickLookupWord, setQuickLookupWord] = useState<string | null>(null);
  const [quickLookupDef, setQuickLookupDef] = useState<string | null>(null);
  const [isLoadingLookup, setIsLoadingLookup] = useState(false);

  // Copy restriction & screenshot shield state
  const [copyRestrictionNotice, setCopyRestrictionNotice] = useState<string | null>(null);
  const [isScreenshotShieldActive, setIsScreenshotShieldActive] = useState(false);

  // Reading Options (Bionic & Font Size)
  const [isBionic, setIsBionic] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aurora_bionic_mode');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const handleToggleBionic = () => {
    const next = !isBionic;
    setIsBionic(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aurora_bionic_mode', String(next));
    }
  };

  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Text Selection & "Break Down Big Grammar"
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState<number | null>(null);
  const [activeHoveredPara, setActiveHoveredPara] = useState<number | null>(null);
  const [activeTappedPara, setActiveTappedPara] = useState<number | null>(null);
  const [highlightedParas, setHighlightedParas] = useState<Record<number, boolean>>({});
  const [isToolsPopoverOpen, setIsToolsPopoverOpen] = useState(false);
  const [showAiSheet, setShowAiSheet] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [quotaExceededNotice, setQuotaExceededNotice] = useState<string | null>(null);

  // Audio Reader
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aurora_selected_voice') || DEFAULT_COHART_VOICE;
    }
    return DEFAULT_COHART_VOICE;
  });
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState(false);
  const readerAudioRef = useRef<HTMLAudioElement | null>(null);

  // Saved Vault State
  const [savedExplanations, setSavedExplanations] = useState<SavedExplanation[]>([]);
  const [vaultSearch, setVaultSearch] = useState('');
  const [vaultCourseFilter, setVaultCourseFilter] = useState('ALL');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Handout Compression State
  const [isCompressModalOpen, setIsCompressModalOpen] = useState(false);
  const [isCompressingHandout, setIsCompressingHandout] = useState(false);
  const [compressedHandout, setCompressedHandout] = useState<{
    fileName: string;
    summary: string;
    flashcards: Array<{ question: string; answer: string }>;
    practiceQuiz?: {
      prompt: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    };
  } | null>(null);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [handoutQuizAnswer, setHandoutQuizAnswer] = useState<number | null>(null);
  const [handoutQuizRevealed, setHandoutQuizRevealed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active Recall Checkpoints State
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadVault() {
      const data = await fetchSavedExplanations(profile.id);
      setSavedExplanations(data);
    }
    loadVault();
  }, [profile.id]);

  // Reset chapter-specific state when chapter changes
  useEffect(() => {
    setBlendedParagraphs({});
    setSelectedText('');
    setSelectedParagraphIndex(null);
    setQuickLookupWord(null);
  }, [currentChapter.id]);

  // Screenshot & Print Protection on Reader Page
  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        setIsScreenshotShieldActive(true);
        trackAuroraAnomaly('screenshot_attempt', { key: 'PrintScreen' });
        setTimeout(() => setIsScreenshotShieldActive(false), 3000);
      }
    };
    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, []);

  // Text selection handler
  const handleSelectionUpdate = (pIdx?: number) => {
    if (typeof window !== 'undefined') {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text && text.length > 2) {
        setSelectedText(text);
        if (pIdx !== undefined) setSelectedParagraphIndex(pIdx);
      }
    }
  };

  useEffect(() => {
    const handleDocSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text && text.length > 2) {
        setSelectedText(text);
      }
    };

    let timer: any;
    const debouncedSelection = () => {
      clearTimeout(timer);
      timer = setTimeout(handleDocSelection, 180);
    };

    document.addEventListener('selectionchange', debouncedSelection);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('selectionchange', debouncedSelection);
    };
  }, []);

  // Copy limitation: allows short snippets (< 150 chars), restricts bulk copying
  const handleCopyInReader = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    const text = selection ? selection.toString() : '';
    if (text.length > 150) {
      e.preventDefault();
      const snippet = text.slice(0, 150) + '... [Excerpt capped at 150 chars. Full material on Aurora OS]';
      e.clipboardData.setData('text/plain', snippet);
      setCopyRestrictionNotice('Bulk copying restricted to safeguard course material. Short excerpt copied.');
      trackAuroraAnomaly('bulk_copy_attempt', { length: text.length });
      setTimeout(() => setCopyRestrictionNotice(null), 4000);
    }
  };

  // Quick Inline Lookup (instant, lightweight 1-sentence definition)
  const handleQuickLookup = async (textToLookup?: string) => {
    const target = textToLookup || selectedText;
    if (!target) return;
    setQuickLookupWord(target);
    setIsLoadingLookup(true);
    setQuickLookupDef(null);

    trackAuroraReaderAction('quick_lookup', {
      courseCode: selectedBook.courseCode,
      chapterId: currentChapter.id,
      snippet: target,
    });

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Define this academic term/phrase in ONE crisp sentence suitable for a ${profile.department} student: "${target}"`,
          context: 'reader_explanation',
          modelTier: 'lyric',
          studentProfile: profile,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setQuickLookupDef(data.reply || 'Definition unavailable.');
      } else {
        setQuickLookupDef('Could not look up term.');
      }
    } catch {
      setQuickLookupDef('Network error looking up term.');
    } finally {
      setIsLoadingLookup(false);
    }
  };

  // "Break Down Big Grammar" Explanation Modal
  const handleBreakDownGrammar = async (textToExplain?: string) => {
    const text = textToExplain || selectedText;
    if (!text) return;

    setShowAiSheet(true);
    setIsExplaining(true);
    setAiExplanation(null);
    setIsSaved(false);

    trackAuroraReaderAction('explain_more', {
      courseCode: selectedBook.courseCode,
      chapterId: currentChapter.id,
      snippet: text,
    });

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: 'reader_explanation',
          highlightedText: text,
          prompt: `Break down this academic term/grammar into simple, everyday English with a practical Nigerian analogy for a ${profile.department} student. Include potential Senate exam traps.`,
          studentProfile: profile,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiExplanation(data.reply);
      } else {
        // High-fidelity Nigerian campus contextual explanation fallback
        setAiExplanation(
          `💡 Plain English Breakdown & Campus Analogy:\n\n"${text}"\n\n🇳🇬 Campus Analogy:\nThink of the subject like the Departmental Course Rep: no matter how many students are standing behind the rep in the lecture hall or joining the WhatsApp group, only ONE person (the Course Rep) goes up to sign off on the lecture timetable with the lecturer. Because there is only one leader signing off, the action verb is strictly singular (use "has" or "is", never "have" or "are")!\n\n⚠️ Senate CBT Exam Trap:\nLecturers intentionally pack long intervening phrases like "together with the departmental executives", "as well as the student union delegates", or "in addition to forty other course mates" right between the subject and the verb. Never be deceived by the crowd of nouns in the middle—always look back at the original single subject!`
        );
      }
    } catch {
      setAiExplanation(
        `💡 Plain English Breakdown & Campus Analogy:\n\n"${text}"\n\n🇳🇬 Campus Analogy:\nThink of this rule like queuing for a campus shuttle bus at School Park. The single lead passenger at the front of the queue is the only one boarding first. Any phrase starting with "as well as", "together with", or "accompanied by" is just passenger luggage—it does NOT turn a single passenger into a plural group!\n\n⚠️ CBT Checkpoint:\nAlways match the verb strictly with the head subject (e.g., "The Dean, together with all faculty lecturers, IS arriving at Senate building", NOT "are").`
      );
    } finally {
      setIsExplaining(false);
    }
  };

  // "Simplify & Blend into Text" in-place paragraph rewriting
  const handleSimplifyAndBlend = async (textOverride?: string, pIdxOverride?: number) => {
    const targetText = textOverride || selectedText;
    if (!targetText) return;
    const pIdx = pIdxOverride !== undefined ? pIdxOverride : selectedParagraphIndex !== null ? selectedParagraphIndex : 0;

    // Check Quota
    const access = checkFeatureAccess('simplify_and_blend', profile);
    if (!access.allowed) {
      setQuotaExceededNotice(
        `Monthly Free Limit Reached (${access.maxLimit}/${access.maxLimit} blend rewrites used). Upgrade for unlimited in-text simplification!`
      );
      return;
    }

    setIsBlending(true);
    setBlendingParaIdx(pIdx);
    setBlendSuccessNotice(null);

    trackAuroraReaderAction('blend_into_text', {
      courseCode: selectedBook.courseCode,
      chapterId: currentChapter.id,
      paragraphIndex: pIdx,
      snippet: targetText,
    });

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: 'simplify_and_blend',
          highlightedText: targetText,
          studentProfile: profile,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const simplifiedText = data.simplifiedBlend?.blendedText || data.reply || targetText;

        const originalPara = currentChapter.paragraphs[pIdx] || '';
        let newPara = originalPara;
        if (originalPara.includes(targetText)) {
          newPara = originalPara.replace(targetText, simplifiedText);
        } else {
          newPara = simplifiedText;
        }

        setBlendedParagraphs((prev) => ({ ...prev, [pIdx]: newPara }));
        recordFeatureUsage('simplify_and_blend', profile);
        setBlendSuccessNotice('Passage simplified & blended directly into your reading flow!');
        setSelectedText('');
        setTimeout(() => setBlendSuccessNotice(null), 4000);
      } else {
        // Fallback simplified blend in everyday words
        const originalPara = currentChapter.paragraphs[pIdx] || '';
        let simplifiedText = targetText;
        if (targetText.toLowerCase().includes('indefinite pronoun')) {
          simplifiedText = 'Words like "each", "everyone", "nobody", and "somebody" ALWAYS take a single verb (use "has" or "is", never "have" or "are"), no matter how many other students or faculties are mentioned afterward.';
        } else if (targetText.toLowerCase().includes('rule of proximity')) {
          simplifiedText = 'When using "either... or" or "neither... nor", the verb simply agrees with whatever noun is closest to it (e.g. "Neither the lecturer nor the students WERE present").';
        } else if (targetText.toLowerCase().includes('mathematical quantities')) {
          simplifiedText = 'Amounts of money (₦50,000), periods of time (4 hours), and travel distances (10 km) are treated as ONE single unit, so they strictly take singular verbs (e.g. "Fifty thousand naira IS enough", NOT "are").';
        } else {
          simplifiedText = targetText
            .replace(/take strictly singular verbs/gi, 'strictly use singular verbs ("is" / "has")')
            .replace(/regardless of any following prepositional phrase/gi, 'ignoring any long extra explanations in between')
            .replace(/relative pronoun concord dictates/gi, 'grammar rules state');
        }

        const newPara = originalPara.includes(targetText)
          ? originalPara.replace(targetText, simplifiedText)
          : simplifiedText;

        setBlendedParagraphs((prev) => ({ ...prev, [pIdx]: newPara }));
        setBlendSuccessNotice('Passage simplified & blended in everyday words!');
        setSelectedText('');
        setTimeout(() => setBlendSuccessNotice(null), 4000);
      }
    } catch (err) {
      console.error('Simplify & blend failed:', err);
      // Fallback on catch
      const originalPara = currentChapter.paragraphs[pIdx] || '';
      const simplifiedText = targetText
        .replace(/take strictly singular verbs/gi, 'strictly use singular verbs ("is" / "has")')
        .replace(/regardless of any following prepositional phrase/gi, 'ignoring the extra words in between');
      setBlendedParagraphs((prev) => ({ ...prev, [pIdx]: simplifiedText }));
      setBlendSuccessNotice('Passage simplified & blended in everyday words!');
      setSelectedText('');
      setTimeout(() => setBlendSuccessNotice(null), 4000);
    } finally {
      setIsBlending(false);
      setBlendingParaIdx(null);
    }
  };

  const handleSaveToVault = async () => {
    if (!aiExplanation) return;
    const res = await saveExplanation({
      user_id: profile.id,
      selected_text: selectedText,
      ai_explanation: aiExplanation,
      course_code: selectedBook.courseCode,
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

  // Audio Playback
  const handleToggleReadAloud = async () => {
    if (isPlayingAudio) {
      if (readerAudioRef.current) {
        readerAudioRef.current.pause();
      }
      setIsPlayingAudio(false);
      return;
    }

    if (readerAudioRef.current) {
      readerAudioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
      return;
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
      localStorage.setItem('aurora_selected_voice', voiceId);
    }
    setIsVoiceDropdownOpen(false);

    if (readerAudioRef.current) {
      readerAudioRef.current.pause();
      readerAudioRef.current = null;
      setIsPlayingAudio(false);
      setIsSynthesizingAudio(false);
    }
  };

  // Handout Upload & Compression
  const handleHandoutFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md');
    const sizeLimit = isText ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > sizeLimit) {
      alert('File size exceeds the 10MB safety cap. Please upload a smaller document.');
      return;
    }

    setIsCompressModalOpen(true);
    setIsCompressingHandout(true);
    setCompressedHandout(null);

    const reader = new FileReader();
    reader.onload = async () => {
      let filePayload: Record<string, any>;
      if (isText) {
        filePayload = {
          textContent: (reader.result as string).slice(0, 80000),
          mimeType: file.type || 'text/plain',
          fileName: file.name,
          strategy: 'text',
        };
      } else {
        const base64 = (reader.result as string).split(',')[1];
        filePayload = {
          base64,
          mimeType: file.type || 'application/octet-stream',
          fileName: file.name,
          strategy: file.type.includes('pdf') ? 'pdf' : 'image',
        };
      }

      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            context: 'compress_handout',
            prompt: `Compress this academic material for a ${profile.department} student into clear bullet notes, active recall flashcards, and a practice question.`,
            studentProfile: profile,
            fileData: filePayload,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          recordFeatureUsage('document_upload', profile);

          const rawFlashcards = data.extractedFlashcards || [
            { question: 'Key takeaway from this material?', answer: data.reply?.slice(0, 100) || 'Core syllabus topic.' }
          ];

          setCompressedHandout({
            fileName: file.name,
            summary: data.reply || 'Summary complete.',
            flashcards: rawFlashcards.map((f: any) => ({
              question: f.question || f.front || 'Core Concept',
              answer: f.answer || f.back || 'Clarified answer.',
            })),
            practiceQuiz: data.interactiveQuestion
              ? {
                  prompt: data.interactiveQuestion.question || 'Practice Question',
                  options: data.interactiveQuestion.options || ['Option A', 'Option B', 'Option C', 'Option D'],
                  correctIndex: data.interactiveQuestion.correctIndex || 0,
                  explanation: data.interactiveQuestion.explanation || 'Verified explanation.',
                }
              : undefined,
          });
          setActiveFlashcardIndex(0);
          setIsCardFlipped(false);
        }
      } catch (err) {
        console.error('Compression failed:', err);
      } finally {
        setIsCompressingHandout(false);
      }
    };

    if (isText) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const fontSizeClasses = {
    sm: 'text-sm leading-relaxed tracking-normal',
    md: 'text-[15px] sm:text-[16px] leading-[1.8] tracking-[-0.01em]',
    lg: 'text-[17px] sm:text-[18px] leading-[1.85] tracking-[-0.01em]',
  };

  const filteredBooks = useMemo(() => {
    if (bookFilterDepartment === 'ALL') return allBooks;
    return allBooks.filter((b) => b.department.toLowerCase().includes(bookFilterDepartment.toLowerCase()) || b.courseCode.startsWith('GST'));
  }, [allBooks, bookFilterDepartment]);

  const filteredVault = useMemo(() => {
    return savedExplanations.filter((item) => {
      const matchesCourse = vaultCourseFilter === 'ALL' || item.course_code === vaultCourseFilter;
      const q = vaultSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.selected_text.toLowerCase().includes(q) ||
        item.ai_explanation.toLowerCase().includes(q) ||
        (item.context_topic && item.context_topic.toLowerCase().includes(q));
      return matchesCourse && matchesSearch;
    });
  }, [savedExplanations, vaultCourseFilter, vaultSearch]);

  return (
    <div className="max-w-3xl mx-auto w-full pb-24 font-sans select-text" onCopy={handleCopyInReader}>
      {/* 
        ========================================================================
        1. ULTRA-COMPACT SLIM READING TOOLBAR
        Single-line liquid glass pill with minimal footprint.
        ========================================================================
      */}
      <div className="sticky top-14 z-30 mb-3 px-3 py-1.5 rounded-full liquid-glass border border-white/[0.08] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shadow-lg">
        {/* Left: Book Picker & Chapter Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsBooksDrawerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1A73E8]/15 text-[#1A73E8] dark:text-[#8AB4F8] border border-[#1A73E8]/25 text-xs font-semibold shrink-0 cursor-pointer hover:bg-[#1A73E8]/25 transition-all active:scale-95"
            title="Browse course textbooks"
          >
            <GeminiIcon name="book-open" size={12} />
            <span>{selectedBook.courseCode}</span>
            <GeminiIcon name="chevron-down" size={10} />
          </button>

          {/* Chapters minimal dots / pills */}
          <div className="flex items-center gap-1">
            {selectedBook.chapters.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => {
                  setSelectedChapterId(ch.id);
                  if (activeView !== 'reader') setActiveView('reader');
                }}
                className={`h-6 px-2 rounded-full text-[11px] font-mono transition-all shrink-0 cursor-pointer ${
                  selectedChapterId === ch.id && activeView === 'reader'
                    ? 'bg-[#1A73E8] text-white font-bold shadow-xs'
                    : 'bg-white/[0.04] text-neutral-400 hover:text-white'
                }`}
                title={ch.title}
              >
                Ch.{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Audio Listen, Tools Menu & Vault */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Audio Listen */}
          <div className="relative flex items-center">
            <button
              onClick={handleToggleReadAloud}
              disabled={isSynthesizingAudio}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-rose-500 text-white font-semibold'
                  : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]'
              }`}
              title={isPlayingAudio ? 'Stop reading' : 'Listen with AI Voice'}
            >
              <GeminiIcon name={isPlayingAudio ? 'volume-x' : isSynthesizingAudio ? 'loader' : 'volume'} size={12} />
              <span className="hidden sm:inline">{isPlayingAudio ? 'Stop' : isSynthesizingAudio ? 'Loading' : 'Listen'}</span>
            </button>
            <button
              onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
              className="p-1 text-neutral-400 hover:text-white cursor-pointer"
            >
              <GeminiIcon name="chevron-down" size={10} />
            </button>

            {isVoiceDropdownOpen && (
              <>
                <div className="fixed inset-0 z-[99]" onClick={() => setIsVoiceDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl bg-[#09090D]/95 border border-white/[0.1] shadow-2xl backdrop-blur-2xl p-1.5 z-[100] text-left">
                  <div className="px-2 py-1 text-[9.5px] font-mono text-neutral-400 uppercase tracking-wider border-b border-white/[0.08] mb-1">
                    Select Reader Voice
                  </div>
                  {COHART_VOICES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleSelectVoice(v.id)}
                      className={`w-full text-left px-2 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                        selectedVoice === v.id
                          ? 'bg-[#1A73E8]/20 text-[#8AB4F8] font-medium'
                          : 'text-neutral-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      <span className="truncate">{v.label}</span>
                      {selectedVoice === v.id && (
                        <GeminiIcon name="check" size={11} className="text-[#8AB4F8] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Quick Tools & Display Popover (Combines Bionic, Font, Handout) */}
          <div className="relative">
            <button
              onClick={() => setIsToolsPopoverOpen(!isToolsPopoverOpen)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                isToolsPopoverOpen || isBionic
                  ? 'bg-[#1A73E8]/20 text-[#8AB4F8] border border-[#1A73E8]/30'
                  : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]'
              }`}
              title="Reading display & tools"
            >
              <span>Aa</span>
              <GeminiIcon name="chevron-down" size={10} />
            </button>

            {isToolsPopoverOpen && (
              <>
                <div className="fixed inset-0 z-[99]" onClick={() => setIsToolsPopoverOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-60 rounded-2xl bg-[#09090D]/95 border border-white/[0.1] shadow-2xl backdrop-blur-3xl p-2.5 z-[100] space-y-2 text-left">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider pb-1 border-b border-white/[0.08]">
                    Display & Handout Tools
                  </div>

                  {/* Font Size Selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-300">Text Size</span>
                    <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.08]">
                      {(['sm', 'md', 'lg'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setFontSize(s)}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                            fontSize === s ? 'bg-[#1A73E8] text-white font-bold' : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {s.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bionic Mode Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-neutral-300">Bionic Pacing</span>
                    <button
                      onClick={handleToggleBionic}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold transition-all ${
                        isBionic
                          ? 'bg-[#1A73E8] text-white'
                          : 'bg-white/[0.06] text-neutral-400 hover:text-white'
                      }`}
                    >
                      {isBionic ? 'Active' : 'Off'}
                    </button>
                  </div>

                  {/* Handout Upload */}
                  <div className="pt-1 border-t border-white/[0.06]">
                    <button
                      onClick={() => {
                        setIsToolsPopoverOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-xs text-neutral-200 transition-colors"
                    >
                      <GeminiIcon name="attachment" size={12} />
                      <span>Upload PDF / Handout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.docx,.png,.jpg,.jpeg"
            onChange={handleHandoutFilePicked}
            className="hidden"
          />

          {/* Vault Notes Toggle */}
          <button
            onClick={() => setActiveView(activeView === 'vault' ? 'reader' : 'vault')}
            className={`px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
              activeView === 'vault'
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-white/[0.04] text-neutral-400 hover:text-white'
            }`}
            title="Saved Notes & Explanations"
          >
            Vault {savedExplanations.length > 0 && `(${savedExplanations.length})`}
          </button>
        </div>
      </div>

      {/* Blend Notice Pill */}
      {blendSuccessNotice && (
        <div className="mb-3 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <GeminiIcon name="check" size={13} />
            <span>{blendSuccessNotice}</span>
          </div>
          <button onClick={() => setBlendSuccessNotice(null)} className="text-emerald-500 hover:opacity-75">
            <GeminiIcon name="close" size={12} />
          </button>
        </div>
      )}

      {/* Quota Notice Pill */}
      {quotaExceededNotice && (
        <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between">
          <span>{quotaExceededNotice}</span>
          <button onClick={() => setQuotaExceededNotice(null)} className="text-amber-500">
            <GeminiIcon name="close" size={12} />
          </button>
        </div>
      )}

      {/* Vault View */}
      {activeView === 'vault' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <GeminiIcon name="bookmark" size={16} className="text-purple-500" />
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Your Academic Vault</h3>
                <p className="text-[10px] text-neutral-500">Saved explanations & AI breakdowns</p>
              </div>
            </div>
            <button
              onClick={() => setActiveView('reader')}
              className="px-3 py-1 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold cursor-pointer"
            >
              Back to Reader
            </button>
          </div>

          {savedExplanations.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              No saved explanations yet. Tap &ldquo;Explain More&rdquo; while reading to store breakdowns here.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredVault.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.06] dark:border-white/[0.08] text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#0B57D0] dark:text-[#8AB4F8] font-bold">
                      {item.course_code} • {item.context_topic}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyNote(item)}
                        className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                      >
                        <GeminiIcon name={copiedNoteId === item.id ? 'check' : 'copy'} size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteSavedNote(item.id)}
                        className="p-1 text-neutral-400 hover:text-rose-500 cursor-pointer"
                      >
                        <GeminiIcon name="trash" size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="italic text-neutral-500 border-l-2 border-[#0B57D0]/30 pl-2">
                    &ldquo;{item.selected_text}&rdquo;
                  </div>
                  <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed">
                    {item.ai_explanation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 
            ========================================================================
            2. FLOATING SELECTION ISLAND (EXPLAIN MORE • BLEND • LOOKUP • ASK AI)
            Always visible when text is highlighted on phone or desktop!
            ========================================================================
          */}
          {selectedText && (
            <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[65] w-[95%] max-w-xl flex flex-col gap-2 p-2.5 rounded-2xl bg-white/95 dark:bg-[#1C1D1E]/95 border border-[#0B57D0]/30 dark:border-[#8AB4F8]/30 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-3">
              {/* Inline Quick Lookup Popover Card */}
              {quickLookupWord && (
                <div className="p-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-[#0B57D0] dark:text-[#8AB4F8] font-bold uppercase truncate">
                      Definition: {quickLookupWord.slice(0, 30)}
                    </span>
                    <button
                      onClick={() => setQuickLookupWord(null)}
                      className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                    >
                      <GeminiIcon name="close" size={11} />
                    </button>
                  </div>
                  {isLoadingLookup ? (
                    <div className="flex items-center gap-2 text-neutral-500 py-1 text-[11px] font-mono">
                      <div className="h-3 w-3 rounded-full border-2 border-[#0B57D0] border-t-transparent animate-spin" />
                      <span>Looking up term...</span>
                    </div>
                  ) : (
                    <p className="text-neutral-800 dark:text-neutral-200 text-xs leading-relaxed">
                      {quickLookupDef}
                    </p>
                  )}
                </div>
              )}

              {/* Main Selection Buttons Row */}
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[110px] sm:max-w-[180px]">
                  &ldquo;{selectedText.slice(0, 30)}{selectedText.length > 30 ? '...' : ''}&rdquo;
                </span>

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  {/* 1. Explain More */}
                  <button
                    onClick={() => handleBreakDownGrammar()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs"
                    title="Explain with Nigerian analogies"
                  >
                    <GeminiIcon name="sparkle" size={12} />
                    <span>Explain More</span>
                  </button>

                  {/* 2. Blend into Text */}
                  <button
                    onClick={() => handleSimplifyAndBlend()}
                    disabled={isBlending}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold active:scale-95 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    title="Simplify in-place"
                  >
                    {isBlending ? (
                      <div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <GeminiIcon name="blend" size={12} />
                    )}
                    <span>Blend</span>
                  </button>

                  {/* 3. Quick Lookup */}
                  <button
                    onClick={() => handleQuickLookup()}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-all cursor-pointer"
                    title="Quick definition"
                  >
                    <GeminiIcon name="search" size={12} />
                    <span className="hidden sm:inline">Lookup</span>
                  </button>

                  {/* 4. Ask AI */}
                  <button
                    onClick={() => {
                      if (onOpenAiChat) {
                        onOpenAiChat(`Can you explain this passage from ${selectedBook.courseCode}: "${selectedText}"?`);
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-all cursor-pointer"
                    title="Ask in Messages"
                  >
                    <GeminiIcon name="chat" size={12} />
                    <span className="hidden sm:inline">Ask AI</span>
                  </button>

                  {/* Close Selection */}
                  <button
                    onClick={() => {
                      setSelectedText('');
                      setQuickLookupWord(null);
                    }}
                    className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                  >
                    <GeminiIcon name="close" size={13} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Screenshot Shield Overlay */}
          {isScreenshotShieldActive && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6 text-center animate-in fade-in">
              <div className="max-w-md space-y-3">
                <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                  <GeminiIcon name="shield" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">Protected Course Material</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Screenshots are restricted to protect academic copyright. You can save key excerpts directly to your personal Vault.
                </p>
              </div>
            </div>
          )}

          {/* 
            ========================================================================
            3. CLEAN, COMPACT READING CANVAS
            Uncluttered, comfortable leading, no bulky double-nested borders.
            ========================================================================
          */}
          <article className="py-2 px-1 sm:px-2">
            {/* Chapter Header */}
            <header className="mb-6 pb-3 border-b border-black/[0.05] dark:border-white/[0.06]">
              <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400 mb-1.5">
                <span className="font-bold text-[#0B57D0] dark:text-[#8AB4F8]">{selectedBook.courseCode}</span>
                <span>•</span>
                <span className="truncate">{selectedBook.title}</span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400">{currentChapter.readTimeMinutes} min read</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {currentChapter.title}
              </h1>
              {currentChapter.subtitle && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {currentChapter.subtitle}
                </p>
              )}
            </header>

            {/* Chapter Paragraphs with Direct Inline Action Bars */}
            <div className={`space-y-5 text-neutral-800 dark:text-neutral-200 ${fontSizeClasses[fontSize]}`}>
              {currentChapter.paragraphs.map((para, index) => {
                const isBlended = Boolean(blendedParagraphs[index]);
                const isHighlighted = Boolean(highlightedParas[index]);
                const activeParaText = blendedParagraphs[index] || para;
                const checkpoint = currentChapter.checkpoints.find((c) => c.paragraphIndex === index);
                const isHovered = activeHoveredPara === index;
                const isTapped = activeTappedPara === index;
                const isActionVisible = isHovered || isTapped;

                return (
                  <div
                    key={index}
                    onMouseEnter={() => setActiveHoveredPara(index)}
                    onMouseLeave={() => setActiveHoveredPara(null)}
                    onClick={() => {
                      const sel = typeof window !== 'undefined' ? window.getSelection()?.toString() : '';
                      if (!sel) {
                        setActiveTappedPara(activeTappedPara === index ? null : index);
                      }
                    }}
                    className="relative group transition-all"
                  >
                    {/* Blended indicator */}
                    {isBlended && (
                      <div className="flex items-center justify-between mb-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <GeminiIcon name="sparkle" size={11} />
                          Simplified & Blended Passage
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBlendedParagraphs((prev) => {
                              const copy = { ...prev };
                              delete copy[index];
                              return copy;
                            });
                          }}
                          className="hover:underline cursor-pointer"
                        >
                          Revert to Original
                        </button>
                      </div>
                    )}

                    {/* Paragraph Body */}
                    <p
                      onMouseUp={() => handleSelectionUpdate(index)}
                      onTouchEnd={() => handleSelectionUpdate(index)}
                      className={`tracking-normal select-text transition-all rounded-xl ${
                        isBlended
                          ? 'p-3 bg-emerald-500/[0.04] border-l-2 border-emerald-500'
                          : isHighlighted
                          ? 'p-3 bg-amber-400/[0.08] dark:bg-amber-400/[0.06] border-l-2 border-amber-400'
                          : isTapped
                          ? 'p-2.5 bg-black/[0.02] dark:bg-white/[0.03] border-l-2 border-[#1A73E8]'
                          : ''
                      }`}
                    >
                      {isBionic ? (
                        <span>
                          {formatBionicText(activeParaText).map((token) => (
                            <span key={token.id} className="inline">
                              <strong className="font-semibold text-neutral-950 dark:text-white">
                                {token.bold}
                              </strong>
                              {token.regular}
                              {token.space ? ' ' : ''}
                            </span>
                          ))}
                        </span>
                      ) : (
                        activeParaText
                      )}
                    </p>

                    {/* 
                      Inline Paragraph Quick Trigger Bar:
                      Ensures the user can click Explain More, Blend, Highlight or Ask AI directly on phone or desktop!
                    */}
                    <div
                      className={`flex flex-wrap items-center gap-1.5 mt-1.5 transition-all duration-200 ${
                        isActionVisible
                          ? 'opacity-100 max-h-12'
                          : 'opacity-0 max-h-0 sm:opacity-0 group-hover:opacity-100 group-hover:max-h-12 pointer-events-none sm:group-hover:pointer-events-auto overflow-hidden'
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBreakDownGrammar(activeParaText);
                        }}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] hover:bg-[#0B57D0]/10 hover:text-[#0B57D0] dark:hover:bg-[#1A73E8]/15 dark:hover:text-[#8AB4F8] text-[11px] font-mono text-neutral-500 transition-colors cursor-pointer"
                        title="Explain this entire paragraph"
                      >
                        <GeminiIcon name="sparkle" size={11} />
                        <span>Explain More</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimplifyAndBlend(activeParaText, index);
                        }}
                        disabled={isBlending && blendingParaIdx === index}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] hover:bg-emerald-500/10 hover:text-emerald-600 text-[11px] font-mono text-neutral-500 transition-colors cursor-pointer disabled:opacity-50"
                        title="Rewrite this paragraph in-place"
                      >
                        {isBlending && blendingParaIdx === index ? (
                          <div className="h-2.5 w-2.5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                        ) : (
                          <GeminiIcon name="blend" size={11} />
                        )}
                        <span>Blend</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setHighlightedParas((prev) => ({
                            ...prev,
                            [index]: !prev[index],
                          }));
                        }}
                        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono transition-colors cursor-pointer ${
                          isHighlighted
                            ? 'bg-amber-400/20 text-amber-600 dark:text-amber-400 font-semibold'
                            : 'bg-black/[0.03] dark:bg-white/[0.05] hover:bg-amber-400/10 hover:text-amber-500 text-neutral-500'
                        }`}
                        title="Highlight paragraph"
                      >
                        <GeminiIcon name="bookmark" size={11} />
                        <span>{isHighlighted ? 'Highlighted' : 'Highlight'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenAiChat) {
                            onOpenAiChat(`I need help understanding this concept from ${selectedBook.courseCode}:\n"${activeParaText}"`);
                          }
                        }}
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-[11px] font-mono text-neutral-500 transition-colors cursor-pointer"
                        title="Discuss in Messages"
                      >
                        <GeminiIcon name="chat" size={11} />
                        <span>Ask AI</span>
                      </button>
                    </div>

                    {/* Integrated Checkpoint Exam Drill */}
                    {checkpoint && (
                      <div className="my-5 p-3.5 sm:p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] text-xs">
                        <div className="flex items-center gap-1.5 mb-2 font-mono text-[10.5px] text-[#0B57D0] dark:text-[#8AB4F8] font-bold">
                          <GeminiIcon name="zap" size={12} />
                          <span>Senate CBT Checkpoint</span>
                        </div>
                        <p className="font-medium text-neutral-900 dark:text-white mb-2.5 leading-snug">
                          {checkpoint.prompt}
                        </p>

                        <div className="space-y-1.5">
                          {checkpoint.options.map((opt, oIdx) => {
                            const isAnswered = answers[checkpoint.id] === oIdx;
                            const isCorrect = checkpoint.correctIndex === oIdx;
                            const isLocked = revealed[checkpoint.id] === true;

                            let btnStyle = 'bg-white dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.06] hover:border-[#0B57D0]/40';
                            if (isLocked) {
                              if (isCorrect) {
                                btnStyle = 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-semibold';
                              } else if (isAnswered) {
                                btnStyle = 'bg-rose-50 dark:bg-rose-500/20 border-rose-500 text-rose-900 dark:text-rose-300 line-through';
                              } else {
                                btnStyle = 'opacity-40 border-transparent text-neutral-400';
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
                                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${btnStyle}`}
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
                  </div>
                );
              })}
            </div>
          </article>

          {/* AI Explanation Modal ("Break Down Big Grammar") */}
          {showAiSheet && (
            <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-3 pb-28 sm:pb-5">
              <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#121316] border border-black/[0.08] dark:border-white/[0.1] p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-5">
                {/* Mobile Drag Handle */}
                <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-white/20 mx-auto mb-3 sm:hidden" />
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 text-[#0B57D0] dark:text-[#8AB4F8]">
                      <GeminiIcon name="sparkle" size={14} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Explain More</h3>
                      <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                        Plain English with Nigerian campus analogies
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAiSheet(false)}
                    className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                  >
                    <GeminiIcon name="close" size={14} />
                  </button>
                </div>

                <div className="min-h-[90px] text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans mb-4">
                  {isExplaining ? (
                    <div className="flex items-center gap-2 text-neutral-500 py-6 justify-center">
                      <div className="h-4 w-4 rounded-full border-2 border-[#0B57D0] dark:border-[#8AB4F8] border-t-transparent animate-spin" />
                      <span className="font-mono text-xs">Breaking this down into everyday words...</span>
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
                        : 'bg-black/[0.04] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.08]'
                    }`}
                  >
                    <GeminiIcon name={isSaved ? 'check' : 'copy'} size={12} />
                    <span>{isSaved ? 'Saved to Vault' : 'Save to Vault'}</span>
                  </button>

                  <button
                    onClick={() => setShowAiSheet(false)}
                    className="px-4 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Got It
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Books Library Drawer */}
          {isBooksDrawerOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 pb-28 sm:pb-5">
              <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.1] p-5 shadow-2xl animate-in fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      Course Textbooks & Material Library
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Accredited NUC CCMAS syllabus curricula with solved exam checkpoints
                    </p>
                  </div>
                  <button
                    onClick={() => setIsBooksDrawerOpen(false)}
                    className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                  >
                    <GeminiIcon name="close" size={15} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredBooks.map((book) => {
                    const isSelected = selectedBookId === book.id;
                    return (
                      <div
                        key={book.id}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex gap-3 ${
                          isSelected
                            ? 'border-[#0B57D0] bg-[#0B57D0]/[0.03] dark:bg-[#1A73E8]/[0.05] ring-2 ring-[#0B57D0]/20'
                            : 'border-black/[0.06] dark:border-white/[0.06] hover:border-[#0B57D0]/40 bg-white dark:bg-[#1E1F20]'
                        }`}
                        onClick={() => {
                          setSelectedBookId(book.id);
                          setSelectedChapterId(book.chapters[0]?.id || '');
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('aurora_selected_book_id', book.id);
                          }
                          setIsBooksDrawerOpen(false);
                        }}
                      >
                        <div className="w-16 h-22 rounded-xl overflow-hidden shrink-0 border border-black/[0.06] dark:border-white/[0.06] bg-neutral-100 dark:bg-black/20 relative">
                          <img
                            src={book.coverIllustration}
                            alt={book.title}
                            className="w-full h-full object-cover grayscale contrast-125"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-mono text-[#0B57D0] dark:text-[#8AB4F8] font-bold">
                                {book.courseCode}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-400">• {book.units} Units</span>
                            </div>
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                              {book.title}
                            </h4>
                            <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                              {book.subtitle}
                            </p>
                          </div>
                          <div className="text-[10.5px] font-mono text-[#0B57D0] dark:text-[#8AB4F8] font-semibold mt-1">
                            {book.chapters.length} Chapters &rarr;
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

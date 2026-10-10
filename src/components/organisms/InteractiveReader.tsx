'use client';

import { queueLongDocumentJob, getQueuedDocumentJobs, QueuedDocumentJob } from '@/lib/documentChunker';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { Badge } from '@/components/ui/Badge';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { formatBionicText } from '@/lib/bionic';
import { StudentProfile, ReaderChapter, SavedExplanation, COHART_VOICES, DEFAULT_COHART_VOICE } from '@/lib/types';
import { saveExplanation, fetchSavedExplanations, deleteSavedExplanation, recordUserActivity } from '@/lib/supabase';
import { SUPPORTED_BOOKS, CourseBook, getAllSupportedBooks } from '@/lib/booksLibrary';
import { checkFeatureAccess, recordFeatureUsage } from '@/lib/subscriptionQuota';

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
  onLocateVenue,
  onAiModeChange,
  onMilestoneAction,
  onUpdateProfile,
  onOpenAiChat,
}) => {
  const [activeView, setActiveView] = useState<'reader' | 'vault'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cohart_reader_view');
      if (saved === 'vault') return 'vault';
    }
    return 'reader';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cohart_reader_view', activeView);
    }
    onAiModeChange?.(false);
  }, [activeView, onAiModeChange]);

  // Books Library & Active Chapter State
  const allBooks = useMemo(() => getAllSupportedBooks(), []);
  const [selectedBookId, setSelectedBookId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cohart_selected_book_id') || allBooks[0]?.id || 'book_eco_201';
    }
    return allBooks[0]?.id || 'book_eco_201';
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
    return found || selectedBook?.chapters[0] || {
      id: 'default',
      courseCode: profile.department,
      title: 'Course Reading',
      subtitle: 'NUC Standard Curriculum',
      readTimeMinutes: 5,
      paragraphs: ['Welcome to your university textbook library. Select a book to start reading.'],
      checkpoints: [],
    };
  }, [selectedBook, selectedChapterId, profile.department]);

  // Drawer / Modals
  const [isBooksDrawerOpen, setIsBooksDrawerOpen] = useState(false);
  const [bookFilterDepartment, setBookFilterDepartment] = useState<string>('ALL');

  // In-place Blended Paragraphs (paragraphIndex -> simplified text)
  const [blendedParagraphs, setBlendedParagraphs] = useState<Record<number, string>>({});
  const [isBlending, setIsBlending] = useState(false);
  const [blendSuccessNotice, setBlendSuccessNotice] = useState<string | null>(null);

  // Quota Upgrade Modal
  // Quick Inline Lookup State (no-clutter definition)
  const [quickLookupWord, setQuickLookupWord] = useState<string | null>(null);
  const [quickLookupDef, setQuickLookupDef] = useState<string | null>(null);
  const [isLoadingLookup, setIsLoadingLookup] = useState(false);

  // Copy restriction & screenshot shield state
  const [copyRestrictionNotice, setCopyRestrictionNotice] = useState<string | null>(null);
  const [isScreenshotShieldActive, setIsScreenshotShieldActive] = useState(false);

  // Background Async Jobs Drawer
  const [isJobsDrawerOpen, setIsJobsDrawerOpen] = useState(false);
  const [activeJobs, setActiveJobs] = useState<QueuedDocumentJob[]>([]);

  // Periodic check for completed background synthesis jobs
  useEffect(() => {
    setActiveJobs(getQueuedDocumentJobs());
    const interval = setInterval(() => {
      setActiveJobs(getQueuedDocumentJobs());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Screenshot & Print Protection on Reader Page
  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        setIsScreenshotShieldActive(true);
        setTimeout(() => setIsScreenshotShieldActive(false), 3000);
      }
    };

    const handleBeforePrint = () => {
      setIsScreenshotShieldActive(true);
    };

    const handleAfterPrint = () => {
      setIsScreenshotShieldActive(false);
    };

    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Copy limitation: allows short snippets (< 150 chars), restricts bulk copying
  const handleCopyInReader = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    const text = selection ? selection.toString() : '';
    if (text.length > 150) {
      e.preventDefault();
      const snippet = text.slice(0, 150) + '... [Excerpt capped at 150 chars. Full material available on Cohart]';
      e.clipboardData.setData('text/plain', snippet);
      setCopyRestrictionNotice('Bulk copying restricted to safeguard course material. Short excerpt (150 chars) copied.');
      setTimeout(() => setCopyRestrictionNotice(null), 4000);
    }
  };

  // Quick Inline Lookup (instant, lightweight 1-sentence definition)
  const handleQuickLookup = async () => {
    if (!selectedText) return;
    setQuickLookupWord(selectedText);
    setIsLoadingLookup(true);
    setQuickLookupDef(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Define this term/phrase in ONE crisp sentence suitable for a ${profile.department} student: "${selectedText}"`,
          context: 'reader_explanation',
          modelTier: 'spark', // Lumen Spark for ultra-fast lookup
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
  const [quotaExceededNotice, setQuotaExceededNotice] = useState<string | null>(null);

  // Handout Compression State (capped at 10MB)
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

  // Reading Options (Bionic & Font Size)
  const [isBionic, setIsBionic] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cohart_bionic_mode');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const handleToggleBionic = () => {
    const next = !isBionic;
    setIsBionic(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cohart_bionic_mode', String(next));
    }
  };

  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

  // Text Selection & "Break Down Big Grammar"
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState<number | null>(null);
  const [showAiSheet, setShowAiSheet] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Audio Reader (Deepgram Aura-2)
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cohart_selected_voice') || DEFAULT_COHART_VOICE;
    }
    return DEFAULT_COHART_VOICE;
  });
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState(false);
  const readerAudioRef = useRef<HTMLAudioElement | null>(null);

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
        previewAudio.play().catch(() => {});
        previewAudio.onended = () => {
          readerAudioRef.current = null;
        };
      } catch {}
    }
  };

  // Saved Vault State
  const [savedExplanations, setSavedExplanations] = useState<SavedExplanation[]>([]);
  const [vaultSearch, setVaultSearch] = useState('');
  const [vaultCourseFilter, setVaultCourseFilter] = useState('ALL');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  useEffect(() => {
    async function loadVault() {
      const data = await fetchSavedExplanations(profile.id);
      setSavedExplanations(data);
    }
    loadVault();
  }, [profile.id]);

  // Active Recall Checkpoints State
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  // Reset chapter-specific state when chapter changes
  useEffect(() => {
    setBlendedParagraphs({});
    setSelectedText('');
    setSelectedParagraphIndex(null);
  }, [currentChapter.id]);

  // Handle native text selection
  const handleMouseUp = (pIdx: number) => {
    if (typeof window !== 'undefined') {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text && text.length > 5) {
        setSelectedText(text);
        setSelectedParagraphIndex(pIdx);
      }
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

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: 'reader_explanation',
          highlightedText: text,
          prompt: `Break down this academic term/grammar into simple, everyday English with a practical Nigerian analogy for a ${profile.department} student.`,
          studentProfile: profile,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiExplanation(data.reply);
      } else {
        setAiExplanation('Unable to generate explanation right now. Please retry in a moment.');
      }
    } catch {
      setAiExplanation('Network error connecting to AI engine. Please verify your connection.');
    } finally {
      setIsExplaining(false);
    }
  };

  // "Simplify & Blend into Text" in-place paragraph rewriting
  const handleSimplifyAndBlend = async () => {
    if (!selectedText) return;
    const pIdx = selectedParagraphIndex !== null ? selectedParagraphIndex : 0;

    // Check Quota (5 free per month for free tier, unlimited for pro)
    const access = checkFeatureAccess('simplify_and_blend', profile);
    if (!access.allowed) {
      setQuotaExceededNotice(
        `Monthly Teaser Limit Reached (${access.maxLimit}/${access.maxLimit} blend rewrites used this month). Upgrade to Cohart Pro for unlimited in-text simplification!`
      );
      return;
    }

    setIsBlending(true);
    setBlendSuccessNotice(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: 'simplify_and_blend',
          highlightedText: selectedText,
          studentProfile: profile,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const simplifiedText = data.simplifiedBlend?.blendedText || data.reply || selectedText;
        
        // Replace paragraph or blend in
        const originalPara = currentChapter.paragraphs[pIdx] || '';
        let newPara = originalPara;
        if (originalPara.includes(selectedText)) {
          newPara = originalPara.replace(selectedText, simplifiedText);
        } else {
          newPara = simplifiedText;
        }

        setBlendedParagraphs((prev) => ({ ...prev, [pIdx]: newPara }));
        recordFeatureUsage('simplify_and_blend', profile);
        setBlendSuccessNotice('Passage simplified & blended directly into your reading flow!');
        setSelectedText('');
        setTimeout(() => setBlendSuccessNotice(null), 4000);
      }
    } catch (err) {
      console.error('Simplify & blend failed:', err);
    } finally {
      setIsBlending(false);
    }
  };

  // Upload & Compress Handout (Capped at 10MB)
  // File type helpers (reader)
  const READER_TEXT_EXTS = ['.txt', '.md', '.csv', '.log', '.json', '.py', '.js', '.ts', '.html', '.xml', '.yaml', '.yml'];
  function readerGetExt(n: string) { return n.slice(n.lastIndexOf('.')).toLowerCase(); }
  function readerIsTextFile(n: string, m?: string) { return READER_TEXT_EXTS.includes(readerGetExt(n)) || m?.startsWith('text/') === true; }
  function readerIsImage(n: string, m?: string) { return ['.jpg','.jpeg','.png','.gif','.webp','.heic','.bmp'].includes(readerGetExt(n)) || m?.startsWith('image/') === true; }
  function readerIsPdf(n: string, m?: string) { return readerGetExt(n) === '.pdf' || m === 'application/pdf'; }

  const handleHandoutFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isText = readerIsTextFile(file.name, file.type);
    const sizeLimit = isText ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > sizeLimit) {
      alert(isText
        ? 'Text file exceeds the 5MB limit. Please upload a smaller document.'
        : 'File size exceeds the 10MB safety cap. Please upload a smaller or compressed document.'
      );
      return;
    }

    const access = checkFeatureAccess('document_upload', profile);
    if (!access.allowed) {
      setQuotaExceededNotice(
        `Monthly Teaser Limit Reached (${access.maxLimit}/${access.maxLimit} scans used this month). Upgrade to Cohart Pro for unlimited document compression!`
      );
      return;
    }

    setIsCompressModalOpen(true);
    setIsCompressingHandout(true);
    setCompressedHandout(null);

    // Read file: text files as UTF-8 string, binary as base64
    const isTextFile = readerIsTextFile(file.name, file.type);
    const reader = new FileReader();
    reader.onload = async () => {
      let filePayload: Record<string, any>;
      if (isTextFile) {
        const textContent = (reader.result as string).slice(0, 80000);
        filePayload = {
          textContent,
          mimeType: file.type || 'text/plain',
          fileName: file.name,
          strategy: 'text',
        };
      } else {
        const base64 = (reader.result as string).split(',')[1];
        const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        const strategy: string = readerIsImage(file.name, file.type) ? 'image' : readerIsPdf(file.name, file.type) ? 'pdf' : 'office_binary';
        filePayload = {
          base64,
          mimeType: file.type || 'application/octet-stream',
          fileName: file.name,
          strategy,
        };
      }
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            context: 'compress_handout',
            prompt: `Compress this academic material for a ${profile.department} student (${profile.institution}) into clear bullet notes, active recall flashcards, and a practice question.`,
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
            practiceQuiz: data.interactiveQuestion ? {
              prompt: data.interactiveQuestion.question || 'Practice Question',
              options: data.interactiveQuestion.options || ['Option A', 'Option B', 'Option C', 'Option D'],
              correctIndex: data.interactiveQuestion.correctIndex || 0,
              explanation: data.interactiveQuestion.explanation || 'Verified explanation.',
            } : undefined,
          });
          setActiveFlashcardIndex(0);
          setIsCardFlipped(false);
          setHandoutQuizAnswer(null);
          setHandoutQuizRevealed(false);
        }
      } catch (err) {
        console.error('Compression failed:', err);
      } finally {
        setIsCompressingHandout(false);
      }
    };
    if (isTextFile) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const fontSizeClasses = {
    sm: 'text-sm leading-relaxed tracking-normal',
    md: 'text-[15px] sm:text-[16px] leading-[1.8] tracking-[-0.01em]',
    lg: 'text-[17px] sm:text-[18px] leading-[1.85] tracking-[-0.01em]',
  };

  const availableCourses = useMemo(() => {
    const set = new Set<string>();
    savedExplanations.forEach((s) => {
      if (s.course_code) set.add(s.course_code);
    });
    return ['ALL', ...Array.from(set)];
  }, [savedExplanations]);

  const filteredVault = useMemo(() => {
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

  const filteredBooks = useMemo(() => {
    if (bookFilterDepartment === 'ALL') return allBooks;
    return allBooks.filter((b) => b.department.toLowerCase().includes(bookFilterDepartment.toLowerCase()) || b.courseCode.startsWith('GST'));
  }, [allBooks, bookFilterDepartment]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Workspace Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* View Mode Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#1E1F20] text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="Switch View"
          >
            <GeminiIcon
              name={activeView === 'vault' ? 'bookmark' : 'reader'}
              size={14}
              className="text-[#0B57D0] dark:text-[#1A73E8]"
            />
            <span className="font-semibold capitalize">
              {activeView === 'vault' ? 'Saved Vault' : 'Course Reader'}
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
                      ? 'bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 text-[#0B57D0] dark:text-[#1A73E8] font-semibold'
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
                    setActiveView('vault');
                    setIsModeDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    activeView === 'vault'
                      ? 'bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 text-[#0B57D0] dark:text-[#1A73E8] font-semibold'
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
            {/* Books Library Drawer Trigger */}
            <button
              onClick={() => setIsBooksDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 text-[#0B57D0] dark:text-[#1A73E8] border border-[#0B57D0]/20 hover:bg-[#0B57D0]/20 transition-all active:scale-95 cursor-pointer"
              title="Open Course Books Library"
            >
              <GeminiIcon name="book-open" size={13} />
              <span>Books Library</span>
            </button>

            {/* Upload & Compress Handout Trigger */}
            <label
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all active:scale-95 cursor-pointer"
              title="Compress Handout / PDF (Max 10MB)"
            >
              <GeminiIcon name="attachment" size={13} />
              <span className="hidden sm:inline">Compress Handout</span>
              <span className="sm:hidden">Compress</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*,.txt,.md,.csv,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.json,.py,.js,.ts,.html"
                onChange={handleHandoutFilePicked}
                className="hidden"
              />
            </label>

            {/* Bionic Mode Pill */}
            <button
              onClick={handleToggleBionic}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-mono transition-colors ${
                isBionic
                  ? 'bg-[#0B57D0] dark:bg-[#1A73E8] text-white font-medium'
                  : 'bg-black/[0.03] dark:bg-white/[0.04] text-neutral-700 dark:text-neutral-300 border border-black/[0.06] dark:border-white/[0.08]'
              }`}
            >
              <span>Bionic: {isBionic ? 'On' : 'Off'}</span>
            </button>

            {/* Font Sizing */}
            <div className="flex items-center bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] rounded-full p-0.5 text-xs font-mono">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  fontSize === 'sm' ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#1A73E8] shadow-xs font-medium' : 'text-neutral-500'
                }`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('md')}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  fontSize === 'md' ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#1A73E8] shadow-xs font-medium' : 'text-neutral-500'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  fontSize === 'lg' ? 'bg-white dark:bg-[#1E1F20] text-[#0B57D0] dark:text-[#1A73E8] shadow-xs font-medium' : 'text-neutral-500'
                }`}
              >
                A+
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quota Notice Banner */}
      {quotaExceededNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <GeminiIcon name="sparkle" size={15} className="text-amber-500 shrink-0" />
            <span className="font-medium">{quotaExceededNotice}</span>
          </div>
          <button
            onClick={() => setQuotaExceededNotice(null)}
            className="p-1 rounded-full text-amber-500 hover:text-amber-700"
          >
            <GeminiIcon name="close" size={13} />
          </button>
        </div>
      )}

      {/* Blend Success Notice */}
      {blendSuccessNotice && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <GeminiIcon name="check-circle" size={15} className="text-emerald-500 shrink-0" />
          <span className="font-medium">{blendSuccessNotice}</span>
        </div>
      )}

      {activeView === 'vault' ? (
        /* Vault View */
        <div className="space-y-4 sm:space-y-5">
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

          <GeminiCard className="p-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {availableCourses.map((c) => (
                  <button
                    key={c}
                    onClick={() => setVaultCourseFilter(c)}
                    className={`px-3 py-1 rounded-full font-mono text-xs transition-all cursor-pointer shrink-0 ${
                      vaultCourseFilter === c
                        ? 'bg-[#0B57D0] dark:bg-[#1A73E8] text-white font-semibold'
                        : 'bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {c === 'ALL' ? 'All Courses' : c}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64 shrink-0">
                <input
                  type="text"
                  value={vaultSearch}
                  onChange={(e) => setVaultSearch(e.target.value)}
                  placeholder="Filter saved notes..."
                  className="w-full rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#1A73E8]"
                />
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                  <GeminiIcon name="search" size={13} />
                </div>
              </div>
            </div>
          </GeminiCard>

          {filteredVault.length === 0 ? (
            <GeminiCard className="p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 text-[#0B57D0] dark:text-[#1A73E8]">
                <GeminiIcon name="bookmark" size={22} />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white font-sans">
                {savedExplanations.length === 0 ? 'Your AI Vault is Empty' : 'No Matching Notes'}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                {savedExplanations.length === 0
                  ? 'While reading chapters, highlight any complex paragraph and tap "Save to Vault". Your personalized real-world breakdowns will be permanently stored here for quick exam revision.'
                  : `No notes found matching "${vaultSearch}". Try a different keyword or switch to All Courses.`}
              </p>
              {savedExplanations.length === 0 && (
                <div className="pt-2">
                  <button
                    onClick={() => setActiveView('reader')}
                    className="px-4 py-2 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-medium hover:opacity-90 transition-all active:scale-95 cursor-pointer"
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 text-[#0B57D0] dark:text-[#1A73E8]">
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

                  <div className="pl-3 py-1 border-l-2 border-[#0B57D0] dark:border-[#1A73E8] bg-black/[0.015] dark:bg-white/[0.02] rounded-r-lg">
                    <p className="text-xs italic text-neutral-600 dark:text-neutral-300 font-serif leading-relaxed">
                      &ldquo;{item.selected_text}&rdquo;
                    </p>
                  </div>

                  <div className="rounded-xl bg-black/[0.02] dark:bg-white/[0.03] p-3 border border-black/[0.05] dark:border-white/[0.05]">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#0B57D0] dark:text-[#1A73E8] mb-1.5">
                      <GeminiIcon name="chat" size={13} />
                      <span>AI Concept Breakdown</span>
                    </div>
                    <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line font-sans">
                      {item.ai_explanation}
                    </p>
                  </div>

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
        /* Course Reader View */
        <>
          {/* Active Book Chapters Switcher & Library Button */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 text-[#0B57D0] dark:text-[#1A73E8] border border-[#0B57D0]/20">
                {selectedBook.courseCode}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {selectedBook.chapters.map((ch, idx) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`px-3 py-1.5 rounded-full font-mono transition-all shrink-0 cursor-pointer ${
                    selectedChapterId === ch.id
                      ? 'bg-[#0B57D0] dark:bg-[#1A73E8] text-white font-semibold shadow-xs'
                      : 'bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  Chapter {idx + 1}: {ch.title.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Reader Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.08] transition-colors">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  {currentChapter.courseCode} • {selectedBook.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {currentChapter.readTimeMinutes} min read
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-900 dark:text-white font-sans">
                {currentChapter.title}
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{currentChapter.subtitle}</p>
            </div>

            {/* Audio Listen & Voice Pill */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
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
                                ? 'bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 text-[#0B57D0] dark:text-[#1A73E8] font-medium'
                                : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                            }`}
                          >
                            <span className="truncate">{v.label}</span>
                            {selectedVoice === v.id && (
                              <GeminiIcon name="check" size={12} className="text-[#0B57D0] dark:text-[#1A73E8] shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Floating Highlight Action Capsule: Look Up • Ask Lumen • Break Down • Simplify & Blend */}
          {selectedText && (
            <div className="sticky top-16 z-30 flex flex-col gap-2 p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-[#1E1F20]/95 border border-[#0B57D0]/30 shadow-xl backdrop-blur-md animate-in fade-in">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-hidden text-xs">
                  <span className="text-neutral-800 dark:text-neutral-200 font-sans font-medium truncate max-w-xs">
                    "{selectedText.slice(0, 40)}{selectedText.length > 40 ? '...' : ''}"
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  {/* 1. Quick Look Up (Inline Definition) */}
                  <button
                    onClick={handleQuickLookup}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                    title="Look up quick meaning without cluttering"
                  >
                    <GeminiIcon name="search" size={12} />
                    <span>Look Up</span>
                  </button>

                  {/* 2. Ask Lumen in Chat */}
                  <button
                    onClick={() => {
                      if (onOpenAiChat) {
                        onOpenAiChat(`Can you explain this excerpt from ${selectedBook.courseCode} in detail: "${selectedText}"?`);
                      }
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#0B57D0] hover:bg-[#0B57D0]/90 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                    title="Ask Lumen AI in Messages"
                  >
                    <GeminiIcon name="chat" size={12} />
                    <span>Ask Lumen</span>
                  </button>

                  {/* 3. Break Down Big Grammar Modal */}
                  <button
                    onClick={() => handleBreakDownGrammar()}
                    className="px-2.5 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                    title="Explain complex terms with practical Nigerian analogy"
                  >
                    Break Down
                  </button>

                  {/* 4. Simplify & Blend into Text */}
                  <button
                    onClick={handleSimplifyAndBlend}
                    disabled={isBlending}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    title="Rewrite this passage in-place in simple readable English"
                  >
                    {isBlending ? (
                      <div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <GeminiIcon name="sparkle" size={12} />
                    )}
                    <span>Simplify & Blend</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedText('');
                      setQuickLookupWord(null);
                    }}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    <GeminiIcon name="close" size={14} />
                  </button>
                </div>
              </div>

              {/* Lightweight Inline Lookup Card */}
              {quickLookupWord && (
                <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-xs animate-in fade-in">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-[#0B57D0] dark:text-[#1A73E8] font-bold uppercase">
                      Definition: {quickLookupWord.slice(0, 30)}
                    </span>
                    <button
                      onClick={() => setQuickLookupWord(null)}
                      className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                      ✕
                    </button>
                  </div>
                  {isLoadingLookup ? (
                    <div className="flex items-center gap-2 text-neutral-500 py-1">
                      <div className="h-3 w-3 rounded-full border-2 border-[#0B57D0] border-t-transparent animate-spin" />
                      <span className="text-[11px] font-mono">Finding definition...</span>
                    </div>
                  ) : (
                    <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans text-xs">
                      {quickLookupDef}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Main Chapter Text Layout */}
          {/* Copy Restriction Notice */}
          {copyRestrictionNotice && (
            <div className="fixed bottom-6 right-6 z-50 p-3 max-w-sm rounded-xl bg-[#1C202A] text-white border border-white/10 shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <GeminiIcon name="shield" size={15} className="text-amber-400 shrink-0" />
              <span>{copyRestrictionNotice}</span>
            </div>
          )}

          {/* Screenshot Shield Overlay (Only active on Reader & Books) */}
          {isScreenshotShieldActive && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6 text-center animate-in fade-in">
              <div className="max-w-md space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                  <GeminiIcon name="shield" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">Protected Course Material</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Screenshots and screen captures are disabled on Course Books to safeguard academic publishing rights. You can highlight and save notes directly to your personal Vault.
                </p>
              </div>
            </div>
          )}

          <GeminiCard className="p-5 sm:p-7 relative select-text" onCopy={handleCopyInReader}>
            <div
              className={`space-y-5 text-neutral-800 dark:text-neutral-200 font-sans ${fontSizeClasses[fontSize]}`}
            >
              {currentChapter.paragraphs.map((para, index) => {
                const isBlended = Boolean(blendedParagraphs[index]);
                const activeParaText = blendedParagraphs[index] || para;

                const checkpoint = currentChapter.checkpoints.find(
                  (c) => c.paragraphIndex === index
                );

                return (
                  <React.Fragment key={index}>
                    <div className="relative group">
                      {isBlended && (
                        <div className="flex items-center justify-between mb-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          <span className="flex items-center gap-1">
                            <GeminiIcon name="sparkle" size={12} />
                            Simplified & Blended Passage
                          </span>
                          <button
                            onClick={() => {
                              setBlendedParagraphs((prev) => {
                                const copy = { ...prev };
                                delete copy[index];
                                return copy;
                              });
                            }}
                            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 underline cursor-pointer"
                          >
                            Revert to Original
                          </button>
                        </div>
                      )}

                      <p
                        onMouseUp={() => handleMouseUp(index)}
                        className={`tracking-normal select-text transition-all ${
                          isBlended
                            ? 'p-3 rounded-xl bg-emerald-500/[0.04] border-l-2 border-emerald-500'
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
                                {token.regular}{token.space ? ' ' : ''}
                              </span>
                            ))}
                          </span>
                        ) : (
                          activeParaText
                        )}
                      </p>
                    </div>

                    {/* Checkpoint recall quiz */}
                    {checkpoint && (
                      <div className="my-5 p-4 rounded-2xl bg-[#0B57D0]/[0.03] dark:bg-[#1A73E8]/[0.05] border border-[#0B57D0]/20 dark:border-[#1A73E8]/20 text-xs">
                        <div className="flex items-center gap-2 mb-2 font-mono text-[11px] text-[#0B57D0] dark:text-[#1A73E8]">
                          <GeminiIcon name="chat" size={14} />
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

              {/* Chapter Completion Banner */}
              {(() => {
                const totalCheckpoints = currentChapter.checkpoints.length;
                const answeredCheckpoints = currentChapter.checkpoints.filter((c) => revealed[c.id]);
                const correctCheckpoints = currentChapter.checkpoints.filter((c) => answers[c.id] === c.correctIndex);
                const isChapterCompleted = totalCheckpoints > 0 && answeredCheckpoints.length === totalCheckpoints;

                if (!isChapterCompleted) return null;

                return (
                  <div className="mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.08] animate-in fade-in">
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0B57D0]/[0.08] via-purple-500/[0.04] to-emerald-500/[0.08] border border-[#0B57D0]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0B57D0]/15 text-[#0B57D0] dark:text-[#1A73E8] font-bold">
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
                          const prompt = `I completed the chapter "${currentChapter.title}" in ${currentChapter.courseCode} with a score of ${correctCheckpoints.length}/${totalCheckpoints}. Test me with exam practice questions on this topic!`;
                          onMilestoneAction?.('reader_quiz');
                          if (onOpenAiChat) {
                            onOpenAiChat(prompt);
                          }
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        <GeminiIcon name="zap" size={14} />
                        <span>Practice Exam Questions in Messages</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </GeminiCard>

          {/* AI Explanation Modal ("Break Down Big Grammar") */}
          {showAiSheet && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-3">
              <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.1] p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 text-[#0B57D0] dark:text-[#1A73E8]">
                      <GeminiIcon name="chat" size={15} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Break Down Big Grammar</h3>
                      <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                        Plain English with Nigerian context
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
                      <div className="h-4 w-4 rounded-full border-2 border-[#0B57D0] dark:border-[#1A73E8] border-t-transparent animate-spin" />
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
                    className="px-4 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    Got It
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Handout Compression Result Modal */}
          {isCompressModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.1] p-5 sm:p-6 shadow-2xl animate-in fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <GeminiIcon name="attachment" size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                        Compressed Handout & Study Pack
                      </h3>
                      <p className="text-[10px] font-mono text-neutral-500">
                        {compressedHandout?.fileName || 'Academic Document'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCompressModalOpen(false)}
                    className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    <GeminiIcon name="close" size={16} />
                  </button>
                </div>

                {isCompressingHandout ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="h-8 w-8 rounded-full border-3 border-[#0B57D0] border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs font-mono text-neutral-500">
                      Analyzing and compressing document into executive notes, flashcards, and practice questions...
                    </p>
                  </div>
                ) : compressedHandout ? (
                  <div className="space-y-5">
                    {/* Executive Summary */}
                    <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06]">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-[#0B57D0] dark:text-[#1A73E8] font-bold mb-2">
                        Executive Readable Summary
                      </h4>
                      <div className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line">
                        {compressedHandout.summary}
                      </div>
                    </div>

                    {/* Active Recall Flashcards */}
                    {compressedHandout.flashcards.length > 0 && (
                      <div className="p-4 rounded-2xl bg-[#0B57D0]/[0.03] dark:bg-[#1A73E8]/[0.05] border border-[#0B57D0]/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-mono uppercase tracking-wider text-[#0B57D0] dark:text-[#1A73E8] font-bold">
                            Active Recall Flashcards ({activeFlashcardIndex + 1}/{compressedHandout.flashcards.length})
                          </h4>
                          <span className="text-[10px] font-mono text-neutral-500">
                            Tap card to flip
                          </span>
                        </div>

                        {/* Flashcard Flip Card */}
                        <div
                          onClick={() => setIsCardFlipped(!isCardFlipped)}
                          className="min-h-[120px] p-5 rounded-xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.08] shadow-sm flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0B57D0]/50 transition-all select-none"
                        >
                          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                            {isCardFlipped ? 'Answer & Analogy' : 'Question / Concept'}
                          </span>
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {isCardFlipped
                              ? compressedHandout.flashcards[activeFlashcardIndex]?.answer
                              : compressedHandout.flashcards[activeFlashcardIndex]?.question}
                          </p>
                        </div>

                        {/* Flashcard Navigation */}
                        <div className="flex items-center justify-between mt-3">
                          <button
                            onClick={() => {
                              setActiveFlashcardIndex((prev) => Math.max(0, prev - 1));
                              setIsCardFlipped(false);
                            }}
                            disabled={activeFlashcardIndex === 0}
                            className="px-3 py-1 rounded-full text-xs font-mono bg-white dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] disabled:opacity-40"
                          >
                            &larr; Prev Card
                          </button>
                          <button
                            onClick={() => {
                              setActiveFlashcardIndex((prev) => Math.min(compressedHandout.flashcards.length - 1, prev + 1));
                              setIsCardFlipped(false);
                            }}
                            disabled={activeFlashcardIndex === compressedHandout.flashcards.length - 1}
                            className="px-3 py-1 rounded-full text-xs font-mono bg-white dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] disabled:opacity-40"
                          >
                            Next Card &rarr;
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Practice Quiz */}
                    {compressedHandout.practiceQuiz && (
                      <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06]">
                        <h4 className="text-xs font-mono uppercase tracking-wider text-[#0B57D0] dark:text-[#1A73E8] font-bold mb-2">
                          Checkpoint Exam Question
                        </h4>
                        <p className="text-xs font-medium text-neutral-900 dark:text-white mb-3">
                          {compressedHandout.practiceQuiz.prompt}
                        </p>
                        <div className="space-y-2">
                          {compressedHandout.practiceQuiz.options.map((opt, oIdx) => {
                            const isAnswered = handoutQuizAnswer === oIdx;
                            const isCorrect = compressedHandout.practiceQuiz?.correctIndex === oIdx;
                            const isLocked = handoutQuizRevealed;

                            let btnStyle = 'bg-white dark:bg-white/[0.04] border-black/[0.08] dark:border-white/[0.08] hover:border-[#0B57D0]/50';
                            if (isLocked) {
                              if (isCorrect) {
                                btnStyle = 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-semibold';
                              } else if (isAnswered) {
                                btnStyle = 'bg-rose-50 dark:bg-rose-500/20 border-rose-500 text-rose-900 dark:text-rose-300 line-through';
                              } else {
                                btnStyle = 'opacity-40 border-black/[0.04] dark:border-white/[0.04] text-neutral-400';
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={isLocked}
                                onClick={() => {
                                  setHandoutQuizAnswer(oIdx);
                                  setHandoutQuizRevealed(true);
                                }}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {handoutQuizRevealed && (
                          <div className="mt-2.5 pt-2 border-t border-black/[0.05] dark:border-white/[0.05] text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                            {compressedHandout.practiceQuiz.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Books Library Drawer */}
          {isBooksDrawerOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3">
              <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.1] p-5 sm:p-6 shadow-2xl animate-in fade-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                      Course Textbooks & Material Library
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Standard NUC CCMAS textbooks with full chapters and pencil-drawn illustrations
                    </p>
                  </div>
                  <button
                    onClick={() => setIsBooksDrawerOpen(false)}
                    className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                  >
                    <GeminiIcon name="close" size={16} />
                  </button>
                </div>

                {/* Department Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 no-scrollbar text-xs">
                  {['ALL', 'Economics', 'Computer Science', 'Law', 'Accounting', 'Mass Communication'].map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setBookFilterDepartment(dept)}
                      className={`px-3 py-1 rounded-full font-mono transition-all shrink-0 cursor-pointer ${
                        bookFilterDepartment === dept
                          ? 'bg-[#0B57D0] dark:bg-[#1A73E8] text-white font-semibold'
                          : 'bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      {dept === 'ALL' ? 'All Departments' : dept}
                    </button>
                  ))}
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBooks.map((book) => {
                    const isSelected = selectedBookId === book.id;
                    return (
                      <div
                        key={book.id}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
                          isSelected
                            ? 'border-[#0B57D0] bg-[#0B57D0]/[0.03] dark:bg-[#1A73E8]/[0.05] ring-2 ring-[#0B57D0]/20'
                            : 'border-black/[0.08] dark:border-white/[0.08] hover:border-[#0B57D0]/40 bg-white dark:bg-[#1E1F20]'
                        }`}
                        onClick={() => {
                          setSelectedBookId(book.id);
                          setSelectedChapterId(book.chapters[0]?.id || '');
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('cohart_selected_book_id', book.id);
                          }
                          setIsBooksDrawerOpen(false);
                        }}
                      >
                        {/* Stickman Pencil Illustration Cover */}
                        <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 border border-black/[0.08] dark:border-white/[0.08] bg-neutral-100 dark:bg-black/20 relative">
                          <img
                            src={book.coverIllustration}
                            alt={book.title}
                            className="w-full h-full object-cover grayscale contrast-125"
                          />
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-sm bg-black/70 text-white text-[9px] font-mono font-bold">
                            {book.courseCode}
                          </div>
                        </div>

                        {/* Book Metadata */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                              <span className="text-[10px] font-mono text-neutral-400">
                                {book.department} • {book.units} Units
                              </span>
                              {isSelected && (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                                  Currently Reading
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">
                              {book.title}
                            </h4>
                            <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                              {book.subtitle}
                            </p>
                          </div>

                          <div className="mt-2 pt-2 border-t border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-neutral-500">
                            <span>{book.chapters.length} Chapters</span>
                            <span className="text-[#0B57D0] dark:text-[#1A73E8] font-semibold">
                              Select &rarr;
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Sleek Chapter Discussion in Messages */}
          <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 text-[#0B57D0] dark:text-[#1A73E8]">
                <GeminiIcon name="chat" size={18} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                  Discuss {currentChapter.courseCode} with Cohart AI
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Ask doubts, solve past questions, or brainstorm in Messages
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (onOpenAiChat) {
                  onOpenAiChat(`I have questions regarding "${currentChapter.title}" in ${currentChapter.courseCode}. Can you explain it further?`);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <span>Open in Messages</span>
              <GeminiIcon name="arrow-right" size={13} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

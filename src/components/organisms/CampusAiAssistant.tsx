'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatedCircularClock } from '@/components/atoms/AnimatedCircularClock';
import { AnimatedRectangularClock } from '@/components/atoms/AnimatedRectangularClock';
import { AI_MODELS, ModelTierId, AI_BRAND_NAME, SUBSCRIPTION_TIERS, HARDSHIP_REFERRAL_PROGRAM, CAMPUS_GAMES_AND_REWARDS } from '@/lib/aiModels';
import { downloadAsText, downloadAsDocx, downloadAsPdf, copyToClipboard } from '@/lib/exportUtils';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { MarkdownText } from '@/components/atoms/MarkdownText';
import {
  StudentProfile,
  Location,
  COHART_VOICES,
  DEFAULT_COHART_VOICE,
  QuizData,
  InteractiveChoices,
  Message,
  Conversation,
  InteractiveQuizQuestion,
  AttachedFileDetail,
  StudyKitPayload,
  LinkEmbedPayload,
  MessageReplyContext,
} from '@/lib/types';
import {
  fetchAiConversations,
  upsertAiConversation,
  deleteAiConversation,
  getUserRecentActivity,
  recordUserActivity,
  fetchAttendanceLogs,
} from '@/lib/supabase';
import {
  generateAssumedTimetable,
  computeStudentAttendanceBrief,
} from '@/lib/curriculumTimetable';
import {
  saveSharedDepartmentTimetable,
  getLocalSharedDepartmentTimetable,
} from '@/lib/departmentTimetables';
import {
  checkFeatureAccess,
  recordFeatureUsage,
  validateUploadBatch,
  isHeavyFile,
  getUserSubscriptionTier,
  getUserTonesBalance,
  isExamPassLoanActive,
  activateExamPassLoan,
  settleExamPassLoan,
} from '@/lib/subscriptionQuota';
import {
  saveDocumentContext,
} from '@/lib/documentArchive';
import { QuizRunner } from './QuizRunner';
import { CampusArenaViewer } from '@/components/arena/CampusArenaViewer';
import { StudyKitWidget } from '@/components/study/StudyKitWidget';
import { MobileCodePlayground } from '@/components/ide/MobileCodePlayground';
import { motion, AnimatePresence } from 'framer-motion';

interface CampusAiAssistantProps {
  profile: StudentProfile;
  locations?: Location[];
  onSelectVenue?: (code: string) => void;
  onExitFullscreen?: () => void;
  onMilestoneAction?: (actionId: string) => void;
  onUpdateProfile?: (updated: Partial<StudentProfile>) => void;
  initialMode?: 'general' | 'grill_mode';
  initialPrompt?: string;
  onStartQuiz?: (quiz: QuizData) => void;
}

const KNOWLEDGE_BASE: Record<string, { reply: string; venueCode?: string }> = {
  llt1: {
    reply: "Here is how to get to LLT1 (Arts Lecture Theatre I) inside OOU PS:\n1. Note: Walking from the Main Gate is very far (about 1.5 - 2km), and commercial bikes are strictly banned inside campus.\n2. Buses drop at the central School Park (PS Bus Park).\n3. From School Park, take a short Maruwa or walk past the Access Bank ATM / Sam Ewang complex.\n4. Cross the covered concrete footbridge directly opposite Access Bank. LLT1 is the large auditorium right in front.",
    venueCode: 'LLT-1',
  },
  llt2: {
    reply: "Here is how to get to LLT2 (Law Lecture Theatre II) inside OOU PS:\n1. From the School Park (where campus buses drop students), take a Maruwa towards Sam Ewang or walk past Access Bank ATM.\n2. Cross the covered footbridge into the LLT quad. LLT2 is right next to LLT1, heading towards the Faculty of Education.\n3. Note: Commercial okadas are not allowed inside campus—only university shuttles, Maruwa, and staff/private bikes.",
    venueCode: 'LLT-2',
  },
  llt3: {
    reply: "Here is how to get to LLT3 (Law Lecture Theatre III at Motion Ground):\n1. Walking from the Main Gate is far (1.5 - 2km). Always take transport to the School Park.\n2. From the School Park, board a Maruwa heading towards Motion Ground (New Motion).\n3. LLT3 is the large hall directly opposite Professor Saburi Market and adjacent to the ICAN Building.\n4. Note: Commercial bikes are banned inside OOU PS campus.",
    venueCode: 'LLT-3',
  },
  bank: {
    reply: "The Access Bank ATM Quad is along the central avenue near Sam Ewang.\nFrom the School Park, it is a short walk or Maruwa drop past the Senate roundabout. You will find the 24/7 ATM gallery for cash withdrawals and fee receipts.",
    venueCode: 'BANK-QUAD',
  },
  sms: {
    reply: "Here is how to get to SMS Lecture Theatre (Faculty of Administration & Management Sciences):\n1. From the School Park drop-off, board an SMS or Science Maruwa along the faculty avenue.\n2. Pass the Odukale Library and ETF Complex. The SMS complex is south of ETF, with SLR 1 on the ground floor eastern wing.",
    venueCode: 'SMS-LT1',
  },
  market: {
    reply: "Professor Saburi Market is at Motion Ground, directly facing LLT3.\nFrom the School Park, board a Motion Ground Maruwa. The market has printing kiosks, snacks, stationery, and photocopying vendors.",
    venueCode: 'MKT-SABURI',
  },
  park: {
    reply: "The OOU School Park (PS Bus & Maruwa Terminal) is the central transit hub inside campus.\nAll commuter buses from Ago garage, Ilisan, and surrounding towns drop students here. From School Park, you can board Maruwa to any faculty. Note: Commercial okadas are strictly prohibited inside campus!",
    venueCode: 'SCHOOL-PARK',
  },
};

function generateConversationTitle(query: string): string {
  const clean = query.trim();
  const lower = clean.toLowerCase();

  if (lower.includes('grill') || lower.includes('exam test')) return 'Exam Readiness Grill';
  if (lower.includes('llt1') || lower.includes('llt 1')) return 'LLT 1 Walking Route';
  if (lower.includes('llt2') || lower.includes('llt 2')) return 'LLT 2 Directions';
  if (lower.includes('llt3') || lower.includes('llt 3')) return 'LLT 3 Motion Ground';
  if (lower.includes('exam') || lower.includes('test') || lower.includes('ca')) return 'Continuous Assessment Prep';

  const words = clean.split(/\s+/).slice(0, 4).join(' ');
  return words.length > 28 ? words.slice(0, 25) + '...' : words;
}

export const CampusAiAssistant: React.FC<CampusAiAssistantProps> = ({
  profile,
  onSelectVenue,
  onExitFullscreen,
  onMilestoneAction,
  onUpdateProfile,
  initialMode = 'general',
  initialPrompt,
  onStartQuiz,
}) => {
  const studentName = profile.full_name?.trim() ? profile.full_name.trim().split(' ')[0] : 'Scholar';
  const [currentMode, setCurrentMode] = useState<'general' | 'grill_mode'>(initialMode);
  const [activeRunningQuiz, setActiveRunningQuiz] = useState<QuizData | null>(null);

  const institutionName = profile.institution || 'University';
  const isOou = !profile.institution || profile.institution === 'OOU' || profile.institution.includes('OOU') || profile.institution.toLowerCase().includes('olabisi');

  const defaultInitialMessage: Message = {
    id: 'msg_welcome',
    role: 'assistant',
    content: initialMode === 'grill_mode'
      ? `Ready for exam practice, ${studentName}. Tell me which course code or topic you want to be tested on, and we will drill through questions one by one.`
      : `Hey ${studentName}, what are we studying today? Ask a question, paste notes to summarize, or ask for practice exam questions.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Intercept phone back button: if menu is open, pressing back button closes menu instead of exiting screen
  useEffect(() => {
    if (isSidebarOpen) {
      window.history.pushState({ cohartModal: 'ai_menu' }, '');
      const handlePopState = () => {
        setIsSidebarOpen(false);
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isSidebarOpen]);

  // Listen for code playground open requests from CodeCapsule in chat
  useEffect(() => {
    const handleOpenPlayground = (e: any) => {
      if (e.detail) {
        setChatIdeCode(e.detail.code || '');
        setChatIdeLang(e.detail.language || 'python');
        setIsChatIdeOpen(true);
      }
    };
    window.addEventListener('aurora:open-code-playground', handleOpenPlayground);
    return () => window.removeEventListener('aurora:open-code-playground', handleOpenPlayground);
  }, []);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([defaultInitialMessage]);
  const [input, setInput] = useState(initialPrompt || '');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string[]>>({});
  // In-Chat Interactive Quiz States
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, { selectedIndex: number; isCorrect: boolean }>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cohart_answered_quiz_questions');
        return saved ? JSON.parse(saved) : {};
      } catch {}
    }
    return {};
  });

  const [quizStreak, setQuizStreak] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cohart_quiz_streak');
        return saved ? parseInt(saved, 10) || 0 : 0;
      } catch {}
    }
    return 0;
  });

  // Lumen Model Tier & Export State
  const [selectedModelTier, setSelectedModelTier] = useState<ModelTierId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cohart_selected_model_tier') as ModelTierId;
      if (saved && AI_MODELS[saved]) return saved;
    }
    return 'astral';
  });
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [activeDownloadMenuMsgId, setActiveDownloadMenuMsgId] = useState<string | null>(null);

  const handleCopyMessage = async (msgId: string, text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };
  const [streakHypeModal, setStreakHypeModal] = useState<{ count: number; title: string; praise: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<MessageReplyContext | null>(null);
  const [isChatIdeOpen, setIsChatIdeOpen] = useState(false);
  const [chatIdeCode, setChatIdeCode] = useState('');
  const [chatIdeLang, setChatIdeLang] = useState<'javascript' | 'python' | 'html' | 'typescript'>('python');

  // Campus Arena Live Viewer & Pro Subscriptions State
  const [showArenaViewer, setShowArenaViewer] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const tonesInfo = getUserTonesBalance(profile);
  const userTones = tonesInfo.balance;
  const userTierId = getUserSubscriptionTier(profile);
  const userTier = SUBSCRIPTION_TIERS[userTierId] || SUBSCRIPTION_TIERS.freemium;

  // File Upload & Multimodal Vision State (max 10MB combined, 3 heavy or 5 light files per batch)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileDetail[]>([]);
  const attachedFile = attachedFiles.length > 0 ? attachedFiles[0] : null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Flashcards Flipping State
  const [flashcardIndices, setFlashcardIndices] = useState<Record<string, number>>({});
  const [flashcardFlipped, setFlashcardFlipped] = useState<Record<string, boolean>>({});

  // Timetable Save Toast State
  const [timetableSavedNotice, setTimetableSavedNotice] = useState<string | null>(null);

  // Deepgram Voice & Audio State (voice selected in Settings)
  const [selectedVoice] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cohart_selected_voice') || DEFAULT_COHART_VOICE;
    }
    return DEFAULT_COHART_VOICE;
  });
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Text-To-Speech: Read aloud AI response using selected Deepgram Aura-2 model
  const handleSpeakMessage = async (msgId: string, text: string) => {
    // If already speaking this message, stop it
    if (speakingMsgId === msgId) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setSpeakingMsgId(null);
      return;
    }

    // Stop any existing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    setIsSynthesizing(msgId);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: selectedVoice }),
      });

      if (!res.ok) {
        throw new Error('TTS synthesis failed');
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => {
        setIsSynthesizing(null);
        setSpeakingMsgId(msgId);
      };

      audio.onended = () => {
        setSpeakingMsgId(null);
        currentAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsSynthesizing(null);
        setSpeakingMsgId(null);
        currentAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      console.error('Failed to play audio:', err);
      setIsSynthesizing(null);
      setSpeakingMsgId(null);
    }
  };

  // Speech-To-Text: Record audio from microphone and transcribe via Deepgram Nova-3
  const handleStartRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone access is not supported on your browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });

        if (audioBlob.size < 500) {
          setIsTranscribing(false);
          setIsRecording(false);
          return;
        }

        setIsTranscribing(true);
        try {
          const res = await fetch('/api/stt', {
            method: 'POST',
            headers: {
              'Content-Type': audioBlob.type || 'audio/webm',
            },
            body: audioBlob,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.transcript && data.transcript.trim()) {
              setInput((prev) => (prev ? `${prev} ${data.transcript.trim()}` : data.transcript.trim()));
              setTimeout(() => inputRef.current?.focus(), 100);
            }
          }
        } catch (err) {
          console.error('STT failed:', err);
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start(100);
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      setIsRecording(false);
    }
  };

  
  // Handle File Attachment (Max 10MB with Quota Gate)

  // File type detection helpers
  const FILE_TEXT_EXTS = ['.txt', '.md', '.csv', '.log', '.json', '.py', '.js', '.ts', '.jsx', '.tsx', '.html', '.xml', '.yaml', '.yml'];
  const FILE_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.bmp'];
  const FILE_OFFICE_EXTS = ['.docx', '.xlsx', '.pptx', '.doc', '.xls'];

  function getFileExt(name: string) { return name.slice(name.lastIndexOf('.')).toLowerCase(); }
  function isImgFile(name: string, mime?: string) { return FILE_IMAGE_EXTS.includes(getFileExt(name)) || (mime?.startsWith('image/') ?? false); }
  function isPdfFile(name: string, mime?: string) { return getFileExt(name) === '.pdf' || mime === 'application/pdf'; }
  function isTextFileType(name: string, mime?: string) { return FILE_TEXT_EXTS.includes(getFileExt(name)) || mime?.startsWith('text/') || mime === 'application/json'; }
  function isOfficeFileType(name: string) { return FILE_OFFICE_EXTS.includes(getFileExt(name)); }

  function getFileTypeBadge(name: string, mime?: string): string {
    const ext = getFileExt(name);
    if (isImgFile(name, mime)) return 'IMG';
    if (isPdfFile(name, mime)) return 'PDF';
    if (ext === '.docx' || ext === '.doc') return 'DOCX';
    if (ext === '.xlsx' || ext === '.xls') return 'XLSX';
    if (ext === '.pptx') return 'PPTX';
    if (ext === '.csv') return 'CSV';
    if (['.txt', '.md'].includes(ext)) return 'TXT';
    if (['.py', '.js', '.ts', '.jsx', '.tsx'].includes(ext)) return 'CODE';
    return 'FILE';
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    // Check monthly free session quota (counts per upload session, not per file)
    const quota = checkFeatureAccess('document_upload', profile);
    if (!quota.allowed) {
      setShowProModal(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate the candidate batch (3 heavy or 5 light, total combined size <= 10MB)
    const validation = validateUploadBatch(rawFiles.map((f) => ({ name: f.name, type: f.type, size: f.size })));
    if (!validation.valid) {
      alert(validation.error);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Process all files in parallel
    try {
      const processed = await Promise.all(
        rawFiles.map((file) => {
          return new Promise<AttachedFileDetail>((resolve, reject) => {
            const textBased = isTextFileType(file.name, file.type);
            if (textBased) {
              const textReader = new FileReader();
              textReader.onload = () => {
                const textContent = (textReader.result as string).slice(0, 80000);
                resolve({
                  name: file.name,
                  type: file.type || 'text/plain',
                  sizeBytes: file.size,
                  strategy: 'text',
                  textContent,
                });
              };
              textReader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
              textReader.readAsText(file, 'UTF-8');
            } else {
              const binReader = new FileReader();
              binReader.onload = () => {
                const result = binReader.result as string;
                const base64Data = result.split(',')[1] || '';
                const previewUrl = isImgFile(file.name, file.type) ? result : undefined;
                const strategy: 'image' | 'pdf' | 'office_binary' =
                  isImgFile(file.name, file.type) ? 'image' :
                  isPdfFile(file.name, file.type) ? 'pdf' : 'office_binary';
                resolve({
                  name: file.name,
                  type: file.type || 'application/octet-stream',
                  sizeBytes: file.size,
                  strategy,
                  base64: base64Data,
                  previewUrl,
                });
              };
              binReader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
              binReader.readAsDataURL(file);
            }
          });
        })
      );

      // Append to attachedFiles up to batch limits
      setAttachedFiles((prev) => {
        const combined = [...prev, ...processed];
        const combValidation = validateUploadBatch(
          combined.map((f) => ({ name: f.name, type: f.type, size: f.sizeBytes }))
        );
        if (!combValidation.valid) {
          alert(combValidation.error);
          return processed.slice(0, combValidation.maxAllowedFiles);
        }
        return combined;
      });
    } catch (err) {
      console.error('File batch reading failed:', err);
      alert('Error reading files. Please try again.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle In-Chat Single Question Answer
  const handleAnswerQuestion = (msgId: string, q: InteractiveQuizQuestion, pickedIndex: number) => {
    if (answeredQuestions[msgId]) return; // permanently locked

    const isCorrect = pickedIndex === q.correctIndex;
    const newState = { selectedIndex: pickedIndex, isCorrect };

    setAnsweredQuestions((prev) => {
      const updated = { ...prev, [msgId]: newState };
      try {
        localStorage.setItem('cohart_answered_quiz_questions', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    recordUserActivity({
      user_id: profile.id,
      activity_type: 'quiz_answered',
      course_code: q.courseCode,
      topic: q.question.slice(0, 60),
      question_text: q.question,
      user_answer: q.options[pickedIndex],
      is_correct: isCorrect,
    });

    if (isCorrect) {
      const nextStreak = quizStreak + 1;
      setQuizStreak(nextStreak);
      try {
        localStorage.setItem('cohart_quiz_streak', nextStreak.toString());
      } catch {}

      if (nextStreak === 3) {
        const threeWinPraise = [
          { title: "That's my scholar! 🔥", praise: "Three straight bullseyes! Your grasp of theoretical principles is razor-sharp. Keep that momentum alive!" },
          { title: "3-IN-A-ROW! You're cooking with gas!", praise: "That's how distinction students move! Clear, confident understanding under exam pressure." },
          { title: "Triple Streak! Lecturer can't confuse you!", praise: "3 out of 3 without flinching! Your conceptual clarity is locked in solid." },
          { title: "Academic Flow State Activated! ⚡", praise: "Three consecutive correct hits! You are dominating this syllabus topic." },
        ];
        const picked = threeWinPraise[Math.floor(Math.random() * threeWinPraise.length)];
        setStreakHypeModal({
          count: 3,
          title: picked.title,
          praise: picked.praise,
        });
      } else if (nextStreak === 10) {
        const tenWinPraise = [
          { title: "10 WINNING STREAK! A book made it to 10! 🏆", praise: "Ten straight correct answers! You have achieved first-class exam mastery. Lecturer questions can't touch you!" },
          { title: "UNTOUCHABLE! Senate Distinction Grade! 🌟", praise: "A flawless 10-win streak! Your exam readiness score is 100%. First Class Honours material right here!" },
          { title: "Mastery Level 10! Exam-Proof Scholar! 🎓", praise: "Double-digit perfection! You've mastered all subtle distractors and tricky phrasing." },
        ];
        const picked = tenWinPraise[Math.floor(Math.random() * tenWinPraise.length)];
        setStreakHypeModal({
          count: 10,
          title: picked.title,
          praise: picked.praise,
        });
      }
    } else {
      setQuizStreak(0);
      try {
        localStorage.setItem('cohart_quiz_streak', '0');
      } catch {}
    }
  };

  // Handle Saving Scanned Timetable to Department & Session Tracker
  const handleAdoptTimetable = (timetableSchedule: any[]) => {
    saveSharedDepartmentTimetable(
      profile.institution || 'OOU',
      profile.department || 'General Studies',
      profile.level || '200L',
      timetableSchedule
    );
    setTimetableSavedNotice('Timetable saved to your weekly schedule and shared with your course mates!');
    setTimeout(() => setTimetableSavedNotice(null), 4000);
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Initialize conversation session on page load: load from Supabase cloud
  useEffect(() => {
    let isMounted = true;
    async function loadCloudConversations() {
      try {
        const cloudConversations = await fetchAiConversations(profile.id);
        if (!isMounted) return;
        const valid = cloudConversations.filter((c: Conversation) =>
          c.messages && c.messages.some((m) => m.role === 'user')
        );
        setConversations(valid.slice(0, 30));
      } catch (e) {
        console.warn('Failed to load cloud conversations:', e);
      }
    }
    loadCloudConversations();

    const newSessionId = `conv_${Date.now()}`;
    setActiveConvId(newSessionId);
    setMessages([defaultInitialMessage]);

    if (initialPrompt) {
      setTimeout(() => handleSend(initialPrompt), 400);
    }

    return () => {
      isMounted = false;
    };
  }, [studentName, initialMode, profile.institution, profile.id]);

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleStartNewChat = (mode: 'general' | 'grill_mode' = 'general') => {
    setCurrentMode(mode);
    const newSessionId = `conv_${Date.now()}`;
    const newInitialMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: mode === 'grill_mode'
        ? `Socratic Grill Mode activated. I will probe your theoretical reasoning and award marks out of 10. Let's begin.`
        : defaultInitialMessage.content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveConvId(newSessionId);
    setMessages([newInitialMsg]);
    setIsSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConvId(conv.id);
    setMessages(conv.messages);
    if (conv.modelTier && (['spark', 'core', 'depth', 'auto'] as string[]).includes(conv.modelTier)) {
      setSelectedModelTier(conv.modelTier as ModelTierId);
      try {
        localStorage.setItem('cohart_selected_model_tier', conv.modelTier);
      } catch {}
    }
    setIsSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleSelectModelTier = (tierId: ModelTierId) => {
    setSelectedModelTier(tierId);
    try {
      localStorage.setItem('cohart_selected_model_tier', tierId);
    } catch {}
    setIsModelMenuOpen(false);
    setConversations((prev) => {
      return prev.map((c) => {
        if (c.id === activeConvId) {
          const updated = { ...c, modelTier: tierId };
          upsertAiConversation(updated, profile.id);
          return updated;
        }
        return c;
      });
    });
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const filtered = conversations.filter((c) => c.id !== id);
    setConversations(filtered);
    await deleteAiConversation(id);

    if (activeConvId === id) {
      if (filtered.length > 0) {
        handleSelectConversation(filtered[0]);
      } else {
        handleStartNewChat();
      }
    }
  };

  const handleSend = async (userText?: string) => {
    const query = (userText || input).trim();
    if (!query) return;

        // Capture attached files copy before resetting state
    const currentAttachments = [...attachedFiles];
    setAttachedFiles([]);
    if (currentAttachments.length > 0) {
      recordFeatureUsage('document_upload', profile);
    }

    const activeReplyContext = replyingTo ? { ...replyingTo } : undefined;
    setReplyingTo(null);

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replyTo: activeReplyContext,
      attachedFile: currentAttachments.length > 0 ? {
        name: currentAttachments[0].name,
        type: currentAttachments[0].type,
        sizeBytes: currentAttachments[0].sizeBytes,
        previewUrl: currentAttachments[0].previewUrl,
      } : undefined,
      attachedFiles: currentAttachments.length > 0 ? currentAttachments : undefined,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!userText) setInput('');
    setIsTyping(true);

    // Save/update conversation in list and sync to Supabase
    const convTitle = generateConversationTitle(query);
    let targetConv: Conversation | null = null;
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === activeConvId);
      let updated: Conversation[];
      if (exists) {
        updated = prev.map((c) => {
          if (c.id === activeConvId) {
            const currentTitle = c.title === 'New Conversation' ? convTitle : c.title;
            const item = { ...c, title: currentTitle, messages: newMessages, modelTier: c.modelTier || selectedModelTier };
            targetConv = item;
            return item;
          }
          return c;
        });
      } else {
        const newConv: Conversation = {
          id: activeConvId,
          title: convTitle,
          createdAt: new Date().toISOString(),
          messages: newMessages,
          modelTier: selectedModelTier,
        };
        targetConv = newConv;
        updated = [newConv, ...prev];
      }
      return updated;
    });

    if (targetConv) {
      upsertAiConversation(targetConv, profile.id);
    }


    try {
      let replyContent = '';
      let detectedMilestone: string | null = null;
      let detectedProfileUpdate: Record<string, any> | null = null;

      let detectedChoices: InteractiveChoices | undefined;

            // Gather user recent activity & attendance brief for personalized context
      let recentActivityList: any[] = [];
      let calculatedAttendanceBrief: any = null;
      try {
        recentActivityList = await getUserRecentActivity(profile.id);
        const userLogs = await fetchAttendanceLogs(profile.id);
        const dynamicTimetable = generateAssumedTimetable(profile.institution, profile.department, profile.level);
        calculatedAttendanceBrief = computeStudentAttendanceBrief(userLogs, dynamicTimetable);
      } catch (err) {
        console.warn('Could not compile attendance brief for AI:', err);
      }

      let detectedInteractiveQuestion: InteractiveQuizQuestion | undefined;
      let detectedCgpaReport: any | undefined;
      let detectedTimetable: any[] | undefined;
      let detectedSimplifiedBlend: any | undefined;
      let detectedClockWidget: { type: 'circular' | 'rectangular'; time?: string; timezone?: string; position?: 'top' | 'bottom' } | undefined;
      let detectedLinkEmbed: LinkEmbedPayload | undefined;

      // Tier 1: Local /api/ai Next.js route with Multi-Turn History
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: query,
            context: currentMode,
            studentProfile: profile,
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            recentActivity: recentActivityList,
            attendanceBrief: calculatedAttendanceBrief,
            modelTier: selectedModelTier,
            replyContext: activeReplyContext,
            fileData: currentAttachments.length > 0 ? {
              base64: currentAttachments[0].base64,
              textContent: currentAttachments[0].textContent,
              mimeType: currentAttachments[0].type,
              fileName: currentAttachments[0].name,
              strategy: currentAttachments[0].strategy,
            } : undefined,
            filesData: currentAttachments.map((f) => ({
              base64: f.base64,
              textContent: f.textContent,
              mimeType: f.type,
              fileName: f.name,
              strategy: f.strategy,
            })),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          replyContent = data.reply;
          const returnedModelTier = data.modelTier || selectedModelTier;
          const returnedModelName = data.model || 'Lumen Core';
          if (data.milestoneAction) detectedMilestone = data.milestoneAction;
          if (data.interactiveChoices) detectedChoices = data.interactiveChoices;
          if (data.interactiveQuestion) detectedInteractiveQuestion = data.interactiveQuestion;
          detectedClockWidget = data.clockWidget;
          const lowerQ = query.toLowerCase();
          const mentionsTime = lowerQ.includes('time') || lowerQ.includes('what hour') || lowerQ.includes('clock');
          if (!detectedClockWidget && mentionsTime) {
            const isPureTime = lowerQ.length < 35 && (lowerQ.includes('what time') || lowerQ.includes('tell me the time') || lowerQ.includes('what is the time') || lowerQ.includes('current time'));
            if (isPureTime) {
              detectedClockWidget = { type: 'circular', timezone: 'WAT' };
            } else {
              detectedClockWidget = {
                type: 'rectangular',
                timezone: 'WAT',
                position: replyContent.length > 180 ? 'top' : 'bottom',
              };
            }
          }
          if (data.parsedCgpaReport) detectedCgpaReport = data.parsedCgpaReport;
          if (data.parsedTimetable) detectedTimetable = data.parsedTimetable;
          if (data.simplifiedBlend) detectedSimplifiedBlend = data.simplifiedBlend;
          if (data.linkEmbed) detectedLinkEmbed = data.linkEmbed;
          if (data.profileAction) {
            detectedProfileUpdate = data.profileAction;
            if (onUpdateProfile) onUpdateProfile(data.profileAction);
          }

          // If documents were attached, archive semantic context for each
          if (currentAttachments && currentAttachments.length > 0 && replyContent) {
            currentAttachments.forEach((att) => {
              saveDocumentContext({
                originalFileName: att.name,
                fileCategory: att.name.toLowerCase().includes('result') ? 'result_slip' : (att.name.toLowerCase().includes('time') ? 'timetable' : 'lecture_note'),
                uploadedAt: new Date().toISOString(),
                department: profile.department || 'General',
                institution: profile.institution || 'OOU',
                summary: replyContent.slice(0, 300),
                keyConcepts: [profile.department || 'Curriculum', 'Session 2024/2025'],
                extractedFacts: { detectedCgpaReport, detectedTimetable },
                tags: ['multimodal_scan', profile.department || 'student'],
              });
            });
          }
        }
      } catch {
        // Fallback to Tier 2
      }

      // Tier 2: Direct Supabase Edge Function fallback
      if (!replyContent) {
        try {
          const edgeRes = await fetch('https://fnqnxdmdyevzavsbfelv.supabase.co/functions/v1/ai', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucW54ZG1keWV2emF2c2JmZWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MTI3NDUsImV4cCI6MjEwNTQ4ODc0NX0.BdJAhqwdSiPbGHCb5d3KbwNHalTlbO1jaqWTgXvVz6A',
            },
            body: JSON.stringify({
              prompt: query,
              context: currentMode,
              studentProfile: profile,
              messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            }),
          });
          if (edgeRes.ok) {
            const data = await edgeRes.json();
            replyContent = data.reply;
            if (data.milestoneAction) {
              detectedMilestone = data.milestoneAction;
            }
          }
        } catch {
          // Fallback to Tier 3 Knowledge Base
        }
      }

      // Tier 3: Local OOU Knowledge Base matching
      if (!replyContent) {
        const lower = query.toLowerCase();
        for (const [k, v] of Object.entries(KNOWLEDGE_BASE)) {
          if (lower.includes(k)) {
            replyContent = v.reply;
            break;
          }
        }
      }

      if (!replyContent) {
        replyContent = `Here is the guidance for your question: "${query}".\n\nFor topics in ${profile.department || 'your department'}, review your lecture notes or ask me to explain any specific concept in simple English.`;
      }

      if (detectedMilestone && onMilestoneAction) {
        onMilestoneAction(detectedMilestone);
      }

            // Parse [INTERACTIVE_QUESTION:{...}] fallback
      const iqMatch = replyContent.match(/\[INTERACTIVE_QUESTION:(\{[\s\S]*?\})\]/);
      if (iqMatch) {
        try { detectedInteractiveQuestion = JSON.parse(iqMatch[1]); } catch {}
        replyContent = replyContent.replace(/\[INTERACTIVE_QUESTION:\{[\s\S]*?\}\]/g, '').trim();
      }

      // Parse [CGPA_REPORT:{...}] fallback
      const cgpaMatch = replyContent.match(/\[CGPA_REPORT:(\{[\s\S]*?\})\]/);
      if (cgpaMatch) {
        try { detectedCgpaReport = JSON.parse(cgpaMatch[1]); } catch {}
        replyContent = replyContent.replace(/\[CGPA_REPORT:\{[\s\S]*?\}\]/g, '').trim();
      }

      // Parse [SET_TIMETABLE:[...]] fallback
      const ttMatch = replyContent.match(/\[SET_TIMETABLE:(\[[\s\S]*?\])\]/);
      if (ttMatch) {
        try { detectedTimetable = JSON.parse(ttMatch[1]); } catch {}
        replyContent = replyContent.replace(/\[SET_TIMETABLE:\[[\s\S]*?\]\]/g, '').trim();
      }

      // Parse any [INTERACTIVE_CHOICES:{...}] payload in reply text
      const choicesMatch = replyContent.match(/\[INTERACTIVE_CHOICES:(\{[\s\S]*?\})\]/);
      if (choicesMatch) {
        try {
          detectedChoices = JSON.parse(choicesMatch[1]);
        } catch {}
        replyContent = replyContent.replace(/\[INTERACTIVE_CHOICES:\{[\s\S]*?\}\]/g, '').trim();
      }

      // Parse and sync any [UPDATE_PROFILE:{...}] payload in reply text
      let profileUpdatedNote: string | undefined;
      const profileMatch = replyContent.match(/\[UPDATE_PROFILE:(\{[\s\S]*?\})\]/);
      if (profileMatch) {
        try {
          const parsed = JSON.parse(profileMatch[1]);
          if (onUpdateProfile) {
            onUpdateProfile(parsed);
          }
          detectedProfileUpdate = parsed;
        } catch {}
        replyContent = replyContent.replace(/\[UPDATE_PROFILE:\{[\s\S]*?\}\]/g, '').trim();
      }

      // Parse any [QUIZ_GENERATED:{...}] payload in reply text
      let detectedQuiz: QuizData | undefined;
      const quizMatch = replyContent.match(/\[QUIZ_GENERATED:(\{[\s\S]*?\})\]/);
      if (quizMatch) {
        try {
          detectedQuiz = JSON.parse(quizMatch[1]);
        } catch {}
        replyContent = replyContent.replace(/\[QUIZ_GENERATED:\{[\s\S]*?\}\]/g, '').trim();
      }

      // Parse any [STUDY_KIT:{...}] payload in reply text (Exam Done and Dusted Module)
      let detectedStudyKit: StudyKitPayload | undefined;
      const kitMatch = replyContent.match(/\[STUDY_KIT:(\{[\s\S]*?\})\]/);
      if (kitMatch) {
        try {
          detectedStudyKit = JSON.parse(kitMatch[1]);
        } catch {}
        replyContent = replyContent.replace(/\[STUDY_KIT:\{[\s\S]*?\}\]/g, '').trim();
      }

      if (!detectedLinkEmbed) {
        const linkEmbedMatch = replyContent.match(/\[LINK_EMBED:(\{[\s\S]*?\})\]/);
        if (linkEmbedMatch) {
          try {
            detectedLinkEmbed = JSON.parse(linkEmbedMatch[1]);
          } catch {}
        }
      }

      if (detectedProfileUpdate) {
        const fields = Object.entries(detectedProfileUpdate)
          .map(([k, v]) => `${k.replace('_', ' ')}: ${v}`)
          .join(', ');
        profileUpdatedNote = `Profile Synced: ${fields}`;
      }

      // Strictly strip any residual citation or context footers
      replyContent = replyContent
        .replace(/\n*\*?(?:Discussion Context|Course Reference|Campus Reference|Reference):\s*.*?\*?$/gim, '')
        .trim();

      // Detect venue match for direct map pin button (Only for OOU students)
      let venueCode: string | undefined;
      if (profile.institution === 'OOU') {
        const lower = query.toLowerCase();
        if (lower.includes('llt3') || lower.includes('llt 3')) venueCode = 'LLT-3';
        else if (lower.includes('llt1') || lower.includes('llt 1')) venueCode = 'LLT-1';
        else if (lower.includes('llt2') || lower.includes('llt 2')) venueCode = 'LLT-2';
        else if (lower.includes('sport') || lower.includes('stadium')) venueCode = 'SPORT-CTR';
        else if (lower.includes('motion') || lower.includes('saburi')) venueCode = 'NEW-MOTION';
        else if (lower.includes('health') || lower.includes('clinic')) venueCode = 'HEALTH-CTR';
      }

      const assistantMsg: Message = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: venueCode ? { label: `Show ${venueCode} on Map`, venueCode } : undefined,
        interactiveChoices: detectedChoices,
        generatedQuiz: detectedQuiz,
        studyKit: detectedStudyKit,
        interactiveQuestion: detectedInteractiveQuestion,
        parsedCgpaReport: detectedCgpaReport,
        parsedTimetable: detectedTimetable,
        simplifiedBlend: detectedSimplifiedBlend,
        linkEmbed: detectedLinkEmbed,
        modelTier: selectedModelTier,
        modelName: AI_MODELS[selectedModelTier]?.name || 'Lumen Astral',
        clockWidget: detectedClockWidget,
      };

      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);

      let finalConv: Conversation | null = null;
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === activeConvId) {
            finalConv = { ...c, messages: finalMessages, modelTier: selectedModelTier };
            return finalConv;
          }
          return c;
        });
        return updated;
      });

      if (finalConv) {
        upsertAiConversation(finalConv, profile.id);
      }
    } catch {
      const errAssistantMsg: Message = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: 'Network connection issue. Please check your internet connection and try again.\n\n*Reference: Network Diagnostics*',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errAssistantMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)] font-sans select-none transition-colors duration-200">
      {/* Sleek Left Slide-Out Sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70 backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-white/95 dark:bg-[#10131B]/95 border-r border-black/[0.08] dark:border-white/[0.08] flex flex-col justify-between backdrop-blur-xl transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex flex-col h-full overflow-hidden">
          {/* Sidebar Top: Branding & Close */}
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 text-[#0B57D0] dark:text-[#1A73E8]">
                <GeminiIcon name="chat" size={24} />
              </div>
              <div>
                <h3 className="text-xs font-semibold tracking-tight text-neutral-900 dark:text-white">Cohart AI</h3>
                <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">Sessions</p>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <GeminiIcon name="close" size={16} />
            </button>
          </div>

          {/* New Chat Action */}
          <div className="mt-3">
            <button
              onClick={() => handleStartNewChat('general')}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0B57D0] hover:bg-[#0B57D0]/90 text-white text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <span className="text-sm font-bold leading-none">+</span>
              <span>New Conversation</span>
            </button>
          </div>

          {/* Conversations History List */}
          <div className="mt-4 flex-1 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-2">
              Recent Chats
            </span>

            {conversations.length === 0 ? (
              <p className="px-2 py-3 text-xs text-neutral-500 italic">No past conversations</p>
            ) : (
              conversations.map((c) => {
                const isActive = c.id === activeConvId;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConversation(c)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-black/[0.06] dark:bg-white/[0.08] text-neutral-900 dark:text-white font-medium border border-black/[0.08] dark:border-white/[0.1]'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-2">
                      <GeminiIcon
                        name={c.title.toLowerCase().includes('grill') ? 'zap' : 'chat'}
                        size={14}
                        className={isActive ? 'text-[#0B57D0] dark:text-[#1A73E8]' : 'text-neutral-400'}
                      />
                      <span className="truncate text-xs">{c.title}</span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteConversation(e, c.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-500 transition-opacity cursor-pointer ml-1"
                      title="Delete chat"
                    >
                      <GeminiIcon name="trash" size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar Footer: Return to Reader */}
          {onExitFullscreen && (
            <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                onClick={onExitFullscreen}
                className="flex items-center gap-2 w-full p-2.5 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <GeminiIcon name="reader" size={15} />
                <span>Back to Course Reader</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Full-Screen AI Content Workstation */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Minimalist Liquid Glass Top Bar */}
        <header className="h-14 px-3 sm:px-4 shrink-0 flex items-center justify-between border-b border-black/[0.05] dark:border-white/[0.06] bg-white/70 dark:bg-[#050507]/75 backdrop-blur-3xl relative z-20">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Custom 2-Sleek-Lines Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-9 h-9 rounded-full text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="Open Chat Sessions"
            >
              <GeminiIcon name="two-lines" size={17} />
            </button>

            {/* Aurora Model Tier Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-neutral-800 dark:text-neutral-200 text-xs font-semibold hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all cursor-pointer shadow-xs"
                title="Choose Aurora Intelligence Engine"
              >
                <GeminiIcon name="sparkle" size={12} className="text-[#0B57D0] dark:text-[#1A73E8]" />
                <span className="hidden sm:inline">{AI_MODELS[selectedModelTier]?.name || 'Aurora Lumen'}</span>
                <span className="sm:hidden font-mono text-[11px]">{AI_MODELS[selectedModelTier]?.badge || 'Lumen'}</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 uppercase hidden md:inline">
                  {AI_MODELS[selectedModelTier]?.speed}
                </span>
                <GeminiIcon name="chevron-down" size={10} />
              </button>

              {isModelMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#151922] border border-black/[0.08] dark:border-white/[0.1] shadow-2xl p-2 z-30 space-y-1 backdrop-blur-2xl animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold border-b border-black/[0.06] dark:border-white/[0.06] mb-1 flex items-center justify-between">
                    <span>Lumen Intelligence Tier</span>
                    <span>Performance</span>
                  </div>
                  {(['lyric', 'prism', 'astral', 'zenith', 'mythos'] as ModelTierId[]).map((tierId) => {
                    const tier = AI_MODELS[tierId];
                    if (!tier) return null;
                    const isSelected = selectedModelTier === tierId;
                    return (
                      <button
                        key={tierId}
                        type="button"
                        onClick={() => handleSelectModelTier(tierId)}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 border border-[#0B57D0]/30 text-neutral-900 dark:text-white'
                            : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <div className="mt-0.5">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                            tier.badge === 'Lyric' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                            tier.badge === 'Prism' ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20' :
                            tier.badge === 'Astral' ? 'bg-[#0B57D0]/15 text-[#0B57D0] dark:text-[#1A73E8] border border-[#0B57D0]/20' :
                            tier.badge === 'Zenith' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                            'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {tier.badge}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-900 dark:text-white">{tier.name}</span>
                            {isSelected && <GeminiIcon name="check" size={13} className="text-[#0B57D0] dark:text-[#1A73E8]" />}
                          </div>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                            {tier.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Floating AI Status Island (from Muse/Babe reference screen_093400/screen_093549) */}
          <div className="hidden md:flex flex-col items-center justify-center select-none pointer-events-none">
            <div className="px-3.5 py-1 rounded-full liquid-glass flex items-center gap-2 shadow-xs transition-all">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isTyping ? 'bg-[#1A73E8] animate-ping' : isRecording ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`} />
                <span className="text-xs font-bold tracking-tight text-neutral-900 dark:text-white font-sans">
                  Aurora
                </span>
              </div>
              <span className="text-neutral-400 dark:text-neutral-600 text-[10px]">•</span>
              <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 truncate max-w-[160px] lg:max-w-[220px]">
                {isTyping
                  ? 'Researching syllabus...'
                  : isRecording
                  ? 'Listening (Deepgram)...'
                  : isTranscribing
                  ? 'Transcribing audio...'
                  : currentMode === 'grill_mode'
                  ? 'Exam Practice CBT'
                  : 'Active • Ready'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Arena Live Spectator Button */}
            <button
              type="button"
              onClick={() => setShowArenaViewer(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold hover:bg-rose-500/20 transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Watch Campus Arena Tournaments & Win Free Tones"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="hidden sm:inline">Arena Live</span>
              <span className="sm:hidden font-mono text-[10px]">Arena</span>
            </button>

            {/* Compute Tones Meter Badge Button */}
            <button
              type="button"
              onClick={() => setShowProModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 dark:text-amber-400 text-xs font-mono font-bold hover:bg-amber-500/20 transition-all active:scale-95 cursor-pointer shadow-xs"
              title="View Study Tones & Subscription Tiers"
            >
              <span></span>
              <span>{userTones}</span>
            </button>

            {/* New Chat Action */}
            <button
              onClick={() => handleStartNewChat('general')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Start New Conversation"
            >
              <span className="text-sm font-bold leading-none">+</span>
              <span className="hidden sm:inline">New Chat</span>
            </button>

            {/* Clean Exit / Back Action */}
            {onExitFullscreen && (
              <button
                onClick={onExitFullscreen}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 text-[#0B57D0] dark:text-[#1A73E8] hover:bg-[#0B57D0]/20 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                title="Return to Campus Hub"
              >
                <GeminiIcon name="arrow-left" size={15} />
                <span>Back</span>
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Chat Message Stream */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 max-w-3xl w-full mx-auto"
        >
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`relative flex flex-col ${isUser ? 'items-end' : 'items-start'} group w-full`}
              >
                {/* Swipe Reply Gesture Indicator Backdrop */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[#1A73E8] pointer-events-none opacity-0 group-hover:opacity-60 transition-opacity">
                  <GeminiIcon name="arrow-left" size={14} className="rotate-180" />
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Swipe to reply</span>
                </div>

                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 65 }}
                  dragElastic={0.15}
                  onDragEnd={(_, info) => {
                    if (info.offset.x > 38) {
                      setReplyingTo({
                        id: m.id,
                        role: m.role,
                        senderName: isUser ? 'You' : (m.modelName || 'Aurora'),
                        snippet: m.content.slice(0, 100),
                      });
                    }
                  }}
                  className={`max-w-[88%] sm:max-w-[84%] rounded-[1.4rem] p-4 text-sm sm:text-[15px] leading-relaxed transition-all shadow-xs relative z-10 ${
                    isUser
                      ? 'bg-[#1A73E8] text-white rounded-br-sm shadow-md'
                      : 'liquid-glass text-neutral-900 dark:text-neutral-100 rounded-bl-sm dark:bg-white/[0.035] dark:border-white/[0.07]'
                  }`}
                >
                  <div className={`flex items-center justify-between text-xs font-semibold mb-2 ${isUser ? 'text-white/80' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    <span>{isUser ? 'You' : `Aurora (${m.modelTier ? (AI_MODELS[m.modelTier as ModelTierId]?.badge || 'Lumen') : 'Lumen'})`} • {m.timestamp}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setReplyingTo({
                            id: m.id,
                            role: m.role,
                            senderName: isUser ? 'You' : (m.modelName || 'Lumen'),
                            snippet: m.content.slice(0, 100),
                          });
                        }}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                          isUser
                            ? 'hover:bg-white/20 text-white/80 hover:text-white'
                            : 'hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-neutral-400 hover:text-[#0B57D0] dark:hover:text-[#1A73E8]'
                        }`}
                        title="Reply to this message"
                      >
                        <GeminiIcon name="arrow-left" size={11} className="rotate-180" />
                        <span>Reply</span>
                      </button>
                      {!isUser && (
                        <button
                          onClick={() => handleSpeakMessage(m.id, m.content)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                            speakingMsgId === m.id
                              ? 'bg-[#0B57D0]/20 text-[#0B57D0] dark:text-[#1A73E8]'
                              : 'hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                          }`}
                          title={speakingMsgId === m.id ? 'Stop listening' : 'Listen with Cohart AI Voice'}
                        >
                          {isSynthesizing === m.id ? (
                            <GeminiIcon name="loader" size={14} />
                          ) : speakingMsgId === m.id ? (
                            <>
                              <GeminiIcon name="volume-x" size={14} />
                              <span className="text-[10px] font-bold">Stop</span>
                            </>
                          ) : (
                            <>
                              <GeminiIcon name="volume" size={14} />
                              <span className="text-[10px] font-bold">Listen</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quoted Message Context Preview */}
                  {m.replyTo && (
                    <div className={`mb-2.5 p-2 rounded-xl text-xs border-l-2 ${
                      isUser
                        ? 'bg-black/20 border-white/70 text-white/90'
                        : 'bg-black/[0.03] dark:bg-white/[0.04] border-[#0B57D0] dark:border-[#1A73E8] text-neutral-700 dark:text-neutral-300'
                    }`}>
                      <div className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider mb-0.5 opacity-80">
                        <span>Replying to {m.replyTo.senderName || (m.replyTo.role === 'user' ? 'You' : 'Lumen')}</span>
                      </div>
                      <p className="line-clamp-2 italic text-[11px]">
                        "{m.replyTo.snippet}"
                      </p>
                    </div>
                  )}

                  {isUser ? (
                    <div>
                      <p className="whitespace-pre-wrap">{m.content}</p>
                      {((m.attachedFiles && m.attachedFiles.length > 0) || m.attachedFile) && (
                        <div className="mt-2.5 flex flex-wrap gap-1.5 pt-2 border-t border-white/20">
                          {(m.attachedFiles || (m.attachedFile ? [m.attachedFile] : [])).map((att, attIdx) => (
                            <div key={attIdx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 text-[11px] font-mono">
                              <span className="font-bold text-[9px] px-1 py-0.2 rounded bg-white text-[#0B57D0]">
                                {getFileTypeBadge(att.name, att.type)}
                              </span>
                              <span className="truncate max-w-[140px] font-sans font-medium">{att.name}</span>
                              <span className="opacity-75 text-[10px]">({(att.sizeBytes / 1024).toFixed(0)}KB)</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                    {/* Circular Animated Clock (when user asks for time only) */}
                    {m.clockWidget?.type === 'circular' && (
                      <AnimatedCircularClock timezone={m.clockWidget.timezone || 'WAT'} />
                    )}

                    {/* Rectangular Digital Clock (when paired with discussion - top position) */}
                    {m.clockWidget?.type === 'rectangular' && (m.clockWidget.position === 'top' || !m.clockWidget.position) && (
                      <AnimatedRectangularClock timezone={m.clockWidget.timezone || 'WAT'} />
                    )}

                    <MarkdownText content={m.content} />

                    {/* Rectangular Digital Clock (when paired with discussion - bottom position) */}
                    {m.clockWidget?.type === 'rectangular' && m.clockWidget.position === 'bottom' && (
                      <AnimatedRectangularClock timezone={m.clockWidget.timezone || 'WAT'} />
                    )}
                      {/* Copy & Download Action Bar */}
                      <div className="mt-3 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(m.id, m.content)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                            title="Copy full text"
                          >
                            <GeminiIcon name={copiedMsgId === m.id ? 'check' : 'copy'} size={13} />
                            <span className="text-[11px] font-medium">{copiedMsgId === m.id ? 'Copied!' : 'Copy'}</span>
                          </button>

                          {/* Export / Download Dropdown Menu */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveDownloadMenuMsgId(activeDownloadMenuMsgId === m.id ? null : m.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                              title="Download as .txt, .docx, or .pdf"
                            >
                              <GeminiIcon name="download" size={13} />
                              <span className="text-[11px] font-medium">Export</span>
                              <GeminiIcon name="chevron-down" size={10} />
                            </button>

                            {activeDownloadMenuMsgId === m.id && (
                              <div className="absolute left-0 bottom-full mb-1.5 w-44 rounded-xl bg-white dark:bg-[#1C202A] border border-black/[0.08] dark:border-white/[0.1] shadow-xl p-1.5 z-20 space-y-0.5 animate-in fade-in zoom-in-95">
                                <button
                                  type="button"
                                  onClick={() => {
                                    downloadAsText(`Cohart_Notes_${Date.now()}`, m.content);
                                    setActiveDownloadMenuMsgId(null);
                                  }}
                                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors text-left cursor-pointer"
                                >
                                  <span>Plain Text</span>
                                  <span className="text-[10px] font-mono text-neutral-400">.TXT</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    downloadAsDocx(`Cohart_Notes_${Date.now()}`, 'Cohart Academic Notes', m.content);
                                    setActiveDownloadMenuMsgId(null);
                                  }}
                                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors text-left cursor-pointer"
                                >
                                  <span>Word Document</span>
                                  <span className="text-[10px] font-mono text-neutral-400">.DOCX</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    downloadAsPdf(`Cohart_Notes_${Date.now()}`, 'Cohart Academic Notes', m.content);
                                    setActiveDownloadMenuMsgId(null);
                                  }}
                                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors text-left cursor-pointer"
                                >
                                  <span>Print / PDF</span>
                                  <span className="text-[10px] font-mono text-neutral-400">.PDF</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Speed / Tier Indicator */}
                        <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                          {m.modelTier ? AI_MODELS[m.modelTier as ModelTierId]?.speed || 'Balanced' : 'Balanced'}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Interactive Choices Checklist Form */}
                  {m.interactiveChoices && m.interactiveChoices.options && (
                    <div className="mt-3 pt-3 border-t border-black/[0.08] dark:border-white/[0.08] space-y-2.5">
                      {m.interactiveChoices.title && (
                        <p className="text-[11px] font-mono font-medium text-neutral-600 dark:text-neutral-400">
                          {m.interactiveChoices.title}
                        </p>
                      )}
                      <div className="flex flex-col gap-1.5">
                        {m.interactiveChoices.options.map((opt) => {
                          const currentSelected = selectedChoices[m.id] || [];
                          const isChecked = currentSelected.includes(opt);
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                const multi = m.interactiveChoices?.multiSelect !== false;
                                setSelectedChoices((prev) => {
                                  const existing = prev[m.id] || [];
                                  if (multi) {
                                    const next = existing.includes(opt)
                                      ? existing.filter((item) => item !== opt)
                                      : [...existing, opt];
                                    return { ...prev, [m.id]: next };
                                  } else {
                                    return { ...prev, [m.id]: [opt] };
                                  }
                                });
                              }}
                              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left transition-all border cursor-pointer ${
                                isChecked
                                  ? 'bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 border-[#0B57D0]/40 dark:border-[#1A73E8]/40 text-[#0B57D0] dark:text-[#1A73E8] font-medium'
                                  : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                              }`}
                            >
                              <span>{opt}</span>
                              <div
                                className={`h-4 w-4 rounded-md flex items-center justify-center border transition-all ${
                                  isChecked
                                    ? 'bg-[#0B57D0] dark:bg-[#1A73E8] border-transparent text-white dark:text-neutral-950'
                                    : 'border-neutral-400 dark:border-neutral-600'
                                }`}
                              >
                                {isChecked && <GeminiIcon name="check" size={11} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Done Submit Button */}
                      {(selectedChoices[m.id] || []).length > 0 && (
                        <div className="pt-1 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const chosen = selectedChoices[m.id] || [];
                              handleSend(`I choose: ${chosen.join(', ')}`);
                            }}
                            className="px-4 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                          >
                            Done ({selectedChoices[m.id]?.length})
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* In-Chat Single Interactive Question Card */}
                  {m.interactiveQuestion && (
                    <div className="mt-3.5 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] shadow-sm space-y-3 font-sans">
                      {/* Question Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-[#0B57D0]/10 text-[#0B57D0] dark:text-[#8AB4F8] border border-[#0B57D0]/20">
                            {m.interactiveQuestion.courseCode || 'Exam Practice'}
                          </span>
                          <span className="text-xs font-bold text-neutral-900 dark:text-white">
                            Active Knowledge Check
                          </span>
                        </div>
                        {quizStreak > 0 && (
                          <span className="flex items-center gap-1 text-[10.5px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <GeminiIcon name="flame" size={11} />
                            <span>{quizStreak} Streak</span>
                          </span>
                        )}
                      </div>

                      {/* Question Text */}
                      <p className="text-[13px] font-semibold text-neutral-900 dark:text-white leading-relaxed">
                        {m.interactiveQuestion.question}
                      </p>

                      {/* Options List */}
                      <div className="space-y-2 pt-1">
                        {m.interactiveQuestion.options.map((opt, optIdx) => {
                          const answerState = answeredQuestions[m.id];
                          const hasAnswered = Boolean(answerState);
                          const isUserPick = hasAnswered && answerState?.selectedIndex === optIdx;
                          const isCorrectOption = optIdx === m.interactiveQuestion!.correctIndex;

                          let btnStyle = 'border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] text-neutral-800 dark:text-neutral-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]';

                          if (hasAnswered) {
                            if (isCorrectOption) {
                              // Sharp Electric Green for Correct
                              btnStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold shadow-md shadow-emerald-500/10';
                            } else if (isUserPick) {
                              // Sharp Electric Red for Incorrect
                              btnStyle = 'border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold shadow-md shadow-rose-500/10';
                            } else {
                              btnStyle = 'border-black/[0.05] dark:border-white/[0.05] bg-black/[0.01] dark:bg-white/[0.01] text-neutral-400 opacity-60';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={hasAnswered}
                              onClick={() => handleAnswerQuestion(m.id, m.interactiveQuestion!, optIdx)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs text-left transition-all border cursor-pointer ${btnStyle} ${
                                !hasAnswered ? 'active:scale-[0.99]' : 'cursor-default'
                              }`}
                            >
                              <span className="pr-2">{opt}</span>
                              {hasAnswered && isCorrectOption && (
                                <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                                  ✓
                                </span>
                              )}
                              {hasAnswered && isUserPick && !isCorrectOption && (
                                <span className="h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                                  ✕
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Post-Answer Detailed Forensic Breakdown & Memory Anchor */}
                      {answeredQuestions[m.id] && (
                        <div className="mt-3 p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] space-y-2.5 animate-in fade-in duration-300">
                          <div className="flex items-center gap-2">
                            {answeredQuestions[m.id]?.isCorrect ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                CORRECT (+1 STREAK)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                INCORRECT (STREAK RESET)
                              </span>
                            )}
                          </div>

                          {/* Core Solution */}
                          <div>
                            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-semibold block mb-0.5">
                              Why It's True:
                            </span>
                            <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                              {m.interactiveQuestion.explanation}
                            </p>
                          </div>

                          {/* Why Chosen Is Wrong & Distractor Forensic Analysis */}
                          {(!answeredQuestions[m.id]?.isCorrect || m.interactiveQuestion.whyLooksSimilar) && (
                            <div className="pt-1.5 border-t border-black/[0.04] dark:border-white/[0.06]">
                              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-semibold block mb-0.5">
                                Distractor Phrasing & Common Lecturer Trap:
                              </span>
                              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                {m.interactiveQuestion.whyChosenIsWrong || m.interactiveQuestion.whyLooksSimilar || 'Lecturers often pair subtle distractor variables to test precise definition recall.'}
                              </p>
                            </div>
                          )}

                          {/* Psychological Memory Hook */}
                          {m.interactiveQuestion.psychologicalMemoryHook && (
                            <div className="pt-1.5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-start gap-2 bg-[#0B57D0]/[0.03] dark:bg-[#1A73E8]/[0.05] p-2 rounded-lg">
                              <GeminiIcon name="sparkle" size={14} className="text-[#0B57D0] dark:text-[#8AB4F8] shrink-0 mt-0.5" />
                              <div>
                                <span className="text-[10px] font-mono text-[#0B57D0] dark:text-[#8AB4F8] uppercase tracking-wider font-bold block mb-0.5">
                                  Psychological Memory Hook:
                                </span>
                                <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
                                  {m.interactiveQuestion.psychologicalMemoryHook}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Next Question Action Button */}
                          <div className="pt-2 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleSend(`Give me another challenging single-question practice drill on ${m.interactiveQuestion?.courseCode || 'my course syllabus'}.`)}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-xs"
                            >
                              <span>Next Question</span>
                              <GeminiIcon name="arrow-right" size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Generated Quiz Action Card */}
                  {m.generatedQuiz && (
                    <div className="mt-3.5 p-4 rounded-2xl bg-gradient-to-br from-[#0B57D0]/10 to-[#1A73E8]/5 border border-[#0B57D0]/30 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-[#0B57D0]/20 text-[#0B57D0] dark:text-[#1A73E8] border border-[#0B57D0]/30">
                            {m.generatedQuiz.courseCode}
                          </span>
                          <span className="text-xs font-bold text-neutral-900 dark:text-white">
                            {m.generatedQuiz.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {m.generatedQuiz.questions?.length || 0} Questions • {m.generatedQuiz.type === 'theory' ? 'Theory' : 'Objective'}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-600 dark:text-neutral-300">
                        Exam practice questions ready. Start the quiz in a distraction-free test interface or share it with your peers.
                      </p>

                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (onStartQuiz && m.generatedQuiz) {
                              onStartQuiz(m.generatedQuiz);
                            } else if (m.generatedQuiz) {
                              setActiveRunningQuiz(m.generatedQuiz);
                            }
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white font-bold font-mono text-xs hover:opacity-90 transition-all active:scale-95 cursor-pointer shadow-md shadow-[#0B57D0]/20"
                        >
                          <GeminiIcon name="zap" size={13} />
                          <span>Start Quiz</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (typeof window !== 'undefined' && m.generatedQuiz) {
                              try {
                                const encoded = encodeURIComponent(
                                  btoa(unescape(encodeURIComponent(JSON.stringify(m.generatedQuiz))))
                                );
                                const shareUrl = `${window.location.origin}/?tab=quiz&quizPayload=${encoded}`;
                                navigator.clipboard.writeText(shareUrl);
                                alert('Quiz share link copied to clipboard! Share it with your course mates.');
                              } catch {
                                const shareUrl = `${window.location.origin}/?tab=quiz&quizId=${m.generatedQuiz.id}`;
                                navigator.clipboard.writeText(shareUrl);
                                alert('Quiz link copied to clipboard!');
                              }
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-xs font-mono text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                        >
                          <GeminiIcon name="share" size={13} />
                          <span>Share</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleSend(`Please add 10 more questions to the ${m.generatedQuiz?.courseCode} practice quiz under the same syllabus.`);
                          }}
                          className="px-3 py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-xs font-mono text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                        >
                          + Add 10 More
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AI Study Kit Widget (Exam Done and Dusted Module) */}
                  {m.studyKit && (
                    <StudyKitWidget
                      kit={m.studyKit}
                      onLaunchFullQuiz={(quizData) => {
                        if (onStartQuiz) onStartQuiz(quizData);
                        else setActiveRunningQuiz(quizData);
                      }}
                    />
                  )}

                  {/* Suggested Map Action Pin */}
                  {m.suggestedAction && onSelectVenue && (
                    <div className="mt-3 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08]">
                      <button
                        onClick={() => onSelectVenue(m.suggestedAction!.venueCode)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <GeminiIcon name="pin" size={12} />
                        <span>{m.suggestedAction.label}</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })}

          {/* Real-time Agentic Research & Thinking Capsule (from screen_093400) */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              className="flex flex-col items-start gap-2 max-w-[90%] sm:max-w-md w-full"
            >
              {/* Agentic Activity Card from reference */}
              <div className="p-3 rounded-2xl liquid-glass flex items-center gap-3 w-full shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 border border-[#0B57D0]/20 flex items-center justify-center text-[#0B57D0] dark:text-[#1A73E8] shrink-0">
                  <GeminiIcon name="sparkle" size={15} className="animate-spin text-[#1A73E8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {currentMode === 'grill_mode' ? 'Exam CBT Engine' : 'Aurora Intelligence'}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#1A73E8]/15 text-[#1A73E8] border border-[#1A73E8]/25 font-semibold">
                      Thinking
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5 font-mono">
                    {attachedFiles.length > 0
                      ? `Analyzing ${attachedFiles.length} attached document(s)...`
                      : 'Cross-referencing NUC syllabus & campus context...'}
                  </p>
                </div>
              </div>

              {/* 3-pulse typing dots */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1A73E8] animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#1A73E8] animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#1A73E8] animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Floating Bottom Input Dock with Liquid Glass - pb-24 clearance for floating BottomNav */}
        <footer className="p-3 sm:p-4 border-t border-black/[0.06] dark:border-white/[0.06] bg-white dark:bg-[#131314] shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Quick Context Prompt Chips */}
            {messages.length <= 2 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                  onClick={() => handleSend('Generate a complete all-in-one AI Study Kit (exam summary, active flashcards, CBT drill, checklist, and lecturer predictions) for my courses.')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  <GeminiIcon name="sparkle" size={13} />
                  <span>AI Study Kit</span>
                </button>
                <button
                  onClick={() => handleSend('I feel anxious and overwhelmed about my exams. Please give me an exam panic reliever breakdown, psychological calming anchor, and rapid study rescue plan.')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  <GeminiIcon name="zap" size={13} />
                  <span>Panic Reliever</span>
                </button>
                <button
                  onClick={() => handleSend('Set 10 practice exam questions for my courses')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#0B57D0]/30 bg-[#0B57D0]/10 hover:bg-[#0B57D0]/20 text-[#0B57D0] dark:text-[#1A73E8] text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  <GeminiIcon name="zap" size={14} />
                  <span>Practice Questions</span>
                </button>
                <button
                  onClick={() => handleSend('Summarize the key points of my current lecture topic')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  <GeminiIcon name="reader" size={14} />
                  <span>Summarize Topic</span>
                </button>
                <button
                  onClick={() => handleSend('Explain this topic in simple terms with everyday analogies')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                >
                  <GeminiIcon name="chat" size={14} />
                  <span>Explain Simply</span>
                </button>
                {isOou && (
                  <button
                    onClick={() => handleSend('How do I get to my lecture venue from the campus gate?')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                  >
                    <GeminiIcon name="pin" size={14} />
                    <span>Find Hall</span>
                  </button>
                )}
              </div>
            )}

            {/* Attached files preview chips */}
            {attachedFiles.length > 0 && (
              <div className="p-2.5 rounded-xl bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 border border-[#0B57D0]/30 flex flex-col gap-2 animate-in fade-in">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Attached Files ({attachedFiles.length} of {attachedFiles.some((f) => isHeavyFile(f.name, f.type)) ? '3 max' : '5 max'})
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachedFiles([])}
                    className="text-neutral-400 hover:text-rose-500 text-[10px] underline cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {attachedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-[#1A1F2C] border border-black/[0.06] dark:border-white/[0.08] shadow-xs text-xs"
                    >
                      <div className="h-5 w-5 rounded bg-[#0B57D0] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                        {getFileTypeBadge(file.name, file.type)}
                      </div>
                      <span className="text-xs font-medium truncate max-w-[130px] sm:max-w-[180px] text-neutral-900 dark:text-white">
                        {file.name}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        ({(file.sizeBytes / 1024).toFixed(0)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-0.5 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer ml-1"
                        title="Remove file"
                      >
                        
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Quoted Message Reply Banner */}
            {replyingTo && (
              <div className="flex items-center justify-between px-3.5 py-2 mb-2 rounded-2xl liquid-glass border border-[#1A73E8]/30 shadow-md backdrop-blur-2xl animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 overflow-hidden min-w-0">
                  <div className="h-6 w-6 rounded-lg bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 flex items-center justify-center text-[#0B57D0] dark:text-[#1A73E8] shrink-0">
                    <GeminiIcon name="chat" size={13} />
                  </div>
                  <div className="truncate text-xs">
                    <span className="font-bold text-[#0B57D0] dark:text-[#1A73E8]">
                      Replying to {replyingTo.senderName || (replyingTo.role === 'user' ? 'You' : 'Aurora')}:
                    </span>
                    <span className="text-neutral-600 dark:text-neutral-300 ml-1.5 italic truncate">
                      "{replyingTo.snippet}"
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0 ml-2"
                  title="Cancel reply"
                >
                  <GeminiIcon name="close" size={13} />
                </button>
              </div>
            )}

            {/* Input Bar Form: Unified Liquid Glass Pill (Matching reference screen_093400) */}
            <div className="flex items-center gap-1.5 p-1.5 pl-2 rounded-full liquid-glass border border-black/[0.08] dark:border-white/[0.1] focus-within:border-[#1A73E8] dark:focus-within:border-[#1A73E8] transition-all shadow-xl">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf,.txt,.md,.csv,.log,.json,.py,.js,.ts,.jsx,.tsx,.html,.xml,.yaml,.yml,.docx,.doc,.xlsx,.xls,.pptx,.ppt"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Leading Attachment Plus Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-full text-neutral-500 hover:text-[#1A73E8] dark:hover:text-[#8AB4F8] hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                title="Attach files: Up to 3 for PDFs/Images/Word or 5 for text files (Max 10MB total batch)"
              >
                <GeminiIcon name="attachment" size={18} />
              </button>

              {/* Main Message Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  isRecording
                    ? 'Listening... (Speak clearly into mic)'
                    : isTranscribing
                    ? 'Transcribing speech...'
                    : currentMode === 'grill_mode'
                    ? 'Type your answer or tap mic...'
                    : 'Message Aurora...'
                }
                className="flex-1 min-w-0 bg-transparent px-2 py-2 text-sm sm:text-base font-medium text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none font-sans"
              />

              {/* Action Buttons Right: Voice Mic & Solid Electric Blue Send Button */}
              <div className="flex items-center gap-1.5 shrink-0 pr-1">
                <button
                  type="button"
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={isTranscribing}
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer shrink-0 ${
                    isRecording
                      ? 'bg-rose-500 text-white animate-bounce shadow-md'
                      : isTranscribing
                      ? 'bg-amber-500/20 text-amber-500'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08]'
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Voice Input (Deepgram Nova-3)'}
                >
                  {isTranscribing ? (
                    <GeminiIcon name="loader" size={17} />
                  ) : isRecording ? (
                    <GeminiIcon name="mic-off" size={17} />
                  ) : (
                    <GeminiIcon name="mic" size={17} />
                  )}
                </button>

                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1A73E8] hover:bg-[#1A73E8]/90 text-white disabled:opacity-30 transition-all active:scale-95 cursor-pointer shadow-md shrink-0"
                  title="Send message"
                >
                  <GeminiIcon name="arrow-right" size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 px-2 pt-0.5">
              <span>{currentMode === 'grill_mode' ? 'Exam CBT Practice Mode' : 'Aurora OS • Intelligence Engine'}</span>
              <span>Press Enter to send</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Dedicated Full-Screen Distraction-Free QuizRunner */}
      {activeRunningQuiz && (
        <QuizRunner
          quiz={activeRunningQuiz}
          onClose={() => setActiveRunningQuiz(null)}
          onReviewWithAi={(debriefPrompt) => {
            setActiveRunningQuiz(null);
            handleSend(debriefPrompt);
          }}
          onAddMoreQuestions={() => {
            setActiveRunningQuiz(null);
            handleSend(`Please add 10 more questions to this ${activeRunningQuiz.courseCode} practice quiz under the same syllabus.`);
          }}
        />
      )}

      {/* Campus Arena Live Spectator Viewer */}
      {showArenaViewer && (
        <CampusArenaViewer
          onClose={() => setShowArenaViewer(false)}
          onJoinCompetition={(matchId: string) => {
            setShowArenaViewer(false);
            handleSend(`I want to enter and compete in the Campus Arena Tournament match: ${matchId}. Test my academic speed and accuracy!`);
          }}
        />
      )}

      {/* Cohart Scholar Pro & Study Tones Subscription Modal */}
      {showProModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-[#0A0B0E] border border-white/[0.08] text-white p-5 sm:p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#0B57D0]/20 text-[#1A73E8] border border-[#0B57D0]/30">
                    Academic Access
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    Plan: {isExamPassLoanActive() ? 'Pro (Exam Loan Pass)' : userTier.name}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-sans">
                  Lumen Pro & Exam Pass
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProModal(false)}
                className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs font-mono"
              >
                
              </button>
            </div>

            {/* Exam Emergency Pass (Borrow 1 Month Pro for Exams) */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-[#0B57D0]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#0B57D0]/20 text-[#1A73E8] border border-[#0B57D0]/40">
                    Exam Season Grace
                  </span>
                  <span className="text-xs font-bold text-white">
                    Borrow 1 Month Pro (₦0 Today)
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Writing exams and short on cash? Borrow 1 month of Lumen Pro right now. Settle ₦1,500 after your exams.
                </p>
              </div>
              <div className="shrink-0">
                {isExamPassLoanActive() ? (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                       Active Loan Pass
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        settleExamPassLoan();
                        alert('Exam Pass Loan settled! Thank you, scholar.');
                        window.location.reload();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-mono text-neutral-300 transition-colors cursor-pointer"
                    >
                      Settle ₦1,500
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      activateExamPassLoan();
                      alert('Exam Emergency Pass activated! You now have 1 Month of Lumen Pro (2,000 Credits, unlimited uploads) for your exams. Settle ₦1,500 after exams.');
                      window.location.reload();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0B57D0] hover:bg-[#1A73E8] text-white font-bold text-xs font-mono transition-all cursor-pointer whitespace-nowrap shadow-sm"
                  >
                    Activate Exam Pass
                  </button>
                )}
              </div>
            </div>

            {/* Available Credits Card */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Available Study Credits</span>
                <span className="text-xs text-neutral-300">Refills monthly • Transparent student pricing</span>
              </div>
              <span className="text-base font-bold font-mono text-white">
                 {userTones} Credits
              </span>
            </div>

            {/* Institutional Past Questions Compounding Highlight */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1 text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#1A73E8] block">
                Institutional Past Question Bank
              </span>
              <p className="text-neutral-300 leading-relaxed">
                Materials and lecture tests uploaded this year automatically compound into the verified Past Question Bank for next set. Cohart also funds bulk purchases of official campus past questions per department.
              </p>
            </div>

            {/* Subscription Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {Object.values(SUBSCRIPTION_TIERS).filter((t) => t.id !== 'freemium_2').map((tier) => (
                <div
                  key={tier.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    (tier.id === userTierId && !isExamPassLoanActive()) || (tier.id === 'pro_monthly' && isExamPassLoanActive())
                      ? 'bg-[#0B57D0]/10 border-[#0B57D0]/50 ring-1 ring-[#0B57D0]/30'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{tier.name}</span>
                      <span className="text-[11px] font-mono font-bold text-neutral-400">
                        {tier.priceNgn === 0 ? 'Free' : `₦${tier.priceNgn.toLocaleString()}`}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-snug">
                      {tier.tagline}
                    </p>
                    <div className="text-[10px] font-mono text-emerald-400">
                       {tier.monthlyTones.toLocaleString()} Credits • {tier.uploadSessionsPerMonth >= 999 ? 'Unlimited' : `${tier.uploadSessionsPerMonth} uploads`}
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-white/[0.05]">
                    {((tier.id === userTierId && !isExamPassLoanActive()) || (tier.id === 'pro_monthly' && isExamPassLoanActive())) ? (
                      <span className="block text-center text-[10px] font-mono text-[#1A73E8] font-bold py-1">
                        Active
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          alert(`Subscription gateway for ${tier.name} (₦${tier.priceNgn.toLocaleString()}) ready. Card and bank transfer checkout activates.`);
                        }}
                        className="w-full py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[11px] font-mono font-bold transition-all cursor-pointer"
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Hardship Referral Relief (Pay ₦150) */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-white block">Student Hardship: Pay Only 10% (₦150)</span>
                <p className="text-neutral-400 text-[11px]">
                  Refer 3 coursemates to get 90% off for your first month and earn cash rewards into your bank account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const link = `${typeof window !== 'undefined' ? window.location.origin : 'https://cohart.app'}/?ref=${profile.id || 'scholar'}`;
                  navigator.clipboard.writeText(link);
                  alert(`Referral link copied!\n${link}\nShare with 3 coursemates to claim 10% price.`);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-mono font-bold transition-all cursor-pointer shrink-0"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Win & 10-Win Streak Celebration Hype Modal */}
      <AnimatePresence>
        {streakHypeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-sm rounded-3xl bg-[#131314] border border-[#0B57D0]/40 p-6 text-center text-white shadow-2xl relative overflow-hidden font-sans"
            >
              {/* Radial Halo Glow */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-gradient-to-b from-[#1A73E8]/30 via-emerald-500/20 to-transparent blur-2xl pointer-events-none" />

              {/* Hype Trophy / Flame Icon */}
              <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0B57D0]/30 to-emerald-500/20 border border-white/[0.1] flex items-center justify-center text-amber-400 shadow-lg">
                {streakHypeModal.count >= 10 ? (
                  <GeminiIcon name="trophy" size={32} />
                ) : (
                  <GeminiIcon name="flame" size={32} />
                )}
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold mb-3">
                <span>{streakHypeModal.count} CONSECUTIVE WINS</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-2">
                {streakHypeModal.title}
              </h3>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6">
                {streakHypeModal.praise}
              </p>

              <button
                onClick={() => setStreakHypeModal(null)}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#0B57D0] to-[#1A73E8] text-white text-xs font-bold hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-lg shadow-[#0B57D0]/25"
              >
                Keep Stacking Wins 🔥
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sandboxed Code Playground / IDE */}
      {isChatIdeOpen && (
        <MobileCodePlayground
          isOpen={isChatIdeOpen}
          onClose={() => setIsChatIdeOpen(false)}
          initialCode={chatIdeCode}
          initialLanguage={chatIdeLang}
        />
      )}
    </div>
  );
};
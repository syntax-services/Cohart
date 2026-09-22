'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { MarkdownText } from '@/components/atoms/MarkdownText';
import { StudentProfile, Location, COHART_VOICES, DEFAULT_COHART_VOICE, CohartVoiceOption, QuizData } from '@/lib/types';
import { QuizRunner } from './QuizRunner';

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

interface InteractiveChoices {
  title?: string;
  multiSelect?: boolean;
  options: string[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    venueCode: string;
  };
  profileUpdatedBadge?: string;
  interactiveChoices?: InteractiveChoices;
  generatedQuiz?: QuizData;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

const KNOWLEDGE_BASE: Record<string, { reply: string; venueCode?: string }> = {
  llt1: {
    reply: "Here is how to walk to LLT1 (Arts Lecture Theatre I) from the PS Main Gate:\n1. Walk down the main tarred walkway straight past the Security Post towards the bank area (about 2 minutes walk).\n2. Look to your left and you will see the Access Bank ATM.\n3. Turn right directly opposite Access Bank at the Sam Ewang building, and cross the covered footbridge.\n4. LLT1 is the big lecture hall right on your right hand side.",
    venueCode: 'LLT-1',
  },
  llt2: {
    reply: "LLT2 (Law Lecture Theatre II) is right beside LLT1.\nFrom the Access Bank / Sam Ewang side, cross the covered footbridge into the LLT compound. LLT2 is right next to LLT1 heading towards the Faculty of Education.",
    venueCode: 'LLT-2',
  },
  llt3: {
    reply: "LLT3 (Law Lecture Theatre III) is down at Motion Ground (New Motion).\nFrom the Main Gate, follow the main road past the Senate building roundabout straight down to Motion Ground. LLT3 is the big hall directly opposite Professor Saburi Market and right next to the ICAN Building.",
    venueCode: 'LLT-3',
  },
  bank: {
    reply: "The bank area is along the main central walkway, about 200 metres from the Main Gate. You will find the 24/7 Access Bank ATM gallery and branch there for your school fees and cash withdrawals.",
    venueCode: 'BANK-QUAD',
  },
  sms: {
    reply: "SMS Lecture Theatre (Faculty of Administration & Management Sciences) is along the faculty walkway. From the central roundabout, follow the walkway past the Odukale Library and ETF Hall.",
    venueCode: 'SMS-LT1',
  },
  market: {
    reply: "Professor Saburi Market is at Motion Ground, directly facing LLT3. You can print documents, buy snacks, stationery, or do photocopying there.",
    venueCode: 'MKT-SABURI',
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
      ? `Hello ${studentName}! We are now in Exam Practice Mode. I will ask you course exam questions one by one and tell you honestly if you are correct or if you missed anything.\n\nAre you ready for your first exam question? Type "Ready" or your answer to begin.`
      : `Hello ${studentName}! I am Cohart AI, your study companion for ${institutionName}. I can help you read your course materials faster with smart pacing, set practice exam questions (objective CBT or theory) tailored to your lecturers' patterns, and help you configure your study profile.${isOou ? ' I can also guide you to lecture halls across Ago-Iwoye campus.' : ''}\n\nWhat course or topic are we prepping for today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([defaultInitialMessage]);
  const [input, setInput] = useState(initialPrompt || '');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string[]>>({});

  // Deepgram Voice & Audio State
  const [selectedVoice, setSelectedVoice] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cohart_selected_voice') || DEFAULT_COHART_VOICE;
    }
    return DEFAULT_COHART_VOICE;
  });
  const [isVoicePickerOpen, setIsVoicePickerOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Save selected voice to localStorage and play its unique pre-recorded sample audio locally
  const handleSelectVoice = (voiceId: string) => {
    setSelectedVoice(voiceId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cohart_selected_voice', voiceId);
    }
    setIsVoicePickerOpen(false);

    // Stop any currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setSpeakingMsgId(null);

    // Find the unique pre-recorded intro audio for this voice model
    const voiceObj = COHART_VOICES.find((v) => v.id === voiceId);
    if (voiceObj && voiceObj.audioUrl) {
      try {
        const previewAudio = new Audio(voiceObj.audioUrl);
        currentAudioRef.current = previewAudio;
        previewAudio.play().catch((err) => {
          console.warn('Audio preview autoplay prevented:', err);
        });
      } catch (err) {
        console.warn('Could not play voice preview:', err);
      }
    }
  };

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

      recorder.start(250);
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Initialize conversation session on page load: only load chats that have actual user messages!
  useEffect(() => {
    const saved = localStorage.getItem('cohart_ai_conversations');
    let loadedConversations: Conversation[] = [];
    if (saved) {
      try {
        const raw = JSON.parse(saved);
        // Eliminate ghost conversations with zero user messages
        loadedConversations = raw.filter((c: Conversation) =>
          c.messages && c.messages.some((m) => m.role === 'user')
        );
      } catch {
        loadedConversations = [];
      }
    }

    const newSessionId = `conv_${Date.now()}`;
    setConversations(loadedConversations.slice(0, 20));
    setActiveConvId(newSessionId);
    setMessages([defaultInitialMessage]);
    // NOTE: We deliberately DO NOT save newSession to localStorage here.
    // It will ONLY be saved once the user actually sends their first query!

    if (initialPrompt) {
      setTimeout(() => handleSend(initialPrompt), 400);
    }
  }, [studentName, initialMode, profile.institution]);

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

    // Do NOT write to localStorage or add to history until the user sends a message!
    setActiveConvId(newSessionId);
    setMessages([newInitialMsg]);
    setIsSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConvId(conv.id);
    setMessages(conv.messages);
    setIsSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleDeleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const filtered = conversations.filter((c) => c.id !== id);
    setConversations(filtered);
    localStorage.setItem('cohart_ai_conversations', JSON.stringify(filtered));

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

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!userText) setInput('');
    setIsTyping(true);

    // Save/update conversation in list only now that the user has sent a message
    const convTitle = generateConversationTitle(query);
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === activeConvId);
      let updated: Conversation[];
      if (exists) {
        updated = prev.map((c) => {
          if (c.id === activeConvId) {
            const currentTitle = c.title === 'New Conversation' ? convTitle : c.title;
            return { ...c, title: currentTitle, messages: newMessages };
          }
          return c;
        });
      } else {
        const newConv: Conversation = {
          id: activeConvId,
          title: convTitle,
          createdAt: new Date().toISOString(),
          messages: newMessages,
        };
        updated = [newConv, ...prev];
      }
      localStorage.setItem('cohart_ai_conversations', JSON.stringify(updated));
      return updated;
    });

    try {
      let replyContent = '';
      let detectedMilestone: string | null = null;
      let detectedProfileUpdate: Record<string, any> | null = null;

      let detectedChoices: InteractiveChoices | undefined;

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
          }),
        });

        if (res.ok) {
          const data = await res.json();
          replyContent = data.reply;
          if (data.milestoneAction) {
            detectedMilestone = data.milestoneAction;
          }
          if (data.interactiveChoices) {
            detectedChoices = data.interactiveChoices;
          }
          if (data.profileAction) {
            detectedProfileUpdate = data.profileAction;
            if (onUpdateProfile) {
              onUpdateProfile(data.profileAction);
            }
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
      };

      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);

      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === activeConvId) {
            return { ...c, messages: finalMessages };
          }
          return c;
        });
        localStorage.setItem('cohart_ai_conversations', JSON.stringify(updated));
        return updated;
      });
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
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
                <GeminiIcon name="sparkle" size={17} />
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
                        className={isActive ? 'text-[#0B57D0] dark:text-[#A8C7FA]' : 'text-neutral-400'}
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
                className="flex items-center gap-2 w-full p-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
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
        {/* Minimalist Top Bar matching site theme */}
        <header className="h-14 px-4 shrink-0 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-[#10131B]/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Custom 2-Sleek-Lines Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-1 rounded-xl text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center justify-center"
              title="Open Chat Sessions"
            >
              <GeminiIcon name="two-lines" size={19} />
            </button>

            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${currentMode === 'grill_mode' ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
              <h2 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white truncate max-w-[180px] sm:max-w-xs font-sans">
                {activeConversation?.title || 'Cohart AI'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* View Switch Dropdown: AI Copilot <-> Reader <-> Vault */}
            {onExitFullscreen && (
              <div className="relative">
                <button
                  onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/90 dark:bg-[#181B24]/90 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-neutral-800 dark:text-neutral-200 text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-2xs"
                  title="Switch View"
                >
                  <GeminiIcon name="sparkle" size={13} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
                  <span className="font-semibold">AI Copilot</span>
                  <GeminiIcon name="chevron-down" size={12} className="text-neutral-400" />
                </button>

                {isViewDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[99]"
                      onClick={() => setIsViewDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl bg-white/98 dark:bg-[#181B24]/98 border border-black/[0.1] dark:border-white/[0.1] shadow-2xl backdrop-blur-2xl p-1 z-[100] animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-2.5 py-1.5 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                        Switch View
                      </div>
                      <button
                        onClick={() => setIsViewDropdownOpen(false)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA] cursor-pointer"
                      >
                        <GeminiIcon name="sparkle" size={13} />
                        <span>AI Copilot</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsViewDropdownOpen(false);
                          onExitFullscreen();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                      >
                        <GeminiIcon name="reader" size={13} />
                        <span>Course Reader</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Voice Model Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsVoicePickerOpen(!isVoicePickerOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/90 dark:bg-[#181B24]/90 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-neutral-800 dark:text-neutral-200 text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-2xs"
                title="Select Deepgram Voice Model"
              >
                <GeminiIcon name="volume" size={13} className="text-[#0B57D0] dark:text-[#A8C7FA]" />
                <span className="font-mono text-[11px] hidden sm:inline">
                  {COHART_VOICES.find((v) => v.id === selectedVoice)?.label.split(' ')[1] || 'Nova'}
                </span>
                <GeminiIcon name="chevron-down" size={11} className="text-neutral-400" />
              </button>

              {isVoicePickerOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[99]"
                    onClick={() => setIsVoicePickerOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-72 max-h-80 overflow-y-auto rounded-2xl bg-white/98 dark:bg-[#181B24]/98 border border-black/[0.1] dark:border-white/[0.1] shadow-2xl backdrop-blur-2xl p-1.5 z-[100] animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1.5 border-b border-black/[0.06] dark:border-white/[0.08] mb-1">
                      <div className="text-[11px] font-bold text-neutral-900 dark:text-white">
                        AI Reading Voice
                      </div>
                      <p className="text-[10px] font-mono text-neutral-500">
                        Deepgram Aura-2 Models • Natural Academic Cadence
                      </p>
                    </div>

                    <div className="space-y-1">
                      {COHART_VOICES.map((v) => {
                        const isSelected = v.id === selectedVoice;
                        return (
                          <button
                            key={v.id}
                            onClick={() => handleSelectVoice(v.id)}
                            className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-start justify-between gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA] font-medium border border-[#0B57D0]/20'
                                : 'text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium">{v.label}</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-black/[0.05] dark:bg-white/[0.08] text-neutral-500">
                                  {v.gender}
                                </span>
                              </div>
                              <p className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                                {v.persona}
                              </p>
                            </div>
                            {isSelected && (
                              <GeminiIcon name="check" size={13} className="text-[#0B57D0] dark:text-[#A8C7FA] shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
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
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed transition-all shadow-xs ${
                    isUser
                      ? 'bg-[#0B57D0] text-white rounded-br-xs'
                      : 'bg-white/90 dark:bg-[#181B24]/90 border border-black/[0.06] dark:border-white/[0.08] text-neutral-900 dark:text-neutral-100 rounded-bl-xs backdrop-blur-md'
                  }`}
                >
                  <div className={`flex items-center justify-between text-[10px] font-mono mb-1 ${isUser ? 'text-white/70' : 'text-neutral-400 dark:text-neutral-500'}`}>
                    <span>{isUser ? 'You' : 'Cohart AI'} • {m.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleSpeakMessage(m.id, m.content)}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                          speakingMsgId === m.id
                            ? 'bg-[#0B57D0]/20 text-[#0B57D0] dark:text-[#A8C7FA] font-bold'
                            : 'hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                        title={speakingMsgId === m.id ? 'Stop listening' : 'Listen with Cohart AI Voice'}
                      >
                        {isSynthesizing === m.id ? (
                          <GeminiIcon name="loader" size={11} />
                        ) : speakingMsgId === m.id ? (
                          <>
                            <GeminiIcon name="volume-x" size={11} />
                            <span className="text-[9px]">Stop</span>
                          </>
                        ) : (
                          <>
                            <GeminiIcon name="volume" size={11} />
                            <span className="text-[9px]">Listen</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {isUser ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <MarkdownText content={m.content} />
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
                                  ? 'bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/15 border-[#0B57D0]/40 dark:border-[#A8C7FA]/40 text-[#0B57D0] dark:text-[#A8C7FA] font-medium'
                                  : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/[0.06] dark:border-white/[0.06] text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                              }`}
                            >
                              <span>{opt}</span>
                              <div
                                className={`h-4 w-4 rounded-md flex items-center justify-center border transition-all ${
                                  isChecked
                                    ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] border-transparent text-white dark:text-neutral-950'
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
                            className="px-4 py-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                          >
                            Done ({selectedChoices[m.id]?.length})
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Generated Quiz Action Card */}
                  {m.generatedQuiz && (
                    <div className="mt-3.5 p-4 rounded-2xl bg-gradient-to-br from-[#0B57D0]/10 to-[#A8C7FA]/5 border border-[#0B57D0]/30 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-[#0B57D0]/20 text-[#0B57D0] dark:text-[#A8C7FA] border border-[#0B57D0]/30">
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
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-bold font-mono text-xs hover:opacity-90 transition-all active:scale-95 cursor-pointer shadow-md shadow-[#0B57D0]/20"
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

                  {/* Suggested Map Action Pin */}
                  {m.suggestedAction && onSelectVenue && (
                    <div className="mt-3 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08]">
                      <button
                        onClick={() => onSelectVenue(m.suggestedAction!.venueCode)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <GeminiIcon name="pin" size={12} />
                        <span>{m.suggestedAction.label}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white/80 dark:bg-[#181B24]/80 border border-black/[0.06] dark:border-white/[0.08] w-20 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        {/* Floating Bottom Input Dock with Liquid Glass */}
        <footer className="p-3 sm:p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-white/85 dark:bg-[#10131B]/85 backdrop-blur-xl shrink-0">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Quick Context Prompt Chips */}
            {messages.length <= 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                  onClick={() => handleSend('Explain Cournot competition using a simple Nigerian market example like Dangote and BUA cement')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 text-[11px] font-mono shrink-0 transition-colors cursor-pointer"
                >
                  <GeminiIcon name="sparkle" size={11} />
                  <span>Cournot Analogy</span>
                </button>
                <button
                  onClick={() => handleSend('How do I get to LLT1 from the Main Gate?')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 text-[11px] font-mono shrink-0 transition-colors cursor-pointer"
                >
                  <GeminiIcon name="pin" size={11} />
                  <span>Way to LLT1</span>
                </button>
                <button
                  onClick={() => handleSend('Where is LLT3 located?')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 text-[11px] font-mono shrink-0 transition-colors cursor-pointer"
                >
                  <GeminiIcon name="map" size={11} />
                  <span>Where is LLT3</span>
                </button>
                <button
                  onClick={() => handleSend('Test me with a practice exam question on Cournot competition')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#0B57D0]/30 bg-[#0B57D0]/10 hover:bg-[#0B57D0]/20 text-[#0B57D0] dark:text-[#A8C7FA] text-[11px] font-mono shrink-0 transition-colors cursor-pointer"
                >
                  <GeminiIcon name="shield-check" size={11} />
                  <span>Practice Exam Question</span>
                </button>
              </div>
            )}

            {/* Input Bar Form with Deepgram Nova-3 Voice Input */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] focus-within:border-[#0B57D0] dark:focus-within:border-[#A8C7FA] transition-colors">
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
                    : 'Ask questions or tap mic...'
                }
                className="flex-1 min-w-0 bg-transparent px-3 py-2 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none font-sans"
              />

              {/* Action Buttons Right: Mic & Send */}
              <div className="flex items-center gap-1.5 shrink-0 pr-1">
                <button
                  type="button"
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={isTranscribing}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95 cursor-pointer shrink-0 ${
                    isRecording
                      ? 'bg-rose-500 text-white animate-bounce shadow-md'
                      : isTranscribing
                      ? 'bg-amber-500/20 text-amber-500'
                      : 'bg-black/[0.04] dark:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.08] dark:hover:bg-white/[0.12]'
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Voice Input (Deepgram Nova-3)'}
                >
                  {isTranscribing ? (
                    <GeminiIcon name="loader" size={15} />
                  ) : isRecording ? (
                    <GeminiIcon name="mic-off" size={16} />
                  ) : (
                    <GeminiIcon name="mic" size={16} />
                  )}
                </button>

                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B57D0] hover:bg-[#0B57D0]/90 text-white disabled:opacity-30 transition-all active:scale-95 cursor-pointer shadow-xs shrink-0"
                  title="Send message"
                >
                  <GeminiIcon name="arrow-right" size={15} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 px-1">
              <span>{currentMode === 'grill_mode' ? 'Exam Practice Mode' : 'Cohart AI • Simple explanations for OOU students'}</span>
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
    </div>
  );
};
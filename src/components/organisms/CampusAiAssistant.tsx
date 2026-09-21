'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { MarkdownText } from '@/components/atoms/MarkdownText';
import { StudentProfile, Location } from '@/lib/types';

interface CampusAiAssistantProps {
  profile: StudentProfile;
  locations?: Location[];
  onSelectVenue?: (code: string) => void;
  onExitFullscreen?: () => void;
  onMilestoneAction?: (actionId: string) => void;
  initialMode?: 'general' | 'grill_mode';
  initialPrompt?: string;
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
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

const KNOWLEDGE_BASE: Record<string, { reply: string; venueCode?: string; reference: string }> = {
  llt1: {
    reply: "Here is how to walk to LLT1 (Arts Lecture Theatre I) from the PS Main Gate:\n1. Walk down the main tarred walkway straight past the Security Post towards the bank area (about 2 minutes walk).\n2. Look to your left and you will see the Access Bank ATM.\n3. Turn right directly opposite Access Bank at the Sam Ewang building, and cross the covered footbridge.\n4. LLT1 is the big lecture hall right on your right hand side.",
    venueCode: 'LLT-1',
    reference: "Campus Reference: Faculty of Arts • Beside Sam Ewang Footbridge",
  },
  llt2: {
    reply: "LLT2 (Law Lecture Theatre II) is right beside LLT1.\nFrom the Access Bank / Sam Ewang side, cross the covered footbridge into the LLT compound. LLT2 is right next to LLT1 heading towards the Faculty of Education.",
    venueCode: 'LLT-2',
    reference: "Campus Reference: Law & Education Wing • Next to LLT 1",
  },
  llt3: {
    reply: "LLT3 (Law Lecture Theatre III) is down at Motion Ground (New Motion).\nFrom the Main Gate, follow the main road past the Senate building roundabout straight down to Motion Ground. LLT3 is the big hall directly opposite Professor Saburi Market and right next to the ICAN Building.",
    venueCode: 'LLT-3',
    reference: "Campus Reference: Motion Ground • Opposite Saburi Market",
  },
  bank: {
    reply: "The bank area is along the main central walkway, about 200 metres from the Main Gate. You will find the 24/7 Access Bank ATM gallery and branch there for your school fees and cash withdrawals.",
    venueCode: 'BANK-QUAD',
    reference: "Campus Reference: Bank Area • Main Campus Walkway",
  },
  sms: {
    reply: "SMS Lecture Theatre (Faculty of Administration & Management Sciences) is along the faculty walkway. From the central roundabout, follow the walkway past the Odukale Library and ETF Hall.",
    venueCode: 'SMS-LT1',
    reference: "Campus Reference: SMS Building • Faculty Walkway",
  },
  market: {
    reply: "Professor Saburi Market is at Motion Ground, directly facing LLT3. You can print documents, buy snacks, stationery, or do photocopying there.",
    venueCode: 'MKT-SABURI',
    reference: "Campus Reference: Motion Ground • Opposite LLT 3",
  },
};

function generateConversationTitle(query: string): string {
  const clean = query.trim();
  const lower = clean.toLowerCase();

  if (lower.includes('grill') || lower.includes('exam test')) return 'Exam Readiness Grill';
  if (lower.includes('llt1') || lower.includes('llt 1')) return 'LLT 1 Walking Route';
  if (lower.includes('llt2') || lower.includes('llt 2')) return 'LLT 2 Hall Location';
  if (lower.includes('llt3') || lower.includes('llt 3')) return 'LLT 3 Motion Ground';
  if (lower.includes('cournot')) return 'Cournot Oligopoly Analysis';
  if (lower.includes('bertrand')) return 'Bertrand Competition Model';
  if (lower.includes('access bank') || lower.includes('atm') || lower.includes('bank')) return 'Access Bank ATM Gallery';
  if (lower.includes('health') || lower.includes('clinic')) return 'OOU Health Centre';
  if (lower.includes('sport') || lower.includes('stadium')) return 'Sports Centre & Pavilion';
  if (lower.includes('market') || lower.includes('motion')) return 'Saburi Market & Motion Ground';
  if (lower.includes('exam') || lower.includes('test') || lower.includes('ca')) return 'Continuous Assessment Prep';

  const words = clean.split(/\s+/).slice(0, 4).join(' ');
  return words.length > 28 ? words.slice(0, 25) + '...' : words;
}

export const CampusAiAssistant: React.FC<CampusAiAssistantProps> = ({
  profile,
  onSelectVenue,
  onExitFullscreen,
  onMilestoneAction,
  initialMode = 'general',
  initialPrompt,
}) => {
  const studentName = profile.full_name?.trim() ? profile.full_name.trim().split(' ')[0] : 'Scholar';
  const [currentMode, setCurrentMode] = useState<'general' | 'grill_mode'>(initialMode);

  const defaultInitialMessage: Message = {
    id: 'msg_welcome',
    role: 'assistant',
    content: initialMode === 'grill_mode'
      ? `Hello ${studentName}! We are now in Exam Practice Mode. I will ask you challenging OOU exam questions one by one and tell you honestly if you are correct or if you missed anything.\n\nAre you ready for your first exam question? Type "Ready" or your answer to begin.`
      : `Hello ${studentName}! I am Cohart AI, your OOU study assistant. Ask me anything about your courses in simple English, or ask for simple directions to any lecture hall or building in Ago-Iwoye Main Campus.\n\n*Reference: OOU Courses & Ago-Iwoye Campus Map*`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([defaultInitialMessage]);
  const [input, setInput] = useState(initialPrompt || '');
  const [isTyping, setIsTyping] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize fresh conversation session on page load/refresh
  useEffect(() => {
    const saved = localStorage.getItem('cohart_ai_conversations');
    let loadedConversations: Conversation[] = [];
    if (saved) {
      try {
        loadedConversations = JSON.parse(saved);
      } catch {
        loadedConversations = [];
      }
    }

    const newSessionId = `conv_${Date.now()}`;
    const newSession: Conversation = {
      id: newSessionId,
      title: initialMode === 'grill_mode' ? 'Exam Readiness Grill' : 'New Conversation',
      createdAt: new Date().toISOString(),
      messages: [defaultInitialMessage],
    };

    const updatedList = [newSession, ...loadedConversations.slice(0, 15)];
    setConversations(updatedList);
    setActiveConvId(newSessionId);
    setMessages([defaultInitialMessage]);
    localStorage.setItem('cohart_ai_conversations', JSON.stringify(updatedList));

    if (initialPrompt) {
      setTimeout(() => handleSend(initialPrompt), 400);
    }
  }, [studentName, initialMode]);

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

    const newSession: Conversation = {
      id: newSessionId,
      title: mode === 'grill_mode' ? 'Exam Readiness Grill' : 'New Conversation',
      createdAt: new Date().toISOString(),
      messages: [newInitialMsg],
    };

    setConversations((prev) => {
      const updated = [newSession, ...prev];
      localStorage.setItem('cohart_ai_conversations', JSON.stringify(updated));
      return updated;
    });
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

    // Auto-name conversation on first user query
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === activeConvId) {
          const newTitle = c.title === 'New Conversation' ? generateConversationTitle(query) : c.title;
          return { ...c, title: newTitle, messages: newMessages };
        }
        return c;
      });
      localStorage.setItem('cohart_ai_conversations', JSON.stringify(updated));
      return updated;
    });

    try {
      let replyContent = '';
      let detectedMilestone: string | null = null;

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
            replyContent = `${v.reply}\n\n${v.reference}`;
            break;
          }
        }
      }

      if (!replyContent) {
        replyContent = `Here is the guidance for your question: "${query}".\n\nFor topics in ${profile.department || 'your department'}, review your lecture notes or ask me to explain any specific concept in simple English.\n\n*Reference: ${profile.department || 'OOU'} Course Materials*`;
      }

      if (detectedMilestone && onMilestoneAction) {
        onMilestoneAction(detectedMilestone);
      }

      // Detect venue match for direct map pin button
      let venueCode: string | undefined;
      const lower = query.toLowerCase();
      if (lower.includes('llt3') || lower.includes('llt 3')) venueCode = 'LLT-3';
      else if (lower.includes('llt1') || lower.includes('llt 1')) venueCode = 'LLT-1';
      else if (lower.includes('llt2') || lower.includes('llt 2')) venueCode = 'LLT-2';
      else if (lower.includes('sport') || lower.includes('stadium')) venueCode = 'SPORT-CTR';
      else if (lower.includes('motion') || lower.includes('saburi')) venueCode = 'NEW-MOTION';
      else if (lower.includes('health') || lower.includes('clinic')) venueCode = 'HEALTH-CTR';

      const assistantMsg: Message = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: venueCode ? { label: `Show ${venueCode} on Map`, venueCode } : undefined,
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

          {/* New Chat Actions */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleStartNewChat('general')}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#0B57D0] hover:bg-[#0B57D0]/90 text-white text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <span className="text-sm font-bold leading-none">+</span>
              <span>New Chat</span>
            </button>
            <button
              onClick={() => handleStartNewChat('grill_mode')}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium transition-all active:scale-95 cursor-pointer"
            >
              <GeminiIcon name="zap" size={13} />
              <span>Exam Drill</span>
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
            {/* Compact In-App Style Segmented Switcher: Reader <-> AI */}
            <div className="flex items-center p-0.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.08]">
              {onExitFullscreen && (
                <button
                  onClick={onExitFullscreen}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer"
                  title="Switch to Reader"
                >
                  <GeminiIcon name="reader" size={13} />
                  <span className="hidden xs:inline">Reader</span>
                </button>
              )}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-[#181B24] text-[#0B57D0] dark:text-[#A8C7FA] shadow-xs border border-black/[0.04] dark:border-white/[0.06]">
                <GeminiIcon name="sparkle" size={13} />
                <span>AI</span>
              </div>
            </div>

            {/* Socratic Grill Mode toggle */}
            <button
              onClick={() => handleStartNewChat(currentMode === 'grill_mode' ? 'general' : 'grill_mode')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                currentMode === 'grill_mode'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  : 'bg-black/[0.03] dark:bg-white/[0.04] border-black/[0.08] dark:border-white/[0.08] text-neutral-700 dark:text-neutral-300'
              }`}
              title="Toggle Socratic Grill Mode"
            >
              <GeminiIcon name={currentMode === 'grill_mode' ? 'zap' : 'shield-check'} size={13} />
              <span className="hidden sm:inline">{currentMode === 'grill_mode' ? 'Exit Drill' : 'Exam Drill'}</span>
            </button>
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
                  <div className={`text-[10px] font-mono mb-1 ${isUser ? 'text-white/70' : 'text-neutral-400 dark:text-neutral-500'}`}>
                    {isUser ? 'You' : 'Cohart AI'} • {m.timestamp}
                  </div>

                  {isUser ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <MarkdownText content={m.content} />
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
                  onClick={() => handleStartNewChat('grill_mode')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-mono shrink-0 transition-colors cursor-pointer"
                >
                  <GeminiIcon name="zap" size={11} />
                  <span>Test Me with Exam Questions</span>
                </button>
              </div>
            )}

            {/* Input Bar Form */}
            <div className="relative flex items-center gap-2">
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
                  currentMode === 'grill_mode'
                    ? 'Type your answer to this question...'
                    : 'Ask any question about your courses or campus directions in simple English...'
                }
                className="w-full rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] px-4 py-3 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA] transition-colors pr-12 font-sans"
              />

              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0] hover:bg-[#0B57D0]/90 text-white disabled:opacity-30 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <GeminiIcon name="arrow-right" size={15} />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 px-1">
              <span>{currentMode === 'grill_mode' ? 'Exam Practice Mode' : 'Cohart AI • Simple explanations for OOU students'}</span>
              <span>Press Enter to send</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
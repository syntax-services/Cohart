'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile, Location } from '@/lib/types';

interface CampusAiAssistantProps {
  profile: StudentProfile;
  locations?: Location[];
  onSelectVenue?: (code: string) => void;
  onExitFullscreen?: () => void;
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
    reply: "To get to LLT1 (Arts Lecture Theatre I / Faculty of Arts) from the Main Gate (PS):\n1. Walk down the central arterial paved walkway past the Security Post towards the banking quad (~150m).\n2. Pass the Access Bank ATM gallery on your left.\n3. Turn right directly opposite Access Bank at the Sam Ewang building and cross the covered pedestrian footbridge.\n4. LLT1 is the large tiered auditorium immediately to your right.",
    venueCode: 'LLT-1',
    reference: "📍 Campus Reference: Faculty of Arts Quadrangle • Adjacent Sam Ewang Footbridge",
  },
  llt2: {
    reply: "LLT2 (Law Lecture Theatre II) is located right beside LLT1.\nFrom the Access Bank / Sam Ewang axis, cross the footbridge into the LLT quadrangle. LLT2 is situated directly adjacent to LLT1 along the Faculty of Education loop.",
    venueCode: 'LLT-2',
    reference: "📍 Campus Reference: Law & Education Wing • Next to LLT 1",
  },
  llt3: {
    reply: "LLT3 (Law Lecture Theatre III) is located on the southern campus belt at Motion Ground (New Motion).\nFrom the PS Main Gate, follow the main transit road past the Senate roundabout straight down to Motion Ground. LLT3 is the prominent lecture complex situated directly opposite Professor Saburi Modern Market and adjacent to the ICAN Building.",
    venueCode: 'LLT-3',
    reference: "📍 Campus Reference: Motion Ground Axis • Opposite Saburi Market & ICAN Building",
  },
  bank: {
    reply: "The Commercial Banking Quad is situated along the main central walkway approximately 200 meters inside the Permanent Site (PS) Main Gate. It hosts the 24/7 Access Bank ATM gallery and branch for university fees and cash withdrawals.",
    venueCode: 'BANK-QUAD',
    reference: "📍 Campus Reference: Commercial Banking Quad • Central Paved Walkway",
  },
  sms: {
    reply: "SMS Lecture Theatre (Faculty of Administration & Management Sciences) is situated along the central faculty avenue. From the central roundabout, follow the paved walkway eastward past the Sir Hassan Odukale Library and ETF Hall.",
    venueCode: 'SMS-LT1',
    reference: "📍 Campus Reference: Faculty of Administration & Management Sciences • SMS Wing",
  },
  market: {
    reply: "Professor Saburi Modern Market is situated at Motion Ground directly facing LLT3. It provides printing kiosks, stationery shops, photocopying services, and student provisions.",
    venueCode: 'MKT-SABURI',
    reference: "📍 Campus Reference: Motion Ground • Opposite LLT 3",
  },
};

// Auto-derive a smart, concise title from the user's first query
function generateConversationTitle(query: string): string {
  const clean = query.trim();
  const lower = clean.toLowerCase();

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

  // Fallback: take first 4 words cleanly
  const words = clean.split(/\s+/).slice(0, 4).join(' ');
  return words.length > 28 ? words.slice(0, 25) + '...' : words;
}

export const CampusAiAssistant: React.FC<CampusAiAssistantProps> = ({
  profile,
  onSelectVenue,
  onExitFullscreen,
}) => {
  const studentName = profile.full_name?.trim() ? profile.full_name.trim().split(' ')[0] : 'Scholar';

  const defaultInitialMessage: Message = {
    id: 'msg_welcome',
    role: 'assistant',
    content: `Hello ${studentName}, I'm Cohart AI, your OOU academic & campus copilot. Ask me any course questions (e.g. "Explain Cournot oligopoly with a Nigerian market analogy"), verify exam concepts, or ask for walking routes across Ago-Iwoye PS (e.g. "How do I get to LLT1 from Main Gate?").\n\n📖 *Course Reference: OOU Academic Core & PS Campus Map*`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  // State: Sidebar & Multi-session conversations
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([defaultInitialMessage]);
  const [input, setInput] = useState('');
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

    // New conversation session for this refresh
    const newSessionId = `conv_${Date.now()}`;
    const newSession: Conversation = {
      id: newSessionId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      messages: [defaultInitialMessage],
    };

    const updatedList = [newSession, ...loadedConversations.slice(0, 15)];
    setConversations(updatedList);
    setActiveConvId(newSessionId);
    setMessages([defaultInitialMessage]);
    localStorage.setItem('cohart_ai_conversations', JSON.stringify(updatedList));
  }, [studentName]);

  // Smooth scroll within the chat container ONLY (avoids window jump glitch)
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

  // Create a brand new chat session manually
  const handleStartNewChat = () => {
    const newSessionId = `conv_${Date.now()}`;
    const newSession: Conversation = {
      id: newSessionId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      messages: [defaultInitialMessage],
    };

    setConversations((prev) => {
      const updated = [newSession, ...prev];
      localStorage.setItem('cohart_ai_conversations', JSON.stringify(updated));
      return updated;
    });
    setActiveConvId(newSessionId);
    setMessages([defaultInitialMessage]);
    setIsSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  // Switch to a previous conversation from history
  const handleSelectConversation = (conv: Conversation) => {
    setActiveConvId(conv.id);
    setMessages(conv.messages);
    setIsSidebarOpen(false);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  // Delete a conversation from history
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

      // Tier 1: Local /api/ai Next.js route
      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: query,
            context: 'campus_navigation',
            studentProfile: profile,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          replyContent = data.reply;
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
              context: 'campus_navigation',
              studentProfile: profile,
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
        replyContent = `Here is the guidance for your query: "${query}".\n\nFor academic principles in ${profile.department || 'Economics'}, review core models systematically.\n\n📖 *Course Reference: ${profile.department || 'General Studies'} • 2024/2025 Syllabus*`;
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

      // Persist updated conversation
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
        content: 'Unable to reach the campus AI network right now. Please verify your connection and retry.\n\n💬 *Discussion Context: Network Diagnostics*',
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
    <div className="relative flex h-full w-full overflow-hidden bg-[#06080D] text-white font-sans select-none">
      {/* Sleek Left Slide-Out Sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-[#0A0D14] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex flex-col h-full overflow-hidden">
          {/* Sidebar Top: Branding & Close */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B57D0]/20 text-[#A8C7FA]">
                <GeminiIcon name="sparkle" size={15} />
              </div>
              <div>
                <h3 className="text-xs font-semibold tracking-tight text-white">Cohart AI</h3>
                <p className="text-[10px] font-mono text-neutral-400">Conversations</p>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <GeminiIcon name="close" size={15} />
            </button>
          </div>

          {/* New Chat Action Button */}
          <button
            onClick={handleStartNewChat}
            className="mt-3 flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-[#0B57D0] hover:bg-[#0B57D0]/90 text-white text-xs font-medium transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <span className="text-sm font-bold">+</span>
            <span>New Chat</span>
          </button>

          {/* Conversations History List */}
          <div className="mt-4 flex-1 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-2">
              Recent Sessions
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
                    className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-2">
                      <GeminiIcon
                        name="chat"
                        size={13}
                        className={isActive ? 'text-[#A8C7FA]' : 'text-neutral-500'}
                      />
                      <span className="truncate font-medium text-xs">{c.title}</span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteConversation(e, c.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 transition-opacity cursor-pointer ml-1"
                      title="Delete chat"
                    >
                      <GeminiIcon name="trash" size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar Footer: Back to Course Reader */}
          {onExitFullscreen && (
            <div className="pt-3 border-t border-white/[0.08]">
              <button
                onClick={onExitFullscreen}
                className="flex items-center gap-2 w-full p-2 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <GeminiIcon name="reader" size={14} />
                <span>Return to Course Reader</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Full-Screen AI Content Workstation */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Minimalist Top Bar */}
        <header className="h-13 px-4 shrink-0 flex items-center justify-between border-b border-white/[0.08] bg-[#0A0D14]/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Custom 2-Sleek-Lines Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-1 rounded-xl text-neutral-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center justify-center"
              title="Open Chat Sessions"
            >
              <GeminiIcon name="two-lines" size={18} />
            </button>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xs sm:text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-xs font-sans">
                {activeConversation?.title || 'Cohart AI'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartNewChat}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-xs text-neutral-200 transition-colors cursor-pointer"
            >
              <span className="text-sm leading-none font-bold">+</span>
              <span>New Chat</span>
            </button>

            {onExitFullscreen && (
              <button
                onClick={onExitFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B57D0]/20 hover:bg-[#0B57D0]/30 border border-[#0B57D0]/30 text-[#A8C7FA] text-xs font-medium transition-colors cursor-pointer"
              >
                <GeminiIcon name="reader" size={13} />
                <span className="hidden sm:inline">Back to Reader</span>
                <span className="sm:hidden">Reader</span>
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Chat Message Stream */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 max-w-4xl w-full mx-auto"
        >
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed transition-all shadow-xs ${
                    isUser
                      ? 'bg-[#0B57D0] text-white rounded-br-xs'
                      : 'bg-[#121824] border border-white/[0.08] text-neutral-200 rounded-bl-xs'
                  }`}
                >
                  <div className="text-[10px] font-mono opacity-50 mb-1 flex items-center justify-between gap-4">
                    <span>{isUser ? 'You' : 'Cohart AI'}</span>
                    <span>{m.timestamp}</span>
                  </div>

                  <p className="whitespace-pre-line font-sans leading-relaxed">{m.content}</p>

                  {/* Suggested Map Action Pin */}
                  {m.suggestedAction && onSelectVenue && (
                    <div className="mt-3 pt-2.5 border-t border-white/[0.1]">
                      <button
                        onClick={() => onSelectVenue(m.suggestedAction!.venueCode)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A8C7FA] text-neutral-950 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
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
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-[#121824] border border-white/[0.08] w-20">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        {/* Floating Bottom Input Dock */}
        <footer className="p-3 sm:p-4 border-t border-white/[0.08] bg-[#0A0D14]/90 backdrop-blur-xl shrink-0">
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Quick Context Prompt Chips */}
            {messages.length <= 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                  onClick={() => handleSend('Explain Cournot equilibrium with an Ago-Iwoye market analogy')}
                  className="px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 text-[11px] font-mono shrink-0 transition-colors cursor-pointer"
                >
                  💡 Cournot Market Analogy
                </button>
                <button
                  onClick={() => handleSend('How do I get to LLT1 from the Main Gate?')}
                  className="px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 text-[11px] font-mono shrink-0 transition-colors cursor-pointer"
                >
                  📍 Route to LLT1
                </button>
                <button
                  onClick={() => handleSend('Where is LLT3 located?')}
                  className="px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 text-[11px] font-mono shrink-0 transition-colors cursor-pointer"
                >
                  🏛️ LLT3 Location
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
                placeholder="Ask Cohart AI any academic concept or campus navigation..."
                className="w-full rounded-2xl bg-[#121824] border border-white/[0.1] px-4 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#0B57D0] transition-colors pr-12 font-sans"
              />

              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0] hover:bg-[#0B57D0]/90 text-white disabled:opacity-30 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <GeminiIcon name="arrow-right" size={14} />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 px-1">
              <span>Cohart v2.4 • Grounded with OOU Academic Materials</span>
              <span>Press Enter to send</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
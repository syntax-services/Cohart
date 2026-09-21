'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GeminiCard } from '@/components/ui/GeminiCard';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile, Location } from '@/lib/types';

interface CampusAiAssistantProps {
  profile: StudentProfile;
  locations?: Location[];
  onSelectVenue?: (code: string) => void;
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

const KNOWLEDGE_BASE: Record<string, { reply: string; venueCode?: string }> = {
  llt1: {
    reply: "To get to LLT1 (Law Lecture Theatre 1) from the Main Gate (PS): Walk down the central paved walkway towards the banking quad. Pass the Access Bank ATM gallery on your left, turn right directly opposite Access Bank at the Sam Ewang building, and walk across the small footbridge. LLT1 is the large auditorium situated on your right.",
    venueCode: 'LLT-1',
  },
  llt2: {
    reply: "LLT2 (Law Lecture Theatre 2) is located adjacent to LLT1. From Access Bank / Sam Ewang, cross the small footbridge into the LLT quad. LLT2 is right next to LLT1 along the same corridor.",
    venueCode: 'LLT-2',
  },
  llt3: {
    reply: "LLT3 (Law Lecture Theatre 3) is located at Motion Ground. From the Main Gate, take the main shuttle road past the round-about down to Motion Ground, situated directly opposite Professor Saburi Modern Market and student shopping kiosks.",
    venueCode: 'LLT-3',
  },
  bank: {
    reply: "The Commercial Banking Quad is situated along the main central arterial road about 250 meters inside the Permanent Site (PS) Main Gate. It hosts the 24/7 Access Bank ATM gallery and branch, serving students and staff.",
    venueCode: 'BANK-QUAD',
  },
  sms: {
    reply: "SMS Lecture Theatre (Faculty of Administration & Management Sciences) is situated along the Faculty belt. From the Central Roundabout, take the faculty walkway eastward past ETF Hall.",
    venueCode: 'SMS-LT1',
  },
  market: {
    reply: "Professor Saburi Modern Market is situated directly opposite LLT3 at Motion Ground. It provides stationery printing centers, photocopy stands, food stalls, and student provisions.",
    venueCode: 'MKT-SABURI',
  },
  library: {
    reply: "The OOU Main E-Library is situated on Central Quad opposite the Senate Complex. It provides air-conditioned research carrels and open-stack reading areas.",
    venueCode: 'LIB-MAIN',
  },
};

export const CampusAiAssistant: React.FC<CampusAiAssistantProps> = ({
  profile,
  onSelectVenue,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cohart_campus_ai_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        // ignore parse error
      }
    } else {
      const studentName = profile.full_name ? profile.full_name.split(' ')[0] : 'Scholar';
      const initial: Message = {
        id: '1',
        role: 'assistant',
        content: `Hello ${studentName}, I'm your OOU Campus Guide. Ask me for real walking routes (e.g. "How do I get to LLT1 from the Main Gate?", "Where is LLT3 located?", or "Where is Access Bank?"). I remember our conversation history so you can ask natural follow-ups!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([initial]);
    }
  }, [profile.full_name]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('cohart_campus_ai_history', JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (userText?: string) => {
    const query = (userText || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userText) setInput('');
    setIsTyping(true);

    try {
      let replyContent = '';

      // Primary: Local /api/ai route
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
        // Fallback to direct Supabase Edge Function
      }

      // Secondary fallback: Direct Supabase AI Edge Function
      if (!replyContent) {
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
                prompt: query,
                context: 'campus_navigation',
                studentProfile: profile,
              }),
            }
          );
          if (edgeRes.ok) {
            const data = await edgeRes.json();
            replyContent = data.reply;
          }
        } catch {
          // Both paths failed
        }
      }

      if (!replyContent) {
        replyContent = 'I am currently recalibrating my campus landmarks. Please retry in a few seconds.';
      }

      let venueCode: string | undefined;

      // Check if reply points to a known venue for a 1-tap action
      const lower = query.toLowerCase();
      if (lower.includes('llt3') || lower.includes('llt 3')) venueCode = 'LLT-3';
      else if (lower.includes('llt1') || lower.includes('llt 1')) venueCode = 'LLT-1';
      else if (lower.includes('llt2') || lower.includes('llt 2')) venueCode = 'LLT-2';
      else if (lower.includes('sport')) venueCode = 'SPORT-CTR';
      else if (lower.includes('motion')) venueCode = 'NEW-MOTION';
      else if (lower.includes('health') || lower.includes('clinic')) venueCode = 'HEALTH-CTR';

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: venueCode ? { label: `Show ${venueCode} on Map`, venueCode } : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Unable to reach campus AI network. Please check your connection and retry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('cohart_campus_ai_history');
    const studentName = profile.full_name ? profile.full_name.split(' ')[0] : 'Scholar';
    const resetMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Chat memory cleared. How can I assist you with your campus navigation today, ${studentName}?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([resetMsg]);
  };

  return (
    <div className="space-y-4">
      {/* Header with clear action */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.08] transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0B57D0]/10 dark:bg-[#A8C7FA]/10 text-[#0B57D0] dark:text-[#A8C7FA]">
            <GeminiIcon name="sparkle" size={17} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white font-sans">
              OOU Campus Navigator AI
            </h2>
            <p className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
              Environmental Memory & Exact Landmark Routes
            </p>
          </div>
        </div>

        <button
          onClick={clearHistory}
          className="flex items-center gap-1 px-3 py-1 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-[11px] font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <span>Clear Memory</span>
        </button>
      </div>

      {/* Suggested Quick Route Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-mono">
        <span className="text-[10px] text-neutral-400 uppercase tracking-wider shrink-0 mr-1">Try:</span>
        <button
          onClick={() => handleSend("How do I get to LLT1 from Main Gate?")}
          className="px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-neutral-700 dark:text-neutral-300 hover:border-[#0B57D0] shrink-0 text-xs"
        >
          Main Gate &rarr; LLT 1
        </button>
        <button
          onClick={() => handleSend("Where is LLT3 located?")}
          className="px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-neutral-700 dark:text-neutral-300 hover:border-[#0B57D0] shrink-0 text-xs"
        >
          LLT 3 Motion Ground
        </button>
        <button
          onClick={() => handleSend("Where is Access Bank ATM gallery?")}
          className="px-3 py-1 rounded-full bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-neutral-700 dark:text-neutral-300 hover:border-[#0B57D0] shrink-0 text-xs"
        >
          Access Bank Quad
        </button>
      </div>

      {/* Chat Messages Log */}
      <GeminiCard className="p-4 sm:p-5 flex flex-col h-[52vh] sm:h-[58vh]">
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs font-sans leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 font-medium'
                    : 'bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07] text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div className="text-[10px] font-mono opacity-60 mb-1 flex items-center justify-between gap-3">
                  <span>{m.role === 'user' ? 'You' : 'Cohart Campus AI'}</span>
                  <span>{m.timestamp}</span>
                </div>
                <p className="whitespace-pre-line">{m.content}</p>

                {m.suggestedAction && onSelectVenue && (
                  <div className="mt-2.5 pt-2 border-t border-black/[0.08] dark:border-white/[0.08]">
                    <button
                      onClick={() => onSelectVenue(m.suggestedAction!.venueCode)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 text-[11px] font-medium hover:opacity-90 transition-opacity"
                    >
                      <GeminiIcon name="pin" size={12} />
                      <span>{m.suggestedAction.label}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.07] w-20">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about OOU PS landmarks or navigation..."
            className="flex-1 rounded-full bg-neutral-100/90 dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] px-4 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#A8C7FA]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B57D0] dark:bg-[#A8C7FA] text-white dark:text-neutral-950 disabled:opacity-40 transition-all active:scale-95"
          >
            <GeminiIcon name="arrow-right" size={14} />
          </button>
        </div>
      </GeminiCard>
    </div>
  );
};
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { Badge } from '@/components/ui/Badge';
import {
  StudentProfile,
  Location,
  QuizData,
} from '@/lib/types';
import {
  searchRealUsers,
  fetchUserDirectMessages,
  sendUserDirectMessage,
  PeerUser,
} from '@/lib/supabase';
import { CampusAiAssistant } from './CampusAiAssistant';

interface CampusSocialHubProps {
  profile: StudentProfile;
  locations?: Location[];
  onSelectVenue?: (code: string) => void;
  onMilestoneAction?: (actionId: string) => void;
  onUpdateProfile?: (updated: Partial<StudentProfile>) => void;
  onStartQuiz?: (quiz: QuizData) => void;
  initialPrompt?: string;
  onBack?: () => void;
}

interface MessageItem {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export const CampusSocialHub: React.FC<CampusSocialHubProps> = ({
  profile,
  locations,
  onSelectVenue,
  onMilestoneAction,
  onUpdateProfile,
  onStartQuiz,
  initialPrompt,
  onBack,
}) => {
  // Navigation / view state: 'inbox' | 'ai' | 'chat'
  const [currentView, setCurrentView] = useState<'inbox' | 'ai' | 'chat'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [peerList, setPeerList] = useState<PeerUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PeerUser | null>(null);
  const [loadingPeers, setLoadingPeers] = useState(false);

  // Chat message state
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load real registered scholars on mount or when searching
  useEffect(() => {
    let active = true;
    async function loadUsers() {
      setLoadingPeers(true);
      try {
        const results = await searchRealUsers(searchQuery);
        if (active) {
          // Filter out the current user themselves
          const filtered = results.filter((u) => u.id !== profile.id);
          setPeerList(filtered);
        }
      } catch (err) {
        console.warn('Failed to load peers:', err);
      } finally {
        if (active) setLoadingPeers(false);
      }
    }

    const timer = setTimeout(() => {
      loadUsers();
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, profile.id]);

  // Load messages whenever a peer is selected
  useEffect(() => {
    if (!selectedUser) return;
    const targetUserId = selectedUser.id;
    let active = true;

    async function loadMessages() {
      try {
        const msgs = await fetchUserDirectMessages(profile.id, targetUserId);
        if (active) {
          setMessages(msgs || []);
        }
      } catch (err) {
        console.warn('Failed to load direct messages:', err);
      }
    }

    loadMessages();
    const interval = setInterval(loadMessages, 3000); // Polling for incoming peer messages

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedUser, profile.id]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedUser || !messageInput.trim() || sending) return;

    const text = messageInput.trim();
    setMessageInput('');
    setSending(true);

    // Optimistic UI update
    const tempMsg: MessageItem = {
      id: `temp_${Date.now()}`,
      sender_id: profile.id,
      receiver_id: selectedUser.id,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await sendUserDirectMessage(profile.id, selectedUser.id, text);
      const fresh = await fetchUserDirectMessages(profile.id, selectedUser.id);
      setMessages(fresh || []);
    } catch (err) {
      console.warn('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'CH';
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // If in Pinned AI view:
  if (currentView === 'ai') {
    return (
      <div className="h-full w-full flex flex-col bg-[var(--bg-main)]">
        {/* Sleek Top Navigation Bar with Back Button */}
        <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-white/70 dark:bg-[#1E1F20]/70 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('inbox')}
              className="p-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 transition-colors"
              title="Back to Messages"
            >
              <GeminiIcon name="arrow-left" size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 flex items-center justify-center text-[#0B57D0] dark:text-[#1A73E8]">
                <GeminiIcon name="sparkle" size={15} />
              </div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Cohart AI
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              if (onBack) onBack();
              else setCurrentView('inbox');
            }}
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>

        {/* AI Assistant Container */}
        <div className="flex-1 overflow-hidden">
          <CampusAiAssistant
            profile={profile}
            locations={locations}
            onSelectVenue={onSelectVenue}
            onMilestoneAction={onMilestoneAction}
            onUpdateProfile={onUpdateProfile}
            onStartQuiz={onStartQuiz}
            initialPrompt={initialPrompt}
          />
        </div>
      </div>
    );
  }

  // If in 1-on-1 Peer Chat view:
  if (currentView === 'chat' && selectedUser) {
    return (
      <div className="h-full w-full flex flex-col bg-[var(--bg-main)]">
        {/* Sleek Minimal Chat Header */}
        <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-white/70 dark:bg-[#1E1F20]/70 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setCurrentView('inbox')}
              className="p-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 transition-colors shrink-0"
              title="Back to all chats"
            >
              <GeminiIcon name="arrow-left" size={18} />
            </button>

            <div className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-800 dark:text-neutral-200 uppercase shrink-0">
              {getInitials(selectedUser.full_name)}
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                {selectedUser.full_name || selectedUser.matric_number || 'Scholar'}
              </h2>
              <p className="text-[11px] text-neutral-400 truncate">
                {selectedUser.department ? `${selectedUser.department} • ` : ''}
                {selectedUser.institution || 'Nigerian Higher Institution'}
              </p>
            </div>
          </div>

          {selectedUser.level && (
            <Badge variant="blue" size="sm" className="rounded-full px-2 font-mono text-[10px] shrink-0">
              {selectedUser.level}
            </Badge>
          )}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <div className="h-12 w-12 rounded-2xl bg-black/[0.04] dark:bg-white/[0.05] flex items-center justify-center text-neutral-400 mb-2">
                <GeminiIcon name="chat" size={22} />
              </div>
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Say hello to {selectedUser.full_name || 'this scholar'}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Exchange course outlines, exam tips, and study notes.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_id === profile.id;
              const timeString = m.created_at
                ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#0B57D0] dark:bg-[#1A73E8] text-white rounded-br-xs shadow-xs'
                        : 'bg-white dark:bg-[#1E1F20] text-neutral-900 dark:text-neutral-100 rounded-bl-xs border border-black/[0.06] dark:border-white/[0.08] shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    <span
                      className={`block text-[9px] mt-1 font-mono text-right ${
                        isMe ? 'text-white/70 dark:text-black/60' : 'text-neutral-400'
                      }`}
                    >
                      {timeString}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-[#1E1F20]/70 backdrop-blur-xl flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-full bg-neutral-100 dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#1A73E8]"
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || sending}
            className="h-9 px-4 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    );
  }

  // DEFAULT VIEW: Clean, ultra-minimalist messages index
  return (
    <div className="max-w-xl mx-auto w-full min-h-screen flex flex-col px-3 sm:px-4 py-3">
      {/* 1. Sleek Minimal Header */}
      <div className="flex items-center justify-between py-2 border-b border-black/[0.06] dark:border-white/[0.08] mb-3">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 transition-colors"
              title="Go back"
            >
              <GeminiIcon name="arrow-left" size={18} />
            </button>
          )}
          <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white font-sans">
            Messages
          </h1>
        </div>

        {/* Clean, simple user status */}
        <span className="text-[11px] font-mono text-neutral-400">
          {profile.full_name || profile.matric_number || 'Scholar'}
        </span>
      </div>

      {/* 2. Simple Username / Peer Search Bar */}
      <div className="relative mb-3">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
          <GeminiIcon name="search" size={14} />
        </div>
        <input
          type="text"
          placeholder="Search by username, name, or school..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-white dark:bg-[#1E1F20] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#1A73E8] transition-all shadow-xs"
        />
      </div>

      {/* 3. Messages List (Pinned AI on Top + Real Registered Scholars) */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] divide-y divide-black/[0.04] dark:divide-white/[0.06] shadow-lg shadow-black/[0.02] overflow-hidden">
        {/* Pinned Cohart AI Row */}
        <button
          onClick={() => setCurrentView('ai')}
          className="w-full p-3.5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-left group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="h-10 w-10 rounded-2xl bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 border border-[#0B57D0]/20 dark:border-[#1A73E8]/20 flex items-center justify-center text-[#0B57D0] dark:text-[#1A73E8]">
                <GeminiIcon name="sparkle" size={20} />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">
                  Cohart AI
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 text-[#0B57D0] dark:text-[#1A73E8] font-bold">
                  Pinned
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                Tap to chat with your 24/7 academic study companion...
              </p>
            </div>
          </div>

          <GeminiIcon name="chevron-right" size={16} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>

        {/* Real Registered Peers */}
        {loadingPeers ? (
          <div className="p-8 text-center text-xs text-neutral-400">
            Searching scholars...
          </div>
        ) : peerList.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400 space-y-1">
            <p className="font-semibold text-neutral-600 dark:text-neutral-300">
              {searchQuery ? 'No scholars match this query' : 'No other students online right now'}
            </p>
            <p className="text-[11px]">
              Try searching for another username or school.
            </p>
          </div>
        ) : (
          peerList.map((peer) => (
            <button
              key={peer.id}
              onClick={() => {
                setSelectedUser(peer);
                setCurrentView('chat');
              }}
              className="w-full p-3.5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-left group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center font-bold text-xs text-neutral-800 dark:text-neutral-200 uppercase shrink-0">
                  {getInitials(peer.full_name)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {peer.full_name || peer.matric_number || 'Scholar'}
                    </span>
                    {peer.level && (
                      <span className="text-[10px] font-mono text-neutral-400">
                        {peer.level}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                    {peer.department ? `${peer.department} • ` : ''}
                    {peer.institution || 'Public University'}
                  </p>
                </div>
              </div>

              <GeminiIcon name="chevron-right" size={16} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  );
};

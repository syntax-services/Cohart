'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { Badge } from '@/components/ui/Badge';
import {
  StudentProfile,
  Location,
  QuizData,
  PeerStudent,
  CampusStudySquad,
  PeerDirectMessage,
} from '@/lib/types';
import {
  INITIAL_PEER_STUDENTS,
  INITIAL_STUDY_SQUADS,
  INITIAL_DIRECT_MESSAGES,
} from '@/lib/peerSocialMock';
import { CampusAiAssistant } from './CampusAiAssistant';

interface CampusSocialHubProps {
  profile: StudentProfile;
  locations?: Location[];
  onSelectVenue?: (code: string) => void;
  onMilestoneAction?: (actionId: string) => void;
  onUpdateProfile?: (updated: Partial<StudentProfile>) => void;
  onStartQuiz?: (quiz: QuizData) => void;
  initialPrompt?: string;
}

type SocialSubTab = 'peers' | 'squads' | 'connected_string' | 'ai';

export const CampusSocialHub: React.FC<CampusSocialHubProps> = ({
  profile,
  locations,
  onSelectVenue,
  onMilestoneAction,
  onUpdateProfile,
  onStartQuiz,
  initialPrompt,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SocialSubTab>('peers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnivFilter, setSelectedUnivFilter] = useState<string>('all');
  const [selectedPeer, setSelectedPeer] = useState<PeerStudent | null>(null);

  // Peer Direct Messages state
  const [directMessages, setDirectMessages] = useState<Record<string, PeerDirectMessage[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cohart_peer_messages');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_DIRECT_MESSAGES;
  });

  const [messageInput, setMessageInput] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedPeer, directMessages]);

  // Voice recording mock simulation with real timer
  const toggleVoiceRecording = () => {
    if (isVoiceRecording) {
      // Stop and send voice note
      setIsVoiceRecording(false);
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);

      if (selectedPeer && voiceSeconds > 0) {
        const newMsg: PeerDirectMessage = {
          id: `dm_voice_${Date.now()}`,
          senderId: 'usr_me',
          receiverId: selectedPeer.id,
          content: 'Voice note (' + voiceSeconds + 's)',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'voice_note',
          voiceDurationSeconds: voiceSeconds,
          isRead: true,
        };

        const updated = {
          ...directMessages,
          [selectedPeer.id]: [...(directMessages[selectedPeer.id] || []), newMsg],
        };
        setDirectMessages(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cohart_peer_messages', JSON.stringify(updated));
        }
      }
      setVoiceSeconds(0);
    } else {
      setIsVoiceRecording(true);
      setVoiceSeconds(0);
      voiceTimerRef.current = setInterval(() => {
        setVoiceSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  // Send Direct Message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPeer || !messageInput.trim()) return;

    const newMsg: PeerDirectMessage = {
      id: `dm_${Date.now()}`,
      senderId: 'usr_me',
      receiverId: selectedPeer.id,
      content: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      isRead: true,
    };

    const updated = {
      ...directMessages,
      [selectedPeer.id]: [...(directMessages[selectedPeer.id] || []), newMsg],
    };
    setDirectMessages(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cohart_peer_messages', JSON.stringify(updated));
    }
    setMessageInput('');
  };

  // Filter peers by search and university
  const filteredPeers = useMemo(() => {
    return INITIAL_PEER_STUDENTS.filter((peer) => {
      const matchesSearch =
        peer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        peer.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        peer.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        peer.institutionCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUniv =
        selectedUnivFilter === 'all' ||
        peer.institutionCode.toLowerCase() === selectedUnivFilter.toLowerCase() ||
        (selectedUnivFilter === 'my_school' &&
          profile.institution &&
          peer.institutionName.toLowerCase().includes(profile.institution.toLowerCase()));

      return matchesSearch && matchesUniv;
    });
  }, [searchQuery, selectedUnivFilter, profile.institution]);

  return (
    <div className="min-h-[85vh] w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 flex flex-col gap-4">
      {/* 1. Universal Top Social Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-3xl bg-[#0A0A0A]/90 border border-white/10 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#1A73E8] to-[#387BFF] text-white shadow-lg shadow-[#1A73E8]/30">
            <GeminiIcon name="users" size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Peer Social Hub
              </h1>
              <Badge variant="blue" className="text-[10px] py-0 px-2 font-mono">
                Across All Schools
              </Badge>
            </div>
            <p className="text-xs text-neutral-400">
              Campus scholars, study squads, shared String accounts & pinned Cohart AI
            </p>
          </div>
        </div>

        {/* Tab Switcher: Peers, Squads, String ID, Pinned AI */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setActiveSubTab('peers');
              setSelectedPeer(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'peers'
                ? 'bg-white/15 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Scholars ({INITIAL_PEER_STUDENTS.length})
          </button>

          <button
            onClick={() => {
              setActiveSubTab('squads');
              setSelectedPeer(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'squads'
                ? 'bg-white/15 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Study Squads
          </button>

          <button
            onClick={() => {
              setActiveSubTab('connected_string');
              setSelectedPeer(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'connected_string'
                ? 'bg-[#1A73E8]/20 text-[#387BFF] border border-[#1A73E8]/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#387BFF]" />
            String Connect
          </button>

          <button
            onClick={() => setActiveSubTab('ai')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'ai'
                ? 'bg-white/20 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <GeminiIcon name="sparkle" size={13} className="text-[#387BFF]" />
            <span>Pinned AI</span>
          </button>
        </div>
      </div>

      {/* 2. TAB: PINNED AI ASSISTANT CONVERSATION */}
      {activeSubTab === 'ai' && (
        <div className="flex-1 min-h-[75vh] rounded-3xl border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-2xl overflow-hidden shadow-2xl">
          <div className="p-3 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#1A73E8]/20 text-[#387BFF] border border-[#1A73E8]/30 font-mono text-[10px] font-bold">
                PINNED CONVERSATION
              </span>
              <span className="text-xs text-neutral-300 font-medium">
                Cohart AI Senior Companion
              </span>
            </div>
            <button
              onClick={() => setActiveSubTab('peers')}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <GeminiIcon name="arrow-left" size={14} />
              <span>Back to Social</span>
            </button>
          </div>
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
      )}

      {/* 3. TAB: STRING CONNECT (Shared Universal Account Bridge) */}
      {activeSubTab === 'connected_string' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl bg-[#0A0A0A]/90 border border-white/10 backdrop-blur-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-white font-mono font-bold text-sm">
                S
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Unified Google-Style Single Sign-On</h3>
                <p className="text-xs text-neutral-400">Cohart & String Interconnected Account Bridge</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Just like using Google services with one Gmail account, your Cohart student identity is equipped with seamless universal sign-on credentials. Log in to String campus marketplace directly with your Cohart scholar email, or vice versa, without creating redundant profiles.
            </p>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Current Student Identity:</span>
                <span className="font-mono text-white font-medium">{profile.email || 'Guest Scholar'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Linked String Status:</span>
                <Badge variant="blue" size="sm">Ready to Pair</Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Assigned String Bridge ID:</span>
                <span className="font-mono text-[#387BFF]">str_uni_{profile.id.slice(0, 10)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Universal String SSO handshake simulated. When String backend sync launches, your Cohart wallet and student verification carry over instantly!');
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#1A73E8] to-[#387BFF] text-white text-xs font-bold hover:opacity-95 transition-all shadow-lg shadow-[#1A73E8]/30 cursor-pointer"
            >
              Launch String Campus Marketplace with Cohart
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-[#0A0A0A]/90 border border-white/10 backdrop-blur-2xl space-y-4">
            <h3 className="text-base font-bold text-white">What You Unlock Across Both Platforms</h3>
            <div className="space-y-3 text-xs text-neutral-300">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
                <div className="mt-0.5 text-[#387BFF]">
                  <GeminiIcon name="check-circle" size={16} />
                </div>
                <div>
                  <strong className="text-white block">One Wallet, Shared Campus Cash</strong>
                  Earn referral bonuses on Cohart and spend them immediately with campus merchants on String.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
                <div className="mt-0.5 text-[#387BFF]">
                  <GeminiIcon name="check-circle" size={16} />
                </div>
                <div>
                  <strong className="text-white block">Verified Student Identity</strong>
                  Your verified university badge and level transfer directly to String buyer/merchant escrow trust scores.
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-start gap-3">
                <div className="mt-0.5 text-[#387BFF]">
                  <GeminiIcon name="check-circle" size={16} />
                </div>
                <div>
                  <strong className="text-white block">Direct Chat with Campus Merchant Peers</strong>
                  Talk directly to peer scholars who sell past questions, textbooks, calculators, and study gear.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: STUDY SQUADS */}
      {activeSubTab === 'squads' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_STUDY_SQUADS.map((squad) => (
              <div
                key={squad.id}
                className="p-5 rounded-3xl bg-[#0A0A0A]/90 border border-white/10 backdrop-blur-2xl space-y-3 hover:border-white/20 transition-all shadow-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-[#387BFF] font-bold block mb-1">
                      {squad.courseCode} • {squad.institutionCode === 'ALL' ? 'National Cohort' : squad.institutionCode}
                    </span>
                    <h3 className="text-sm font-bold text-white">{squad.name}</h3>
                  </div>
                  <Badge variant="blue" size="sm" className="font-mono text-[10px]">
                    {squad.memberCount} Scholars
                  </Badge>
                </div>

                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {squad.topic}
                </p>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {squad.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] text-neutral-400 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/[0.08]">
                  <span className="text-[11px] text-neutral-500">Active {squad.lastActive}</span>
                  <button
                    onClick={() => {
                      alert(`Joined ${squad.name}! Squad discussions & shared quiz bank synced.`);
                    }}
                    className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Join Squad
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB: SCHOLARS DIRECT CHAT & DIRECTORY */}
      {activeSubTab === 'peers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Peer List (Left Column) */}
          <div className="lg:col-span-5 p-4 rounded-3xl bg-[#0A0A0A]/90 border border-white/10 backdrop-blur-2xl flex flex-col gap-3">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                <GeminiIcon name="search" size={14} />
              </div>
              <input
                type="text"
                placeholder="Search scholars by name, department, university..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#387BFF]"
              />
            </div>

            {/* University Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: 'All Schools' },
                { id: 'my_school', label: 'My Campus' },
                { id: 'UNILAG', label: 'UNILAG' },
                { id: 'UI', label: 'UI' },
                { id: 'OOU', label: 'OOU' },
                { id: 'ABU', label: 'ABU' },
                { id: 'UNN', label: 'UNN' },
              ].map((filt) => (
                <button
                  key={filt.id}
                  onClick={() => setSelectedUnivFilter(filt.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                    selectedUnivFilter === filt.id
                      ? 'bg-[#387BFF] text-white font-bold'
                      : 'bg-white/[0.04] text-neutral-400 hover:text-white'
                  }`}
                >
                  {filt.label}
                </button>
              ))}
            </div>

            {/* Scholars List */}
            <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[60vh] pr-1">
              {filteredPeers.map((peer) => {
                const isSelected = selectedPeer?.id === peer.id;
                const msgs = directMessages[peer.id] || [];
                const lastMsg = msgs[msgs.length - 1];

                return (
                  <button
                    key={peer.id}
                    onClick={() => setSelectedPeer(peer)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 border-white/20 shadow-md'
                        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 border border-white/10 flex items-center justify-center font-bold text-xs text-white uppercase">
                        {peer.name.slice(0, 2)}
                      </div>
                      {peer.isOnline && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0A0A0A]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-white truncate flex items-center gap-1">
                          {peer.name}
                          {peer.verified && (
                            <GeminiIcon name="shield-check" size={12} className="text-[#387BFF]" />
                          )}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                          {peer.institutionCode}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-400 truncate">
                        {peer.department} • {peer.level}
                      </p>

                      {lastMsg ? (
                        <p className="text-[11px] text-neutral-500 truncate mt-1">
                          {lastMsg.content}
                        </p>
                      ) : (
                        <p className="text-[11px] text-neutral-600 italic truncate mt-1">
                          Tap to start peer study chat...
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Peer Direct Chat Area (Right Column) */}
          <div className="lg:col-span-7 rounded-3xl bg-[#0A0A0A]/90 border border-white/10 backdrop-blur-2xl flex flex-col min-h-[500px] max-h-[70vh] overflow-hidden">
            {selectedPeer ? (
              <>
                {/* Chat Header */}
                <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#1A73E8] to-[#387BFF] flex items-center justify-center font-bold text-xs text-white">
                        {selectedPeer.name.slice(0, 2)}
                      </div>
                      {selectedPeer.isOnline && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0A0A0A]" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {selectedPeer.name}
                        {selectedPeer.verified && (
                          <Badge variant="blue" size="sm" className="text-[9px] py-0 px-1.5">
                            Verified Scholar
                          </Badge>
                        )}
                      </h3>
                      <p className="text-[11px] text-neutral-400">
                        {selectedPeer.institutionName} ({selectedPeer.institutionCode}) • {selectedPeer.department}
                      </p>
                    </div>
                  </div>

                  {selectedPeer.stringAccountId && (
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] text-neutral-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#387BFF]" />
                      <span>String Connected</span>
                    </div>
                  )}
                </div>

                {/* Message Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {(directMessages[selectedPeer.id] || []).map((msg) => {
                    const isMe = msg.senderId === 'usr_me';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-gradient-to-tr from-[#1A73E8] to-[#387BFF] text-white rounded-br-xs shadow-md'
                              : 'bg-white/[0.06] border border-white/[0.08] text-neutral-200 rounded-bl-xs'
                          }`}
                        >
                          {msg.type === 'voice_note' ? (
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-white">
                                <GeminiIcon name="volume" size={14} />
                              </div>
                              <span className="font-mono text-xs">{msg.content}</span>
                            </div>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                          <span className="block text-[9px] text-white/60 text-right mt-1 font-mono">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Composer */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-white/10 bg-white/[0.02] flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isVoiceRecording
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-white/[0.06] text-neutral-400 hover:text-white hover:bg-white/[0.1]'
                    }`}
                    title={isVoiceRecording ? 'Tap to send voice note' : 'Record voice note'}
                  >
                    <GeminiIcon name={isVoiceRecording ? 'mic' : 'mic'} size={18} />
                  </button>

                  <input
                    type="text"
                    placeholder={
                      isVoiceRecording
                        ? `Recording voice note (${voiceSeconds}s)... Tap mic to send`
                        : `Message ${selectedPeer.name.split(' ')[0]}...`
                    }
                    value={messageInput}
                    disabled={isVoiceRecording}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#387BFF]"
                  />

                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="h-10 px-4 rounded-2xl bg-[#387BFF] hover:bg-[#1A73E8] text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center cursor-pointer shadow-md"
                  >
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-neutral-400">
                <div className="h-14 w-14 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300">
                  <GeminiIcon name="chat" size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Direct Peer Study Chat</h4>
                  <p className="text-xs text-neutral-500 max-w-sm mt-1">
                    Select a verified scholar from UNILAG, UI, OOU, ABU, UNN or other Nigerian universities on the left to exchange study questions, share quiz notes, and voice notes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

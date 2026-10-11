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

interface CampusSocialHubProps {
  profile: StudentProfile;
  locations?: Location[];
  onSelectVenue?: (code: string) => void;
  onMilestoneAction?: (actionId: string) => void;
  onUpdateProfile?: (updated: Partial<StudentProfile>) => void;
  onStartQuiz?: (quiz: QuizData) => void;
  initialPrompt?: string;
  onBack?: () => void;
  onOpenPinnedAi?: () => void;
}

interface MessageAttachment {
  name: string;
  type: string;
  sizeKb: number;
  previewUrl?: string;
}

interface MessageItem {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  reply_to_snippet?: string;
  reply_to_sender?: string;
  attachment?: MessageAttachment;
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
  onOpenPinnedAi,
}) => {
  // Navigation / view state: 'inbox' | 'chat'
  const [currentView, setCurrentView] = useState<'inbox' | 'chat'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [peerList, setPeerList] = useState<PeerUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PeerUser | null>(null);
  const [loadingPeers, setLoadingPeers] = useState(false);

  // Scholar Profile Lookup Modal State
  const [inspectingPeer, setInspectingPeer] = useState<PeerUser | null>(null);

  // Safety Disclaimer Dismiss State
  const [isSafetyNoticeDismissed, setIsSafetyNoticeDismissed] = useState(false);

  // Chat message state
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; sender: string; snippet: string } | null>(null);
  const [attachedFile, setAttachedFile] = useState<MessageAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load real registered scholars on mount or when searching
  useEffect(() => {
    let active = true;
    async function loadUsers() {
      setLoadingPeers(true);
      try {
        const results = await searchRealUsers(searchQuery);
        if (active) {
          const mySchool = (profile.institution || '').trim().toLowerCase();
          const myDept = (profile.department || '').trim().toLowerCase();

          const sorted = [...results]
            .filter((u) => u.id !== profile.id)
            .sort((a, b) => {
              const aSchool = (a.institution || '').trim().toLowerCase();
              const bSchool = (b.institution || '').trim().toLowerCase();
              const aDept = (a.department || '').trim().toLowerCase();
              const bDept = (b.department || '').trim().toLowerCase();

              const aSameSchool = mySchool && aSchool === mySchool;
              const bSameSchool = mySchool && bSchool === mySchool;
              const aSameDept = myDept && aDept === myDept;
              const bSameDept = myDept && bDept === myDept;

              if (aSameSchool && aSameDept && !(bSameSchool && bSameDept)) return -1;
              if (!(aSameSchool && aSameDept) && bSameSchool && bSameDept) return 1;

              if (aSameSchool && !bSameSchool) return -1;
              if (!aSameSchool && bSameSchool) return 1;

              if (aSameDept && !bSameDept) return -1;
              if (!aSameDept && bSameDept) return 1;

              return 0;
            });

          setPeerList(sorted);
        }
      } catch (err) {
        console.warn('Failed to load peers:', err);
      } finally {
        if (active) setLoadingPeers(false);
      }
    }

    const timer = setTimeout(() => {
      loadUsers();
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, profile.id, profile.institution, profile.department]);

  // Load messages whenever a peer is selected
  useEffect(() => {
    if (!selectedUser) return;
    const targetUserId = selectedUser.id;
    let active = true;

    async function loadMessages() {
      try {
        const msgs = await fetchUserDirectMessages(profile.id, targetUserId);
        if (active && msgs) {
          const formatted: MessageItem[] = msgs.map((m: any) => {
            let contentText = m.content || '';
            let replySnippet: string | undefined;
            let replySender: string | undefined;
            let attachmentData: MessageAttachment | undefined;

            const replyMatch = contentText.match(/\[REPLY_TO:\{([\s\S]*?)\}\]/);
            if (replyMatch) {
              try {
                const parsed = JSON.parse(`{${replyMatch[1]}}`);
                replySnippet = parsed.snippet;
                replySender = parsed.sender;
                contentText = contentText.replace(/\[REPLY_TO:\{[\s\S]*?\}\]/, '').trim();
              } catch {}
            }

            const attachMatch = contentText.match(/\[ATTACHMENT:\{([\s\S]*?)\}\]/);
            if (attachMatch) {
              try {
                attachmentData = JSON.parse(`{${attachMatch[1]}}`);
                contentText = contentText.replace(/\[ATTACHMENT:\{[\s\S]*?\}\]/, '').trim();
              } catch {}
            }

            return {
              ...m,
              content: contentText,
              reply_to_snippet: replySnippet,
              reply_to_sender: replySender,
              attachment: attachmentData,
            };
          });
          setMessages(formatted);
        }
      } catch (err) {
        console.warn('Failed to load messages:', err);
      }
    }

    loadMessages();
    const interval = setInterval(loadMessages, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedUser, profile.id]);

  useEffect(() => {
    if (currentView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentView]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('File exceeds 8MB study document limit.');
      return;
    }

    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    setAttachedFile({
      name: file.name,
      type: file.type || 'document',
      sizeKb: Math.round(file.size / 1024),
      previewUrl: preview,
    });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!messageInput.trim() && !attachedFile) || !selectedUser || sending) return;

    const rawText = messageInput.trim();
    const currentReply = replyingTo;
    const currentAttachment = attachedFile;

    setMessageInput('');
    setReplyingTo(null);
    setAttachedFile(null);
    setSending(true);

    let payload = rawText;
    if (currentReply) {
      payload = `[REPLY_TO:{"sender":${JSON.stringify(currentReply.sender)},"snippet":${JSON.stringify(currentReply.snippet)}}] ` + payload;
    }
    if (currentAttachment) {
      payload = `[ATTACHMENT:{"name":${JSON.stringify(currentAttachment.name)},"type":${JSON.stringify(currentAttachment.type)},"sizeKb":${currentAttachment.sizeKb}}] ` + payload;
    }

    const tempMsg: MessageItem = {
      id: `temp_${Date.now()}`,
      sender_id: profile.id,
      receiver_id: selectedUser.id,
      content: rawText,
      created_at: new Date().toISOString(),
      reply_to_snippet: currentReply?.snippet,
      reply_to_sender: currentReply?.sender,
      attachment: currentAttachment || undefined,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await sendUserDirectMessage(profile.id, selectedUser.id, payload);
      const fresh = await fetchUserDirectMessages(profile.id, selectedUser.id);
      if (fresh) {
        const formatted = fresh.map((m: any) => {
          let contentText = m.content || '';
          let replySnippet: string | undefined;
          let replySender: string | undefined;
          let attachmentData: MessageAttachment | undefined;

          const replyMatch = contentText.match(/\[REPLY_TO:\{([\s\S]*?)\}\]/);
          if (replyMatch) {
            try {
              const parsed = JSON.parse(`{${replyMatch[1]}}`);
              replySnippet = parsed.snippet;
              replySender = parsed.sender;
              contentText = contentText.replace(/\[REPLY_TO:\{[\s\S]*?\}\]/, '').trim();
            } catch {}
          }

          const attachMatch = contentText.match(/\[ATTACHMENT:\{([\s\S]*?)\}\]/);
          if (attachMatch) {
            try {
              attachmentData = JSON.parse(`{${attachMatch[1]}}`);
              contentText = contentText.replace(/\[ATTACHMENT:\{[\s\S]*?\}\]/, '').trim();
            } catch {}
          }

          return {
            ...m,
            content: contentText,
            reply_to_snippet: replySnippet,
            reply_to_sender: replySender,
            attachment: attachmentData,
          };
        });
        setMessages(formatted);
      }
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

  const getPeerBadge = (peer: PeerUser) => {
    const mySchool = (profile.institution || '').trim().toLowerCase();
    const myDept = (profile.department || '').trim().toLowerCase();
    const pSchool = (peer.institution || '').trim().toLowerCase();
    const pDept = (peer.department || '').trim().toLowerCase();

    if (mySchool && pSchool === mySchool && myDept && pDept === myDept) {
      return { label: 'Coursemate', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    }
    if (mySchool && pSchool === mySchool) {
      return { label: 'Same Campus', color: 'bg-[#0B57D0]/10 text-[#0B57D0] dark:text-[#1A73E8] border-[#0B57D0]/20' };
    }
    return { label: 'National Scholar', color: 'bg-neutral-100 dark:bg-white/[0.06] text-neutral-500 dark:text-neutral-400 border-black/[0.04] dark:border-white/[0.06]' };
  };

  // 1-ON-1 PEER CHAT VIEW (Compact, Streamlined, No Dead Space)
  if (currentView === 'chat' && selectedUser) {
    const peerBadge = getPeerBadge(selectedUser);

    return (
      <div className="max-w-3xl mx-auto w-full h-[calc(100dvh-5.5rem)] md:h-[calc(100vh-5.5rem)] flex flex-col rounded-[2rem] bg-white dark:bg-[#1E1F20] border border-black/[0.06] dark:border-white/[0.08] shadow-sm overflow-hidden">
        {/* Sleek Minimal Chat Header */}
        <div className="px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-white/90 dark:bg-[#1E1F20]/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => {
                setSelectedUser(null);
                setCurrentView('inbox');
              }}
              className="p-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 transition-colors shrink-0 cursor-pointer"
              title="Back to all chats"
            >
              <GeminiIcon name="arrow-left" size={17} />
            </button>

            <button
              onClick={() => setInspectingPeer(selectedUser)}
              className="flex items-center gap-2.5 text-left group min-w-0 cursor-pointer"
              title="Click to view Scholar Profile"
            >
              <div className="h-8 w-8 rounded-full bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 border border-[#0B57D0]/20 dark:border-[#1A73E8]/20 flex items-center justify-center font-bold text-xs text-[#0B57D0] dark:text-[#1A73E8] uppercase shrink-0 group-hover:scale-105 transition-transform">
                {getInitials(selectedUser.full_name)}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white truncate">
                    {selectedUser.full_name || selectedUser.matric_number || 'Scholar'}
                  </h2>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border font-semibold ${peerBadge.color}`}>
                    {peerBadge.label}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 truncate">
                  {selectedUser.department ? `${selectedUser.department} • ` : ''}
                  {selectedUser.institution || 'Higher Institution'}
                </p>
              </div>
            </button>
          </div>

          <button
            onClick={() => setInspectingPeer(selectedUser)}
            className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Inspect Scholar Profile"
          >
            <GeminiIcon name="user" size={16} />
          </button>
        </div>

        {/* Compact Safety Banner */}
        <div className="px-4 py-1.5 bg-amber-500/5 dark:bg-amber-500/5 border-b border-amber-500/15 text-[10px] text-amber-900 dark:text-amber-200/90 flex items-center justify-between shrink-0">
          <span className="truncate">Cohart is for verified study sharing. Never send off-platform money.</span>
        </div>

        {/* Compact Message Stream */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
              <div className="h-10 w-10 rounded-full bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-center text-neutral-400 mb-2">
                <GeminiIcon name="chat" size={18} />
              </div>
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Say hello to {selectedUser.full_name || 'this scholar'}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5 max-w-xs">
                Exchange course outlines, lecture notes, and test predictions safely.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_id === profile.id;
              const timeString = m.created_at
                ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                  <div
                    className={`max-w-[82%] sm:max-w-[75%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#0B57D0] dark:bg-[#1A73E8] text-white rounded-br-xs shadow-xs'
                        : 'bg-black/[0.03] dark:bg-white/[0.05] text-neutral-900 dark:text-neutral-100 rounded-bl-xs border border-black/[0.04] dark:border-white/[0.06]'
                    }`}
                  >
                    {/* Quoted Reply */}
                    {m.reply_to_snippet && (
                      <div className={`mb-1.5 p-1.5 rounded-lg border-l-2 text-[10px] ${
                        isMe
                          ? 'bg-black/20 border-white/60 text-white/90'
                          : 'bg-black/[0.04] dark:bg-white/[0.06] border-[#0B57D0] text-neutral-600 dark:text-neutral-300'
                      }`}>
                        <span className="font-bold block uppercase tracking-wider text-[8px] opacity-80">
                          Replying to {m.reply_to_sender || 'Peer'}:
                        </span>
                        <p className="italic line-clamp-1 mt-0.5">"{m.reply_to_snippet}"</p>
                      </div>
                    )}

                    {/* Attachment Card */}
                    {m.attachment && (
                      <div className={`mb-1.5 p-2 rounded-xl flex items-center gap-2 border ${
                        isMe
                          ? 'bg-white/15 border-white/30 text-white'
                          : 'bg-white dark:bg-[#181B24] border-black/[0.06] dark:border-white/[0.08]'
                      }`}>
                        <GeminiIcon name="attachment" size={14} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold truncate">{m.attachment.name}</p>
                          <span className="text-[9px] font-mono opacity-80">{m.attachment.sizeKb} KB</span>
                        </div>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap break-words">{m.content}</p>

                    <div className="flex items-center justify-end gap-1 mt-1 opacity-75 text-[9px] font-mono">
                      <span>{timeString}</span>
                      {isMe && <GeminiIcon name="check" size={10} />}
                    </div>
                  </div>

                  {/* Quick Action Trigger */}
                  <button
                    onClick={() => setReplyingTo({ id: m.id, sender: isMe ? 'You' : (selectedUser.full_name || 'Scholar'), snippet: m.content.slice(0, 60) })}
                    className="text-[10px] text-neutral-400 hover:text-neutral-700 dark:hover:text-white px-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    Reply
                  </button>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Compact Message Input Box (No pb-24 dead space!) */}
        <div className="p-2.5 sm:p-3 border-t border-black/[0.06] dark:border-white/[0.08] bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur-md shrink-0">
          {/* Active Reply Banner */}
          {replyingTo && (
            <div className="flex items-center justify-between px-3 py-1 mb-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border-l-2 border-[#0B57D0] dark:border-[#1A73E8] text-xs">
              <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                <span className="font-semibold text-[#0B57D0] dark:text-[#1A73E8] text-[11px]">
                  Replying to {replyingTo.sender}:
                </span>
                <span className="text-neutral-500 italic text-[11px] truncate">
                  "{replyingTo.snippet}"
                </span>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white p-1 cursor-pointer"
                title="Cancel reply"
              >
                <GeminiIcon name="close" size={12} />
              </button>
            </div>
          )}

          {/* Attached File Preview */}
          {attachedFile && (
            <div className="flex items-center justify-between px-3 py-1 mb-2 rounded-xl bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 border border-[#0B57D0]/20 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <GeminiIcon name="attachment" size={13} className="text-[#0B57D0] dark:text-[#1A73E8]" />
                <span className="font-medium text-neutral-800 dark:text-white truncate text-[11px]">
                  {attachedFile.name} ({attachedFile.sizeKb} KB)
                </span>
              </div>
              <button
                onClick={() => setAttachedFile(null)}
                className="text-neutral-400 hover:text-rose-500 p-1 cursor-pointer"
                title="Remove file"
              >
                <GeminiIcon name="close" size={12} />
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/*,.docx,.txt,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full bg-black/[0.03] dark:bg-white/[0.05] text-neutral-500 hover:text-[#0B57D0] dark:hover:text-[#1A73E8] transition-colors cursor-pointer shrink-0"
              title="Attach study note or past question"
            >
              <GeminiIcon name="attachment" size={15} />
            </button>

            <input
              type="text"
              placeholder="Type a message or share course notes..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-full bg-neutral-100/90 dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#1A73E8]"
            />

            <button
              type="submit"
              disabled={(!messageInput.trim() && !attachedFile) || sending}
              className="h-8 px-4 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shrink-0"
            >
              Send
            </button>
          </form>
        </div>

        {/* Scholar Profile Modal */}
        {inspectingPeer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-[#181B24] rounded-[2rem] border border-black/[0.08] dark:border-white/[0.08] p-6 max-w-sm w-full shadow-2xl relative">
              <button
                onClick={() => setInspectingPeer(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                <GeminiIcon name="close" size={16} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 border border-[#0B57D0]/20 flex items-center justify-center text-xl font-bold text-[#0B57D0] dark:text-[#1A73E8] uppercase mb-3">
                  {getInitials(inspectingPeer.full_name)}
                </div>

                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {inspectingPeer.full_name || 'Verified Scholar'}
                </h3>

                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getPeerBadge(inspectingPeer).color}`}>
                    {getPeerBadge(inspectingPeer).label}
                  </span>
                  {inspectingPeer.level && (
                    <Badge variant="blue" size="sm" className="rounded-full px-2 font-mono text-[10px]">
                      {inspectingPeer.level}
                    </Badge>
                  )}
                </div>

                <div className="w-full mt-4 p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] text-left space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase">Department</span>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">{inspectingPeer.department || 'General Studies'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase">Institution</span>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">{inspectingPeer.institution || 'Higher Institution'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase">Academic Verification</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] mt-0.5">
                      Verified Scholar
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setInspectingPeer(null)}
                  className="w-full mt-5 py-2.5 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Return to Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DEFAULT VIEW: Clean, Compact Messages & Scholars Index
  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col space-y-3 pb-8">
      {/* 1. Header */}
      <div className="flex items-center justify-between py-2 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              title="Go back"
            >
              <GeminiIcon name="arrow-left" size={17} />
            </button>
          )}
          <h1 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white font-sans">
            Messages & Scholars
          </h1>
        </div>

        <span className="text-[11px] font-mono text-neutral-400">
          {profile.department || 'Campus'} • {profile.institution || 'Nigeria'}
        </span>
      </div>

      {/* 2. Compact Campus Safety Notice */}
      {!isSafetyNoticeDismissed && (
        <div className="p-3 rounded-2xl bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/15 text-xs text-amber-900 dark:text-amber-200/90 flex items-start justify-between gap-3 animate-in fade-in">
          <p className="text-[11px] leading-relaxed">
            Cohart facilitates peer academic collaboration. We are not liable for off-platform financial transactions. Never send money or share bank PINs with anyone.
          </p>
          <button
            onClick={() => setIsSafetyNoticeDismissed(true)}
            className="p-1 text-amber-700 dark:text-amber-300 hover:opacity-75 transition-opacity cursor-pointer shrink-0"
            title="Dismiss notice"
          >
            <GeminiIcon name="close" size={13} />
          </button>
        </div>
      )}

      {/* 3. Search Bar */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
          <GeminiIcon name="search" size={14} />
        </div>
        <input
          type="text"
          placeholder="Search coursemates, departments, or other schools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2 rounded-full bg-white dark:bg-[#1E1F20] border border-black/[0.06] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#1A73E8] transition-all shadow-xs"
        />
      </div>

      {/* 4. Messages & Peer List */}
      <div className="bg-white dark:bg-[#1E1F20] rounded-[2rem] border border-black/[0.06] dark:border-white/[0.08] divide-y divide-black/[0.04] dark:divide-white/[0.06] shadow-sm overflow-hidden">
        {/* Pinned Assistant Row */}
        <button
          onClick={() => {
            if (onOpenPinnedAi) onOpenPinnedAi();
          }}
          className="w-full p-3.5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 border border-[#0B57D0]/20 dark:border-[#1A73E8]/20 flex items-center justify-center text-[#0B57D0] dark:text-[#1A73E8] shrink-0">
              <GeminiIcon name="sparkle" size={17} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                  Cohart Assistant
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 text-[#0B57D0] dark:text-[#1A73E8] font-semibold">
                  Pinned Assistant
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                24/7 academic advisor • Syllabus breakdowns, CGPA calculations, and exam drills...
              </p>
            </div>
          </div>

          <GeminiIcon name="chevron-right" size={15} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>

        {/* Real Registered Peers */}
        {loadingPeers ? (
          <div className="p-8 text-center text-xs text-neutral-400">
            Finding coursemates and campus scholars...
          </div>
        ) : peerList.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400 space-y-1">
            <p className="font-semibold text-neutral-600 dark:text-neutral-300">
              {searchQuery ? 'No scholars match this search' : 'No coursemates active in this view'}
            </p>
            <p className="text-[11px]">
              Invite your department coursemates to exchange notes and test tips.
            </p>
          </div>
        ) : (
          peerList.map((peer) => {
            const peerBadge = getPeerBadge(peer);

            return (
              <button
                key={peer.id}
                onClick={() => {
                  setSelectedUser(peer);
                  setCurrentView('chat');
                }}
                className="w-full p-3.5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center font-bold text-xs text-neutral-800 dark:text-neutral-200 uppercase shrink-0">
                    {getInitials(peer.full_name)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                        {peer.full_name || peer.matric_number || 'Scholar'}
                      </span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border font-semibold ${peerBadge.color}`}>
                        {peerBadge.label}
                      </span>
                      {peer.level && (
                        <span className="text-[10px] font-mono text-neutral-400">
                          {peer.level}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {peer.department ? `${peer.department} • ` : ''}
                      {peer.institution || 'Higher Institution'}
                    </p>
                  </div>
                </div>

                <GeminiIcon name="chevron-right" size={15} className="text-neutral-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile } from '@/lib/types';

interface CoordinatorNote {
  id: string;
  courseCode: string;
  title: string;
  coordinatorName: string;
  hallVenue: string;
  dropTime: string;
  pages: number;
  snippet: string;
  upvotes: number;
}

const SAMPLE_COORDINATOR_NOTES: CoordinatorNote[] = [
  {
    id: 'cn-1',
    courseCode: 'ECO 201',
    title: 'Short-Run Cost Curves & Break-Even Derivation',
    coordinatorName: 'Amina Balogun (Class Rep)',
    hallVenue: 'SMS-LT1 Lecture',
    dropTime: '2 hours ago',
    pages: 3,
    snippet:
      'Lecture breakdown of AFC, AVC, ATC, and MC curves. Includes Lecturer Dr. Adeleke’s key hints on exam derivation questions.',
    upvotes: 42,
  },
  {
    id: 'cn-2',
    courseCode: 'GNS 201',
    title: 'Pre-Colonial State Systems: Nok & Yoruba Kingdoms',
    coordinatorName: 'Tobi Daniels (Faculty Coordinator)',
    hallVenue: 'LLT-1 General Lecture',
    dropTime: 'Yesterday',
    pages: 4,
    snippet:
      'High-yield bullet points on constitutional checks and balances in Old Oyo Empire (Oyomesi, Bashorun, and Ogboni cult).',
    upvotes: 68,
  },
];

interface CoordinatorNotesFeedProps {
  profile: StudentProfile;
  onOpenReader?: () => void;
}

export const CoordinatorNotesFeed: React.FC<CoordinatorNotesFeedProps> = ({
  onOpenReader,
}) => {
  const [bookmarkedNotes, setBookmarkedNotes] = useState<string[]>([]);
  const [upvotedNotes, setUpvotedNotes] = useState<string[]>([]);

  const handleBookmark = (id: string) => {
    if (bookmarkedNotes.includes(id)) {
      setBookmarkedNotes(bookmarkedNotes.filter((b) => b !== id));
    } else {
      setBookmarkedNotes([...bookmarkedNotes, id]);
    }
  };

  const handleUpvote = (id: string) => {
    if (upvotedNotes.includes(id)) {
      setUpvotedNotes(upvotedNotes.filter((u) => u !== id));
    } else {
      setUpvotedNotes([...upvotedNotes, id]);
    }
  };

  return (
    <div className="rounded-[2rem] bg-[#121316] border border-white/[0.08] p-5 sm:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <GeminiIcon name="book-open" size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Coordinator Vault Drops
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">• Verified</span>
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Post-Lecture Summaries & Notes
            </h3>
          </div>
        </div>

        <span className="text-[10px] font-mono text-neutral-400 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full">
          Live Faculty Vault
        </span>
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed">
        Directly transcribed lecture outlines shared by verified departmental course coordinators right after classes.
      </p>

      {/* Notes List */}
      <div className="space-y-3">
        {SAMPLE_COORDINATOR_NOTES.map((note) => {
          const isBookmarked = bookmarkedNotes.includes(note.id);
          const isUpvoted = upvotedNotes.includes(note.id);

          return (
            <div
              key={note.id}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                    {note.courseCode}
                  </span>
                  <span className="text-xs font-bold text-white">{note.title}</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">{note.dropTime}</span>
              </div>

              <p className="text-[11px] text-neutral-300 leading-relaxed">{note.snippet}</p>

              <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[10px] font-mono">
                <span className="text-neutral-400 flex items-center gap-1">
                  <GeminiIcon name="shield-check" size={12} className="text-emerald-400" />
                  <span>{note.coordinatorName}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpvote(note.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                      isUpvoted
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/[0.04] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>▲</span>
                    <span>{note.upvotes + (isUpvoted ? 1 : 0)}</span>
                  </button>

                  <button
                    onClick={() => handleBookmark(note.id)}
                    className={`px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                      isBookmarked
                        ? 'bg-white text-neutral-950 font-bold border-white'
                        : 'border-white/[0.08] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {isBookmarked ? '✓ In Vault' : '+ Vault'}
                  </button>

                  {onOpenReader && (
                    <button
                      onClick={onOpenReader}
                      className="px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white cursor-pointer font-bold"
                    >
                      Read →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

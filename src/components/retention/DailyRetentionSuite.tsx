'use client';

import React from 'react';
import { StudentProfile } from '@/lib/types';
import { MorningCampusBriefing } from '@/components/retention/MorningCampusBriefing';
import { DailyMicroDrill } from '@/components/retention/DailyMicroDrill';
import { SilentStudyFloor } from '@/components/retention/SilentStudyFloor';
import { NightPastQuestionDrop } from '@/components/retention/NightPastQuestionDrop';
import { CoordinatorNotesFeed } from '@/components/retention/CoordinatorNotesFeed';

interface DailyRetentionSuiteProps {
  profile: StudentProfile;
  onOpenSchedule: () => void;
  onSelectVenue?: (venueCode: string) => void;
  onOpenReader?: () => void;
  onOpenVault?: () => void;
}

export const DailyRetentionSuite: React.FC<DailyRetentionSuiteProps> = ({
  profile,
  onOpenSchedule,
  onSelectVenue,
  onOpenReader,
  onOpenVault,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. 07:00 AM Morning Campus Briefing */}
      <MorningCampusBriefing
        profile={profile}
        onOpenSchedule={onOpenSchedule}
        onSelectVenue={onSelectVenue}
      />

      {/* 2 & 3: Daily Micro-Drill & Silent Study Floor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DailyMicroDrill profile={profile} />
        <SilentStudyFloor profile={profile} />
      </div>

      {/* 4 & 5: Night Past-Question Drop & Coordinator Notes Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NightPastQuestionDrop profile={profile} onOpenVault={onOpenVault} />
        <CoordinatorNotesFeed profile={profile} onOpenReader={onOpenReader} />
      </div>
    </div>
  );
};

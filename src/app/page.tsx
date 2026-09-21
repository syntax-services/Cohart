'use client';

import React, { useState, useEffect } from 'react';
import { TopHeader } from '@/components/molecules/TopHeader';
import { BottomNav, NavTab } from '@/components/molecules/BottomNav';
import { AcademicHubView } from '@/components/organisms/AcademicHubView';
import { InteractiveReader } from '@/components/organisms/InteractiveReader';
import { ScheduleView } from '@/components/organisms/ScheduleView';
import { ProfileView } from '@/components/organisms/ProfileView';
import { CampusMapWrapper } from '@/components/map/CampusMapWrapper';
import { Location } from '@/lib/types';
import { fetchLocations } from '@/lib/supabase';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { AuthModal } from '@/components/auth/AuthModal';

export default function AppHomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>('map');
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<NavTab | null>(null);

  const [isAiFullscreen, setIsAiFullscreen] = useState(false);

  const { profile, userId, saveProfile, signOut } = useStudentProfile();
  const isAuthenticated = Boolean(userId);

  useEffect(() => {
    async function loadLocations() {
      const data = await fetchLocations();
      setLocations(data);
    }
    loadLocations();
  }, []);

  // Intercept navigation for unauthenticated guests
  const handleTabChange = (targetTab: NavTab) => {
    if (isAiFullscreen) {
      setIsAiFullscreen(false);
    }

    if (targetTab === 'map') {
      setActiveTab('map');
      return;
    }

    if (!isAuthenticated) {
      setPendingTab(targetTab);
      setIsAuthModalOpen(true);
      return;
    }

    setActiveTab(targetTab);
  };

  const handleAuthSuccess = (fullName: string, email: string, newUserId?: string) => {
    saveProfile({
      id: newUserId,
      full_name: fullName,
      email,
    });
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    } else {
      setActiveTab('hub');
    }
  };

  const handleSelectVenue = (locationCode: string) => {
    if (isAiFullscreen) {
      setIsAiFullscreen(false);
    }
    const target = locations.find(
      (l) => l.code === locationCode || l.id === locationCode
    );
    if (target) {
      setSelectedLocationId(target.id);
    } else {
      setSelectedLocationId(locationCode);
    }
    setActiveTab('map');
  };

  const displayedLocations = React.useMemo(() => {
    if (!searchFilter.trim()) return locations;
    const q = searchFilter.toLowerCase();
    return locations.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        l.faculty.toLowerCase().includes(q) ||
        (l.department && l.department.toLowerCase().includes(q))
    );
  }, [locations, searchFilter]);

  const isAiActive = isAiFullscreen && activeTab === 'reader';

  return (
    <div className={`min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200 ${isAiActive ? 'h-screen overflow-hidden' : ''}`}>
      {/* Top Header - Hidden in AI Mode */}
      {!isAiActive && (
        <TopHeader
          profile={profile}
          onOpenProfile={() => setActiveTab('profile')}
          onSearch={setSearchFilter}
        />
      )}

      {/* Main Content Area - Full Bleed in AI Mode, else pb-24 clearance */}
      <main className={isAiActive ? 'flex-1 w-full h-full overflow-hidden p-0 m-0' : 'flex-1 px-3 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto w-full pb-24 sm:pb-28'}>
        {activeTab === 'hub' && (
          <AcademicHubView
            profile={profile}
            locations={locations}
            onSelectVenue={handleSelectVenue}
            onOpenReader={() => setActiveTab('reader')}
            onOpenSchedule={() => setActiveTab('schedule')}
          />
        )}

        {activeTab === 'reader' && (
          <InteractiveReader
            profile={profile}
            onLocateVenue={handleSelectVenue}
            onAiModeChange={setIsAiFullscreen}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView
            profile={profile}
            onLocateVenue={handleSelectVenue}
          />
        )}

        {activeTab === 'map' && (
          <div className="h-[75vh] sm:h-[80vh] w-full">
            <CampusMapWrapper
              locations={displayedLocations}
              selectedLocationId={selectedLocationId}
              onSelectLocation={(loc) => setSelectedLocationId(loc.id)}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            onUpdateProfile={saveProfile}
            onOpenSchedule={() => setActiveTab('schedule')}
            onOpenReader={() => setActiveTab('reader')}
            onSignOut={signOut}
          />
        )}
      </main>

      {/* PWA Floating Bottom Navigation Bar - Hidden in AI Mode */}
      {!isAiActive && (
        <BottomNav activeTab={activeTab} onChangeTab={handleTabChange} />
      )}

      {/* Guest Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

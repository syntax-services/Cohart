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

export default function AppHomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>('hub');
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const { profile, saveProfile } = useStudentProfile();

  useEffect(() => {
    async function loadLocations() {
      const data = await fetchLocations();
      setLocations(data);
    }
    loadLocations();
  }, []);

  const handleSelectVenue = (locationCode: string) => {
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

  return (
    <div className="min-h-screen bg-[#06080D] text-white flex flex-col font-sans selection:bg-[#387BFF]/30 selection:text-white">
      {/* Top Header */}
      <TopHeader
        profile={profile}
        onOpenProfile={() => setActiveTab('profile')}
        onSearch={setSearchFilter}
      />

      {/* Main Content Area with Bottom Bar clearance (pb-24) */}
      <main className="flex-1 px-3 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto w-full pb-24 sm:pb-28">
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
          <InteractiveReader profile={profile} />
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
          />
        )}
      </main>

      {/* PWA Floating Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}

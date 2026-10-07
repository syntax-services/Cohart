'use client';

import React, { useState, useEffect } from 'react';
import { TopHeader } from '@/components/molecules/TopHeader';
import { BottomNav, NavTab } from '@/components/molecules/BottomNav';
import { AcademicHubView } from '@/components/organisms/AcademicHubView';
import { InteractiveReader } from '@/components/organisms/InteractiveReader';
import { ScheduleView } from '@/components/organisms/ScheduleView';
import { ProfileView } from '@/components/organisms/ProfileView';
import { CampusMapWrapper } from '@/components/map/CampusMapWrapper';
import { CampusAiAssistant } from '@/components/organisms/CampusAiAssistant';
import { CampusSocialHub } from '@/components/organisms/CampusSocialHub';
import { Location, QuizData } from '@/lib/types';
import { fetchLocations } from '@/lib/supabase';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import { AuthModal } from '@/components/auth/AuthModal';
import { QuizRunner } from '@/components/organisms/QuizRunner';
import { isOouStudent } from '@/lib/campusVerification';

export default function AppHomePage() {
  const [activeTab, setActiveTab] = useState<NavTab>('hub');
  const [previousTab, setPreviousTab] = useState<NavTab>('hub');
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<NavTab | null>(null);
  const [isAiFullscreen, setIsAiFullscreen] = useState(false);
  const [verifiedMilestones, setVerifiedMilestones] = useState<string[]>([]);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | null>(null);
  const [sharedQuiz, setSharedQuiz] = useState<QuizData | null>(null);

  const { profile, userId, saveProfile, signOut } = useStudentProfile();
  const isAuthenticated = Boolean(userId);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Rehydrate page/tab from URL or cache on mount (MPA-like navigation resilience)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab') as NavTab | null;
      const cachedTab = localStorage.getItem('cohart_active_tab') as NavTab | null;
      const validTabs: NavTab[] = ['hub', 'reader', 'schedule', 'map', 'ai', 'profile'];

      let initialTab: NavTab = 'hub';
      if (urlTab && validTabs.includes(urlTab)) {
        initialTab = urlTab;
      } else if (cachedTab && validTabs.includes(cachedTab)) {
        initialTab = cachedTab;
      }

      // Check map eligibility
      if (initialTab === 'map' && profile && !isOouStudent(profile.institution)) {
        setActiveTab('profile');
        showToast('Map not yet available for your institution. We are expanding rapidly—check news & socials to see when your school launches!');
      } else {
        setActiveTab(initialTab);
      }

      const savedMilestones = localStorage.getItem('cohart_verified_milestones');
      if (savedMilestones) {
        try {
          setVerifiedMilestones(JSON.parse(savedMilestones));
        } catch {
          // Ignore parse error
        }
      }

      const quizPayload = params.get('quizPayload');
      if (quizPayload) {
        try {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(quizPayload)))));
          if (decoded && decoded.questions && decoded.questions.length > 0) {
            setSharedQuiz(decoded);
          }
        } catch (e) {
          console.warn('Failed to parse shared quiz', e);
        }
      }
    }
  }, [profile?.institution]);

  // Listen to browser/phone back button (popstate) to smoothly revert to previous screen
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // If AI fullscreen was open, back closes it
      if (isAiFullscreen) {
        setIsAiFullscreen(false);
        return;
      }
      if (e.state && e.state.tab) {
        const nextTab = e.state.tab;
        if (nextTab === 'map' && !isOouStudent(profile?.institution)) {
          setActiveTab('profile');
          showToast('Map not yet available for your institution. We are expanding rapidly—check news & socials to see when your school launches!');
        } else {
          setActiveTab(nextTab);
          localStorage.setItem('cohart_active_tab', nextTab);
        }
      } else {
        // Default back to hub
        setActiveTab('hub');
        localStorage.setItem('cohart_active_tab', 'hub');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAiFullscreen, profile?.institution]);

  useEffect(() => {
    async function loadLocations() {
      const data = await fetchLocations();
      setLocations(data);
    }
    loadLocations();
  }, []);

  const changeTab = (targetTab: NavTab) => {
    if (targetTab === 'map' && !isOouStudent(profile?.institution)) {
      setPreviousTab(activeTab);
      setActiveTab('profile');
      if (typeof window !== 'undefined') {
        localStorage.setItem('cohart_active_tab', 'profile');
        window.history.pushState({ tab: 'profile' }, '', '?tab=profile');
      }
      showToast('Map not yet available for your institution. We are expanding rapidly—check news & socials to see when your school launches!');
      return;
    }

    setPreviousTab((prev) => (prev !== targetTab && activeTab !== targetTab ? activeTab : prev));
    setActiveTab(targetTab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cohart_active_tab', targetTab);
      const newUrl = targetTab === 'hub' ? window.location.pathname : `?tab=${targetTab}`;
      window.history.pushState({ tab: targetTab }, '', newUrl);
    }
  };

  const handleMarkMilestone = (milestoneId: string) => {
    setVerifiedMilestones((prev) => {
      if (prev.includes(milestoneId)) return prev;
      const updated = [...prev, milestoneId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('cohart_verified_milestones', JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Intercept navigation for unauthenticated guests
  const handleTabChange = (targetTab: NavTab) => {
    if (isAiFullscreen && targetTab !== 'ai') {
      setIsAiFullscreen(false);
    }

    if (!isAuthenticated) {
      setPendingTab(targetTab);
      setIsAuthModalOpen(true);
      return;
    }

    changeTab(targetTab);
  };

  const handleAuthSuccess = (fullName: string, email: string, newUserId?: string, userInstitution?: string) => {
    saveProfile({
      id: newUserId,
      full_name: fullName,
      email,
      ...(userInstitution ? { institution: userInstitution } : {}),
    });
    if (pendingTab) {
      changeTab(pendingTab);
      setPendingTab(null);
    } else {
      changeTab('hub');
    }
  };

  const handleSelectVenue = (locationCode: string) => {
    if (!isOouStudent(profile?.institution)) {
      changeTab('profile');
      showToast('Map not yet available for your institution. We are expanding rapidly—check news & socials to see when your school launches!');
      return;
    }

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
    changeTab('map');
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

  const isAiActive = (isAiFullscreen && activeTab === 'reader') || activeTab === 'ai';

  return (
    <div className={`min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200 ${isAiActive ? 'h-screen overflow-hidden' : ''}`}>
      {/* Top Header - Hidden in AI Mode */}
      {!isAiActive && (
        <TopHeader
          profile={profile}
          onOpenProfile={() => handleTabChange('profile')}
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
            onOpenReader={() => handleTabChange('reader')}
            onOpenSchedule={() => handleTabChange('schedule')}
            onOpenProfile={() => handleTabChange('profile')}
            onOpenAi={(prompt) => {
              if (prompt) setAiInitialPrompt(prompt);
              changeTab('ai');
            }}
            verifiedMilestones={verifiedMilestones}
            onMarkMilestone={handleMarkMilestone}
          />
        )}

        {activeTab === 'reader' && (
          <InteractiveReader
            profile={profile}
            onLocateVenue={handleSelectVenue}
            onAiModeChange={setIsAiFullscreen}
            onMilestoneAction={handleMarkMilestone}
            onUpdateProfile={saveProfile}
            onOpenAiChat={(prompt) => {
              if (prompt) setAiInitialPrompt(prompt);
              changeTab('ai');
            }}
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

        {activeTab === 'ai' && (
          <div className="h-full w-full">
            <CampusSocialHub
              profile={profile}
              locations={locations}
              onSelectVenue={handleSelectVenue}
              onMilestoneAction={handleMarkMilestone}
              onUpdateProfile={saveProfile}
              initialPrompt={aiInitialPrompt || undefined}
              onStartQuiz={(q) => setSharedQuiz(q)}
              onBack={() => changeTab(previousTab || 'hub')}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            onUpdateProfile={saveProfile}
            onOpenSchedule={() => handleTabChange('schedule')}
            onOpenReader={() => handleTabChange('reader')}
            onOpenAiChat={(prompt) => {
              if (prompt) setAiInitialPrompt(prompt);
              changeTab('ai');
            }}
            onSignOut={signOut}
          />
        )}
      </main>

      {/* PWA Floating Bottom Navigation Bar - Hidden in AI Mode for Full Viewport Workspace */}
      {!isAiActive && (
        <BottomNav 
          activeTab={activeTab} 
          onChangeTab={handleTabChange} 
          institution={profile?.institution}
        />
      )}

      {/* Shared Peer Quiz Runner */}
      {sharedQuiz && (
        <QuizRunner
          quiz={sharedQuiz}
          onClose={() => setSharedQuiz(null)}
          onReviewWithAi={(debriefPrompt) => {
            setSharedQuiz(null);
            setAiInitialPrompt(debriefPrompt);
            changeTab('ai');
          }}
          onAddMoreQuestions={() => {
            setSharedQuiz(null);
            setAiInitialPrompt(`Please add 10 more questions to this ${sharedQuiz.courseCode} practice quiz under the same syllabus.`);
            changeTab('ai');
          }}
        />
      )}

      {/* Guest Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Punchy Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92%] sm:w-auto px-4 py-3 rounded-2xl bg-neutral-900/95 dark:bg-[#1E1F20]/95 border border-white/10 text-white shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-[#1A73E8] animate-ping shrink-0" />
            <p className="font-medium leading-snug">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-neutral-400 hover:text-white rounded-md shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

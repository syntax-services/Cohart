'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
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
  const [isLumenOpen, setIsLumenOpen] = useState(false);
  const [lumenMode, setLumenMode] = useState<'general' | 'grill_mode'>('general');

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

  const isAiActive = isAiFullscreen && activeTab === 'reader';

  return (
    <div className="h-screen bg-[var(--bg-main)] text-[var(--text-primary)] flex font-sans transition-colors duration-200 relative overflow-hidden">
      {/* Desktop Sidebar (Spatial Navigation) */}
      <aside className="hidden md:flex flex-col w-[260px] border-r border-black/[0.06] dark:border-white/[0.08] bg-[#FAFAFA] dark:bg-[#131314] shrink-0">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] flex items-center justify-center text-white">
              <GeminiIcon name="sparkle" size={16} />
            </div>
            <span className="font-bold tracking-tight text-lg">Cohart</span>
          </div>

          <nav className="flex flex-col gap-1">
            {[
              { id: 'hub', label: 'Dashboard', icon: 'home' },
              { id: 'reader', label: 'Study Notes', icon: 'reader' },
              { id: 'schedule', label: 'Timetable', icon: 'calendar' },
              { id: 'ai', label: 'Messages', icon: 'chat' },
              ...(isOouStudent(profile?.institution) ? [{ id: 'map', label: 'Campus Map', icon: 'map' }] : []),
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id as NavTab)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-full transition-all font-medium text-sm text-left ${
                  activeTab === item.id
                    ? 'bg-black/[0.05] dark:bg-white/[0.1] text-[#0B57D0] dark:text-[#1A73E8] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <GeminiIcon name={item.icon as any} size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t border-black/[0.06] dark:border-white/[0.08]">
          <button
            onClick={() => handleTabChange('profile')}
            className="flex items-center gap-3 p-2 w-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-full transition-colors text-left"
          >
            <div className="h-9 w-9 rounded-full bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 text-[#0B57D0] dark:text-[#1A73E8] flex items-center justify-center font-bold uppercase text-xs shrink-0">
              {profile?.full_name?.charAt(0) || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate text-neutral-900 dark:text-white">
                {profile?.full_name || 'Scholar'}
              </p>
              <p className="text-[10px] text-neutral-500 font-mono truncate">
                {profile?.institution || 'Guest'}
              </p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
        {/* Top Header - Mobile Only */}
        <div className="md:hidden">
          <TopHeader
            profile={profile}
            onOpenProfile={() => handleTabChange('profile')}
            onSearch={setSearchFilter}
          />
        </div>

        {/* Main Stage */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-5 max-w-6xl mx-auto w-full pb-24 md:pb-8">
        {activeTab === 'hub' && (
          <AcademicHubView
            profile={profile}
            locations={locations}
            onSelectVenue={handleSelectVenue}
            onOpenReader={() => handleTabChange('reader')}
            onOpenSchedule={() => handleTabChange('schedule')}
            onOpenProfile={() => handleTabChange('profile')}
            onOpenAi={(prompt, mode = 'general') => {
              if (prompt) setAiInitialPrompt(prompt);
              setLumenMode(mode);
              setIsLumenOpen(true);
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
              setIsLumenOpen(true);
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
              onOpenPinnedAi={() => setIsLumenOpen(true)}
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
              setIsLumenOpen(true);
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
      </div>

      {/* Shared Peer Quiz Runner */}
      {sharedQuiz && (
        <QuizRunner
          quiz={sharedQuiz}
          onClose={() => setSharedQuiz(null)}
          onReviewWithAi={(debriefPrompt) => {
            setSharedQuiz(null);
            setAiInitialPrompt(debriefPrompt);
            setIsLumenOpen(true);
          }}
          onAddMoreQuestions={() => {
            setSharedQuiz(null);
            setAiInitialPrompt(`Please add 10 more questions to this ${sharedQuiz.courseCode} practice quiz under the same syllabus.`);
            setIsLumenOpen(true);
          }}
        />
      )}

      {/* Guest Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Global AI Sliding Pane (Lumen) */}
      <AnimatePresence>
        {isLumenOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLumenOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
            />
            {/* Slide Pane */}
            <motion.div
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 1 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full md:w-[450px] lg:w-[500px] bg-white dark:bg-[#131314] border-l border-black/[0.08] dark:border-white/[0.08] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-black/[0.08] dark:border-white/[0.08] bg-white/80 dark:bg-[#1E1F20]/80 backdrop-blur-xl shrink-0">
                <h2 className="text-sm font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
                  <div className="h-6 w-6 rounded-full bg-[#0B57D0]/10 dark:bg-[#1A73E8]/10 flex items-center justify-center text-[#0B57D0] dark:text-[#1A73E8]">
                    <GeminiIcon name="sparkle" size={14} />
                  </div>
                  Cohart Lumen
                </h2>
                <button
                  onClick={() => setIsLumenOpen(false)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
                >
                  
                </button>
              </div>
              <div className="flex-1 overflow-hidden relative">
                 <CampusAiAssistant
                  profile={profile}
                  locations={locations}
                  onSelectVenue={handleSelectVenue}
                  onExitFullscreen={() => setIsLumenOpen(false)}
                  onMilestoneAction={handleMarkMilestone}
                  onUpdateProfile={saveProfile}
                  initialMode={lumenMode}
                  initialPrompt={aiInitialPrompt || undefined}
                  onStartQuiz={(q) => setSharedQuiz(q)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Punchy Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[92%] sm:w-auto px-4 py-3 rounded-[2rem] bg-neutral-900/95 dark:bg-[#1E1F20]/95 border border-white/10 text-white shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-[#1A73E8] animate-ping shrink-0" />
            <p className="font-medium leading-snug">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-neutral-400 hover:text-white rounded-full shrink-0 cursor-pointer"
          >
            
          </button>
        </div>
      )}
    </div>
  );
}

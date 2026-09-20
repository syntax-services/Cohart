'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/Header';
import { CampusMapWrapper } from '@/components/map/CampusMapWrapper';
import { ScheduleCard } from '@/components/dashboard/ScheduleCard';
import { BionicNoteCard } from '@/components/dashboard/BionicNoteCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Location } from '@/lib/types';
import { fetchLocations } from '@/lib/supabase';
import { 
  Compass, 
  Sparkles, 
  GraduationCap, 
  Bus, 
  FileText, 
  CheckCircle2, 
  Circle, 
  ExternalLink,
  MapPin
} from 'lucide-react';

export default function DashboardPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [checklist, setChecklist] = useState([
    { id: '1', task: 'Portal Course Registration for ECO 201-208', done: true },
    { id: '2', task: 'SMS Faculty Dues & Departmental Clearance', done: false },
    { id: '3', task: 'Locate SMS Lecture Theatre 1 & Seat Allocation', done: true },
    { id: '4', task: 'Ago-Iwoye Permanent Site E-Library Pass', done: false },
  ]);

  useEffect(() => {
    async function loadLocations() {
      const data = await fetchLocations();
      setLocations(data);
    }
    loadLocations();
  }, []);

  const handleSelectVenue = (locationCode: string) => {
    const target = locations.find(l => l.code === locationCode);
    if (target) {
      setSelectedLocationId(target.id);
    }
  };

  const toggleChecklist = (id: string) => {
    setChecklist(prev => 
      prev.map(item => item.id === id ? { ...item, done: !item.done } : item)
    );
  };

  // Filter locations if search term provided
  const displayedLocations = React.useMemo(() => {
    if (!searchFilter.trim()) return locations;
    const q = searchFilter.toLowerCase();
    return locations.filter(l => 
      l.name.toLowerCase().includes(q) || 
      l.code.toLowerCase().includes(q) || 
      l.faculty.toLowerCase().includes(q) ||
      (l.department && l.department.toLowerCase().includes(q))
    );
  }, [locations, searchFilter]);

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col font-sans">
      {/* NotebookLM Style Clean Header */}
      <Header onSearch={setSearchFilter} />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
        {/* Sub-Header Greeting & Context Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono tracking-wider uppercase text-[#00F0FF]">
                Academic Workspace
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs font-mono text-slate-400">
                OOU Ago-Iwoye Permanent Site
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Economics Department Hub
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Campus navigation, lecture schedules, and accelerated bionic reading.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handleSelectVenue('SMS-LT1')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0066FF] text-black font-semibold text-xs tracking-tight shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:opacity-95 transition-transform active:scale-95"
            >
              <Compass className="h-4 w-4" />
              <span>Locate SMS Lecture Hall</span>
            </button>
          </div>
        </div>

        {/* Industrial Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 auto-rows-[minmax(180px,auto)]">
          {/* Central Hero Bento Item: Live OOU Campus Map (Spans 8 cols on desktop) */}
          <div className="lg:col-span-7 xl:col-span-8 h-[450px] lg:h-[580px]">
            <CampusMapWrapper
              locations={displayedLocations}
              selectedLocationId={selectedLocationId}
              onSelectLocation={(loc) => setSelectedLocationId(loc.id)}
            />
          </div>

          {/* Right Column Bento Items (Spans 5 cols on desktop) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5 h-[450px] lg:h-[580px]">
            {/* Top Right: Upcoming Lectures Timetable */}
            <div className="flex-1 min-h-0">
              <ScheduleCard onSelectVenue={handleSelectVenue} />
            </div>

            {/* Bottom Right: Bionic Reading Study Card */}
            <div className="flex-1 min-h-0">
              <BionicNoteCard />
            </div>
          </div>

          {/* Bottom Bento Row: 3 Modular Cards */}

          {/* Card 1: Resumption Clearance Tracker */}
          <div className="lg:col-span-4">
            <GlassCard className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00F0FF]/10 text-[#00F0FF]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Resumption Clearance</h3>
                  </div>
                  <Badge variant="cyan">
                    {checklist.filter(c => c.done).length} / {checklist.length} Complete
                  </Badge>
                </div>

                <div className="space-y-2 mt-2">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-colors cursor-pointer select-none"
                    >
                      {item.done ? (
                        <CheckCircle2 className="h-4 w-4 text-[#00F0FF] shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-600 shrink-0" />
                      )}
                      <span className={`text-xs font-sans ${item.done ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                        {item.task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Deadline: October 5th</span>
                <span className="text-[#00F0FF] hover:underline cursor-pointer">OOU Portal &rarr;</span>
              </div>
            </GlassCard>
          </div>

          {/* Card 2: Campus Shuttle & Transit Logistics */}
          <div className="lg:col-span-4">
            <GlassCard className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0066FF]/15 text-[#38bdf8]">
                      <Bus className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Campus Transit Hub</h3>
                  </div>
                  <Badge variant="azure">Active Shuttle</Badge>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex justify-between items-center text-[11px] font-mono mb-1">
                      <span className="text-white font-medium">Main Gate &rarr; SMS Complex</span>
                      <span className="text-[#00F0FF]">₦150 • 6 mins</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Departs every 5 minutes from Central Roundabout opposite Senate Building.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <div className="flex justify-between items-center text-[11px] font-mono mb-1">
                      <span className="text-white font-medium">SMS Complex &rarr; Library / ETF</span>
                      <span className="text-slate-400">3 mins walk</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Covered paved corridor directly connects eastern SMS wing to ETF lecture halls.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Service operating 7:30 AM – 6:30 PM</span>
                <span className="text-[#00F0FF] hover:underline cursor-pointer">Transit Map</span>
              </div>
            </GlassCard>
          </div>

          {/* Card 3: Departmental Orientation Key Info */}
          <div className="lg:col-span-4">
            <GlassCard className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Department Secretariat</h3>
                  </div>
                  <Badge variant="emerald">HOD Office Open</Badge>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Economics Department office is located on the 1st floor of the SMS Complex (Wing B).
                  </p>
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Faculty Officer:</span>
                      <span className="text-white">Mrs. Olutayo</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Staff Advisor (200L):</span>
                      <span className="text-white">Dr. K. Balogun</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Department Mail:</span>
                      <span className="text-[#00F0FF]">economics@oouagoiwoye.edu.ng</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Wing B, 1st Floor</span>
                <button
                  onClick={() => handleSelectVenue('SMS-SEC')}
                  className="flex items-center gap-1 text-[#00F0FF] hover:underline"
                >
                  <MapPin className="h-3 w-3" />
                  <span>Pin Secretariat</span>
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}

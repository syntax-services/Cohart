'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import {
  OGUN_INSTITUTIONS,
  OgunInstitution,
  OgunCampus,
  OgunDepartment,
} from '@/lib/ogunInstitutionsCatalog';

export interface OgunAcademicSelection {
  institution: string; // e.g. 'Olabisi Onabanjo University (OOU)'
  institutionCode: string; // e.g. 'OOU'
  campusId: string;
  campusName: string;
  faculty: string;
  department: string;
  level: string;
}

interface OgunAcademicSelectorProps {
  initialInstitution?: string;
  initialDepartment?: string;
  initialFaculty?: string;
  initialLevel?: string;
  onApply: (selection: OgunAcademicSelection) => void;
  onCancel?: () => void;
}

export const OgunAcademicSelector: React.FC<OgunAcademicSelectorProps> = ({
  initialInstitution = 'Olabisi Onabanjo University',
  initialDepartment = 'Economics',
  initialFaculty = 'Faculty of Social Sciences',
  initialLevel = '100L',
  onApply,
  onCancel,
}) => {
  // 1. Institution selection state
  const [selectedInstCode, setSelectedInstCode] = useState<string>(() => {
    const found = OGUN_INSTITUTIONS.find(
      (inst) =>
        inst.name.toLowerCase().includes((initialInstitution || '').toLowerCase()) ||
        inst.shortName.toLowerCase() === (initialInstitution || '').toLowerCase() ||
        inst.id.toLowerCase() === (initialInstitution || '').toLowerCase()
    );
    return found ? found.id : 'OOU';
  });

  const [institutionSearch, setInstitutionSearch] = useState('');
  const [isInstDropdownOpen, setIsInstDropdownOpen] = useState(false);

  // Active Institution Object
  const currentInstitution: OgunInstitution = useMemo(() => {
    return (
      OGUN_INSTITUTIONS.find((inst) => inst.id === selectedInstCode) ||
      OGUN_INSTITUTIONS[0]
    );
  }, [selectedInstCode]);

  // 2. Campus selection state
  const [selectedCampusId, setSelectedCampusId] = useState<string>(() => {
    return currentInstitution.campuses[0]?.id || '';
  });

  // When institution changes, reset campus if not matching
  useEffect(() => {
    if (!currentInstitution.campuses.some((c) => c.id === selectedCampusId)) {
      setSelectedCampusId(currentInstitution.campuses[0]?.id || '');
    }
  }, [currentInstitution, selectedCampusId]);

  const currentCampus: OgunCampus | undefined = useMemo(() => {
    return (
      currentInstitution.campuses.find((c) => c.id === selectedCampusId) ||
      currentInstitution.campuses[0]
    );
  }, [currentInstitution, selectedCampusId]);

  // 3. Faculty selection state
  const availableFaculties = useMemo(() => {
    if (currentCampus && currentCampus.faculties.length > 0) {
      return currentCampus.faculties;
    }
    const facultySet = new Set<string>();
    currentInstitution.departments.forEach((d) => facultySet.add(d.faculty));
    return Array.from(facultySet);
  }, [currentCampus, currentInstitution]);

  const [selectedFaculty, setSelectedFaculty] = useState<string>(() => {
    return initialFaculty && availableFaculties.includes(initialFaculty)
      ? initialFaculty
      : availableFaculties[0] || 'General Studies Unit';
  });

  useEffect(() => {
    if (!availableFaculties.includes(selectedFaculty)) {
      setSelectedFaculty(availableFaculties[0] || '');
    }
  }, [availableFaculties, selectedFaculty]);

  // 4. Department selection state
  const availableDepartments = useMemo(() => {
    const list = currentInstitution.departments.filter(
      (d) => !selectedFaculty || d.faculty === selectedFaculty
    );
    return list.length > 0 ? list : currentInstitution.departments;
  }, [currentInstitution, selectedFaculty]);

  const [selectedDeptName, setSelectedDeptName] = useState<string>(() => {
    const match = availableDepartments.find(
      (d) => d.name.toLowerCase() === (initialDepartment || '').toLowerCase()
    );
    return match ? match.name : availableDepartments[0]?.name || 'Economics';
  });

  const [deptSearch, setDeptSearch] = useState('');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

  useEffect(() => {
    if (!availableDepartments.some((d) => d.name === selectedDeptName)) {
      setSelectedDeptName(availableDepartments[0]?.name || '');
    }
  }, [availableDepartments, selectedDeptName]);

  const currentDepartment: OgunDepartment | undefined = useMemo(() => {
    return currentInstitution.departments.find(
      (d) => d.name === selectedDeptName
    );
  }, [currentInstitution, selectedDeptName]);

  // 5. Level selection state
  const levelOptions = useMemo(() => {
    return currentDepartment?.levelRange || ['100L', '200L', '300L', '400L'];
  }, [currentDepartment]);

  const [selectedLevel, setSelectedLevel] = useState<string>(() => {
    return initialLevel || '100L';
  });

  useEffect(() => {
    if (!levelOptions.includes(selectedLevel)) {
      setSelectedLevel(levelOptions[0] || '100L');
    }
  }, [levelOptions, selectedLevel]);

  // Filtered lists for searches
  const filteredInstitutions = useMemo(() => {
    const q = institutionSearch.toLowerCase().trim();
    if (!q) return OGUN_INSTITUTIONS;
    return OGUN_INSTITUTIONS.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.shortName.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.campuses.some((c) => c.city.toLowerCase().includes(q))
    );
  }, [institutionSearch]);

  const filteredDepartments = useMemo(() => {
    const q = deptSearch.toLowerCase().trim();
    if (!q) return availableDepartments;
    return availableDepartments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.faculty.toLowerCase().includes(q) ||
        d.degree.toLowerCase().includes(q)
    );
  }, [availableDepartments, deptSearch]);

  const handleConfirm = () => {
    onApply({
      institution: `${currentInstitution.name} (${currentInstitution.shortName})`,
      institutionCode: currentInstitution.id,
      campusId: currentCampus?.id || '',
      campusName: currentCampus?.name || '',
      faculty: selectedFaculty,
      department: selectedDeptName,
      level: selectedLevel,
    });
  };

  const instRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (instRef.current && !instRef.current.contains(e.target as Node)) {
        setIsInstDropdownOpen(false);
      }
      if (deptRef.current && !deptRef.current.contains(e.target as Node)) {
        setIsDeptDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-4 text-left font-sans">
      {/* Summit Badge Notice */}
      <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 border border-[#0B57D0]/20 text-xs">
        <GeminiIcon name="sparkle" size={14} className="text-[#0B57D0] dark:text-[#8AB4F8] shrink-0" />
        <p className="text-[11px] text-neutral-800 dark:text-neutral-200 leading-snug">
          <strong className="text-[#0B57D0] dark:text-[#8AB4F8]">Ogun Tech Summit (Vs):</strong> Filtered strictly to accredited Ogun State tertiary institutions. Selecting your department instantly loads your semester timetable, course modules, and syllabus.
        </p>
      </div>

      {/* 1. Higher Institution Selector with Search */}
      <div className="relative" ref={instRef}>
        <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
          Ogun State Institution
        </label>
        <button
          type="button"
          onClick={() => setIsInstDropdownOpen(!isInstDropdownOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white cursor-pointer hover:border-[#0B57D0]"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-[#0B57D0] dark:text-[#8AB4F8] font-mono shrink-0">
              {currentInstitution.shortName}
            </span>
            <span className="truncate">{currentInstitution.name}</span>
          </div>
          <GeminiIcon name="chevron-down" size={12} className="text-neutral-400 shrink-0 ml-2" />
        </button>

        {isInstDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl bg-white dark:bg-[#16171A] border border-black/[0.08] dark:border-white/[0.1] shadow-2xl p-2 max-h-60 overflow-y-auto no-scrollbar">
            <div className="sticky top-0 bg-white dark:bg-[#16171A] pb-2 z-10">
              <input
                type="text"
                value={institutionSearch}
                onChange={(e) => setInstitutionSearch(e.target.value)}
                placeholder="Search Ogun institution (e.g. OOU, FUNAAB, TASUED)..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.06] text-xs text-neutral-900 dark:text-white focus:outline-none"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              {filteredInstitutions.map((inst) => (
                <button
                  key={inst.id}
                  type="button"
                  onClick={() => {
                    setSelectedInstCode(inst.id);
                    setIsInstDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    selectedInstCode === inst.id
                      ? 'bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 text-[#0B57D0] dark:text-[#8AB4F8] font-semibold'
                      : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-mono font-bold mr-1.5 text-[11px]">{inst.shortName}</span>
                    <span className="text-[11.5px]">{inst.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 shrink-0 ml-2">{inst.category}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Campus Selector (if institution has multiple campuses) */}
      {currentInstitution.campuses.length > 1 && (
        <div>
          <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
            Campus Location ({currentInstitution.campuses.length} Available)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {currentInstitution.campuses.map((campus) => (
              <button
                key={campus.id}
                type="button"
                onClick={() => setSelectedCampusId(campus.id)}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all cursor-pointer text-left ${
                  selectedCampusId === campus.id
                    ? 'border-[#0B57D0] dark:border-[#1A73E8] bg-[#0B57D0]/[0.05] dark:bg-[#1A73E8]/[0.08] text-[#0B57D0] dark:text-[#8AB4F8] font-semibold'
                    : 'border-black/[0.06] dark:border-white/[0.06] text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                }`}
              >
                <div className="truncate pr-1">
                  <span className="block truncate text-[11.5px]">{campus.name}</span>
                  <span className="text-[9.5px] font-mono text-neutral-400">{campus.city}</span>
                </div>
                {selectedCampusId === campus.id && (
                  <GeminiIcon name="check" size={12} className="text-[#0B57D0] dark:text-[#1A73E8] shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Faculty / College Dropdown */}
      <div>
        <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
          Faculty / College
        </label>
        <select
          value={selectedFaculty}
          onChange={(e) => setSelectedFaculty(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] cursor-pointer"
        >
          {availableFaculties.map((f) => (
            <option key={f} value={f} className="dark:bg-[#1E1F20]">
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Department Selector with Search */}
      <div className="relative" ref={deptRef}>
        <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
          Department / Course of Study
        </label>
        <button
          type="button"
          onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-xs text-neutral-900 dark:text-white cursor-pointer hover:border-[#0B57D0]"
        >
          <span className="truncate">{selectedDeptName || 'Select Department'}</span>
          <GeminiIcon name="chevron-down" size={12} className="text-neutral-400 shrink-0 ml-2" />
        </button>

        {isDeptDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl bg-white dark:bg-[#16171A] border border-black/[0.08] dark:border-white/[0.1] shadow-2xl p-2 max-h-52 overflow-y-auto no-scrollbar">
            <div className="sticky top-0 bg-white dark:bg-[#16171A] pb-2 z-10">
              <input
                type="text"
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                placeholder="Search department (e.g. Economics, Law, Computer Science)..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.06] text-xs text-neutral-900 dark:text-white focus:outline-none"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              {filteredDepartments.map((dept) => (
                <button
                  key={dept.name}
                  type="button"
                  onClick={() => {
                    setSelectedDeptName(dept.name);
                    setSelectedFaculty(dept.faculty);
                    setIsDeptDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    selectedDeptName === dept.name
                      ? 'bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 text-[#0B57D0] dark:text-[#8AB4F8] font-semibold'
                      : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.05] text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <div>
                    <span className="block text-[11.5px]">{dept.name}</span>
                    <span className="text-[9.5px] font-mono text-neutral-400">{dept.degree}</span>
                  </div>
                  {selectedDeptName === dept.name && (
                    <GeminiIcon name="check" size={12} className="text-[#0B57D0] dark:text-[#1A73E8] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Level Selector */}
      <div>
        <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
          Academic Level
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          {levelOptions.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                selectedLevel === lvl
                  ? 'bg-[#0B57D0] dark:bg-[#1A73E8] text-white font-bold shadow-xs'
                  : 'bg-black/[0.03] dark:bg-white/[0.05] text-neutral-600 dark:text-neutral-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          <GeminiIcon name="check" size={13} />
          <span>Sync Department & Timetable</span>
        </button>
      </div>
    </div>
  );
};

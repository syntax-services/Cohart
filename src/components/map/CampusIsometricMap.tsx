'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Location, StudentProfile } from '@/lib/types';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { useTheme } from '@/components/ThemeProvider';
import { isOouStudent } from '@/lib/campusVerification';

interface CampusIsometricMapProps {
  locations: Location[];
  profile?: StudentProfile;
  selectedLocationId?: string | null;
  onSelectLocation?: (location: Location) => void;
  className?: string;
}

interface IsometricBuilding {
  id: string;
  name: string;
  code: string;
  category: 'lecture_hall' | 'faculty' | 'amenity' | 'admin' | 'sports' | 'health';
  gridX: number; // relative campus grid -100 to 100
  gridY: number; // relative campus grid -100 to 100
  width: number;
  length: number;
  height: number;
  roofColorDark: string;
  roofColorLight: string;
  description: string;
  freshersDirections: string;
  faculties: string[];
}

// Calibrated 3D Isometric Buildings for OOU Permanent Site (Ago-Iwoye)
const OOU_ISOMETRIC_BUILDINGS: IsometricBuilding[] = [
  {
    id: 'loc-gate',
    name: 'Main Gate & Security Post',
    code: 'MAIN-GATE',
    category: 'admin',
    gridX: 0,
    gridY: -90,
    width: 24,
    length: 14,
    height: 18,
    roofColorDark: '#2E3547',
    roofColorLight: '#CBD5E1',
    description: 'Primary vehicular and pedestrian entryway into Ago-Iwoye Permanent Site. Commercial bikes drop passengers here.',
    freshersDirections: 'Campus entrance. Note: It is far (1.5 - 2km) to lecture halls. Board a campus shuttle bus to the School Park. Commercial okadas are banned inside.',
    faculties: ['All Students & Visitors'],
  },
  {
    id: 'loc-school-park',
    name: 'OOU School Park (PS Bus & Maruwa Terminal)',
    code: 'SCHOOL-PARK',
    category: 'amenity',
    gridX: -12,
    gridY: -68,
    width: 32,
    length: 22,
    height: 14,
    roofColorDark: '#B45309',
    roofColorLight: '#FDE68A',
    description: 'Central campus transit terminal where all commuter buses drop students. Board Maruwa here to your faculty. Commercial bikes are strictly prohibited inside campus.',
    freshersDirections: 'Primary drop-off point for all buses. Take a Maruwa to SMS, Sciences, Education, or Motion Ground/LLT3. Commercial okadas are banned on campus.',
    faculties: ['All Campus Commuters', 'Maruwa / Shuttle Terminal'],
  },
  {
    id: 'loc-senate',
    name: 'Senate & Administrative Complex',
    code: 'SENATE',
    category: 'admin',
    gridX: 5,
    gridY: -55,
    width: 28,
    length: 24,
    height: 38,
    roofColorDark: '#1E293B',
    roofColorLight: '#94A3B8',
    description: 'Central university registry, Vice-Chancellor\'s block, and Senate roundabout.',
    freshersDirections: 'Walk straight 3 minutes from Main Gate. Landmark: Large central circular roundabout and flagpole.',
    faculties: ['University Administration'],
  },
  {
    id: 'loc-bank',
    name: 'Access Bank ATM Quad',
    code: 'BANK-QUAD',
    category: 'amenity',
    gridX: -18,
    gridY: -40,
    width: 18,
    length: 16,
    height: 16,
    roofColorDark: '#1E3A8A',
    roofColorLight: '#BFDBFE',
    description: '24/7 ATM gallery, commercial bank branch, and student finance point.',
    freshersDirections: 'Walk past the Senate roundabout along the central walkway. Access Bank is on your left.',
    faculties: ['Campus Banking'],
  },
  {
    id: 'loc-ict',
    name: 'ICT Centre (CBT Exam Arena)',
    code: 'ICT-CTR',
    category: 'lecture_hall',
    gridX: 28,
    gridY: -45,
    width: 22,
    length: 20,
    height: 18,
    roofColorDark: '#1E293B',
    roofColorLight: '#CBD5E1',
    description: 'High-speed computer examination centre where university CBT tests are conducted.',
    freshersDirections: 'From Senate roundabout, branch east into the computing quad.',
    faculties: ['All CBT Exams'],
  },
  {
    id: 'loc-sam-ewang',
    name: 'Sam Ewang Complex & Footbridge',
    code: 'SAM-EWANG',
    category: 'faculty',
    gridX: -14,
    gridY: -15,
    width: 26,
    length: 20,
    height: 22,
    roofColorDark: '#334155',
    roofColorLight: '#E2E8F0',
    description: 'Academic block directly facing Access Bank, featuring the covered footbridge into LLT.',
    freshersDirections: 'Directly opposite Access Bank. Cross the covered concrete footbridge into the LLT quad.',
    faculties: ['Faculty of Arts', 'Social Sciences'],
  },
  {
    id: 'loc-llt1',
    name: 'Faculty of Art (LLT-I)',
    code: 'LLT-1',
    category: 'lecture_hall',
    gridX: -36,
    gridY: -10,
    width: 32,
    length: 24,
    height: 26,
    roofColorDark: '#1E3A8A',
    roofColorLight: '#93C5FD',
    description: 'Arts Lecture Theatre 1. Major tiered auditorium for general studies and faculty lectures.',
    freshersDirections: 'From Access Bank, cross the covered footbridge into the LLT compound. LLT-1 is the large hall right in front.',
    faculties: ['Arts & Humanities', 'Economics', 'General Studies (GNS)'],
  },
  {
    id: 'loc-llt2',
    name: 'Law Lecture Theatre II (LLT 2)',
    code: 'LLT-2',
    category: 'lecture_hall',
    gridX: -40,
    gridY: 10,
    width: 28,
    length: 22,
    height: 24,
    roofColorDark: '#1E293B',
    roofColorLight: '#94A3B8',
    description: 'Law Lecture Theatre 2, sister auditorium adjacent to LLT 1.',
    freshersDirections: 'Beside LLT-1 heading towards Faculty of Education blocks.',
    faculties: ['Faculty of Law', 'Faculty of Education'],
  },
  {
    id: 'loc-etf',
    name: 'ETF Complex (Hall A & Labs)',
    code: 'ETF-HALL',
    category: 'lecture_hall',
    gridX: 20,
    gridY: -5,
    width: 26,
    length: 22,
    height: 20,
    roofColorDark: '#0F766E',
    roofColorLight: '#99F6E4',
    description: 'Education Trust Fund academic building with lecture hall and science labs.',
    freshersDirections: 'From Senate roundabout, follow the eastern paved walkway past SMS complex.',
    faculties: ['Science', 'Administration'],
  },
  {
    id: 'loc-sms-lt1',
    name: 'SMS Lecture Theatre (SLR 1)',
    code: 'SMS-LT1',
    category: 'lecture_hall',
    gridX: 18,
    gridY: 20,
    width: 30,
    length: 24,
    height: 24,
    roofColorDark: '#1E3A8A',
    roofColorLight: '#93C5FD',
    description: 'Faculty of Administration and Management Sciences main complex.',
    freshersDirections: 'Along the eastern walkway south of ETF complex. Enter the ground-floor eastern wing.',
    faculties: ['Economics', 'Accounting', 'Business Admin', 'Mass Comm'],
  },
  {
    id: 'loc-ogd',
    name: 'Otunba Gbenga Daniel (OGD) Hall',
    code: 'OGD-HALL',
    category: 'lecture_hall',
    gridX: -10,
    gridY: 25,
    width: 34,
    length: 28,
    height: 30,
    roofColorDark: '#312E81',
    roofColorLight: '#C7D2FE',
    description: 'Large multi-purpose event, matriculation, and examination auditorium.',
    freshersDirections: 'South of LLT complex along the central spine before Motion Ground.',
    faculties: ['Central University Events', 'Large Exams'],
  },
  {
    id: 'loc-ican',
    name: 'ICAN Professional Building',
    code: 'ICAN-BLDG',
    category: 'lecture_hall',
    gridX: -18,
    gridY: 55,
    width: 22,
    length: 18,
    height: 20,
    roofColorDark: '#1E293B',
    roofColorLight: '#CBD5E1',
    description: 'Professional accounting and management learning centre.',
    freshersDirections: 'At Motion Ground, located west of LLT 3.',
    faculties: ['Accounting & Finance'],
  },
  {
    id: 'loc-llt3',
    name: 'LLT 3 (Motion Ground Auditorium)',
    code: 'LLT-3',
    category: 'lecture_hall',
    gridX: -5,
    gridY: 65,
    width: 34,
    length: 26,
    height: 28,
    roofColorDark: '#1E3A8A',
    roofColorLight: '#93C5FD',
    description: 'Major southern lecture theatre directly opposite New Motion commercial quads.',
    freshersDirections: 'Follow main campus road straight down to Motion Ground. LLT-3 is directly facing Saburi Market.',
    faculties: ['Law', 'General Studies', 'Social Sciences'],
  },
  {
    id: 'loc-new-motion',
    name: 'New Motion & Saburi Market',
    code: 'NEW-MOTION',
    category: 'amenity',
    gridX: 20,
    gridY: 65,
    width: 28,
    length: 22,
    height: 14,
    roofColorDark: '#831843',
    roofColorLight: '#FBCFE8',
    description: 'Vibrant student hub featuring food stalls, stationery, printing, and shuttle stops.',
    freshersDirections: 'At Motion Ground directly across from LLT 3. Great for photocopying and quick snacks.',
    faculties: ['Student Hub & Market'],
  },
  {
    id: 'loc-health',
    name: 'University Health Centre & Clinic',
    code: 'HEALTH-CTR',
    category: 'health',
    gridX: 22,
    gridY: 88,
    width: 22,
    length: 18,
    height: 16,
    roofColorDark: '#991B1B',
    roofColorLight: '#FECACA',
    description: 'Campus clinic, medical consultation rooms, and 24/7 emergency post.',
    freshersDirections: 'South of Motion Ground past Saburi market along the clinic road.',
    faculties: ['Medical Services'],
  },
  {
    id: 'loc-sports',
    name: 'OOU Sports Centre & Stadium',
    code: 'SPORT-CTR',
    category: 'sports',
    gridX: -45,
    gridY: -65,
    width: 44,
    length: 32,
    height: 12,
    roofColorDark: '#065F46',
    roofColorLight: '#A7F3D0',
    description: 'Athletics stadium, running track, football pitch, and basketball court.',
    freshersDirections: 'North-western perimeter accessible via the stadium access road from Main Gate.',
    faculties: ['Athletics & SUG Events'],
  },
];

export const CampusIsometricMap: React.FC<CampusIsometricMapProps> = ({
  locations,
  profile,
  selectedLocationId,
  onSelectLocation,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const userInstitution = profile?.institution || 'OOU';
  const isOou = isOouStudent(userInstitution);

  // Pan and Zoom Camera State
  const [camera, setCamera] = useState({
    x: 0,
    y: 20,
    zoom: 1.1,
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, camX: 0, camY: 0 });

  const [selectedBuilding, setSelectedBuilding] = useState<IsometricBuilding | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<IsometricBuilding | null>(null);
  const [showWalkRouteFromGate, setShowWalkRouteFromGate] = useState(false);
  const [animationPulse, setAnimationPulse] = useState(0);

  // Sync with external selectedLocationId
  useEffect(() => {
    if (selectedLocationId) {
      const b = OOU_ISOMETRIC_BUILDINGS.find(
        (item) => item.id === selectedLocationId || item.code === selectedLocationId
      );
      if (b) {
        setSelectedBuilding(b);
        setShowWalkRouteFromGate(true);
        // Pan camera towards building smoothly
        setCamera((prev) => ({
          ...prev,
          x: -b.gridX * 3.5,
          y: -b.gridY * 2.5 + 40,
          zoom: 1.3,
        }));
      }
    }
  }, [selectedLocationId]);

  // Pulse loop for animated walkways
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      setAnimationPulse((p) => (p + 0.04) % 1);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Isometric 2D projection transformation
  // 30 degree isometric angle: cos(30 deg) = 0.866, sin(30 deg) = 0.5
  const project = useCallback(
    (x: number, y: number, z: number = 0, originX: number, originY: number, zoom: number) => {
      const isoX = (x - y) * 0.866 * zoom + originX;
      const isoY = (x + y) * 0.5 * zoom - z * zoom + originY;
      return { x: isoX, y: isoY };
    },
    []
  );

  // Render Canvas Scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize for high-DPI crispness
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const originX = width / 2 + camera.x;
    const originY = height / 3 + camera.y;
    const zoom = camera.zoom * 3.2;

    // Clear background
    ctx.fillStyle = isDark ? '#0A0D14' : '#F8FAFC';
    ctx.fillRect(0, 0, width, height);

    // 1. Draw subtle isometric terrain grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)';

    for (let gx = -110; gx <= 110; gx += 20) {
      const p1 = project(gx, -110, 0, originX, originY, zoom);
      const p2 = project(gx, 110, 0, originX, originY, zoom);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    for (let gy = -110; gy <= 110; gy += 20) {
      const p1 = project(-110, gy, 0, originX, originY, zoom);
      const p2 = project(110, gy, 0, originX, originY, zoom);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // 2. Draw Tarred Campus Roads & Walkways
    // Main Spine Avenue from Gate (0, -90) to Motion Ground (0, 70)
    const roadPoints = [
      { x: 0, y: -95 },
      { x: 0, y: -55 }, // Senate Roundabout
      { x: -5, y: -20 },
      { x: -5, y: 30 },
      { x: 0, y: 70 }, // Motion Ground
      { x: 10, y: 92 }, // Health clinic branch
    ];

    ctx.lineWidth = 10 * camera.zoom;
    ctx.strokeStyle = isDark ? '#171B24' : '#E2E8F0';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    roadPoints.forEach((pt, i) => {
      const pos = project(pt.x, pt.y, 0, originX, originY, zoom);
      if (i === 0) ctx.moveTo(pos.x, pos.y);
      else ctx.lineTo(pos.x, pos.y);
    });
    ctx.stroke();

    // Road dashed centerline
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.3)';
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    roadPoints.forEach((pt, i) => {
      const pos = project(pt.x, pt.y, 0, originX, originY, zoom);
      if (i === 0) ctx.moveTo(pos.x, pos.y);
      else ctx.lineTo(pos.x, pos.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Branch to LLT 1 & 2 Covered Footbridge
    const footbridgePoints = [
      { x: -5, y: -20 },
      { x: -18, y: -18 },
      { x: -36, y: -10 },
    ];
    ctx.lineWidth = 6 * camera.zoom;
    ctx.strokeStyle = isDark ? '#1F2430' : '#CBD5E1';
    ctx.beginPath();
    footbridgePoints.forEach((pt, i) => {
      const pos = project(pt.x, pt.y, 0, originX, originY, zoom);
      if (i === 0) ctx.moveTo(pos.x, pos.y);
      else ctx.lineTo(pos.x, pos.y);
    });
    ctx.stroke();

    // Branch to SMS Complex
    const smsPathPoints = [
      { x: 0, y: -55 },
      { x: 18, y: -20 },
      { x: 18, y: 20 },
    ];
    ctx.lineWidth = 6 * camera.zoom;
    ctx.strokeStyle = isDark ? '#1F2430' : '#CBD5E1';
    ctx.beginPath();
    smsPathPoints.forEach((pt, i) => {
      const pos = project(pt.x, pt.y, 0, originX, originY, zoom);
      if (i === 0) ctx.moveTo(pos.x, pos.y);
      else ctx.lineTo(pos.x, pos.y);
    });
    ctx.stroke();

    // Animated Freshers Walk Route Pulse
    if (showWalkRouteFromGate && selectedBuilding && selectedBuilding.id !== 'loc-gate') {
      const route = [
        { x: 0, y: -90 },
        { x: 0, y: -55 },
        { x: (selectedBuilding.gridX > 0 ? 10 : -10), y: (selectedBuilding.gridY < 0 ? -30 : 10) },
        { x: selectedBuilding.gridX, y: selectedBuilding.gridY },
      ];

      ctx.lineWidth = 4 * camera.zoom;
      ctx.strokeStyle = '#1A73E8';
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -animationPulse * 28;
      ctx.beginPath();
      route.forEach((pt, i) => {
        const pos = project(pt.x, pt.y, 2, originX, originY, zoom);
        if (i === 0) ctx.moveTo(pos.x, pos.y);
        else ctx.lineTo(pos.x, pos.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Sort buildings from back to front (isometric painter\'s algorithm)
    const sortedBuildings = [...OOU_ISOMETRIC_BUILDINGS].sort((a, b) => {
      return (a.gridX + a.gridY) - (b.gridX + b.gridY);
    });

    // 3. Draw Isometric Buildings
    sortedBuildings.forEach((b) => {
      const isSelected = selectedBuilding?.id === b.id;
      const isHovered = hoveredBuilding?.id === b.id;

      const halfW = b.width / 2;
      const halfL = b.length / 2;
      const h = b.height;

      // Base footprint points
      const pFront = project(b.gridX + halfW, b.gridY + halfL, 0, originX, originY, zoom);
      const pRight = project(b.gridX + halfW, b.gridY - halfL, 0, originX, originY, zoom);
      const pBack = project(b.gridX - halfW, b.gridY - halfL, 0, originX, originY, zoom);
      const pLeft = project(b.gridX - halfW, b.gridY + halfL, 0, originX, originY, zoom);

      // Elevated roof points
      const rFront = project(b.gridX + halfW, b.gridY + halfL, h, originX, originY, zoom);
      const rRight = project(b.gridX + halfW, b.gridY - halfL, h, originX, originY, zoom);
      const rBack = project(b.gridX - halfW, b.gridY - halfL, h, originX, originY, zoom);
      const rLeft = project(b.gridX - halfW, b.gridY + halfL, h, originX, originY, zoom);

      // Draw Left Shaded Wall
      ctx.fillStyle = isDark
        ? (isSelected ? '#1E293B' : '#141822')
        : (isSelected ? '#93C5FD' : '#E2E8F0');
      ctx.beginPath();
      ctx.moveTo(pLeft.x, pLeft.y);
      ctx.lineTo(rLeft.x, rLeft.y);
      ctx.lineTo(rFront.x, rFront.y);
      ctx.lineTo(pFront.x, pFront.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = isDark ? '#232938' : '#CBD5E1';
      ctx.stroke();

      // Draw Right Shaded Wall
      ctx.fillStyle = isDark
        ? (isSelected ? '#0F172A' : '#0F121A')
        : (isSelected ? '#60A5FA' : '#CBD5E1');
      ctx.beginPath();
      ctx.moveTo(pFront.x, pFront.y);
      ctx.lineTo(rFront.x, rFront.y);
      ctx.lineTo(rRight.x, rRight.y);
      ctx.lineTo(pRight.x, pRight.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw Top Roof Face
      ctx.fillStyle = isSelected
        ? '#1A73E8'
        : isDark
        ? (isHovered ? '#2D3748' : b.roofColorDark)
        : (isHovered ? '#E2E8F0' : b.roofColorLight);
      ctx.beginPath();
      ctx.moveTo(rFront.x, rFront.y);
      ctx.lineTo(rRight.x, rRight.y);
      ctx.lineTo(rBack.x, rBack.y);
      ctx.lineTo(rLeft.x, rLeft.y);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeStyle = isSelected ? '#FFFFFF' : isDark ? '#333D52' : '#94A3B8';
      ctx.stroke();

      // Floating Pin Badge over building
      const centerRoof = project(b.gridX, b.gridY, h + 10, originX, originY, zoom);

      // Building Code Pill
      ctx.font = `${Math.max(10, Math.min(13, 10 * camera.zoom))}px ui-monospace, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const tagText = b.code;
      const textWidth = ctx.measureText(tagText).width;
      const padX = 7;
      const padY = 4;

      // Tag background
      ctx.fillStyle = isSelected
        ? '#1A73E8'
        : isDark
        ? 'rgba(24, 27, 36, 0.92)'
        : 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = isSelected
        ? '#FFFFFF'
        : isDark
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1;

      const pillX = centerRoof.x - textWidth / 2 - padX;
      const pillY = centerRoof.y - 8 - padY;
      const pillW = textWidth + padX * 2;
      const pillH = 16 + padY;

      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 6);
      ctx.fill();
      ctx.stroke();

      // Tag text
      ctx.fillStyle = isSelected ? '#FFFFFF' : isDark ? '#F1F5F9' : '#0F172A';
      ctx.fillText(tagText, centerRoof.x, centerRoof.y);
    });
  }, [camera, selectedBuilding, hoveredBuilding, showWalkRouteFromGate, animationPulse, isDark, project]);

  // Handle Touch/Mouse Dragging for Pan
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      camX: camera.x,
      camY: camera.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) {
      // Hover detection
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const originX = rect.width / 2 + camera.x;
      const originY = rect.height / 3 + camera.y;
      const zoom = camera.zoom * 3.2;

      let found: IsometricBuilding | null = null;
      for (const b of OOU_ISOMETRIC_BUILDINGS) {
        const center = project(b.gridX, b.gridY, b.height / 2, originX, originY, zoom);
        const dist = Math.hypot(mouseX - center.x, mouseY - center.y);
        if (dist < 28 * camera.zoom) {
          found = b;
          break;
        }
      }
      setHoveredBuilding(found);
      return;
    }

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setCamera((prev) => ({
      ...prev,
      x: dragStartRef.current.camX + deltaX,
      y: dragStartRef.current.camY + deltaY,
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      const moved = Math.hypot(e.clientX - dragStartRef.current.x, e.clientY - dragStartRef.current.y);
      setIsDragging(false);

      // If it was a click/tap without drag, select building
      if (moved < 5) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const originX = rect.width / 2 + camera.x;
        const originY = rect.height / 3 + camera.y;
        const zoom = camera.zoom * 3.2;

        let selected: IsometricBuilding | null = null;
        for (const b of OOU_ISOMETRIC_BUILDINGS) {
          const center = project(b.gridX, b.gridY, b.height / 2, originX, originY, zoom);
          const dist = Math.hypot(mouseX - center.x, mouseY - center.y);
          if (dist < 32 * camera.zoom) {
            selected = b;
            break;
          }
        }

        if (selected) {
          setSelectedBuilding(selected);
          setShowWalkRouteFromGate(true);
          const locMatch = locations.find((l) => l.code === selected?.code || l.id === selected?.id);
          if (locMatch && onSelectLocation) {
            onSelectLocation(locMatch);
          }
        }
      }
    }
  };

  const handleZoomIn = () => setCamera((c) => ({ ...c, zoom: Math.min(2.5, c.zoom + 0.2) }));
  const handleZoomOut = () => setCamera((c) => ({ ...c, zoom: Math.max(0.6, c.zoom - 0.2) }));
  const handleReset = () => setCamera({ x: 0, y: 20, zoom: 1.1 });

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden rounded-2xl select-none bg-neutral-950 text-white ${className}`}
    >
      {/* Non-OOU Campus Fallback Notice Card */}
      {!isOou && (
        <div className="absolute top-4 left-4 right-4 z-30 p-4 rounded-2xl bg-white/90 dark:bg-[#151821]/90 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] shadow-lg flex items-center justify-between gap-3 flex-wrap">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#0B57D0] dark:text-[#1A73E8]">
              {userInstitution} Live Navigation
            </span>
            <p className="text-xs text-neutral-800 dark:text-neutral-200 font-medium">
              3D schematic currently active for Ago-Iwoye PS. Use Google Maps for native turn-by-turn directions at {userInstitution}.
            </p>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(userInstitution + ' university campus')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <GeminiIcon name="compass" size={13} />
            <span>Open in Google Maps</span>
          </a>
        </div>
      )}

      {/* Main 3D Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="h-full w-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top Floating Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="h-9 w-9 rounded-full bg-white/90 dark:bg-[#181B24]/90 border border-black/[0.08] dark:border-white/[0.1] backdrop-blur-md shadow-md flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:border-[#1A73E8] transition-all cursor-pointer"
        >
          <span className="text-lg font-bold leading-none">+</span>
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="h-9 w-9 rounded-full bg-white/90 dark:bg-[#181B24]/90 border border-black/[0.08] dark:border-white/[0.1] backdrop-blur-md shadow-md flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:border-[#1A73E8] transition-all cursor-pointer"
        >
          <span className="text-lg font-bold leading-none">-</span>
        </button>
        <button
          type="button"
          onClick={handleReset}
          title="Center Campus"
          className="h-9 w-9 rounded-full bg-white/90 dark:bg-[#181B24]/90 border border-black/[0.08] dark:border-white/[0.1] backdrop-blur-md shadow-md flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:border-[#1A73E8] transition-all cursor-pointer"
        >
          <GeminiIcon name="compass" size={15} />
        </button>
      </div>

      {/* Campus Mode Indicator */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#181B24]/90 border border-black/[0.08] dark:border-white/[0.1] backdrop-blur-md shadow-sm">
        <div className="h-2 w-2 rounded-full bg-[#1A73E8] animate-pulse" />
        <span className="text-[11px] font-mono font-bold text-neutral-800 dark:text-neutral-200">
          OOU 3D Isometric PS
        </span>
      </div>

      {/* Building Inspector Bottom Sheet Card */}
      {selectedBuilding && (
        <div className="absolute bottom-3 left-3 right-3 z-30 p-4 rounded-2xl bg-white/95 dark:bg-[#141721]/95 border border-black/[0.1] dark:border-white/[0.1] backdrop-blur-2xl shadow-2xl text-neutral-900 dark:text-white space-y-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1A73E8]/15 text-[#1A73E8] border border-[#1A73E8]/30">
                  {selectedBuilding.code}
                </span>
                <span className="text-[10px] font-mono text-neutral-500 uppercase">
                  {selectedBuilding.category.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-base font-bold tracking-tight">
                {selectedBuilding.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setSelectedBuilding(null)}
              className="h-7 w-7 rounded-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.1] flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
            >
              
            </button>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {selectedBuilding.description}
          </p>

          {/* Freshers Walking Guide from Main Gate */}
          <div className="p-2.5 rounded-xl bg-[#1A73E8]/10 border border-[#1A73E8]/20 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#1A73E8] text-[11px] uppercase font-mono">
              <GeminiIcon name="pin" size={12} />
              <span>Freshers Route from Main Gate:</span>
            </div>
            <p className="text-[11px] text-neutral-700 dark:text-neutral-200 leading-normal">
              {selectedBuilding.freshersDirections}
            </p>
          </div>

          {/* Key Faculties Using Hall */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1 text-[11px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-neutral-500 font-mono text-[10px]">Departments:</span>
              {selectedBuilding.faculties.map((f) => (
                <span
                  key={f}
                  className="px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.05] text-neutral-700 dark:text-neutral-300 font-medium"
                >
                  {f}
                </span>
              ))}
            </div>

            {/* Google Maps link fallback for external navigation */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBuilding.name + ' OOU Ago Iwoye')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-mono text-[#1A73E8] hover:underline"
            >
              <span>Google Maps Link</span>
              <GeminiIcon name="send" size={10} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

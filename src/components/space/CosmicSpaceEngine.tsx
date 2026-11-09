'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

interface StarGrain {
  x: number;
  y: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  twinkleSpeed: number;
  depth: number;
}

interface WarpParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export const CosmicSpaceEngine: React.FC = () => {
  const { spaceMode } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isActive, setIsActive] = useState(spaceMode);

  // Sync state with theme or custom events
  useEffect(() => {
    setIsActive(spaceMode);
    const onToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ enabled: boolean }>;
      setIsActive(customEvent.detail.enabled);
    };
    window.addEventListener('cohart_space_mode_toggle', onToggle);
    return () => window.removeEventListener('cohart_space_mode_toggle', onToggle);
  }, [spaceMode]);

  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 1. Initialize Microscopic Star Grains (320 stars)
    const starCount = Math.min(360, Math.floor((width * height) / 3200));
    const stars: StarGrain[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.4 + 0.4, // Micro grains
        alpha: Math.random() * 0.8 + 0.2,
        targetAlpha: Math.random() * 0.9 + 0.1,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        depth: Math.random() * 0.7 + 0.3,
      });
    }

    // 2. Supersonic Spacecraft State (Grok xAI Aerodynamic Supersonic Craft)
    const ship = {
      x: width * 0.85,
      y: height * 0.22,
      vx: -1.6,
      vy: 0.45,
      angle: Math.PI + 0.28,
      thrustTimer: 0,
    };

    const warpParticles: WarpParticle[] = [];

    // 3. Wormhole & Nebula Wave Phase
    let wavePhase = 0;

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep Space Grey Background Tint (#07080B with faint cosmic gas)
      const spaceGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        width * 0.1,
        width * 0.5,
        height * 0.5,
        width * 0.9
      );
      spaceGrad.addColorStop(0, 'rgba(15, 20, 30, 0.45)');
      spaceGrad.addColorStop(0.5, 'rgba(11, 13, 17, 0.75)');
      spaceGrad.addColorStop(1, 'rgba(7, 8, 11, 0.92)');
      ctx.fillStyle = spaceGrad;
      ctx.fillRect(0, 0, width, height);

      // A. Nebula Clouds & Cosmic Waves
      wavePhase += 0.008;
      const nebulaGlow = ctx.createRadialGradient(
        width * 0.25 + Math.sin(wavePhase * 0.5) * 60,
        height * 0.3 + Math.cos(wavePhase * 0.4) * 40,
        20,
        width * 0.25,
        height * 0.3,
        width * 0.45
      );
      nebulaGlow.addColorStop(0, 'rgba(79, 70, 229, 0.06)'); // Deep Starlight Indigo
      nebulaGlow.addColorStop(0.5, 'rgba(147, 51, 234, 0.03)'); // Cosmic Violet
      nebulaGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebulaGlow;
      ctx.fillRect(0, 0, width, height);

      // B. Gravitational Wormhole Lens Rings
      ctx.save();
      ctx.translate(width * 0.72, height * 0.68);
      for (let r = 1; r <= 3; r++) {
        const ringRadius = (wavePhase * 28 + r * 50) % 200;
        const ringAlpha = Math.max(0, (1 - ringRadius / 200) * 0.08);
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(148, 163, 184, ${ringAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      // C. Render Tiny Star Grains with Twinkle Physics
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        // Twinkle
        if (Math.abs(s.alpha - s.targetAlpha) < 0.02) {
          s.targetAlpha = Math.random() * 0.9 + 0.1;
        } else {
          s.alpha += (s.targetAlpha - s.alpha) * s.twinkleSpeed;
        }

        ctx.fillStyle = `rgba(240, 243, 248, ${s.alpha * 0.75})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra twinkle cross on 5% of brightest stars
        if (s.size > 1.2 && s.alpha > 0.7) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha * 0.35})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - 3, s.y);
          ctx.lineTo(s.x + 3, s.y);
          ctx.moveTo(s.x, s.y - 3);
          ctx.lineTo(s.x, s.y + 3);
          ctx.stroke();
        }
      }

      // D. Supersonic Spacecraft Update & Trajectory
      ship.x += ship.vx;
      ship.y += ship.vy;
      ship.thrustTimer++;

      // Wrap craft around screen smoothly
      if (ship.x < -60) ship.x = width + 60;
      if (ship.y > height + 60) ship.y = -60;
      if (ship.x > width + 60) ship.x = -60;
      if (ship.y < -60) ship.y = height + 60;

      // Spawn Warp Particles from Exhaust
      if (ship.thrustTimer % 2 === 0) {
        const exhaustAngle = ship.angle + Math.PI + (Math.random() - 0.5) * 0.2;
        const speed = Math.random() * 3 + 2;
        warpParticles.push({
          x: ship.x,
          y: ship.y,
          vx: Math.cos(exhaustAngle) * speed,
          vy: Math.sin(exhaustAngle) * speed,
          life: 0,
          maxLife: Math.random() * 25 + 15,
          color: Math.random() > 0.5 ? 'rgba(56, 189, 248, ' : 'rgba(129, 140, 248, ',
        });
      }

      // Update & Render Warp Speed Particles
      for (let p = warpParticles.length - 1; p >= 0; p--) {
        const part = warpParticles[p];
        part.x += part.vx;
        part.y += part.vy;
        part.life++;

        const pAlpha = (1 - part.life / part.maxLife) * 0.7;
        ctx.fillStyle = `${part.color}${pAlpha})`;
        ctx.beginPath();
        ctx.arc(part.x, part.y, Math.max(0.6, 2 - (part.life / part.maxLife) * 1.5), 0, Math.PI * 2);
        ctx.fill();

        if (part.life >= part.maxLife) {
          warpParticles.splice(p, 1);
        }
      }

      // E. Render Grok-Inspired Supersonic Aerospace Craft Silhouette
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);

      // Mach Shock Wave Cones (Supersonic Aerodynamic Waves)
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-24, -14);
      ctx.moveTo(18, 0);
      ctx.lineTo(-24, 14);
      ctx.stroke();

      // Craft Main Hull (Angular Grok / xAI Stealth Geometry)
      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath();
      ctx.moveTo(16, 0); // Nose tip
      ctx.lineTo(-12, -9); // Port wing tip
      ctx.lineTo(-8, -3); // Inner wing notch
      ctx.lineTo(-14, 0); // Keel thruster housing
      ctx.lineTo(-8, 3); // Starboard inner notch
      ctx.lineTo(-12, 9); // Starboard wing tip
      ctx.closePath();
      ctx.fill();

      // Wing Edge Insets & Fuselage Spine
      ctx.strokeStyle = '#0B0D11';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(-14, 0);
      ctx.stroke();

      // Hypersonic Plasma Exhaust Plume
      const flameGrad = ctx.createLinearGradient(-14, 0, -28, 0);
      flameGrad.addColorStop(0, '#FFFFFF');
      flameGrad.addColorStop(0.3, '#38BDF8');
      flameGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(-13, -2.5);
      ctx.lineTo(-26 - Math.random() * 6, 0);
      ctx.lineTo(-13, 2.5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-opacity duration-700 opacity-100">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Extraterrestrial HUD Orbit Ring & Supersonic Coordinates */}
      <div className="absolute top-4 right-4 text-[9px] font-mono tracking-widest text-slate-500/70 border border-slate-700/40 rounded-full px-3 py-1 bg-black/40 backdrop-blur-md hidden sm:flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
        <span>COSMIC LAB // MACH 4.8 // 3.87°E</span>
      </div>
    </div>
  );
};

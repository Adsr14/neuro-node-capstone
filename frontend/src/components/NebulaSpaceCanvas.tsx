import React, { useEffect, useRef, useState } from 'react';
import { audioManager } from '../lib/audioManager';

interface Planet {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  color: string;
  glowColor: string;
  vx: number;
  vy: number;
  phase: number;
  isCustomGlow?: boolean;
}

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  color: string;
}

interface TrailDot {
  x: number;
  y: number;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  color: string;
  vx: number;
  vy: number;
}

interface NebulaSpaceCanvasProps {
  stressLevel: number;
}

export const NebulaSpaceCanvas: React.FC<NebulaSpaceCanvasProps> = ({ stressLevel }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const prevMouseRef = useRef({ x: -1000, y: -1000 });
  const starsRef = useRef<Star[]>([]);
  const planetsRef = useRef<Planet[]>([]);
  const trailRef = useRef<TrailDot[]>([]);
  const isMobile = useRef(false);

  // Sync cursor theme colors with stress levels
  const themeColor = stressLevel > 0.7 ? '#f97316' : '#06b6d4'; // orange or cyan

  useEffect(() => {
    const checkViewport = () => {
      isMobile.current = window.innerWidth < 768;
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize 120 twinkling stars
    const stars: Star[] = [];
    const starColors = ['#ffffff', '#818cf8', '#a5f3fc', '#c084fc'];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        speed: 0.005 + Math.random() * 0.015,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }
    starsRef.current = stars;

    // Initialize 5 floating cosmic gas planets
    const colors = [
      { fill: 'rgba(6, 182, 212, 0.15)', glow: 'rgba(6, 182, 212, 0.4)' }, // Cyan
      { fill: 'rgba(139, 92, 246, 0.15)', glow: 'rgba(139, 92, 246, 0.4)' }, // Violet
      { fill: 'rgba(236, 72, 153, 0.12)', glow: 'rgba(236, 72, 153, 0.3)' }, // Pink
      { fill: 'rgba(16, 185, 129, 0.12)', glow: 'rgba(16, 185, 129, 0.3)' }, // Green
      { fill: 'rgba(249, 115, 22, 0.12)', glow: 'rgba(249, 115, 22, 0.35)' }, // Orange
    ];

    const planets: Planet[] = [];
    for (let i = 0; i < 5; i++) {
      const radius = 30 + Math.random() * 45;
      const rx = Math.random() * window.innerWidth;
      const ry = Math.random() * window.innerHeight;
      planets.push({
        x: rx,
        y: ry,
        targetX: rx,
        targetY: ry,
        radius,
        color: colors[i % colors.length].fill,
        glowColor: colors[i % colors.length].glow,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    }
    planetsRef.current = planets;

    // Mouse Tracking Event Listeners
    const handleMouseMove = (e: MouseEvent) => {
      prevMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Generate spark trail on move
      const speedX = mouseRef.current.x - prevMouseRef.current.x;
      const speedY = mouseRef.current.y - prevMouseRef.current.y;
      const moveDistance = Math.sqrt(speedX * speedX + speedY * speedY);

      if (moveDistance > 2) {
        audioManager.playCursorTick();
        // Create 2-4 sparkling star-trail particles
        const count = isMobile.current ? 1 : 3;
        for (let k = 0; k < count; k++) {
          trailRef.current.push({
            x: e.clientX + (Math.random() - 0.5) * 8,
            y: e.clientY + (Math.random() - 0.5) * 8,
            size: 1.5 + Math.random() * 3,
            alpha: 1,
            maxLife: 20 + Math.random() * 30,
            life: 0,
            color: themeColor,
            vx: -speedX * 0.15 + (Math.random() - 0.5) * 1.5,
            vy: -speedY * 0.15 + (Math.random() - 0.5) * 1.5,
          });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Nebula Backdrop Gradients
      const ambientGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      ambientGrad.addColorStop(0, '#03001e'); // Deep Midnight Black/Purple
      ambientGrad.addColorStop(0.5, '#0a1128'); // Deep Cosmic Space Navy
      ambientGrad.addColorStop(1, '#001f3f'); // Nebula Royal Space Blue
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle atmospheric cloud nebulas in the backgrounds
      const radialGrad = ctx.createRadialGradient(
        canvas.width * 0.25, canvas.height * 0.3, 10,
        canvas.width * 0.25, canvas.height * 0.3, canvas.width * 0.5
      );
      radialGrad.addColorStop(0, 'rgba(88, 28, 135, 0.15)'); // Soft purple
      radialGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const radialGrad2 = ctx.createRadialGradient(
        canvas.width * 0.75, canvas.height * 0.7, 50,
        canvas.width * 0.75, canvas.height * 0.7, canvas.width * 0.4
      );
      // Soft reactive shift in nebula color
      radialGrad2.addColorStop(0, stressLevel > 0.7 ? 'rgba(194, 65, 12, 0.10)' : 'rgba(8, 145, 178, 0.10)');
      radialGrad2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radialGrad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Twin star systems (Twinkling background)
      starsRef.current.forEach(star => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) {
          star.speed = -star.speed;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0.1, Math.min(1, star.alpha));
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 3. Floating Evasive Planets (Zero-G interaction)
      planetsRef.current.forEach((planet) => {
        // Base drift
        planet.phase += 0.002;
        planet.x += planet.vx + Math.sin(planet.phase) * 0.08;
        planet.y += planet.vy + Math.cos(planet.phase) * 0.08;

        // Interactive mouse repulsion: Planets shift gracefully away from the cursor
        const dx = planet.x - mouseRef.current.x;
        const dy = planet.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const activeRepelRadius = 250;

        if (distance < activeRepelRadius) {
          const force = (activeRepelRadius - distance) / activeRepelRadius;
          const angle = Math.atan2(dy, dx);
          const repelStrength = 1.8; // subtle speed push
          planet.x += Math.cos(angle) * force * repelStrength;
          planet.y += Math.sin(angle) * force * repelStrength;
        }

        // Boundary wrapping
        if (planet.x < -planet.radius * 2) planet.x = canvas.width + planet.radius;
        if (planet.x > canvas.width + planet.radius * 2) planet.x = -planet.radius;
        if (planet.y < -planet.radius * 2) planet.y = canvas.height + planet.radius;
        if (planet.y > canvas.height + planet.radius * 2) planet.y = -planet.radius;

        // Render planet spheres with soft blur & glowing halos
        ctx.save();
        ctx.beginPath();
        // Glow effect
        ctx.shadowBlur = planet.radius * 0.8;
        ctx.shadowColor = planet.glowColor;
        // Planet base translucent filling
        ctx.fillStyle = planet.color;
        ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
        ctx.fill();

        // Atmospheric stroke/ring
        ctx.shadowBlur = 0;
        ctx.strokeStyle = planet.glowColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Gentle surface shading accent
        const shadeGrad = ctx.createRadialGradient(
          planet.x - planet.radius * 0.3, planet.y - planet.radius * 0.3, planet.radius * 0.1,
          planet.x, planet.y, planet.radius
        );
        shadeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        shadeGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
        shadeGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = shadeGrad;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 4. Star-Trail Engine
      trailRef.current.forEach((dot, index) => {
        dot.life++;
        dot.x += dot.vx;
        dot.y += dot.vy;
        dot.vx *= 0.96; // deceleration friction
        dot.vy *= 0.96;
        dot.alpha = 1 - (dot.life / dot.maxLife);

        if (dot.life >= dot.maxLife) {
          trailRef.current.splice(index, 1);
          return;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, dot.alpha);
        ctx.fillStyle = dot.color;
        ctx.shadowBlur = dot.size * 2.5;
        ctx.shadowColor = dot.color;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, Math.max(0.2, dot.size * dot.alpha), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 5. Custom Glowing Mouse Core (drawn unless mouse is offscreen)
      if (mouseRef.current.x > -50 && mouseRef.current.y > -50) {
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = themeColor;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Outer glow compass ring
        ctx.shadowBlur = 0;
        ctx.strokeStyle = themeColor;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [themeColor, stressLevel]);

  return (
    <canvas
      ref={canvasRef}
      id="nebula-space-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    />
  );
};

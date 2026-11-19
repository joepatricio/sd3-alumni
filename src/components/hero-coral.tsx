"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useDeviceCapabilities } from "@/lib/device";

interface CoralHeroProps {
  children?: React.ReactNode;
  className?: string;
  canvasClassName?: string;
  particleCount?: number;
  interactive?: boolean;
  fade?: boolean;
}

/**
 * Coral Hero Component (User Interface)
 *
 * Visual Identity:
 * Organic, emergent, irregular, and outward-branching.
 * Implements a pure curl-noise (∇×F) divergence-free velocity flow field
 * adapted from creative-lab (049-flow-field.html).
 *
 * Palette: USJ-R Emerald/Forest Green (#005A36, #008751) with Amber Gold (#D97706) highlights.
 */
export const CoralHero: React.FC<CoralHeroProps> = ({
  children,
  className,
  canvasClassName,
  particleCount,
  interactive = true,
  fade = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isLowPower, isSmallScreen } = useDeviceCapabilities();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let isVisible = true;
    let width = container.clientWidth;
    let height = container.clientHeight;

    // Determine particle count based on device capability
    const count = particleCount ?? (isLowPower || isSmallScreen ? 1200 : 3200);
    const trailLen = isLowPower ? 8 : 14;

    // Particle state buffers
    const px = new Float32Array(count);
    const py = new Float32Array(count);
    const trailX = new Float32Array(count * trailLen);
    const trailY = new Float32Array(count * trailLen);
    const page = new Int16Array(count);

    // Mouse coordinates
    const mouse = { x: -9999, y: -9999, radius: 140, down: false };

    // --- Noise Utilities ---
    const seed = Math.random() * 500;

    function pseudoNoise(x: number, y: number, s: number) {
      const n = Math.sin(x * 12.9898 + y * 78.233 + s) * 43758.5453;
      return n - Math.floor(n);
    }

    function smoothNoise(x: number, y: number, s: number) {
      const i = Math.floor(x);
      const j = Math.floor(y);
      const fx = x - i;
      const fy = y - j;
      const u = fx * fx * (3 - 2 * fx);
      const v = fy * fy * (3 - 2 * fy);

      const n00 = pseudoNoise(i, j, s);
      const n10 = pseudoNoise(i + 1, j, s);
      const n01 = pseudoNoise(i, j + 1, s);
      const n11 = pseudoNoise(i + 1, j + 1, s);

      return (1 - u) * ((1 - v) * n00 + v * n01) + u * ((1 - v) * n10 + v * n11);
    }

    function octaveNoise(x: number, y: number, octaves: number, s: number) {
      let total = 0, freq = 1, amp = 1, maxAmp = 0;
      for (let o = 0; o < octaves; o++) {
        total += smoothNoise(x * freq, y * freq, s + o * 10) * amp;
        maxAmp += amp;
        amp *= 0.5;
        freq *= 2;
      }
      return total / maxAmp;
    }

    function curlNoise(x: number, y: number, t: number) {
      const eps = 0.005;
      const n1 = octaveNoise(x, y + eps, 2, seed + t * 0.05);
      const n2 = octaveNoise(x, y - eps, 2, seed + t * 0.05);
      const n3 = octaveNoise(x + eps, y, 2, seed + t * 0.05);
      const n4 = octaveNoise(x - eps, y, 2, seed + t * 0.05);
      return {
        vx: (n1 - n2) / (2 * eps),
        vy: -(n3 - n4) / (2 * eps),
      };
    }

    function spawnParticle(i: number, init: boolean) {
      px[i] = Math.random() * width;
      py[i] = Math.random() * height;
      page[i] = init ? Math.floor(Math.random() * trailLen) : 0;
      const base = i * trailLen;
      for (let j = 0; j < trailLen; j++) {
        trailX[base + j] = px[i];
        trailY[base + j] = py[i];
      }
    }

    // Initialize particles
    for (let i = 0; i < count; i++) {
      spawnParticle(i, true);
    }

    // Resize handler
    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Mouse listener
    const onMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onMouseDown = () => { mouse.down = true; };
    const onMouseUp = () => { mouse.down = false; };

    if (interactive) {
      container.addEventListener("mousemove", onMouseMove);
      container.addEventListener("mouseleave", onMouseLeave);
      container.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mouseup", onMouseUp);
    }

    // IntersectionObserver to pause rendering when scrolled out of view
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    // Color palette for organic coral filaments
    const coralColors = [
      "rgba(0, 90, 54, 0.40)",   // USJ-R Forest Green
      "rgba(0, 135, 81, 0.38)",  // Accent Emerald Green
      "rgba(217, 119, 6, 0.35)", // Accent Gold
      "rgba(16, 185, 129, 0.30)",// Soft Sage
    ];

    let t = 0;
    let lastTs = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      if (!isVisible) return;

      const dt = Math.min((now - lastTs) / 1000, 0.05);
      lastTs = now;
      t += dt * 0.15;

      // Soft trail clearing
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.fillRect(0, 0, width, height);

      const stepSpeed = 1.6 * dt * 60;

      for (let i = 0; i < count; i++) {
        const base = i * trailLen;

        // Shift trail history
        for (let j = trailLen - 1; j > 0; j--) {
          trailX[base + j] = trailX[base + j - 1];
          trailY[base + j] = trailY[base + j - 1];
        }
        trailX[base] = px[i];
        trailY[base] = py[i];

        // Curl noise field
        const c = curlNoise(px[i] * 0.0022, py[i] * 0.0022, t);
        let vx = c.vx * 1.8;
        let vy = c.vy * 1.8;

        // Mouse interaction
        if (mouse.x > -999) {
          const dx = mouse.x - px[i];
          const dy = mouse.y - py[i];
          const distSq = dx * dx + dy * dy;
          const rSq = mouse.radius * mouse.radius;
          if (distSq < rSq && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const strength = mouse.down ? 4 : 1.2;
            const force = (strength * (1 - dist / mouse.radius)) / dist;
            vx += dx * force;
            vy += dy * force;
          }
        }

        px[i] += vx * stepSpeed;
        py[i] += vy * stepSpeed;
        page[i]++;

        // Draw trail segment
        if (page[i] > 1) {
          const segs = Math.min(trailLen - 1, page[i]);
          ctx.beginPath();
          ctx.strokeStyle = coralColors[i % coralColors.length];
          ctx.lineWidth = 0.85;
          ctx.moveTo(trailX[base], trailY[base]);
          for (let j = 1; j <= segs; j++) {
            ctx.lineTo(trailX[base + j], trailY[base + j]);
          }
          ctx.stroke();
        }

        // Respawn if out of viewport or aged
        if (px[i] < 0 || px[i] > width || py[i] < 0 || py[i] > height || page[i] > trailLen * 45) {
          spawnParticle(i, false);
        }
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        container.removeEventListener("mousemove", onMouseMove);
        container.removeEventListener("mouseleave", onMouseLeave);
        container.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mouseup", onMouseUp);
      }
      observer.disconnect();
    };
  }, [isLowPower, isSmallScreen, particleCount, interactive]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden bg-background antialiased", className)}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full",
          fade && "[mask-image:radial-gradient(ellipse_95%_90%_at_50%_50%,#000_65%,transparent_100%)]",
          canvasClassName
        )}
      />
      {children && <div className="relative z-10 w-full">{children}</div>}
    </div>
  );
};

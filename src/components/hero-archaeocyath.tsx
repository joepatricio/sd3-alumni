"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useDeviceCapabilities } from "@/lib/device";

interface ArchaeocyathHeroProps {
  children?: React.ReactNode;
  className?: string;
  canvasClassName?: string;
  interactive?: boolean;
  scale?: number;
  showPentagram?: boolean;
  fade?: boolean;
}

/**
 * Archaeocyath Hero Component (Admin Interface)
 *
 * Visual Identity:
 * Ordered, radial, concentric, porous, and structurally predictable.
 * Implements harmonic multi-ring hypotrochoid/epitrochoid parametric curves
 * and radial porous septa adapted from creative-lab (053-spirograph.html).
 *
 * Palette: USJ-R Amber Gold (#D97706) and Deep Forest Green (#005A36) on Deep Navy (#0F172A).
 */
export const ArchaeocyathHero: React.FC<ArchaeocyathHeroProps> = ({
  children,
  className,
  canvasClassName,
  interactive = true,
  scale = 1.25,
  showPentagram = true,
  fade = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isLowPower } = useDeviceCapabilities();

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

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    let mouseAngle = 0;
    const onMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - width / 2;
      const my = e.clientY - rect.top - height / 2;
      mouseAngle = Math.atan2(my, mx) * 0.08;
    };
    if (interactive) {
      container.addEventListener("mousemove", onMouseMove);
    }

    let t = 0;
    let lastTs = performance.now();

    const ringCount = isLowPower ? 5 : 8;

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      if (!isVisible) return;

      const dt = Math.min((now - lastTs) / 1000, 0.05);
      lastTs = now;
      t += dt * 0.25;

      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const baseRadius = Math.min(width, height) * 0.42 * scale;

      // 1. Concentric Archaeocyath Wall Rings & Pores
      for (let r = 0; r < ringCount; r++) {
        const rad = baseRadius * (0.28 + (r / ringCount) * 0.72);
        const lobes = 14 + (r % 3) * 7;
        const phase = t * (0.05 * (r % 2 === 0 ? 1 : -1)) + mouseAngle;

        ctx.beginPath();
        ctx.strokeStyle = r % 2 === 0 ? "rgba(217, 119, 6, 0.35)" : "rgba(0, 90, 54, 0.38)";
        ctx.lineWidth = 1.0;

        const steps = 360;
        for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * Math.PI * 2;
          const rMod = rad + Math.sin(theta * lobes + phase) * (rad * 0.035);
          const x = cx + rMod * Math.cos(theta + phase * 0.3);
          const y = cy + rMod * Math.sin(theta + phase * 0.3);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Radial Septa connecting concentric walls
        if (r > 0 && r % 2 === 0) {
          const prevRad = baseRadius * (0.28 + ((r - 1) / ringCount) * 0.72);
          const septa = 28;
          ctx.beginPath();
          ctx.strokeStyle = "rgba(217, 119, 6, 0.16)";
          ctx.lineWidth = 0.7;
          for (let s = 0; s < septa; s++) {
            const theta = (s / septa) * Math.PI * 2 + phase * 0.2;
            ctx.moveTo(cx + prevRad * Math.cos(theta), cy + prevRad * Math.sin(theta));
            ctx.lineTo(cx + rad * Math.cos(theta), cy + rad * Math.sin(theta));
          }
          ctx.stroke();
        }
      }

      // 2. Harmonic Guilloche / Spirograph Lace
      const gears = [
        { R: baseRadius * 0.90, r: baseRadius * 0.35, d: baseRadius * 0.42, loops: 35, stroke: "rgba(0, 90, 54, 0.32)" },
        { R: baseRadius * 0.78, r: baseRadius * 0.26, d: baseRadius * 0.30, loops: 26, stroke: "rgba(217, 119, 6, 0.28)" },
      ];

      // Pentagram (5-pointed star gear in the middle)
      if (showPentagram) {
        gears.push({
          R: baseRadius * 1.05,
          r: baseRadius * 0.42,
          d: baseRadius * 0.25,
          loops: 42,
          stroke: "rgba(0, 135, 81, 0.26)",
        });
      }

      gears.forEach((g) => {
        ctx.beginPath();
        ctx.strokeStyle = g.stroke;
        ctx.lineWidth = 0.8;
        const total = g.loops * 120;
        const rot = t * 0.08 + mouseAngle;
        for (let i = 0; i <= total; i++) {
          const theta = (i / 120) * Math.PI * 2;
          const diff = g.R - g.r;
          const px = diff * Math.cos(theta) + g.d * Math.cos((diff / g.r) * theta);
          const py = diff * Math.sin(theta) - g.d * Math.sin((diff / g.r) * theta);

          // Rotate by rot
          const rx = px * Math.cos(rot) - py * Math.sin(rot);
          const ry = px * Math.sin(rot) + py * Math.cos(rot);

          if (i === 0) ctx.moveTo(cx + rx, cy + ry);
          else ctx.lineTo(cx + rx, cy + ry);
        }
        ctx.stroke();
      });
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        container.removeEventListener("mousemove", onMouseMove);
      }
      observer.disconnect();
    };
  }, [isLowPower, interactive, scale, showPentagram, fade]);

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

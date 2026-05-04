"use client";

import { useEffect, useRef } from "react";

interface HeroCanvasProps {
  scrollProgress?: number;
}

const CELL_SIZE = 48;
const AURA_RADIUS = 2; // how many neighbor cells light up (Chebyshev distance)
const HOVER_ALPHA = 0.085; // center cell fill alpha
const LINE_ALPHA = 0.06; // base grid line alpha

/**
 * Grid background. Always renders a thin grid. On cursor hover, the cell
 * under the pointer gets a subtle rose tint, and neighbor cells within
 * AURA_RADIUS pick up a softer aura — like a gentle spotlight.
 * No coordinates, no tracker, no particles — restrained and elegant.
 */
export function HeroCanvas({ scrollProgress = 0 }: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const targetRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const parent = canvas.parentElement;
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetRef.current.x = e.clientX - rect.left;
      targetRef.current.y = e.clientY - rect.top;
      targetRef.current.active = true;
    };
    const onMouseLeave = () => {
      targetRef.current.active = false;
    };
    (parent ?? canvas).addEventListener("mousemove", onMouseMove);
    (parent ?? canvas).addEventListener("mouseleave", onMouseLeave);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const sp = Math.min(Math.max(scrollRef.current, 0), 1);
      const globalAlpha = 1 - sp * 0.7;

      ctx.clearRect(0, 0, w, h);

      if (globalAlpha <= 0.02) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      // Ease mouse toward target for silky hover transitions
      const tgt = targetRef.current;
      const cur = mouseRef.current;
      if (tgt.active) {
        if (!cur.active) {
          cur.x = tgt.x;
          cur.y = tgt.y;
        } else {
          cur.x += (tgt.x - cur.x) * 0.22;
          cur.y += (tgt.y - cur.y) * 0.22;
        }
        cur.active = true;
      } else if (cur.active) {
        // Fade out — let currently-highlighted cells linger briefly
        cur.active = false;
      }

      // Grid alignment centered on viewport (matches CSS .hair-grid background-position: center)
      const offsetX = (w / 2) % CELL_SIZE;
      const offsetY = (h / 2) % CELL_SIZE;
      const firstCol = Math.floor(-offsetX / CELL_SIZE);
      const firstRow = Math.floor(-offsetY / CELL_SIZE);
      const lastCol = Math.ceil((w - offsetX) / CELL_SIZE);
      const lastRow = Math.ceil((h - offsetY) / CELL_SIZE);

      // ── Cell highlight (hover + aura)
      if (cur.active) {
        const hoverCol = Math.floor((cur.x - offsetX) / CELL_SIZE);
        const hoverRow = Math.floor((cur.y - offsetY) / CELL_SIZE);

        for (let dc = -AURA_RADIUS; dc <= AURA_RADIUS; dc++) {
          for (let dr = -AURA_RADIUS; dr <= AURA_RADIUS; dr++) {
            const dist = Math.max(Math.abs(dc), Math.abs(dr));
            if (dist > AURA_RADIUS) continue;
            // center = 1, neighbors fall off (quadratic)
            const falloff = Math.pow(1 - dist / (AURA_RADIUS + 1), 2);
            const alpha = HOVER_ALPHA * falloff * globalAlpha;
            if (alpha < 0.003) continue;
            const col = hoverCol + dc;
            const row = hoverRow + dr;
            const x = offsetX + col * CELL_SIZE;
            const y = offsetY + row * CELL_SIZE;
            ctx.fillStyle = `rgba(69, 209, 158, ${alpha})`;
            ctx.fillRect(x + 0.5, y + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
          }
        }
      }

      // ── Grid lines (thin, always visible)
      ctx.strokeStyle = `rgba(11, 10, 10, ${LINE_ALPHA * globalAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let c = firstCol; c <= lastCol; c++) {
        const x = Math.round(offsetX + c * CELL_SIZE) + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let r = firstRow; r <= lastRow; r++) {
        const y = Math.round(offsetY + r * CELL_SIZE) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      (parent ?? canvas).removeEventListener("mousemove", onMouseMove);
      (parent ?? canvas).removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

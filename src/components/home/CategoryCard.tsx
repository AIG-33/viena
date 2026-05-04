"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Category } from "@/types/category";

interface CategoryCardProps {
  category: Category;
  index: number;
  large?: boolean;
}

const ICONS: Record<string, React.ReactNode> = {
  package: (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  droplet: (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l6 10a6 6 0 11-12 0l6-10z" />
    </svg>
  ),
  cpu: (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="5" y="5" width="14" height="14" rx="0" strokeLinejoin="round" />
      <rect x="9" y="9" width="6" height="6" strokeLinejoin="round" />
      <path strokeLinecap="round" d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
    </svg>
  ),
  flask: (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v7L4 19a2 2 0 001.7 3h12.6a2 2 0 001.7-3L15 10V3M7 3h10" />
    </svg>
  ),
  microscope: (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 22h15M8 18h8M9 12l-3 6M14 4l-2-1-5 9 4 2 5-9-2-1zM14 14a4 4 0 004 4" />
    </svg>
  ),
  heart: (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.3 6.3a4.5 4.5 0 000 6.4L12 20.4l7.7-7.7a4.5 4.5 0 00-6.4-6.4L12 7.6l-1.3-1.3a4.5 4.5 0 00-6.4 0z" />
    </svg>
  ),
  beaker: (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 2h10v6l5 10a2 2 0 01-1.8 3H3.8A2 2 0 012 18L7 8V2zM7 12h10" />
    </svg>
  ),
  syringe: (
    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 2l4 4M15 5l4 4M12 8l-8 8 3 3 8-8M10 14l3 3M8 16l-5 5" />
    </svg>
  ),
};

type Palette = {
  bg: string;
  ink: string;
  sub: string;
  badge: string;
};

const PALETTES: Record<string, Palette> = {
  white:       { bg: "bg-paper-0",   ink: "text-ink-950", sub: "text-ink-500", badge: "text-rose-600" },
  "rose-soft": { bg: "bg-rose-50",   ink: "text-ink-950", sub: "text-ink-600", badge: "text-rose-700" },
  paper:       { bg: "bg-paper-100", ink: "text-ink-950", sub: "text-ink-500", badge: "text-rose-600" },
  rose:        { bg: "bg-rose-100",  ink: "text-ink-950", sub: "text-ink-700", badge: "text-rose-700" },
};

// Explicit per-category palette assignment — ensures visible differentiation
// in the homepage grid (no similar-color neighbours).
const CATEGORY_PALETTE: Record<string, keyof typeof PALETTES> = {
  consumables: "white",
  "vacuum-systems": "rose-soft",
  equipment: "white",
  reagents: "rose-soft",
  pathomorphology: "white",
  veterinary: "rose",
  "scientific-reagents": "rose",
  lancets: "white",
};

// Per-category border emphasis — slightly thicker edge on specific sides
// to visually frame the grid where the card sits at an outer edge.
const BORDER_EMPHASIS: Record<string, string> = {
  lancets: "border-r-[3px]",
  pathomorphology: "border-b-[3px]",
  veterinary: "border-b-[3px]",
};

export function CategoryCard({ category, index, large = false }: CategoryCardProps) {
  const code = `S-${String(index + 1).padStart(2, "0")}`;
  const paletteKey = CATEGORY_PALETTE[category.id] ?? "white";
  const p = PALETTES[paletteKey];
  const extraBorder = BORDER_EMPHASIS[category.id] ?? "";

  return (
    <Link href={`/catalog/${category.id}`}>
      <motion.article
        whileHover={{ y: -3, x: -3 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className={`relative border-[1.5px] border-ink-950 ${extraBorder} h-full flex flex-col ${p.bg} ${p.ink} ${
          large ? "p-7 min-h-[260px]" : "p-5 min-h-[200px]"
        } group cursor-pointer overflow-hidden`}
      >
        {/* Top meta row — code on left, icon badge on right */}
        <div className="flex items-start justify-between mb-6">
          <div className={`font-mono text-[10px] uppercase tracking-[0.14em] ${p.badge} font-semibold pt-1`}>
            / {code}
          </div>

          {/* Outline icon — no box, just stroke in the top-right corner */}
          <div
            className={`flex-shrink-0 ${p.badge} transition-transform group-hover:-rotate-3 ${
              large ? "w-14 h-14" : "w-12 h-12"
            }`}
            aria-hidden
          >
            {ICONS[category.icon] ?? ICONS.package}
          </div>
        </div>

        {/* Title */}
        <div className="relative flex-1 flex items-end">
          <h3
            className={`font-medium ${
              large ? "text-[1.75rem] md:text-[2.1rem]" : "text-[1.15rem] md:text-[1.25rem]"
            } leading-[1.04] tracking-[-0.025em]`}
          >
            {category.name}
          </h3>
        </div>

        {large && (
          <p className={`relative text-sm leading-relaxed ${p.sub} max-w-md mt-3`}>
            {category.description}
          </p>
        )}

        {/* Bottom meta row — count + arrow */}
        <div className="relative mt-4 pt-4 border-t border-current/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`font-mono text-[10px] uppercase tracking-[0.1em] ${p.sub}`}>
              SHOP · {category.id.slice(0, 3).toUpperCase()}
            </span>
            {category.productCount !== undefined && (
              <span className={`font-mono text-[10px] uppercase tracking-[0.1em] ${p.sub}`}>
                · N {String(category.productCount).padStart(3, "0")}
              </span>
            )}
          </div>
          <span className={`font-mono text-sm group-hover:translate-x-1 transition-transform ${p.badge}`}>
            ↗
          </span>
        </div>
      </motion.article>
    </Link>
  );
}

"use client";

import { HeroCanvas } from "@/components/home/HeroCanvas";

/**
 * Interactive grid backdrop for page hero strips — hover spotlight on cells.
 * Parent must be `relative overflow-hidden` without `hair-grid` (the canvas
 * draws its own grid). Content should sit in `relative z-10`.
 */
export function PageHeroBackdrop() {
  return <HeroCanvas />;
}

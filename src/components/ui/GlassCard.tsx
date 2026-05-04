"use client";

import { cn } from "@/lib/utils";

interface TechCardProps {
  children: React.ReactNode;
  className?: string;
  /** Kept for backward compat, ignored */
  glow?: boolean;
  hover?: boolean;
  tone?: "paper" | "sage" | "ink";
}

/**
 * Flat technical card with thick ink border. Kept exported as GlassCard for
 * backward compat with existing imports.
 */
export function GlassCard({
  children,
  className,
  hover = true,
  tone = "paper",
}: TechCardProps) {
  const toneCls =
    tone === "sage" ? "tech-card-sage" : tone === "ink" ? "tech-card-ink" : "tech-card";

  return (
    <div className={cn(toneCls, hover && "tech-card-lift", className)}>
      {children}
    </div>
  );
}

export const SoftCard = GlassCard;
export const TechCard = GlassCard;

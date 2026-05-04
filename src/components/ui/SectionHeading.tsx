import { cn } from "@/lib/utils";
import { AnimatedSection } from "./AnimatedSection";

interface SectionHeadingProps {
  label?: string;
  /** Technical code shown next to label (e.g., "S-02 · SUPPLY") */
  code?: string;
  title: string;
  /** Optional second word highlighted in sage bg */
  highlight?: string;
  /** Kept for compat with existing call sites — ignored */
  highlightStyle?: "gradient" | "marker-lavender" | "marker-lime" | "italic";
  description?: string;
  className?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}

export function SectionHeading({
  label,
  code,
  title,
  highlight,
  description,
  className,
  align = "left",
  tone = "light",
}: SectionHeadingProps) {
  const titleColor = tone === "dark" ? "text-paper-50" : "text-ink-950";
  const descColor = tone === "dark" ? "text-paper-300" : "text-ink-600";
  const sepColor = tone === "dark" ? "bg-paper-300/30" : "bg-ink-950/20";

  return (
    <AnimatedSection
      className={cn(
        "mb-14",
        align === "center" && "text-center flex flex-col items-center",
        className
      )}
    >
      {(label || code) && (
        <div className={cn("flex items-center gap-3 mb-6", align === "center" && "justify-center")}>
          {label && <span className="section-label">{label}</span>}
          {code && <span className="serial-label">{code}</span>}
          <span className={cn("flex-1 h-px", sepColor, align === "center" && "max-w-24")} />
        </div>
      )}
      <h2
        className={cn(
          "text-[2.5rem] md:text-[3.25rem] lg:text-[4rem] leading-[0.98] mb-5",
          highlight
            ? "serif-accent text-rose-600"
            : cn("display-heading", titleColor),
        )}
      >
        {title}
        {highlight && <> {highlight}</>}
      </h2>
      {description && (
        <p className={cn("text-base md:text-lg max-w-2xl leading-relaxed", descColor)}>
          {description}
        </p>
      )}
    </AnimatedSection>
  );
}

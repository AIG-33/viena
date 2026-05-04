import type { ReactNode } from "react";

interface PageHeroProps {
  /** Eyebrow content (icon + text). Wrapped in a glass chip. */
  eyebrow: ReactNode;
  /** Big two-line title. Use <span className="text-grad-green"> for green emphasis. */
  title: ReactNode;
  /** Subtitle paragraph. */
  description?: ReactNode;
  /** Optional right-hand widget (e.g. stats list). */
  aside?: ReactNode;
}

export function PageHero({
  eyebrow,
  title,
  description,
  aside,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-paper-200 hero-bg">
      <div
        aria-hidden
        className="hero-blob hero-blob-a -top-32 -left-24 h-[340px] w-[340px] bg-green-300/35"
      />
      <div
        aria-hidden
        className="hero-blob hero-blob-b -bottom-28 -right-16 h-[300px] w-[300px] bg-green-200/55"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent z-10"
      />

      <div className="relative z-10 max-w-[1320px] mx-auto px-4 md:px-10 lg:px-14 pt-7 md:pt-10 pb-8 md:pb-10">
        {aside ? (
          <div className="grid lg:grid-cols-[1.55fr_1fr] gap-8 lg:gap-10 items-end">
            <HeroText
              eyebrow={eyebrow}
              title={title}
              description={description}
            />
            <div>{aside}</div>
          </div>
        ) : (
          <HeroText
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
        )}
      </div>
    </section>
  );
}

function HeroText({
  eyebrow,
  title,
  description,
}: Pick<PageHeroProps, "eyebrow" | "title" | "description">) {
  return (
    <div>
      <span className="glass-chip">
        <span className="hero-pulse-dot" />
        {eyebrow}
      </span>
      <h1 className="display-heading-page text-ink-900 mt-4">
        {title}
      </h1>
      {description && (
        <p className="text-[14px] md:text-[15px] leading-relaxed text-ink-700 max-w-2xl mt-4">
          {description}
        </p>
      )}
    </div>
  );
}

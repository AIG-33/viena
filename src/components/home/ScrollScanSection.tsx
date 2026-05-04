"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Compact, readable process schema: five numbered steps stacked top-to-bottom.
 * Scroll is NOT hijacked — the section is its natural content height.
 * As the page scrolls through the section, the background (an ECG pulse line
 * plus a morphing medical icon) reacts: the pulse line draws itself, and a
 * faint step-number monogram crossfades with the active step.
 */

const STEPS = [
  {
    code: "01",
    label: "ЗАПРОС",
    latin: "REQUEST",
    desc:
      "Принимаем заявку от клиники или лаборатории. Уточняем задачи, бюджет и сроки.",
  },
  {
    code: "02",
    label: "ПОДБОР",
    latin: "SELECTION",
    desc:
      "Подбираем оборудование и расходники под конкретные протоколы исследования.",
  },
  {
    code: "03",
    label: "ПРОВЕРКА",
    latin: "VALIDATION",
    desc:
      "Сертификаты, регистрационные удостоверения, контроль партии на складе в Минске.",
  },
  {
    code: "04",
    label: "МОНТАЖ",
    latin: "INSTALL",
    desc:
      "Доставка, установка, пусконаладка и обучение персонала — под ключ.",
  },
  {
    code: "05",
    label: "ПОДДЕРЖКА",
    latin: "SUPPORT",
    desc:
      "Авторизованный сервис, поверка, расходники — сопровождение на всём сроке службы.",
  },
] as const;

function StepIcon({ code, className }: { code: string; className?: string }) {
  // Small outline medical icons, one per step
  const common = "stroke-current fill-none";
  if (code === "01") {
    // inbox / request
    return (
      <svg viewBox="0 0 40 40" className={className} aria-hidden>
        <path
          d="M6 22h8l2 4h8l2-4h8M6 22v10h28V22M6 22l4-14h20l4 14"
          strokeWidth="1.5"
          className={common}
          strokeLinejoin="miter"
        />
      </svg>
    );
  }
  if (code === "02") {
    // grid / selection
    return (
      <svg viewBox="0 0 40 40" className={className} aria-hidden>
        <path
          d="M6 6h11v11H6zM23 6h11v11H23zM6 23h11v11H6zM23 23h11v11H23z"
          strokeWidth="1.5"
          className={common}
        />
      </svg>
    );
  }
  if (code === "03") {
    // checkmark shield / certificate
    return (
      <svg viewBox="0 0 40 40" className={className} aria-hidden>
        <path
          d="M20 5 L33 9 V21 C33 29 27 33 20 36 C13 33 7 29 7 21 V9 L20 5z M13 20 L18 25 L27 15"
          strokeWidth="1.5"
          className={common}
          strokeLinejoin="miter"
        />
      </svg>
    );
  }
  if (code === "04") {
    // syringe
    return (
      <svg viewBox="0 0 40 40" className={className} aria-hidden>
        <path
          d="M4 36 L14 26 M10 30 L12 28 L24 16 L30 22 L18 34 L16 36 L10 30z M22 14 L30 22 M26 10 L32 4 L36 8 L30 14"
          strokeWidth="1.5"
          className={common}
          strokeLinejoin="miter"
        />
      </svg>
    );
  }
  // 05 — heartbeat / support
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path
        d="M3 20 H10 L13 14 L17 26 L21 8 L25 32 L29 20 H37"
        strokeWidth="1.5"
        className={common}
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function ScrollScanSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // progress from when the section enters the viewport bottom to when it leaves the top
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // ECG line draw: at 0 nothing drawn, at 1 fully drawn.
  // Compressed range + earlier end so the full cycle finishes before the
  // section scrolls under the fixed header.
  const ecgDash = useTransform(scrollYProgress, [0.08, 0.7], [1, 0]);
  const ecgOpacity = useTransform(scrollYProgress, [0, 0.15, 0.7, 0.95], [0, 1, 1, 0.2]);

  // Background monogram follows active step — starts later so "01" is
  // properly visible once the section is actually in view, ends at 0.7
  // so "05" reaches peak visibility while still below the header.
  const monoProgress = useTransform(scrollYProgress, [0.25, 0.7], [0, 5]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-paper-50 border-y-[1.5px] border-ink-950 overflow-hidden"
      aria-label="Процесс работы от запроса до поставки"
    >
      {/* Big rose monogram (step number) — centered; painted FIRST so ECG cuts through */}
      <MonogramBackground monoProgress={monoProgress} />

      {/* Background ECG pulse — draws itself through the numbers as user scrolls */}
      <motion.svg
        aria-hidden
        viewBox="0 0 1600 200"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[280px] w-full pointer-events-none z-[1]"
        style={{ opacity: ecgOpacity }}
      >
        <motion.path
          d="M0 100 H200 L215 100 L225 60 L240 140 L255 30 L270 170 L285 100 H500 L600 100 L615 100 L625 70 L640 130 L655 100 H900 L1000 100 L1015 100 L1025 40 L1040 160 L1055 20 L1070 180 L1085 100 H1600"
          stroke="rgba(69, 209, 158, 0.75)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="square"
          strokeDasharray={1}
          pathLength={1}
          style={{ pathLength: 1, strokeDashoffset: ecgDash }}
        />
      </motion.svg>

      {/* Medical cross watermark scatter */}
      <div className="absolute inset-0 med-watermark opacity-70 pointer-events-none z-0" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-20 md:py-28">
        {/* Top strip */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12 pb-6 border-b-[1.5px] border-ink-950">
          <div className="flex items-center gap-3">
            <span className="section-label">SECTOR 02 · PROCESS</span>
            <span className="serial-label">/ ОТ ЗАПРОСА ДО ПОСТАВКИ</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-500">
            5 ЭТАПОВ · STANDARD FLOW
          </span>
        </div>

        <div className="grid md:grid-cols-12 gap-10 mb-16">
          <h2 className="md:col-span-7 serif-accent text-rose-600 text-[2.5rem] md:text-[3.5rem] lg:text-[4.25rem] leading-[0.98]">
            Как мы работаем
          </h2>
          <p className="md:col-span-5 text-ink-700 text-[15px] md:text-base leading-relaxed self-end max-w-md">
            Каждый контракт проходит пять этапов — от первого звонка до
            ежемесячной поставки расходников. Прозрачно, по документам,
            без посредников.
          </p>
        </div>

        {/* Steps — vertical timeline */}
        <ol className="relative">
          {/* Thin connector rail on the left (desktop) */}
          <span
            className="hidden md:block absolute left-[42px] top-3 bottom-3 w-px bg-ink-950/20"
            aria-hidden
          />

          {STEPS.map((s, i) => (
            <motion.li
              key={s.code}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="relative grid md:grid-cols-[84px_1fr_auto] gap-5 md:gap-8 items-start py-6 md:py-8 border-t border-ink-950/15 first:border-t-0 group"
            >
              {/* Number badge */}
              <div className="flex md:flex-col items-center md:items-start gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-rose-600 font-semibold w-10 text-right md:text-left">
                  /{s.code}
                </span>
                <span
                  className="relative z-10 w-11 h-11 border-[1.5px] border-ink-950 bg-paper-0 flex items-center justify-center text-ink-950 group-hover:bg-rose-100 transition-colors"
                  aria-hidden
                >
                  <StepIcon code={s.code} className="w-5 h-5" />
                </span>
              </div>

              {/* Copy */}
              <div>
                <div className="flex items-baseline gap-3 mb-1">
                  <h3 className="text-ink-950 text-xl md:text-2xl font-medium tracking-tight">
                    {s.label}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-500">
                    {s.latin}
                  </span>
                </div>
                <p className="text-ink-700 text-[14.5px] leading-relaxed max-w-xl">
                  {s.desc}
                </p>
              </div>

              {/* Tick column (desktop) */}
              <div className="hidden md:flex flex-col items-end gap-1 pt-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-400">
                  STEP · {i + 1}/{STEPS.length}
                </span>
                <span className="font-mono text-[10px] text-rose-500">
                  {i === STEPS.length - 1 ? "◉ ВЕРИФ." : "→"}
                </span>
              </div>
            </motion.li>
          ))}
        </ol>

        {/* Footer line */}
        <div className="mt-12 pt-6 border-t-[1.5px] border-ink-950 flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-600">
            / END OF FLOW · 0000273
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-600">
            SUPPORT · 24 / 7
          </span>
        </div>
      </div>
    </section>
  );
}

function MonogramBackground({
  monoProgress,
}: {
  monoProgress: import("framer-motion").MotionValue<number>;
}) {
  // Fade through 5 giant numbers anchored to the right edge, vertically
  // centered. The ECG pulse line (painted on top of this layer) draws itself
  // horizontally through the middle of these numbers as the user scrolls.
  return (
    <div
      aria-hidden
      className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-rose-200 pointer-events-none z-0 font-mono font-black leading-none select-none"
    >
      <div
        className="relative"
        style={{ fontSize: "clamp(9rem, 24vw, 22rem)" }}
      >
        {/* Invisible placeholder — reserves the bounding box size */}
        <span className="invisible tabular-nums">01</span>
        {[1, 2, 3, 4, 5].map((n) => (
          <MonoNumber key={n} n={n} monoProgress={monoProgress} />
        ))}
      </div>
    </div>
  );
}

function MonoNumber({
  n,
  monoProgress,
}: {
  n: number;
  monoProgress: import("framer-motion").MotionValue<number>;
}) {
  const opacity = useTransform(
    monoProgress,
    [n - 1.2, n - 0.5, n - 0.5 + 0.0001, n + 0.3],
    [0, 1, 1, 0],
  );
  return (
    <motion.span
      style={{ opacity }}
      className="absolute inset-0 tabular-nums"
    >
      0{n}
    </motion.span>
  );
}

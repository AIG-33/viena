"use client";

import { useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { useTranslations } from "next-intl";

interface ContactInfoCardProps {
  /** Eyebrow label above the value (e.g. "Городской"). */
  label: string;
  /** Display value (e.g. "+375 17 392-02-55"). */
  value: string;
  /**
   * Value written to the clipboard. Useful when the display string
   * differs from the canonical form (phone numbers without spaces,
   * Telegram username without "@", etc.).
   */
  copyValue?: string;
  /**
   * Optional native-action target (`tel:`, `mailto:`, `https://t.me/...`).
   * Rendered as a small icon button in the top-right corner so users
   * can still dial / write / open Telegram on top of the click-to-copy
   * primary action.
   */
  href?: string;
  external?: boolean;
  icon: ReactNode;
}

/**
 * One of the four contact tiles on /contacts. The whole card is a
 * click-to-copy button: tapping it writes the canonical form of the
 * value to the clipboard and flashes a "Скопировано" pill. The small
 * arrow chip in the top-right corner remains a real link so visitors
 * who explicitly want to dial / write / open Telegram still can.
 */
export function ContactInfoCard({
  label,
  value,
  copyValue,
  href,
  external,
  icon,
}: ContactInfoCardProps) {
  const t = useTranslations("contacts.info");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = async () => {
    const text = copyValue ?? value;
    let ok = false;
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard?.writeText
    ) {
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        ok = false;
      }
    }
    if (!ok && typeof document !== "undefined") {
      // Legacy fallback for older / insecure-context browsers.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        ok = true;
      } catch {
        ok = false;
      }
      document.body.removeChild(ta);
    }
    if (!ok) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1700);
  };

  // Stop the link's click from bubbling so the underlying card-copy
  // button does *not* also fire. Using a sibling absolute link (rather
  // than nesting) keeps the markup valid and the focus order natural.
  const stop = (e: MouseEvent<HTMLAnchorElement>) => e.stopPropagation();

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-paper-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-green-400 hover:shadow-[0_18px_42px_-22px_rgba(15,17,19,0.25)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(120% 80% at 100% 0%, rgba(34,197,142,0.10) 0%, rgba(255,255,255,0) 60%)",
        }}
      />

      <button
        type="button"
        onClick={handleCopy}
        title={t("copyHint")}
        aria-label={`${label}: ${value} — ${t("copyHint")}`}
        className="relative w-full text-left p-5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 rounded-2xl"
      >
        <div
          className="relative inline-grid h-12 w-12 place-items-center rounded-xl text-green-700 transition-transform duration-300 group-hover:scale-[1.08] group-hover:-rotate-6"
          style={{
            background:
              "linear-gradient(135deg, var(--color-green-50) 0%, var(--color-green-100) 100%)",
          }}
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-xl ring-1 ring-inset ring-green-200/80"
          />
          <span
            aria-hidden
            className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle, rgba(34,197,142,0.45) 0%, rgba(34,197,142,0) 70%)",
            }}
          />
          {icon}
        </div>

        <div className="mt-4 text-[11px] uppercase tracking-[0.14em] font-bold text-ink-500">
          {label}
        </div>
        <div className="mt-1.5 font-display text-[18px] md:text-[19px] font-bold tracking-tight tabular-nums text-ink-900 group-hover:text-green-800 transition-colors">
          {value}
        </div>
      </button>

      {href && (
        <a
          href={href}
          {...(external
            ? { target: "_blank", rel: "noreferrer noopener" }
            : {})}
          onClick={stop}
          aria-label={t("open")}
          title={t("open")}
          className="absolute top-4 right-4 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-paper-100 text-ink-400 transition-all duration-200 hover:bg-green-500 hover:text-white hover:shadow-[0_8px_20px_-8px_rgba(34,197,142,0.6)] focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </a>
      )}

      <div
        aria-live="polite"
        className={`pointer-events-none absolute bottom-4 right-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-green-600 text-white text-[11px] font-bold uppercase tracking-[0.12em] py-1 px-3 shadow-[0_10px_24px_-12px_rgba(16,168,117,0.7)] transition-all duration-200 ${
          copied
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12l5 5 9-11" />
        </svg>
        {t("copied")}
      </div>
    </div>
  );
}

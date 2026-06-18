"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface CopyChipProps {
  /** Value written to the clipboard. */
  value: string;
  /** Optional aria-label override (otherwise "Скопировать"). */
  label?: string;
  /** Visual size; defaults to "sm" used inline next to text. */
  size?: "sm" | "md";
}

/**
 * Tiny copy-icon button used inline next to a copyable label
 * (address, UNP, company name, etc.). Replaces itself with a green
 * checkmark for ~1.7 s after a successful copy.
 */
export function CopyChip({ value, label, size = "sm" }: CopyChipProps) {
  const t = useTranslations("contacts.info");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handle = async () => {
    let ok = false;
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard?.writeText
    ) {
      try {
        await navigator.clipboard.writeText(value);
        ok = true;
      } catch {
        ok = false;
      }
    }
    if (!ok && typeof document !== "undefined") {
      const ta = document.createElement("textarea");
      ta.value = value;
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

  const dim = size === "md" ? "h-7 w-7" : "h-6 w-6";
  const iconDim = size === "md" ? "h-3.5 w-3.5" : "h-3 w-3";

  return (
    <button
      type="button"
      onClick={handle}
      title={copied ? t("copied") : t("copy")}
      aria-label={label ?? t("copy")}
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${dim} transition-all duration-200 align-middle focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 ${
        copied
          ? "bg-green-500 text-white shadow-[0_8px_20px_-8px_rgba(34,197,142,0.6)]"
          : "bg-paper-100 text-ink-500 hover:bg-green-500 hover:text-white"
      }`}
    >
      {copied ? (
        <svg
          viewBox="0 0 24 24"
          className={iconDim}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12l5 5 9-11" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className={iconDim}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V6a2 2 0 0 1 2-2h9" />
        </svg>
      )}
    </button>
  );
}

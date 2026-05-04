"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const LOCALE_LABELS: Record<Locale, { native: string; short: string }> = {
  ru: { native: "Русский", short: "RU" },
  en: { native: "English", short: "EN" },
  zh: { native: "中文", short: "ZH" },
};

export function LanguageSwitcher() {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSelect(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => {
      // Pass current dynamic params through so we don't lose [slug]/[category] info.
      router.replace(
        // @ts-expect-error -- next-intl typed router accepts string pathnames at runtime.
        { pathname, params },
        { locale: next }
      );
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("label")}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-paper-200 text-ink-700 hover:text-ink-900 hover:border-ink-900 text-[12px] font-mono font-bold tracking-[0.08em] uppercase transition-colors"
      >
        <svg
          className="w-3.5 h-3.5 opacity-70"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
        </svg>
        <span>{LOCALE_LABELS[locale].short}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              aria-hidden
              tabIndex={-1}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              role="menu"
              className="absolute right-0 top-full mt-2 z-50 min-w-[160px] rounded-2xl bg-white border border-paper-200 shadow-[var(--shadow-2)] p-1.5"
            >
              {routing.locales.map((l) => {
                const isActive = l === locale;
                return (
                  <button
                    key={l}
                    type="button"
                    role="menuitem"
                    onClick={() => handleSelect(l as Locale)}
                    disabled={isPending}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                      isActive
                        ? "bg-green-50 text-green-700"
                        : "text-ink-700 hover:bg-paper-100"
                    }`}
                  >
                    <span className="font-display">
                      {LOCALE_LABELS[l as Locale].native}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.16em] opacity-70">
                      {LOCALE_LABELS[l as Locale].short}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

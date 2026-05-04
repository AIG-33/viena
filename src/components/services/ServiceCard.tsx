"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import type { Service } from "@/types/service";

const ICONS: Record<string, string> = {
  truck: "M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h4l3 3v4h-1m-6 0a2 2 0 11-4 0 2 2 0 014 0zm7 0a2 2 0 11-4 0 2 2 0 014 0z",
  wrench: "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
  clipboard: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  graduation: "M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5",
};

export function ServiceCard({ service }: { service: Service; index?: number }) {
  const [expanded, setExpanded] = useState(false);
  const tCommon = useTranslations("common");
  const tList = useTranslations("services.list");

  return (
    <article className="card card-hover p-7 flex flex-col gap-4 h-full">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 grid place-items-center shrink-0">
          <svg viewBox="0 0 24 24" className="icon w-6 h-6">
            <path d={ICONS[service.icon] ?? ICONS.clipboard} />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-[20px] leading-snug text-ink-900">
            {service.title}
          </h3>
          <p className="text-[14px] text-ink-600 leading-relaxed mt-2">
            {service.description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mt-auto pt-4 border-t border-paper-200 flex items-center justify-between text-[13px] font-semibold text-green-700 hover:text-green-600 transition-colors"
      >
        <span>{expanded ? tCommon("showLess") : tList("subtitle")}</span>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          ↓
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden space-y-2"
          >
            {service.details.map((detail, i) => (
              <li key={i} className="flex items-start gap-3 text-[14px] text-ink-700">
                <span className="text-[11px] uppercase tracking-[0.1em] text-ink-400 pt-1 shrink-0 font-mono tabular-nums">
                  /{String(i + 1).padStart(2, "0")}
                </span>
                <span>{detail}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </article>
  );
}

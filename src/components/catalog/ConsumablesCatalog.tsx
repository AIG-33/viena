"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { VariantProductCard } from "./VariantProductCard";
import type { Locale } from "@/i18n/routing";
import type { Product } from "@/types/product";

interface ConsumablesCatalogProps {
  families: Product[];
}

type GroupKey = "all" | "tips" | "tubes" | "plates" | "urine" | "swabs";

const GROUP_LABELS: Record<GroupKey, Record<Locale, string>> = {
  all: { ru: "Все", en: "All", zh: "全部" },
  tips: { ru: "Наконечники", en: "Pipette tips", zh: "吸头" },
  tubes: { ru: "Пробирки", en: "Tubes", zh: "试管" },
  plates: { ru: "Планшеты", en: "Plates", zh: "板" },
  urine: { ru: "Сбор мочи", en: "Urine", zh: "尿液" },
  swabs: { ru: "Свабы", en: "Swabs", zh: "拭子" },
};

const GROUP_ORDER: GroupKey[] = ["all", "tips", "tubes", "plates", "urine", "swabs"];

function groupOf(slug: string): GroupKey {
  if (slug.startsWith("nakonechniki")) return "tips";
  if (slug.startsWith("svaby")) return "swabs";
  if (slug.includes("planshet") || slug.startsWith("plenki") || slug.includes("lunochn"))
    return "plates";
  if (slug.includes("mochi") || slug.startsWith("mochepriemniki")) return "urine";
  return "tubes";
}

export function ConsumablesCatalog({ families }: ConsumablesCatalogProps) {
  const locale = useLocale() as Locale;
  const tVac = useTranslations("vacuumCatalog");

  const [group, setGroup] = useState<GroupKey>("all");
  const [query, setQuery] = useState("");

  const groupCounts = useMemo(() => {
    const counts: Record<GroupKey, number> = {
      all: families.length,
      tips: 0,
      tubes: 0,
      plates: 0,
      urine: 0,
      swabs: 0,
    };
    for (const f of families) counts[groupOf(f.slug)] += 1;
    return counts;
  }, [families]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return families.filter((f) => {
      if (group !== "all" && groupOf(f.slug) !== group) return false;
      if (!q) return true;
      if (f.name.toLowerCase().includes(q)) return true;
      if (f.shortDescription.toLowerCase().includes(q)) return true;
      if (
        f.variants?.some(
          (v) =>
            v.catalogNumber.toLowerCase().includes(q) ||
            (typeof v.sourceName === "string" &&
              v.sourceName.toLowerCase().includes(q))
        )
      )
        return true;
      return false;
    });
  }, [families, group, query]);

  const totalSkus = useMemo(
    () => filtered.reduce((s, f) => s + (f.variants?.length ?? 0), 0),
    [filtered]
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {GROUP_ORDER.map((g) => {
          if (groupCounts[g] === 0) return null;
          const active = group === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => setGroup(g)}
              className={`inline-flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
                active
                  ? "bg-ink-900 text-white border-ink-900"
                  : "bg-white text-ink-700 border-paper-200 hover:border-ink-700"
              }`}
            >
              {GROUP_LABELS[g][locale]}
              <span className={active ? "text-white/60" : "text-ink-400"}>
                {groupCounts[g]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-bold text-ink-500">
          <span className="font-mono tabular-nums text-ink-900 text-[14px]">
            {filtered.length}
          </span>
          <span>{tVac("families")}</span>
          <span className="opacity-50">·</span>
          <span className="font-mono tabular-nums text-ink-900 text-[14px]">
            {totalSkus}
          </span>
          <span>{tVac("skus")}</span>
        </div>

        <div className="relative w-full md:w-72 shrink-0">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
            <svg viewBox="0 0 24 24" className="icon w-4 h-4">
              <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.3-4.3" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tVac("searchPlaceholder")}
            className="w-full bg-white border border-paper-200 rounded-full pl-10 pr-3 py-2 text-ink-900 text-[13px] placeholder:text-ink-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="display-heading text-ink-900 text-2xl mb-2">
            {tVac("emptyTitle")}
          </p>
          <p className="text-ink-600 text-sm">{tVac("emptySubtitle")}</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((family, i) => (
              <motion.div
                key={family.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <VariantProductCard family={family} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { VacuumProductCard } from "./VacuumProductCard";
import {
  VacuumConfigurator,
  buildFlatVariants,
  filterFlatVariants,
  type VacuumConfiguratorState,
} from "./VacuumConfigurator";
import type { Product } from "@/types/product";

interface VacuumCatalogProps {
  families: Product[];
  subcategories: string[];
  /** Kept in props for backwards compat; not used by the grid anymore. */
  capColors: string[];
}

export function VacuumCatalog({
  families,
  subcategories,
}: VacuumCatalogProps) {
  const tVac = useTranslations("vacuumCatalog");

  const [state, setState] = useState<VacuumConfiguratorState>({
    type: subcategories[0] ?? "venous",
    selection: {},
  });
  const [query, setQuery] = useState("");

  const allRows = useMemo(() => buildFlatVariants(families), [families]);

  // Apply configurator selection to derive matching variants/families.
  const matchedRows = useMemo(
    () => filterFlatVariants(allRows, state),
    [allRows, state]
  );

  // Pre-search families: each family appears once if it has at least one
  // variant matching the configurator selection.
  const matchedFamilies = useMemo(() => {
    const seen = new Set<string>();
    const out: Product[] = [];
    for (const r of matchedRows) {
      if (!seen.has(r.family.id)) {
        seen.add(r.family.id);
        out.push(r.family);
      }
    }
    return out;
  }, [matchedRows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return matchedFamilies;
    return matchedFamilies.filter((f) => {
      if (f.name.toLowerCase().includes(q)) return true;
      if (f.shortDescription.toLowerCase().includes(q)) return true;
      if (
        f.variants?.some((v) =>
          v.catalogNumber.toLowerCase().includes(q)
        )
      ) {
        return true;
      }
      return false;
    });
  }, [matchedFamilies, query]);

  const totalSkus = useMemo(
    () => filtered.reduce((sum, f) => sum + (f.variants?.length ?? 0), 0),
    [filtered]
  );

  return (
    <div className="flex flex-col gap-5">
      <VacuumConfigurator
        families={families}
        state={state}
        onChange={setState}
      />

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
          <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-ink-500 mb-3">
            0 / {matchedFamilies.length}
          </p>
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
                <VacuumProductCard family={family} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

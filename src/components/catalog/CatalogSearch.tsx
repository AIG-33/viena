"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product, ProductVariant } from "@/types/product";
import type { Category } from "@/types/category";

interface CatalogSearchProps {
  products: Product[];
  categories: Category[];
}

/**
 * Flat searchable item — either a stand-alone product or a single variant
 * of a multi-variant family (e.g. one of 576 vacuum tubes).
 */
interface SearchEntry {
  product: Product;
  /** Specific variant when the entry corresponds to a single SKU. */
  variant?: ProductVariant;
  /** Stable id for keys / dedup. */
  id: string;
  /** Lower-cased haystacks pre-built for fast matching. */
  haystack: {
    name: string;
    sku: string;
    sourceName: string;
    desc: string;
    additive: string;
    capColor: string;
    manufacturer: string;
  };
  /** Catalog number to display in the result row. */
  displaySku: string;
  /** Display name (manufacturer name for variants, family name otherwise). */
  displayName: string;
}

interface Hit extends SearchEntry {
  /** Lower is better. */
  score: number;
}

const MAX_RESULTS = 15;

function buildEntries(products: Product[]): SearchEntry[] {
  const out: SearchEntry[] = [];
  for (const p of products) {
    const variants = p.variants ?? [];
    if (variants.length === 0) {
      out.push({
        product: p,
        id: p.id,
        haystack: {
          name: p.name.toLowerCase(),
          sku: (p.catalogNumber ?? "").toLowerCase(),
          sourceName: "",
          desc: p.shortDescription.toLowerCase(),
          additive: (p.additive ?? "").toLowerCase(),
          capColor: (p.capColor ?? "").toLowerCase(),
          manufacturer: (p.manufacturer ?? "").toLowerCase(),
        },
        displaySku: p.catalogNumber ?? "",
        displayName: p.name,
      });
      continue;
    }
    // Family with variants → one entry per variant (each is a real SKU).
    for (const v of variants) {
      const sourceName =
        typeof v.sourceName === "string" ? v.sourceName : "";
      out.push({
        product: p,
        variant: v,
        id: `${p.id}::${v.catalogNumber || sourceName}`,
        haystack: {
          name: p.name.toLowerCase(),
          sku: (v.catalogNumber ?? "").toLowerCase(),
          sourceName: sourceName.toLowerCase(),
          desc: p.shortDescription.toLowerCase(),
          additive: (p.additive ?? "").toLowerCase(),
          capColor: (p.capColor ?? "").toLowerCase(),
          manufacturer: (p.manufacturer ?? "").toLowerCase(),
        },
        displaySku: v.catalogNumber || p.catalogNumber || "",
        displayName: sourceName || p.name,
      });
    }
  }
  return out;
}

function score(entry: SearchEntry, q: string): number | null {
  const h = entry.haystack;
  // Exact / prefix matches on SKU win.
  if (h.sku === q) return 0;
  if (h.sku.startsWith(q)) return 1;
  // Exact / prefix on names.
  if (h.name.startsWith(q)) return 2;
  if (h.sourceName.startsWith(q)) return 2;
  // Substring matches.
  if (h.sku.includes(q)) return 3;
  if (h.name.includes(q)) return 4;
  if (h.sourceName.includes(q)) return 4;
  // Soft matches.
  if (h.additive.includes(q)) return 5;
  if (h.capColor.includes(q)) return 5;
  if (h.manufacturer.includes(q)) return 5;
  if (h.desc.includes(q)) return 6;
  return null;
}

export function CatalogSearch({ products, categories }: CatalogSearchProps) {
  const t = useTranslations("catalog.search");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const categoryById = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  // Build the flat searchable index once per `products` change.
  const entries = useMemo(() => buildEntries(products), [products]);

  const hits = useMemo<Hit[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const found: Hit[] = [];
    for (const entry of entries) {
      const s = score(entry, q);
      if (s !== null) found.push({ ...entry, score: s });
    }
    found.sort(
      (a, b) =>
        a.score - b.score ||
        a.displayName.localeCompare(b.displayName) ||
        a.displaySku.localeCompare(b.displaySku)
    );
    return found.slice(0, MAX_RESULTS);
  }, [entries, query]);

  // Close on outside click / Escape.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => setActiveIdx(0), [query]);

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={wrapRef} className="relative">
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.3-4.3"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("placeholder")}
          className="w-full bg-white border-2 border-paper-200 rounded-2xl pl-14 pr-5 py-4 text-ink-900 text-[15px] placeholder:text-ink-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition"
          onKeyDown={(e) => {
            if (!showDropdown || hits.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIdx((i) => Math.min(i + 1, hits.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIdx((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              const hit = hits[activeIdx];
              if (hit) {
                const url = `/catalog/${hit.product.categoryId}/${hit.product.slug}`;
                window.location.href = url;
              }
            }
          }}
        />

        {query.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-900 text-lg"
            aria-label={t("clear")}
          >
            ×
          </button>
        )}

        {showDropdown && (
          <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white border border-paper-200 rounded-2xl shadow-2xl overflow-hidden vac-popover-enter">
            {hits.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-[13px] text-ink-500">{t("empty")}</p>
              </div>
            ) : (
              <>
                <div className="px-5 py-2.5 border-b border-paper-200 flex items-center justify-between text-[11px] uppercase tracking-[0.12em] font-bold text-ink-500">
                  <span>{t("resultsLabel")}</span>
                  <span className="font-mono tabular-nums text-ink-900">
                    {hits.length}
                    {hits.length === MAX_RESULTS ? "+" : ""}
                  </span>
                </div>
                <ul className="max-h-[420px] overflow-y-auto">
                  {hits.map((hit, i) => {
                    const cat = categoryById.get(hit.product.categoryId);
                    const active = i === activeIdx;
                    return (
                      <li key={hit.id}>
                        <Link
                          href={`/catalog/${hit.product.categoryId}/${hit.product.slug}`}
                          onClick={() => setOpen(false)}
                          onMouseEnter={() => setActiveIdx(i)}
                          className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                            active ? "bg-paper-50" : "hover:bg-paper-50"
                          }`}
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-paper-50 shrink-0 ring-1 ring-paper-200">
                            {hit.product.images[0] ? (
                              <Image
                                src={hit.product.images[0]}
                                alt={hit.product.name}
                                fill
                                sizes="48px"
                                className="object-contain p-1"
                              />
                            ) : (
                              <div className="w-full h-full grid place-items-center text-ink-300 text-xs">
                                —
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[14px] font-semibold text-ink-900 truncate">
                              {hit.displayName}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-ink-500 mt-0.5">
                              {cat && (
                                <span className="text-ink-700 font-medium truncate max-w-[160px]">
                                  {cat.name}
                                </span>
                              )}
                              {hit.displaySku && (
                                <>
                                  <span className="opacity-50">·</span>
                                  <span className="font-mono tabular-nums text-ink-900">
                                    {hit.displaySku}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <span
                            className="text-ink-400 group-hover:text-ink-900 shrink-0"
                            aria-hidden
                          >
                            →
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        )}
    </div>
  );
}

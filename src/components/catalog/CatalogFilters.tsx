"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type { Category } from "@/types/category";
import type { Manufacturer } from "@/types/manufacturer";

interface CatalogFiltersProps {
  categories: Category[];
  manufacturers: Manufacturer[];
  currentCategory?: string;
  currentQuery?: string;
  currentManufacturer?: string;
}

export function CatalogFilters({
  categories,
  manufacturers,
  currentCategory,
  currentQuery,
  currentManufacturer,
}: CatalogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("catalog.filters");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [, startTransition] = useTransition();
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showAllManufacturers, setShowAllManufacturers] = useState(false);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        const qs = params.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  const sortedManufacturers = useMemo(() => {
    const localeTag = locale === "zh" ? "zh-CN" : locale === "en" ? "en" : "ru";
    return [...manufacturers].sort((a, b) => {
      const diff = (b.productCount ?? 0) - (a.productCount ?? 0);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name, localeTag);
    });
  }, [manufacturers, locale]);

  const manufacturersWithProducts = sortedManufacturers.filter(
    (m) => (m.productCount ?? 0) > 0
  );

  const visibleManufacturers = showAllManufacturers
    ? sortedManufacturers
    : manufacturersWithProducts.slice(0, 8);

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
          <svg viewBox="0 0 24 24" className="icon w-4 h-4">
            <path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.3-4.3" />
          </svg>
        </span>
        <input
          type="search"
          defaultValue={currentQuery}
          placeholder={t("searchPlaceholder")}
          onChange={(e) => {
            const value = e.target.value;
            if (searchDebounce.current) clearTimeout(searchDebounce.current);
            searchDebounce.current = setTimeout(() => updateParams("q", value), 350);
          }}
          className="w-full bg-white border border-paper-200 rounded-full pl-11 pr-4 py-3 text-ink-900 text-[14px] placeholder:text-ink-400 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-ink-500">
          {t("categories")}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => updateParams("category", "")}
            className={`px-3.5 py-2 rounded-full text-[13px] font-semibold transition-colors ${
              !currentCategory
                ? "bg-ink-900 text-white"
                : "bg-paper-100 text-ink-700 hover:bg-paper-200"
            }`}
          >
            {tCommon("all")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParams("category", cat.id)}
              className={`px-3.5 py-2 rounded-full text-[13px] font-semibold transition-colors ${
                currentCategory === cat.id
                  ? "bg-ink-900 text-white"
                  : "bg-paper-100 text-ink-700 hover:bg-paper-200"
              }`}
            >
              {cat.name}
              {cat.productCount !== undefined && (
                <span className="ml-1.5 opacity-60 tabular-nums">· {cat.productCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-ink-500">
            {t("manufacturers")}
          </span>
          {manufacturers.length > visibleManufacturers.length && (
            <button
              type="button"
              onClick={() => setShowAllManufacturers((v) => !v)}
              className="text-[11px] font-semibold text-green-700 hover:text-green-600"
            >
              {showAllManufacturers
                ? t("showLess")
                : `${t("showAll")} (${manufacturers.length})`}
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => updateParams("manufacturer", "")}
            className={`px-3.5 py-2 rounded-full text-[13px] font-semibold transition-colors ${
              !currentManufacturer
                ? "bg-green-600 text-white"
                : "bg-paper-100 text-ink-700 hover:bg-paper-200"
            }`}
          >
            {tCommon("all")}
          </button>
          {visibleManufacturers.map((m) => (
            <button
              key={m.slug}
              onClick={() => updateParams("manufacturer", m.slug)}
              className={`px-3.5 py-2 rounded-full text-[13px] font-semibold transition-colors ${
                currentManufacturer === m.slug
                  ? "bg-green-600 text-white"
                  : "bg-paper-100 text-ink-700 hover:bg-paper-200"
              }`}
            >
              {m.name}
              {m.productCount !== undefined && m.productCount > 0 && (
                <span className="ml-1.5 opacity-60 tabular-nums">· {m.productCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

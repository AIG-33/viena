"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  additiveLabel,
  closureLabel,
  colorLabel,
  colorSwatch,
  labelLabel,
  materialLabel,
  subcategoryLabel,
} from "@/lib/vacuum-tokens";
import type { Locale } from "@/i18n/routing";
import type { Product, ProductVariant } from "@/types/product";

export interface VacuumConfiguratorState {
  /** Active subcategory (`venous`, `capillary`, …). */
  type: string;
  /** Attribute → value selections (additive, volume, capColor, …). */
  selection: Record<string, string>;
}

interface VacuumConfiguratorProps {
  families: Product[];
  /** Controlled state — when omitted the component manages its own state. */
  state?: VacuumConfiguratorState;
  onChange?: (state: VacuumConfiguratorState) => void;
}

export type FlatVariant = {
  family: Product;
  variant: ProductVariant;
  type: string;
  additive: string | null;
};

const ATTR_ORDER = [
  "additive",
  "volume",
  "capColor",
  "ringColor",
  "size",
  "closure",
  "material",
  "label",
] as const;

type AttrKey = (typeof ATTR_ORDER)[number];

// ---------- helpers ----------
function uniqueValuesFor(rows: FlatVariant[], key: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of rows) {
    const val = key === "additive" ? r.additive : r.variant[key];
    if (typeof val === "string" && val && !seen.has(val)) {
      seen.add(val);
      out.push(val);
    }
  }
  return out;
}

function attrFieldLabel(key: AttrKey, t: (k: string) => string): string {
  switch (key) {
    case "additive":
      return t("step2Additive");
    case "volume":
      return t("volume");
    case "capColor":
      return t("capColor");
    case "ringColor":
      return t("ringColor");
    case "size":
      return t("size");
    case "closure":
      return t("closure");
    case "material":
      return t("material");
    case "label":
      return t("label");
  }
}

function attrValueDisplay(
  key: string,
  value: string,
  locale: Locale
): string {
  if (key === "additive") return additiveLabel(value, locale);
  if (key === "closure") return closureLabel(value, locale);
  if (key === "capColor" || key === "ringColor") return colorLabel(value, locale);
  if (key === "material") return materialLabel(value, locale);
  if (key === "label") return labelLabel(value, locale);
  return value;
}

// Build flat (family, variant) rows once for a list of families. Exported so
// the parent catalog can reuse the same flat dataset for grid filtering.
export function buildFlatVariants(families: Product[]): FlatVariant[] {
  const rows: FlatVariant[] = [];
  for (const f of families) {
    for (const v of f.variants ?? []) {
      rows.push({
        family: f,
        variant: v,
        type: f.subcategory ?? "other",
        additive: f.additive ?? null,
      });
    }
  }
  return rows;
}

// Filter flat rows by the configurator state. Exported for re-use by the grid.
export function filterFlatVariants(
  rows: FlatVariant[],
  state: VacuumConfiguratorState
): FlatVariant[] {
  return rows.filter((r) => {
    if (r.type !== state.type) return false;
    return Object.entries(state.selection).every(([k, v]) =>
      k === "additive" ? r.additive === v : r.variant[k] === v
    );
  });
}

// ---------- main ----------
export function VacuumConfigurator({
  families,
  state: controlledState,
  onChange,
}: VacuumConfiguratorProps) {
  const locale = useLocale() as Locale;
  const tVac = useTranslations("vacuumCatalog");
  const tCommon = useTranslations("common");

  const allRows = useMemo<FlatVariant[]>(
    () => buildFlatVariants(families),
    [families]
  );

  const types = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const r of allRows) {
      if (!seen.has(r.type)) {
        seen.add(r.type);
        out.push(r.type);
      }
    }
    return out;
  }, [allRows]);

  // Optional uncontrolled fallback — used when no parent state is supplied.
  const [internal, setInternal] = useState<VacuumConfiguratorState>({
    type: types[0] ?? "venous",
    selection: {},
  });
  const isControlled = !!controlledState && !!onChange;
  const value: VacuumConfiguratorState = controlledState ?? internal;
  const update = (next: VacuumConfiguratorState) => {
    if (isControlled) onChange!(next);
    else setInternal(next);
  };

  const { type, selection } = value;
  const setType = (t: string) =>
    update({ type: t, selection: {} });
  const setSelection = (sel: Record<string, string>) =>
    update({ ...value, selection: sel });

  const [openPopover, setOpenPopover] = useState<AttrKey | null>(null);
  useEffect(() => {
    setOpenPopover(null);
  }, [type]);

  const rowsByType = useMemo(
    () => allRows.filter((r) => r.type === type),
    [allRows, type]
  );

  const matching = useMemo(() => {
    return rowsByType.filter((r) =>
      Object.entries(selection).every(([k, v]) =>
        k === "additive" ? r.additive === v : r.variant[k] === v
      )
    );
  }, [rowsByType, selection]);

  const availabilityFor = (key: AttrKey): Set<string> => {
    const out = new Set<string>();
    for (const r of rowsByType) {
      const ok = Object.entries(selection).every(([k, v]) => {
        if (k === key) return true;
        return k === "additive" ? r.additive === v : r.variant[k] === v;
      });
      if (!ok) continue;
      const val = key === "additive" ? r.additive : r.variant[key];
      if (typeof val === "string" && val) out.add(val);
    }
    return out;
  };

  const attrsToShow = useMemo(() => {
    return ATTR_ORDER.filter(
      (k) => uniqueValuesFor(rowsByType, k).length > 1
    );
  }, [rowsByType]);

  const exact = matching.length === 1 ? matching[0] : null;
  const previewSku = exact?.variant.catalogNumber || "";
  const previewFamily = exact?.family ?? matching[0]?.family ?? null;

  const setAttr = (key: AttrKey, val: string) => {
    const next = { ...selection };
    if (next[key] === val) delete next[key];
    else next[key] = val;
    setSelection(next);
  };

  const reset = () => {
    setSelection({});
    setOpenPopover(null);
  };

  const popRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click / Escape.
  useEffect(() => {
    if (!openPopover) return;
    const onDown = (e: MouseEvent) => {
      if (!popRef.current?.contains(e.target as Node)) setOpenPopover(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPopover(null);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [openPopover]);

  return (
    <section className="card p-4 md:p-5 bg-gradient-to-br from-white via-paper-50 to-green-500/5 border-paper-200/80">
      {/* Row 1 — title + live SKU + actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-bold text-green-700 px-2 py-1 rounded-full bg-green-500/10 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {tVac("configuratorBadge")}
          </span>
          <h2 className="font-display text-ink-900 text-lg md:text-xl truncate">
            {tVac("configuratorTitle")}
          </h2>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          {exact ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-900 text-white">
              <span className="text-[10px] uppercase tracking-[0.12em] text-white/60 font-bold">
                SKU
              </span>
              <span className="font-mono font-bold tabular-nums text-[15px]">
                {previewSku || "—"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[12px] text-ink-600">
              <span className="font-mono tabular-nums font-bold text-ink-900">
                {matching.length}
              </span>
              <span>{tVac("matchingSkus")}</span>
            </div>
          )}
          {previewFamily && exact && (
            <Link
              href={`/catalog/${previewFamily.categoryId}/${previewFamily.slug}`}
              className="text-[12px] font-semibold text-green-700 hover:text-green-800 whitespace-nowrap"
            >
              {tVac("openProduct")} →
            </Link>
          )}
          <button
            type="button"
            onClick={reset}
            className="text-[11px] uppercase tracking-[0.1em] font-bold text-ink-500 hover:text-ink-900 whitespace-nowrap"
          >
            {tVac("resetConfigurator")}
          </button>
        </div>
      </div>

      {/* Row 2 — product type as compact horizontal scroller */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 mb-2.5 scrollbar-hide">
        {types.map((t) => {
          const active = type === t;
          const count = allRows.filter((r) => r.type === t).length;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors whitespace-nowrap ${
                active
                  ? "bg-ink-900 text-white"
                  : "bg-paper-100 text-ink-700 hover:bg-paper-200"
              }`}
            >
              {subcategoryLabel(t, locale)}
              <span className={`ml-1 tabular-nums ${active ? "opacity-60" : "opacity-50"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Row 3 — filter buttons (popovers) */}
      {attrsToShow.length > 0 && (
        <div ref={popRef} className="flex flex-wrap gap-1.5 relative">
          {attrsToShow.map((key) => {
            const values = uniqueValuesFor(rowsByType, key);
            if (values.length === 0) return null;
            const reachable = availabilityFor(key);
            const sel = selection[key];
            const isOpen = openPopover === key;
            const isColor = key === "capColor" || key === "ringColor";
            return (
              <FilterPopover
                key={key}
                isOpen={isOpen}
                onToggle={() => setOpenPopover(isOpen ? null : key)}
                fieldLabel={attrFieldLabel(key, tVac)}
                value={sel ? attrValueDisplay(key, sel, locale) : tCommon("all")}
                isActive={!!sel}
                swatch={isColor && sel ? colorSwatch(sel) : null}
                isRing={key === "ringColor"}
              >
                <PopoverGrid
                  values={values}
                  selected={sel}
                  reachable={reachable}
                  onPick={(v) => {
                    setAttr(key, v);
                    setOpenPopover(null);
                  }}
                  isColor={isColor}
                  isRing={key === "ringColor"}
                  display={(v) => attrValueDisplay(key, v, locale)}
                />
              </FilterPopover>
            );
          })}
        </div>
      )}

    </section>
  );
}

// ---------------------------------------------------------------------------
// FilterPopover — compact button with dropdown panel.
// ---------------------------------------------------------------------------
interface FilterPopoverProps {
  fieldLabel: string;
  value: string;
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
  swatch: string | null;
  isRing: boolean;
  children: React.ReactNode;
}

function FilterPopover({
  fieldLabel,
  value,
  isActive,
  isOpen,
  onToggle,
  swatch,
  isRing,
  children,
}: FilterPopoverProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] transition-all ${
          isActive
            ? "bg-ink-900 text-white border-ink-900 shadow-sm"
            : isOpen
              ? "bg-white text-ink-900 border-ink-900 shadow-sm"
              : "bg-white text-ink-700 border-paper-200 hover:border-ink-700"
        }`}
      >
        <span
          className={`text-[10px] uppercase tracking-[0.08em] font-bold ${
            isActive ? "text-white/60" : "text-ink-500"
          }`}
        >
          {fieldLabel}
        </span>
        {swatch && (
          <span
            className="w-2.5 h-2.5 rounded-full ring-1 ring-black/15"
            style={{
              background: isRing
                ? `radial-gradient(circle, transparent 38%, ${swatch} 40%, ${swatch} 70%, transparent 72%)`
                : swatch,
            }}
          />
        )}
        <span className="font-semibold whitespace-nowrap">{value}</span>
        <svg
          viewBox="0 0 24 24"
          className={`w-3 h-3 opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-30 card p-2.5 min-w-[260px] max-w-[360px] max-h-[320px] overflow-y-auto shadow-lg vac-popover-enter">
          {children}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PopoverGrid — chips inside the popover panel.
// ---------------------------------------------------------------------------
interface PopoverGridProps {
  values: string[];
  selected: string | undefined;
  reachable: Set<string>;
  onPick: (v: string) => void;
  isColor: boolean;
  isRing: boolean;
  display: (v: string) => string;
}

function PopoverGrid({
  values,
  selected,
  reachable,
  onPick,
  isColor,
  isRing,
  display,
}: PopoverGridProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((v) => {
        const active = selected === v;
        const available = reachable.has(v);
        return (
          <button
            key={v}
            type="button"
            onClick={() => onPick(v)}
            disabled={!available && !active}
            title={display(v)}
            className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
              active
                ? "bg-ink-900 text-white border-ink-900"
                : available
                  ? "bg-white text-ink-700 border-paper-200 hover:border-ink-700"
                  : "bg-paper-50 text-ink-300 border-paper-200 cursor-not-allowed"
            }`}
          >
            {isColor && (
              <span
                className="w-2.5 h-2.5 rounded-full ring-1 ring-black/15 shrink-0"
                style={{
                  background: isRing
                    ? `radial-gradient(circle, transparent 38%, ${colorSwatch(v)} 40%, ${colorSwatch(v)} 70%, transparent 72%)`
                    : colorSwatch(v),
                }}
              />
            )}
            <span>{display(v)}</span>
          </button>
        );
      })}
    </div>
  );
}

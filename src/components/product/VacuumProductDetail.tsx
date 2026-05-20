"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ProductGallery } from "@/components/product/ProductGallery";
import { useCart, type SelectedOptions } from "@/context/CartContext";
import {
  additiveLabel,
  closureLabel,
  colorLabel,
  colorSwatch,
  labelLabel,
  materialLabel,
} from "@/lib/vacuum-tokens";
import {
  findVariant,
  reconcileSelection,
  uniqueValues,
} from "@/lib/variant-select";
import type { Locale } from "@/i18n/routing";
import type { Product, ProductVariant } from "@/types/product";

function attrValueDisplay(
  key: string,
  value: string,
  locale: Locale
): string {
  if (key === "closure") return closureLabel(value, locale);
  if (key === "capColor" || key === "ringColor") return colorLabel(value, locale);
  if (key === "material") return materialLabel(value, locale);
  if (key === "label") return labelLabel(value, locale);
  return value;
}

interface VacuumProductDetailProps {
  family: Product;
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 4h2l2 12h12l2-9H6" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

export function VacuumProductDetail({ family }: VacuumProductDetailProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const tVac = useTranslations("vacuumCatalog");
  const tProd = useTranslations("productPage");
  const tCard = useTranslations("productCard");
  const tCommon = useTranslations("common");
  const { addItem, updateQuantity, removeItem, findLine, isHydrated } = useCart();

  const variants = family.variants ?? [];
  const attributes = family.variantAttributes ?? [];

  const initialSelection = useMemo<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    if (variants[0]) {
      for (const a of attributes) {
        const v = variants[0][a.key];
        if (typeof v === "string") out[a.key] = v;
      }
    }
    return out;
  }, [variants, attributes]);

  const [selection, setSelection] = useState<Record<string, string>>(initialSelection);
  const variant = findVariant(variants, selection) ?? variants[0];
  const sku = variant?.catalogNumber ?? family.catalogNumber ?? "";

  const attributeKeys = useMemo(
    () => attributes.map((a) => a.key),
    [attributes]
  );

  // Smart click handler — always lands on a valid SKU.
  const pickAttr = (key: string, val: string) => {
    setSelection((prev) =>
      reconcileSelection(variants, attributeKeys, prev, key, val)
    );
  };

  const cartOptions: SelectedOptions | undefined = useMemo(() => {
    if (!variant) return undefined;
    const out: SelectedOptions = { sku: variant.catalogNumber };
    for (const a of attributes) {
      const v = variant[a.key];
      if (typeof v === "string") out[a.key] = v;
    }
    return out;
  }, [variant, attributes]);

  const cartItem = findLine(family.id, cartOptions);
  const inCart = isHydrated && !!cartItem;

  const handleAdd = () => {
    if (!variant) return;
    addItem({
      productId: family.id,
      slug: family.slug,
      categoryId: family.categoryId,
      name: family.name,
      catalogNumber: variant.catalogNumber,
      image: family.images[0],
      selectedOptions: cartOptions,
    });
  };

  const goToCart = () => router.push("/contacts#cart");
  const additive = additiveLabel(family.additive, locale);

  // Pre-compute the available value sets for each attribute given the
  // already-locked selections in OTHER attributes. This greys out unreachable
  // combinations so users always land on a valid SKU.
  const availabilityFor = (key: string): Set<string> => {
    const out = new Set<string>();
    for (const v of variants) {
      const ok = Object.entries(selection).every(([k, val]) =>
        k === key ? true : v[k] === val
      );
      if (ok && typeof v[key] === "string") out.add(v[key] as string);
    }
    return out;
  };

  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-12">
      <ProductGallery images={family.images} name={family.name} />

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center text-[11px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full ${
              family.inStock ? "bg-green-500 text-white" : "bg-ink-700 text-white"
            }`}
          >
            {family.inStock ? tProd("inStock") : tProd("byOrder")}
          </span>
          {additive && (
            <span className="pill pill-green">{additive}</span>
          )}
          {family.capColor && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-700 px-2 py-1 rounded-full bg-paper-100">
              <span
                className="w-3 h-3 rounded-full ring-1 ring-black/10"
                style={{ background: colorSwatch(family.capColor) }}
              />
              {colorLabel(family.capColor, locale)}
            </span>
          )}
          {family.ringColor && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-700 px-2 py-1 rounded-full bg-paper-100">
              <span
                className="w-3 h-3 rounded-full ring-1 ring-black/10"
                style={{
                  background: `radial-gradient(circle, transparent 38%, ${colorSwatch(family.ringColor)} 40%, ${colorSwatch(family.ringColor)} 70%, transparent 72%)`,
                }}
              />
              {tVac("ringColor")}: {colorLabel(family.ringColor, locale)}
            </span>
          )}
        </div>

        <h1 className="display-heading text-ink-900 text-3xl md:text-4xl lg:text-[42px]">
          {family.name}
        </h1>

        <p className="text-[15px] leading-relaxed text-ink-700">
          {family.description || family.shortDescription}
        </p>

        {/* Configurator */}
        {attributes.length > 0 && variants.length > 1 && (
          <div className="card p-5 flex flex-col gap-4 bg-paper-50">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <span className="text-[11px] uppercase tracking-[0.14em] font-bold text-ink-500">
                {tVac("configurator")}
              </span>
              <span className="text-[11px] text-ink-500">
                {variants.length} {tVac("variantsAvailable")}
              </span>
            </div>

            {attributes.map((attr) => {
              const values = uniqueValues(variants, attr.key);
              if (values.length === 0) return null;
              const reachable = availabilityFor(attr.key);
              const isColor = attr.key === "capColor" || attr.key === "ringColor";
              const label =
                locale === "en"
                  ? attr.label_en
                  : locale === "zh"
                    ? attr.label_zh
                    : attr.label_ru;
              return (
                <div key={attr.key} className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-ink-500">
                    {label}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {values.map((v) => {
                      const active = selection[attr.key] === v;
                      const available = reachable.has(v);
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => pickAttr(attr.key, v)}
                          title={attrValueDisplay(attr.key, v, locale)}
                          aria-pressed={active}
                          className={`inline-flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-1.5 rounded-full transition-colors border ${
                            active
                              ? "bg-ink-900 text-white border-ink-900"
                              : available
                                ? "bg-white text-ink-700 border-paper-200 hover:border-ink-700"
                                : "bg-paper-50 text-ink-400 border-paper-200 line-through hover:border-ink-700"
                          }`}
                        >
                          {isColor && (
                            <span
                              className="w-3 h-3 rounded-full ring-1 ring-black/15"
                              style={{
                                background:
                                  attr.key === "ringColor"
                                    ? `radial-gradient(circle, transparent 38%, ${colorSwatch(v)} 40%, ${colorSwatch(v)} 70%, transparent 72%)`
                                    : colorSwatch(v),
                              }}
                            />
                          )}
                          {attrValueDisplay(attr.key, v, locale)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="flex items-end justify-between border-t border-paper-200 pt-4 mt-1 gap-3 flex-wrap">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-[0.14em] text-ink-500 font-bold">
                  {tVac("catalogNumber")}
                </span>
                <span className="font-mono text-2xl font-bold text-ink-900 tabular-nums">
                  {sku || "—"}
                </span>
                {variant?.pack && (
                  <span className="text-[11px] text-ink-500">
                    {tVac("packaging")}: {variant.pack}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(sku);
                }}
                className="btn btn-ghost btn-sm"
                aria-label={tVac("copySku")}
              >
                {tVac("copySku")}
              </button>
            </div>
          </div>
        )}

        {variants.length === 1 && variant && (
          <div className="card p-4 bg-paper-50 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-ink-500 font-bold">
                {tVac("catalogNumber")}
              </div>
              <div className="font-mono text-2xl font-bold text-ink-900 tabular-nums">
                {variant.catalogNumber}
              </div>
            </div>
            {variant.pack && (
              <span className="text-[12px] text-ink-500">
                {tVac("packaging")}: {variant.pack}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {inCart && cartItem ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-paper-200 bg-paper-50">
              <CartIcon className="w-5 h-5 text-green-700" />
              <span className="text-[13px] text-ink-700 flex-1">{tProd("inQuote")}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(cartItem.lineId, cartItem.quantity - 1)}
                  className="w-9 h-9 rounded-full border border-paper-200 hover:border-ink-900 grid place-items-center"
                  aria-label={tCard("decrease")}
                >
                  −
                </button>
                <span className="min-w-[48px] text-center text-[14px] font-bold tabular-nums">
                  {cartItem.quantity} {tProd("quantityShort")}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(cartItem.lineId, cartItem.quantity + 1)}
                  className="w-9 h-9 rounded-full bg-green-500 text-white grid place-items-center hover:bg-green-600"
                  aria-label={tCard("increase")}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(cartItem.lineId)}
                  className="w-9 h-9 rounded-full border border-paper-200 hover:border-red-500 hover:text-red-500 grid place-items-center"
                  aria-label={tCommon("removeFromQuote")}
                >
                  ×
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              disabled={!variant}
              className="btn btn-green btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CartIcon className="w-4 h-4" />
              {tProd("addToCart")}
            </button>
          )}

          <button type="button" onClick={goToCart} className="btn btn-dark">
            {tProd("requestPrice")} <span aria-hidden>→</span>
          </button>
        </div>
      </div>

      {/* Variant matrix table — full width */}
      {variants.length > 1 && (
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-paper-200">
              <h3 className="text-[16px] font-bold text-ink-900 font-display">
                {tVac("variantTable")}
              </h3>
              <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-500">
                {variants.length} SKU
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left text-ink-500">
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.1em] text-[11px]">
                      {tVac("catalogNumber")}
                    </th>
                    {attributes.map((a) => {
                      const label =
                        locale === "en"
                          ? a.label_en
                          : locale === "zh"
                            ? a.label_zh
                            : a.label_ru;
                      return (
                        <th
                          key={a.key}
                          className="px-4 py-3 font-semibold uppercase tracking-[0.1em] text-[11px]"
                        >
                          {label}
                        </th>
                      );
                    })}
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.1em] text-[11px]">
                      {tVac("packaging")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, i) => {
                    const isCurrent = v === variant;
                    return (
                      <tr
                        key={(v.catalogNumber || v.sourceName || "v") + i}
                        className={`border-t border-paper-200 ${
                          isCurrent ? "bg-green-500/5" : ""
                        } hover:bg-paper-50 cursor-pointer`}
                        onClick={() => {
                          const next: Record<string, string> = {};
                          for (const a of attributes) {
                            const val = v[a.key];
                            if (typeof val === "string") next[a.key] = val;
                          }
                          setSelection(next);
                        }}
                      >
                        <td className="px-4 py-3 font-mono font-bold text-ink-900 tabular-nums">
                          {v.catalogNumber || "—"}
                        </td>
                        {attributes.map((a) => {
                          const raw = v[a.key];
                          const val = typeof raw === "string" ? raw : null;
                          if (!val) {
                            return (
                              <td key={a.key} className="px-4 py-3 text-ink-300">
                                —
                              </td>
                            );
                          }
                          const isColor = a.key === "capColor" || a.key === "ringColor";
                          return (
                            <td key={a.key} className="px-4 py-3 text-ink-700">
                              <span className="inline-flex items-center gap-1.5">
                                {isColor && (
                                  <span
                                    className="w-3 h-3 rounded-full ring-1 ring-black/15"
                                    style={{
                                      background:
                                        a.key === "ringColor"
                                          ? `radial-gradient(circle, transparent 38%, ${colorSwatch(val)} 40%, ${colorSwatch(val)} 70%, transparent 72%)`
                                          : colorSwatch(val),
                                    }}
                                  />
                                )}
                                {attrValueDisplay(a.key, val, locale)}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-ink-500 text-[12px]">
                          {v.pack ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

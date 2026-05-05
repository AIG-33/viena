"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart, type SelectedOptions } from "@/context/CartContext";
import {
  additiveLabel,
  closureLabel,
  colorLabel,
  colorSwatch,
  labelLabel,
  materialLabel,
} from "@/lib/vacuum-tokens";
import type { Product, ProductVariant, VariantAttribute } from "@/types/product";
import type { Locale } from "@/i18n/routing";

interface VacuumProductCardProps {
  family: Product;
  index?: number;
}

function variantLabel(
  attr: VariantAttribute,
  variant: ProductVariant,
  locale: Locale
): string {
  const raw = variant[attr.key];
  if (typeof raw !== "string" || !raw) return "—";
  if (attr.key === "closure") return closureLabel(raw, locale);
  if (attr.key === "capColor" || attr.key === "ringColor") return colorLabel(raw, locale);
  if (attr.key === "material") return materialLabel(raw, locale);
  if (attr.key === "label") return labelLabel(raw, locale);
  return raw;
}

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

function uniqueValues(
  variants: ProductVariant[],
  key: string
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of variants) {
    const val = v[key];
    if (typeof val === "string" && !seen.has(val)) {
      seen.add(val);
      out.push(val);
    }
  }
  return out;
}

function findVariant(
  variants: ProductVariant[],
  selection: Record<string, string>
): ProductVariant | undefined {
  return variants.find((v) =>
    Object.entries(selection).every(([k, val]) => v[k] === val)
  );
}

export function VacuumProductCard({ family, index = 0 }: VacuumProductCardProps) {
  const locale = useLocale() as Locale;
  const tCard = useTranslations("productCard");
  const tCommon = useTranslations("common");
  const tVac = useTranslations("vacuumCatalog");
  const { addItem, findLine, updateQuantity, removeItem, isHydrated } = useCart();

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

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const setAttr = (key: string, value: string) => {
    setSelection((prev) => ({ ...prev, [key]: value }));
  };

  const href = `/catalog/${family.categoryId}/${family.slug}`;
  const additive = additiveLabel(family.additive, locale);

  return (
    <article className="card card-hover h-full flex flex-col group relative overflow-hidden">
      <Link
        href={href}
        className="aspect-[4/3] bg-paper-50 relative overflow-hidden block"
      >
        {family.images.length > 0 ? (
          <Image
            src={family.images[0]}
            alt={family.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-contain group-hover:scale-[1.04] transition-transform duration-500 p-3"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-ink-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}

        {(family.capColor || family.ringColor) && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/95 backdrop-blur-sm shadow-sm">
            {family.capColor && (
              <span
                className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10"
                style={{ background: colorSwatch(family.capColor) }}
                aria-label={colorLabel(family.capColor, locale)}
                title={colorLabel(family.capColor, locale)}
              />
            )}
            {family.ringColor && (
              <span
                className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10"
                style={{
                  background: `radial-gradient(circle, transparent 38%, ${colorSwatch(family.ringColor)} 40%, ${colorSwatch(family.ringColor)} 70%, transparent 72%)`,
                }}
                aria-label={colorLabel(family.ringColor, locale)}
                title={colorLabel(family.ringColor, locale)}
              />
            )}
          </div>
        )}

        <span
          className={`absolute top-3 right-3 inline-flex items-center text-[10px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded-full ${
            family.inStock ? "bg-green-500 text-white" : "bg-ink-700 text-white"
          }`}
        >
          {family.inStock ? tCard("inStock") : tCard("byOrder")}
        </span>
        {index % 5 === 0 && (
          <span className="absolute bottom-3 left-3 text-[10px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded-full bg-ink-900/90 text-white">
            {tVac("featured")}
          </span>
        )}
      </Link>

      <div className="flex-1 flex flex-col gap-2.5 p-4">
        {additive && (
          <span className="text-[10px] uppercase tracking-[0.12em] font-bold text-green-700">
            {additive}
          </span>
        )}
        <Link href={href}>
          <h3 className="text-ink-900 font-semibold text-[14px] leading-snug line-clamp-2 hover:text-green-700 transition-colors">
            {family.name}
          </h3>
        </Link>

        {attributes.length > 0 && variants.length > 1 && (
          <div className="flex flex-col gap-2 mt-1">
            {attributes.slice(0, 3).map((attr) => {
              const values = uniqueValues(variants, attr.key);
              if (values.length <= 1) return null;
              const label = locale === "en" ? attr.label_en : locale === "zh" ? attr.label_zh : attr.label_ru;
              const isColor = attr.key === "capColor" || attr.key === "ringColor";
              return (
                <div key={attr.key} className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-ink-500 font-semibold">
                    {label}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {values.slice(0, 8).map((val) => {
                      const active = selection[attr.key] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAttr(attr.key, val);
                          }}
                          title={attrValueDisplay(attr.key, val, locale)}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border transition-colors ${
                            active
                              ? "bg-ink-900 text-white border-ink-900"
                              : "bg-white text-ink-700 border-paper-200 hover:border-ink-700"
                          }`}
                        >
                          {isColor && (
                            <span
                              className="w-2.5 h-2.5 rounded-full ring-1 ring-black/15"
                              style={{
                                background:
                                  attr.key === "ringColor"
                                    ? `radial-gradient(circle, transparent 38%, ${colorSwatch(val)} 40%, ${colorSwatch(val)} 70%, transparent 72%)`
                                    : colorSwatch(val),
                              }}
                            />
                          )}
                          {attrValueDisplay(attr.key, val, locale)}
                        </button>
                      );
                    })}
                    {values.length > 8 && (
                      <span className="text-[10px] text-ink-500 px-1.5 py-1">
                        +{values.length - 8}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {attributes.length > 3 && (
              <Link
                href={href}
                className="text-[10px] uppercase tracking-[0.1em] font-bold text-green-700 hover:underline mt-1"
              >
                {tVac("moreAttributes")}: {attributes.length - 3}
              </Link>
            )}
          </div>
        )}

        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[9px] uppercase tracking-[0.16em] text-ink-500 font-bold">
              {tVac("catalogNumber")}
            </span>
            <span className="font-mono text-[15px] font-bold text-ink-900 tabular-nums truncate">
              {sku || "—"}
            </span>
            {variant && (
              <span className="text-[10px] text-ink-500">
                {[
                  variant.volume ? `${variant.volume} ${tVac("ml")}` : null,
                  variant.size,
                  variant.closure ? closureLabel(variant.closure, locale) : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
          </div>

          {inCart && cartItem ? (
            <div className="flex items-center gap-1 text-[12px] font-mono shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateQuantity(cartItem.lineId, cartItem.quantity - 1);
                }}
                className="w-7 h-7 rounded-full border border-paper-200 hover:border-ink-900 grid place-items-center"
                aria-label={tCard("decrease")}
              >
                −
              </button>
              <span className="min-w-[20px] text-center font-semibold tabular-nums text-ink-900">
                {cartItem.quantity}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  updateQuantity(cartItem.lineId, cartItem.quantity + 1);
                }}
                className="w-7 h-7 rounded-full bg-green-500 text-white grid place-items-center hover:bg-green-600"
                aria-label={tCard("increase")}
              >
                +
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeItem(cartItem.lineId);
                }}
                className="w-7 h-7 rounded-full border border-paper-200 hover:border-red-500 hover:text-red-500 grid place-items-center"
                aria-label={tCommon("removeFromQuote")}
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              aria-label={tCommon("addToQuote")}
              className="w-9 h-9 rounded-full bg-green-500 text-white grid place-items-center hover:bg-green-600 transition-colors shrink-0"
            >
              <svg viewBox="0 0 24 24" className="icon w-4 h-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Variant labels for screen-readers when only one variant exists */}
      {variants.length === 1 && variant && (
        <span className="sr-only">
          {Object.entries(variant)
            .filter(([k]) => k !== "catalogNumber")
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ")}
        </span>
      )}
    </article>
  );
}

// Helper exports for tests / shared use.
export { findVariant, uniqueValues, variantLabel };

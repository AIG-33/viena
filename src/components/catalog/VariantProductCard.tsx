"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart, type SelectedOptions } from "@/context/CartContext";
import { colorSwatchRu, COLOR_ATTR_KEYS } from "@/lib/consumable-tokens";
import { findVariant, reconcileSelection, uniqueValues } from "@/lib/variant-select";
import type { Product, ProductVariant, VariantAttribute } from "@/types/product";
import type { Locale } from "@/i18n/routing";

interface VariantProductCardProps {
  family: Product;
  index?: number;
}

function attrLabel(attr: VariantAttribute, locale: Locale): string {
  return locale === "en"
    ? attr.label_en
    : locale === "zh"
      ? attr.label_zh
      : attr.label_ru;
}

function variantString(v: ProductVariant | undefined, key: string): string | undefined {
  if (!v) return undefined;
  const raw = v[key];
  return typeof raw === "string" ? raw : undefined;
}

export function VariantProductCard({ family, index = 0 }: VariantProductCardProps) {
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

  const attributeKeys = useMemo(() => attributes.map((a) => a.key), [attributes]);

  const cardImage = variantString(variant, "image") ?? family.images[0];

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
      image: cardImage,
      selectedOptions: cartOptions,
    });
  };

  const setAttr = (key: string, value: string) => {
    setSelection((prev) =>
      reconcileSelection(variants, attributeKeys, prev, key, value)
    );
  };

  const href = `/catalog/${family.categoryId}/${family.slug}`;

  return (
    <article className="card card-hover h-full flex flex-col group relative overflow-hidden">
      <Link
        href={href}
        className="aspect-[4/3] bg-paper-50 relative overflow-hidden block"
      >
        {cardImage ? (
          <Image
            src={cardImage}
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

        <span
          className={`absolute top-3 right-3 inline-flex items-center text-[10px] font-bold tracking-[0.08em] uppercase px-2 py-0.5 rounded-full ${
            family.inStock ? "bg-green-500 text-white" : "bg-ink-700 text-white"
          }`}
        >
          {family.inStock ? tCard("inStock") : tCard("byOrder")}
        </span>
      </Link>

      <div className="flex-1 flex flex-col gap-2.5 p-4">
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
              const isColor = COLOR_ATTR_KEYS.has(attr.key);
              return (
                <div key={attr.key} className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-ink-500 font-semibold">
                    {attrLabel(attr, locale)}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {values.slice(0, 8).map((val) => {
                      const active = selection[attr.key] === val;
                      const swatch = isColor ? colorSwatchRu(val) : null;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setAttr(attr.key, val);
                          }}
                          title={val}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border transition-colors ${
                            active
                              ? "bg-ink-900 text-white border-ink-900"
                              : "bg-white text-ink-700 border-paper-200 hover:border-ink-700"
                          }`}
                        >
                          {swatch && (
                            <span
                              className="w-2.5 h-2.5 rounded-full ring-1 ring-black/15"
                              style={{ background: swatch }}
                            />
                          )}
                          {val}
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
    </article>
  );
}

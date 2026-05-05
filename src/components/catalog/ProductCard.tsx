"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/types/product";
import { useCart, type SelectedOptions } from "@/context/CartContext";
import { OptionSelect } from "@/components/ui/OptionSelect";
import manufacturersData from "../../../data/manufacturers.json";

const MANUFACTURER_NAMES: Record<string, string> = Object.fromEntries(
  manufacturersData.map((m) => [m.slug, m.name])
);

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const tCommon = useTranslations("common");
  const tCard = useTranslations("productCard");
  const sku = product.catalogNumber || `P-${product.id.slice(-6).toUpperCase()}`;
  const manufacturerName = product.manufacturer
    ? MANUFACTURER_NAMES[product.manufacturer] ?? product.manufacturer
    : null;
  const { addItem, findLine, updateQuantity, removeItem, isHydrated } = useCart();

  const hasOptions = !!product.options?.length;
  const href = `/catalog/${product.categoryId}/${product.slug}`;

  const defaultSelected = useMemo<SelectedOptions>(() => {
    const out: SelectedOptions = {};
    (product.options ?? []).forEach((o) => {
      if (o.variants.length > 0) out[o.title] = o.variants[0];
    });
    return out;
  }, [product.options]);

  const [selected, setSelected] = useState<SelectedOptions>(defaultSelected);
  const cartItem = findLine(product.id, selected);
  const inCart = isHydrated && !!cartItem;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      slug: product.slug,
      categoryId: product.categoryId,
      name: product.name,
      catalogNumber: product.catalogNumber,
      image: product.images[0],
      selectedOptions: hasOptions ? selected : undefined,
    });
  };

  const setOption = (title: string, value: string) => {
    setSelected((prev) => ({ ...prev, [title]: value }));
  };

  return (
    <article className="card card-hover h-full flex flex-col group relative hover:z-30 focus-within:z-30">
      <Link href={href} className="aspect-[4/3] bg-paper-100 relative overflow-hidden block rounded-t-2xl">
        {product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-contain group-hover:scale-[1.04] transition-transform duration-500 p-2"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-ink-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full ${
            product.inStock ? "bg-green-500 text-white" : "bg-ink-700 text-white"
          }`}
        >
          {product.inStock ? tCard("inStock") : tCard("byOrder")}
        </span>
        {index % 5 === 0 && (
          <span className="absolute top-3 right-3 text-[10px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full bg-white/95 text-ink-700">
            new
          </span>
        )}
      </Link>

      <div className="flex-1 flex flex-col gap-1.5 p-4">
        {manufacturerName && (
          <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-ink-500">
            {manufacturerName}
          </span>
        )}
        <Link href={href}>
          <h3 className="text-ink-900 font-semibold text-[14px] leading-snug line-clamp-2 hover:text-green-700 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="font-mono text-[11px] text-ink-500 mt-0.5">SKU {sku}</div>

        {hasOptions && (
          <div className="flex flex-col gap-1.5 mt-1">
            {product.options!.map((opt) => (
              <div key={opt.title} className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.1em] text-ink-500 font-semibold">
                  {opt.title}
                </span>
                <OptionSelect
                  value={selected[opt.title] ?? opt.variants[0]}
                  options={opt.variants}
                  onChange={(v) => setOption(opt.title, v)}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <span className="text-[12px] font-bold text-green-700 truncate">
            {product.tags[0] ?? tCard("askPrice")}
          </span>
          {inCart && cartItem ? (
            <div className="flex items-center gap-1.5 text-[12px] font-mono">
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

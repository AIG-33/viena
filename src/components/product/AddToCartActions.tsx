"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCart, type SelectedOptions } from "@/context/CartContext";
import type { Product } from "@/types/product";

interface AddToCartActionsProps {
  product: Product;
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 4h2l2 12h12l2-9H6" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

export function AddToCartActions({ product }: AddToCartActionsProps) {
  const router = useRouter();
  const t = useTranslations("productPage");
  const tCard = useTranslations("productCard");
  const tCommon = useTranslations("common");
  const { addItem, updateQuantity, removeItem, findLine, isHydrated } = useCart();

  const hasOptions = !!product.options?.length;

  const defaultSelected = useMemo<SelectedOptions>(() => {
    const out: SelectedOptions = {};
    (product.options ?? []).forEach((o) => {
      if (o.variants.length > 0) out[o.title] = o.variants[0];
    });
    return out;
  }, [product.options]);

  const [selected, setSelected] = useState<SelectedOptions>(defaultSelected);
  const cartItem = findLine(product.id, hasOptions ? selected : undefined);
  const inCart = isHydrated && !!cartItem;

  const handleAdd = () => {
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

  const goToCart = () => router.push("/contacts#cart");

  return (
    <div className="flex flex-col gap-4">
      {hasOptions && (
        <div className="flex flex-col gap-3 pb-2">
          {product.options!.map((opt) => (
            <div key={opt.title} className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-[0.14em] font-bold text-ink-500">
                {opt.title}
              </span>
              <div className="flex flex-wrap gap-2">
                {opt.variants.map((v) => {
                  const active = selected[opt.title] === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSelected((prev) => ({ ...prev, [opt.title]: v }))}
                      className={`text-[13px] font-semibold px-3 py-1.5 rounded-full transition-colors ${
                        active
                          ? "bg-ink-900 text-white"
                          : "bg-paper-100 text-ink-700 hover:bg-paper-200"
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {inCart && cartItem ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-paper-200 bg-paper-50">
          <CartIcon className="w-5 h-5 text-green-700" />
          <span className="text-[13px] text-ink-700 flex-1">{t("inQuote")}</span>
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
              {cartItem.quantity} {t("quantityShort")}
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
        <button type="button" onClick={handleAdd} className="btn btn-green btn-lg">
          <CartIcon className="w-4 h-4" />
          {t("addToCart")}
        </button>
      )}

      <button type="button" onClick={goToCart} className="btn btn-dark">
        {t("requestPrice")} <span aria-hidden>→</span>
      </button>
    </div>
  );
}

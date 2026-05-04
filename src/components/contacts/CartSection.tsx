"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/context/CartContext";

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

export function CartSection() {
  const t = useTranslations("contacts.cart");
  const locale = useLocale();
  const { items, count, isHydrated, removeItem, updateQuantity, clear } = useCart();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#cart") return;
    const el = document.getElementById("cart");
    if (!el) return;
    const id = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    return () => window.clearTimeout(id);
  }, [isHydrated]);

  const hasItems = isHydrated && items.length > 0;

  function pluralizeItems(n: number): string {
    if (locale === "ru") {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return t("itemSingular");
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return t("itemFew");
      return t("itemPlural");
    }
    if (locale === "zh") return t("itemPlural");
    return n === 1 ? t("itemSingular") : t("itemPlural");
  }

  return (
    <section className="card overflow-hidden">
      <div className="px-6 md:px-7 py-5 md:py-6 border-b border-paper-200 bg-paper-50 flex items-center gap-4 md:gap-5">
        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-green-100 text-green-700 grid place-items-center shrink-0">
          <CartIcon className="w-6 h-6" />
          {hasItems && (
            <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-green-500 text-white text-[11px] font-mono font-bold">
              {count}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="eyebrow">
            <span className="dot" />
            {hasItems ? `${count} ${pluralizeItems(count)}` : t("headingLabel")}
          </span>
          <h2 className="display-heading text-ink-900 text-[22px] md:text-[26px] mt-1">
            {t("title")} <span className="text-green-600">{t("titleAccent")}</span>
          </h2>
        </div>
        {hasItems && (
          <button
            type="button"
            onClick={clear}
            className="hidden sm:inline-flex text-[12px] font-semibold text-ink-600 hover:text-red-500 transition-colors px-3 py-1.5 rounded-full border border-paper-200 hover:border-red-500"
          >
            {t("clear")}
          </button>
        )}
      </div>

      <div className="p-6 md:p-7">
        <p className="text-ink-500 text-[12px] leading-relaxed mb-5 max-w-3xl">
          {t("intro1")}{" "}
          <span className="text-green-700 font-semibold">{t("introHighlight1")}</span>
          {t("intro2")}{" "}
          <span className="text-green-700 font-semibold">{t("introHighlight2")}</span>
          {t("intro3")}
        </p>

        {!isHydrated ? (
          <div className="py-10 text-center text-[12px] uppercase tracking-[0.12em] text-ink-400">
            {t("loadingLabel")}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-paper-300 bg-paper-50 px-6 py-12 flex flex-col items-center gap-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white border border-paper-200 grid place-items-center text-green-600">
              <CartIcon className="w-7 h-7" />
            </div>
            <div>
              <p className="display-heading text-ink-900 text-2xl mb-1.5">{t("emptyTitle")}</p>
              <p className="text-ink-500 text-[13px] max-w-xs mx-auto leading-relaxed">
                {t("emptyText")}
              </p>
            </div>
            <Link href="/catalog" className="btn btn-green">
              {t("emptyCta")}
            </Link>
          </div>
        ) : (
          <ul className="rounded-2xl border border-paper-200 divide-y divide-paper-200 overflow-hidden">
            {items.map((item) => (
              <li
                key={item.lineId}
                className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white hover:bg-paper-50 transition-colors"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl border border-paper-200 bg-white shrink-0 grid place-items-center overflow-hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain p-1"
                      unoptimized
                    />
                  ) : (
                    <span className="text-[9px] uppercase text-ink-300">{t("noImage")}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/catalog/${item.categoryId}/${item.slug}`}
                    className="text-ink-900 font-semibold text-[14px] leading-snug line-clamp-2 hover:text-green-700 transition-colors"
                  >
                    {item.name}
                  </Link>
                  {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                    <p className="text-[11px] text-ink-500 mt-0.5">
                      {Object.entries(item.selectedOptions)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </p>
                  )}
                  {item.catalogNumber && (
                    <p className="font-mono text-[11px] text-ink-500 mt-0.5">
                      SKU {item.catalogNumber}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                    aria-label={t("qtyDecrease")}
                    className="w-8 h-8 rounded-full border border-paper-200 hover:border-ink-900 grid place-items-center text-ink-700"
                  >
                    −
                  </button>
                  <span className="min-w-[24px] text-center font-mono text-[13px] font-semibold tabular-nums text-ink-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                    aria-label={t("qtyIncrease")}
                    className="w-8 h-8 rounded-full bg-green-500 text-white grid place-items-center hover:bg-green-600"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.lineId)}
                  aria-label={t("remove")}
                  className="shrink-0 w-8 h-8 rounded-full border border-paper-200 hover:border-red-500 hover:text-red-500 grid place-items-center text-ink-600"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {hasItems && (
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[12px] text-ink-500">
            <span className="text-green-700">{t("footerNote")}</span>
            <button
              type="button"
              onClick={clear}
              className="sm:hidden text-[12px] font-semibold text-ink-600 hover:text-red-500"
            >
              {t("clearMobile")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

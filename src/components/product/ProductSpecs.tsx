"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ProductSpec } from "@/types/product";
import type { Locale } from "@/i18n/routing";
import { localiseSpecKey, localiseSpecValue } from "@/lib/i18n-specs";

interface ProductSpecsProps {
  specs: ProductSpec[];
}

export function ProductSpecs({ specs }: ProductSpecsProps) {
  const t = useTranslations("productPage");
  const locale = useLocale() as Locale;
  if (specs.length === 0) return null;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-paper-200">
        <h3 className="text-[16px] font-bold text-ink-900 font-display">{t("specifications")}</h3>
        <span className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-500">
          {specs.length}
        </span>
      </div>
      <div>
        {specs.map((spec, i) => (
          <div
            key={spec.key}
            className={`grid grid-cols-[1fr_2fr] px-6 py-3 gap-4 ${
              i !== 0 ? "border-t border-paper-200" : ""
            }`}
          >
            <span className="text-[14px] text-ink-500">{localiseSpecKey(spec.key, locale)}</span>
            <span className="text-[14px] font-semibold text-ink-900">
              {localiseSpecValue(spec.value, locale)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

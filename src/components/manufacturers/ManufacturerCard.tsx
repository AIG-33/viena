"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Manufacturer } from "@/types/manufacturer";
import { getManufacturerCatalogLink } from "@/lib/utils";
import { ManufacturerWordmark } from "./ManufacturerWordmark";

export function ManufacturerCard({ manufacturer }: { manufacturer: Manufacturer }) {
  const t = useTranslations("manufacturersPage.card");
  const href = `/manufacturers/${manufacturer.slug}`;
  const count = manufacturer.productCount ?? 0;
  const catalogLink = getManufacturerCatalogLink(manufacturer.slug);

  return (
    <article className="card card-hover h-full flex flex-col group overflow-hidden">
      <Link href={href} className="block">
        <ManufacturerWordmark name={manufacturer.name} logo={manufacturer.logo} />
      </Link>

      <div className="flex flex-col gap-3 p-6 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link href={href}>
            <h3 className="font-display font-bold text-[18px] leading-snug text-ink-900 group-hover:text-green-700 transition-colors">
              {manufacturer.name}
            </h3>
          </Link>
          <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-ink-500 mt-1 shrink-0">
            {manufacturer.country}
          </span>
        </div>

        {manufacturer.tagline && (
          <p className="font-mono text-[11px] text-ink-500 leading-snug">
            {manufacturer.tagline}
          </p>
        )}

        <p className="text-[13px] text-ink-600 leading-relaxed line-clamp-3">
          {manufacturer.shortDescription}
        </p>

        <div className="mt-auto pt-3 border-t border-paper-200 flex items-center justify-between text-[12px]">
          <span className="text-ink-500 tabular-nums">{t("products", { count })}</span>
          {catalogLink.isExternal ? (
            <a
              href={catalogLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-green-700 hover:text-green-600 transition-colors"
            >
              {t("viewProducts")}
            </a>
          ) : (
            <Link
              href={catalogLink.href}
              className="font-semibold text-green-700 hover:text-green-600 transition-colors"
            >
              {t("viewProducts")}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

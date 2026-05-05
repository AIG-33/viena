import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import {
  getManufacturerBySlug,
  getProductsByManufacturer,
} from "@/lib/data";
import { routing, type Locale } from "@/i18n/routing";
import {
  OgFrame,
  OG_HEIGHT,
  OG_WIDTH,
  OG_CONTENT_TYPE,
  ogAbsoluteUrl,
} from "@/lib/og";

export const alt = "VIENA MEDICAL — manufacturer";
export const contentType = OG_CONTENT_TYPE;
export const size = { width: OG_WIDTH, height: OG_HEIGHT };

const EYEBROW: Record<Locale, string> = {
  ru: "Производитель",
  en: "Manufacturer",
  zh: "制造商",
};

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const safeLocale: Locale = hasLocale(routing.locales, locale)
    ? (locale as Locale)
    : "ru";

  const tMeta = await getTranslations({
    locale: safeLocale,
    namespace: "meta",
  });

  const m = getManufacturerBySlug(slug, safeLocale);
  if (!m) {
    return new ImageResponse(
      OgFrame({
        eyebrow: EYEBROW[safeLocale],
        title: tMeta("siteTitle"),
        brand: tMeta("brand"),
      }),
      { ...size }
    );
  }

  const products = getProductsByManufacturer(slug, safeLocale);
  const skuLabel: Record<Locale, string> = {
    ru: `${m.country} · ${products.length} позиций в каталоге`,
    en: `${m.country} · ${products.length} SKU in catalogue`,
    zh: `${m.country} · 目录内 ${products.length} 个 SKU`,
  };

  return new ImageResponse(
    OgFrame({
      eyebrow: EYEBROW[safeLocale],
      title: m.name,
      subtitle: skuLabel[safeLocale],
      accentImageUrl: ogAbsoluteUrl(m.logo),
      brand: tMeta("brand"),
    }),
    { ...size }
  );
}

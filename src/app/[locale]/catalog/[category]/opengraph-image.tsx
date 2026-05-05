import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { getCategoryById, getProductsByCategoryId } from "@/lib/data";
import { routing, type Locale } from "@/i18n/routing";
import {
  OgFrame,
  OG_HEIGHT,
  OG_WIDTH,
  OG_CONTENT_TYPE,
  ogAbsoluteUrl,
} from "@/lib/og";

export const alt = "VIENA MEDICAL category";
export const contentType = OG_CONTENT_TYPE;
export const size = { width: OG_WIDTH, height: OG_HEIGHT };

const EYEBROW: Record<Locale, string> = {
  ru: "Каталог",
  en: "Catalog",
  zh: "产品目录",
};

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  const safeLocale: Locale = hasLocale(routing.locales, locale)
    ? (locale as Locale)
    : "ru";

  const cat = getCategoryById(category, safeLocale);
  const tMeta = await getTranslations({
    locale: safeLocale,
    namespace: "meta",
  });

  if (!cat) {
    return new ImageResponse(
      OgFrame({
        eyebrow: EYEBROW[safeLocale],
        title: tMeta("siteTitle"),
        brand: tMeta("brand"),
      }),
      { ...size }
    );
  }

  const products = getProductsByCategoryId(category, safeLocale);
  const skuLabel: Record<Locale, string> = {
    ru: `${products.length} позиций · прямые поставки`,
    en: `${products.length} SKU · direct supply`,
    zh: `${products.length} 个 SKU · 直供`,
  };

  return new ImageResponse(
    OgFrame({
      eyebrow: EYEBROW[safeLocale],
      title: cat.name,
      subtitle: skuLabel[safeLocale],
      accentImageUrl: ogAbsoluteUrl(cat.image),
      brand: tMeta("brand"),
    }),
    { ...size }
  );
}

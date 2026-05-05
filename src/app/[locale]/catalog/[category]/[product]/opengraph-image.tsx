import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import {
  getCategoryById,
  getManufacturerBySlug,
  getProductBySlug,
} from "@/lib/data";
import { routing, type Locale } from "@/i18n/routing";
import {
  OgFrame,
  OG_HEIGHT,
  OG_WIDTH,
  OG_CONTENT_TYPE,
  ogAbsoluteUrl,
} from "@/lib/og";

export const alt = "VIENA MEDICAL product";
export const contentType = OG_CONTENT_TYPE;
export const size = { width: OG_WIDTH, height: OG_HEIGHT };

const EYEBROW: Record<Locale, string> = {
  ru: "Каталог · товар",
  en: "Catalog · product",
  zh: "产品",
};

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; category: string; product: string }>;
}) {
  const { locale, category, product: productSlug } = await params;
  const safeLocale: Locale = hasLocale(routing.locales, locale)
    ? (locale as Locale)
    : "ru";

  const tMeta = await getTranslations({
    locale: safeLocale,
    namespace: "meta",
  });

  const product = getProductBySlug(category, productSlug, safeLocale);
  if (!product) {
    return new ImageResponse(
      OgFrame({
        eyebrow: EYEBROW[safeLocale],
        title: tMeta("siteTitle"),
        brand: tMeta("brand"),
      }),
      { ...size }
    );
  }

  const cat = getCategoryById(category, safeLocale);
  const manufacturer = product.manufacturer
    ? getManufacturerBySlug(product.manufacturer, safeLocale)
    : undefined;

  const subtitleParts = [
    cat?.name,
    manufacturer?.name,
    product.catalogNumber ? `SKU ${product.catalogNumber}` : null,
  ].filter(Boolean) as string[];

  return new ImageResponse(
    OgFrame({
      eyebrow: EYEBROW[safeLocale],
      title: product.name,
      subtitle: subtitleParts.join(" · "),
      accentImageUrl: ogAbsoluteUrl(product.images[0]),
      brand: tMeta("brand"),
    }),
    { ...size }
  );
}

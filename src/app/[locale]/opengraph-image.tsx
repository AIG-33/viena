import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { OgFrame, OG_HEIGHT, OG_WIDTH, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "VIENA MEDICAL — laboratory equipment & reagents";
export const contentType = OG_CONTENT_TYPE;
export const size = { width: OG_WIDTH, height: OG_HEIGHT };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const EYEBROW: Record<Locale, string> = {
  ru: "Лабораторная диагностика",
  en: "Laboratory diagnostics",
  zh: "实验室诊断",
};

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = hasLocale(routing.locales, locale)
    ? (locale as Locale)
    : "ru";

  const t = await getTranslations({ locale: safeLocale, namespace: "meta" });

  return new ImageResponse(
    OgFrame({
      eyebrow: EYEBROW[safeLocale],
      title: t("siteTitle"),
      subtitle: t("siteDescription"),
      brand: t("brand"),
    }),
    { ...size }
  );
}

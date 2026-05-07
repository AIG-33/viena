import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDocPage } from "@/components/legal/LegalDocPage";
import { CookieRevokePanel } from "@/components/legal/CookieRevokePanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCookiesPolicy } from "@/content/legal/cookies";
import { buildBreadcrumbJsonLd, localePath } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = getCookiesPolicy(locale);
  return {
    title: doc.metaTitle,
    description: doc.metaDescription,
    alternates: { canonical: localePath(locale, "/cookies") },
    robots: { index: true, follow: true },
  };
}

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");
  const tLegal = await getTranslations("legal");

  const doc = getCookiesPolicy(locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: tNav("home"), url: localePath(locale, "/") },
    { name: tLegal("cookiesBreadcrumb"), url: localePath(locale, "/cookies") },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <LegalDocPage
        locale={locale}
        doc={doc}
        breadcrumbLabel={tLegal("cookiesBreadcrumb")}
        navHome={tNav("home")}
        contactsLabel={tNav("contacts")}
        appendix={<CookieRevokePanel />}
      />
    </>
  );
}

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDocPage } from "@/components/legal/LegalDocPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPrivacyPolicy } from "@/content/legal/privacy";
import { buildAlternates, buildBreadcrumbJsonLd, localePath } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = getPrivacyPolicy(locale);
  return {
    title: doc.metaTitle,
    description: doc.metaDescription,
    alternates: buildAlternates(locale, "/privacy"),
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations("nav");
  const tLegal = await getTranslations("legal");

  const doc = getPrivacyPolicy(locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: tNav("home"), url: localePath(locale, "/") },
    { name: tLegal("privacyBreadcrumb"), url: localePath(locale, "/privacy") },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <LegalDocPage
        locale={locale}
        doc={doc}
        breadcrumbLabel={tLegal("privacyBreadcrumb")}
        navHome={tNav("home")}
        contactsLabel={tNav("contacts")}
      />
    </>
  );
}
